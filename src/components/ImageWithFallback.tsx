'use client';

import { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function ImageWithFallback({
  fallbackSrc = '/no-image.png',
  className,
  src,
  alt = '圖片載入失敗',
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="absolute inset-0 w-full h-full">
      {/* Loading 動畫 */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 z-10">
          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 圖片本體 */}
      <img
        {...props}
        src={imgSrc}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setImgSrc(fallbackSrc);
          setLoaded(true);
        }}
        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${className || ''}`}
      />
    </div>
  );
}
