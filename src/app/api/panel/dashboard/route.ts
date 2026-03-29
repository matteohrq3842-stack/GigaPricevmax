import { NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [gamesCount, hardwareCount, recent] = await Promise.all([
      query<{ total: number }>('SELECT COUNT(*) as total FROM bot_deals'),
      query<{ total: number }>('SELECT COUNT(*) as total FROM hardware_deals'),
      query('SELECT id, title, created_at FROM bot_deals ORDER BY created_at DESC LIMIT 5'),
    ]);

    return NextResponse.json({
      games: gamesCount[0]?.total ?? 0,
      hardware: hardwareCount[0]?.total ?? 0,
      recentActivity: recent,
    });
  } catch (err) {
    console.error('[panel/dashboard GET]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
