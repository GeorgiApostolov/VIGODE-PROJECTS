import { Star, Users, Shield } from 'lucide-react';

export default function TrustBar() {
  return (
    <section className="py-8 bg-zinc-900/50 border-y border-zinc-800" role="status" aria-label="Vertrauensindikatoren">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-1 text-yellow-500">
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
            </div>
            <p className="text-white font-semibold">4,9/5 auf Google</p>
            <p className="text-zinc-400 text-sm">Über 100 Bewertungen</p>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <Users className="w-8 h-8 text-emerald-500" />
            <p className="text-white font-semibold">500+ Reifenwechsel</p>
            <p className="text-zinc-400 text-sm">Zufriedene Kunden vor Ort</p>
          </div>

          <div className="flex flex-col items-center space-y-2">
            <Shield className="w-8 h-8 text-emerald-500" />
            <p className="text-white font-semibold">Professioneller Service</p>
            <p className="text-zinc-400 text-sm">Zertifiziert & versichert</p>
          </div>
        </div>
      </div>
    </section>
  );
}
