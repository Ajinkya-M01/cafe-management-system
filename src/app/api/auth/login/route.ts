import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const authResult = authenticateUser(email, password);
    if (!authResult) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials. Please verify your email and password.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: authResult.user,
      token: authResult.token,
    });

    // Set secure HTTP-only cookie
    response.cookies.set('nb_auth_token', authResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600, // 7 days
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
