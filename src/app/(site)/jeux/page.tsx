'use client';

import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import GameCardGrid from '@/components/content/GameCardGrid';
import SafeImage from '@/components/content/SafeImage';
import { fetchSimilarBotDeals, games as fallbackGames, getGameBySlug, mapBotDealToGame, type Game } from '@/data/games';
import { useInterests } from '@/hooks/useInterests';

function normalizeSlug(value: string | null): string {
  if (!value) return '';
  const normalized = decodeURIComponent(String(value)).trim().toLowerCase();
  if (!normalized) return '';
  if (normalized === 'index' || normalized === 'index.html' || normalized === 'index.htm' || normalized === 'index.txt') return '';
  const cleaned = normalized.replace(/\.html?$/, '').replace(/\.txt$/, '');
  if (cleaned === 'index') return '';
  return cleaned;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: 'long', day: '2-digit' }).format(d);
}

async function fetchGameBySlug(slug: string): Promise<Game | null> {
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const fallback = getGameBySlug(normalizedSlug) ?? null;

  // 1. First try bot_deals (Supabase) - for games with promotions
  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const candidates = ['slug', 'game_slug', 'catalog_slug'];

    for (const col of candidates) {
      const { data, error } = await supabase.from('bot_deals').select('*').eq(col, normalizedSlug).limit(1);
      if (!error && Array.isArray(data) && data.length > 0) {
        return mapBotDealToGame(data[0] as Record<string, unknown>);
      }
      if (error && /does not exist|unknown column|column/i.test(error.message)) continue;
      if (error) break;
    }

    const term = normalizedSlug.replace(/-/g, ' ').trim();
    if (term) {
      for (const col of ['title', 'name', 'game_title', 'product_name']) {
        const { data, error } = await supabase.from('bot_deals').select('*').ilike(col, `%${term}%`).limit(50);
        if (!error && Array.isArray(data) && data.length > 0) {
          const match = data
            .map((row) => mapBotDealToGame(row as Record<string, unknown>))
            .find((g) => g.slug === normalizedSlug);
          if (match) return match;
        }
        if (error && /does not exist|unknown column|column/i.test(error.message)) continue;
        if (error) break;
      }
    }
  }

  // 2. If not found in bot_deals, try games_catalog via API
  try {
    const res = await fetch(`/api/game-by-slug?slug=${encodeURIComponent(normalizedSlug)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.game) {
        return data.game as Game;
      }
    }
  } catch {
    console.error('Failed to fetch from games_catalog');
  }

  return fallback;
}

export default function JeuxPage() {
  return (
    <Suspense fallback={<main style={{ paddingTop: '160px', paddingBottom: '80px' }} />}>
      <JeuxContent />
    </Suspense>
  );
}

// Basic hook to fetch similar games on the client side
function useSimilarGames(game: Game | null) {
  const [similar, setSimilar] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!game) {
      return;
    }

    let cancelled = false;
    setTimeout(() => setLoading(true), 0);

    fetchSimilarBotDeals(game, 8)
      .then(res => {
        if (!cancelled) setSimilar(res);
      })
      .catch(() => {
        if (!cancelled) setSimilar([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [game]);

  return { similar, loading };
}

function JeuxContent() {
  const searchParams = useSearchParams();
  const slug = useMemo(() => normalizeSlug(searchParams.get('slug')), [searchParams]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(null);

      if (!slug) {
        setGame(null);
        return;
      }

      setLoading(true);
      try {
        const fetched = await fetchGameBySlug(slug);
        if (cancelled) return;
        if (!fetched) {
          setGame(null);
          setError('Jeu introuvable.');
          return;
        }
        setGame(fetched);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement du jeu.');
        setGame(getGameBySlug(slug) ?? null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const { similar } = useSimilarGames(game);
  const { trackGame } = useInterests();

  useEffect(() => {
    if (game && game.tags && game.tags.length > 0) {
      trackGame(game.tags);
    }
  }, [game, trackGame]);

  if (loading && !game) {
    return <main style={{ paddingTop: '160px', paddingBottom: '80px' }} />;
  }

  if (!game) {
    return (
      <main style={{ paddingTop: '160px', paddingBottom: '80px' }}>
        <section className="suggestions-header">
          <h2>Jeu introuvable</h2>
          <p style={{ color: '#777' }}>{error ?? slug}</p>
        </section>
        <GameCardGrid games={fallbackGames.slice(0, 18)} gridClassName="cards-container trending-grid" />
      </main>
    );
  }

  return (
    <main style={{ paddingTop: '120px', paddingBottom: '80px' }}>
      <section className="game-detail-hero">
        <div className="game-detail-hero-bg">
          <SafeImage src={game.heroImage} alt="" fill sizes="100vw" style={{ objectFit: 'cover' }} priority />
          <div className="game-detail-hero-overlay" />
        </div>

        <div className="game-detail-hero-inner">
          <div className="game-detail-hero-grid">
            <div className="game-detail-cover">
              <SafeImage
                src={game.coverImage}
                alt={`Cover ${game.title}`}
                width={600}
                height={900}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                priority
              />
              <div className="game-detail-cover-badges">
                <span className="game-detail-badge">{game.platform}</span>
                <span className="game-detail-badge accent">{game.discount}</span>
              </div>
            </div>

            <div className="game-detail-info">
              <h1 className="game-detail-title">{game.title}</h1>

              <div className="game-detail-meta">
                <div className="game-detail-meta-item">
                  <span className="game-detail-meta-label">Date de sortie</span>
                  <span className="game-detail-meta-value">{formatDate(game.releaseDate)}</span>
                </div>
                <div className="game-detail-meta-item">
                  <span className="game-detail-meta-label">Dernière mise à jour</span>
                  <span className="game-detail-meta-value">{formatDate(game.lastUpdate)}</span>
                </div>
              </div>

              <p className="game-detail-desc">{game.description}</p>

              <div className="game-detail-tags">
                {game.tags.map((t) => (
                  <span key={t} className="game-tag">
                    {t}
                  </span>
                ))}
              </div>

              <div className="game-detail-price-row">
                <div className="game-detail-price">
                  <span className="game-detail-price-current">{game.price}</span>
                  <span className="game-detail-price-old">{game.oldPrice}</span>
                </div>
                <Link href="/tendances" className="game-detail-cta">
                  Voir les tendances
                </Link>
              </div>

              <Link href="/promotions" className="game-detail-secondary">
                Voir les promotions
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="game-detail-section">
        <div className="game-detail-section-header">
          <h2>Images</h2>
        </div>
        <div className="game-detail-gallery">
          {game.screenshots.map((src, i) => (
            <div key={`${game.slug}-${i}`} className="game-detail-shot">
              <SafeImage src={src} alt="" fill sizes="(max-width: 900px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </section>

      {(game.minConfig || game.recConfig) && !['playstation', 'ps4', 'ps5', 'xbox', 'switch', 'nintendo'].some(p => game.platform.toLowerCase().includes(p)) ? (
        <section className="game-detail-section">
          <div className="game-requirements-section">
            <h3 className="game-requirements-title">Configuration système</h3>
            <div className="requirements-grid">
              {game.minConfig ? (
                <div className="req-column">
                  <h4>Minimale</h4>
                  <ul className="req-list">
                    {game.minConfig.os ? <li><strong>OS:</strong> {game.minConfig.os}</li> : null}
                    {game.minConfig.processor ? <li><strong>Processeur:</strong> {game.minConfig.processor}</li> : null}
                    {game.minConfig.memory ? <li><strong>Mémoire:</strong> {game.minConfig.memory}</li> : null}
                    {game.minConfig.graphics ? <li><strong>Graphiques:</strong> {game.minConfig.graphics}</li> : null}
                    {game.minConfig.storage ? <li><strong>Stockage:</strong> {game.minConfig.storage}</li> : null}
                    {game.minConfig.additional ? <li><strong>Autres:</strong> {game.minConfig.additional}</li> : null}
                  </ul>
                </div>
              ) : null}
              {game.recConfig ? (
                <div className="req-column">
                  <h4>Recommandée</h4>
                  <ul className="req-list">
                    {game.recConfig.os ? <li><strong>OS:</strong> {game.recConfig.os}</li> : null}
                    {game.recConfig.processor ? <li><strong>Processeur:</strong> {game.recConfig.processor}</li> : null}
                    {game.recConfig.memory ? <li><strong>Mémoire:</strong> {game.recConfig.memory}</li> : null}
                    {game.recConfig.graphics ? <li><strong>Graphiques:</strong> {game.recConfig.graphics}</li> : null}
                    {game.recConfig.storage ? <li><strong>Stockage:</strong> {game.recConfig.storage}</li> : null}
                    {game.recConfig.additional ? <li><strong>Autres:</strong> {game.recConfig.additional}</li> : null}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="game-detail-section">
        <div className="game-detail-section-header">
          <h2>Jeux similaires</h2>
          <Link href="/tendances" className="game-detail-section-link">
            Tendances <span style={{ opacity: 0.7 }}>›</span>
          </Link>
        </div>
        <GameCardGrid games={similar} gridClassName="cards-container similar-grid" />
      </section>
    </main>
  );
}
