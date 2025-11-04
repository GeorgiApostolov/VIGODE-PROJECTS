/*
  # Initial Schema for AT Mobiler Reifenservice

  1. New Tables
    - site - Site configuration and contact info
    - slides - Page content (startseite, preise, kontakt)
    - faqs - Frequently asked questions
    - bookings - Customer booking requests

  2. Security
    - Enable RLS on all tables
    - Public read access for site, slides, and faqs
    - Insert-only access for bookings
*/

CREATE TABLE IF NOT EXISTS site (
  id text PRIMARY KEY,
  brand text NOT NULL DEFAULT 'AT Mobiler Reifenservice',
  phone text NOT NULL DEFAULT '+49 173 3014592',
  whatsapp text NOT NULL DEFAULT '+49 173 3014592',
  email text NOT NULL DEFAULT 'at.mobiler.reifenservice@gmail.com',
  city text NOT NULL DEFAULT 'Landshut',
  service_area text[] NOT NULL DEFAULT ARRAY['Landshut', 'Ergolding', 'Altdorf', 'Essenbach', 'Moosburg a.d. Isar'],
  opening_hours jsonb NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS slides (
  id text PRIMARY KEY,
  title text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  order_index integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  postal_code text NOT NULL,
  service text NOT NULL,
  city text NOT NULL,
  preferred_date date NOT NULL,
  preferred_time text NOT NULL,
  notes text,
  source text NOT NULL DEFAULT 'web'
);

ALTER TABLE site ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for site" ON site;
CREATE POLICY "Public read access for site"
  ON site FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Public read access for slides" ON slides;
CREATE POLICY "Public read access for slides"
  ON slides FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Public read access for faqs" ON faqs;
CREATE POLICY "Public read access for faqs"
  ON faqs FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Allow bookings insert" ON bookings;
CREATE POLICY "Allow bookings insert"
  ON bookings FOR INSERT
  TO public
  WITH CHECK (true);

INSERT INTO site (id, brand, phone, whatsapp, email, city, service_area, opening_hours)
VALUES (
  'main',
  'AT Mobiler Reifenservice',
  '+49 173 3014592',
  '+49 173 3014592',
  'at.mobiler.reifenservice@gmail.com',
  'Landshut',
  ARRAY['Landshut', 'Ergolding', 'Altdorf', 'Essenbach', 'Moosburg a.d. Isar'],
  '[
    {"days": "Mo–Fr", "open": "08:00", "close": "18:00"},
    {"days": "Sa", "open": "08:00", "close": "16:00"}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO slides (id, title, content)
VALUES
  ('startseite', 'STARTSEITE', '{
    "intro": "Wir freuen uns, dass Sie sich entschieden haben. An dieser Stelle möchten wir danken und unsere Leistungen vorstellen. Neben Privatkunden betreuen wir auch gerne Gewerbekunden.",
    "body": "Wir wechseln die Räder von PKW, Transporter, LLKW, Motorräder, Anhänger sowie Wohnmobile und Wohnwagen – am gewünschten Ort und Stelle. \"Schnell. Bequem. Direkt vor Ihrer Tür\"",
    "bullets": ["Reifen Montage und Demontage", "Auswuchten", "Räderwechseln", "Saisonale Einlagerung", "Reifenreparatur", "Reifenverkauf", "Schneller Service, Flexibilität und Professionalität"],
    "heroHeadline": "Mobiler Reifenservice – Schnell bei Ihnen vor Ort",
    "heroSub": "Reifenwechsel, Auswuchten, RDKS – direkt vor Ihrer Tür. Termin in 60 Sekunden.",
    "usp": ["Vor-Ort-Service", "Keine Wartezeit", "Kartenzahlung möglich", "24/7 Notdienst verfügbar"]
  }'::jsonb),
  ('preise', 'PREISE', '{
    "lists": [
      {
        "heading": "Reifenmontage (4 Räder)",
        "items": ["13\"–17\" … 85€", "18\" … 95€", "19\" … 110€", "20\" … 120€"]
      },
      {
        "heading": "Radwechsel (4 Räder)",
        "items": ["PKW … 40€", "LLKW bis 3.5t / Wohnmobil … 50€"]
      },
      {
        "heading": "Zusatzleistungen",
        "items": ["Auswuchten – pro Rad zzgl. 7,50€", "Reifenreparatur – pro Stück 40€", "Reifenentsorgung – ohne Felge je 5€, mit Felge je 10€", "Reifeneinlagerung – ab 70€ (mit Umstecken & Räderwäsche)"]
      }
    ],
    "ctaText": "Transparente Festpreise – Termin jetzt sichern"
  }'::jsonb),
  ('kontakt', 'KONTAKT', '{
    "lead": "Rufen Sie jetzt an und vereinbaren Sie Ihren mobilen Reifenwechsel – wir kümmern uns um den Rest!",
    "channels": [
      {"type": "phone", "label": "Phone", "value": "+49 173 3014592"},
      {"type": "whatsapp", "label": "WhatsApp", "value": "+49 173 3014592"},
      {"type": "email", "label": "Email", "value": "at.mobiler.reifenservice@gmail.com"}
    ],
    "buttons": [
      {"label": "Jetzt anrufen", "action": "tel:+491733014592", "icon": "phone"},
      {"label": "WhatsApp schreiben", "action": "https://wa.me/491733014592", "icon": "whatsapp"},
      {"label": "E-Mail schreiben", "action": "mailto:at.mobiler.reifenservice@gmail.com", "icon": "mail"}
    ]
  }'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO faqs (question, answer, order_index)
VALUES
  ('Wie lange dauert ein Reifenwechsel vor Ort?', 'In der Regel 30–45 Minuten für 4 Räder inklusive Auswuchten – abhängig von Fahrzeug und Setup.', 1),
  ('Brauche ich eine Steckdose oder Garage?', 'Nein. Unser Service-Fahrzeug ist vollständig ausgerüstet. Ein ebener Parkplatz reicht aus.', 2),
  ('Unterstützt ihr Runflat und RDKS?', 'Ja, inkl. Programmierung und Anlernen von RDKS/TPMS.', 3),
  ('Wie kann ich bezahlen?', 'Bar, EC- und Kreditkarte sowie kontaktlos.', 4)
ON CONFLICT DO NOTHING;