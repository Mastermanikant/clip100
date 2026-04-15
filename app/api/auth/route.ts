import Ably from 'ably';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.ABLY_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'ABLY_API_KEY is not configured' },
      { status: 500 }
    );
  }

  const clientId = `frank-user-${Math.random().toString(36).substring(2, 9)}`;

  // Primary: Use Ably SDK
  try {
    const client = new Ably.Rest(apiKey);
    const tokenRequestData = await client.auth.createTokenRequest({ clientId });
    return NextResponse.json(tokenRequestData);
  } catch (sdkError) {
    console.warn('[Auth] Ably SDK failed, falling back to manual HMAC:', sdkError);
  }

  // Fallback: Manual HMAC-SHA256 signing
  if (!apiKey.includes(':')) {
    return NextResponse.json(
      { error: 'Invalid ABLY_API_KEY format' },
      { status: 500 }
    );
  }

  try {
    const [keyName, keySecret] = apiKey.split(':');
    const capability = JSON.stringify({ '*': ['*'] });
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2, 9);
    const ttl = 3600000; // 1 hour

    const signData =
      [clientId, ttl, capability, nonce, timestamp].join('\n') + '\n';
    const mac = crypto
      .createHmac('sha256', keySecret)
      .update(signData)
      .digest('base64');

    return NextResponse.json({
      keyName,
      clientId,
      capability,
      timestamp,
      nonce,
      ttl,
      mac,
    });
  } catch (error) {
    console.error('[Auth] Manual token generation failed:', error);
    return NextResponse.json(
      { error: 'Token generation failed' },
      { status: 500 }
    );
  }
}
