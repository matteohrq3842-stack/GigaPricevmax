'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSearch, FaClock, FaTag, FaFilter, FaSortAmountDown, FaChevronDown } from 'react-icons/fa';
import { games as mockGames, mapBotDealToGame } from '@/data/games';
import { useAuth } from '@/components/providers/SessionProvider';
import PageLoader from '@/components/loaders/PageLoader';

const FALLBACK_IMAGE_SRC = '/images/GigaPrice.jpg';

function isValidImageSrc(src: unknown): src is string {
  if (typeof src !== 'string') return false;
  const s = src.trim();
  if (!s) return false;
  if (s === 'null' || s === 'undefined') return false;
  return s.startsWith('https://') || s.startsWith('http://') || s.startsWith('/');
}

function isVideoFile(url: string) {
  return /\.(mp4|webm|ogg)(\?|#|$)/i.test(url);
}

function getYoutubeIdFromUrl(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{6,})/);
  return match?.[1] ?? '';
}

function withAutoplay(url: string, youtubeId?: string) {
  if (!url) return '';
  const sep = url.includes('?') ? '&' : '?';
  const loop = youtubeId ? `&loop=1&playlist=${youtubeId}` : '';
  return `${url}${sep}autoplay=1&mute=1&muted=1&controls=0&playsinline=1${loop}`;
}

function getPromoTrailerPreview(promo: Offer) {
  const mp4Candidate = [promo.trailerMp4Url, promo.trailerUrl].find((value) => value && isVideoFile(value));
  if (mp4Candidate) return { type: 'mp4' as const, src: mp4Candidate };

  if (promo.trailerEmbedUrl) {
    const embedId = getYoutubeIdFromUrl(promo.trailerEmbedUrl) || promo.trailerYoutubeId || undefined;
    return { type: 'embed' as const, src: withAutoplay(promo.trailerEmbedUrl, embedId) };
  }

  const youtubeId = promo.trailerYoutubeId || (promo.trailerUrl ? getYoutubeIdFromUrl(promo.trailerUrl) : '');
  if (youtubeId) {
    return {
      type: 'embed' as const,
      src: withAutoplay(`https://www.youtube-nocookie.com/embed/${youtubeId}`, youtubeId),
    };
  }

  if (promo.trailerUrl) {
    const embedId = getYoutubeIdFromUrl(promo.trailerUrl) || undefined;
    return { type: 'embed' as const, src: withAutoplay(promo.trailerUrl, embedId) };
  }

  return null;
}

type Offer = {
  id: number;
  slug: string;
  name: string;
  price: string;
  oldPrice: string;
  platform: string;
  discount: string;
  category: string;
  imageUrl: string;
  hot: boolean;
  trailerUrl?: string;
  trailerMp4Url?: string;
  trailerEmbedUrl?: string;
  trailerYoutubeId?: string;
};

const categories = ['Tout', 'Action', 'RPG', 'Open World', 'Coop', 'Simulation', 'Sport', 'Course', 'Narratif'];

type DropdownOption = { value: string; label: string };

function normalizePlatform(value: string) {
  return value.trim().toLowerCase();
}

function inferDevicePlatform(storeOrPlatform: string): string {
  const value = normalizePlatform(storeOrPlatform);
  if (value.includes('playstation') || value.includes('ps')) return 'PlayStation';
  if (value.includes('xbox')) return 'Xbox';
  if (value.includes('switch') || value.includes('nintendo')) return 'Switch';
  return 'PC';
}

function buildPageList(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, 5, total];
  if (current >= total - 2) return [1, total - 4, total - 3, total - 2, total - 1, total];
  return [1, current - 1, current, current + 1, total];
}

