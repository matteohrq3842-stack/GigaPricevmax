import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

// GET /api/panel/user-roles?discord_id=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const discordId = searchParams.get('discord_id');

    if (!discordId) {
      return NextResponse.json({ roles: [] });
    }

    const rows = await query<{ role_id: string }>(
      'SELECT role_id FROM discord_user_roles WHERE discord_id=?',
      [discordId]
    );

    const roles = rows.map((r) => String(r.role_id ?? '').trim()).filter(Boolean);
    return NextResponse.json({ roles });
  } catch (err) {
    console.error('[panel/user-roles GET]', err);
    return NextResponse.json({ roles: [] });
  }
}
