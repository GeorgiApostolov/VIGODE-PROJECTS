# AT Mobiler Reifenservice - Website

Moderne, hochperformante Website für mobilen Reifenservice in Landshut und Umgebung.

## Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Firebase/Firestore
- **Language**: TypeScript

## Erste Schritte

### 1. Firebase Konfiguration

Fügen Sie Ihre Firebase-Credentials in die `.env` Datei ein:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=at-mobiler-reifenservice.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=at-mobiler-reifenservice
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=at-mobiler-reifenservice.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 2. Firestore Daten initialisieren

1. Starten Sie die Entwicklungsumgebung: `npm run dev`
2. Öffnen Sie `/seed` in Ihrem Browser
3. Klicken Sie auf "Daten initialisieren"

Dies lädt die Beispieldaten in Ihre Firestore-Datenbank:
- Site-Informationen
- Seiteninhalte (Startseite, Preise, Kontakt)
- FAQ-Einträge

### 3. Firestore Security Rules

Setzen Sie folgende Security Rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /site/{docId} { allow read: if true; allow write: if false; }
    match /slides/{docId} { allow read: if true; allow write: if false; }
    match /faqs/{docId} { allow read: if true; allow write: if false; }
    match /bookings/{docId} {
      allow read: if false;
      allow create: if true;
    }
  }
}
```

## Entwicklung

```bash
npm run dev
```

Öffnen Sie [http://localhost:3000](http://localhost:3000)

## Deployment

1. Stellen Sie sicher, dass alle Firebase-Credentials korrekt sind
2. Build erstellen: `npm run build`
3. Production Server starten: `npm start`

## Seiten

- `/` - Startseite mit Hero, Leistungen, Servicegebiet
- `/preise` - Preisübersicht
- `/kontakt` - Kontaktinformationen
- `/service/[city]` - Stadt-spezifische Landing Pages
- `/seed` - Daten-Initialisierung (nur für Setup)

## Features

- ✅ Mobil-optimiert mit Sticky Bottom Bar
- ✅ Booking-System mit mehrstufigem Formular
- ✅ SEO-optimiert mit JSON-LD Schema
- ✅ Firestore-Integration für dynamische Inhalte
- ✅ Responsive Design mit dunklem Theme
- ✅ Stadt-spezifische Landing Pages für SEO
