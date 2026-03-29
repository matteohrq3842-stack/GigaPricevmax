import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

// PUT /api/panel/deals/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, price, old_price, discount, store, image_url } = body;

    await query(
      'UPDATE bot_deals SET title=?, price=?, old_price=?, discount=?, store=?, image_url=? WHERE id=?',
      [title, price, old_price, discount, store, image_url, id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[panel/deals PUT]', err);
    return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 });
  }
}

// DELETE /api/panel/deals/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await query('DELETE FROM bot_deals WHERE id=?', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[panel/deals DELETE id]', err);
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 });
  }
}
