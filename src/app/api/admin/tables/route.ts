import { NextRequest, NextResponse } from 'next/server';
import { authorizeApi } from '@/lib/api-guard';
import { getDb, saveDb } from '@/lib/db';
import { Table, TableStatus } from '@/types';

export async function GET(req: NextRequest) {
  const auth = authorizeApi(req, ['ADMIN', 'MANAGER', 'STAFF']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const db = getDb();
    
    // Enrich tables with real-time order data and reservation details
    const enrichedTables = db.tables.map(table => {
      const activeOrder = table.currentOrderId
        ? db.orders.find(o => o.id === table.currentOrderId)
        : db.orders.find(o => o.tableId === table.id && o.status !== 'Completed' && o.status !== 'Cancelled');

      const activeReservation = table.currentReservationId
        ? db.reservations.find(r => r.id === table.currentReservationId)
        : db.reservations.find(
            r =>
              (r.assignedTableId === table.id || r.assignedTableNumber === table.number) &&
              (r.status === 'Confirmed' || r.status === 'Pending')
          );

      return {
        ...table,
        activeOrder: activeOrder || null,
        activeReservation: activeReservation || null,
        currentBillAmount: activeOrder ? activeOrder.grandTotal : (table.currentBillAmount || 0),
      };
    });

    return NextResponse.json({
      success: true,
      tables: enrichedTables,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching tables';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = authorizeApi(req, ['ADMIN', 'MANAGER', 'STAFF']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const { id, status, name, capacity, section, clearSession } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Table ID is required' }, { status: 400 });
    }

    const db = getDb();
    const table = db.tables.find(t => t.id === id || t.number === id);
    if (!table) {
      return NextResponse.json({ success: false, error: 'Table not found' }, { status: 404 });
    }

    if (status) {
      table.status = status as TableStatus;
    }
    if (name) table.name = name;
    if (capacity) table.capacity = Number(capacity);
    if (section) table.section = section;

    if (clearSession) {
      table.status = 'Available';
      table.currentOrderId = undefined;
      table.currentBillAmount = 0;
      table.currentReservationId = undefined;
    }

    saveDb(db);

    return NextResponse.json({
      success: true,
      table,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error updating table';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = authorizeApi(req, ['ADMIN', 'MANAGER']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const { number, name, capacity, section } = body;

    if (!number || !capacity) {
      return NextResponse.json({ success: false, error: 'Table number and capacity are required' }, { status: 400 });
    }

    const db = getDb();
    const padded = number.toString().padStart(2, '0');
    if (db.tables.some(t => t.number === padded)) {
      return NextResponse.json({ success: false, error: `Table ${padded} already exists` }, { status: 409 });
    }

    const newTable: Table = {
      id: `tbl_${Date.now()}`,
      number: padded,
      name: name || `Table ${padded}`,
      capacity: Number(capacity),
      section: section || 'Indoor',
      status: 'Available',
    };

    db.tables.push(newTable);
    saveDb(db);

    return NextResponse.json({
      success: true,
      table: newTable,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error creating table';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = authorizeApi(req, ['ADMIN']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Table ID is required' }, { status: 400 });
    }

    const db = getDb();
    const initialLen = db.tables.length;
    db.tables = db.tables.filter(t => t.id !== id && t.number !== id);

    if (db.tables.length === initialLen) {
      return NextResponse.json({ success: false, error: 'Table not found' }, { status: 404 });
    }

    saveDb(db);
    return NextResponse.json({ success: true, message: 'Table removed successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error removing table';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
