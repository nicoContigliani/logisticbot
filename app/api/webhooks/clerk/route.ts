import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { Webhook } from 'svix';
import { headers } from 'next/headers';

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;

interface ClerkEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string;
    last_name?: string;
    image_url?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json(
        { success: false, message: 'Missing svix headers' },
        { status: 400 }
      );
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: ClerkEvent;

    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as ClerkEvent;
    } catch (err) {
      console.error('Webhook verification failed:', err);
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 400 }
      );
    }

    const eventType = evt.type;
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    await connectDB();

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const email = email_addresses?.[0]?.email_address;
      
      if (!email) {
        return NextResponse.json(
          { success: false, message: 'Email not found' },
          { status: 400 }
        );
      }

      const userData = {
        clerkId: id,
        email,
        firstName: first_name || '',
        lastName: last_name || '',
        avatar: image_url,
      };

      if (eventType === 'user.created') {
        await User.create({
          ...userData,
          role: 'student',
        });
      } else if (eventType === 'user.updated') {
        await User.findOneAndUpdate(
          { clerkId: id },
          userData,
          { new: true }
        );
      }
    }

    if (eventType === 'user.deleted') {
      await User.findOneAndDelete({ clerkId: id });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, message: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
