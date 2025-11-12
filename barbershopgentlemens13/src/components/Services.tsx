import { useState, useEffect } from 'react';
import { Scissors, Wind, Droplets, Flame, Clock } from 'lucide-react';
import { api, Service } from '../lib/api';

const iconMap: Record<string, any> = {
  scissors: Scissors,
  wind: Wind,
  droplets: Droplets,
  flame: Flame,
  clock: Clock,
};

export function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await api.getServices();
      setServices(data);
    } catch (err) {
      console.error('Failed to fetch services:', err);
      setError('Грешка при зареждане на услуги.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="services" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <div className="animate-pulse">Зареждане...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="services" className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </section>
    );
  }
  return (
    <section id="services" className="py-20 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/50 to-black/50"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">Ценоразпис</h2>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent mx-auto mb-4"></div>
          <p className="text-neutral-400 text-lg">Професионални услуги на достъпни цени</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service) => {
            const Icon = Scissors;
            return (
              <div
                key={service._id}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-800/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-xl p-8 transition-all duration-300 hover:border-red-600/50 hover:transform hover:scale-105 hover:shadow-2xl">
                  <div className="flex items-center justify-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-lg group-hover:shadow-[0_0_20px_rgba(229,9,20,0.5)] transition-shadow">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white text-center mb-4">
                    {service.name}
                  </h3>

                  <div className="text-center">
                    <div className="text-5xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent mb-1">
                      {service.price}
                    </div>
                    <div className="text-base text-neutral-400 font-semibold">лева</div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <a
            href="/booking"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 hover:shadow-[0_0_30px_rgba(229,9,20,0.5)] hover:scale-105"
          >
            Запази час сега
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
