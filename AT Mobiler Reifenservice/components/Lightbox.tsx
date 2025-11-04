'use client';

import { useEffect } from 'react';
import type { GalleryImage } from '@/lib/types';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LightboxProps {
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({ images, currentIndex, onClose, onNavigate }: LightboxProps) {
  const currentImage = images[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
        onNavigate(currentIndex + 1);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, images.length, onClose, onNavigate]);

  if (!currentImage) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <Button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-full p-2"
        size="icon"
      >
        <X className="w-6 h-6" />
      </Button>

      {currentIndex > 0 && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex - 1);
          }}
          className="absolute left-4 z-10 bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-full p-2"
          size="icon"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      )}

      {currentIndex < images.length - 1 && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex + 1);
          }}
          className="absolute right-4 z-10 bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-full p-2"
          size="icon"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      )}

      <div
        className="max-w-7xl max-h-[90vh] px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage.url}
          alt={currentImage.alt || currentImage.title}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />

        {(currentImage.title || currentImage.city) && (
          <div className="mt-4 text-center text-white">
            {currentImage.title && (
              <h3 className="text-xl font-semibold mb-1">{currentImage.title}</h3>
            )}
            {currentImage.city && (
              <p className="text-zinc-400">{currentImage.city}</p>
            )}
          </div>
        )}

        <div className="text-center text-zinc-500 mt-2 text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}
