import { Wrench, Gauge, RefreshCw, Radio, Hammer, Package, ShoppingCart } from 'lucide-react';

interface ServiceGridProps {
  bullets: string[];
}

const serviceIcons = [
  { icon: Wrench, title: 'Reifenmontage & -demontage', description: 'Professionelles Auf- und Abziehen von Reifen' },
  { icon: Gauge, title: 'Auswuchten', description: 'Präzises Auswuchten für ruhigen Lauf' },
  { icon: RefreshCw, title: 'Räderwechsel', description: 'Schneller Wechsel zwischen Sommer- und Winterreifen' },
  { icon: Radio, title: 'RDKS/TPMS', description: 'Programmierung und Anlernen von Reifendrucksensoren' },
  { icon: Hammer, title: 'Reifenreparatur', description: 'Fachgerechte Reparatur kleiner Schäden' },
  { icon: ShoppingCart, title: 'Neue Reifen kaufen', description: 'Individuelle Beratung und passende Reifen für Ihr Fahrzeug' },
  { icon: Package, title: 'Einlagerung', description: 'Saisonale Lagerung Ihrer Reifen' },
];

export default function ServiceGrid({ bullets }: ServiceGridProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Unsere Leistungen</h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Komplett-Service für Ihre Räder – alles direkt vor Ihrer Haustür
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceIcons.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-900 hover:border-emerald-600/50 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-emerald-600/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{service.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
