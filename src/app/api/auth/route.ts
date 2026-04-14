import Ably from 'ably';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ABLY_API_KEY is missing' }, { status: 500 });
  }

  const client = new Ably.Rest(apiKey);
  const tokenRequestData = await client.auth.createTokenRequest({ 
    clientId: 'frank-link-user-' + Math.random().toString(36).substring(7) 
  });
  
  return NextResponse.json(tokenRequestData);
}
