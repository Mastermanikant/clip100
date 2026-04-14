import Ably from 'ably';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // JUGAD: Skip execution during Next.js build phase to prevent static optimization crashes
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    return NextResponse.json({ build: 'skipped' });
  }

  const apiKey = process.env.ABLY_API_KEY;
  
  if (!apiKey) {
    console.error('ABLY_API_KEY is missing');
    return NextResponse.json({ error: 'Missing ABLY_API_KEY' }, { status: 500 });
  }

  try {
    // Force Rest client to only initialize in runtime
    const client = new Ably.Rest({ key: apiKey });
    
    // Explicitly handle the promise for Token Request
    const tokenRequestData = await new Promise((resolve, reject) => {
      client.auth.createTokenRequest({ 
        clientId: `user-${Math.random().toString(36).substring(7)}` 
      }, (err, tokenRequest) => {
        if (err) reject(err);
        else resolve(tokenRequest);
      });
    });
    
    return NextResponse.json(tokenRequestData);
  } catch (error: any) {
    console.error('Token generation failed:', error.message || error);
    return NextResponse.json({ error: 'Failed to generate token', details: error.message }, { status: 500 });
  }
}
