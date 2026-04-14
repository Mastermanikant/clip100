import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ABLY_API_KEY is missing' }, { status: 500 });
  }

  try {
    // Basic Fetch to Ably REST API to get token using the key
    const [keyName, keySecret] = apiKey.split(':');
    if (!keyName || !keySecret) {
       return NextResponse.json({ error: 'Invalid config' }, { status: 500 });
    }
    
    // We can use Ably package
    const Ably = await import('ably');
    const client = new Ably.Rest(apiKey);
    const tokenRequestData = await client.auth.createTokenRequest({ 
      clientId: 'frank-user-' + Math.random().toString(36).substring(7) 
    });
    
    return NextResponse.json(tokenRequestData);
  } catch (error) {
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
  }
}
