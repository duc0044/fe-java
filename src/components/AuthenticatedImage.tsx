import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface AuthenticatedImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * Image component that handles authenticated image loading
 * Fetches image with JWT token and converts to blob URL
 */
export const AuthenticatedImage = ({
  src,
  alt,
  className,
  fallback
}: AuthenticatedImageProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { getAccessToken } = useAuthStore();

  useEffect(() => {
    if (!src) {
      setLoading(false);
      return;
    }

    setLoading(true);
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
        setLoading(false);
      } catch (error) {
        console.error('Error loading authenticated image:', error);
        setImageUrl(null);
        setLoading(false);
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

  // Show fallback if loading, no src, or failed to load
  if (loading || !src || !imageUrl) {
    return <>{fallback}</>;
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
