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
    const skip = (page - 1) * limit;

    const collection = await getCollection('broadcasts');

    const [records, totalCount] = await Promise.all([
      collection
        .find({ userId: auth.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments({ userId: auth.userId }),
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
