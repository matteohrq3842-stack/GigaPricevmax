import 'server-only';

import { query } from '@/lib/mysql';
import { games, mapBotDealToGame, type Game, type SystemReq, type ActuGaming } from './games';

// Determine week index for rotation (Changes every Monday)
function getWeekIndex(): number {
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const baseDate = new Date('2024-01-01T00:00:00Z').getTime();
  return Math.floor((Date.now() - baseDate) / oneWeek);
}

// ─── Coerce helpers ────────────────────────────────────────────────────────────

type BotDealRow = Record<string, unknown>;
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

function coerceSystemReq(value: unknown): SystemReq | undefined {
  if (!value) return undefined;
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>;
    return {
      os: coerceString(v.os ?? v.OS ?? v.operating_system) ?? undefined,
      processor: coerceString(v.processor ?? v.cpu ?? v.CPU) ?? undefined,
      memory: coerceString(v.memory ?? v.ram ?? v.RAM) ?? undefined,
      graphics: coerceString(v.graphics ?? v.gpu ?? v.GPU) ?? undefined,
      storage: coerceString(v.storage ?? v.disk ?? v.hdd ?? v.ssd) ?? undefined,
      additional: coerceString(v.additional ?? v.other ?? v.note) ?? undefined,
    };
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    try {
      return coerceSystemReq(JSON.parse(trimmed));
    } catch {
      return undefined;
    }
  }
  return undefined;
}

// ─── games_catalog mapper ──────────────────────────────────────────────────────

function mapCatalogRowToGame(row: CatalogRow): Game {
  const id = coerceNumber(row.igdb_id ?? row.id) ?? 0;
  const slug = (coerceString(row.slug) ?? '').trim().toLowerCase();
  const title = coerceString(row.name ?? row.title) ?? 'Jeu';

  const platforms = coerceStringArray(row.platforms);
  const platform = platforms[0] ?? 'PC';

  const description = coerceString(row.description_fr ?? row.description) ?? '';
  const releaseDate = coerceString(row.release_date) ?? '';
  const lastUpdate = coerceString(row.last_update ?? row.updated_at) ?? '';

  const genres = coerceStringArray(row.genres);
  const themes = coerceStringArray(row.themes);
  const tags = Array.from(new Set([...genres, ...themes])).filter(Boolean);

  const screenshots = coerceStringArray(row.screenshots);

  const minConfig = coerceSystemReq(row.min_config_raw ?? row.min_config ?? row.config_minimum);
  const recConfig = coerceSystemReq(row.rec_config_raw ?? row.rec_config ?? row.config_recommended);

  const coverImage = coerceString(row.cover_image ?? row.coverImage ?? row.image_url ?? row.hero_image_url ?? row.image) ?? '';
  const heroImage = coerceString(row.hero_image ?? row.hero_image_url ?? row.heroImage ?? row.image_url) ?? coverImage;

  const trailerMp4Url = coerceString(row.trailer_mp4_url ?? row.trailer_mp4 ?? row.video_mp4_url) ?? '';
  const trailerEmbedUrl = coerceString(row.trailer_embed_url ?? row.trailer_iframe_url ?? row.video_embed_url) ?? '';
  const trailerYoutubeId = coerceString(row.trailer_youtube_id ?? row.youtube_id ?? row.youtubeId) ?? '';
  const trailerUrl = coerceString(row.trailer_url ?? row.trailer ?? row.video_url) ?? '';

  return {
    id,
    slug,
    title,
    platform,
    price: '—',
    oldPrice: '—',
    discount: '—',
    metacriticScore: null,
    steamAppId: 0,
    coverImage,
    heroImage,
    description,
    releaseDate,
    lastUpdate,
    tags,
    screenshots: screenshots.length ? screenshots : [heroImage, coverImage].filter(Boolean),
    trailerUrl,
    trailerMp4Url,
    trailerEmbedUrl,
    trailerYoutubeId,
    minConfig,
    recConfig,
  };
}

// ─── games_catalog queries ─────────────────────────────────────────────────────

async function fetchCatalogGameBySlug(slug: string): Promise<Game | null> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;
  try {
    const rows = await query<CatalogRow>(
      'SELECT * FROM games_catalog WHERE slug = ? LIMIT 1',
      [normalized]
    );
    if (!rows.length) return null;
    return mapCatalogRowToGame(rows[0]);
  } catch {
    return null;
  }
}

