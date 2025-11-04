import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export async function seedFirestoreData() {
  try {
    const siteDoc = await getDocs(collection(db, 'site'));
    if (siteDoc.empty) {
      await setDoc(doc(db, 'site', 'main'), {
        brand: 'AT Mobiler Reifenservice',
        phone: '+49 173 3014592',
        whatsapp: '+49 173 3014592',
        email: 'at.mobiler.reifenservice@gmail.com',
        city: 'Landshut',
        serviceArea: ['Landshut', 'Ergolding', 'Altdorf', 'Essenbach', 'Moosburg a.d. Isar'],
        openingHours: [
          { days: 'Mo–Fr', open: '08:00', close: '18:00' },
          { days: 'Sa', open: '08:00', close: '16:00' },
        ],
      });
    }

    const slidesSnapshot = await getDocs(collection(db, 'slides'));
    if (slidesSnapshot.empty) {
      await setDoc(doc(db, 'slides', 'startseite'), {
        title: 'STARTSEITE',
        intro: 'Wir freuen uns, dass Sie sich entschieden haben.',
        body: 'Wir wechseln die Räder von PKW, Transporter, LLKW, Motorräder, Anhänger sowie Wohnmobile und Wohnwagen.',
        bullets: ['Reifen Montage und Demontage', 'Auswuchten', 'Räderwechseln', 'Saisonale Einlagerung', 'Reifenreparatur', 'Reifenverkauf', 'Schneller Service, Flexibilität und Professionalität'],
        heroHeadline: 'Mobiler Reifenservice – Schnell bei Ihnen vor Ort',
        heroSub: 'Reifenwechsel, Auswuchten, RDKS – direkt vor Ihrer Tür. Termin in 60 Sekunden.',
        usp: ['Vor-Ort-Service', 'Keine Wartezeit', 'Kartenzahlung möglich', '24/7 Notdienst verfügbar'],
      });

      await setDoc(doc(db, 'slides', 'preise'), {
        title: 'PREISE',
        lists: [
          { heading: 'Reifenmontage (4 Räder)', items: ['13"–17" … 85€', '18" … 95€', '19" … 110€', '20" … 120€'] },
          { heading: 'Radwechsel (4 Räder)', items: ['PKW … 40€', 'LLKW bis 3.5t / Wohnmobil … 50€'] },
          { heading: 'Zusatzleistungen', items: ['Auswuchten – pro Rad zzgl. 7,50€', 'Reifenreparatur – pro Stück 40€', 'Reifenentsorgung – ohne Felge je 5€, mit Felge je 10€', 'Reifeneinlagerung – ab 70€ (mit Umstecken & Räderwäsche)'] },
        ],
        ctaText: 'Transparente Festpreise – Termin jetzt sichern',
      });

      await setDoc(doc(db, 'slides', 'kontakt'), {
        title: 'KONTAKT',
        lead: 'Rufen Sie jetzt an und vereinbaren Sie Ihren mobilen Reifenwechsel!',
        channels: [
          { type: 'phone', label: 'Phone', value: '+49 173 3014592' },
          { type: 'whatsapp', label: 'WhatsApp', value: '+49 173 3014592' },
          { type: 'email', label: 'Email', value: 'at.mobiler.reifenservice@gmail.com' },
        ],
        buttons: [
          { label: 'Jetzt anrufen', action: 'tel:+491733014592', icon: 'phone' },
          { label: 'WhatsApp schreiben', action: 'https://wa.me/491733014592', icon: 'whatsapp' },
          { label: 'E-Mail schreiben', action: 'mailto:at.mobiler.reifenservice@gmail.com', icon: 'mail' },
        ],
      });
    }

    const faqsSnapshot = await getDocs(collection(db, 'faqs'));
    if (faqsSnapshot.empty) {
      const faqs = [
        { q: 'Wie lange dauert ein Reifenwechsel vor Ort?', a: 'In der Regel 30–45 Minuten für 4 Räder inklusive Auswuchten.' },
        { q: 'Brauche ich eine Steckdose oder Garage?', a: 'Nein. Unser Service-Fahrzeug ist vollständig ausgerüstet.' },
        { q: 'Unterstützt ihr Runflat und RDKS?', a: 'Ja, inkl. Programmierung und Anlernen von RDKS/TPMS.' },
        { q: 'Wie kann ich bezahlen?', a: 'Bar, EC- und Kreditkarte sowie kontaktlos.' },
      ];
      for (let i = 0; i < faqs.length; i++) {
        await setDoc(doc(db, 'faqs', `faq${i + 1}`), faqs[i]);
      }
    }

    return { success: true, message: 'Firestore data seeded successfully' };
  } catch (error) {
    console.error('Error seeding data:', error);
    return { success: false, error };
  }
}
