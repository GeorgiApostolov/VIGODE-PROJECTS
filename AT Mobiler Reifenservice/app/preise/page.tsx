'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SiteData, SlidePreise } from '@/lib/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PriceList from '@/components/PriceList';
import StickyBar from '@/components/StickyBar';
import BookingDrawer from '@/components/BookingDrawer';
import { Metadata } from 'next';

export default function PreisePage() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [preiseData, setPreiseData] = useState<SlidePreise | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const siteDoc = await getDoc(doc(db, 'site', 'main'));
        if (siteDoc.exists()) {
          setSiteData(siteDoc.data() as SiteData);
        }

        const preiseDoc = await getDoc(doc(db, 'slides', 'preise'));
        if (preiseDoc.exists()) {
          setPreiseData(preiseDoc.data() as SlidePreise);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  if (!siteData || !preiseData) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white text-lg">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header
        brand={siteData.brand}
        phone={siteData.phone}
        onBookingClick={() => setBookingOpen(true)}
      />

      <main className="pt-8">
        <div className="container mx-auto px-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
            {preiseData.title}
          </h1>
          <p className="text-zinc-400 text-center text-lg max-w-2xl mx-auto">
            Alle Preise verstehen sich inklusive Anfahrt im Servicegebiet
          </p>
        </div>

        <PriceList lists={preiseData.lists} ctaText={preiseData.ctaText} showCTA={true} />
      </main>

      <Footer
        brand={siteData.brand}
        phone={siteData.phone}
        email={siteData.email}
        city={siteData.city}
      />

      <StickyBar
        phone={siteData.phone}
        whatsapp={siteData.whatsapp}
        onBookingClick={() => setBookingOpen(true)}
      />

      <BookingDrawer
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        serviceArea={siteData.serviceArea}
      />
    </div>
  );
}
