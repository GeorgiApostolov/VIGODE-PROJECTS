import { Calendar, Phone, CheckCircle } from 'lucide-react';

interface HeroProps {
  heroHeadline: string;
  heroSub: string;
  usp: string[];
  phone: string;
  onBookingClick: () => void;
}

export default function Hero({ heroHeadline, heroSub, usp, phone, onBookingClick }: HeroProps) {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/30" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
              {heroHeadline}
            </h1>
            <p className="text-xl text-zinc-300 mb-8 leading-relaxed">
              {heroSub}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {usp.map((item, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-300 text-sm">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onBookingClick}
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-emerald-600/20"
              >
                <Calendar className="w-5 h-5" />
                <span>Termin buchen</span>
              </button>
              <a
                href={`tel:${phone.replace(/\s/g, '')}`}
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>Jetzt anrufen</span>
              </a>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://i.imgur.com/YqWv4tq.jpg"
                alt="Mobiler Reifenservice Van"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
