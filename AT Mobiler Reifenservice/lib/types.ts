export interface SiteData {
  brand: string;
  phone: string;
  whatsapp: string;
  email: string;
  city: string;
  serviceArea: string[];
  openingHours: {
    days: string;
    open: string;
    close: string;
  }[];
}

export interface SlideStartseite {
  title: string;
  intro: string;
  body: string;
  bullets: string[];
  heroHeadline: string;
  heroSub: string;
  usp: string[];
}

export interface PreiseList {
  heading: string;
  items: string[];
}

export interface SlidePreise {
  title: string;
  lists: PreiseList[];
  ctaText: string;
}

export interface KontaktChannel {
  type: string;
  label: string;
  value: string;
}

export interface KontaktButton {
  label: string;
  action: string;
  icon: string;
}

export interface SlideKontakt {
  title: string;
  lead: string;
  channels: KontaktChannel[];
  buttons: KontaktButton[];
}

export interface FAQ {
  q: string;
  a: string;
}

export interface Booking {
  createdAt: Date;
  name: string;
  phone: string;
  email: string | null;
  postalCode: string;
  service: 'Montage' | 'Radwechsel' | 'Auswuchten' | 'Reparatur' | 'Einlagerung';
  city: string;
  preferredDate: string;
  preferredTime: string;
  notes: string | null;
  source: string;
}

export interface GalleryImage {
  id?: string;
  title: string;
  alt: string;
  url: string;
  thumbUrl: string;
  city: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  order: number;
  createdAt: any;
  createdBy: string;
}
