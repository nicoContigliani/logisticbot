import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export interface LogisticsRecord {
  _id?: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  status: string;
  date: string;
  weight?: number;
  dimensions?: string;
  carrier?: string;
  cost?: number;
  notes?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, records } = body;

    if (!userId || !records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const logisticsCollection = await getCollection('logistics_records');

    // Add metadata to each record
    const recordsWithMetadata = records.map((record) => ({
      ...record,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await logisticsCollection.insertMany(recordsWithMetadata);

    return NextResponse.json({
      success: true,
      insertedCount: result.insertedCount,
      insertedIds: result.insertedIds,
    });
  } catch (error) {
    console.error('Create logistics records error:', error);
    return NextResponse.json(
      { error: 'Failed to create logistics records' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const trackingNumber = searchParams.get('trackingNumber');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const logisticsCollection = await getCollection('logistics_records');

    // Build query
    const query: Record<string, unknown> = { userId };
    if (status) query.status = status;
    if (trackingNumber) query.trackingNumber = { $regex: trackingNumber, $options: 'i' };

    // Get total count
    const total = await logisticsCollection.countDocuments(query);

    // Get paginated results
    const records = await logisticsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      records,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get logistics records error:', error);
    return NextResponse.json(
      { error: 'Failed to get logistics records' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, userId, ...updateData } = body;

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'Record ID and User ID are required' },
        { status: 400 }
      );
    }

    const logisticsCollection = await getCollection('logistics_records');

    const result = await logisticsCollection.updateOne(
      { _id: id, userId },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Update logistics record error:', error);
    return NextResponse.json(
      { error: 'Failed to update logistics record' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'Record ID and User ID are required' },
        { status: 400 }
      );
    }

    const logisticsCollection = await getCollection('logistics_records');

    const result = await logisticsCollection.deleteOne({ _id: id, userId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Delete logistics record error:', error);
    return NextResponse.json(
      { error: 'Failed to delete logistics record' },
      { status: 500 }
    );
  }
}
