'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const DAILY_TIMES = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

export default function CleanSlotsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [slots, setSlots] = useState<any[]>([]);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const slotsSnapshot = await getDocs(collection(db, 'availableSlots'));
      const loadedSlots: any[] = [];

      slotsSnapshot.forEach((doc) => {
        loadedSlots.push({ id: doc.id, ...doc.data() });
      });

      setSlots(loadedSlots);
      setMessage(`Намерени ${loadedSlots.length} слота`);
    } catch (error) {
      console.error('Error loading slots:', error);
      setMessage('Грешка при зареждане: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const cleanAllSlots = async () => {
    if (!confirm('Сигурни ли сте, че искате да изтриете ВСИЧКИ стари слотове?')) {
      return;
    }

    setLoading(true);
    try {
      const slotsSnapshot = await getDocs(collection(db, 'availableSlots'));
      let deleted = 0;

      for (const slotDoc of slotsSnapshot.docs) {
        await deleteDoc(doc(db, 'availableSlots', slotDoc.id));
        deleted++;
      }

      setMessage(`✅ Изтрити ${deleted} слота`);
      setSlots([]);
    } catch (error) {
      console.error('Error cleaning slots:', error);
      setMessage('Грешка при изтриване: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const convertToFullday = async () => {
    if (!confirm('Сигурни ли сте, че искате да конвертирате старите слотове към нови (fullday)?')) {
      return;
    }

    setLoading(true);
    try {
      const slotsSnapshot = await getDocs(collection(db, 'availableSlots'));
      const dates = new Set<string>();

      // Събираме всички дати
      slotsSnapshot.forEach((doc) => {
        const data = doc.data();
        dates.add(data.date);
      });

      // Изтриваме старите
      for (const slotDoc of slotsSnapshot.docs) {
        await deleteDoc(doc(db, 'availableSlots', slotDoc.id));
      }

      // Създаваме новите fullday слотове
      let created = 0;
      for (const date of dates) {
        const slotId = `${date}_fullday`;
        await setDoc(doc(db, 'availableSlots', slotId), {
          date,
          slot: 'fullday',
          times: DAILY_TIMES,
        });
        created++;
      }

      setMessage(`✅ Конвертирани ${created} дати към fullday слотове (08:00-18:00)`);
      await loadSlots();
    } catch (error) {
      console.error('Error converting slots:', error);
      setMessage('Грешка при конвертиране: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Изчистване на стари часови слотове</CardTitle>
            <CardDescription className="text-zinc-400">
              Използвайте тази страница за изчистване и конвертиране на старите часови слотове
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button
                onClick={loadSlots}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Покажи текущи слотове
              </Button>

              <Button
                onClick={convertToFullday}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Конвертирай към нови (08:00-18:00)
              </Button>

              <Button
                onClick={cleanAllSlots}
                disabled={loading}
                variant="destructive"
              >
                Изтрий всички
              </Button>
            </div>

            {message && (
              <div className="p-4 bg-zinc-800 border border-zinc-700 rounded-lg text-white">
                {message}
              </div>
            )}

            {slots.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-white font-semibold">Намерени слотове:</h3>
                {slots.map((slot) => (
                  <div key={slot.id} className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg">
                    <div className="text-white font-medium">{slot.date}</div>
                    <div className="text-zinc-400 text-sm">
                      Slot: {slot.slot} | Times: {slot.times?.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
