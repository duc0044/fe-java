import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface AuthenticatedImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallback?: string;
}

/**
 * Image component that handles authenticated image loading
 * Fetches image with JWT token and converts to blob URL
 */
export const AuthenticatedImage = ({
  src,
  alt,
  className,
  fallback = ''
}: AuthenticatedImageProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { getAccessToken } = useAuthStore();

  useEffect(() => {
    if (!src) {
      return;
    }

    const loadImage = async () => {
      try {
        const token = getAccessToken();

        const response = await fetch(src, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to load image: ${response.status}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      } catch (error) {
        console.error('Error loading authenticated image:', error);
        setImageUrl(null);
      }
    };

    loadImage();

    // Cleanup blob URL
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [src, getAccessToken]);

  if (!src || !imageUrl) {
    return fallback ? <img src={fallback} alt={alt} className={className} /> : null;
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={() => {
        setImageUrl(null);
      }}
    />
  );
};
