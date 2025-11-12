import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

type User = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  profilePhoto?: string;
};
type AuthCtx = {
  user: User | null;
  token: string | null;
  openAuth: (initialTab?: "login" | "register") => void;
  closeAuth: () => void;
  isAuthOpen: boolean;
  initialTab: "login" | "register";
  login: (email: string, password: string) => Promise<void>;
  register: (
    fullName: string,
    email: string,
    phone: string,
    password: string,
    photo?: File
  ) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>(null as any);

const API_BASE = import.meta.env.VITE_API_BASE || "/backend";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("authToken")
  );
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [initialTab, setInitialTab] = useState<"login" | "register">("login");

  const openAuth = (tab: "login" | "register" = "login") => {
    setInitialTab(tab);
    setIsAuthOpen(true);
  };
  const closeAuth = () => setIsAuthOpen(false);

  const refreshMe = useCallback(async () => {
    if (!token) return;
    const res = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
    } else {
      // токенът е невалиден
      localStorage.removeItem("authToken");
      setToken(null);
      setUser(null);
    }
  }, [token]);

  async function login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    localStorage.setItem("authToken", data.token);
    setToken(data.token);
    setUser(data.user);
    closeAuth();
  }

  async function register(
    fullName: string,
    email: string,
    phone: string,
    password: string,
    photo?: File
  ) {
    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("password", password);
    if (photo) formData.append("photo", photo);

    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Register failed");
    localStorage.setItem("authToken", data.token);
    setToken(data.token);
    setUser(data.user);
    closeAuth();
  }

  function logout() {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
  }

  useEffect(() => {
    if (token) {
      refreshMe(); /* при зареждане, ако има токен */
    }
  }, [token, refreshMe]);

  return (
    <Ctx.Provider
      value={{
        user,
        token,
        openAuth,
        closeAuth,
        isAuthOpen,
        initialTab,
        login,
        register,
        logout,
        refreshMe,
      }}
    >
      {/* модалът ще го рендернем тук чрез портал от компонента */}
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
