import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.toLowerCase();
    const vegOnly = searchParams.get('veg') === 'true';

    const db = getDb();
    let items = db.menuItems;

    // Filter available only for public customers unless admin query
    const showAll = searchParams.get('all') === 'true';
    if (!showAll) {
      items = items.filter(item => item.isAvailable);
    }

    if (category && category !== 'All') {
      items = items.filter(item => item.category === category);
    }

    if (vegOnly) {
      items = items.filter(item => item.isVeg);
    }

    if (search) {
      items = items.filter(
        item =>
          item.name.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search) ||
          item.category.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      items,
      total: items.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch menu';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
