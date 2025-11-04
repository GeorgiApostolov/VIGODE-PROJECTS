import { MapPin, Calendar, CheckCircle2 } from 'lucide-react';

export default function Steps() {
  const steps = [
    {
      icon: MapPin,
      number: '1',
      title: 'PLZ eingeben & Service wählen',
      description: 'Geben Sie Ihre Postleitzahl ein und wählen Sie den gewünschten Service',
    },
    {
      icon: Calendar,
      number: '2',
      title: 'Wunschtermin bestätigen',
      description: 'Wählen Sie Ihren bevorzugten Termin und bestätigen Sie die Buchung',
    },
    {
      icon: CheckCircle2,
      number: '3',
      title: 'Wir kommen & montieren',
      description: 'Unser Team kommt zu Ihnen, wechselt die Reifen und wuchtet sie aus – fertig!',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-zinc-900/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">So funktioniert's</h2>
          <p className="text-zinc-400 text-lg">In nur 3 einfachen Schritten zu neuen Reifen</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-zinc-900 border-2 border-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-emerald-500 font-bold text-sm">{step.number}</span>
                    </div>
                  </div>
                  <h3 className="text-white font-semibold text-xl mb-3">{step.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{step.description}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-emerald-600/50 to-transparent" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
