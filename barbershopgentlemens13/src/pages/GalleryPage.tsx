import { useState, useEffect } from "react";
import Header from "../components/Header";
import { Footer } from "../components/Footer";
import { api, type GalleryItem } from "../lib/api";

export function GalleryPage() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    api
      .getGallery()
      .then(setImages)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Галерия
            </h1>
            <div className="w-24 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-neutral-300 text-lg max-w-2xl mx-auto">
              Разгледайте нашите работи и атмосферата в Gentlemen's Club
              Barbershop
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
              <p className="text-neutral-400 mt-4">Зареждане...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-neutral-400">Няма налични снимки в момента.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <div
                  key={image._id}
                  onClick={() => setSelectedImage(image)}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-neutral-900 border-2 border-neutral-800 hover:border-red-600 transition-all duration-300 cursor-pointer"
                >
                  <img
                    src={image.imageUrl}
                    alt={image.caption || "Gallery image"}
                    loading="lazy"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  {image.caption && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-white text-xl font-bold">
                          {image.caption}
                        </h3>
                        {image.tags && image.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {image.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="text-red-600 text-sm font-semibold"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-red-600 transition-colors"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.caption || "Gallery image"}
              className="w-full h-auto rounded-xl"
            />
            {selectedImage.caption && (
              <div className="mt-4 text-center">
                <h3 className="text-white text-2xl font-bold">
                  {selectedImage.caption}
                </h3>
                {selectedImage.tags && selectedImage.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 justify-center">
                    {selectedImage.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-red-600 text-sm font-semibold"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
