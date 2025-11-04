'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Calendar, Clock, User, Phone, Mail, MapPin, FileText, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ADMIN_PASSWORD = '1bg2bg3bg';

interface Booking {
  id: string;
  createdAt: any;
  name: string;
  phone: string;
  email?: string;
  postalCode: string;
  city: string;
  services: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
  source: string;
}

export default function BookingsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const adminOk = sessionStorage.getItem('admin_ok');
    if (adminOk === '1') {
      setIsAuthenticated(true);
      loadBookings();
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_ok', '1');
      setIsAuthenticated(true);
      loadBookings();
    } else {
      setError('Falsches Passwort. Bitte versuchen Sie es erneut.');
      setPassword('');
    }
  };

  const loadBookings = async () => {
    try {
      const { initializeApp, getApps } = await import('firebase/app');
      const { getFirestore, collection, getDocs, query, orderBy } = await import('firebase/firestore');

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

      const bookingsQuery = query(
        collection(db, 'bookings'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(bookingsQuery);
      const bookingsData: Booking[] = [];

      snapshot.forEach((doc) => {
        bookingsData.push({ id: doc.id, ...doc.data() } as Booking);
      });

      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      const { initializeApp, getApps } = await import('firebase/app');
      const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');

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

      await deleteDoc(doc(db, 'bookings', id));
      await loadBookings();
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Fehler beim Löschen der Buchung');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatBookingDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-white">Laden...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-800 border-zinc-700">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-emerald-600/20 flex items-center justify-center">
              <Lock className="w-8 h-8 text-emerald-500" />
            </div>
            <CardTitle className="text-2xl text-white">Buchungen anzeigen</CardTitle>
            <CardDescription className="text-zinc-400">
              Bitte Passwort eingeben
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Passwort
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-500"
                  placeholder="Passwort eingeben"
                  autoFocus
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-md border border-red-500/20">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Anmelden
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Buchungen</h1>
          <p className="text-zinc-400">Alle Terminanfragen im Überblick ({bookings.length} gesamt)</p>
        </div>

        {bookings.length === 0 ? (
          <Card className="bg-zinc-800 border-zinc-700">
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">Noch keine Buchungen vorhanden</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="bg-zinc-800 border-zinc-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center space-x-2">
                        <User className="w-5 h-5" />
                        <span>{booking.name}</span>
                      </CardTitle>
                      <CardDescription className="text-zinc-400 mt-1">
                        Eingegangen: {formatDate(booking.createdAt)}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(booking.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Calendar className="w-5 h-5 text-emerald-500 mt-0.5" />
                        <div>
                          <div className="text-zinc-400 text-sm">Wunschtermin</div>
                          <div className="text-white font-medium">{formatBookingDate(booking.preferredDate)}</div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-emerald-500 mt-0.5" />
                        <div>
                          <div className="text-zinc-400 text-sm">Uhrzeit</div>
                          <div className="text-white font-medium">{booking.preferredTime} Uhr</div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Phone className="w-5 h-5 text-emerald-500 mt-0.5" />
                        <div>
                          <div className="text-zinc-400 text-sm">Telefon</div>
                          <div className="text-white font-medium">
                            <a href={`tel:${booking.phone}`} className="hover:text-emerald-400 transition-colors">
                              {booking.phone}
                            </a>
                          </div>
                        </div>
                      </div>

                      {booking.email && (
                        <div className="flex items-start space-x-3">
                          <Mail className="w-5 h-5 text-emerald-500 mt-0.5" />
                          <div>
                            <div className="text-zinc-400 text-sm">E-Mail</div>
                            <div className="text-white font-medium">
                              <a href={`mailto:${booking.email}`} className="hover:text-emerald-400 transition-colors">
                                {booking.email}
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-emerald-500 mt-0.5" />
                        <div>
                          <div className="text-zinc-400 text-sm">Standort</div>
                          <div className="text-white font-medium">
                            {booking.postalCode} {booking.city}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <FileText className="w-5 h-5 text-emerald-500 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-zinc-400 text-sm">Dienstleistungen</div>
                          <div className="text-white font-medium">{booking.services}</div>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="flex items-start space-x-3">
                          <FileText className="w-5 h-5 text-emerald-500 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-zinc-400 text-sm">Anmerkungen</div>
                            <div className="text-white">{booking.notes}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-zinc-800 border-zinc-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Buchung löschen?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Diese Aktion kann nicht rückgängig gemacht werden. Die Buchung wird dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-700 text-white border-zinc-600 hover:bg-zinc-600">
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteBooking(deleteId)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
