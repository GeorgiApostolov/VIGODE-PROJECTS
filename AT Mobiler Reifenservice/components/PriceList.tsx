import { Check, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { PreiseList } from '@/lib/types';

interface PriceListProps {
  lists: PreiseList[];
  ctaText?: string;
  showCTA?: boolean;
}

export default function PriceList({ lists, ctaText, showCTA = false }: PriceListProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Transparente Preise</h2>
          <p className="text-zinc-400 text-lg">Faire Festpreise – keine versteckten Kosten</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {lists.map((list, index) => (
            <div
              key={index}
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 hover:border-emerald-600/50 transition-all"
            >
              <h3 className="text-white font-semibold text-xl mb-6 pb-4 border-b border-zinc-800">
                {list.heading}
              </h3>
              <ul className="space-y-4">
                {list.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-300 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="bg-gradient-to-br from-emerald-950/30 to-zinc-900/50 border-2 border-emerald-600/50 rounded-2xl p-8 hover:border-emerald-500 transition-all">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-900/30">
              <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-white font-semibold text-xl">
                Neue Reifen kaufen
              </h3>
            </div>
            <div className="space-y-4 mb-6">
              <p className="text-zinc-300 leading-relaxed">
                Wir bieten hochwertige Markenreifen für alle Fahrzeugtypen an.
              </p>
              <p className="text-zinc-300 leading-relaxed">
                Jedes Fahrzeug benötigt unterschiedliche Reifengrößen und -typen. Kontaktieren Sie uns für ein individuelles Angebot.
              </p>
            </div>
            <Link
              href="/kontakt"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors"
            >
              Persönliche Beratung anfragen
            </Link>
          </div>
        </div>

        {showCTA && ctaText && (
          <div className="mt-12 text-center">
            <div className="inline-block bg-gradient-to-br from-emerald-950/30 to-zinc-900/50 border border-emerald-900/30 rounded-2xl p-8">
              <p className="text-white font-semibold text-xl mb-4">{ctaText}</p>
              <Link
                href="/kontakt"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors"
              >
                <span>Jetzt Termin sichern</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