async function fetchCatalogGameByIgdbId(igdbId: number): Promise<Game | null> {
  if (!Number.isFinite(igdbId) || igdbId <= 0) return null;
  try {
    const rows = await query<CatalogRow>(
      'SELECT * FROM games_catalog WHERE igdb_id = ? LIMIT 1',
      [igdbId]
    );
    if (!rows.length) return null;
    return mapCatalogRowToGame(rows[0]);
  } catch {
    return null;
  }
}

async function fetchCatalogSlugs(limit: number): Promise<string[]> {
  try {
    const rows = await query<{ slug: string }>(
      "SELECT slug FROM games_catalog WHERE slug IS NOT NULL AND slug != '' LIMIT ?",
      [limit]
    );
    return rows.map((r) => String(r.slug ?? '').trim().toLowerCase()).filter(Boolean);
  } catch {
    return [];
  }
}

// ─── Public exports ────────────────────────────────────────────────────────────

export async function fetchWeeklyTopGames(limit: number = 6): Promise<Game[]> {
  const staticFallback = games.slice(0, limit);
  try {
    const maxWeeksCycle = 8;
    const pageIndex = getWeekIndex() % maxWeeksCycle;
    const offset = pageIndex * limit;

    // Try with metacritic_score first, fallback to created_at if column doesn't exist
    let rows: BotDealRow[] = [];
    try {
      rows = await query<BotDealRow>(
        `SELECT * FROM bot_deals
         WHERE metacritic_score IS NOT NULL
         AND (platform LIKE '%steam%' OR platform LIKE '%gog%' OR platform LIKE '%ea app%'
              OR platform LIKE '%epic%' OR platform LIKE '%ubisoft%' OR platform LIKE '%pc%')
         ORDER BY metacritic_score DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
    } catch {
      // metacritic_score column may not exist — use simple query
      rows = await query<BotDealRow>(
        'SELECT * FROM bot_deals ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );
    }

    if (!rows.length) {
      const top = await query<BotDealRow>(
        'SELECT * FROM bot_deals ORDER BY created_at DESC LIMIT ?',
        [limit]
      );
      return top.length ? top.map((r) => mapBotDealToGame(r)) : staticFallback;
    }

    return rows.map((r) => mapBotDealToGame(r));
  } catch (err) {
    console.error('fetchWeeklyTopGames failed:', err);
    return staticFallback;
  }
}

export async function fetchAllGameSlugsForStaticParams(): Promise<string[]> {
  const fallback = games.map((g) => g.slug);
  try {
    const [botRows, catalogSlugs] = await Promise.all([
      query<{ slug: string }>(
        "SELECT slug FROM bot_deals WHERE slug IS NOT NULL AND slug != '' LIMIT 10000"
      ),
      fetchCatalogSlugs(5000),
    ]);

    const botSlugs = botRows
      .map((r) => String(r.slug ?? '').trim().toLowerCase())
      .filter(Boolean);

    return Array.from(new Set([...botSlugs, ...catalogSlugs, ...fallback])).filter(Boolean);
  } catch {
    return fallback;
  }
}

export async function fetchBotDealBySlug(slug: unknown): Promise<Game | null> {
  if (typeof slug !== 'string') return null;
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) return null;

  const fallback = games.find((g) => g.slug === normalizedSlug) ?? null;

  const mergeCatalogRequirements = (game: Game, catalog: Game | null) => {
    if (!catalog) return game;
    return { ...game, minConfig: game.minConfig ?? catalog.minConfig, recConfig: game.recConfig ?? catalog.recConfig };
  };

  try {
    // 1. Try exact slug match
    const rows = await query<BotDealRow>('SELECT * FROM bot_deals WHERE slug = ? LIMIT 5', [normalizedSlug]);
    if (rows.length) {
      const mapped = mapBotDealToGame(rows[0]);
      if (mapped.minConfig || mapped.recConfig) return mapped;
      const igdbId = coerceNumber((rows[0] as Record<string, unknown>).igdb_id) ?? null;
      const catalog = (await fetchCatalogGameBySlug(normalizedSlug)) ?? (igdbId ? await fetchCatalogGameByIgdbId(igdbId) : null);
      return mergeCatalogRequirements(mapped, catalog);
    }

    // 2. Try catalog
    const catalog = await fetchCatalogGameBySlug(normalizedSlug);
    if (catalog) return catalog;

    // 3. Try title search
    const term = normalizedSlug.replace(/-/g, ' ').trim();
    if (term) {
      const titleRows = await query<BotDealRow>(
        'SELECT * FROM bot_deals WHERE title LIKE ? LIMIT 50',
        [`%${term}%`]
      );
      if (titleRows.length) {
        const match = titleRows.map((r) => mapBotDealToGame(r)).find((g) => g.slug === normalizedSlug);
        if (match) {
          const cat = await fetchCatalogGameBySlug(normalizedSlug);
          return mergeCatalogRequirements(match, cat);
        }
      }
    }

    // 4. Fallback: scan recent deals
    const recent = await query<BotDealRow>(
      'SELECT * FROM bot_deals ORDER BY created_at DESC LIMIT 1000'
    );
    const match = recent.map((r) => mapBotDealToGame(r)).find((g) => g.slug === normalizedSlug);
    if (match) {
      const cat = await fetchCatalogGameBySlug(normalizedSlug);
      return mergeCatalogRequirements(match, cat);
    }

    return fallback;
  } catch {
    const cat = await fetchCatalogGameBySlug(normalizedSlug);
    return cat ?? fallback;
  }
}

export async function fetchBotDealsPage({
  page,
  pageSize,
  preferOrderAscending = false,
}: {
  page: number;
  pageSize: number;
  preferOrderColumns?: string[];
  preferOrderAscending?: boolean;
}): Promise<{ games: Game[]; total: number }> {
  const offset = Math.max(0, (page - 1) * pageSize);
  const order = preferOrderAscending ? 'ASC' : 'DESC';

  const getFallback = () => {
    const slice = games.slice(offset, offset + pageSize);
    const sorted = [...slice].sort((a, b) => (b.metacriticScore ?? -1) - (a.metacriticScore ?? -1));
    return { games: sorted, total: games.length };
  };

  try {
    // Try metacritic_score sort first, fallback to created_at if column absent
    let rows: BotDealRow[] = [];
    let total = 0;
    try {
      const [r, c] = await Promise.all([
        query<BotDealRow>(
          `SELECT * FROM bot_deals ORDER BY metacritic_score ${order} LIMIT ? OFFSET ?`,
          [pageSize, offset]
        ),
        query<{ total: number }>('SELECT COUNT(*) as total FROM bot_deals'),
      ]);
      rows = r;
      total = c[0]?.total ?? 0;
    } catch {
      const [r, c] = await Promise.all([
        query<BotDealRow>(
          `SELECT * FROM bot_deals ORDER BY created_at DESC LIMIT ? OFFSET ?`,
          [pageSize, offset]
        ),
        query<{ total: number }>('SELECT COUNT(*) as total FROM bot_deals'),
      ]);
      rows = r;
      total = c[0]?.total ?? 0;
    }

    if (!rows.length) return getFallback();
    return { games: rows.map((r) => mapBotDealToGame(r)), total };
  } catch {
    return getFallback();
  }
}

export async function fetchSimilarBotDeals(game: Game, limit: number): Promise<Game[]> {
  const tags = Array.isArray(game.tags) ? game.tags.filter(Boolean) : [];
  const candidatesFallback = games
    .filter((g) => g.slug !== game.slug && (!tags.length || g.tags.some((t) => tags.includes(t))))
    .slice(0, limit);

  try {
    const rows = await query<BotDealRow>(
      'SELECT * FROM bot_deals WHERE slug != ? ORDER BY created_at DESC LIMIT ?',
      [game.slug, limit]
    );
    if (!rows.length) return candidatesFallback;
    return rows.map((r) => mapBotDealToGame(r));
  } catch {
    return candidatesFallback;
  }
}

export async function fetchNewReleases(limit: number): Promise<Game[]> {
  const fallback = games
    .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
    .slice(0, limit);

  try {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    const thirtyDaysAgo = date.toISOString().slice(0, 19).replace('T', ' ');

    const rows = await query<BotDealRow>(
      'SELECT * FROM bot_deals WHERE created_at > ? ORDER BY created_at DESC LIMIT ?',
      [thirtyDaysAgo, limit]
    );
    return rows.map((r) => mapBotDealToGame(r));
  } catch {
    return fallback;
  }
}

export async function fetchGamingInfo(limit: number, category?: string): Promise<ActuGaming[]> {
  try {
    if (category) {
      const rows = await query<ActuGaming>(
        'SELECT * FROM actu_gaming WHERE category = ? ORDER BY created_at DESC LIMIT ?',
        [category, limit]
      );
      return rows;
    }
    const rows = await query<ActuGaming>(
      'SELECT * FROM actu_gaming ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    return rows;
  } catch {
    return [];
  }
}
