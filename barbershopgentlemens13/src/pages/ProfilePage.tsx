import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User as UserIcon,
  Mail,
  Phone,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { api, type Booking } from "../lib/api";
import Header from "../components/Header";

export function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const data = await api.me();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoadingBookings(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Моля, влезте в профила си</p>
          <a
            href="/"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg transition-colors"
          >
            Начало
          </a>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const upcomingBookings = bookings.filter(
    (b) => b.date >= today && ["pending", "approved"].includes(b.status)
  );
  const pastBookings = bookings.filter(
    (b) => b.date < today || b.status === "completed"
  );

  const displayBookings =
    activeTab === "upcoming" ? upcomingBookings : pastBookings;

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { text: "Очаква потвърждение", color: "bg-yellow-600" },
      approved: { text: "Потвърдена", color: "bg-green-600" },
      rejected: { text: "Отказана", color: "bg-red-600" },
      completed: { text: "Завършена", color: "bg-neutral-600" },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    return (
      <span
        className={`${badge.color} text-white text-xs px-3 py-1 rounded-full font-semibold`}
      >
        {badge.text}
      </span>
    );
  };

  const getBarberName = (barberId: string | { name?: string }) => {
    if (typeof barberId === "string") return barberId;
    return barberId?.name || "—";
  };

  const getServiceText = (service: string | { name?: string }) => {
    if (typeof service === "string") return service;
    return service?.name || "—";
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* User Info Section */}
        <div className="bg-neutral-900 border-2 border-neutral-800 rounded-lg p-8 mb-8">
          <div className="flex items-start space-x-6">
            {user.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.fullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-red-600"
              />
            ) : (
              <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-12 h-12 text-white" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-4">
                {user.fullName}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-neutral-300">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-red-600" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-red-600" />
                  <span>{user.phone || "—"}</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  <span className="text-green-400">Потвърден профил</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-red-600" />
                  <span>{bookings.length} резервации общо</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-4 border-b border-neutral-800">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-6 py-3 font-bold transition-colors ${
                activeTab === "upcoming"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Предстоящи ({upcomingBookings.length})
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`px-6 py-3 font-bold transition-colors ${
                activeTab === "past"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              История ({pastBookings.length})
            </button>
          </div>
        </div>

        {/* Bookings List */}
        {loadingBookings ? (
          <div className="text-center text-white py-12">
            Зареждане на резервации...
          </div>
        ) : displayBookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-400 text-lg mb-6">
              {activeTab === "upcoming"
                ? "Нямате предстоящи резервации"
                : "Нямате минали резервации"}
            </p>
            <a
              href="/booking"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg transition-colors"
            >
              Запази час
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {displayBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-neutral-900 border-2 border-neutral-800 rounded-lg p-6 hover:border-red-600 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {getServiceText(booking.service)}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-neutral-300">
                          <div className="flex items-center">
                            <UserIcon className="w-4 h-4 mr-2 text-red-600" />
                            <span>{getBarberName(booking.barberId)}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-red-600" />
                            <span>
                              {new Date(booking.date).toLocaleDateString(
                                "bg-BG"
                              )}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-red-600" />
                            <span>{booking.time}</span>
                          </div>
                        </div>
                      </div>
                      <div>{getStatusBadge(booking.status)}</div>
                    </div>

                    {booking.comment && (
                      <p className="text-sm text-neutral-400 italic mb-4 pl-6 border-l-2 border-neutral-700">
                        "{booking.comment}"
                      </p>
                    )}
                  </div>

                  <div className="flex lg:flex-col gap-2">
                    {booking.photoUrl && (
                      <img
                        src={booking.photoUrl}
                        alt="Booking reference"
                        className="w-20 h-20 lg:w-24 lg:h-24 rounded-lg object-cover border-2 border-neutral-700"
                      />
                    )}

                    {activeTab === "past" && booking.status === "completed" && (
                      <a
                        href="/booking"
                        className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm whitespace-nowrap"
                      >
                        Запази отново
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
