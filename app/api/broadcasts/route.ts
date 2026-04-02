import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/config';
import { getCollection } from '@/lib/mongodb';
import { verifyUserIdOwnership } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyUserIdOwnership(null);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const {
      companyName,
      message,
      shift,
      deliveryPerson,
      clients,
      imageUrl,
      audioUrl,
      documentUrl,
      documentName,
      contactName,
      contactPhone,
      locationLatitude,
      locationLongitude,
      stickerUrl,
      videoUrl,
    } = body;

    if (!companyName || !message || !shift || !deliveryPerson?.name || !deliveryPerson?.phone || !clients?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!/^\+?[1-9]\d{1,14}$/.test(deliveryPerson.phone)) {
      return NextResponse.json({ error: 'Invalid delivery person phone number' }, { status: 400 });
    }

    for (const client of clients) {
      if (!client.phone || !/^\+?[1-9]\d{1,14}$/.test(client.phone)) {
        return NextResponse.json({ error: 'Invalid client phone number' }, { status: 400 });
      }
    }

    const messageOptions: Record<string, unknown> = {};
    if (imageUrl) {
      messageOptions.image = { url: imageUrl };
      if (message) messageOptions.caption = message;
    } else if (audioUrl) {
      messageOptions.audio = { url: audioUrl };
      messageOptions.mimetype = 'audio/mp4';
    } else if (documentUrl) {
      messageOptions.document = { url: documentUrl };
      if (documentName) messageOptions.fileName = documentName;
      if (message) messageOptions.caption = message;
    } else if (contactName && contactPhone) {
      messageOptions.contact = {
        displayName: contactName,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName}\nTEL;type=CELL;type=VOICE;waid=${contactPhone.replace('+', '')}:${contactPhone}\nEND:VCARD`,
      };
    } else if (locationLatitude && locationLongitude) {
      messageOptions.location = {
        degreesLatitude: parseFloat(locationLatitude),
        degreesLongitude: parseFloat(locationLongitude),
      };
      if (message) messageOptions.caption = message;
    } else if (stickerUrl) {
      messageOptions.sticker = { url: stickerUrl };
    } else if (videoUrl) {
      messageOptions.video = { url: videoUrl };
      if (message) messageOptions.caption = message;
    } else {
      messageOptions.text = message;
    }

    // Send to Deno backend
    const backendUrl = getApiUrl('/api/broadcasts');
    let backendResult = null;
    let backendError = null;

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: auth.userId,
          companyName,
          message,
          shift,
          deliveryPerson,
          clients,
          messageOptions,
        }),
      });

      if (response.ok) {
        backendResult = await response.json();
      } else {
        const errorData = await response.json().catch(() => ({}));
        backendError = errorData.error || 'Failed to send to WhatsApp bot';
      }
    } catch (err) {
      backendError = 'WhatsApp bot is not connected';
    }

    // Save to MongoDB regardless of bot status (captures the attempt)
    const collection = await getCollection('broadcasts');
    const now = new Date();
    const broadcastDoc = {
      userId: auth.userId,
      companyName,
      message,
      shift,
      deliveryPerson,
      clients,
      status: backendError ? 'error' : 'sent',
      createdAt: now.toISOString(),
      sentAt: backendError ? undefined : now.toISOString(),
      error: backendError || undefined,
    };

    const insertResult = await collection.insertOne(broadcastDoc);

    if (backendError) {
      return NextResponse.json({
        success: false,
        error: backendError,
        data: {
          id: insertResult.insertedId.toString(),
          sent: 0,
          failed: clients.length,
        },
      }, { status: 201 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: insertResult.insertedId.toString(),
        sent: backendResult?.data?.sent || clients.length,
        failed: backendResult?.data?.failed || 0,
        ...backendResult?.data,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating broadcast:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyUserIdOwnership(null);
    if (auth instanceof NextResponse) return auth;

    const collection = await getCollection('broadcasts');
    const records = await collection
      .find({ userId: auth.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json(records.map((doc) => ({
      id: doc._id.toString(),
      userId: doc.userId,
      companyName: doc.companyName,
      message: doc.message,
      shift: doc.shift,
      deliveryPerson: doc.deliveryPerson,
      clients: doc.clients,
      status: doc.status,
      createdAt: doc.createdAt,
      sentAt: doc.sentAt,
    })));
  } catch (error) {
    console.error('Error fetching broadcasts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyUserIdOwnership(null);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Broadcast ID required' }, { status: 400 });
    }

    const { ObjectId } = await import('mongodb');
    const collection = await getCollection('broadcasts');
    await collection.deleteOne({ _id: new ObjectId(id), userId: auth.userId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting broadcast:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
