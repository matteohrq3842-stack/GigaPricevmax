'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useMemo, useState } from 'react';

const FALLBACK_IMAGE_SRC = '/images/GigaPrice.jpg';

function isValidImageSrc(src: unknown): src is string {
  if (typeof src !== 'string') return false;
  const s = src.trim();
  if (!s) return false;
  if (s === 'null' || s === 'undefined') return false;
  return s.startsWith('https://') || s.startsWith('http://') || s.startsWith('/');
}

type SafeImageProps = Omit<ImageProps, 'src'> & { src: string | null | undefined };

export default function SafeImage({ src, onError, ...props }: SafeImageProps) {
  const safeInitialSrc = useMemo(() => (isValidImageSrc(src) ? src : FALLBACK_IMAGE_SRC), [src]);
  const [currentSrc, setCurrentSrc] = useState<string>(safeInitialSrc);

  useEffect(() => {
    setCurrentSrc(safeInitialSrc);
  }, [safeInitialSrc]);

  return (
    <Image
      {...props}
      alt={props.alt || ''}
      src={currentSrc}
      onError={(e) => {
        onError?.(e);
        if (currentSrc !== FALLBACK_IMAGE_SRC) setCurrentSrc(FALLBACK_IMAGE_SRC);
      }}
    />
  );
}
