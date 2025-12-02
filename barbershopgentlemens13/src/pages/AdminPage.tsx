import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Check,
  X,
  Filter,
  Eye,
  Upload,
  Image as ImageIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Bell,
  Trash2,
} from "lucide-react";
import { api, Booking, Barber } from "../lib/api";
import Header from "../components/Header";

type TabType =
  | "bookings"
  | "schedule"
  | "manual-booking"
  | "gallery"
  | "before-after"
  | "news";

function getBarberName(b: any, barbersMap: Record<string, Barber>) {
  if (!b) return "—";
  if (typeof b === "object") return b.name || "—";
  const byId = barbersMap[b];
  return byId?.name || String(b);
}

function getServiceText(svc: any) {
  if (!svc) return "—";
  if (Array.isArray(svc)) {
    return svc
      .map((s) => (typeof s === "string" ? s : s?.name ?? ""))
      .filter(Boolean)
      .join(", ");
  }
  return typeof svc === "string" ? svc : svc.name ?? svc.title ?? "—";
}

export function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [barbers, setBarbers] = useState<Record<string, Barber>>({});
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterBarber, setFilterBarber] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [rejectReason, setRejectReason] = useState("");
  const [suggestedSlots, setSuggestedSlots] = useState<
    Array<{ date: string; time: string }>
  >([{ date: "", time: "" }]);

  const [galleryUrl, setGalleryUrl] = useState("");
  const [galleryCaption, setGalleryCaption] = useState("");
  const [galleryTags, setGalleryTags] = useState("");
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [beforeUrl, setBeforeUrl] = useState("");
  const [afterUrl, setAfterUrl] = useState("");
  const [beforeAfterTitle, setBeforeAfterTitle] = useState("");
  const [uploadingBeforeAfter, setUploadingBeforeAfter] = useState(false);

  const [scheduleDate, setScheduleDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [scheduleBarber, setScheduleBarber] = useState<string>("all");
  const [scheduleViewMode, setScheduleViewMode] = useState<"grid" | "list">(
    "grid"
  );

  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(
    null
  );
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" });

  const [manualBookingData, setManualBookingData] = useState({
    fullName: "",
    phone: "",
    barberId: "",
    date: "",
    time: "",
    service: "",
  });

  const [newsText, setNewsText] = useState("");
  const [newsStartDate, setNewsStartDate] = useState("");
  const [newsEndDate, setNewsEndDate] = useState("");
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);

  const [quickBookModalOpen, setQuickBookModalOpen] = useState(false);
  const [quickBookData, setQuickBookData] = useState({
    fullName: "",
    phone: "",
    barberId: "",
    date: "",
    time: "",
    service: "Подстрижка",
  });

  const [newBookingsCount, setNewBookingsCount] = useState(0);
  const previousBookingsRef = useRef<Booking[]>([]);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

  // Създаваме звуков обект при mount
  useEffect(() => {
    // Използваме простичък beep звук (може да замениш с /notification.mp3)
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    notificationSoundRef.current = {
      play: () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800; // Frequency in Hz
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.5
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);

        return Promise.resolve();
      },
    } as any;
  }, []);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn");
    if (isLoggedIn === "true") {
      setIsAuthenticated(true);
      fetchData();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, filterStatus, filterBarber]);

  // Auto-refresh на всеки 10 секунди
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchBookings();
    }, 10000); // 10 секунди

    return () => clearInterval(interval);
  }, [isAuthenticated, filterStatus, filterBarber]);

  useEffect(() => {
    if (isAuthenticated && activeTab === "news") {
      fetchNews();
    }
  }, [isAuthenticated, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    await fetchBarbers();
    await fetchBookings();
    setLoading(false);
  };

  const fetchBarbers = async () => {
    try {
      const data = await api.getBarbers();
      const barbersMap = data.reduce((acc, barber) => {
        acc[barber._id] = barber;
        return acc;
      }, {} as Record<string, Barber>);
      setBarbers(barbersMap);
    } catch (err) {
      console.error("Failed to fetch barbers:", err);
    }
  };

  const fetchBookings = async () => {
    try {
      const params: any = {};
      if (filterStatus !== "all") {
        params.status = filterStatus;
      }
      if (filterBarber !== "all") {
        params.barberId = filterBarber;
      }

      const data = await api.listBookings(params);

      // Проверка за нови резервации
      if (previousBookingsRef.current.length > 0) {
        const previousIds = new Set(
          previousBookingsRef.current.map((b) => b._id)
        );
        const newBookings = data.filter(
          (b) => !previousIds.has(b._id) && b.status === "pending"
        );

        if (newBookings.length > 0) {
          // Свири звук
          notificationSoundRef.current
            ?.play()
            .catch((err) => console.log("Audio play failed:", err));

          // Показва notification
          setNewBookingsCount(newBookings.length);

          // Browser notification (ако е разрешено)
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("Нова резервация!", {
              body: `${newBookings.length} ${
                newBookings.length === 1 ? "нова заявка" : "нови заявки"
              } за одобрение`,
              icon: "/logo-trans.png",
              tag: "new-booking",
            });
          }

          // Изчиства counter след 5 секунди
          setTimeout(() => setNewBookingsCount(0), 5000);
        }
      }

      previousBookingsRef.current = data;
      setBookings(data);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "berkovica123") {
      localStorage.setItem("adminToken", "admin123");
      localStorage.setItem("adminLoggedIn", "true");
      setIsAuthenticated(true);

      // Иска разрешение за browser notifications
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }

      fetchData();
    } else {
      alert("Невалидна парола");
    }
  };

  const handleApprove = async (bookingId: string) => {
    try {
      await api.approveBooking(bookingId);
      alert("Заявката е одобрена и имейл е изпратен!");
      fetchBookings();
    } catch (error) {
      console.error("Error approving booking:", error);
      alert("Грешка при одобряване на заявката");
    }
  };

  const openRejectModal = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setRejectModalOpen(true);
    setRejectReason("");
    setSuggestedSlots([{ date: "", time: "" }]);
  };

  const addSuggestedSlot = () => {
    setSuggestedSlots([...suggestedSlots, { date: "", time: "" }]);
  };

  const removeSuggestedSlot = (index: number) => {
    setSuggestedSlots(suggestedSlots.filter((_, i) => i !== index));
  };

  const updateSuggestedSlot = (
    index: number,
    field: "date" | "time",
    value: string
  ) => {
    const updated = [...suggestedSlots];
    updated[index][field] = value;
    setSuggestedSlots(updated);
  };

  const handleReject = async () => {
    if (!selectedBookingId) return;

    try {
      const validSlots = suggestedSlots.filter(
        (slot) => slot.date && slot.time
      );

      await api.rejectBooking(selectedBookingId, {
        reason: rejectReason || "Времето не е налично",
        alternatives: validSlots.length > 0 ? validSlots : undefined,
      });

      alert("Заявката е отказана и имейл е изпратен!");
      setRejectModalOpen(false);
      setSelectedBookingId(null);
      fetchBookings();
    } catch (error) {
      console.error("Error rejecting booking:", error);
      alert("Грешка при отказване на заявката");
    }
  };

  const handleDelete = async (bookingId: string) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете тази заявка?")) {
      return;
    }

    try {
      await api.deleteBooking(bookingId);
      alert("Заявката е изтрита успешно!");
      fetchBookings();
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Грешка при изтриване на заявката");
    }
  };

  const handleComplete = async (bookingId: string) => {
    try {
      await api.completeBooking(bookingId);
      alert("Заявката е маркирана като завършена!");
      fetchBookings();
    } catch (error) {
      console.error("Error completing booking:", error);
      alert("Грешка при маркиране на заявката");
    }
  };

  const openRescheduleModal = (bookingId: string) => {
    setRescheduleBookingId(bookingId);
    setRescheduleModalOpen(true);
    setRescheduleData({ date: "", time: "" });
  };

  const handleReschedule = async () => {
    if (!rescheduleBookingId || !rescheduleData.date || !rescheduleData.time) {
      alert("Моля, попълнете дата и час");
      return;
    }

    try {
      await api.rescheduleBooking(rescheduleBookingId, rescheduleData);
      alert("Часът е успешно пренасрочен и одобрен!");
      setRescheduleModalOpen(false);
      setRescheduleBookingId(null);
      fetchBookings();
    } catch (error) {
      console.error("Error rescheduling booking:", error);
      alert("Грешка при пренасрочване");
    }
  };

  const handleManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !manualBookingData.fullName ||
      !manualBookingData.phone ||
      !manualBookingData.barberId ||
      !manualBookingData.date ||
      !manualBookingData.time ||
      !manualBookingData.service
    ) {
      alert("Моля, попълнете всички полета");
      return;
    }

    try {
      await api.createManualBooking(manualBookingData);
      alert("Резервацията е създадена успешно!");
      setManualBookingData({
        fullName: "",
        phone: "",
        barberId: "",
        date: "",
        time: "",
        service: "",
      });
      fetchBookings();
    } catch (error) {
      console.error("Error creating manual booking:", error);
      alert("Грешка при създаване на резервация");
    }
  };

  const openQuickBookModal = (barberId: string, date: string, time: string) => {
    setQuickBookData({
      fullName: "",
      phone: "",
      barberId,
      date,
      time,
      service: "Подстрижка",
    });
    setQuickBookModalOpen(true);
  };

  const fetchNews = async () => {
    try {
      setLoadingNews(true);
      const data = await api.getAllNews();
      setNewsList(data);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoadingNews(false);
    }
  };

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsText || !newsStartDate || !newsEndDate) {
      alert("Моля, попълнете всички полета");
      return;
    }

    try {
      await api.createNews({
        text: newsText,
        startDate: newsStartDate,
        endDate: newsEndDate,
        active: true,
      });
      alert("Новината е добавена успешно!");
      setNewsText("");
      setNewsStartDate("");
      setNewsEndDate("");
      fetchNews();
    } catch (error) {
      console.error("Error creating news:", error);
      alert("Грешка при добавяне на новина");
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете тази новина?")) {
      return;
    }

    try {
      await api.deleteNews(id);
      alert("Новината е изтрита успешно!");
      fetchNews();
    } catch (error) {
      console.error("Error deleting news:", error);
      alert("Грешка при изтриване на новина");
    }
  };

  const handleQuickBook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quickBookData.fullName || !quickBookData.phone) {
      alert("Моля, попълнете име и телефон");
      return;
    }

    try {
      const bookingPayload = {
        fullName: quickBookData.fullName.trim(),
        phone: quickBookData.phone.trim(),
        barberId: quickBookData.barberId,
        date: quickBookData.date,
        time: quickBookData.time,
        service: quickBookData.service.trim() || "Подстрижка",
      };

      await api.createManualBooking(bookingPayload);
      alert("Часът е запазен успешно!");
      setQuickBookModalOpen(false);
      setQuickBookData({
        fullName: "",
        phone: "",
        barberId: "",
        date: "",
        time: "",
        service: "Подстрижка",
      });
      fetchBookings();
    } catch (error: any) {
      console.error("Error creating quick booking:", error);
      alert(
        `Грешка при запазване на час: ${error.message || "Неизвестна грешка"}`
      );
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { text: "Очаква", color: "bg-yellow-600" },
      approved: { text: "Одобрена", color: "bg-green-600" },
      rejected: { text: "Отказана", color: "bg-red-600" },
      completed: { text: "Завършена", color: "bg-neutral-600" },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    return (
      <span
        className={`${badge.color} text-white text-xs px-2 py-1 rounded-full`}
      >
        {badge.text}
      </span>
    );
  };

  const handleUploadGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryUrl) return;

    setUploadingGallery(true);

    try {
      const payload = {
        imageUrl: galleryUrl.trim(),
        caption: galleryCaption?.trim() || "",
        tags: galleryTags
          ? galleryTags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      const res = await fetch("/backend/api/gallery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": localStorage.getItem("adminToken") || "",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Снимката е добавена успешно!");
        setGalleryUrl("");
        setGalleryCaption("");
        setGalleryTags("");
      } else {
        const errorText = await res.text();
        alert(`Грешка при добавяне на снимката: ${res.status} ${errorText}`);
      }
    } catch (error) {
      console.error(error);
      alert("Грешка при добавяне на снимката");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleUploadBeforeAfter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!beforeUrl || !afterUrl) return;

    setUploadingBeforeAfter(true);

    try {
      const payload = {
        beforeUrl: beforeUrl.trim(),
        afterUrl: afterUrl.trim(),
        title: beforeAfterTitle?.trim() || "",
      };

      const res = await fetch("/backend/api/before-after", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": localStorage.getItem("adminToken") || "",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Снимките са добавени успешно!");
        setBeforeUrl("");
        setAfterUrl("");
        setBeforeAfterTitle("");
      } else {
        const errorText = await res.text();
        alert(`Грешка при добавяне на снимките: ${res.status} ${errorText}`);
      }
    } catch (error) {
      console.error(error);
      alert("Грешка при добавяне на снимките");
    } finally {
      setUploadingBeforeAfter(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-neutral-900 border-2 border-neutral-800 rounded-lg p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            Admin Panel
          </h1>
          <form onSubmit={handleLogin}>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Парола
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Въведи парола"
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600 transition-colors mb-4"
              required
            />
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Влез
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Admin Panel</h1>

        <div className="flex space-x-2 mb-8 border-b border-neutral-800">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-6 py-3 font-semibold transition-colors relative ${
              activeTab === "bookings"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Резервации
            {newBookingsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {newBookingsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "schedule"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            График
          </button>
          <button
            onClick={() => setActiveTab("manual-booking")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "manual-booking"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Нова резервация
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "gallery"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Галерия
          </button>
          <button
            onClick={() => setActiveTab("before-after")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "before-after"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Преди/След
          </button>
          <button
            onClick={() => setActiveTab("news")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "news"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Новини
          </button>
        </div>

        {activeTab === "bookings" && (
          <>
            <div className="bg-neutral-900 border-2 border-neutral-800 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <Filter className="w-5 h-5 text-red-600" />
                  <h2 className="text-xl font-bold text-white">Филтри</h2>
                </div>
                <button
                  onClick={() => fetchBookings()}
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-white transition-colors"
                  title="Опресни резервациите"
                >
                  <RefreshCw className="w-4 h-4" />
                  Опресни
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Статус
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                  >
                    <option value="all">Всички</option>
                    <option value="pending">Очакващи</option>
                    <option value="approved">Одобрени</option>
                    <option value="rejected">Отказани</option>
                    <option value="completed">Завършени</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Бръснар
                  </label>
                  <select
                    value={filterBarber}
                    onChange={(e) => setFilterBarber(e.target.value)}
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                  >
                    <option value="all">Всички</option>
                    {Object.values(barbers).map((barber) => (
                      <option key={barber._id} value={barber._id}>
                        {barber.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center text-white py-12">Зареждане...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center text-neutral-400 py-12">
                Няма резервации
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="bg-neutral-900 border-2 border-neutral-800 rounded-lg p-6 hover:border-red-600 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-neutral-400 text-sm mb-1">
                            Клиент
                          </p>
                          <p className="text-white font-semibold">
                            {booking.fullName}
                          </p>
                          <p className="text-neutral-400 text-sm">
                            {booking.email}
                          </p>
                          <p className="text-neutral-400 text-sm">
                            {booking.phone}
                          </p>
                        </div>

                        <div>
                          <p className="text-neutral-400 text-sm mb-1">
                            Бръснар
                          </p>
                          <p className="text-white font-semibold">
                            {getBarberName(booking.barberId, barbers)}
                          </p>
                          <p className="text-neutral-400 text-sm">
                            {getServiceText(booking.service)}
                          </p>
                        </div>

                        <div>
                          <p className="text-neutral-400 text-sm mb-1">
                            Дата и час
                          </p>
                          <p className="text-white font-semibold flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-red-600" />
                            {new Date(booking.date).toLocaleDateString("bg-BG")}
                          </p>
                          <p className="text-white">{booking.time}</p>
                        </div>

                        <div>
                          <p className="text-neutral-400 text-sm mb-1">
                            Статус
                          </p>
                          {getStatusBadge(booking.status)}
                          {booking.comment && (
                            <p className="text-neutral-400 text-sm mt-2 italic">
                              "{booking.comment}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex lg:flex-col gap-2">
                        {booking.photoUrl && (
                          <button
                            onClick={() => setSelectedPhoto(booking.photoUrl!)}
                            className="flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Снимка
                          </button>
                        )}

                        {booking.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(booking._id)}
                              className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Одобри
                            </button>

                            <button
                              onClick={() => openRejectModal(booking._id)}
                              className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Откажи
                            </button>
                          </>
                        )}

                        {booking.status === "rejected" && (
                          <button
                            onClick={() => openRescheduleModal(booking._id)}
                            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Избери нов час
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(booking._id)}
                          className="flex items-center justify-center bg-neutral-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                          title="Изтрий заявка"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "schedule" && (
          <>
            <div className="bg-neutral-900 border-2 border-neutral-800 rounded-lg p-6 mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <Clock className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-bold text-white">
                  График на барбъра
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Избери барбър
                  </label>
                  <select
                    value={scheduleBarber}
                    onChange={(e) => setScheduleBarber(e.target.value)}
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                  >
                    <option value="all">Всички барбъри</option>
                    {Object.values(barbers).map((barber) => (
                      <option key={barber._id} value={barber._id}>
                        {barber.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Избери дата
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const date = new Date(scheduleDate);
                        date.setDate(date.getDate() - 1);
                        setScheduleDate(date.toISOString().split("T")[0]);
                      }}
                      className="p-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                    />
                    <button
                      onClick={() => {
                        const date = new Date(scheduleDate);
                        date.setDate(date.getDate() + 1);
                        setScheduleDate(date.toISOString().split("T")[0]);
                      }}
                      className="p-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-center text-neutral-400 mb-4">
                <p className="text-lg font-semibold text-white">
                  {new Date(scheduleDate + "T12:00:00").toLocaleDateString(
                    "bg-BG",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>

              {/* View Mode Toggle */}
              {scheduleBarber !== "all" && (
                <div className="flex justify-center gap-2 mb-4">
                  <button
                    onClick={() => setScheduleViewMode("grid")}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      scheduleViewMode === "grid"
                        ? "bg-red-600 text-white"
                        : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    🟩 Бърз изглед
                  </button>
                  <button
                    onClick={() => setScheduleViewMode("list")}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      scheduleViewMode === "list"
                        ? "bg-red-600 text-white"
                        : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                    }`}
                  >
                    📋 Подробен изглед
                  </button>
                </div>
              )}

              {/* Quick Book Hint */}
              {scheduleBarber === "all" ? (
                <div className="bg-blue-900/30 border-2 border-blue-600 rounded-lg p-4 mb-4">
                  <p className="text-blue-300 text-center font-semibold">
                    ⬆️ Избери конкретен барбър за да видиш свободните часове и
                    да можеш да запазваш бързо
                  </p>
                </div>
              ) : scheduleViewMode === "grid" ? (
                <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3 mb-4">
                  <p className="text-neutral-300 text-sm text-center">
                    💡 <strong>Бърз съвет:</strong> Кликни на свободен час
                    (зелен) за бързо резервиране при телефонно обаждане
                  </p>
                </div>
              ) : null}
            </div>

            {(() => {
              // Проверяваме дали избраната дата е сряда
              const selectedDate = new Date(scheduleDate + "T00:00");
              const isWednesday = selectedDate.getDay() === 3;

              // Генерираме часове като в booking формата
              const allTimeSlots: string[] = [];
              const startHour = isWednesday ? 12 : 8;
              const endHour = 20;

              for (let hour = startHour; hour < endHour; hour++) {
                for (let minute = 0; minute < 60; minute += 15) {
                  // В сряда няма обедна пауза, в други дни пропускаме 13:00
                  if (!isWednesday && hour === 13) continue;
                  const time = `${hour.toString().padStart(2, "0")}:${minute
                    .toString()
                    .padStart(2, "0")}`;
                  allTimeSlots.push(time);
                }
              }

              const filteredBookings = bookings.filter((b) => {
                const matchesDate = b.date === scheduleDate;
                const barberId =
                  typeof b.barberId === "string"
                    ? b.barberId
                    : (b.barberId as any)?._id;
                const matchesBarber =
                  scheduleBarber === "all" || barberId === scheduleBarber;
                return (
                  matchesDate &&
                  matchesBarber &&
                  ["pending", "approved", "completed"].includes(b.status)
                );
              });

              // Ако е избран конкретен барбър и grid mode
              if (scheduleBarber !== "all" && scheduleViewMode === "grid") {
                const selectedBarberObj = barbers[scheduleBarber];

                return (
                  <div>
                    <div className="bg-neutral-900 border-2 border-neutral-800 rounded-lg p-4 mb-6">
                      <h3 className="text-white font-bold text-lg mb-4">
                        График на {selectedBarberObj?.name}
                      </h3>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                        {allTimeSlots.map((timeSlot) => {
                          const isBooked = filteredBookings.some(
                            (b) => b.time === timeSlot
                          );
                          const booking = filteredBookings.find(
                            (b) => b.time === timeSlot
                          );

                          if (isBooked && booking) {
                            return (
                              <div
                                key={timeSlot}
                                className="bg-red-900/30 border-2 border-red-700 rounded-lg p-3 text-center"
                              >
                                <p className="text-red-400 font-bold text-sm mb-1">
                                  {timeSlot}
                                </p>
                                <p className="text-white text-xs font-semibold truncate">
                                  {booking.fullName}
                                </p>
                                <p className="text-neutral-400 text-xs">
                                  {getServiceText(booking.service)}
                                </p>
                              </div>
                            );
                          }

                          return (
                            <button
                              key={timeSlot}
                              onClick={() =>
                                openQuickBookModal(
                                  scheduleBarber,
                                  scheduleDate,
                                  timeSlot
                                )
                              }
                              className="bg-green-900/20 border-2 border-green-700 rounded-lg p-3 text-center hover:bg-green-800/30 hover:border-green-600 transition-all group"
                            >
                              <p className="text-green-400 font-bold text-sm mb-1">
                                {timeSlot}
                              </p>
                              <p className="text-green-300 text-xs opacity-70 group-hover:opacity-100">
                                Свободен
                              </p>
                              <Plus className="w-4 h-4 mx-auto mt-1 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              // List view или "Всички барбъри" - подробна визуализация
              const sortedBookings = filteredBookings.sort((a, b) => {
                return a.time.localeCompare(b.time);
              });

              if (sortedBookings.length === 0) {
                return (
                  <div className="text-center text-neutral-400 py-12 bg-neutral-900 border-2 border-neutral-800 rounded-lg">
                    Няма резервации за избраната дата
                    {scheduleBarber !== "all" && " и барбър"}
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {sortedBookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="bg-neutral-900 border-2 border-neutral-800 rounded-lg p-5 hover:border-red-600 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className="text-center min-w-[80px]">
                            <p className="text-red-600 font-bold text-2xl">
                              {booking.time}
                            </p>
                          </div>

                          <div className="h-12 w-px bg-neutral-700"></div>

                          <div>
                            <p className="text-white font-bold text-lg">
                              {booking.fullName}
                            </p>
                            <p className="text-neutral-400 text-sm">
                              {booking.phone}
                            </p>
                          </div>

                          <div className="h-12 w-px bg-neutral-700"></div>

                          <div>
                            <p className="text-neutral-400 text-sm">Барбър</p>
                            <p className="text-white font-semibold">
                              {getBarberName(booking.barberId, barbers)}
                            </p>
                          </div>

                          <div className="h-12 w-px bg-neutral-700"></div>

                          <div>
                            <p className="text-neutral-400 text-sm">Услуга</p>
                            <p className="text-white font-semibold">
                              {getServiceText(booking.service)}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {booking.photoUrl && (
                            <button
                              onClick={() =>
                                setSelectedPhoto(booking.photoUrl!)
                              }
                              className="flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Снимка
                            </button>
                          )}
                          {booking.status !== "completed" && (
                            <button
                              onClick={() => handleComplete(booking._id)}
                              className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                              title="Маркирай като завършена"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(booking._id)}
                            className="flex items-center justify-center bg-neutral-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                            title="Изтрий заявка"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {booking.comment && (
                        <div className="mt-3 pt-3 border-t border-neutral-800">
                          <p className="text-neutral-400 text-sm italic">
                            "{booking.comment}"
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </>
        )}

        {activeTab === "manual-booking" && (
          <div className="bg-neutral-900 border-2 border-neutral-800 rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-6">
              <Plus className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold text-white">
                Създай ръчна резервация
              </h2>
            </div>
            <p className="text-neutral-400 mb-6">
              Използвай тази форма за добавяне на резервации, направени по
              телефон или на място
            </p>

            <form onSubmit={handleManualBooking} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Име на клиент *
                  </label>
                  <input
                    type="text"
                    value={manualBookingData.fullName}
                    onChange={(e) =>
                      setManualBookingData({
                        ...manualBookingData,
                        fullName: e.target.value,
                      })
                    }
                    placeholder="Иван Петров"
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    value={manualBookingData.phone}
                    onChange={(e) =>
                      setManualBookingData({
                        ...manualBookingData,
                        phone: e.target.value,
                      })
                    }
                    placeholder="0888123456"
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Барбър *
                  </label>
                  <select
                    value={manualBookingData.barberId}
                    onChange={(e) =>
                      setManualBookingData({
                        ...manualBookingData,
                        barberId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                    required
                  >
                    <option value="">Избери барбър</option>
                    {Object.values(barbers).map((barber) => (
                      <option key={barber._id} value={barber._id}>
                        {barber.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Услуга *
                  </label>
                  <input
                    type="text"
                    value={manualBookingData.service}
                    onChange={(e) =>
                      setManualBookingData({
                        ...manualBookingData,
                        service: e.target.value,
                      })
                    }
                    placeholder="Подстрижка"
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Дата *
                  </label>
                  <input
                    type="date"
                    value={manualBookingData.date}
                    onChange={(e) =>
                      setManualBookingData({
                        ...manualBookingData,
                        date: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Час *
                  </label>
                  <input
                    type="time"
                    value={manualBookingData.time}
                    onChange={(e) =>
                      setManualBookingData({
                        ...manualBookingData,
                        time: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Създай резервация
              </button>
            </form>
          </div>
        )}

        {activeTab === "gallery" && (
          <div className="bg-neutral-900 border-2 border-neutral-800 rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-6">
              <ImageIcon className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold text-white">
                Добави снимка в галерията
              </h2>
            </div>

            <form onSubmit={handleUploadGallery} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  URL на снимката (от Imgur) *
                </label>
                <input
                  type="url"
                  value={galleryUrl}
                  onChange={(e) => setGalleryUrl(e.target.value)}
                  placeholder="https://i.imgur.com/example.jpg"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                  required
                />
                <p className="text-neutral-500 text-xs mt-1">
                  Качи снимка в Imgur и копирай директния линк (Copy link)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Описание (опционално)
                </label>
                <input
                  type="text"
                  value={galleryCaption}
                  onChange={(e) => setGalleryCaption(e.target.value)}
                  placeholder="Класическа подстрижка"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Тагове (опционално, разделени със запетая)
                </label>
                <input
                  type="text"
                  value={galleryTags}
                  onChange={(e) => setGalleryTags(e.target.value)}
                  placeholder="подстрижка, fade, модерен"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <button
                type="submit"
                disabled={uploadingGallery || !galleryUrl}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-neutral-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center"
              >
                <Upload className="w-5 h-5 mr-2" />
                {uploadingGallery ? "Добавяне..." : "Добави снимка"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "before-after" && (
          <div className="bg-neutral-900 border-2 border-neutral-800 rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-6">
              <ImageIcon className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold text-white">
                Добави Преди/След снимки
              </h2>
            </div>

            <form onSubmit={handleUploadBeforeAfter} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  URL на снимката ПРЕДИ (от Imgur) *
                </label>
                <input
                  type="url"
                  value={beforeUrl}
                  onChange={(e) => setBeforeUrl(e.target.value)}
                  placeholder="https://i.imgur.com/before.jpg"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  URL на снимката СЛЕД (от Imgur) *
                </label>
                <input
                  type="url"
                  value={afterUrl}
                  onChange={(e) => setAfterUrl(e.target.value)}
                  placeholder="https://i.imgur.com/after.jpg"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                  required
                />
                <p className="text-neutral-500 text-xs mt-1">
                  Качи снимки в Imgur и копирай директните линкове
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Заглавие (опционално)
                </label>
                <input
                  type="text"
                  value={beforeAfterTitle}
                  onChange={(e) => setBeforeAfterTitle(e.target.value)}
                  placeholder="Класическа трансформация"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <button
                type="submit"
                disabled={uploadingBeforeAfter || !beforeUrl || !afterUrl}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-neutral-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center"
              >
                <Upload className="w-5 h-5 mr-2" />
                {uploadingBeforeAfter ? "Добавяне..." : "Добави снимки"}
              </button>
            </form>
          </div>
        )}
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedPhoto}
              alt="Booking photo"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}

      {rescheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
          <div className="bg-neutral-900 border-2 border-neutral-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Избери нов час</h2>
              <button
                onClick={() => setRescheduleModalOpen(false)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Дата *
                </label>
                <input
                  type="date"
                  value={rescheduleData.date}
                  onChange={(e) =>
                    setRescheduleData({
                      ...rescheduleData,
                      date: e.target.value,
                    })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Час *
                </label>
                <input
                  type="time"
                  value={rescheduleData.time}
                  onChange={(e) =>
                    setRescheduleData({
                      ...rescheduleData,
                      time: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setRescheduleModalOpen(false)}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Отказ
                </button>
                <button
                  onClick={handleReschedule}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Потвърди
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
          <div className="bg-neutral-900 border-2 border-neutral-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Отказ на заявка</h2>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Причина за отказ (опционално)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Напишете причина за отказ..."
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600 min-h-[80px]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-neutral-300">
                    Предложени алтернативни часове (опционално)
                  </label>
                  <button
                    onClick={addSuggestedSlot}
                    className="text-red-600 hover:text-red-500 text-sm font-semibold"
                  >
                    + Добави час
                  </button>
                </div>

                <div className="space-y-3">
                  {suggestedSlots.map((slot, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="date"
                        value={slot.date}
                        onChange={(e) =>
                          updateSuggestedSlot(index, "date", e.target.value)
                        }
                        className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                      />
                      <input
                        type="time"
                        value={slot.time}
                        onChange={(e) =>
                          updateSuggestedSlot(index, "time", e.target.value)
                        }
                        className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                      />
                      {suggestedSlots.length > 1 && (
                        <button
                          onClick={() => removeSuggestedSlot(index)}
                          className="text-red-600 hover:text-red-500 p-2"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setRejectModalOpen(false)}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Отказ
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Потвърди отказ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {quickBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
          <div className="bg-neutral-900 border-2 border-neutral-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Бърза резервация
                </h2>
                <p className="text-neutral-400 text-sm">
                  {barbers[quickBookData.barberId]?.name} • {quickBookData.time}{" "}
                  •{" "}
                  {new Date(quickBookData.date + "T12:00").toLocaleDateString(
                    "bg-BG"
                  )}
                </p>
              </div>
              <button
                onClick={() => setQuickBookModalOpen(false)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleQuickBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Име на клиент *
                </label>
                <input
                  type="text"
                  value={quickBookData.fullName}
                  onChange={(e) =>
                    setQuickBookData({
                      ...quickBookData,
                      fullName: e.target.value,
                    })
                  }
                  placeholder="Иван Петров"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Телефон *
                </label>
                <input
                  type="tel"
                  value={quickBookData.phone}
                  onChange={(e) =>
                    setQuickBookData({
                      ...quickBookData,
                      phone: e.target.value,
                    })
                  }
                  placeholder="0888123456"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Услуга (опционално)
                </label>
                <input
                  type="text"
                  value={quickBookData.service}
                  onChange={(e) =>
                    setQuickBookData({
                      ...quickBookData,
                      service: e.target.value,
                    })
                  }
                  placeholder="Подстрижка"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setQuickBookModalOpen(false)}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Отказ
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Запази
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* News Tab */}
      {activeTab === "news" && (
        <div className="bg-neutral-900 border-2 border-neutral-800 rounded-lg p-6">
          <div className="flex items-center space-x-4 mb-6">
            <Bell className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-bold text-white">
              Управление на новини/алерти
            </h2>
          </div>

          <form onSubmit={handleCreateNews} className="mb-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Текст на новината *
              </label>
              <textarea
                value={newsText}
                onChange={(e) => setNewsText(e.target.value)}
                placeholder="Например: Барбершопът ще бъде затворен на 25.12.2025"
                className="w-full px-4 py-3 bg-neutral-800 border-2 border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-red-600 focus:outline-none"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  От дата *
                </label>
                <input
                  type="date"
                  value={newsStartDate}
                  onChange={(e) => setNewsStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-800 border-2 border-neutral-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  До дата *
                </label>
                <input
                  type="date"
                  value={newsEndDate}
                  onChange={(e) => setNewsEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-800 border-2 border-neutral-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Добави новина</span>
            </button>
          </form>

          <div className="border-t-2 border-neutral-800 pt-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Активни новини
            </h3>

            {loadingNews ? (
              <div className="text-center text-neutral-400 py-8">
                Зареждане...
              </div>
            ) : newsList.length === 0 ? (
              <div className="text-center text-neutral-400 py-8">
                Няма добавени новини
              </div>
            ) : (
              <div className="space-y-3">
                {newsList.map((news) => {
                  const today = new Date().toISOString().split("T")[0];
                  const isActive =
                    news.active &&
                    news.startDate <= today &&
                    news.endDate >= today;

                  return (
                    <div
                      key={news._id}
                      className={`bg-neutral-800 border-2 rounded-lg p-4 ${
                        isActive
                          ? "border-red-600"
                          : "border-neutral-700 opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {isActive && (
                              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                АКТИВНА
                              </span>
                            )}
                            {!isActive && (
                              <span className="bg-neutral-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                НЕАКТИВНА
                              </span>
                            )}
                          </div>
                          <p className="text-white font-medium mb-2">
                            {news.text}
                          </p>
                          <p className="text-neutral-400 text-sm">
                            От{" "}
                            {new Date(news.startDate).toLocaleDateString(
                              "bg-BG"
                            )}{" "}
                            до{" "}
                            {new Date(news.endDate).toLocaleDateString("bg-BG")}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteNews(news._id)}
                          className="ml-4 bg-neutral-700 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                          title="Изтрий новина"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
