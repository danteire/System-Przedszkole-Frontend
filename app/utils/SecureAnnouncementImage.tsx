// components/SecureAnnouncementImage.tsx
import React, { useState, useEffect } from "react";
import { api } from "./serviceAPI"; 
import { ImageOff, Loader2 } from "lucide-react";

interface Props {
  imagePath: string | undefined;
  alt: string;
  className?: string;
}

export const SecureAnnouncementImage = ({ imagePath, alt, className }: Props) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchImage = async () => {
      if (!imagePath) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(false);

      // Wywołanie nowej metody z ApiClient
      const url = await api.getAnnouncementImage(imagePath);

      if (isMounted) {
        if (url) {
          setImgSrc(url);
        } else {
          setError(true);
        }
        setLoading(false);
      }
    };

    fetchImage();

    // CLEANUP: Zwalniamy pamięć po odmontowaniu komponentu lub zmianie obrazka
    return () => {
      isMounted = false;
      if (imgSrc) {
        api.revokeImage(imgSrc);
      }
    };
  }, [imagePath]); // Uruchom ponownie, jeśli ścieżka się zmieni

  // --- Renderowanie stanów ---

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <Loader2 className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !imgSrc) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 border border-gray-200 ${className}`}>
        <ImageOff className="text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={`object-cover ${className}`}
      onError={() => setError(true)} // Fallback jeśli blob jest uszkodzony
    />
  );
};