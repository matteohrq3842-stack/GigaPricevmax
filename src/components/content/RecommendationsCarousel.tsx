'use client';

import { useRef, useEffect, useState, useCallback, useMemo, type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import type { Game } from '@/data/games';

type RecommendedGame = Game;

const FALLBACK_IMAGE_SRC = '/images/GigaPrice.jpg';

function isValidImageSrc(src: unknown): src is string {
  if (typeof src !== 'string') return false;
  const s = src.trim();
  if (!s) return false;
  if (s === 'null' || s === 'undefined') return false;
  return s.startsWith('https://') || s.startsWith('http://') || s.startsWith('/');
}

function SafeImage({
  src,
  alt,
  width,
  height,
  className,
  style,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  style?: CSSProperties;
}) {
  const safeInitialSrc = isValidImageSrc(src) ? src : FALLBACK_IMAGE_SRC;
  const [currentSrc, setCurrentSrc] = useState<string>(safeInitialSrc);

  useEffect(() => {
    setCurrentSrc(safeInitialSrc);
  }, [safeInitialSrc]);

  return (
    <Image
      className={className}
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      style={style}
      onError={() => {
        if (currentSrc !== FALLBACK_IMAGE_SRC) setCurrentSrc(FALLBACK_IMAGE_SRC);
      }}
    />
  );
}

function CarouselCard({ game }: { game: RecommendedGame }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [videoError, setVideoError] = useState(false);

  function isVideoFile(url: string) {
    return /\.(mp4|webm|ogg)(\?|#|$)/i.test(url);
  }
  // ... (imports/funcs handled by context or unchanged lines nearby)

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

  const mp4Src = [game.trailerMp4Url, game.trailerUrl].find((v) => v && isVideoFile(v)) || '';
  const youtubeIdFromUrl = game.trailerUrl ? getYoutubeIdFromUrl(game.trailerUrl) : '';
  const embedBase =
    game.trailerEmbedUrl ||
    (game.trailerYoutubeId ? `https://www.youtube-nocookie.com/embed/${game.trailerYoutubeId}` : '') ||
    (youtubeIdFromUrl ? `https://www.youtube-nocookie.com/embed/${youtubeIdFromUrl}` : '') ||
    (game.trailerUrl && !mp4Src ? game.trailerUrl : '');
  const embedId = game.trailerYoutubeId || getYoutubeIdFromUrl(embedBase);
  const embedSrc = isHovering && embedBase && !videoError ? withAutoplay(embedBase, embedId || undefined) : '';

  const hasVideo = Boolean(mp4Src || embedBase);
  const showVideo = hasVideo && !videoError;

  const playPreview = () => {
    if (videoError) return;
    const video = videoRef.current;
    // ...
    if (!video) return;
    video.muted = true;
    video.currentTime = 0;
    const playPromise = video.play();
    if (playPromise) playPromise.catch(() => { });
  };

  const stopPreview = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  return (
    <Link
      href={`/jeux?slug=${encodeURIComponent(game.slug)}`}
      className={`card carousel-card ${showVideo ? 'has-hover-video' : ''}`}
      onMouseEnter={() => {
        setIsHovering(true);
        if (mp4Src && !videoError) playPreview();
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        if (mp4Src) stopPreview();
      }}
      style={{ cursor: 'pointer', textDecoration: 'none' }}
      aria-label={`Voir le détail de ${game.title}`}
    >
      <div className="card-header">
        <h3>{game.title}</h3>
      </div>
      <div className="card-image">
        <span className="platform-badge">
          {game.platform === 'Steam' || game.platform === 'GOG' || game.platform === 'EA App' ? 'PC' : 'Console'}
        </span>
        <span className="discount-badge">{game.discount}</span>
        <SafeImage
          className="card-image-media"
          src={game.coverImage}
          alt={`Cover ${game.title}`}
          width={600}
          height={900}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {mp4Src && !videoError ? (
          <video ref={videoRef} className="card-image-video" muted playsInline loop preload="none" src={mp4Src} onError={() => setVideoError(true)} />
        ) : null}
        {!mp4Src && embedBase && embedSrc && !videoError ? (
          <iframe
            className="card-image-video"
            src={embedSrc}
            title={game.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : null}
      </div>
      <div className="card-footer">
        <div className="price-info">
          <span className="current-price">Prix : {game.price}</span>
          <span className="old-price">{game.oldPrice}</span>
        </div>
        <div className="platform-info">
          <span>Plateforme : {game.platform}</span>
        </div>
      </div>
    </Link>
  );
}

import { useInterests } from '@/hooks/useInterests';

export default function RecommendationsCarousel({ games }: { games: RecommendedGame[] }) {
  const safeGames = useMemo(() => Array.isArray(games) ? games : [], [games]);

  // Tri personnalisé basé sur l'historique
  const { getScore } = useInterests();

  const orderedGames = useMemo(() => {
    if (safeGames.length === 0) return [];

    // Copier pour ne pas muter la prop
    return [...safeGames].sort((a, b) => {
      const scoreA = getScore(a.tags || []);
      const scoreB = getScore(b.tags || []);
      // Plus haut score en premier
      return scoreB - scoreA;
    });
  }, [safeGames, getScore]);

  const gamesLength = orderedGames.length;
  const trackRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(gamesLength);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [cardWidth, setCardWidth] = useState(330);
  const [isPaused, setIsPaused] = useState(false);

  const extendedRecommendations = [...orderedGames, ...orderedGames, ...orderedGames];
  const transitionDuration = 1000;

  const updateDimensions = useCallback(() => {
    const isMobile = window.innerWidth <= 768;
    const width = isMobile ? 310 : 330;
    setCardWidth(width);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => updateDimensions(), 0);
    window.addEventListener('resize', updateDimensions);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateDimensions);
    };
  }, [updateDimensions]);

  useEffect(() => {
    if (!isTransitioning) return;

    if (currentIndex >= gamesLength * 2) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(gamesLength);
      }, transitionDuration);
      return () => clearTimeout(timeout);
    }

    if (currentIndex <= 0) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(gamesLength);
      }, transitionDuration);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, gamesLength, isTransitioning]);

  const nextSlide = useCallback(() => {
    if (currentIndex >= extendedRecommendations.length - 1) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex, extendedRecommendations.length]);

  const prevSlide = useCallback(() => {
    if (currentIndex <= 0) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => prev - 1);
  }, [currentIndex]);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        nextSlide();
      }
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  if (gamesLength === 0) return null;

  return (
    <div
      className="suggestions-carousel-wrapper"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <button className="carousel-btn prev" onClick={prevSlide} aria-label="Previous">
        <FaChevronLeft />
      </button>

      <div className="suggestions-carousel-window">
        <div
          className="suggestions-carousel-track"
          ref={trackRef}
          style={{
            transform: `translateX(-${currentIndex * cardWidth}px)`,
            transition: isTransitioning ? `transform ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)` : 'none',
            display: 'flex',
            gap: '30px'
          }}
        >
          {extendedRecommendations.map((game, index) => (
            <CarouselCard key={`${game.id}-${index}`} game={game} />
          ))}
        </div>
      </div>

      <button className="carousel-btn next" onClick={nextSlide} aria-label="Next">
        <FaChevronRight />
      </button>
    </div>
  );
}
