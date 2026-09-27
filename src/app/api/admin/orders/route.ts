import { NextRequest, NextResponse } from 'next/server';
import { authorizeApi } from '@/lib/api-guard';
import { getDb, saveDb } from '@/lib/db';
import { OrderStatus } from '@/types';

export async function GET(req: NextRequest) {
  const auth = authorizeApi(req, ['ADMIN', 'MANAGER', 'STAFF']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const dateFilter = searchParams.get('dateFilter') || 'all';
    const search = searchParams.get('search')?.toLowerCase();

    const db = getDb();
    let orders = [...db.orders];

    // Status filter
    if (status && status !== 'all') {
      orders = orders.filter(o => o.status === status);
    }

    // Search filter (Order ID, Customer, Phone, Table)
    if (search) {
      orders = orders.filter(
        o =>
          o.orderNumber.toLowerCase().includes(search) ||
          o.id.toLowerCase().includes(search) ||
          o.customerName.toLowerCase().includes(search) ||
          o.customerPhone.includes(search) ||
          (o.tableNumber && o.tableNumber.includes(search))
      );
    }

    // Date filter
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const startOfWeek = startOfToday - 7 * 86400000;
    const startOfMonth = startOfToday - 30 * 86400000;

    if (dateFilter === 'today') {
      orders = orders.filter(o => new Date(o.createdAt).getTime() >= startOfToday);
    } else if (dateFilter === 'yesterday') {
      orders = orders.filter(o => {
        const t = new Date(o.createdAt).getTime();
        return t >= startOfYesterday && t < startOfToday;
      });
    } else if (dateFilter === 'week') {
      orders = orders.filter(o => new Date(o.createdAt).getTime() >= startOfWeek);
    } else if (dateFilter === 'month') {
      orders = orders.filter(o => new Date(o.createdAt).getTime() >= startOfMonth);
    }

    return NextResponse.json({
      success: true,
      orders,
      total: orders.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching orders';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = authorizeApi(req, ['ADMIN', 'MANAGER', 'STAFF']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const { id, status, paymentStatus, paymentMethod } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const db = getDb();
    const order = db.orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (status) {
      order.status = status as OrderStatus;
      order.updatedAt = new Date().toISOString();

      // If order is completed or cancelled and associated with a table, release table if no other pending orders
      if ((status === 'Completed' || status === 'Cancelled') && order.tableId) {
        const table = db.tables.find(t => t.id === order.tableId);
        if (table && table.currentOrderId === order.id) {
          table.status = 'Cleaning';
          table.currentOrderId = undefined;
          table.currentBillAmount = 0;
        }
      }
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    if (paymentMethod) {
      order.paymentMethod = paymentMethod;
    }

    saveDb(db);

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error updating order';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
