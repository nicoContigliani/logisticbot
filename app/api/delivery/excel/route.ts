import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { verifyUserIdOwnership } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, fileName, sheets } = body;

    const auth = await verifyUserIdOwnership(userId);
    if (auth instanceof NextResponse) return auth;

    if (!fileName || !sheets || !Array.isArray(sheets)) {
      return NextResponse.json({ error: 'fileName and sheets are required' }, { status: 400 });
    }

    if (sheets.length === 0) {
      return NextResponse.json({ error: 'Excel has no sheets' }, { status: 400 });
    }

    const collection = await getCollection('delivery_excel_uploads');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await collection.findOne({
      userId: auth.userId,
      fileName,
      uploadedAt: { $gte: today },
    });

    let mergedCount = 0;
    let totalCount = 0;

    if (existing) {
      const mergedSheets = sheets.map((incomingSheet: { name: string; data: Record<string, unknown>[] }) => {
        const existingSheet = existing.sheets.find((s: { name: string }) => s.name === incomingSheet.name);
        if (!existingSheet) return incomingSheet;

        const seen = new Set<string>();
        const merged: Record<string, unknown>[] = [];

        for (const row of existingSheet.data) {
          const phone = findPhoneInRow(row);
          const key = phone ? normalizePhone(phone) : JSON.stringify(row);
          if (!seen.has(key)) {
            seen.add(key);
            merged.push(row);
          }
        }

        let newRows = 0;
        for (const row of incomingSheet.data) {
          const phone = findPhoneInRow(row);
          const key = phone ? normalizePhone(phone) : JSON.stringify(row);
          if (!seen.has(key)) {
            seen.add(key);
            merged.push(row);
            newRows++;
          }
        }

        mergedCount += newRows;
        return { ...incomingSheet, data: merged };
      });

      totalCount = mergedSheets.reduce((sum: number, s: { data: unknown[] }) => sum + s.data.length, 0);

      await collection.updateOne(
        { _id: existing._id },
        {
          $set: { sheets: mergedSheets, rowCount: totalCount, updatedAt: new Date() },
          $inc: { mergeCount: 1 },
        }
      );

      return NextResponse.json({
        success: true,
        action: 'merged',
        id: existing._id.toString(),
        newRows: mergedCount,
        totalRows: totalCount,
        message: `Merged ${mergedCount} new rows. Total: ${totalCount} rows`,
      });
    }

    totalCount = sheets.reduce((sum: number, s: { data: unknown[] }) => sum + s.data.length, 0);

    const record = {
      userId: auth.userId,
      fileName,
      sheets,
      rowCount: totalCount,
      uploadedAt: new Date(),
      updatedAt: new Date(),
      mergeCount: 0,
    };

    const result = await collection.insertOne(record);

    return NextResponse.json({
      success: true,
      action: 'created',
      id: result.insertedId.toString(),
      totalRows: totalCount,
      message: `${fileName}: ${totalCount} rows loaded`,
    });
  } catch (error) {
    console.error('Error saving delivery Excel:', error);
    return NextResponse.json({ error: 'Error saving file. Try again.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyUserIdOwnership(null);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const collection = await getCollection('delivery_excel_uploads');
    const mode = searchParams.get('mode');

    if (mode === 'dates') {
      const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
      const limit = Math.min(30, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
      const skip = (page - 1) * limit;

      const pipeline = [
        { $match: { userId: auth.userId } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$uploadedAt' } },
            uploads: {
              $push: {
                id: { $toString: '$_id' },
                fileName: '$fileName',
                rowCount: '$rowCount',
                uploadedAt: '$uploadedAt',
                updatedAt: '$updatedAt',
                mergeCount: '$mergeCount',
              },
            },
            totalUploads: { $sum: 1 },
            totalRows: { $sum: '$rowCount' },
            lastUpload: { $max: '$uploadedAt' },
          },
        },
        { $sort: { _id: -1 } },
        {
          $facet: {
            dates: [{ $skip: skip }, { $limit: limit }],
            totalCount: [{ $count: 'count' }],
          },
        },
      ];

      const aggResult = await collection.aggregate(pipeline).toArray();
      const facet = aggResult[0] || { dates: [], totalCount: [] };
      const totalDates = facet.totalCount[0]?.count || 0;
      const totalPages = Math.ceil(totalDates / limit) || 1;

      const dates = facet.dates.map((d: {
        _id: string;
        uploads: { id: string; fileName: string; rowCount: number; uploadedAt: Date; updatedAt: Date; mergeCount: number }[];
        totalUploads: number;
        totalRows: number;
        lastUpload: Date;
      }) => ({
        date: d._id,
        totalUploads: d.totalUploads,
        totalRows: d.totalRows,
        lastUpload: d.lastUpload instanceof Date ? d.lastUpload.toISOString() : d.lastUpload,
        uploads: d.uploads.map(u => ({
          id: u.id,
          fileName: u.fileName,
          rowCount: u.rowCount,
          uploadedAt: u.uploadedAt instanceof Date ? u.uploadedAt.toISOString() : u.uploadedAt,
          updatedAt: u.updatedAt instanceof Date ? u.updatedAt.toISOString() : u.updatedAt,
          mergeCount: u.mergeCount || 0,
          wasUpdated: u.updatedAt && u.uploadedAt &&
            new Date(u.updatedAt).getTime() > new Date(u.uploadedAt).getTime() + 1000,
        })),
      }));

      return NextResponse.json({
        success: true,
        dates,
        pagination: { page, limit, totalDates, totalPages },
      });
    }

    const uploads = await collection
      .find({ userId: auth.userId })
      .sort({ uploadedAt: -1 })
      .limit(2)
      .toArray();

    if (uploads.length === 0) {
      return NextResponse.json({ success: true, uploads: [] });
    }

    const formatted = uploads.map((doc) => ({
      id: doc._id.toString(),
      fileName: doc.fileName,
      sheets: doc.sheets,
      rowCount: doc.rowCount,
      uploadedAt: doc.uploadedAt instanceof Date ? doc.uploadedAt.toISOString() : doc.uploadedAt,
      updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
      mergeCount: doc.mergeCount || 0,
    }));

    return NextResponse.json({ success: true, uploads: formatted });
  } catch (error) {
    console.error('Error fetching delivery Excel:', error);
    return NextResponse.json({ error: 'Error loading saved files. Try again.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyUserIdOwnership(null);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const collection = await getCollection('delivery_excel_uploads');

    if (id) {
      const { ObjectId } = await import('mongodb');
      await collection.deleteOne({ _id: new ObjectId(id), userId: auth.userId });
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await collection.deleteMany({ userId: auth.userId, uploadedAt: { $gte: today } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting delivery Excel:', error);
    return NextResponse.json({ error: 'Error deleting. Try again.' }, { status: 500 });
  }
}

function findPhoneInRow(row: Record<string, unknown>): string | undefined {
  const phoneKeys = ['telefono', 'phone', 'tel', 'celular', 'mobile', 'whatsapp', 'numero'];
  for (const key of Object.keys(row)) {
    const lowerKey = key.toLowerCase();
    if (phoneKeys.some(pk => lowerKey.includes(pk))) {
      const val = String(row[key] || '').trim();
      if (val) return val;
    }
  }
  for (const value of Object.values(row)) {
    const strValue = String(value || '').trim();
    if (/^\+?[1-9]\d{1,14}$/.test(strValue.replace(/[\s\-()]/g, ''))) {
      return strValue;
    }
  }
  return undefined;
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, '');
}
