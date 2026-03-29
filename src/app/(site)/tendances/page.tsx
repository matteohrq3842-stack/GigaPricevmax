'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GameCardGrid from '@/components/content/GameCardGrid';
import { games as fallbackGames, mapBotDealToGame, type Game } from '@/data/games';
import { useAuth } from '@/components/providers/SessionProvider';

function clampPage(value: number, totalPages: number) {
  if (!Number.isFinite(value) || value < 1) return 1;
  if (totalPages > 0 && value > totalPages) return totalPages;
  return value;
}

function buildPageList(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, 5, total];
  if (current >= total - 2) return [1, total - 4, total - 3, total - 2, total - 1, total];
  return [1, current - 1, current, current + 1, total];
}

function getErrorMessage(err: unknown) {
  if (!err) return '';
  if (typeof err === 'string') return err;
  if (typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  return '';
}

export default function TendancesPage() {
  return (
    <Suspense fallback={<main style={{ paddingBottom: '80px', paddingTop: '160px' }} />}>
      <TendancesInner />
    </Suspense>
  );
}

function TendancesInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase } = useAuth();

  const pageSize = 20;
  const requestedPage = useMemo(() => {
    const raw = searchParams.get('page') ?? '1';
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [searchParams]);

  const [games, setGames] = useState<Game[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchPage() {
      setLoading(true);
      setError(null);
      try {
        const from = (requestedPage - 1) * pageSize;
        const to = from + pageSize - 1;
        const orderCandidates = ['metacritic_score', 'last_update', 'updated_at', 'created_at', 'id'];

        let rows: unknown[] = [];
        let count = 0;

        for (const column of orderCandidates) {
          const orderOptions =
            column === 'metacritic_score'
              ? ({ ascending: false, nullsFirst: false } as const)
              : ({ ascending: false } as const);

          const { data, error, count: totalCount } = await supabase
            .from('bot_deals')
            .select('*', { count: 'exact' })
            .order(column, orderOptions)
            .range(from, to);

          if (!error) {
            rows = data ?? [];
            count = totalCount ?? 0;
            break;
          }

          if (!/does not exist|unknown column|column/i.test(error.message)) {
            throw error;
          }
        }

        if (rows.length === 0) {
          const { data, error, count: totalCount } = await supabase
            .from('bot_deals')
            .select('*', { count: 'exact' })
            .range(from, to);
          if (error) throw error;
          rows = data ?? [];
          count = totalCount ?? 0;
        }

        if (cancelled) return;
        if (count <= 0 || rows.length === 0) {
          setGames(fallbackGames.slice(from, to + 1));
          setTotal(fallbackGames.length);
        } else {
          setGames(rows.map((r) => mapBotDealToGame(r as Record<string, unknown>)));
          setTotal(count);
        }
      } catch (err) {
        if (cancelled) return;
        const msg = getErrorMessage(err);
        setError(msg || 'Impossible de charger les tendances.');
        setGames(fallbackGames.slice(0, pageSize));
        setTotal(fallbackGames.length);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPage();
    return () => {
      cancelled = true;
    };
  }, [pageSize, requestedPage, supabase]);

  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));
  const page = clampPage(requestedPage, totalPages);
  const pages = useMemo(() => buildPageList(page, totalPages), [page, totalPages]);

  const goToPage = (p: number) => {
    const next = Math.max(1, Math.min(totalPages, p));
    router.push(`/tendances?page=${next}`);
  };

  return (
    <main style={{ paddingBottom: '80px', paddingTop: '160px' }}>
      <section className="suggestions-header">
        <h2>Tendances</h2>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-purple-200/70">Chargement…</div>
      ) : error ? (
        <div className="flex items-center justify-center py-16 text-red-400">{error}</div>
      ) : (
        <GameCardGrid games={games} gridClassName="cards-container trending-grid" />
      )}

      <div className="pagination-wrap">
        <div className="pagination-bar" role="navigation" aria-label="Pagination">
          <button
            type="button"
            onClick={() => goToPage(1)}
            className={`pagination-link ${page <= 1 ? 'disabled' : ''}`}
            disabled={page <= 1}
          >
            «
          </button>
          <button
            type="button"
            onClick={() => goToPage(Math.max(1, page - 1))}
            className={`pagination-link ${page <= 1 ? 'disabled' : ''}`}
            disabled={page <= 1}
          >
            ‹
          </button>

          {pages.map((p, idx) => {
            const prev = idx > 0 ? pages[idx - 1] : null;
            const showDots = prev !== null && p - prev > 1;
            return (
              <span key={`p-${p}`} className="pagination-group">
                {showDots ? <span className="pagination-dots">…</span> : null}
                <button
                  type="button"
                  onClick={() => goToPage(p)}
                  className={`pagination-link ${p === page ? 'active' : ''}`}
                >
                  {p}
                </button>
              </span>
            );
          })}

          <button
            type="button"
            onClick={() => goToPage(Math.min(totalPages, page + 1))}
            className={`pagination-link ${page >= totalPages ? 'disabled' : ''}`}
            disabled={page >= totalPages}
          >
            ›
          </button>
          <button
            type="button"
            onClick={() => goToPage(totalPages)}
            className={`pagination-link ${page >= totalPages ? 'disabled' : ''}`}
            disabled={page >= totalPages}
          >
            »
          </button>
        </div>
      </div>
    </main>
  );
}
