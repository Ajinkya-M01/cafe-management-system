import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    
    // Search by order id or orderNumber
    const order = db.orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching order';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
