'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Plus, Trash2 } from 'lucide-react';

interface TimeSlot {
  id: string;
  date: string;
  slot: 'fullday';
  times: string[];
}

const DAILY_TIMES = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

export default function TimeSlotManager() {
  const [enabledSlots, setEnabledSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEnabledSlots();
  }, []);

  const loadEnabledSlots = async () => {
    setLoading(true);
    try {
      if (!db) return;

      const slotsSnapshot = await getDocs(collection(db, 'availableSlots'));
      const slots: TimeSlot[] = [];

      slotsSnapshot.forEach((doc) => {
        slots.push({ id: doc.id, ...doc.data() } as TimeSlot);
      });

      setEnabledSlots(slots.sort((a, b) => a.date.localeCompare(b.date)));
    } catch (error) {
      console.error('Error loading slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const enableSlot = async (date: string) => {
    if (!db) return;

    const slotId = `${date}_fullday`;

    try {
      await setDoc(doc(db, 'availableSlots', slotId), {
        date,
        slot: 'fullday',
        times: DAILY_TIMES,
      });
      await loadEnabledSlots();
    } catch (error) {
      console.error('Error enabling slot:', error);
      alert('Fehler beim Aktivieren des Slots');
    }
  };

  const disableSlot = async (slotId: string) => {
    if (!db) return;

    try {
      await deleteDoc(doc(db, 'availableSlots', slotId));
      await loadEnabledSlots();
    } catch (error) {
      console.error('Error disabling slot:', error);
      alert('Fehler beim Deaktivieren des Slots');
    }
  };

  const isSlotEnabled = (date: string) => {
    return enabledSlots.some(s => s.date === date && s.slot === 'fullday');
  };

  const getNextDays = (count: number) => {
    const days = [];
    let added = 0;
    let offset = 0;

    while (added < count) {
      const date = new Date();
      date.setDate(date.getDate() + offset);

      if (date.getDay() !== 0) {
        days.push(date.toISOString().split('T')[0]);
        added++;
      }
      offset++;
    }
    return days;
  };

  const nextDays = getNextDays(14);

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-800 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Verfügbare Termine verwalten</span>
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Aktivieren Sie die verfügbaren Zeitfenster für die nächsten 14 Tage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {nextDays.map((date) => {
              const dateObj = new Date(date + 'T12:00:00');
              const dayName = dateObj.toLocaleDateString('de-DE', { weekday: 'long' });
              const dateStr = dateObj.toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });

              const fulldayEnabled = isSlotEnabled(date);

              return (
                <div key={date} className="p-4 bg-zinc-900 rounded-lg border border-zinc-700">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-white font-medium">{dayName}</div>
                      <div className="text-zinc-400 text-sm">{dateStr}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1">
                    <div className={`p-3 rounded-lg border-2 transition-all ${
                      fulldayEnabled
                        ? 'bg-emerald-600/20 border-emerald-600'
                        : 'bg-zinc-800 border-zinc-700'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-white font-medium">Ganztags</div>
                        {fulldayEnabled ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => disableSlot(`${date}_fullday`)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => enableSlot(date)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Aktivieren
                          </Button>
                        )}
                      </div>
                      <div className="text-sm text-zinc-400">
                        08:00 - 18:00 Uhr (jede Stunde)
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-800 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-white">Aktive Termine</CardTitle>
        </CardHeader>
        <CardContent>
          {enabledSlots.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              Keine aktiven Termine vorhanden
            </div>
          ) : (
            <div className="space-y-2">
              {enabledSlots.map((slot) => {
                const dateObj = new Date(slot.date + 'T12:00:00');
                const dateStr = dateObj.toLocaleDateString('de-DE', {
                  weekday: 'long',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                });
                return (
                  <div key={slot.id} className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg">
                    <div>
                      <div className="text-white font-medium">{dateStr}</div>
                      <div className="text-zinc-400 text-sm">
                        Ganztags: 08:00 - 18:00 Uhr (jede Stunde)
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => disableSlot(slot.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
