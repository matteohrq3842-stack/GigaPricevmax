import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';

export const dynamic = 'force-dynamic';

type CatalogRow = Record<string, unknown>;

function coerceString(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function coerceStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => coerceString(v)).filter((v): v is string => Boolean(v));
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      return coerceStringArray(parsed);
    } catch {
      return trimmed.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

function mapCatalogRowToGame(row: CatalogRow) {
  const id = coerceNumber(row.igdb_id ?? row.id) ?? 0;
  const slug = (coerceString(row.slug) ?? '').trim().toLowerCase();
  const title = coerceString(row.name ?? row.title) ?? 'Jeu';
  const platforms = coerceStringArray(row.platforms);
  const platform = platforms[0] ?? 'PC';

  const coverImage = coerceString(row.cover_image ?? row.cover_url ?? row.image_url) ?? '';
  const heroImage = coerceString(row.hero_image ?? row.background_image ?? row.banner_url) ?? coverImage;

  return {
    id,
    slug,
    title,
    platform,
    price: '',
    oldPrice: '',
    discount: '',
    coverImage,
    heroImage,
    description: coerceString(row.summary ?? row.description) ?? '',
    releaseDate: coerceString(row.release_date ?? row.first_release_date) ?? '',
    lastUpdate: '',
    tags: coerceStringArray(row.genres),
    screenshots: coerceStringArray(row.screenshots),
    steamAppId: 0,
    metacriticScore: coerceNumber(row.metacritic_score ?? row.rating) ?? null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ game: null, error: 'Missing slug parameter' });
    }

    const normalized = slug.toLowerCase();

    // Exact match
    let rows = await query<CatalogRow>(
      'SELECT * FROM games_catalog WHERE slug = ? LIMIT 1',
      [normalized]
    );

    if (!rows.length) {
      // LIKE fallback (MySQL LIKE is case-insensitive on default collation)
      rows = await query<CatalogRow>(
        'SELECT * FROM games_catalog WHERE slug LIKE ? LIMIT 1',
        [normalized]
      );
    }

    if (!rows.length) {
      return NextResponse.json({ game: null });
    }

    return NextResponse.json({ game: mapCatalogRowToGame(rows[0]) });
  } catch (error) {
    console.error('Get game by slug error:', error);
    return NextResponse.json({
      game: null,
      error: error instanceof Error ? error.message : 'Failed to get game',
    });
  }
}
