import { useEffect, useState } from "react";
import { X, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function AuthModal() {
  const { isAuthOpen, closeAuth, login, register, initialTab } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");

  // при отваряне задай таба от контекста
  useEffect(() => {
    if (isAuthOpen) setTab(initialTab);
  }, [isAuthOpen, initialTab]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  if (!isAuthOpen) return null;

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
    } catch (e: any) {
      setErr(e.message || "Грешка");
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      if (regForm.password.length < 6)
        throw new Error("Паролата трябва да е поне 6 символа.");
      if (regForm.password !== regForm.confirm)
        throw new Error("Паролите не съвпадат.");
      if (!profilePhoto) throw new Error("Моля, качете профилна снимка.");

      await register(
        regForm.fullName,
        regForm.email,
        regForm.phone,
        regForm.password,
        profilePhoto
      );
    } catch (e: any) {
      setErr(e.message || "Грешка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                tab === "login"
                  ? "bg-red-600 text-white"
                  : "bg-neutral-800 text-neutral-300"
              }`}
              onClick={() => setTab("login")}
            >
              <div className="flex items-center gap-2">
                <LogIn className="w-4 h-4" /> Вход
              </div>
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                tab === "register"
                  ? "bg-red-600 text-white"
                  : "bg-neutral-800 text-neutral-300"
              }`}
              onClick={() => setTab("register")}
            >
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Регистрация
              </div>
            </button>
          </div>
          <button
            onClick={closeAuth}
            className="rounded-lg p-2 hover:bg-neutral-800"
          >
            <X className="h-5 w-5 text-neutral-300" />
          </button>
        </div>

        {tab === "login" ? (
          <form onSubmit={onLogin} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-neutral-300">
                Имейл
              </label>
              <input
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 text-white outline-none focus:border-red-600"
                type="email"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, email: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-neutral-300">
                Парола
              </label>
              <input
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 text-white outline-none focus:border-red-600"
                type="password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                required
              />
            </div>
            {err && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-sm text-red-400">
                {err}
              </div>
            )}
            <button
              disabled={loading}
              className="w-full rounded-lg bg-red-600 px-4 py-3 font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? "Влизане..." : "Влез"}
            </button>
          </form>
        ) : (
          <form onSubmit={onRegister} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-neutral-300">
                Име и фамилия
              </label>
              <input
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 text-white outline-none focus:border-red-600"
                value={regForm.fullName}
                onChange={(e) =>
                  setRegForm({ ...regForm, fullName: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-neutral-300">
                  Имейл
                </label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 text-white outline-none focus:border-red-600"
                  value={regForm.email}
                  onChange={(e) =>
                    setRegForm({ ...regForm, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-neutral-300">
                  Телефон
                </label>
                <input
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 text-white outline-none focus:border-red-600"
                  value={regForm.phone}
                  onChange={(e) =>
                    setRegForm({ ...regForm, phone: e.target.value })
                  }
                  placeholder="+359"
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm text-neutral-300">
                Профилна снимка *
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 3 * 1024 * 1024) {
                    setErr("Файлът е твърде голям. Максимум 3MB.");
                    return;
                  }
                  setProfilePhoto(file);
                  setPhotoPreview(URL.createObjectURL(file));
                  setErr("");
                }}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 text-white outline-none focus:border-red-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-600 file:text-white file:cursor-pointer hover:file:bg-red-700"
                required
              />
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="mt-4 w-32 h-32 object-cover rounded-lg border-2 border-neutral-700"
                />
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-neutral-300">
                  Парола
                </label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 text-white outline-none focus:border-red-600"
                  value={regForm.password}
                  onChange={(e) =>
                    setRegForm({ ...regForm, password: e.target.value })
                  }
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-neutral-300">
                  Повтори парола
                </label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 text-white outline-none focus:border-red-600"
                  value={regForm.confirm}
                  onChange={(e) =>
                    setRegForm({ ...regForm, confirm: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            {err && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-sm text-red-400">
                {err}
              </div>
            )}
            <button
              disabled={loading}
              className="w-full rounded-lg bg-red-600 px-4 py-3 font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? "Създаване..." : "Регистрация"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
