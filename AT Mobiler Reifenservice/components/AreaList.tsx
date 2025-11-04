import { MapPin } from 'lucide-react';

interface AreaListProps {
  serviceArea: string[];
}

export default function AreaList({ serviceArea }: AreaListProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Unser Servicegebiet</h2>
          <p className="text-zinc-400 text-lg">Wir sind in folgenden Städten für Sie da</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceArea.map((city, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl cursor-default"
              >
                <div className="w-10 h-10 bg-emerald-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="text-white font-medium">{city}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-block bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <p className="text-zinc-300">
                Ihre Stadt ist nicht dabei? Kein Problem! Kontaktieren Sie uns!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
