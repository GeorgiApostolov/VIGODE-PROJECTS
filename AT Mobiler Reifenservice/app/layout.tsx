import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mobiler Reifenservice in Landshut | Vor-Ort Reifenwechsel & Notdienst',
  description: 'Schneller mobiler Reifenservice in Landshut & Umgebung. Reifenwechsel, Auswuchten, RDKS – direkt bei Ihnen. Termin in 60 Sekunden oder jetzt anrufen!',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
