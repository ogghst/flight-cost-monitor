import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Clear refresh token cookie
    cookies().delete('fcm_refresh_token');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to clear refresh token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}