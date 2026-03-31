import { NextRequest, NextResponse } from 'next/server';
import { config, getApiUrl } from '@/lib/config';

interface Broadcast {
  id: string;
  userId: string;
  companyName: string;
  message: string;
  shift: 'morning' | 'afternoon';
  deliveryPerson: {
    name: string;
    phone: string;
  };
  clients: {
    name?: string;
    phone: string;
    address?: string;
  }[];
  imageUrl?: string;
  status: 'pending' | 'sent' | 'error';
  createdAt: string;
  sentAt?: string;
}

// In-memory storage for demo purposes
// In production, use MongoDB or another database
const broadcasts: Broadcast[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
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
      videoUrl
    } = body;

    // Validate required fields
    if (!userId || !companyName || !message || !shift || !deliveryPerson?.name || !deliveryPerson?.phone || !clients?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate delivery person phone
    if (!/^\+?[1-9]\d{1,14}$/.test(deliveryPerson.phone)) {
      return NextResponse.json({ error: 'Invalid delivery person phone number' }, { status: 400 });
    }

    // Validate clients
    for (const client of clients) {
      if (!client.phone || !/^\+?[1-9]\d{1,14}$/.test(client.phone)) {
        return NextResponse.json({ error: 'Invalid client phone number' }, { status: 400 });
      }
    }

    // Prepare message options for WhatsApp
    const messageOptions: Record<string, unknown> = {};
    
    console.log('🔍 [BROADCAST API] Preparing message options:', {
      hasImageUrl: !!imageUrl,
      hasAudioUrl: !!audioUrl,
      hasDocumentUrl: !!documentUrl,
      hasContact: !!(contactName && contactPhone),
      hasLocation: !!(locationLatitude && locationLongitude),
      hasSticker: !!stickerUrl,
      hasVideo: !!videoUrl,
      messageLength: message?.length,
      messagePreview: message?.substring(0, 100)
    });

    // Add image if provided
    if (imageUrl) {
      messageOptions.image = { url: imageUrl };
      if (message) {
        messageOptions.caption = message;
      }
    }
    // Add audio if provided
    else if (audioUrl) {
      messageOptions.audio = { url: audioUrl };
      messageOptions.mimetype = 'audio/mp4';
    }
    // Add document if provided
    else if (documentUrl) {
      messageOptions.document = { url: documentUrl };
      if (documentName) {
        messageOptions.fileName = documentName;
      }
      if (message) {
        messageOptions.caption = message;
      }
    }
    // Add contact if provided
    else if (contactName && contactPhone) {
      messageOptions.contact = {
        displayName: contactName,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName}\nTEL;type=CELL;type=VOICE;waid=${contactPhone.replace('+', '')}:${contactPhone}\nEND:VCARD`
      };
    }
    // Add location if provided
    else if (locationLatitude && locationLongitude) {
      messageOptions.location = {
        degreesLatitude: parseFloat(locationLatitude),
        degreesLongitude: parseFloat(locationLongitude)
      };
      if (message) {
        messageOptions.caption = message;
      }
    }
    // Add sticker if provided
    else if (stickerUrl) {
      messageOptions.sticker = { url: stickerUrl };
    }
    // Add video if provided
    else if (videoUrl) {
      messageOptions.video = { url: videoUrl };
      if (message) {
        messageOptions.caption = message;
      }
    }
    // Default: text message
    else {
      messageOptions.text = message;
    }

    // Send to peronbot backend
    const backendUrl = getApiUrl('/api/broadcasts');
    
    console.log('🔍 [BROADCAST API] Sending to peronbot backend:', {
      backendUrl,
      userId,
      companyName,
      clientsCount: clients?.length,
      deliveryPerson: deliveryPerson?.name,
      hasMessageOptions: !!messageOptions && Object.keys(messageOptions).length > 0
    });
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        companyName,
        message,
        shift,
        deliveryPerson,
        clients,
        messageOptions,
      }),
    });
    
    console.log('🔍 [BROADCAST API] Response from peronbot:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error from peronbot backend:', errorData);
      return NextResponse.json(
        { error: errorData.error || 'Failed to send broadcast to WhatsApp bot' },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    // Return the result from peronbot
    return NextResponse.json(result.data || result, { status: 201 });
  } catch (error) {
    console.error('Error creating broadcast:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userBroadcasts = broadcasts.filter(b => b.userId === userId);
    return NextResponse.json(userBroadcasts);
  } catch (error) {
    console.error('Error fetching broadcasts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json({ error: 'Broadcast ID and User ID are required' }, { status: 400 });
    }

    const index = broadcasts.findIndex(b => b.id === id && b.userId === userId);
    if (index === -1) {
      return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 });
    }

    broadcasts.splice(index, 1);

    return NextResponse.json({ message: 'Broadcast deleted successfully' });
  } catch (error) {
    console.error('Error deleting broadcast:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
