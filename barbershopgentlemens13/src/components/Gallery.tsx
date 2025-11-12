import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api, type BeforeAfterItem } from '../lib/api';

export function Gallery() {
  const [items, setItems] = useState<BeforeAfterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);

  useEffect(() => {
    api.getBeforeAfter()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (items.length <= 1) return;

      if (e.key === 'ArrowLeft') {
        handlePrevious(e as any);
      } else if (e.key === 'ArrowRight') {
        handleNext(e as any);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items.length, currentIndex]);

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    setSliderPosition(50);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    setSliderPosition(50);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  const currentItem = items[currentIndex];

  if (loading) {
    return (
      <section id="before-after" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Преди и След</h2>
            <div className="w-24 h-1 bg-red-600 mx-auto"></div>
          </div>
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
            <p className="text-neutral-400 mt-4">Зареждане...</p>
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section id="before-after" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Преди и След</h2>
            <div className="w-24 h-1 bg-red-600 mx-auto"></div>
          </div>
          <div className="text-center py-20">
            <p className="text-neutral-400">Няма налични снимки в момента.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="before-after" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Преди и След</h2>
          <div className="w-24 h-1 bg-red-600 mx-auto"></div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-neutral-900 border-2 border-neutral-800">
            <img
              src={currentItem.afterUrl}
              alt="След"
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img
                src={currentItem.beforeUrl}
                alt="Преди"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="absolute top-4 left-4 bg-gradient-to-r from-neutral-800 to-neutral-900 text-white px-4 py-2 rounded-full font-bold text-sm shadow-xl border-2 border-white/20 backdrop-blur-sm">
              ПРЕДИ
            </div>
            <div className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full font-bold text-sm shadow-xl border-2 border-white/20 backdrop-blur-sm">
              СЛЕД
            </div>

            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] pointer-events-none"
              style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)] flex items-center justify-center pointer-events-auto border-4 border-neutral-900">
                <ChevronLeft className="w-6 h-6 text-red-600 absolute left-0.5" />
                <ChevronRight className="w-6 h-6 text-red-600 absolute right-0.5" />
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={handleSliderChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
            />

            {items.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-red-600 text-white p-3 rounded-full transition-all z-20 shadow-xl border-2 border-white/20"
                  aria-label="Предишна снимка"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-red-600 text-white p-3 rounded-full transition-all z-20 shadow-xl border-2 border-white/20"
                  aria-label="Следваща снимка"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="text-center mt-6">
            {currentItem.title && (
              <h3 className="text-2xl font-bold text-white mb-2">{currentItem.title}</h3>
            )}
            {items.length > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-4">
                <span className="text-neutral-400 text-sm mr-3">
                  {currentIndex + 1} / {items.length}
                </span>
                {items.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      setSliderPosition(50);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex ? 'bg-red-600 w-8' : 'bg-neutral-600 hover:bg-neutral-500'
                    }`}
                    aria-label={`Покажи снимка ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
