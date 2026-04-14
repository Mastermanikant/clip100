import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey || !apiKey.includes(':')) {
    return NextResponse.json({ error: 'Invalid ABLY_API_KEY' }, { status: 500 });
  }

  // JUGAD: Manual Token Signing to bypass Ably SDK build crashes
  // Ably API Key format is id:secret
  const [keyName, keySecret] = apiKey.split(':');

  try {
    const clientId = `user-${Math.random().toString(36).substring(7)}`;
    const capability = JSON.stringify({ '*': ['*'] });
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(7);
    const ttl = 3600000; // 1 hour

    // Sign the request manually using HMAC-SHA256
    // Format: [clientId, ttl, capability, nonce, timestamp]
    const signData = [clientId, ttl, capability, nonce, timestamp].join('\n') + '\n';
    const mac = crypto.createHmac('sha256', keySecret).update(signData).digest('base64');

    const tokenRequest = {
      keyName,
      clientId,
      capability,
      timestamp,
      nonce,
      ttl,
      mac
    };
    
    return NextResponse.json(tokenRequest);
  } catch (error: any) {
    console.error('Manual Token generation failed:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
