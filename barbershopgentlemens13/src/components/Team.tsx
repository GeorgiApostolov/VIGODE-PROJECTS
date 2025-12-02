import { useState, useEffect } from "react";
import { Clock, Calendar, Star } from "lucide-react";
import { api, Barber } from "../lib/api";

export function Team() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [hoveredBarber, setHoveredBarber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBarbers();
  }, []);

  const fetchBarbers = async () => {
    try {
      const data = await api.getBarbers();
      setBarbers(data);
    } catch (err) {
      console.error("Failed to fetch barbers:", err);
      setError("Грешка при зареждане на бръснари.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="team" className="py-20 bg-neutral-950">
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
      <section id="team" className="py-20 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="team"
      className="py-20 bg-neutral-950 relative overflow-hidden"
    >
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-800/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Нашият екип
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent mx-auto mb-4"></div>
          <p className="text-neutral-400 text-lg">
            Майстори на стила и прецизността
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {barbers.map((barber) => (
            <div
              key={barber._id}
              className="relative group"
              onMouseEnter={() => setHoveredBarber(barber._id)}
              onMouseLeave={() => setHoveredBarber(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/30 to-red-800/30 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl overflow-hidden transition-all duration-500 hover:border-red-600/50 hover:shadow-2xl">
                <div className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden">
                  <img
                    src={barber.image}
                    alt={barber.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                  <div className="absolute top-4 right-4 flex items-center space-x-1 bg-black/80 backdrop-blur-sm px-3 py-2 rounded-full border border-red-600/30">
                    <Star className="w-4 h-4 text-red-600 fill-red-600" />
                    <Star className="w-4 h-4 text-red-600 fill-red-600" />
                    <Star className="w-4 h-4 text-red-600 fill-red-600" />
                    <Star className="w-4 h-4 text-red-600 fill-red-600" />
                    <Star className="w-4 h-4 text-red-600 fill-red-600" />
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {barber.name}
                    </h3>
                    <p className="text-red-500 font-semibold text-lg flex items-center">
                      <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
                      {barber.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-b from-neutral-900/50 to-black/50 backdrop-blur-sm">
                  {barber.name.includes("Балтов") ||
                  barber.name.includes("Теодор Балтов") ? (
                    // Специален текст за Балтов - работи без график
                    <div className="space-y-3">
                      <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4">
                        <p className="text-white font-semibold mb-2 flex items-center">
                          <Calendar className="w-5 h-5 mr-2 text-red-600" />
                          Без фиксиран график
                        </p>
                        <p className="text-neutral-300 text-sm leading-relaxed">
                          {barber.name} работи по свободен график и не приема
                          онлайн резервации.
                        </p>
                      </div>
                      <div className="flex items-center justify-center bg-neutral-800/50 rounded-lg p-3">
                        <p className="text-neutral-400 text-sm">
                          📞 За запазване на час:{" "}
                          <a
                            href="tel:0877506242"
                            className="text-red-500 hover:text-red-400 font-semibold ml-1"
                          >
                            0877 506 242
                          </a>
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Стандартен график за другите барбъри
                    <>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center text-neutral-400">
                          <Clock className="w-5 h-5 mr-2 text-red-600" />
                          <div>
                            <div className="font-semibold text-white">
                              Пон–Съб
                            </div>
                            <div>{barber.schedule.regular}</div>
                          </div>
                        </div>
                        <div className="flex items-center text-neutral-400">
                          <Calendar className="w-5 h-5 mr-2 text-red-600" />
                          <div>
                            <div className="font-semibold text-white">
                              Сряда
                            </div>
                            <div>{barber.schedule.wednesday}</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-neutral-800">
                        <p className="text-neutral-500 text-sm">
                          <span className="text-red-600 font-semibold">
                            Неделя:
                          </span>{" "}
                          {barber.schedule.sunday}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a
            href="/booking"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 hover:shadow-[0_0_30px_rgba(229,9,20,0.5)] hover:scale-105"
          >
            Избери бръснар и запази час
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
