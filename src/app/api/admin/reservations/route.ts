import { NextRequest, NextResponse } from 'next/server';
import { authorizeApi } from '@/lib/api-guard';
import { getDb, saveDb } from '@/lib/db';
import { Reservation, ReservationStatus } from '@/types';

export async function GET(req: NextRequest) {
  const auth = authorizeApi(req, ['ADMIN', 'MANAGER', 'STAFF']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const search = searchParams.get('search')?.toLowerCase();

    const db = getDb();
    let reservations = [...db.reservations];

    if (status && status !== 'all') {
      reservations = reservations.filter(r => r.status === status);
    }

    if (date) {
      reservations = reservations.filter(r => r.date === date);
    }

    if (search) {
      reservations = reservations.filter(
        r =>
          r.reservationNumber.toLowerCase().includes(search) ||
          r.customerName.toLowerCase().includes(search) ||
          r.customerPhone.includes(search) ||
          (r.assignedTableNumber && r.assignedTableNumber.includes(search))
      );
    }

    return NextResponse.json({
      success: true,
      reservations,
      total: reservations.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching reservations';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = authorizeApi(req, ['ADMIN', 'MANAGER', 'STAFF']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const { id, status, assignedTableNumber, assignedTableId, date, time } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Reservation ID is required' }, { status: 400 });
    }

    const db = getDb();
    const res = db.reservations.find(r => r.id === id || r.reservationNumber === id);
    if (!res) {
      return NextResponse.json({ success: false, error: 'Reservation not found' }, { status: 404 });
    }

    if (status) {
      res.status = status as ReservationStatus;

      // If status is changed to Confirmed and assigned a table, update table status
      if (status === 'Confirmed' && res.assignedTableId) {
        const table = db.tables.find(t => t.id === res.assignedTableId);
        if (table && table.status === 'Available') {
          table.status = 'Reserved';
          table.currentReservationId = res.id;
        }
      } else if (status === 'Cancelled' || status === 'Completed' || status === 'No-show') {
        if (res.assignedTableId) {
          const table = db.tables.find(t => t.id === res.assignedTableId);
          if (table && table.currentReservationId === res.id) {
            table.status = 'Available';
            table.currentReservationId = undefined;
          }
        }
      }
    }

    if (assignedTableNumber !== undefined) {
      res.assignedTableNumber = assignedTableNumber;
      const matchingTable = db.tables.find(t => t.number === assignedTableNumber);
      if (matchingTable) {
        res.assignedTableId = matchingTable.id;
        if (res.status === 'Confirmed') {
          matchingTable.status = 'Reserved';
          matchingTable.currentReservationId = res.id;
        }
      }
    }

    if (assignedTableId) {
      res.assignedTableId = assignedTableId;
      const matchingTable = db.tables.find(t => t.id === assignedTableId);
      if (matchingTable) {
        res.assignedTableNumber = matchingTable.number;
      }
    }

    if (date) res.date = date;
    if (time) res.time = time;

    saveDb(db);

    return NextResponse.json({
      success: true,
      reservation: res,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error updating reservation';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = authorizeApi(req, ['ADMIN', 'MANAGER', 'STAFF']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const { customerName, customerPhone, customerEmail, date, time, guests, tablePreference, specialRequests, assignedTableNumber } = body;

    const db = getDb();
    const resId = `res_${Date.now()}`;
    const reservationNumber = `RES-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRes: Reservation = {
      id: resId,
      reservationNumber,
      customerName,
      customerPhone,
      customerEmail: customerEmail || '',
      date,
      time,
      guests: Number(guests) || 2,
      tablePreference: tablePreference || 'Indoor',
      specialRequests: specialRequests || '',
      status: 'Confirmed',
      assignedTableNumber: assignedTableNumber || undefined,
      createdAt: new Date().toISOString(),
    };

    if (assignedTableNumber) {
      const table = db.tables.find(t => t.number === assignedTableNumber);
      if (table) {
        newRes.assignedTableId = table.id;
        table.status = 'Reserved';
        table.currentReservationId = resId;
      }
    }

    db.reservations.unshift(newRes);
    saveDb(db);

    return NextResponse.json({
      success: true,
      reservation: newRes,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error adding reservation';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
