import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  thumbnail?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  fadeInDuration?: number;
}

/**
 * LazyImage Component
 * Lazy loads images with smooth fade-in transition
 * Shows low-res thumbnail placeholder while full image loads
 *
 * @param src - URL of the full-resolution image
 * @param thumbnail - URL of the low-res placeholder (optional, can be base64)
 * @param alt - Alt text for accessibility
 * @param className - Additional CSS classes
 * @param style - Inline styles
 * @param onLoad - Callback when image fully loads
 * @param fadeInDuration - Duration of fade-in animation in ms (default: 500)
 */
export default function LazyImage({
  src,
  thumbnail,
  alt,
  className = '',
  style = {},
  onLoad,
  fadeInDuration = 500,
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(thumbnail || null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading slightly before entering viewport
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Load full image when in view
  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
      onLoad?.();
    };

    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      setIsLoaded(true); // Still mark as "loaded" to remove blur
    };
  }, [isInView, src, onLoad]);

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={style}
    >
      {/* Placeholder or Thumbnail */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`w-full h-auto transition-opacity ${
            !isLoaded && thumbnail ? 'blur-sm scale-105' : ''
          }`}
          style={{
            opacity: isLoaded ? 1 : 0.7,
            transitionDuration: `${fadeInDuration}ms`,
            transitionProperty: 'opacity, filter, transform',
          }}
        />
      )}

      {/* Loading placeholder if no thumbnail */}
      {!imageSrc && (
        <div className="w-full h-64 bg-gray-200 animate-pulse" />
      )}

      {/* Fade-in overlay effect */}
      {!isLoaded && imageSrc && (
        <div
          className="absolute inset-0 bg-gray-100 animate-pulse"
          style={{
            opacity: 0.3,
          }}
        />
      )}
    </div>
  );
}
