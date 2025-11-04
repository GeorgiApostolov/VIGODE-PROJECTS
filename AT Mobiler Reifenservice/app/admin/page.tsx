'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock } from 'lucide-react';
import GalleryManager from '@/components/GalleryManager';
import TimeSlotManager from '@/components/TimeSlotManager';

const ADMIN_PASSWORD = '1bg2bg3bg';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const adminOk = sessionStorage.getItem('admin_ok');
    if (adminOk === '1') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_ok', '1');
      setIsAuthenticated(true);
    } else {
      setError('Falsches Passwort. Bitte versuchen Sie es erneut.');
      setPassword('');
    }
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
            <CardTitle className="text-2xl text-white">Adminbereich</CardTitle>
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
          <h1 className="text-3xl font-bold text-white mb-2">Adminbereich</h1>
          <p className="text-zinc-400">Verwalten Sie Termine und Galerie</p>
        </div>

        <Tabs defaultValue="timeslots" className="space-y-6">
          <TabsList className="bg-zinc-800 border border-zinc-700">
            <TabsTrigger value="timeslots" className="data-[state=active]:bg-emerald-600">
              Termine verwalten
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-emerald-600">
              Galerie verwalten
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeslots">
            <TimeSlotManager />
          </TabsContent>

          <TabsContent value="gallery">
            <GalleryManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
