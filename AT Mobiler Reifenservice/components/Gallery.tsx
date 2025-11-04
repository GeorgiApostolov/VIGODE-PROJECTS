'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
} from 'firebase/firestore';
import type { GalleryImage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Star, Filter } from 'lucide-react';
import Lightbox from '@/components/Lightbox';

const ITEMS_PER_PAGE = 24;

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const [filterCity, setFilterCity] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [onlyFeatured, setOnlyFeatured] = useState(false);

  useEffect(() => {
    loadImages();
  }, [filterCity, filterTags, onlyFeatured]);

  const loadImages = async (loadMore = false) => {
    setLoading(true);
    try {
      if (!db) {
        console.error('Firebase DB not initialized');
        setLoading(false);
        return;
      }

      let q = query(
        collection(db, 'gallery'),
        limit(100)
      );

      console.log('Fetching from gallery collection...');
      const snapshot = await getDocs(q);
      console.log('Found documents:', snapshot.docs.length);

      let newImages = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log('Document data:', doc.id, data);
        return {
          id: doc.id,
          ...data,
        };
      }) as GalleryImage[];

      newImages = newImages.filter(img => img.published === true);

      if (filterCity) {
        newImages = newImages.filter(img => img.city === filterCity);
      }

      if (filterTags.length > 0) {
        newImages = newImages.filter(img =>
          img.tags && filterTags.some(tag => img.tags.includes(tag))
        );
      }

      if (onlyFeatured) {
        newImages = newImages.filter(img => img.featured);
      }

      newImages.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        if (a.featured !== b.featured) return b.featured ? 1 : -1;
        if (a.order !== b.order) return (b.order || 0) - (a.order || 0);
        return bTime - aTime;
      });

      console.log('Final images to display:', newImages.length);

      setImages(newImages);
      setLastDoc(null);
      setHasMore(false);
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    } finally {
      setLoading(false);
    }
  };

  const cities = Array.from(new Set(images.map((img) => img.city).filter(Boolean)));
  const allTags = Array.from(new Set(images.flatMap((img) => img.tags)));

  const toggleTag = (tag: string) => {
    setFilterTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Galerie</h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Echte Einsätze vor Ort – ein Blick hinter die Kulissen
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-zinc-400" />
            <span className="text-zinc-400 font-medium">Filter:</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="">Alle Städte</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <Button
              variant={onlyFeatured ? 'default' : 'outline'}
              onClick={() => setOnlyFeatured(!onlyFeatured)}
              className={
                onlyFeatured
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
              }
            >
              <Star className="w-4 h-4 mr-2" />
              Nur Highlights
            </Button>

            {(filterCity || filterTags.length > 0 || onlyFeatured) && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilterCity('');
                  setFilterTags([]);
                  setOnlyFeatured(false);
                }}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <X className="w-4 h-4 mr-2" />
                Filter zurücksetzen
              </Button>
            )}
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-zinc-400 text-sm mr-2">Tags:</span>
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={filterTags.includes(tag) ? 'default' : 'outline'}
                  className={
                    filterTags.includes(tag)
                      ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                      : 'border-zinc-600 text-zinc-300 hover:bg-zinc-800 cursor-pointer'
                  }
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {loading && images.length === 0 ? (
          <div className="text-center py-20 text-zinc-400">Wird geladen...</div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 text-zinc-400">
            Keine Bilder gefunden. Versuchen Sie andere Filter.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="group relative bg-zinc-800 rounded-lg overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
                  onClick={() => setLightboxIndex(index)}
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={image.thumbUrl || image.url}
                      alt={image.alt || image.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      width={400}
                      height={400}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      {image.title && (
                        <h3 className="text-white font-semibold mb-1">{image.title}</h3>
                      )}
                      {image.city && (
                        <p className="text-zinc-300 text-sm mb-2">{image.city}</p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {image.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs bg-emerald-600/30 text-emerald-300 border-emerald-600/50"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {image.featured && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-yellow-600/90 text-white border-yellow-500">
                          <Star className="w-3 h-3 mr-1" />
                          Highlight
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="text-center">
                <Button
                  onClick={() => loadImages(true)}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg"
                >
                  {loading ? 'Wird geladen...' : 'Mehr laden'}
                </Button>
              </div>
            )}
          </>
        )}

        {lightboxIndex !== null && (
          <Lightbox
            images={images}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
          />
        )}
      </div>
    </div>
  );
}
