import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { verifyUserIdOwnership } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyUserIdOwnership(null);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const date = searchParams.get('date');
    const phone = searchParams.get('phone');
    const skip = (page - 1) * limit;

    const collection = await getCollection('broadcasts');

    const filter: Record<string, unknown> = { userId: auth.userId };

    if (date) {
      // Use Date objects for proper comparison regardless of timezone
      const startOfDay = new Date(date + 'T00:00:00.000Z');
      const endOfDay = new Date(date + 'T23:59:59.999Z');
      filter.$or = [
        { createdAt: { $gte: startOfDay.toISOString(), $lte: endOfDay.toISOString() } },
        { createdAt: { $gte: startOfDay, $lte: endOfDay } },
      ];
    }

    if (phone) {
      const cleanPhone = phone.replace(/[\s\-()]/g, '');
      filter['clients.phone'] = { $regex: cleanPhone, $options: 'i' };
    }

    const [records, totalCount] = await Promise.all([
      collection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
    ]);

    const formatted = records.map((doc) => ({
      id: doc._id.toString(),
      userId: doc.userId,
      companyName: doc.companyName,
      message: doc.message,
      shift: doc.shift,
      deliveryPerson: doc.deliveryPerson,
      clients: doc.clients,
      status: doc.status,
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
      sentAt: doc.sentAt instanceof Date ? doc.sentAt.toISOString() : doc.sentAt,
    }));

    return NextResponse.json({
      success: true,
      records: formatted,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Error fetching broadcast history:', error);
    return NextResponse.json({ error: 'Error loading broadcast history.' }, { status: 500 });
  }
}
