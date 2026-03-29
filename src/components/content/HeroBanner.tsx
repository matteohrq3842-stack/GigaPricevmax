'use client';

import { useEffect, useState } from 'react';
import Image from "next/image";

interface HeroBannerProps {
  title: string;
  price: string;
  oldPrice?: string;
  discount: string;
  image: string;
  platforms: string[];
}

const FALLBACK_IMAGE_SRC = '/images/GigaPrice.jpg';

function isValidImageSrc(src: unknown): src is string {
  if (typeof src !== 'string') return false;
  const s = src.trim();
  if (!s) return false;
  if (s === 'null' || s === 'undefined') return false;
  return s.startsWith('https://') || s.startsWith('http://') || s.startsWith('/');
}

export default function HeroBanner({ title, price, oldPrice, discount, image, platforms }: HeroBannerProps) {
  const safeInitialSrc = isValidImageSrc(image) ? image : FALLBACK_IMAGE_SRC;
  const [src, setSrc] = useState<string>(safeInitialSrc);

  useEffect(() => {
    setSrc(safeInitialSrc);
  }, [safeInitialSrc]);

  return (
    <section className="hero-banner-container" aria-label="Mise en avant">
      <div className="hero-banner-wrapper">
        <div className="hero-banner-image">
          <Image
              src={src}
              alt={title}
              fill
              sizes="(max-width: 400px) 400px, (max-width: 500px) 500px, (max-width: 700px) 700px, (max-width: 1000px) 1000px, (max-width: 1400px) 1400px, 1920px"
              style={{ objectFit: 'contain', objectPosition: 'center' }}
              priority
              fetchPriority="high"
              onError={() => {
                if (src !== FALLBACK_IMAGE_SRC) setSrc(FALLBACK_IMAGE_SRC);
              }}
           />
           <div className="hero-banner-top-gradient" />
           <div className="hero-banner-side-shadow hero-banner-side-shadow-left" />
           <div className="hero-banner-side-shadow hero-banner-side-shadow-right" />
           <div className="hero-banner-overlay" />
        </div>

        <div className="hero-banner-content">
            <div className="hero-banner-content-inner">
              <div className="hero-banner-panel">
                <h2 className="hero-banner-title">{title}</h2>
                <div className="hero-banner-platforms">
                    {platforms.map(p => (
                        <span key={p} className="platform-tag">{p}</span>
                    ))}
                </div>
                <div className="hero-banner-price-block">
                    <div className="hero-banner-discount">{discount}</div>
                    <div className="hero-banner-prices">
                        {oldPrice && <span className="hero-banner-old-price">{oldPrice}</span>}
                        <span className="hero-banner-current-price">{price}</span>
                    </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </section>
  );
}
