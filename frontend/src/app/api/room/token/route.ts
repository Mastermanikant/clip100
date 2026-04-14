import Ably from 'ably';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  if (!process.env.ABLY_API_KEY) {
    return NextResponse.json({ error: 'Ably API Key not configured' }, { status: 500 });
  }

  const client = new Ably.Rest(process.env.ABLY_API_KEY);
  
  try {
    const tokenRequestData = await client.auth.createTokenRequest({
      clientId: 'frank-drop-client',
    });
    return NextResponse.json(tokenRequestData);
  } catch (error) {
    console.error('Ably token error:', error);
    return NextResponse.json({ error: 'Failed to create token request' }, { status: 500 });
  }
}
