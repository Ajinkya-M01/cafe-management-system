import crypto from 'crypto';
import { Role, User } from '@/types';
import { getDb } from './db';

const JWT_SECRET = process.env.AUTH_SECRET || 'noir-and-bean-ultra-secret-key-2026-production';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'salt_noir_2026').digest('hex');
}

export function signToken(payload: { id: string; email: string; role: Role; name: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + (7 * 24 * 3600) })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): { id: string; email: string; role: Role; name: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // expired
    }
    return payload;
  } catch {
    return null;
  }
}

export function authenticateUser(email: string, passwordPlain: string): { user: Omit<User, 'passwordHash'>; token: string } | null {
  const db = getDb();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;

  const hashed = hashPassword(passwordPlain);
  if (user.passwordHash !== hashed) {
    return null;
  }

  const { passwordHash: _, ...userWithoutPassword } = user;
  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  return {
    user: userWithoutPassword,
    token,
  };
}

export function checkRoleAllowed(currentRole: Role, requiredRole?: Role | Role[]): boolean {
  if (!requiredRole) return true;
  const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  // Role hierarchy
  // ADMIN has access to everything
  if (currentRole === 'ADMIN') return true;
  // MANAGER has access to MANAGER and STAFF levels
  if (currentRole === 'MANAGER' && !allowed.includes('ADMIN')) return true;
  // STAFF has access only if STAFF is explicitly allowed
  return allowed.includes(currentRole);
}
