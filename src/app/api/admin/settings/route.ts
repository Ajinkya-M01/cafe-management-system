import { NextRequest, NextResponse } from 'next/server';
import { authorizeApi } from '@/lib/api-guard';
import { getDb, saveDb } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { User, Role } from '@/types';

export async function GET(req: NextRequest) {
  const auth = authorizeApi(req, ['ADMIN', 'MANAGER', 'STAFF']);
  if ('errorResponse' in auth) return auth.errorResponse;

  const db = getDb();
  const safeStaff = db.users.map(({ passwordHash: _, ...user }) => user);

  return NextResponse.json({
    success: true,
    settings: db.settings,
    staff: safeStaff,
  });
}

export async function PUT(req: NextRequest) {
  const auth = authorizeApi(req, ['ADMIN']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const db = getDb();

    db.settings = {
      ...db.settings,
      ...body,
      cgstRate: body.cgstRate !== undefined ? Number(body.cgstRate) : db.settings.cgstRate,
      sgstRate: body.sgstRate !== undefined ? Number(body.sgstRate) : db.settings.sgstRate,
    };

    saveDb(db);

    return NextResponse.json({
      success: true,
      settings: db.settings,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error updating settings';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = authorizeApi(req, ['ADMIN']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const { name, email, password, role, phone } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    const db = getDb();
    if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'A staff member with this email already exists' },
        { status: 409 }
      );
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      passwordHash: hashPassword(password),
      role: role as Role,
      phone: phone || '',
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    saveDb(db);

    const { passwordHash: _, ...safeUser } = newUser;
    return NextResponse.json({
      success: true,
      user: safeUser,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error creating staff member';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
