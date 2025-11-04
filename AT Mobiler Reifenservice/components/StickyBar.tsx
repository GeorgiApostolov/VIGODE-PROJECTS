'use client';

import { Phone, MessageCircle, Calendar } from 'lucide-react';

interface StickyBarProps {
  phone: string;
  whatsapp: string;
  onBookingClick: () => void;
}

export default function StickyBar({ phone, whatsapp, onBookingClick }: StickyBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-zinc-950 border-t border-zinc-800 px-4 py-3 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <a
          href={`tel:${phone.replace(/\s/g, '')}`}
          className="flex flex-col items-center space-y-1 text-zinc-300 hover:text-white transition-colors"
          aria-label="Anrufen"
        >
          <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <span className="text-xs">Anrufen</span>
        </a>

        <a
          href={`https://wa.me/${whatsapp.replace(/[\s+]/g, '')}`}
          className="flex flex-col items-center space-y-1 text-zinc-300 hover:text-white transition-colors"
          aria-label="WhatsApp"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-5 h-5" />
          </div>
          <span className="text-xs">WhatsApp</span>
        </a>

        <button
          onClick={onBookingClick}
          className="flex flex-col items-center space-y-1 text-white"
          aria-label="Termin buchen"
        >
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-xs">Termin</span>
        </button>
      </div>
    </div>
  );
}
