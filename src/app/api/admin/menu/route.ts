import { NextRequest, NextResponse } from 'next/server';
import { authorizeApi } from '@/lib/api-guard';
import { getDb, saveDb } from '@/lib/db';
import { MenuItem } from '@/types';

// GET: All menu items for admin management
export async function GET(req: NextRequest) {
  const auth = authorizeApi(req, ['ADMIN', 'MANAGER', 'STAFF']);
  if ('errorResponse' in auth) return auth.errorResponse;

  const db = getDb();
  return NextResponse.json({
    success: true,
    items: db.menuItems,
  });
}

// POST: Add new menu item (ADMIN & MANAGER)
export async function POST(req: NextRequest) {
  const auth = authorizeApi(req, ['ADMIN', 'MANAGER']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const { name, description, category, price, image, isVeg, isPopular, isAvailable, preparationTime, calories } = body;

    if (!name || !category || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Name, category, and price are required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const newItem: MenuItem = {
      id: `menu_${Date.now()}`,
      name,
      description: description || '',
      category,
      price: Number(price),
      image: image || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
      isVeg: Boolean(isVeg),
      isPopular: Boolean(isPopular),
      isAvailable: isAvailable !== false,
      preparationTime: Number(preparationTime) || 10,
      calories: calories ? Number(calories) : undefined,
    };

    db.menuItems.unshift(newItem);
    saveDb(db);

    return NextResponse.json({
      success: true,
      item: newItem,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error adding menu item';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT: Update menu item (ADMIN & MANAGER)
export async function PUT(req: NextRequest) {
  const auth = authorizeApi(req, ['ADMIN', 'MANAGER']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Item ID is required' }, { status: 400 });
    }

    const db = getDb();
    const index = db.menuItems.findIndex(i => i.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    db.menuItems[index] = {
      ...db.menuItems[index],
      ...updates,
      price: updates.price !== undefined ? Number(updates.price) : db.menuItems[index].price,
      preparationTime: updates.preparationTime !== undefined ? Number(updates.preparationTime) : db.menuItems[index].preparationTime,
    };

    saveDb(db);

    return NextResponse.json({
      success: true,
      item: db.menuItems[index],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error updating menu item';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE: Remove menu item (ADMIN only)
export async function DELETE(req: NextRequest) {
  const auth = authorizeApi(req, ['ADMIN']);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Item ID is required' }, { status: 400 });
    }

    const db = getDb();
    const initialLen = db.menuItems.length;
    db.menuItems = db.menuItems.filter(i => i.id !== id);

    if (db.menuItems.length === initialLen) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    saveDb(db);
    return NextResponse.json({ success: true, message: 'Item deleted successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error deleting menu item';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
