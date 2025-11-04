import { Calendar, Phone, MessageCircle } from 'lucide-react';

interface CTABandProps {
  phone: string;
  whatsapp: string;
  onBookingClick: () => void;
}

export default function CTABand({ phone, whatsapp, onBookingClick }: CTABandProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 md:p-12 text-center shadow-2xl shadow-emerald-600/20">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Bereit für Ihren Reifenwechsel?
          </h2>
          <p className="text-emerald-50 text-lg mb-8 max-w-2xl mx-auto">
            Buchen Sie jetzt Ihren Termin und erleben Sie professionellen Service direkt vor Ihrer Tür
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onBookingClick}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-emerald-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-lg w-full sm:w-auto"
            >
              <Calendar className="w-5 h-5" />
              <span>Termin buchen</span>
            </button>

            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-emerald-900/30 text-white rounded-xl font-semibold hover:bg-emerald-900/50 transition-colors border border-white/20 w-full sm:w-auto"
            >
              <Phone className="w-5 h-5" />
              <span>{phone}</span>
            </a>

            <a
              href={`https://wa.me/${whatsapp.replace(/[\s+]/g, '')}`}
              className="inline-flex items-center space-x-2 px-8 py-4 bg-emerald-900/30 text-white rounded-xl font-semibold hover:bg-emerald-900/50 transition-colors border border-white/20 w-full sm:w-auto"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
