import Link from 'next/link';
import { Facebook } from 'lucide-react';

interface FooterProps {
  brand: string;
  phone: string;
  email: string;
  city: string;
}

export default function Footer({ brand, phone, email, city }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">{brand}</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Mobiler Reifenservice in {city} und Umgebung. Schnell, bequem, direkt vor Ihrer Tür.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://www.facebook.com/61581505861948"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
                  Startseite
                </Link>
              </li>
              <li>
                <Link href="/preise" className="text-zinc-400 hover:text-white transition-colors">
                  Preise
                </Link>
              </li>
              <li>
                <Link href="/galerie" className="text-zinc-400 hover:text-white transition-colors">
                  Galerie
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="text-zinc-400 hover:text-white transition-colors">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Kontakt</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-zinc-400 hover:text-white transition-colors">
                  {phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`} className="text-zinc-400 hover:text-white transition-colors">
                  {email}
                </a>
              </li>
              <li className="text-zinc-400">{city}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800 text-center">
          <p className="text-zinc-500 text-sm">
            © {currentYear} {brand}. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}
