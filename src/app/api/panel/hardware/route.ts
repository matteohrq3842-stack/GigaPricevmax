import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

// GET /api/panel/hardware?category=composants
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') ?? 'composants';

    const rows = await query(
      'SELECT * FROM hardware_deals WHERE category=? ORDER BY created_at DESC',
      [category]
    );

    return NextResponse.json({ deals: rows });
  } catch (err) {
    console.error('[panel/hardware GET]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE /api/panel/hardware  body: { ids: number[] }
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const ids: number[] = Array.isArray(body.ids) ? body.ids : [body.id];
    if (!ids.length) return NextResponse.json({ error: 'Aucun id fourni' }, { status: 400 });

    const placeholders = ids.map(() => '?').join(',');
    await query(`DELETE FROM hardware_deals WHERE id IN (${placeholders})`, ids);

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (err) {
    console.error('[panel/hardware DELETE]', err);
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 });
  }
}
