'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SiteData } from '@/lib/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Gallery from '@/components/Gallery';
import StickyBar from '@/components/StickyBar';
import BookingDrawer from '@/components/BookingDrawer';

export default function GaleriePage() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [siteData, setSiteData] = useState<SiteData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const siteDoc = await getDoc(doc(db, 'site', 'main'));
        if (siteDoc.exists()) {
          setSiteData(siteDoc.data() as SiteData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  if (!siteData) {
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

      <main>
        <Gallery />
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
