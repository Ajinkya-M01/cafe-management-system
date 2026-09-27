import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const reservation = db.reservations.find(r => r.id === id || r.reservationNumber === id);

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: 'Reservation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      reservation,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching reservation';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const db = getDb();
    const reservation = db.reservations.find(r => r.id === id || r.reservationNumber === id);

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: 'Reservation not found' },
        { status: 404 }
      );
    }

    if (body.action === 'cancel') {
      reservation.status = 'Cancelled';
      saveDb(db);
      return NextResponse.json({
        success: true,
        message: 'Reservation cancelled successfully',
        reservation,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error updating reservation';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
