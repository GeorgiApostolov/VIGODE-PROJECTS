'use client';

import Link from 'next/link';
import { Phone, MessageCircle, Calendar } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  brand: string;
  phone: string;
  onBookingClick: () => void;
}

export default function Header({ brand, phone, onBookingClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">AT</span>
            </div>
            <span className="text-white font-semibold text-lg hidden sm:inline">{brand}</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-zinc-300 hover:text-white transition-colors">
              Startseite
            </Link>
            <Link href="/preise" className="text-zinc-300 hover:text-white transition-colors">
              Preise
            </Link>
            <Link href="/galerie" className="text-zinc-300 hover:text-white transition-colors">
              Galerie
            </Link>
            <Link href="/kontakt" className="text-zinc-300 hover:text-white transition-colors">
              Kontakt
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">Jetzt anrufen</span>
            </a>
            <button
              onClick={onBookingClick}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Termin buchen</span>
            </button>
          </div>

          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-zinc-800 pt-4 space-y-3">
            <Link href="/" className="block text-zinc-300 hover:text-white transition-colors">
              Startseite
            </Link>
            <Link href="/preise" className="block text-zinc-300 hover:text-white transition-colors">
              Preise
            </Link>
            <Link href="/galerie" className="block text-zinc-300 hover:text-white transition-colors">
              Galerie
            </Link>
            <Link href="/kontakt" className="block text-zinc-300 hover:text-white transition-colors">
              Kontakt
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