function Dropdown({
  label,
  icon,
  value,
  options,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      const root = rootRef.current;
      if (!root) return;
      if (root.contains(e.target as Node)) return;
      setOpen(false);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <div className="promo-dropdown" ref={rootRef}>
      <div className="promo-dropdown-label">{label}</div>
      <button
        ref={buttonRef}
        type="button"
        className={`promo-dropdown-button ${open ? 'open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="promo-dropdown-left">
          <span className="promo-dropdown-icon">{icon}</span>
          <span className="promo-dropdown-value">{selectedLabel}</span>
        </span>
        <span className="promo-dropdown-caret">
          <FaChevronDown />
        </span>
      </button>

      {open ? (
        <div className="promo-dropdown-menu" role="listbox" aria-label={label}>
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={active}
                className={`promo-dropdown-item ${active ? 'active' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function PromoCard({ promo }: { promo: Offer }) {
  const safeInitialSrc = isValidImageSrc(promo.imageUrl) ? promo.imageUrl : FALLBACK_IMAGE_SRC;
  const [imgSrc, setImgSrc] = useState<string>(safeInitialSrc);
  const [isHovering, setIsHovering] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const preview = getPromoTrailerPreview(promo);
  const hasVideo = Boolean(preview);

  useEffect(() => {
    setImgSrc(safeInitialSrc);
  }, [safeInitialSrc]);

  const showVideo = hasVideo && !videoError;

  return (
    <Link
      href={`/jeux?slug=${encodeURIComponent(promo.slug)}`}
      className={`promo-card ${showVideo ? 'has-hover-video' : ''}`}
      style={{ textDecoration: 'none' }}
      onMouseEnter={() => {
        setIsHovering(true);
        if (preview?.type === 'mp4' && videoRef.current && !videoError) {
          videoRef.current.muted = true;
          videoRef.current.currentTime = 0;
          const playPromise = videoRef.current.play();
          if (playPromise) playPromise.catch(() => { });
        }
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        if (preview?.type === 'mp4' && videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      }}
    >
      {promo.hot && (
        <div className="hot-badge">
          HOT
        </div>
      )}
      <div className="promo-card-image" style={{ position: 'relative', overflow: 'hidden' }}>
        <Image
          src={imgSrc}
          alt={promo.name}
          fill
          sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 370px"
          style={{ objectFit: 'cover' }}
          onError={() => {
            if (imgSrc !== FALLBACK_IMAGE_SRC) setImgSrc(FALLBACK_IMAGE_SRC);
          }}
        />
        {preview?.type === 'mp4' && !videoError ? (
          <video
            ref={videoRef}
            className="promo-card-video"
            muted
            playsInline
            loop
            preload="none"
            src={preview.src}
            onError={() => setVideoError(true)}
          />
        ) : null}
        {preview?.type === 'embed' && isHovering ? (
          <iframe
            className="promo-card-video"
            src={preview.src}
            title={promo.name}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : null}
        <span className="promo-card-platform">{promo.platform}</span>
        <span className="promo-card-discount">{promo.discount}</span>
      </div>

      <div className="promo-card-content">
        <h3 className="promo-card-title" style={{ color: '#fff' }}>{promo.name}</h3>
        <div className="promo-card-footer">
          <div className="price-block">
            <span className="old-price-small">{promo.oldPrice}</span>
            <span className="new-price-large">{promo.price}</span>
          </div>
          <button className="btn-cart-icon">
            <FaTag />
          </button>
        </div>
      </div>
    </Link>
  );
}

function PromotionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tout");
  const [selectedPlatform, setSelectedPlatform] = useState("Tout");
  const [priceSort, setPriceSort] = useState("default");
  const [discountSort, setDiscountSort] = useState("default");

  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [totalCount, setTotalCount] = useState(0);
  const [sourceRows, setSourceRows] = useState<unknown[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const p = Number.parseInt(searchParams.get('page') ?? '1', 10);
    setPage(Number.isFinite(p) && p > 0 ? p : 1);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setFetchError(null);
      try {
        const from = Math.max(0, (page - 1) * pageSize);
        const to = from + pageSize - 1;
        const fallbackRows = mockGames.slice(from, to + 1) as unknown[];
        const { data, error, count } = await supabase
          .from('bot_deals')
          .select('*', { count: 'exact' })
          .order('metacritic_score', { ascending: false, nullsFirst: false })
          .range(from, to);

        if (error && /does not exist|unknown column|column/i.test(error.message)) {
          const retry = await supabase.from('bot_deals').select('*', { count: 'exact' }).range(from, to);
          if (retry.error) throw retry.error;
          if (cancelled) return;
          const rows = retry.data ?? [];
          if (rows.length > 0) {
            setSourceRows(rows);
            setTotalCount(retry.count ?? rows.length);
            setFetchError(null);
          } else {
            setSourceRows(fallbackRows);
            setTotalCount(mockGames.length);
            setFetchError('Aucune donnée Supabase (bot_deals). Affichage maquette.');
          }
          return;
        }

        if (error) throw error;
        if (cancelled) return;
        const rows = data ?? [];
        if (rows.length > 0) {
          setSourceRows(rows);
          setTotalCount(count ?? rows.length);
          setFetchError(null);
        } else {
          setSourceRows(fallbackRows);
          setTotalCount(mockGames.length);
          setFetchError('Aucune donnée Supabase (bot_deals). Affichage maquette.');
        }
      } catch (e: unknown) {
        if (cancelled) return;
        const from = Math.max(0, (page - 1) * pageSize);
        const to = from + pageSize - 1;
        setSourceRows(mockGames.slice(from, to + 1) as unknown[]);
        setTotalCount(mockGames.length);
        const msg = e instanceof Error ? e.message : 'Erreur lors du chargement.';
        setFetchError(`${msg} (affichage maquette).`);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [page, supabase]);

  const promotions: Offer[] = useMemo(() => {
    return sourceRows.map((row, idx) => {
      const g = mapBotDealToGame(row as Record<string, unknown>);
      const discountValue = Number.parseInt(g.discount.replace('%', '').replace('-', ''), 10);
      const hot = Number.isFinite(discountValue) ? discountValue >= 60 : false;
      const category = g.tags.find((t) => categories.includes(t)) ?? g.tags[0] ?? 'Tout';

      return {
        id: g.id || idx,
        slug: g.slug,
        name: g.title,
        price: g.price,
        oldPrice: g.oldPrice,
        platform: g.platform,
        discount: g.discount,
        category,
        imageUrl: g.heroImage,
        hot,
        trailerUrl: g.trailerUrl,
        trailerMp4Url: g.trailerMp4Url,
        trailerEmbedUrl: g.trailerEmbedUrl,
        trailerYoutubeId: g.trailerYoutubeId,
      };
    });
  }, [sourceRows]);

  const platformOptions: DropdownOption[] = useMemo(
    () => [
      { value: 'Tout', label: 'Tout' },
      { value: 'PC', label: 'PC' },
      { value: 'PlayStation', label: 'PlayStation' },
      { value: 'Xbox', label: 'Xbox' },
      { value: 'Switch', label: 'Switch' },
    ],
    []
  );

  const priceOptions: DropdownOption[] = useMemo(
    () => [
      { value: 'default', label: 'Par défaut' },
      { value: 'asc', label: 'Croissant' },
      { value: 'desc', label: 'Décroissant' },
    ],
    []
  );

  const discountOptions: DropdownOption[] = useMemo(
    () => [
      { value: 'default', label: 'Par défaut' },
      { value: 'best', label: 'Meilleure réduction' },
    ],
    []
  );

  const filteredPromotions = useMemo(() => {
    const filtered = promotions.filter(promo => {
      const matchesSearch = promo.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "Tout" || promo.category === selectedCategory;
      const matchesPlatform = selectedPlatform === "Tout" || inferDevicePlatform(promo.platform) === selectedPlatform;
      return matchesSearch && matchesCategory && matchesPlatform;
    });

    const sorted = [...filtered];

    if (discountSort === 'best') {
      sorted.sort((a, b) => {
        const discountA = parseInt(a.discount.replace('-', '').replace('%', ''), 10);
        const discountB = parseInt(b.discount.replace('-', '').replace('%', ''), 10);
        return discountB - discountA;
      });
      return sorted;
    }

    if (priceSort === 'asc') {
      sorted.sort((a, b) => {
        const priceA = parseFloat(a.price.replace('€', '').replace(',', '.'));
        const priceB = parseFloat(b.price.replace('€', '').replace(',', '.'));
        return priceA - priceB;
      });
    } else if (priceSort === 'desc') {
      sorted.sort((a, b) => {
        const priceA = parseFloat(a.price.replace('€', '').replace(',', '.'));
        const priceB = parseFloat(b.price.replace('€', '').replace(',', '.'));
        return priceB - priceA;
      });
    }

    return sorted;
  }, [promotions, searchTerm, selectedCategory, selectedPlatform, priceSort, discountSort]);

  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));
  const pages = useMemo(() => buildPageList(page, totalPages), [page, totalPages]);
  const goToPage = (p: number) => {
    const next = Math.max(1, Math.min(totalPages, p));
    router.push(`/promotions?page=${next}`);
  };

  const featuredPromo: Offer | null = useMemo(() => {
    const primaryList = promotions
      .filter((p) => p.slug !== 'baldurs-gate-3')
      .filter((p) => Boolean(p.imageUrl));
    const pick =
      primaryList.find((p) => p.hot) ??
      primaryList[0] ??
      promotions.find((p) => p.slug !== 'baldurs-gate-3') ??
      promotions[0] ??
      null;
    if (pick) return pick;

    const fallbackGame = mockGames.find((g) => g.slug !== 'baldurs-gate-3') ?? mockGames[0] ?? null;
    if (!fallbackGame) return null;
    return {
      id: fallbackGame.id,
      slug: fallbackGame.slug,
      name: fallbackGame.title,
      price: fallbackGame.price,
      oldPrice: fallbackGame.oldPrice,
      platform: fallbackGame.platform,
      discount: fallbackGame.discount,
      category: fallbackGame.tags[0] ?? 'Tout',
      imageUrl: fallbackGame.heroImage,
      hot: true,
    };
  }, [promotions]);

  const featuredInitialSrc = featuredPromo && isValidImageSrc(featuredPromo.imageUrl) ? featuredPromo.imageUrl : FALLBACK_IMAGE_SRC;
  const [featuredImgSrc, setFeaturedImgSrc] = useState<string>(featuredInitialSrc);
  const featuredPreview = featuredPromo ? getPromoTrailerPreview(featuredPromo) : null;
  const featuredHasVideo = Boolean(featuredPreview);
  const featuredVideoRef = useRef<HTMLVideoElement>(null);
  const [isFeaturedHovering, setIsFeaturedHovering] = useState(false);

  useEffect(() => {
    setFeaturedImgSrc(featuredInitialSrc);
  }, [featuredInitialSrc]);

  return (
    <main style={{ paddingBottom: '80px', paddingTop: '160px' }}>
      {isLoading ? <PageLoader text="Promotions en cours de chargement..." /> : null}
      {/* Hero Banner Spécial Promo */}
      <section className="promo-hero">
        <div className="promo-hero-content">
          <span className="promo-badge-large">OFFRES DU MOMENT</span>
          <h1 className="promo-hero-title">{featuredPromo?.name}</h1>
          <p className="promo-hero-desc">
            Sélection de promotions en cours. Cliquez sur un jeu pour accéder à sa page détail.
          </p>
          <div className="promo-hero-price">
            <span className="current">{featuredPromo?.price}</span>
            <span className="old">{featuredPromo?.oldPrice}</span>
            <span className="discount">{featuredPromo?.discount}</span>
          </div>
          <div className="promo-hero-timer">
            <FaClock /> Fin de l&apos;offre dans : 08h 45m 12s
          </div>
          {featuredPromo ? (
            <Link href={`/jeux?slug=${encodeURIComponent(featuredPromo.slug)}`} className="btn-hero-action" style={{ textDecoration: 'none' }}>
              Voir le détail
            </Link>
          ) : null}
        </div>
        <div className="promo-hero-image">
          {featuredPromo ? (
            <Link
              href={`/jeux?slug=${encodeURIComponent(featuredPromo.slug)}`}
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                borderRadius: '20px',
                overflow: 'hidden',
                display: 'block',
                textDecoration: 'none',
              }}
              aria-label={`Voir le détail de ${featuredPromo.name}`}
              onMouseEnter={() => {
                setIsFeaturedHovering(true);
                if (featuredPreview?.type === 'mp4' && featuredVideoRef.current) {
                  featuredVideoRef.current.muted = true;
                  featuredVideoRef.current.currentTime = 0;
                  const playPromise = featuredVideoRef.current.play();
                  if (playPromise) playPromise.catch(() => { });
                }
              }}
              onMouseLeave={() => {
                setIsFeaturedHovering(false);
                if (featuredPreview?.type === 'mp4' && featuredVideoRef.current) {
                  featuredVideoRef.current.pause();
                  featuredVideoRef.current.currentTime = 0;
                }
              }}
            >
              <Image
                src={featuredImgSrc}
                alt={featuredPromo.name}
                fill
                sizes="(max-width: 900px) 100vw, 50vw"
                style={{
                  objectFit: 'cover',
                  opacity: featuredHasVideo && isFeaturedHovering ? 0 : 1,
                  transition: 'opacity 180ms ease',
                }}
                onError={() => {
                  if (featuredImgSrc !== FALLBACK_IMAGE_SRC) setFeaturedImgSrc(FALLBACK_IMAGE_SRC);
                }}
              />
              {featuredPreview?.type === 'mp4' ? (
                <video
                  ref={featuredVideoRef}
                  muted
                  playsInline
                  loop
                  preload="none"
                  src={featuredPreview.src}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: isFeaturedHovering ? 1 : 0,
                    transition: 'opacity 180ms ease',
                    pointerEvents: 'none',
                  }}
                />
              ) : null}
              {featuredPreview?.type === 'embed' && isFeaturedHovering ? (
                <iframe
                  src={featuredPreview.src}
                  title={featuredPromo.name}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    border: 0,
                    opacity: 1,
                    pointerEvents: 'none',
                    transform: 'scale(1.2)',
                    transformOrigin: 'center',
                  }}
                />
              ) : null}
            </Link>
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(45deg, #C8A050, #3C2A10)',
                borderRadius: '20px',
              }}
            />
          )}
        </div>
      </section>

      <div className="promo-filter-bar">
        <div className="promo-filter-card">
          <div className="promo-filter-header">
            <div className="promo-filter-heading">
              <div className="promo-filter-title">Affiner les promotions</div>
              <div className="promo-filter-subtitle">Recherchez puis filtrez par plateforme, prix, réduction et catégorie.</div>
            </div>
            <div className="promo-filter-count">
              {filteredPromotions.length} offre{filteredPromotions.length > 1 ? 's' : ''}
            </div>
          </div>

          {fetchError ? <div className="promo-fetch-error">{fetchError}</div> : null}

          <div className="promo-filter-controls">
            <div className="search-bar-modern promo-search">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher un jeu, une franchise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="promo-filter-selects">
              <Dropdown
                label="Plateforme"
                icon={<FaFilter />}
                value={selectedPlatform}
                options={platformOptions}
                onChange={(v) => setSelectedPlatform(v)}
              />
              <Dropdown
                label="Prix"
                icon={<FaSortAmountDown />}
                value={priceSort}
                options={priceOptions}
                onChange={(v) => setPriceSort(v)}
              />
              <Dropdown
                label="Réduction"
                icon={<FaTag />}
                value={discountSort}
                options={discountOptions}
                onChange={(v) => setDiscountSort(v)}
              />
            </div>
          </div>

          <div className="category-chips promo-filter-chips">
            {categories.map(cat => (
              <button
                key={cat}
                className={`chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
                type="button"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grille de Promotions */}
      <div className="promo-grid-container">
        <h2 className="section-title-modern">Offres populaires</h2>

        <div className="promo-grid">
          {filteredPromotions.map((promo) => (
            <PromoCard key={promo.id} promo={promo} />
          ))}
        </div>
      </div>

      <div className="pagination-wrap">
        <div className="pagination-bar" role="navigation" aria-label="Pagination">
          <button
            type="button"
            className={`pagination-link ${page <= 1 ? 'disabled' : ''}`}
            onClick={() => goToPage(1)}
            disabled={page <= 1}
          >
            «
          </button>
          <button
            type="button"
            className={`pagination-link ${page <= 1 ? 'disabled' : ''}`}
            onClick={() => goToPage(page - 1)}
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
                  className={`pagination-link ${p === page ? 'active' : ''}`}
                  onClick={() => goToPage(p)}
                >
                  {p}
                </button>
              </span>
            );
          })}

          <button
            type="button"
            className={`pagination-link ${page >= totalPages ? 'disabled' : ''}`}
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
          >
            ›
          </button>
          <button
            type="button"
            className={`pagination-link ${page >= totalPages ? 'disabled' : ''}`}
            onClick={() => goToPage(totalPages)}
            disabled={page >= totalPages}
          >
            »
          </button>
        </div>
      </div>
    </main>
  );
}

export default function PromotionsPage() {
  return (
    <Suspense fallback={<PageLoader text="Promotions en cours de chargement..." />}>
      <PromotionsContent />
    </Suspense>
  );
}
