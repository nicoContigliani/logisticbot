import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const { userId } = await auth();
    return userId;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<{ userId: string } | NextResponse> {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return { userId };
}

export async function verifyUserIdOwnership(
  requestUserId: string | null | undefined
): Promise<{ authorized: true; userId: string } | NextResponse> {
  const authUserId = await getAuthenticatedUserId();
  if (!authUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (requestUserId && requestUserId !== authUserId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return { authorized: true, userId: authUserId };
}
