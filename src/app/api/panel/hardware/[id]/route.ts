import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

// PUT /api/panel/hardware/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, price, old_price, url, image, category, description } = body;

    await query(
      'UPDATE hardware_deals SET title=?, price=?, old_price=?, url=?, image=?, category=?, description=? WHERE id=?',
      [title, price, old_price, url, image, category, description ?? null, id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[panel/hardware PUT]', err);
    return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 });
  }
}

// DELETE /api/panel/hardware/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await query('DELETE FROM hardware_deals WHERE id=?', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[panel/hardware DELETE id]', err);
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 });
  }
}
