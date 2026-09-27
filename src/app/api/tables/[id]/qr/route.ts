import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { getDb } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const table = db.tables.find(t => t.id === id || t.number === id);

    if (!table) {
      return NextResponse.json(
        { success: false, error: 'Table not found' },
        { status: 404 }
      );
    }

    // Determine domain from request headers
    const host = req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const menuUrl = `${proto}://${host}/menu?table=${table.number}`;

    // Generate high resolution QR Code data URL with luxury styling
    const qrDataUrl = await QRCode.toDataURL(menuUrl, {
      width: 500,
      margin: 2,
      color: {
        dark: '#1A1412',
        light: '#FBF8F3',
      },
    });

    return NextResponse.json({
      success: true,
      table,
      menuUrl,
      qrDataUrl,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error generating QR code';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
