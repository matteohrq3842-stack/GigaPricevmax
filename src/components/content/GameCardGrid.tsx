'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Game } from '@/data/games';

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
  sizes,
  className,
  style,
  priority,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
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
      sizes={sizes}
      style={style}
      priority={priority}
      onError={() => {
        if (currentSrc !== FALLBACK_IMAGE_SRC) setCurrentSrc(FALLBACK_IMAGE_SRC);
      }}
    />
  );
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

function getTrailerPreview(game: Game) {
  const mp4Candidate = [game.trailerMp4Url, game.trailerUrl].find((value) => value && isVideoFile(value));
  if (mp4Candidate) return { type: 'mp4' as const, src: mp4Candidate };

  if (game.trailerEmbedUrl) {
    const embedId = getYoutubeIdFromUrl(game.trailerEmbedUrl) || game.trailerYoutubeId || undefined;
    return { type: 'embed' as const, src: withAutoplay(game.trailerEmbedUrl, embedId) };
  }

  const youtubeId = game.trailerYoutubeId || (game.trailerUrl ? getYoutubeIdFromUrl(game.trailerUrl) : '');
  if (youtubeId) {
    return {
      type: 'embed' as const,
      src: withAutoplay(`https://www.youtube-nocookie.com/embed/${youtubeId}`, youtubeId),
    };
  }

  if (game.trailerUrl) {
    const embedId = getYoutubeIdFromUrl(game.trailerUrl) || undefined;
    return { type: 'embed' as const, src: withAutoplay(game.trailerUrl, embedId) };
  }

  return null;
}

function GameCard({ game, cardClassName }: { game: Game; cardClassName?: string }) {
  const preview = getTrailerPreview(game);
  const hasVideo = Boolean(preview);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const playPreview = () => {
    if (preview?.type !== 'mp4' || videoError) return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.currentTime = 0;
    const playPromise = video.play();
    if (playPromise) playPromise.catch(() => {
      // Auto-play failed (rare on hover but possible)
      // We don't necessarily want to hide video here, just ignore
    });
  };

  const stopPreview = () => {
    if (preview?.type !== 'mp4') return;
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  const embedSrc = preview?.type === 'embed' && isHovering && !videoError ? preview.src : '';
  const showVideo = hasVideo && !videoError;

  return (
    <Link
      key={game.slug}
      href={`/jeux?slug=${encodeURIComponent(game.slug)}`}
      className={`card ${cardClassName ?? ''} ${showVideo ? 'has-hover-video' : ''}`}
      style={{ cursor: 'pointer', textDecoration: 'none' }}
      aria-label={`Voir le détail de ${game.title}`}
      onMouseEnter={() => {
        setIsHovering(true);
        playPreview();
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        stopPreview();
      }}
    >
      <div className="card-header">
        <h3>{game.title}</h3>
      </div>
      <div className="card-image">
        <span className="platform-badge">{game.platform === 'Steam' || game.platform === 'GOG' || game.platform === 'EA App' ? 'PC' : 'Console'}</span>
        <span className="discount-badge">{game.discount}</span>
        <SafeImage
          className="card-image-media"
          src={game.coverImage}
          alt={`Cover ${game.title}`}
          width={600}
          height={900}
          sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 370px"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {preview?.type === 'mp4' && !videoError ? (
          <video
            ref={videoRef}
            className="card-image-video"
            muted
            playsInline
            loop
            preload="none"
            src={preview.src}
            onError={() => setVideoError(true)}
          />
        ) : null}
        {preview?.type === 'embed' && embedSrc && !videoError ? (
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

export default function GameCardGrid({
  games,
  gridClassName,
  cardClassName,
}: {
  games: Game[];
  gridClassName?: string;
  cardClassName?: string;
}) {
  if (!games) return null;

  return (
    <section className={gridClassName}>
      {games.map((game) => (
        <GameCard key={game.slug} game={game} cardClassName={cardClassName} />
      ))}
    </section>
  );
}
