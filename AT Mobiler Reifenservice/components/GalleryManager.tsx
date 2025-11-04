'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import type { GalleryImage } from '@/lib/types';
import { sanitizeGalleryImage, toTags, fromTags, validateImgurUrl, uploadToImgur } from '@/lib/gallery-helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Upload,
  Image as ImageIcon,
  Star,
  Eye,
  EyeOff,
} from 'lucide-react';

const ITEMS_PER_PAGE = 50;
const IMGUR_CLIENT_ID = process.env.NEXT_PUBLIC_IMGUR_CLIENT_ID;

export default function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCity, setFilterCity] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterPublished, setFilterPublished] = useState<boolean | null>(null);

  const [formData, setFormData] = useState({
    url: '',
    thumbUrl: '',
    title: '',
    alt: '',
    city: '',
    tags: '',
    featured: false,
    published: true,
    order: 999,
  });

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadImages();
  }, [filterCity, filterTag, filterPublished]);

  const loadImages = async (loadMore = false) => {
    setLoading(true);
    try {
      let q = query(
        collection(db, 'gallery'),
        limit(100)
      );

      const snapshot = await getDocs(q);
      let newImages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GalleryImage[];

      newImages.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        if (a.featured !== b.featured) return b.featured ? 1 : -1;
        if (a.order !== b.order) return (b.order || 0) - (a.order || 0);
        return bTime - aTime;
      });

      setImages(newImages);
      setLastDoc(null);
      setHasMore(false);
    } catch (error) {
      console.error('Fehler beim Laden:', error);
      toast.error('Fehler beim Laden der Bilder');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadToImgur = async () => {
    if (!uploadFile || !IMGUR_CLIENT_ID) return;

    setUploading(true);
    try {
      const url = await uploadToImgur(uploadFile, IMGUR_CLIENT_ID);
      setFormData((prev) => ({ ...prev, url, thumbUrl: url }));
      toast.success('Bild zu Imgur hochgeladen');
      setUploadFile(null);
    } catch (error) {
      toast.error('Fehler beim Hochladen zu Imgur');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.url) {
      toast.error('Bitte Imgur-URL eingeben');
      return;
    }

    if (!validateImgurUrl(formData.url)) {
      toast.error('Bitte gültige Imgur-URL (i.imgur.com) eingeben');
      return;
    }

    try {
      const payload = sanitizeGalleryImage({
        url: formData.url,
        thumbUrl: formData.thumbUrl || formData.url,
        title: formData.title || '',
        alt: formData.alt || formData.title || '',
        city: formData.city || '',
        tags: toTags(formData.tags),
        featured: formData.featured,
        published: formData.published,
        order: formData.order,
        createdAt: serverTimestamp(),
        createdBy: 'admin',
      });

      await addDoc(collection(db, 'gallery'), payload);
      toast.success('Bild gespeichert');

      setFormData({
        url: '',
        thumbUrl: '',
        title: '',
        alt: '',
        city: '',
        tags: '',
        featured: false,
        published: true,
        order: 999,
      });

      loadImages();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      toast.error('Fehler beim Speichern');
    }
  };

  const handleUpdate = async (id: string, updates: Partial<GalleryImage>) => {
    try {
      const docRef = doc(db, 'gallery', id);
      await updateDoc(docRef, sanitizeGalleryImage(updates));
      toast.success('Aktualisiert');
      loadImages();
      setEditingId(null);
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
      toast.error('Fehler beim Aktualisieren');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Wirklich löschen?')) return;

    try {
      await deleteDoc(doc(db, 'gallery', id));
      toast.success('Gelöscht');
      loadImages();
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      toast.error('Fehler beim Löschen');
    }
  };

  const cities = Array.from(new Set(images.map((img) => img.city).filter(Boolean)));
  const allTags = Array.from(new Set(images.flatMap((img) => img.tags)));

  const filteredImages = images.filter((img) => {
    if (filterCity && img.city !== filterCity) return false;
    if (filterTag && !img.tags.includes(filterTag)) return false;
    if (filterPublished !== null && img.published !== filterPublished) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Galerie – Bilder verwalten</h1>
            <p className="text-zinc-400 mt-2">Verwalten Sie Ihre Galerie-Bilder</p>
          </div>
        </div>

        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Plus className="w-5 h-5" />
              Bild hinzufügen
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Fügen Sie ein neues Bild zur Galerie hinzu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {IMGUR_CLIENT_ID && (
                <div className="space-y-2">
                  <Label className="text-white">Bei Imgur hochladen (optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="bg-zinc-700 border-zinc-600 text-white"
                    />
                    <Button
                      type="button"
                      onClick={handleUploadToImgur}
                      disabled={!uploadFile || uploading}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Wird hochgeladen...' : 'Hochladen'}
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-white">
                    Imgur URL *
                  </Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://i.imgur.com/abc123.webp"
                    className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbUrl" className="text-white">
                    Thumb URL (optional)
                  </Label>
                  <Input
                    id="thumbUrl"
                    value={formData.thumbUrl}
                    onChange={(e) => setFormData({ ...formData, thumbUrl: e.target.value })}
                    placeholder="https://i.imgur.com/abc123m.webp"
                    className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">
                    Titel
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Montage vor Ort"
                    className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alt" className="text-white">
                    Alt-Text (SEO)
                  </Label>
                  <Input
                    id="alt"
                    value={formData.alt}
                    onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                    placeholder="Mobiler Reifenservice – Montage beim Kunden"
                    className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-white">
                    Stadt
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Landshut"
                    className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-white">
                    Tags (Kommagetrennt)
                  </Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="PKW, Vor-Ort"
                    className="bg-zinc-700 border-zinc-600 text-white placeholder:text-zinc-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order" className="text-white">
                    Sortierung
                  </Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 999 })}
                    className="bg-zinc-700 border-zinc-600 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
                  />
                  <Label htmlFor="featured" className="text-white cursor-pointer">
                    Featured
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData({ ...formData, published: checked as boolean })}
                  />
                  <Label htmlFor="published" className="text-white cursor-pointer">
                    Veröffentlicht
                  </Label>
                </div>
              </div>

              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                Speichern
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader>
            <CardTitle className="text-white">Alle Bilder</CardTitle>
            <div className="flex flex-wrap gap-2 mt-4">
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="bg-zinc-700 border-zinc-600 text-white rounded-md px-3 py-1.5"
              >
                <option value="">Alle Städte</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="bg-zinc-700 border-zinc-600 text-white rounded-md px-3 py-1.5"
              >
                <option value="">Alle Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>

              <select
                value={filterPublished === null ? '' : String(filterPublished)}
                onChange={(e) => setFilterPublished(e.target.value === '' ? null : e.target.value === 'true')}
                className="bg-zinc-700 border-zinc-600 text-white rounded-md px-3 py-1.5"
              >
                <option value="">Alle Status</option>
                <option value="true">Veröffentlicht</option>
                <option value="false">Nicht veröffentlicht</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterCity('');
                  setFilterTag('');
                  setFilterPublished(null);
                }}
                className="border-zinc-600 text-white hover:bg-zinc-700"
              >
                <X className="w-4 h-4 mr-1" />
                Filter zurücksetzen
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="flex gap-4 p-4 bg-zinc-700/50 rounded-lg border border-zinc-600"
                >
                  <img
                    src={image.thumbUrl || image.url}
                    alt={image.alt}
                    className="w-24 h-24 object-cover rounded-md"
                  />

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{image.title || 'Ohne Titel'}</h3>
                        <p className="text-sm text-zinc-400">{image.city}</p>
                      </div>

                      <div className="flex gap-2">
                        {image.featured && (
                          <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-500 border-yellow-600/30">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {image.published ? (
                          <Badge variant="secondary" className="bg-emerald-600/20 text-emerald-500 border-emerald-600/30">
                            <Eye className="w-3 h-3 mr-1" />
                            Sichtbar
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-zinc-600/20 text-zinc-400 border-zinc-600/30">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Versteckt
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {image.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs border-zinc-500 text-zinc-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(image.id!)}
                        className="border-red-600 text-red-500 hover:bg-red-600/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredImages.length === 0 && (
                <div className="text-center py-12 text-zinc-400">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Keine Bilder gefunden</p>
                </div>
              )}

              {hasMore && !loading && (
                <Button
                  onClick={() => loadImages(true)}
                  variant="outline"
                  className="w-full border-zinc-600 text-white hover:bg-zinc-700"
                >
                  Mehr laden
                </Button>
              )}

              {loading && (
                <div className="text-center py-4 text-zinc-400">Wird geladen...</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
