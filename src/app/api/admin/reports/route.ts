import { NextRequest, NextResponse } from 'next/server';
import { authorizeApi } from '@/lib/api-guard';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = authorizeApi(req, ['ADMIN', 'MANAGER']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const db = getDb();
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = startOfToday - 7 * 86400000;
    const startOfMonth = startOfToday - 30 * 86400000;

    const totalOrders = db.orders.length;
    const todayOrders = db.orders.filter(o => new Date(o.createdAt).getTime() >= startOfToday);
    const weekOrders = db.orders.filter(o => new Date(o.createdAt).getTime() >= startOfWeek);
    const monthOrders = db.orders.filter(o => new Date(o.createdAt).getTime() >= startOfMonth);

    const totalRevenue = db.orders
      .filter(o => o.paymentStatus === 'Paid')
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const todayRevenue = todayOrders
      .filter(o => o.paymentStatus === 'Paid')
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const weekRevenue = weekOrders
      .filter(o => o.paymentStatus === 'Paid')
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const monthRevenue = monthOrders
      .filter(o => o.paymentStatus === 'Paid')
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const pendingOrders = db.orders.filter(o => o.status === 'Pending').length;
    const preparingOrders = db.orders.filter(o => o.status === 'Preparing').length;
    const readyOrders = db.orders.filter(o => o.status === 'Ready').length;

    // Item popularity count
    const itemCounts: Record<string, { name: string; category: string; count: number; revenue: number }> = {};
    for (const order of db.orders) {
      for (const item of order.items) {
        if (!itemCounts[item.name]) {
          itemCounts[item.name] = { name: item.name, category: 'Menu', count: 0, revenue: 0 };
        }
        itemCounts[item.name].count += item.quantity;
        itemCounts[item.name].revenue += item.price * item.quantity;
      }
    }

    const popularItems = Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Payment methods breakdown
    const paymentBreakdown = {
      UPI: db.orders.filter(o => o.paymentMethod === 'UPI').length,
      Card: db.orders.filter(o => o.paymentMethod === 'Card').length,
      Cash: db.orders.filter(o => o.paymentMethod === 'Cash' || !o.paymentMethod).length,
    };

    // Table utilization
    const occupiedTables = db.tables.filter(t => t.status === 'Occupied' || t.status === 'Billing').length;
    const totalTables = db.tables.length;
    const tableUtilization = Math.round((occupiedTables / totalTables) * 100);

    // Reservations
    const totalReservations = db.reservations.length;
    const todayReservations = db.reservations.filter(
      r => r.date === now.toISOString().split('T')[0]
    ).length;

    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenue,
        todayRevenue,
        weekRevenue,
        monthRevenue,
        totalOrders,
        todayOrders: todayOrders.length,
        pendingOrders,
        preparingOrders,
        readyOrders,
        occupiedTables,
        availableTables: db.tables.filter(t => t.status === 'Available').length,
        totalTables,
        tableUtilization,
        totalReservations,
        todayReservations,
        popularItems,
        paymentBreakdown,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error generating reports';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
