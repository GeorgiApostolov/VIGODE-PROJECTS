'use client';

import { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SiteData, SlideStartseite, FAQ as FAQType } from '@/lib/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import TrustBar from '@/components/TrustBar';
import ServiceGrid from '@/components/ServiceGrid';
import Steps from '@/components/Steps';
import AreaList from '@/components/AreaList';
import FAQ from '@/components/FAQ';
import CTABand from '@/components/CTABand';
import StickyBar from '@/components/StickyBar';
import BookingDrawer from '@/components/BookingDrawer';

export default function Home() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [startseiteData, setStartseiteData] = useState<SlideStartseite | null>(null);
  const [faqData, setFaqData] = useState<FAQType[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const siteDoc = await getDoc(doc(db, 'site', 'main'));
        if (siteDoc.exists()) {
          setSiteData(siteDoc.data() as SiteData);
        }

        const startseiteDoc = await getDoc(doc(db, 'slides', 'startseite'));
        if (startseiteDoc.exists()) {
          setStartseiteData(startseiteDoc.data() as SlideStartseite);
        }

        const faqSnapshot = await getDocs(collection(db, 'faqs'));
        const faqs = faqSnapshot.docs.map((doc) => doc.data() as FAQType);
        setFaqData(faqs);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  if (!siteData || !startseiteData) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white text-lg">Laden...</div>
      </div>
    );
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: siteData.brand,
    url: 'https://at-mobiler-reifenservice.de/',
    telephone: siteData.phone,
    priceRange: '€€',
    address: {
      '@type': 'PostalAddress',
      addressLocality: siteData.city,
      postalCode: '84028',
      addressCountry: 'DE',
    },
    areaServed: siteData.serviceArea,
    sameAs: ['https://www.facebook.com/61581505861948'],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="min-h-screen bg-zinc-950">
        <Header
          brand={siteData.brand}
          phone={siteData.phone}
          onBookingClick={() => setBookingOpen(true)}
        />

        <main>
          <Hero
            heroHeadline={startseiteData.heroHeadline}
            heroSub={startseiteData.heroSub}
            usp={startseiteData.usp}
            phone={siteData.phone}
            onBookingClick={() => setBookingOpen(true)}
          />

          <TrustBar />

          <ServiceGrid bullets={startseiteData.bullets} />

          <Steps />

          <AreaList serviceArea={siteData.serviceArea} />

          {faqData.length > 0 && <FAQ faqs={faqData} generateSchema={true} />}

          <CTABand
            phone={siteData.phone}
            whatsapp={siteData.whatsapp}
            onBookingClick={() => setBookingOpen(true)}
          />
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
    </>
  );
}
