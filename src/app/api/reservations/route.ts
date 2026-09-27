import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { Reservation } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      date,
      time,
      guests,
      tablePreference,
      specialRequests,
    } = body;

    if (!customerName || !customerPhone || !customerEmail || !date || !time || !guests) {
      return NextResponse.json(
        { success: false, error: 'Please provide all required reservation fields.' },
        { status: 400 }
      );
    }

    const guestCount = parseInt(guests, 10);
    if (isNaN(guestCount) || guestCount < 1 || guestCount > 12) {
      return NextResponse.json(
        { success: false, error: 'Number of guests must be between 1 and 12.' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check conflict: Count active reservations for this exact date & time window
    const sameSlotRes = db.reservations.filter(
      r => r.date === date && r.time === time && r.status !== 'Cancelled'
    );

    // If total active tables capacity is exceeded, return slot full
    const totalCafeTables = db.tables.length;
    if (sameSlotRes.length >= totalCafeTables) {
      return NextResponse.json(
        {
          success: false,
          error: `We apologize, but all tables are booked for ${time} on ${date}. Please select an alternative time slot.`,
        },
        { status: 409 }
      );
    }

    // Try to find a fitting available table that matches preference or capacity
    const assignedTable = db.tables.find(
      t =>
        t.capacity >= guestCount &&
        !sameSlotRes.some(r => r.assignedTableId === t.id) &&
        (!tablePreference || tablePreference === 'Any' || t.section === tablePreference)
    ) || db.tables.find(
      t => t.capacity >= guestCount && !sameSlotRes.some(r => r.assignedTableId === t.id)
    );

    const resId = `res_${Date.now()}`;
    const reservationNumber = `RES-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReservation: Reservation = {
      id: resId,
      reservationNumber,
      customerName,
      customerPhone,
      customerEmail,
      date,
      time,
      guests: guestCount,
      tablePreference: tablePreference || 'Indoor',
      specialRequests: specialRequests || '',
      status: 'Confirmed',
      assignedTableId: assignedTable?.id,
      assignedTableNumber: assignedTable?.number,
      createdAt: new Date().toISOString(),
    };

    db.reservations.unshift(newReservation);
    saveDb(db);

    return NextResponse.json({
      success: true,
      reservation: newReservation,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Reservation creation failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
