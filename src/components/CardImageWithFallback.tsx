'use client';
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';

interface CardImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function CardImageWithFallback({
  fallbackSrc = '/no-image.png',
  className,
  src,
  alt = '圖片載入失敗',
  ...props
}: CardImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt}
      onLoad={() => setLoaded(true)}
      onError={() => {
        setImgSrc(fallbackSrc);
        setLoaded(true);
      }}
      className={`rounded-lg object-cover transition-opacity duration-300 ${
        loaded ? 'opacity-100' : 'opacity-0'
      } ${className || ''}`}
    />
  );
}
