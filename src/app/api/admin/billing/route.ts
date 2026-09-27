import { NextRequest, NextResponse } from 'next/server';
import { authorizeApi } from '@/lib/api-guard';
import { getDb, saveDb } from '@/lib/db';
import { Bill } from '@/types';

export async function GET(req: NextRequest) {
  const auth = authorizeApi(req, ['ADMIN', 'MANAGER', 'STAFF']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const tableNumber = searchParams.get('tableNumber');

    const db = getDb();

    // If requesting specific order details for billing
    if (orderId) {
      const order = db.orders.find(o => o.id === orderId || o.orderNumber === orderId);
      if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      return NextResponse.json({ success: true, order });
    }

    // If requesting active order for table
    if (tableNumber) {
      const padded = tableNumber.padStart(2, '0');
      const table = db.tables.find(t => t.number === padded);
      const activeOrder = db.orders.find(
        o =>
          (o.tableNumber === padded || o.tableId === table?.id) &&
          o.status !== 'Completed' &&
          o.status !== 'Cancelled'
      );
      return NextResponse.json({ success: true, table, activeOrder });
    }

    return NextResponse.json({
      success: true,
      bills: db.bills,
      total: db.bills.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching billing data';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = authorizeApi(req, ['ADMIN', 'MANAGER', 'STAFF']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const { orderId, discountPercentage = 0, paymentMethod = 'Cash', paymentStatus = 'Paid' } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const db = getDb();
    const order = db.orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discPercent = Math.min(100, Math.max(0, Number(discountPercentage) || 0));
    const discountAmount = Math.round(subtotal * (discPercent / 100) * 100) / 100;
    const taxableAmount = Math.max(0, subtotal - discountAmount);

    const cgstRate = db.settings.cgstRate || 2.5;
    const sgstRate = db.settings.sgstRate || 2.5;
    const cgst = Math.round(taxableAmount * (cgstRate / 100) * 100) / 100;
    const sgst = Math.round(taxableAmount * (sgstRate / 100) * 100) / 100;
    const grandTotal = Math.round((taxableAmount + cgst + sgst) * 100) / 100;

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBill: Bill = {
      id: `bill_${Date.now()}`,
      invoiceNumber,
      orderId: order.id,
      orderNumber: order.orderNumber,
      tableNumber: order.tableNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      items: order.items,
      subtotal,
      discountPercentage: discPercent,
      discountAmount,
      cgst,
      sgst,
      grandTotal,
      paymentMethod,
      paymentStatus,
      generatedAt: new Date().toISOString(),
      gstin: db.settings.gstin,
    };

    db.bills.unshift(newBill);

    // Update order
    order.subtotal = subtotal;
    order.discountAmount = discountAmount;
    order.cgst = cgst;
    order.sgst = sgst;
    order.grandTotal = grandTotal;
    order.paymentMethod = paymentMethod;
    order.paymentStatus = paymentStatus;
    if (paymentStatus === 'Paid') {
      order.status = 'Completed';
    }

    // Release table
    if (order.tableNumber) {
      const table = db.tables.find(t => t.number === order.tableNumber);
      if (table) {
        table.status = paymentStatus === 'Paid' ? 'Cleaning' : 'Billing';
        if (paymentStatus === 'Paid') {
          table.currentOrderId = undefined;
          table.currentBillAmount = 0;
        }
      }
    }

    saveDb(db);

    return NextResponse.json({
      success: true,
      bill: newBill,
      order,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error generating bill';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
