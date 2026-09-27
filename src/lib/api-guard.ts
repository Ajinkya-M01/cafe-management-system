import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@/types';
import { verifyToken, checkRoleAllowed } from './auth';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export function getAuthFromRequest(req: NextRequest): AuthenticatedUser | null {
  // 1. Check HTTP-only cookie
  const cookieToken = req.cookies.get('nb_auth_token')?.value;
  if (cookieToken) {
    const verified = verifyToken(cookieToken);
    if (verified) return verified;
  }

  // 2. Check Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const verified = verifyToken(token);
    if (verified) return verified;
  }

  return null;
}

export function authorizeApi(
  req: NextRequest,
  requiredRole?: Role | Role[]
): { user: AuthenticatedUser } | { errorResponse: NextResponse } {
  const user = getAuthFromRequest(req);
  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required to access administrative resource' },
        { status: 401 }
      ),
    };
  }

  if (requiredRole && !checkRoleAllowed(user.role, requiredRole)) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient privileges for role ' + user.role },
        { status: 403 }
      ),
    };
  }

  return { user };
}
