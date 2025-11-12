import { Facebook, Instagram, Mail } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-neutral-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold text-xl mb-4">Barbershop Gentlemen's 13</h3>
            <p className="text-neutral-400 mb-4">
              Премиум подстрижки и бради за джентълмени.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/p/Gentlemens-club-Barber-Shop-13-100063501159654/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-neutral-900 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/barbershop.gentlemens.club13/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-neutral-900 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="mailto:info@barbershopgentlemens13.com"
                className="bg-neutral-900 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Бързи връзки</h4>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-neutral-400 hover:text-red-600 transition-colors">
                  Начало
                </a>
              </li>
              <li>
                <a href="#services" className="text-neutral-400 hover:text-red-600 transition-colors">
                  Услуги
                </a>
              </li>
              <li>
                <a href="#team" className="text-neutral-400 hover:text-red-600 transition-colors">
                  Екип
                </a>
              </li>
              <li>
                <a href="#booking" className="text-neutral-400 hover:text-red-600 transition-colors">
                  Запази час
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Информация</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-neutral-400 hover:text-red-600 transition-colors">
                  Политика за поверителност
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-red-600 transition-colors">
                  Общи условия
                </a>
              </li>
              <li>
                <a href="#contact" className="text-neutral-400 hover:text-red-600 transition-colors">
                  Контакт
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-8 text-center">
          <p className="text-neutral-400 text-sm">
            © {currentYear} Barbershop Gentlemen's 13. Всички права запазени.
          </p>
        </div>
      </div>
    </footer>
  );
}
