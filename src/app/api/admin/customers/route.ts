import { NextRequest, NextResponse } from 'next/server';
import { authorizeApi } from '@/lib/api-guard';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = authorizeApi(req, ['ADMIN', 'MANAGER']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase();

    const db = getDb();
    let customers = [...db.customers];

    if (search) {
      customers = customers.filter(
        c =>
          c.name.toLowerCase().includes(search) ||
          c.phone.includes(search) ||
          c.email.toLowerCase().includes(search)
      );
    }

    // Enrich customers with their order history from orders list
    const enriched = customers.map(c => {
      const orders = db.orders.filter(
        o => o.customerPhone.replace(/\D/g, '') === c.phone.replace(/\D/g, '')
      );
      const reservations = db.reservations.filter(
        r => r.customerPhone.replace(/\D/g, '') === c.phone.replace(/\D/g, '')
      );
      return {
        ...c,
        orderHistory: orders,
        reservationHistory: reservations,
      };
    });

    return NextResponse.json({
      success: true,
      customers: enriched,
      total: enriched.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching customers';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
