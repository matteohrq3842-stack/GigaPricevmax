import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type SystemReq = {
  os?: string;
  processor?: string;
  memory?: string;
  graphics?: string;
  storage?: string;
  additional?: string;
};

export type ActuGaming = {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url: string;
  url: string;
  created_at: string;
};

export type Game = {
  id: number;
  slug: string;
  title: string;
  platform: string;
  price: string;
  oldPrice: string;
  discount: string;
  metacriticScore?: number | null;
  steamAppId: number;
  coverImage: string;
  heroImage: string;
  description: string;
  releaseDate: string;
  lastUpdate: string;
  tags: string[];
  screenshots: string[];
  trailerUrl?: string;
  trailerMp4Url?: string;
  trailerEmbedUrl?: string;
  trailerYoutubeId?: string;
  minConfig?: SystemReq;
  recConfig?: SystemReq;
};

type BotDealRow = Record<string, unknown>;

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
      return trimmed
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
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
      const parsed = JSON.parse(trimmed);
      return coerceSystemReq(parsed);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function formatEuro(value: unknown): string {
  const s = coerceString(value);
  if (s && s.includes('€')) return s;
  const n = coerceNumber(value);
  if (n === null) return s ?? '—';
  return `${n.toFixed(2)}€`;
}

function parseEuroString(value: string): number | null {
  const cleaned = value
    .replace(/\s/g, '')
    .replace('€', '')
    .replace(',', '.')
    .trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function computeDiscountFromPrices(price: string, oldPrice: string): string | null {
  const p = parseEuroString(price);
  const o = parseEuroString(oldPrice);
  if (p === null || o === null) return null;
  if (o <= 0 || p >= o) return null;
  const pct = Math.round(((o - p) / o) * 100);
  if (!Number.isFinite(pct) || pct <= 0) return null;
  return `-${pct}%`;
}

function formatDiscount(value: unknown): string {
  const s = coerceString(value);
  if (s && /%/.test(s)) {
    return s.startsWith('-') ? s : `-${s.replace('%', '')}%`;
  }
  const n = coerceNumber(value);
  if (n === null) return s ?? '—';
  const asPercent = n > 0 && n < 1 ? n * 100 : n;
  const pct = Math.round(asPercent);
  return `-${Math.abs(pct)}%`;
}

function toIsoDateString(value: unknown): string {
  const s = coerceString(value);
  if (!s) return '';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString();
}

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getPublicSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export function mapBotDealToGame(row: BotDealRow): Game {
  const id = coerceNumber(row.id ?? row.game_id ?? row.deal_id) ?? 0;
  const title = coerceString(row.title ?? row.name ?? row.game_title ?? row.product_name) ?? 'Jeu';
  const slug = coerceString(row.slug ?? row.catalog_slug ?? row.game_slug) ?? slugify(title);
  const platform = coerceString(row.platform ?? row.store ?? row.shop ?? row.source) ?? 'PC';

  const price = formatEuro(row.price ?? row.current_price ?? row.sale_price);
  const oldPrice = formatEuro(row.old_price ?? row.original_price ?? row.full_price ?? row.price_before);
  let discount = formatDiscount(row.discount ?? row.discount_percent ?? row.promo ?? row.reduction);
  if (discount === '—' || discount === '-0%' || discount.trim() === '') {
    const computed = computeDiscountFromPrices(price, oldPrice);
    if (computed) discount = computed;
  }

  const steamAppId = coerceNumber(row.steam_app_id ?? row.steamAppId ?? row.appid ?? row.steam_id) ?? 0;
  const rawCover =
    coerceString(row.cover_image ?? row.coverImage ?? row.image_cover ?? row.image ?? row.image_url ?? row.hero_image_url ?? row.heroImageUrl ?? row.cover) ?? '';
  const rawHero = coerceString(row.hero_image ?? row.hero_image_url ?? row.heroImage ?? row.heroImageUrl ?? row.banner ?? row.hero ?? row.image ?? row.image_url) ?? '';
  const coverImage = rawCover || rawHero;
  const heroImage = rawHero || rawCover;

  const description = coerceString(row.description ?? row.summary ?? row.about ?? row.short_description) ?? '';

  // Priorité aux dates officielles du jeu si elles existent
  const releaseDate = toIsoDateString(
    row.official_release_date ?? row.game_release_date ?? row.original_release_date ??
    row.release_date ?? row.released_at ?? row.releaseDate ?? row.release
  );
  const lastUpdate = toIsoDateString(
    row.official_last_update ?? row.game_last_update ?? row.last_major_update ??
    row.last_update ?? row.updated_at ?? row.lastUpdate ?? row.updatedAt
  );

  const tags = coerceStringArray(row.tags ?? row.user_tags ?? row.genres);
  const rawScreenshots = coerceStringArray(row.screenshots ?? row.extra_images ?? row.images ?? row.gallery);
  const screenshots = rawScreenshots.length
    ? rawScreenshots
    : [heroImage, coverImage].filter((v, i, arr) => Boolean(v) && arr.indexOf(v) === i);

  // Configuration système - chercher plusieurs noms de colonnes possibles
  const minConfig = coerceSystemReq(
    row.min_config ?? row.minConfig ?? row.minimum_requirements ??
    row.pc_requirements_minimum ?? row.system_requirements_minimum ?? row.min_requirements
  );
  const recConfig = coerceSystemReq(
    row.rec_config ?? row.recConfig ?? row.recommended_requirements ??
    row.pc_requirements_recommended ?? row.system_requirements_recommended ?? row.rec_requirements
  );

  const metacriticScore =
    coerceNumber(row.metacritic_score ?? row.metacriticScore ?? row.metacritic ?? row.score_metacritic) ?? null;

  const trailerMp4Url =
    coerceString(row.trailer_mp4_url ?? row.trailerMp4Url ?? row.trailer_mp4 ?? row.video_mp4_url ?? row.video_url ?? row.videoUrl) ??
    '';
  const trailerEmbedUrl =
    coerceString(row.trailer_embed_url ?? row.trailerEmbedUrl ?? row.trailer_iframe_url ?? row.video_embed_url ?? row.video_embed) ??
    '';
  const trailerYoutubeId =
    coerceString(row.trailer_youtube_id ?? row.trailerYoutubeId ?? row.youtube_id ?? row.youtubeId) ?? '';
  const trailerUrl =
    coerceString(row.trailer_url ?? row.trailerUrl ?? row.trailer ?? row.video_url ?? row.videoUrl ?? row.video) ?? '';

  return {
    id,
    slug,
    title,
    platform,
    price,
    oldPrice,
    discount,
    metacriticScore,
    steamAppId,
    coverImage,
    heroImage,
    description,
    releaseDate,
    lastUpdate,
    tags,
    screenshots,
    trailerUrl,
    trailerMp4Url,
    trailerEmbedUrl,
    trailerYoutubeId,
    minConfig,
    recConfig,
  };
}

export async function fetchBotDealBySlug(slug: unknown): Promise<Game | null> {
  const supabase = getPublicSupabaseClient();
  if (typeof slug !== 'string') return null;
  if (!supabase) {
    const normalizedSlug = slug.trim().toLowerCase();
    return games.find((g) => g.slug === normalizedSlug) ?? null;
  }
  const normalizedSlug = slug.trim().toLowerCase();
  const fallback = games.find((g) => g.slug === normalizedSlug) ?? null;

  try {
    const candidates = ['slug', 'game_slug'];
    for (const col of candidates) {
      const { data, error } = await supabase.from('bot_deals').select('*').eq(col, normalizedSlug).limit(5);
      if (!error && Array.isArray(data) && data.length > 0) return mapBotDealToGame(data[0] as BotDealRow);
      if (error && /does not exist|unknown column|column/i.test(error.message)) continue;
      if (error) return fallback;
    }

    const term = normalizedSlug.replace(/-/g, ' ').trim();
    if (term) {
      for (const col of ['title', 'name', 'game_title', 'product_name']) {
        const { data, error } = await supabase.from('bot_deals').select('*').ilike(col, `%${term}%`).limit(50);
        if (!error && Array.isArray(data) && data.length > 0) {
          const match = data
            .map((r) => mapBotDealToGame(r as BotDealRow))
            .find((g) => g.slug === normalizedSlug);
          if (match) return match;
        }
        if (error && /does not exist|unknown column|column/i.test(error.message)) continue;
        if (error) break;
      }
    }

    for (const col of ['last_update', 'updated_at', 'created_at', 'id']) {
      const { data, error } = await supabase.from('bot_deals').select('*').order(col, { ascending: false }).limit(1000);
      if (!error && Array.isArray(data) && data.length > 0) {
        const match = data
          .map((r) => mapBotDealToGame(r as BotDealRow))
          .find((g) => g.slug === normalizedSlug);
        if (match) return match;
      }
      if (error && /does not exist|unknown column|column/i.test(error.message)) continue;
      if (error) break;
    }

    const { data, error } = await supabase.from('bot_deals').select('*').limit(1000);
    if (!error && Array.isArray(data) && data.length > 0) {
      const match = data.map((r) => mapBotDealToGame(r as BotDealRow)).find((g) => g.slug === normalizedSlug);
      if (match) return match;
    }

    return fallback;
  } catch {
    return fallback;
  }
}

export async function fetchBotDealsPage({
  page,
  pageSize,
  preferOrderColumns,
  preferOrderAscending = false,
}: {
  page: number;
  pageSize: number;
  preferOrderColumns?: string[];
  preferOrderAscending?: boolean;
}): Promise<{ games: Game[]; total: number }> {
  const supabase = getPublicSupabaseClient();
  const from = Math.max(0, (page - 1) * pageSize);
  const to = from + pageSize - 1;
  if (!supabase) {
    return { games: games.slice(from, to + 1), total: games.length };
  }

  try {
    const orderColumns = Array.isArray(preferOrderColumns) ? preferOrderColumns : [];
    // Ajouter metacritic_score comme critère de tri prioritaire si non spécifié
    const defaultSorts = ['metacritic_score', 'last_update', 'created_at'];
    const columnsToSort = [...orderColumns, ...defaultSorts].filter(Boolean);

    for (const column of columnsToSort) {
      const { data, error, count } = await supabase
        .from('bot_deals')
        .select('*', { count: 'exact' })
        .order(column, { ascending: preferOrderAscending })
        .range(from, to);
      if (!error) {
        if ((count ?? 0) <= 0 || (data ?? []).length === 0) {
          return { games: games.slice(from, to + 1), total: games.length };
        }
        return { games: (data ?? []).map((r) => mapBotDealToGame(r as BotDealRow)), total: count ?? 0 };
      }
      if (!/does not exist|unknown column|column/i.test(error.message)) break;
    }

    const { data, error, count } = await supabase.from('bot_deals').select('*', { count: 'exact' }).range(from, to);
    if (error) throw error;
    if ((count ?? 0) <= 0 || (data ?? []).length === 0) {
      return { games: games.slice(from, to + 1), total: games.length };
    }
    return { games: (data ?? []).map((r) => mapBotDealToGame(r as BotDealRow)), total: count ?? 0 };
  } catch {
    return { games: games.slice(from, to + 1), total: games.length };
  }
}

export async function fetchSimilarBotDeals(game: Game, limit: number): Promise<Game[]> {
  const supabase = getPublicSupabaseClient();
  const tags = Array.isArray(game.tags) ? game.tags.filter(Boolean) : [];
  if (!supabase) {
    const candidates = tags.length
      ? games.filter((g) => g.slug !== game.slug && g.tags.some((t) => tags.includes(t)))
      : games.filter((g) => g.slug !== game.slug);
    return candidates.slice(0, limit);
  }

  try {
    if (tags.length > 0) {
      const { data, error } = await supabase
        .from('bot_deals')
        .select('*')
        .neq('slug', game.slug)
        .overlaps('tags', tags)
        .limit(limit);
      if (!error) return (data ?? []).map((r) => mapBotDealToGame(r as BotDealRow));
      if (!/does not exist|unknown column|column/i.test(error.message)) throw error;
    }

    const { data, error } = await supabase.from('bot_deals').select('*').neq('slug', game.slug).limit(limit);
    if (error) throw error;
    return (data ?? []).map((r) => mapBotDealToGame(r as BotDealRow));
  } catch {
    const candidates = tags.length
      ? games.filter((g) => g.slug !== game.slug && g.tags.some((t) => tags.includes(t)))
      : games.filter((g) => g.slug !== game.slug);
    return candidates.slice(0, limit);
  }
}

export const games: Game[] = [
  {
    id: 1,
    slug: 'palworld',
    title: 'Palworld',
    platform: 'Steam',
    price: '23.99€',
    oldPrice: '29.99€',
    discount: '-20%',
    steamAppId: 1623730,
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1623730/library_600x900_2x.jpg',
    heroImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1623730/library_hero.jpg',
    description:
      "Dans Palworld, explorez un monde ouvert où vous pouvez capturer des créatures, construire des bases et optimiser vos ressources. Entre survie, crafting, exploration et combats, le jeu propose une boucle de progression moderne et addictive, idéale pour une expérience solo ou coop.",
    releaseDate: '2024-01-19',
    lastUpdate: '2025-12-12',
    tags: ['Survie', 'Open World', 'Craft', 'Coop'],
    screenshots: ['https://cdn.cloudflare.steamstatic.com/steam/apps/1623730/library_hero.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1623730/header.jpg'],
    minConfig: {
      os: 'Windows 10 or later (64-Bit)',
      processor: 'i5-3570K 3.4 GHz 4 Core',
      memory: '16 GB RAM',
      graphics: 'GeForce GTX 1050 (2GB)',
      storage: '40 GB available space',
      additional: 'Internet connection required for multiplayer.',
    },
    recConfig: {
      os: 'Windows 10 or later (64-Bit)',
      processor: 'i9-9900K 3.6 GHz 8 Core',
      memory: '32 GB RAM',
      graphics: 'GeForce RTX 2070',
      storage: '40 GB available space',
    },
  },
  {
    id: 2,
    slug: 'helldivers-2',
    title: 'Helldivers 2',
    platform: 'Steam',
    price: '31.99€',
    oldPrice: '39.99€',
    discount: '-20%',
    steamAppId: 553850,
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/553850/library_600x900_2x.jpg',
    heroImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/553850/library_hero.jpg',
    description:
      "Helldivers 2 mise sur l’action coopérative et la coordination d’escouade. Choisissez votre équipement, enchaînez les missions et adaptez vos stratégies face à des menaces variées, dans une mise en scène explosive et très lisible.",
    releaseDate: '2024-02-08',
    lastUpdate: '2025-11-03',
    tags: ['Coop', 'Action', 'Shooter', 'Escouade'],
    screenshots: ['https://cdn.cloudflare.steamstatic.com/steam/apps/553850/library_hero.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/553850/header.jpg'],
  },
  {
    id: 3,
    slug: 'baldurs-gate-3',
    title: "Baldur's Gate 3",
    platform: 'Steam',
    price: '47.99€',
    oldPrice: '59.99€',
    discount: '-20%',
    steamAppId: 1086940,
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/library_600x900_2x.jpg',
    heroImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/library_hero.jpg',
    description:
      "Un RPG narratif d’exception où vos choix façonnent le monde. Composez votre groupe, explorez librement, et profitez de combats tactiques profonds inspirés de D&D, le tout porté par une réalisation haut de gamme.",
    releaseDate: '2023-08-03',
    lastUpdate: '2025-10-18',
    tags: ['RPG', 'Narratif', 'Tactique', 'Fantasy'],
    screenshots: ['https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/library_hero.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg'],
  },
  {
    id: 4,
    slug: 'cyberpunk-2077',
    title: 'Cyberpunk 2077',
    platform: 'GOG',
    price: '29.99€',
    oldPrice: '59.99€',
    discount: '-50%',
    steamAppId: 1091500,
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/library_600x900_2x.jpg',
    heroImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/library_hero.jpg',
    description:
      'Découvrez Night City, une mégalopole futuriste dense et verticale. Personnalisez votre build, enchaînez les quêtes et plongez dans une histoire sombre, portée par un monde ouvert riche et une direction artistique iconique.',
    releaseDate: '2020-12-10',
    lastUpdate: '2025-09-06',
    tags: ['Open World', 'RPG', 'Sci-Fi', 'Action'],
    screenshots: ['https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/library_hero.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg'],
    minConfig: {
      os: 'Windows 10',
      processor: 'Core i7-6700 or Ryzen 5 1600',
      memory: '12 GB RAM',
      graphics: 'GeForce GTX 1060 6GB or Radeon RX 580 8GB',
      storage: '70 GB available space',
      additional: 'SSD recommended',
    },
    recConfig: {
      os: 'Windows 10',
      processor: 'Core i7-12700 or Ryzen 7 7800X3D',
      memory: '16 GB RAM',
      graphics: 'GeForce RTX 2060 SUPER or Radeon RX 5700 XT',
      storage: '70 GB available space',
      additional: 'SSD required',
    },
  },
  {
    id: 5,
    slug: 'ea-sports-fc-24',
    title: 'EA SPORTS FC™ 24',
    platform: 'EA App',
    price: '19.99€',
    oldPrice: '69.99€',
    discount: '-71%',
    steamAppId: 2195250,
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2195250/library_600x900_2x.jpg',
    heroImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2195250/library_hero.jpg',
    description:
      'Le football modernisé : gameplay plus fluide, animations plus naturelles, et progression compétitive. Jouez en ligne, construisez votre équipe et profitez des mises à jour régulières.',
    releaseDate: '2023-09-29',
    lastUpdate: '2025-12-04',
    tags: ['Sport', 'Multijoueur', 'Compétitif'],
    screenshots: ['https://cdn.cloudflare.steamstatic.com/steam/apps/2195250/library_hero.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2195250/header.jpg'],
  },
  {
    id: 6,
    slug: 'hogwarts-legacy',
    title: 'Hogwarts Legacy',
    platform: 'Steam',
    price: '24.99€',
    oldPrice: '59.99€',
    discount: '-58%',
    steamAppId: 990080,
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/990080/library_600x900_2x.jpg',
    heroImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/990080/library_hero.jpg',
    description:
      "Explorez Poudlard et ses environs dans un RPG d’action. Apprenez des sorts, améliorez votre équipement et vivez une aventure originale dans l’univers magique le plus célèbre.",
    releaseDate: '2023-02-10',
    lastUpdate: '2025-08-21',
    tags: ['RPG', 'Action', 'Open World', 'Fantasy'],
    screenshots: ['https://cdn.cloudflare.steamstatic.com/steam/apps/990080/library_hero.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/990080/header.jpg'],
  },
  {
    id: 7,
    slug: 'elden-ring',
    title: 'Elden Ring',
    platform: 'Steam',
    price: '35.99€',
    oldPrice: '59.99€',
    discount: '-40%',
    steamAppId: 1245620,
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_600x900_2x.jpg',
    heroImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_hero.jpg',
    description:
      "Un monde ouvert exigeant et fascinant. Explorez librement, découvrez des donjons et bosses mémorables, et construisez votre style de jeu avec une grande liberté.",
    releaseDate: '2022-02-25',
    lastUpdate: '2025-11-19',
    tags: ['Action', 'RPG', 'Open World', 'Soulslike'],
    screenshots: ['https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_hero.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg'],
  },
  {
    id: 8,
    slug: 'red-dead-redemption-2',
    title: 'Red Dead Redemption 2',
    platform: 'Rockstar',
    price: '18.99€',
    oldPrice: '59.99€',
    discount: '-68%',
    steamAppId: 1174180,
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/library_600x900_2x.jpg',
    heroImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/library_hero.jpg',
    description:
      "Un western cinématographique au rythme maîtrisé. Une narration forte, un monde vivant et une immersion rare, entre missions, exploration et activités annexes.",
    releaseDate: '2019-12-05',
    lastUpdate: '2025-07-14',
    tags: ['Open World', 'Aventure', 'Narratif'],
    screenshots: ['https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/library_hero.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg'],
  },
  {
    id: 9,
    slug: 'forza-horizon-5',
    title: 'Forza Horizon 5',
    platform: 'Steam',
    price: '29.99€',
    oldPrice: '59.99€',
    discount: '-50%',
    steamAppId: 1551360,
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/library_600x900_2x.jpg',
    heroImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/library_hero.jpg',
    description:
      "Course arcade premium et monde ouvert au Mexique. Collectionnez des voitures, participez à des événements variés et profitez d’un rendu visuel impressionnant.",
    releaseDate: '2021-11-09',
    lastUpdate: '2025-10-02',
    tags: ['Course', 'Open World', 'Arcade', 'Multijoueur'],
    screenshots: ['https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/library_hero.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1551360/header.jpg'],
  },
  {
    id: 10,
    slug: 'god-of-war-ragnarok',
    title: 'God of War Ragnarök',
    platform: 'Steam',
    price: '49.99€',
    oldPrice: '79.99€',
    discount: '-37%',
    steamAppId: 2322010,
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2322010/library_600x900_2x.jpg',
    heroImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2322010/library_hero.jpg',
    description:
      "Un action-aventure nerveux et cinématographique. Combats intenses, narration forte et exploration des royaumes nordiques avec une mise en scène exemplaire.",
    releaseDate: '2022-11-09',
    lastUpdate: '2025-06-20',
    tags: ['Action', 'Aventure', 'Narratif'],
    screenshots: ['https://cdn.cloudflare.steamstatic.com/steam/apps/2322010/library_hero.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/2322010/header.jpg'],
  },
  {
    id: 11,
    slug: 'the-sims-4',
    title: 'The Sims™ 4',
    platform: 'EA App',
    price: '0.00€',
    oldPrice: '19.99€',
    discount: '-100%',
    steamAppId: 1222670,
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1222670/library_600x900_2x.jpg',
    heroImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1222670/library_hero.jpg',
    description:
      "Créez vos Sims, construisez, personnalisez et faites évoluer des histoires du quotidien. Un sandbox social complet, enrichi de contenus additionnels et de mises à jour régulières.",
    releaseDate: '2014-09-02',
    lastUpdate: '2025-12-08',
    tags: ['Simulation', 'Sandbox', 'Créatif'],
    screenshots: ['https://cdn.cloudflare.steamstatic.com/steam/apps/1222670/library_hero.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1222670/header.jpg'],
  },
  {
    id: 12,
    slug: 'grand-theft-auto-v',
    title: 'Grand Theft Auto V',
    platform: 'Rockstar',
    price: '9.99€',
    oldPrice: '29.99€',
    discount: '-66%',
    steamAppId: 271590,
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/library_600x900_2x.jpg',
    heroImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/library_hero.jpg',
    description:
      'Un open world ultra dense mêlant histoire, action et liberté. Alternez entre trois protagonistes, explorez Los Santos et profitez aussi du contenu en ligne.',
    releaseDate: '2015-04-14',
    lastUpdate: '2025-05-28',
    tags: ['Action', 'Open World', 'Sandbox'],
    screenshots: ['https://cdn.cloudflare.steamstatic.com/steam/apps/271590/library_hero.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg'],
  },
  {
    id: 13,
    slug: 'monster-hunter-world',
    title: 'Monster Hunter: World',
    platform: 'Steam',
    price: '9.89€',
    oldPrice: '29.99€',
    discount: '-67%',
    steamAppId: 582010,
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/582010/library_600x900_2x.jpg',
    heroImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/582010/library_hero.jpg',
    description:
      "Chasse coop, craft et progression. Apprenez les patterns des monstres, améliorez votre équipement et partez à l’assaut de créatures impressionnantes.",
    releaseDate: '2018-08-09',
    lastUpdate: '2025-04-11',
    tags: ['Action', 'Coop', 'RPG', 'Chasse'],
    screenshots: ['https://cdn.cloudflare.steamstatic.com/steam/apps/582010/library_hero.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/582010/header.jpg'],
  },
  {
    id: 14,
    slug: 'the-witcher-3',
    title: 'The Witcher 3: Wild Hunt',
    platform: 'GOG',
    price: '7.99€',
    oldPrice: '39.99€',
    discount: '-80%',
    steamAppId: 292030,
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/library_600x900_2x.jpg',
    heroImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/library_hero.jpg',
    description:
      "Un RPG open world culte. Quêtes secondaires mémorables, combats, progression et un univers dark fantasy riche en personnages marquants.",
    releaseDate: '2015-05-18',
    lastUpdate: '2025-03-02',
    tags: ['RPG', 'Open World', 'Narratif', 'Fantasy'],
    screenshots: ['https://cdn.cloudflare.steamstatic.com/steam/apps/292030/library_hero.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg'],
  },
  {
    id: 15,
    slug: 'stardew-valley',
    title: 'Stardew Valley',
    platform: 'Steam',
    price: '8.99€',
    oldPrice: '13.99€',
    discount: '-36%',
    steamAppId: 413150,
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/library_600x900_2x.jpg',
    heroImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/library_hero.jpg',
    description:
      "Gérez votre ferme, explorez des mines et développez votre village. Un jeu cosy à la progression gratifiante, parfait pour jouer à son rythme.",
    releaseDate: '2016-02-26',
    lastUpdate: '2025-02-15',
    tags: ['Simulation', 'Cozy', 'Gestion', 'Indé'],
    screenshots: ['https://cdn.cloudflare.steamstatic.com/steam/apps/413150/library_hero.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg'],
  },
];

export const trendingGames = games;

export function getGameBySlug(slug: string) {
  return games.find((g) => g.slug === slug);
}

export function getSimilarGames(game: Game, limit: number) {
  const tagSet = new Set(game.tags);
  return games
    .filter((g) => g.slug !== game.slug)
    .map((g) => ({ game: g, score: g.tags.reduce((acc, t) => acc + (tagSet.has(t) ? 1 : 0), 0) }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.game)
    .slice(0, limit);
}
