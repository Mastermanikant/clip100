import Ably from 'ably';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.ABLY_API_KEY;
  
  if (!apiKey) {
    console.error('ABLY_API_KEY is missing');
    return NextResponse.json({ error: 'Missing ABLY_API_KEY' }, { status: 500 });
  }

  try {
    const client = new Ably.Rest({ key: apiKey });
    const tokenRequestData = await client.auth.createTokenRequest({ 
      clientId: `user-${Math.random().toString(36).substring(7)}` 
    });
    
    return NextResponse.json(tokenRequestData);
  } catch (error: any) {
    console.error('Token generation failed:', error.message || error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
