'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface BookingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  serviceArea: string[];
}

interface ServiceSelection {
  montage?: string;
  radwechsel?: string;
  zusatz: string[];
}

interface AvailableSlot {
  date: string;
  slot: 'fullday';
  times: string[];
}

export default function BookingDrawer({ isOpen, onClose, serviceArea }: BookingDrawerProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [bookedTimes, setBookedTimes] = useState<{ [key: string]: string[] }>({});

  const [formData, setFormData] = useState({
    postalCode: '',
    city: '',
    address: '',
    services: {
      montage: '',
      radwechsel: '',
      zusatz: [] as string[],
    } as ServiceSelection,
    preferredDate: '',
    preferredTime: '',
    name: '',
    phone: '',
    email: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadAvailableSlots();
      loadBookings();
    }
  }, [isOpen]);

  const loadAvailableSlots = async () => {
    try {
      const { initializeApp, getApps } = await import('firebase/app');
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');

      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      const db = getFirestore(app);

      const slotsSnapshot = await getDocs(collection(db, 'availableSlots'));
      const slots: AvailableSlot[] = [];

      slotsSnapshot.forEach((doc) => {
        const data = doc.data();
        slots.push({
          date: data.date,
          slot: data.slot,
          times: data.times,
        });
      });

      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error loading available slots:', error);
    }
  };

  const loadBookings = async () => {
    try {
      const { initializeApp, getApps } = await import('firebase/app');
      const { getFirestore, collection, getDocs } = await import('firebase/firestore');

      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      const db = getFirestore(app);

      const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
      const booked: { [key: string]: string[] } = {};

      bookingsSnapshot.forEach((doc) => {
        const data = doc.data();
        const dateTime = `${data.preferredDate}_${data.preferredTime}`;
        if (!booked[data.preferredDate]) {
          booked[data.preferredDate] = [];
        }
        booked[data.preferredDate].push(data.preferredTime);
      });

      setBookedTimes(booked);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const tireOptions = [
    { value: 'neue-reifen', label: 'Neue Reifen kaufen – Persönliche Beratung erforderlich', isSpecial: true },
  ];

  const montageOptions = [
    { value: '13-17', label: '13"–17" … 85€' },
    { value: '18', label: '18" … 95€' },
    { value: '19', label: '19" … 110€' },
    { value: '20', label: '20" … 120€' },
  ];

  const radwechselOptions = [
    { value: 'pkw', label: 'PKW … 40€' },
    { value: 'llkw', label: 'LLKW bis 3.5t … 50€' },
  ];

  const zusatzOptions = [
    { value: 'auswuchten', label: 'Auswuchten zzgl. 7,50€' },
    { value: 'reparatur', label: 'Reparatur 40€' },
    { value: 'entsorgung', label: 'Entsorgung ab 5€' },
    { value: 'einlagerung', label: 'Einlagerung ab 70€' },
  ];

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const toggleZusatz = (value: string) => {
    const current = formData.services.zusatz;
    if (current.includes(value)) {
      setFormData({
        ...formData,
        services: {
          ...formData.services,
          zusatz: current.filter((v) => v !== value),
        },
      });
    } else {
      setFormData({
        ...formData,
        services: {
          ...formData.services,
          zusatz: [...current, value],
        },
      });
    }
  };

  const hasSelectedService = () => {
    return (
      formData.services.montage ||
      formData.services.radwechsel ||
      formData.services.zusatz.length > 0
    );
  };

  const getSelectedServicesText = () => {
    const parts: string[] = [];

    if (formData.services.montage) {
      const option = montageOptions.find(o => o.value === formData.services.montage);
      parts.push(`Reifenmontage ${option?.label}`);
    }

    if (formData.services.radwechsel) {
      const option = radwechselOptions.find(o => o.value === formData.services.radwechsel);
      parts.push(`Radwechsel ${option?.label}`);
    }

    if (formData.services.zusatz.length > 0) {
      formData.services.zusatz.forEach(z => {
        const option = zusatzOptions.find(o => o.value === z);
        if (option) parts.push(option.label);
      });
    }

    return parts.join(', ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { initializeApp, getApps } = await import('firebase/app');
      const { getFirestore, collection, addDoc, Timestamp } = await import('firebase/firestore');

      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      };

      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      const db = getFirestore(app);

      const bookingData = {
        createdAt: Timestamp.now(),
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        postalCode: formData.postalCode,
        city: formData.city,
        address: formData.address,
        services: getSelectedServicesText(),
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        notes: formData.notes || null,
        source: 'web',
      };

      await addDoc(collection(db, 'bookings'), bookingData);

      // Send email notification via PHP
      try {
        await fetch('/api/send-booking.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingData),
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // Continue anyway - booking was saved
      }

      setIsSuccess(true);
      setStep(5);
    } catch (error) {
      console.error('Booking error:', error);
      alert('Fehler beim Senden der Buchung. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      postalCode: '',
      city: '',
      address: '',
      services: {
        montage: '',
        radwechsel: '',
        zusatz: [],
      },
      preferredDate: '',
      preferredTime: '',
      name: '',
      phone: '',
      email: '',
      notes: '',
    });
    setStep(1);
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-[500px] bg-zinc-900 border-l border-zinc-800 z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Termin buchen</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-300 transition-colors"
              aria-label="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step >= s
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {s}
                  </div>
                  {s < 4 && (
                    <div
                      className={`w-12 h-0.5 ${
                        step > s ? 'bg-emerald-600' : 'bg-zinc-800'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Postleitzahl *</label>
                <input
                  type="text"
                  required
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  placeholder="z.B. 34277"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Stadt *</label>
                <select
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="">Bitte wählen</option>
                  {serviceArea.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
                <p className="text-zinc-300 text-sm mb-3">
                  Ist Ihre Stadt nicht dabei?
                </p>
                <a
                  href="/kontakt"
                  className="inline-flex items-center text-emerald-500 hover:text-emerald-400 text-sm font-medium transition-colors"
                >
                  Kontaktieren Sie uns für ein individuelles Angebot
                  <ChevronRight className="w-4 h-4 ml-1" />
                </a>
              </div>

              <button
                onClick={handleNext}
                disabled={!formData.postalCode || !formData.city}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
              >
                <span>Weiter</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-3 text-lg">
                  Dienstleistungen auswählen *
                </label>
                <p className="text-zinc-400 text-sm mb-4">Sie können mehrere Optionen wählen</p>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-emerald-950/30 to-zinc-900/50 border-2 border-emerald-600/50 rounded-xl p-4">
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <span className="text-lg">🛒</span>
                      Neue Reifen kaufen
                    </h3>
                    <p className="text-zinc-300 text-sm mb-3 leading-relaxed">
                      Jedes Fahrzeug benötigt unterschiedliche Reifengrößen und -typen.
                      Für ein individuelles Angebot kontaktieren Sie uns bitte direkt.
                    </p>
                    <a
                      href="/kontakt"
                      target="_blank"
                      className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      Persönliche Beratung anfragen
                    </a>
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-2">Reifenmontage (4 Räder)</h3>
                    <div className="space-y-2">
                      {montageOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.services.montage === option.value
                              ? 'bg-emerald-600/10 border-emerald-600'
                              : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                          }`}
                        >
                          <input
                            type="radio"
                            name="montage"
                            value={option.value}
                            checked={formData.services.montage === option.value}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                services: { ...formData.services, montage: e.target.value },
                              })
                            }
                            className="w-4 h-4 text-emerald-600"
                          />
                          <span className="text-white text-sm">{option.label}</span>
                        </label>
                      ))}
                      {formData.services.montage && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              services: { ...formData.services, montage: '' },
                            })
                          }
                          className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors"
                        >
                          Auswahl entfernen
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-2">Radwechsel (4 Räder)</h3>
                    <div className="space-y-2">
                      {radwechselOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.services.radwechsel === option.value
                              ? 'bg-emerald-600/10 border-emerald-600'
                              : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                          }`}
                        >
                          <input
                            type="radio"
                            name="radwechsel"
                            value={option.value}
                            checked={formData.services.radwechsel === option.value}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                services: { ...formData.services, radwechsel: e.target.value },
                              })
                            }
                            className="w-4 h-4 text-emerald-600"
                          />
                          <span className="text-white text-sm">{option.label}</span>
                        </label>
                      ))}
                      {formData.services.radwechsel && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              services: { ...formData.services, radwechsel: '' },
                            })
                          }
                          className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors"
                        >
                          Auswahl entfernen
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-2">Zusatzleistungen</h3>
                    <div className="space-y-2">
                      {zusatzOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            formData.services.zusatz.includes(option.value)
                              ? 'bg-emerald-600/10 border-emerald-600'
                              : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                          }`}
                        >
                          <input
                            type="checkbox"
                            value={option.value}
                            checked={formData.services.zusatz.includes(option.value)}
                            onChange={() => toggleZusatz(option.value)}
                            className="w-4 h-4 text-emerald-600 rounded"
                          />
                          <span className="text-white text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleBack}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Zurück</span>
                </button>
                <button
                  onClick={handleNext}
                  disabled={!hasSelectedService()}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                >
                  <span>Weiter</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-3 text-lg">
                  Wunschtermin auswählen *
                </label>
                <p className="text-zinc-400 text-sm mb-4">
                  Verfügbare Termine in den nächsten 14 Tagen
                </p>

                {availableSlots.length === 0 ? (
                  <div className="p-6 bg-zinc-800 border border-zinc-700 rounded-lg text-center">
                    <p className="text-zinc-400">
                      Aktuell sind keine Termine verfügbar. Bitte versuchen Sie es später erneut oder rufen Sie uns an.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {availableSlots
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .map((slot) => {
                        const dateObj = new Date(slot.date + 'T12:00:00');
                        const dayName = dateObj.toLocaleDateString('de-DE', { weekday: 'long' });
                        const dateStr = dateObj.toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        });
                        const slotName = 'Ganztags (08:00-18:00)';

                        return (
                          <div key={`${slot.date}_${slot.slot}`} className="p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
                            <div className="mb-3">
                              <div className="text-white font-medium">{dayName}</div>
                              <div className="text-zinc-400 text-sm">{dateStr} - {slotName}</div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {slot.times.map((time) => {
                                const isBooked = bookedTimes[slot.date]?.includes(time);
                                const isSelected = formData.preferredDate === slot.date && formData.preferredTime === time;

                                return (
                                  <button
                                    key={time}
                                    type="button"
                                    disabled={isBooked}
                                    onClick={() => {
                                      if (!isBooked) {
                                        setFormData({
                                          ...formData,
                                          preferredDate: slot.date,
                                          preferredTime: time,
                                        });
                                        setTimeout(() => {
                                          handleNext();
                                        }, 300);
                                      }
                                    }}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                      isSelected
                                        ? 'bg-emerald-600 text-white border-2 border-emerald-500'
                                        : isBooked
                                        ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed border border-zinc-600'
                                        : 'bg-zinc-900 text-white border border-zinc-600 hover:border-emerald-600 hover:bg-zinc-800'
                                    }`}
                                  >
                                    {time}
                                    {isBooked && (
                                      <span className="block text-xs mt-0.5">Belegt</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleBack}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Zurück</span>
                </button>
                <button
                  onClick={handleNext}
                  disabled={!formData.preferredDate || !formData.preferredTime}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                >
                  <span>Weiter</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  placeholder="Ihr Name"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Telefon *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  placeholder="+49 123 456789"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">E-Mail *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  placeholder="ihre@email.de"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Genaue Adresse *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  placeholder="Straße, Hausnummer"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Anmerkungen (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  rows={3}
                  placeholder="z.B. besondere Anforderungen..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Zurück</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.name || !formData.phone || !formData.email || !formData.address}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                >
                  {isSubmitting ? 'Wird gesendet...' : 'Termin anfragen'}
                </button>
              </div>
            </form>
          )}

          {step === 5 && isSuccess && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Vielen Dank!</h3>
              <p className="text-zinc-400 mb-8 leading-relaxed">
                Ihre Terminanfrage wurde erfolgreich übermittelt. Wir werden uns kurzfristig per Telefon oder WhatsApp bei Ihnen melden, um den Termin zu bestätigen.
              </p>
              <button
                onClick={resetForm}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
              >
                Fertig
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
