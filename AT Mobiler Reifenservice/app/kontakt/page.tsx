'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SiteData, SlideKontakt } from '@/lib/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StickyBar from '@/components/StickyBar';
import BookingDrawer from '@/components/BookingDrawer';
import { Phone, Mail, MessageCircle, MapPin } from 'lucide-react';

export default function KontaktPage() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [kontaktData, setKontaktData] = useState<SlideKontakt | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const siteDoc = await getDoc(doc(db, 'site', 'main'));
        if (siteDoc.exists()) {
          setSiteData(siteDoc.data() as SiteData);
        }

        const kontaktDoc = await getDoc(doc(db, 'slides', 'kontakt'));
        if (kontaktDoc.exists()) {
          setKontaktData(kontaktDoc.data() as SlideKontakt);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  if (!siteData || !kontaktData) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white text-lg">Laden...</div>
      </div>
    );
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'phone':
        return Phone;
      case 'mail':
        return Mail;
      case 'whatsapp':
        return MessageCircle;
      default:
        return Phone;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header
        brand={siteData.brand}
        phone={siteData.phone}
        onBookingClick={() => setBookingOpen(true)}
      />

      <main className="pt-8 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
              {kontaktData.title}
            </h1>
            <p className="text-zinc-400 text-center text-lg mb-12 max-w-2xl mx-auto">
              {kontaktData.lead}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {kontaktData.buttons.map((button, index) => {
                const Icon = getIcon(button.icon);
                return (
                  <a
                    key={index}
                    href={button.action}
                    target={button.icon === 'whatsapp' ? '_blank' : undefined}
                    rel={button.icon === 'whatsapp' ? 'noopener noreferrer' : undefined}
                    className="flex flex-col items-center justify-center space-y-4 p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:bg-zinc-900 hover:border-emerald-600/50 transition-all"
                  >
                    <div className="w-16 h-16 bg-emerald-600/10 rounded-2xl flex items-center justify-center">
                      <Icon className="w-8 h-8 text-emerald-500" />
                    </div>
                    <span className="text-white font-semibold text-lg">{button.label}</span>
                  </a>
                );
              })}
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
              <h2 className="text-white font-semibold text-2xl mb-6">Kontaktinformationen</h2>
              <div className="space-y-4">
                {kontaktData.channels.map((channel, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-emerald-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      {channel.type === 'phone' && <Phone className="w-5 h-5 text-emerald-500" />}
                      {channel.type === 'whatsapp' && <MessageCircle className="w-5 h-5 text-emerald-500" />}
                      {channel.type === 'email' && <Mail className="w-5 h-5 text-emerald-500" />}
                    </div>
                    <div>
                      <p className="text-zinc-400 text-sm">{channel.label}</p>
                      <p className="text-white font-medium">{channel.value}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-start space-x-4 pt-4 border-t border-zinc-800">
                  <div className="w-10 h-10 bg-emerald-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm">Servicegebiet</p>
                    <p className="text-white font-medium">{siteData.serviceArea.join(', ')}</p>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
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
