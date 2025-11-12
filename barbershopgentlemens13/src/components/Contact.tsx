import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export function Contact() {
  return (
    <section id="contact" className="py-20 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Контакт</h2>
          <div className="w-24 h-1 bg-red-600 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="bg-neutral-900 border-2 border-neutral-800 rounded-lg p-6 hover:border-red-600 transition-colors">
              <div className="flex items-start">
                <div className="bg-red-600/10 p-3 rounded-lg mr-4">
                  <MapPin className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Адрес</h3>
                  <p className="text-neutral-300">
                    Nikolaevska str. 13<br />
                    Berkovitsa 3500, България
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border-2 border-neutral-800 rounded-lg p-6 hover:border-red-600 transition-colors">
              <div className="flex items-start">
                <div className="bg-red-600/10 p-3 rounded-lg mr-4">
                  <Phone className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Телефон</h3>
                  <a href="tel:+359877506242" className="text-neutral-300 hover:text-red-600 transition-colors">
                    087 750 6242
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border-2 border-neutral-800 rounded-lg p-6 hover:border-red-600 transition-colors">
              <div className="flex items-start">
                <div className="bg-red-600/10 p-3 rounded-lg mr-4 flex-shrink-0">
                  <Mail className="w-6 h-6 text-red-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">Имейл</h3>
                  <a href="mailto:info@barbershopgentlemens13.com" className="text-neutral-300 hover:text-red-600 transition-colors break-all text-sm sm:text-base">
                    info@barbershopgentlemens13.com
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border-2 border-neutral-800 rounded-lg p-6 hover:border-red-600 transition-colors">
              <div className="flex items-start">
                <div className="bg-red-600/10 p-3 rounded-lg mr-4">
                  <Clock className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Работно време</h3>
                  <div className="text-neutral-300 space-y-1">
                    <p>Понеделник – Събота: 08:00 – 20:00</p>
                    <p className="text-red-600 font-semibold">Неделя: Почивен ден</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 border-2 border-neutral-800 rounded-lg overflow-hidden h-[500px] relative group">
            <img
              src="/map-location.png"
              alt="Barbershop Location Map"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Nikolaevska+str.+13,+Berkovitsa+3500"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
              >
                <MapPin className="w-5 h-5" />
                <span>Отвори в Google Maps</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
