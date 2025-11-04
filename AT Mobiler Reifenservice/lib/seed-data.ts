import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export async function seedFirestoreData() {
  try {
    await setDoc(doc(db, 'site', 'main'), {
      brand: 'AT Mobiler Reifenservice',
      phone: '+49 173 3014592',
      whatsapp: '+49 173 3014592',
      email: 'at.mobiler.reifenservice@gmail.com',
      city: 'Fuldabrück',
      serviceArea: ['Kassel', 'Fuldabrück', 'Bergshausen', 'Lohfelden', 'Waldau'],
      openingHours: [
        { days: 'Mo–Fr', open: '08:00', close: '18:00' },
        { days: 'Sa–So', open: 'Geschlossen', close: '' },
      ],
    });

    await setDoc(doc(db, 'slides', 'startseite'), {
      title: 'STARTSEITE',
      intro: 'Wir freuen uns, dass Sie sich entschieden haben.',
      body: 'Wir wechseln die Räder von PKW, Transporter, LLKW.',
      bullets: ['Reifen Montage und Demontage', 'Auswuchten', 'Räderwechseln', 'Einlagerung', 'Reparatur', 'Verkauf', 'Schneller Service'],
      heroHeadline: 'Mobiler Reifenservice – Schnell bei Ihnen vor Ort',
      heroSub: 'Reifenwechsel, Auswuchten, RDKS – direkt vor Ihrer Tür.',
      usp: ['Vor-Ort-Service', 'Keine Wartezeit'],
    });

    await setDoc(doc(db, 'slides', 'preise'), {
      title: 'PREISE',
      lists: [
        { heading: 'Reifenmontage (4 Räder)', items: ['13"–17" … 85€', '18" … 95€', '19" … 110€', '20" … 120€'] },
        { heading: 'Radwechsel (4 Räder)', items: ['PKW … 40€', 'LLKW bis 3.5t … 50€'] },
        { heading: 'Zusatzleistungen', items: ['Auswuchten zzgl. 7,50€', 'Reparatur 40€', 'Entsorgung ab 5€', 'Einlagerung ab 70€'] },
      ],
      ctaText: 'Transparente Festpreise',
    });

    await setDoc(doc(db, 'slides', 'kontakt'), {
      title: 'KONTAKT',
      lead: 'Rufen Sie jetzt an!',
      channels: [
        { type: 'phone', label: 'Phone', value: '+49 173 3014592' },
        { type: 'whatsapp', label: 'WhatsApp', value: '+49 173 3014592' },
        { type: 'email', label: 'Email', value: 'at.mobiler.reifenservice@gmail.com' },
      ],
      buttons: [
        { label: 'Anrufen', action: 'tel:+491733014592', icon: 'phone' },
        { label: 'WhatsApp', action: 'https://wa.me/491733014592', icon: 'whatsapp' },
        { label: 'E-Mail', action: 'mailto:at.mobiler.reifenservice@gmail.com', icon: 'mail' },
      ],
    });

    await setDoc(doc(db, 'faqs', 'faq1'), { q: 'Wie lange dauert ein Reifenwechsel?', a: 'Ca. 30-45 Minuten.' });
    await setDoc(doc(db, 'faqs', 'faq2'), { q: 'Brauche ich eine Garage?', a: 'Nein, nur einen Parkplatz.' });
    await setDoc(doc(db, 'faqs', 'faq3'), { q: 'RDKS Support?', a: 'Ja, vollständig.' });
    await setDoc(doc(db, 'faqs', 'faq4'), { q: 'Zahlungsmethoden?', a: 'Bar, Banküberweisung, PayPal.' });

    return { success: true };
  } catch (error) {
    console.error('Seed error:', error);
    return { success: false, error };
  }
}
