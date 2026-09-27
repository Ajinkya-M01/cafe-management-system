import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { Order, OrderItem } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      type,
      tableNumber,
      pickupTime,
      items,
      notes,
    } = body;

    if (!customerName || !customerPhone || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Name, phone number, and at least one order item are required.' },
        { status: 400 }
      );
    }

    if (type === 'dine-in' && !tableNumber) {
      return NextResponse.json(
        { success: false, error: 'Table number is required for dine-in orders.' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verify each item against real menu database to ensure price integrity
    const verifiedItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const menuItem = db.menuItems.find(m => m.id === item.menuItemId);
      if (!menuItem) {
        return NextResponse.json(
          { success: false, error: `Menu item with ID ${item.menuItemId} was not found.` },
          { status: 404 }
        );
      }
      if (!menuItem.isAvailable) {
        return NextResponse.json(
          { success: false, error: `Item "${menuItem.name}" is currently sold out.` },
          { status: 400 }
        );
      }

      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      verifiedItems.push({
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: qty,
        notes: item.notes || '',
        isVeg: menuItem.isVeg,
        image: menuItem.image,
      });

      subtotal += menuItem.price * qty;
    }

    const cgstRate = db.settings.cgstRate || 2.5;
    const sgstRate = db.settings.sgstRate || 2.5;
    const cgst = Math.round(subtotal * (cgstRate / 100) * 100) / 100;
    const sgst = Math.round(subtotal * (sgstRate / 100) * 100) / 100;
    const grandTotal = Math.round((subtotal + cgst + sgst) * 100) / 100;

    const orderId = `ord_${Date.now()}`;
    const orderNumber = `NB-${Math.floor(1000 + Math.random() * 9000)}`;

    let targetTableId: string | undefined = undefined;
    if (type === 'dine-in' && tableNumber) {
      const paddedTable = tableNumber.toString().padStart(2, '0');
      const table = db.tables.find(t => t.number === paddedTable || t.name.toLowerCase().includes(paddedTable.toLowerCase()));
      if (table) {
        targetTableId = table.id;
        table.status = 'Occupied';
        table.currentOrderId = orderId;
        table.currentBillAmount = (table.currentBillAmount || 0) + grandTotal;
      }
    }

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerName,
      customerPhone,
      customerEmail: customerEmail || '',
      type,
      tableId: targetTableId,
      tableNumber: tableNumber ? tableNumber.toString().padStart(2, '0') : undefined,
      pickupTime: type === 'takeaway' ? (pickupTime || '15-20 Mins') : undefined,
      items: verifiedItems,
      subtotal,
      discountAmount: 0,
      cgst,
      sgst,
      grandTotal,
      status: 'Pending',
      paymentStatus: 'Pending',
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);

    // Update or insert customer
    const existingCust = db.customers.find(
      c => c.phone.replace(/\D/g, '') === customerPhone.replace(/\D/g, '')
    );
    if (existingCust) {
      existingCust.totalOrders += 1;
      existingCust.totalSpend += grandTotal;
      existingCust.lastVisit = 'Today';
    } else {
      db.customers.push({
        id: `cust_${Date.now()}`,
        name: customerName,
        phone: customerPhone,
        email: customerEmail || '',
        totalOrders: 1,
        totalSpend: grandTotal,
        lastVisit: 'Today',
      });
    }

    saveDb(db);

    return NextResponse.json({
      success: true,
      order: newOrder,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Order creation failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
