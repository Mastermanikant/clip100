import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const validUser = process.env.ADMIN_USERNAME;
    const validPass = process.env.ADMIN_PASSWORD;

    if (!validUser || !validPass) {
      return NextResponse.json(
        { success: false, message: 'Admin not configured' },
        { status: 500 }
      );
    }

    if (username === validUser && password === validPass) {
      // Generate a simple session token
      const token = crypto.randomUUID();
      return NextResponse.json({ success: true, token });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    );
  }
}
