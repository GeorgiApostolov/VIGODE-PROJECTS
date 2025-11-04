'use client';

import { useState } from 'react';
import { seedFirestoreData } from '@/lib/seed-data';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleSeed = async () => {
    setLoading(true);
    setResult('');
    try {
      const response = await seedFirestoreData();
      if (response.success) {
        setResult('Daten erfolgreich in Firebase gespeichert!');
      } else {
        setResult('Fehler beim Speichern. Siehe Konsole.');
      }
    } catch (error) {
      const err = error as Error;
      setResult('Fehler: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMigrate = async () => {
    setLoading(true);
    setResult('');
    try {
      const snapshot = await getDocs(collection(db, 'gallery'));
      let updated = 0;

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (!data.url && data.thumbUrl) {
          await updateDoc(doc(db, 'gallery', docSnap.id), {
            url: data.thumbUrl
          });
          updated++;
        }
      }

      setResult(`Migration abgeschlossen! ${updated} Dokumente aktualisiert.`);
    } catch (error) {
      const err = error as Error;
      setResult('Fehler: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Firebase Daten laden</h1>
        <p className="text-zinc-400 mb-6">
          Klicken Sie, um Beispieldaten in Firebase Firestore zu laden.
        </p>
        <button
          onClick={handleSeed}
          disabled={loading}
          className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700 text-white rounded-lg font-semibold mb-3"
        >
          {loading ? 'Wird geladen...' : 'Daten initialisieren'}
        </button>
        <button
          onClick={handleMigrate}
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 text-white rounded-lg font-semibold"
        >
          {loading ? 'Wird geladen...' : 'URL-Felder migrieren'}
        </button>
        {result && (
          <div className="mt-6 p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
            <p className="text-white">{result}</p>
          </div>
        )}
        <div className="mt-6 text-center">
          <a href="/" className="text-emerald-500 hover:text-emerald-400">
            Zurück zur Startseite
          </a>
        </div>
      </div>
    </div>
  );
}
