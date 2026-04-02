import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { verifyUserIdOwnership } from '@/lib/api-auth';

export async function GET() {
  try {
    const auth = await verifyUserIdOwnership(null);
    if (auth instanceof NextResponse) return auth;

    const deliveryCollection = await getCollection('delivery_excel_uploads');
    const broadcastsCollection = await getCollection('broadcasts');
    const logisticsCollection = await getCollection('logistics_records');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deliveriesByDayPipeline = [
      { $match: { userId: auth.userId, uploadedAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$uploadedAt' } },
          totalRows: { $sum: '$rowCount' },
          uploads: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 as 1 } },
    ];

    const deliveriesByDay = await deliveryCollection.aggregate(deliveriesByDayPipeline).toArray();

    const broadcastStatsPipeline = [
      { $match: { userId: auth.userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ];
    const broadcastStats = await broadcastsCollection.aggregate(broadcastStatsPipeline).toArray();

    const broadcastByShiftPipeline = [
      { $match: { userId: auth.userId } },
      { $group: { _id: '$shift', count: { $sum: 1 } } },
    ];
    const broadcastByShift = await broadcastsCollection.aggregate(broadcastByShiftPipeline).toArray();

    const broadcastsByDayPipeline = [
      { $match: { userId: auth.userId, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 },
          sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
          error: { $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 as 1 } },
    ];
    const broadcastsByDay = await broadcastsCollection.aggregate(broadcastsByDayPipeline).toArray();

    const deliveryPersonPipeline = [
      { $match: { userId: auth.userId, status: 'sent' } },
      {
        $group: {
          _id: '$deliveryPerson.name',
          totalBroadcasts: { $sum: 1 },
          totalClients: { $sum: { $size: '$clients' } },
        },
      },
      { $sort: { totalClients: -1 as -1 } },
      { $limit: 10 },
    ];
    const deliveryPersonStats = await broadcastsCollection.aggregate(deliveryPersonPipeline).toArray();

    const logisticsStatsPipeline = [
      { $match: { userId: auth.userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ];
    const logisticsStats = await logisticsCollection.aggregate(logisticsStatsPipeline).toArray();

    const totalDeliveries = await deliveryCollection.countDocuments({ userId: auth.userId });
    const totalBroadcasts = await broadcastsCollection.countDocuments({ userId: auth.userId });
    const totalLogistics = await logisticsCollection.countDocuments({ userId: auth.userId });

    const sentBroadcasts = broadcastStats.find(s => s._id === 'sent')?.count || 0;
    const errorBroadcasts = broadcastStats.find(s => s._id === 'error')?.count || 0;
    const successRate = totalBroadcasts > 0
      ? Math.round((sentBroadcasts / totalBroadcasts) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      summary: { totalDeliveries, totalBroadcasts, totalLogistics, sentBroadcasts, errorBroadcasts, successRate },
      deliveriesByDay: deliveriesByDay.map(d => ({ date: d._id, totalRows: d.totalRows, uploads: d.uploads })),
      broadcastStats: broadcastStats.map(s => ({ status: s._id, count: s.count })),
      broadcastByShift: broadcastByShift.map(s => ({ shift: s._id, count: s.count })),
      broadcastsByDay: broadcastsByDay.map(d => ({ date: d._id, total: d.total, sent: d.sent, error: d.error })),
      deliveryPersonStats: deliveryPersonStats.map(d => ({ name: d._id, totalBroadcasts: d.totalBroadcasts, totalClients: d.totalClients })),
      logisticsStats: logisticsStats.map(s => ({ status: s._id, count: s.count })),
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics', success: false }, { status: 500 });
  }
}
