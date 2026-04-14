import * as Ably from 'ably';
import { NextResponse } from 'next/server';

export async function GET() {
  if (!process.env.ABLY_API_KEY) {
    return NextResponse.json({ error: 'Missing ABLY_API_KEY' }, { status: 500 });
  }

  const client = new Ably.Realtime(process.env.ABLY_API_KEY);
  const tokenRequestData = await client.auth.createTokenRequest({ clientId: 'frank-drop-user-' + Math.random().toString(36).substring(7) });
  
  return NextResponse.json(tokenRequestData);
}
