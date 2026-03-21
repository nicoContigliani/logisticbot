import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { AppError, errorHandler } from '@/lib/error-handler';

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    await dbConnect();

    // Get user data from Clerk
    const body = await request.json();
    const { email, firstName, lastName, avatar } = body;

    // Check if user exists
    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      // Create new user
      user = await User.create({
        clerkId: userId,
        email,
        firstName,
        lastName,
        avatar,
        role: 'student',
      });
    } else {
      // Update existing user
      user = await User.findOneAndUpdate(
        { clerkId: userId },
        { email, firstName, lastName, avatar },
        { new: true }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    if (error instanceof AppError) {
      return errorHandler(error);
    }
    return errorHandler(error instanceof Error ? error : new Error('Unknown error'));
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    await dbConnect();

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    if (error instanceof AppError) {
      return errorHandler(error);
    }
    return errorHandler(error instanceof Error ? error : new Error('Unknown error'));
  }
}
