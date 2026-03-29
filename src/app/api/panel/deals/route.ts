import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

// GET /api/panel/deals?page=1&search=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const search = searchParams.get('search') ?? '';
    const pageSize = 25;
    const offset = (page - 1) * pageSize;

    let dataSql = 'SELECT * FROM bot_deals';
    let countSql = 'SELECT COUNT(*) as total FROM bot_deals';
    const params: unknown[] = [];
    const countParams: unknown[] = [];

    if (search) {
      dataSql += ' WHERE title LIKE ?';
      countSql += ' WHERE title LIKE ?';
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    dataSql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(pageSize, offset);

    const [rows, countRows] = await Promise.all([
      query(dataSql, params),
      query<{ total: number }>(countSql, countParams),
    ]);

    const total = countRows[0]?.total ?? 0;

    return NextResponse.json({ deals: rows, total, page, pageSize });
  } catch (err) {
    console.error('[panel/deals GET]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE /api/panel/deals  body: { ids: number[] }
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const ids: number[] = Array.isArray(body.ids) ? body.ids : [body.id];
    if (!ids.length) return NextResponse.json({ error: 'Aucun id fourni' }, { status: 400 });

    const placeholders = ids.map(() => '?').join(',');
    await query(`DELETE FROM bot_deals WHERE id IN (${placeholders})`, ids);

    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (err) {
    console.error('[panel/deals DELETE]', err);
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 });
  }
}
