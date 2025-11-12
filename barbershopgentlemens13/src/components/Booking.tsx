import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Upload,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  User,
  Scissors,
  Home,
} from "lucide-react";
import { api, Barber, Service } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

// Генерира часове според работното време на барбъра
const generateTimeSlots = (
  startHour: number = 8,
  endHour: number = 20,
  lunchBreak: boolean = true
): string[] => {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (lunchBreak && hour === 13) continue; // обедна пауза
      const time = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      slots.push(time);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots(8, 20, true); // default за обща употреба

export function Booking() {
  const [currentStep, setCurrentStep] = useState(1);
  const containerRef = useRef<HTMLElement>(null);

  const { user } = useAuth();

  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    barberId: "",
    date: "",
    time: "",
    mainService: "" as string,
    additionalServices: [] as string[],
    photo: null as File | null,
    comment: "",
    gdprConsent: false,
    sendReminder: true,
  });

  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);

  const totalSteps = 5;

  /* ------------ Load dropdown data ------------ */
  useEffect(() => {
    (async () => {
      try {
        const [b, s] = await Promise.all([api.getBarbers(), api.getServices()]);
        setBarbers(b);
        setServices(s);
      } catch (err) {
        console.error(err);
        setError("Грешка при зареждане на данни.");
      }
    })();
  }, []);

  /* ------------ Auto-fill form for logged-in user ------------ */
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
      }));

      // Използвай профилната снимка ако има
      if (user.profilePhoto) {
        setPhotoPreview(user.profilePhoto);
      }
    }
  }, [user]);

  /* ---- Fetch occupied slots when date/barber changes ---- */
  useEffect(() => {
    if (!formData.date || !formData.barberId) {
      setOccupiedSlots([]);
      return;
    }
    (async () => {
      try {
        const allBookings = await api.listBookings();
        const occupiedTimes = allBookings
          .filter((booking) => {
            const barberId =
              typeof booking.barberId === "string"
                ? booking.barberId
                : (booking as any).barberId?._id;

            // блокираме както одобрени, така и pending (слотът е захванат)
            const blocksSlot =
              booking.status === "approved" || booking.status === "pending";

            return (
              blocksSlot &&
              booking.date === formData.date &&
              barberId === formData.barberId
            );
          })
          .map((booking) => booking.time);

        setOccupiedSlots(occupiedTimes);
      } catch (err) {
        console.error("Failed to fetch occupied slots:", err);
      }
    })();
  }, [formData.date, formData.barberId]);

  /* ---------------- Handlers ---------------- */
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError("Файлът е твърде голям. Максимум 3MB.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Моля, качете JPG, PNG или WebP файл.");
      return;
    }
    setFormData((p) => ({ ...p, photo: file }));
    setPhotoPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleNext = () => {
    setError("");

    if (currentStep === 1 && !formData.barberId) {
      setError("Моля, изберете бръснар.");
      return;
    }
    if (currentStep === 2 && !formData.mainService) {
      setError("Моля, изберете основна услуга.");
      return;
    }
    if (currentStep === 3) {
      if (!formData.date || !formData.time) {
        setError("Моля, изберете дата и час.");
        return;
      }
      // защитна проверка – неделя не се допуска
      const selectedDate = new Date(`${formData.date}T00:00`);
      if (selectedDate.getDay() === 0) {
        setError("Неделя е почивен ден. Моля, изберете друга дата.");
        return;
      }
    }
    if (currentStep === 4) {
      if (!formData.fullName || !formData.email || !formData.phone) {
        setError("Моля, попълнете всички задължителни полета.");
        return;
      }
      // Изисквай снимка само ако няма профилна
      if (!formData.photo && !user?.profilePhoto) {
        setError("Моля, качете снимка.");
        return;
      }
    }

    const newStep = Math.min(currentStep + 1, totalSteps);
    setCurrentStep(newStep);

    if (containerRef.current) {
      const currentScrollY = window.scrollY;
      setTimeout(() => {
        window.scrollTo({ top: currentScrollY, behavior: "instant" as any });
      }, 0);
    }
  };

  const handleBack = () => {
    setError("");
    const go = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
    if (containerRef.current) {
      const currentScrollY = window.scrollY;
      go();
      setTimeout(
        () =>
          window.scrollTo({ top: currentScrollY, behavior: "instant" as any }),
        0
      );
    } else {
      go();
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    setUploading(true);

    try {
      if (!formData.gdprConsent) {
        setError("Моля, приемете условията за обработка на лични данни.");
        setSubmitting(false);
        setUploading(false);
        return;
      }
      // Изисквай снимка само ако няма нито качена, нито профилна
      if (!formData.photo && !user?.profilePhoto) {
        setError("Моля, качете снимка.");
        setSubmitting(false);
        setUploading(false);
        return;
      }

      const allSelectedServices = [
        formData.mainService,
        ...formData.additionalServices,
      ];
      const selectedServices = allSelectedServices
        .map((id) => services.find((s) => s._id === id)?.name)
        .filter(Boolean)
        .join(", ");

      const response = await api.createBooking({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        barberId: formData.barberId,
        service: selectedServices,
        date: formData.date,
        time: formData.time,
        comment: formData.comment,
        photo: formData.photo || undefined,
        sendReminder: formData.sendReminder,
        userId: user?._id,
      });

      if (response) {
        setSuccess(true);
        setCurrentStep(1);
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          barberId: "",
          date: "",
          time: "",
          mainService: "",
          additionalServices: [],
          photo: null,
          comment: "",
          gdprConsent: false,
          sendReminder: true,
        });
        setPhotoPreview("");
      }
    } catch (err: any) {
      setError(err?.message || "Възникна грешка. Моля, опитайте отново.");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const getSelectedBarber = () =>
    barbers.find((b) => b._id === formData.barberId);

  const getTotalPrice = () => {
    let total = 0;
    if (formData.mainService) {
      const mainSvc = services.find((s) => s._id === formData.mainService);
      total += mainSvc?.price || 0;
    }
    formData.additionalServices.forEach((serviceId) => {
      const svc = services.find((s) => s._id === serviceId);
      total += svc?.price || 0;
    });
    return total;
  };

  const selectMainService = (serviceId: string) => {
    setFormData((prev) => ({ ...prev, mainService: serviceId }));
  };

  const toggleAdditionalService = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      additionalServices: prev.additionalServices.includes(serviceId)
        ? prev.additionalServices.filter((id) => id !== serviceId)
        : [...prev.additionalServices, serviceId],
    }));
  };

  /** Изчислява свободните слотове според датата, заетите часове и правилата */
  const getAvailableTimeSlots = () => {
    if (!formData.date || !formData.barberId) return timeSlots;

    const selectedDate = new Date(`${formData.date}T00:00`);
    const dayOfWeek = selectedDate.getDay();
    const selectedBarber = getSelectedBarber();
    if (!selectedBarber) return timeSlots;

    // Неделя – няма слотове
    if (dayOfWeek === 0) return [];

    // Вземаме работните часове на барбъра от базата
    const workHours = selectedBarber.workHours || {
      start: 8,
      end: 20,
      lunchBreak: true,
    };
    let startHour = workHours.start;
    const endHour = workHours.end;
    const lunchBreak = workHours.lunchBreak;

    // Ако е сряда и има специален начален час
    if (dayOfWeek === 3 && workHours.wednesdayStart !== undefined) {
      startHour = workHours.wednesdayStart;
    }

    // Генерираме часовете според работното време на барбъра
    let availableSlots = generateTimeSlots(startHour, endHour, lunchBreak);

    return availableSlots.filter((slot) => !occupiedSlots.includes(slot));
  };

  /** onChange за дата — валидира неделя и занулява часа при промяна */
  const handleDateChange = (value: string) => {
    if (!value) {
      setFormData((prev) => ({ ...prev, date: "", time: "" }));
      return;
    }
    const picked = new Date(`${value}T00:00`);
    if (picked.getDay() === 0) {
      setError("Неделя е почивен ден. Моля, изберете друга дата.");
      setFormData((prev) => ({ ...prev, date: "", time: "" }));
      return;
    }
    setError("");
    setFormData((prev) => ({ ...prev, date: value, time: "" }));
  };

  /* ------------------ UI ------------------ */
  if (success) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-neutral-900 border-2 border-green-600 rounded-lg p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-white mb-4">
            Заявката е изпратена успешно!
          </h3>
          <p className="text-neutral-300 mb-6">
            Заявката е изпратена успешно. Очаквайте имейл за потвърждение.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setSuccess(false)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg transition-colors"
            >
              Нова заявка
            </button>
            <a
              href="/"
              className="flex items-center bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-6 py-3 rounded-lg transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Начална страница
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef as any}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Запази час
          </h2>
          <div className="w-24 h-1 bg-red-600 mx-auto mb-8"></div>

          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step === currentStep
                      ? "bg-red-600 text-white scale-110"
                      : step < currentStep
                      ? "bg-green-600 text-white"
                      : "bg-neutral-800 text-neutral-500"
                  }`}
                >
                  {step < currentStep ? "✓" : step}
                </div>
                {step < 5 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      step < currentStep ? "bg-green-600" : "bg-neutral-800"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <p className="text-neutral-400 text-lg">
            {currentStep === 1 && "Стъпка 1: Избери бръснар"}
            {currentStep === 2 && "Стъпка 2: Избери услуга"}
            {currentStep === 3 && "Стъпка 3: Избери дата и час"}
            {currentStep === 4 && "Стъпка 4: Лична информация"}
            {currentStep === 5 && "Стъпка 5: Потвърждение"}
          </p>
        </div>

        <div className="bg-neutral-900 border-2 border-neutral-800 rounded-lg p-8">
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <User className="w-6 h-6 mr-3 text-red-600" />
                Избери бръснар
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {barbers.map((barber) => (
                  <button
                    key={barber._id}
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({
                        ...p,
                        barberId: barber._id,
                        time: "",
                      }))
                    }
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      formData.barberId === barber._id
                        ? "border-red-600 bg-red-600/10"
                        : "border-neutral-700 hover:border-red-600/50"
                    }`}
                  >
                    <div className="flex items-center mb-3">
                      <div className="w-16 h-16 rounded-full bg-neutral-800 overflow-hidden mr-4">
                        <img
                          src={
                            (barber as any).image ||
                            "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=200"
                          }
                          alt={barber.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white">
                          {barber.name}
                        </h4>
                        <p className="text-red-600 text-sm">
                          {barber.title || "Бръснар"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <Scissors className="w-6 h-6 mr-3 text-red-600" />
                  Избери услуги
                </h3>
                {(formData.mainService ||
                  formData.additionalServices.length > 0) && (
                  <div className="text-right">
                    <p className="text-sm text-neutral-400">Обща цена</p>
                    <p className="text-3xl font-bold text-red-600">
                      {getTotalPrice()} лв
                    </p>
                  </div>
                )}
              </div>
              <p className="text-neutral-400 mb-6">
                Можеш да избереш една или повече услуги
              </p>

              <div className="space-y-6">
                {services.slice(0, 2).length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">
                      Избери основна услуга
                    </h4>
                    <div className="space-y-3">
                      {services.slice(0, 2).map((service) => (
                        <label
                          key={service._id}
                          className={`flex items-center p-5 rounded-lg border-2 transition-all cursor-pointer ${
                            formData.mainService === service._id
                              ? "border-red-600 bg-red-600/10"
                              : "border-neutral-700 hover:border-red-600/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="mainService"
                            checked={formData.mainService === service._id}
                            onChange={() => selectMainService(service._id)}
                            className="w-5 h-5 text-red-600 bg-neutral-800 border-neutral-600 focus:ring-red-600 focus:ring-2 cursor-pointer"
                          />
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-lg font-bold text-white">
                                {service.name}
                              </h4>
                              <p className="text-red-600 font-bold text-xl">
                                {service.price} лв
                              </p>
                            </div>
                            {service.description && (
                              <p className="text-neutral-400 text-sm mt-1">
                                {service.description}
                              </p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {services.slice(2).length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">
                      Допълнителни услуги (по избор)
                    </h4>
                    <div className="space-y-3">
                      {services.slice(2).map((service) => (
                        <label
                          key={service._id}
                          className={`flex items-center p-5 rounded-lg border-2 transition-all cursor-pointer ${
                            formData.additionalServices.includes(service._id)
                              ? "border-red-600 bg-red-600/10"
                              : "border-neutral-700 hover:border-red-600/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.additionalServices.includes(
                              service._id
                            )}
                            onChange={() =>
                              toggleAdditionalService(service._id)
                            }
                            className="w-5 h-5 text-red-600 bg-neutral-800 border-neutral-600 rounded focus:ring-red-600 focus:ring-2 cursor-pointer"
                          />
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-lg font-bold text-white">
                                {service.name}
                              </h4>
                              <p className="text-red-600 font-bold text-xl">
                                {service.price} лв
                              </p>
                            </div>
                            {service.description && (
                              <p className="text-neutral-400 text-sm mt-1">
                                {service.description}
                              </p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-red-600" />
                Избери дата и час
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Дата *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleDateChange(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Час *
                    </label>
                    <select
                      value={formData.time}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, time: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600 transition-colors"
                      required
                      disabled={!formData.date}
                    >
                      <option value="">Изберете час</option>
                      {getAvailableTimeSlots().map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.date &&
                  formData.barberId &&
                  (() => {
                    const selectedDate = new Date(`${formData.date}T00:00`);
                    const dayOfWeek = selectedDate.getDay();
                    const selectedBarber = getSelectedBarber();
                    if (!selectedBarber) return null;

                    const workHours = selectedBarber.workHours || {
                      start: 8,
                      end: 20,
                    };

                    // Проверка за сряда с различен начален час
                    if (
                      dayOfWeek === 3 &&
                      workHours.wednesdayStart !== undefined &&
                      workHours.wednesdayStart > workHours.start
                    ) {
                      return (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                          <p className="text-yellow-500 text-sm">
                            <strong>Внимание:</strong> В сряда{" "}
                            {selectedBarber.name || "бръснаря"} работи от{" "}
                            {workHours.wednesdayStart
                              .toString()
                              .padStart(2, "0")}
                            :00 до {workHours.end.toString().padStart(2, "0")}
                            :00
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {currentStep === 4 && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">
                Лична информация
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Име и фамилия *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, fullName: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="+359"
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Имейл *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, email: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2 flex items-center">
                    <Upload className="w-4 h-4 mr-2" />
                    Качи снимка {!user?.profilePhoto && "*"} (JPG, PNG, WebP -
                    макс. 3MB)
                  </label>

                  {user?.profilePhoto && !formData.photo && (
                    <div className="mb-3 p-3 bg-neutral-800 border border-neutral-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.profilePhoto}
                            alt="Profile"
                            className="w-16 h-16 object-cover rounded-lg border-2 border-green-600"
                          />
                          <div>
                            <p className="text-white font-semibold text-sm">
                              Профилна снимка
                            </p>
                            <p className="text-green-400 text-xs flex items-center gap-1">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Ще използваме тази снимка
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white file:cursor-pointer hover:file:bg-red-700"
                    required={!user?.profilePhoto}
                  />
                  <p className="text-neutral-500 text-xs mt-2">
                    {user?.profilePhoto
                      ? "Опционално: Качете нова снимка ако искате да използвате друга"
                      : "Качете снимка за по-лесна идентификация от барбъра"}
                  </p>

                  {photoPreview && formData.photo && (
                    <div className="mt-4">
                      <p className="text-sm text-neutral-400 mb-2">
                        Нова снимка:
                      </p>
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-red-600"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Коментар (по избор)
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, comment: e.target.value }))
                    }
                    rows={3}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {currentStep === 5 && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">
                Потвърди резервацията
              </h3>
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-neutral-800 rounded-lg">
                  <p className="text-neutral-400 text-sm mb-1">Бръснар</p>
                  <p className="text-white font-semibold">
                    {getSelectedBarber()?.name}
                  </p>
                </div>

                <div className="p-4 bg-neutral-800 rounded-lg">
                  <p className="text-neutral-400 text-sm mb-2">
                    Избрани услуги
                  </p>
                  <div className="space-y-2">
                    {formData.mainService &&
                      (() => {
                        const service = services.find(
                          (s) => s._id === formData.mainService
                        );
                        return (
                          <div
                            key={formData.mainService}
                            className="flex justify-between items-center"
                          >
                            <span className="text-white">{service?.name}</span>
                            <span className="text-red-600 font-semibold">
                              {service?.price} лв
                            </span>
                          </div>
                        );
                      })()}
                    {formData.additionalServices.map((serviceId) => {
                      const service = services.find((s) => s._id === serviceId);
                      return (
                        <div
                          key={serviceId}
                          className="flex justify-between items-center"
                        >
                          <span className="text-white">{service?.name}</span>
                          <span className="text-red-600 font-semibold">
                            {service?.price} лв
                          </span>
                        </div>
                      );
                    })}
                    <div className="pt-2 mt-2 border-t border-neutral-700 flex justify-between items-center">
                      <span className="text-white font-bold">Обща цена:</span>
                      <span className="text-red-600 font-bold text-xl">
                        {getTotalPrice()} лв
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-800 rounded-lg">
                    <p className="text-neutral-400 text-sm mb-1">Дата</p>
                    <p className="text-white font-semibold">{formData.date}</p>
                  </div>

                  <div className="p-4 bg-neutral-800 rounded-lg">
                    <p className="text-neutral-400 text-sm mb-1">Час</p>
                    <p className="text-white font-semibold">{formData.time}</p>
                  </div>
                </div>

                <div className="p-4 bg-neutral-800 rounded-lg">
                  <p className="text-neutral-400 text-sm mb-1">
                    Контактна информация
                  </p>
                  <p className="text-white">{formData.fullName}</p>
                  <p className="text-white">{formData.email}</p>
                  <p className="text-white">{formData.phone}</p>
                </div>

                {formData.comment && (
                  <div className="p-4 bg-neutral-800 rounded-lg">
                    <p className="text-neutral-400 text-sm mb-1">Коментар</p>
                    <p className="text-white">{formData.comment}</p>
                  </div>
                )}

                {(photoPreview || user?.profilePhoto) && (
                  <div className="p-4 bg-neutral-800 rounded-lg">
                    <p className="text-neutral-400 text-sm mb-3">
                      Снимка за идентификация
                    </p>
                    <div className="flex items-center gap-3">
                      <img
                        src={photoPreview || user?.profilePhoto || ""}
                        alt="Client photo"
                        className="w-24 h-24 object-cover rounded-lg border-2 border-neutral-700"
                      />
                      <div className="text-sm">
                        {formData.photo ? (
                          <p className="text-white">✓ Нова снимка качена</p>
                        ) : (
                          <p className="text-green-400">
                            ✓ Използва се профилна снимка
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.gdprConsent}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        gdprConsent: e.target.checked,
                      }))
                    }
                    className="mt-1 mr-3 w-5 h-5 text-red-600 bg-neutral-800 border-neutral-700 rounded focus:ring-red-600"
                    required
                  />
                  <span className="text-sm text-neutral-300">
                    Съгласен съм с обработка на лични данни *
                  </span>
                </label>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.sendReminder}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        sendReminder: e.target.checked,
                      }))
                    }
                    className="mt-1 mr-3 w-5 h-5 text-red-600 bg-neutral-800 border-neutral-700 rounded focus:ring-red-600"
                  />
                  <span className="text-sm text-neutral-300">
                    Изпрати ми напомняне 2 часа преди часа ми
                  </span>
                </label>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Назад
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
              >
                Напред
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || uploading}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading
                  ? "Качване на снимка..."
                  : submitting
                  ? "Изпращане..."
                  : "Потвърди"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
