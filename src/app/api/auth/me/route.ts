import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/api-guard';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }

  const db = getDb();
  const user = db.users.find(u => u.id === auth.id);
  if (!user) {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }

  const { passwordHash: _, ...safeUser } = user;
  return NextResponse.json({
    success: true,
    user: safeUser,
  });
}
