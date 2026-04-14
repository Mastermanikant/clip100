import Ably from 'ably';
import { NextResponse } from 'next/server';

export async function GET() {
  if (!process.env.ABLY_API_KEY) {
    return NextResponse.json({ error: 'Missing ABLY_API_KEY' }, { status: 500 });
  }

  // Use Ably.Rest for server-side token generation
  const client = new Ably.Rest(process.env.ABLY_API_KEY);
  
  try {
    const tokenRequestData = await client.auth.createTokenRequest({ 
      clientId: 'frank-drop-user-' + Math.random().toString(36).substring(7) 
    });
    
    return NextResponse.json(tokenRequestData);
  } catch (error) {
    console.error('Token generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
