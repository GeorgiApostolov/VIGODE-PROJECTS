import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogIn, LogOut, UserCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "./AuthModal";
import { api, type News } from "../lib/api";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [news, setNews] = useState<News[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, openAuth, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const data = await api.getNews();
      setNews(data);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    }
  };

  const handleNavigation = (id: string) => {
    setIsMenuOpen(false);

    if (location.pathname !== "/") {
      navigate(`/?scrollTo=${id}`);
    } else {
      const element = document.getElementById(id);
      if (element) {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
  };

  const navItems = [
    { label: "Начало", id: "home", isLink: false, href: "/" },
    { label: "Цени", id: "services", isLink: false, href: "/" },
    { label: "Екип", id: "team", isLink: false, href: "/" },
    { label: "Галерия", id: "gallery", isLink: true, href: "/gallery" },
    { label: "Запази час", id: "booking", isLink: true, href: "/booking" },
    { label: "За нас", id: "about", isLink: false, href: "/" },
    { label: "Контакт", id: "contact", isLink: false, href: "/" },
  ];

  return (
    <>
      {/* News Alert Banner */}
      {news.length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-center space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div className="text-center">
                {news.map((item, index) => (
                  <p key={item._id} className="text-sm font-medium">
                    {item.text}
                    {index < news.length - 1 && " • "}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <header
        className={`fixed left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? "bg-black shadow-lg" : "bg-transparent"
        }`}
        style={{ top: news.length > 0 ? "52px" : "0" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <a
                href="/"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              >
                <img
                  src="/logo-trans.png"
                  alt="Gentlemen's Club Barbershop"
                  className="h-16 w-16 object-contain"
                />
              </a>
            </div>

            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) =>
                item.isLink ? (
                  <a
                    key={item.id}
                    href={item.href}
                    className="text-white hover:text-red-600 font-medium transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className="text-white hover:text-red-600 font-medium transition-colors"
                  >
                    {item.label}
                  </button>
                )
              )}

              {/* Auth Section Desktop */}
              {!user ? (
                <button
                  onClick={() => openAuth("login")}
                  className="ml-4 inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 font-semibold text-neutral-100 hover:border-neutral-700 transition-colors"
                >
                  <LogIn className="h-4 w-4" /> Вход
                </button>
              ) : (
                <div className="relative ml-4">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 font-semibold text-neutral-100 hover:border-neutral-700 transition-colors"
                  >
                    <UserCircle2 className="h-5 w-5" />
                    <span>{user.fullName.split(" ")[0]}</span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-800 bg-neutral-900 p-2 shadow-xl">
                      <a
                        href="/profile"
                        className="block rounded-lg px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
                      >
                        Профил & часове
                      </a>
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-800"
                      >
                        <LogOut className="h-4 w-4" /> Изход
                      </button>
                    </div>
                  )}
                </div>
              )}
            </nav>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-white hover:text-red-600 transition-colors"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-black border-t border-neutral-800">
            <nav className="px-4 py-6 space-y-4">
              {navItems.map((item) =>
                item.isLink ? (
                  <a
                    key={item.id}
                    href={item.href}
                    className="block w-full text-left text-white hover:text-red-600 font-medium py-2 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className="block w-full text-left text-white hover:text-red-600 font-medium py-2 transition-colors"
                  >
                    {item.label}
                  </button>
                )
              )}

              {/* Auth Section Mobile */}
              {!user ? (
                <button
                  onClick={() => {
                    openAuth("login");
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full text-left text-white hover:text-red-600 font-medium py-2 transition-colors"
                >
                  <LogIn className="h-4 w-4" /> Вход / Регистрация
                </button>
              ) : (
                <>
                  <a
                    href="/profile"
                    className="flex items-center gap-2 w-full text-left text-white hover:text-red-600 font-medium py-2 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserCircle2 className="h-4 w-4" /> {user.fullName}
                  </a>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full text-left text-white hover:text-red-600 font-medium py-2 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Изход
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal />
    </>
  );
}
