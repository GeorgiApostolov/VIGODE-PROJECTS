export type Barber = {
  _id: string;
  name: string;
  title?: string;
  image?: string;
};
export type Service = {
  _id: string;
  name: string;
  price: number;
  description?: string;
};

export type Booking = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  barberId: string;
  date: string;
  time: string;
  service: string | { _id: string; name: string; title?: string };
  comment?: string;
  photoUrl?: string;
  sendReminder?: boolean;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt?: string;
  userId?: string;
};

export interface GalleryItem {
  _id: string;
  imageUrl: string;
  caption?: string;
  tags?: string[];
  sortOrder?: number;
}

export interface BeforeAfterItem {
  _id: string;
  title?: string;
  beforeUrl: string;
  afterUrl: string;
  sortOrder?: number;
}

export interface News {
  _id: string;
  text: string;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || "/backend";

function adminHeaders(): Record<string, string> {
  const token = localStorage.getItem("adminToken") || "";
  return token ? { "x-admin-token": token } : {};
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  async getServices(): Promise<Service[]> {
    const r = await fetch(`${API_BASE}/services`, { cache: "no-store" });
    if (!r.ok) throw new Error("services load failed");
    const data = await r.json();
    return data.services || data;
  },

  async getBarbers(): Promise<Barber[]> {
    const r = await fetch(`${API_BASE}/barbers`, { cache: "no-store" });
    if (!r.ok) throw new Error("barbers load failed");
    const data = await r.json();
    return data.barbers || data;
  },

  async createBooking(payload: {
    fullName: string;
    email: string;
    phone: string;
    barberId: string;
    date: string;
    time: string;
    service: string;
    comment?: string;
    sendReminder?: boolean;
    photo?: File;
    userId?: string;
  }): Promise<Booking> {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (k === "photo" && v instanceof File) fd.append("photo", v);
      else fd.append(k, String(v));
    });

    const r = await fetch(`${API_BASE}/bookings`, {
      method: "POST",
      body: fd,
    });
    if (!r.ok) {
      const errorData = await r
        .json()
        .catch(() => ({ message: "Booking failed" }));
      throw new Error(errorData.message || errorData.error || "Booking failed");
    }
    return r.json();
  },

  async listBookings(params?: {
    status?: string;
    barberId?: string;
  }): Promise<Booking[]> {
    const qs = new URLSearchParams(params as any).toString();
    const headers = adminHeaders();
    const hasAdminToken = Object.keys(headers).length > 0;

    const r = await fetch(`${API_BASE}/bookings${qs ? `?${qs}` : ""}`, {
      headers: hasAdminToken ? headers : {},
      cache: "no-store",
    });
    if (!r.ok) throw new Error("bookings load failed");
    return r.json();
  },

  async approveBooking(id: string): Promise<{ ok: true }> {
    const r = await fetch(`${API_BASE}/bookings/${id}/approve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...adminHeaders() },
    });
    if (!r.ok) throw new Error("approve failed");
    return r.json();
  },

  async rejectBooking(
    id: string,
    payload: {
      reason: string;
      alternatives?: Array<{ date: string; time: string }>;
    }
  ): Promise<{ ok: true }> {
    const r = await fetch(`${API_BASE}/bookings/${id}/reject`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...adminHeaders() },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error("reject failed");
    return r.json();
  },

  async deleteBooking(id: string): Promise<{ ok: true }> {
    const r = await fetch(`${API_BASE}/bookings/${id}`, {
      method: "DELETE",
      headers: adminHeaders(),
    });
    if (!r.ok) throw new Error("delete failed");
    return r.json();
  },

  async completeBooking(id: string): Promise<Booking> {
    const r = await fetch(`${API_BASE}/bookings/${id}/complete`, {
      method: "PATCH",
      headers: adminHeaders(),
    });
    if (!r.ok) throw new Error("complete failed");
    return r.json();
  },

  async rescheduleBooking(
    id: string,
    payload: { date: string; time: string }
  ): Promise<{ ok: true }> {
    const r = await fetch(`${API_BASE}/bookings/${id}/reschedule`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...adminHeaders() },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error("reschedule failed");
    return r.json();
  },

  async createManualBooking(payload: {
    fullName: string;
    email?: string;
    phone: string;
    barberId: string;
    date: string;
    time: string;
    service: string;
    userId?: string;
    comment?: string;
    photo?: File;
  }): Promise<Booking> {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (k === "photo" && v instanceof File) fd.append("photo", v);
      else fd.append(k, String(v));
    });

    const r = await fetch(`${API_BASE}/bookings/manual`, {
      method: "POST",
      headers: authHeaders(), // Use auth token instead of admin token
      body: fd,
    });
    if (!r.ok) {
      const errorData = await r
        .json()
        .catch(() => ({ message: "Manual booking failed" }));
      throw new Error(
        errorData.message || errorData.error || "Manual booking failed"
      );
    }
    return r.json();
  },

  async getGallery(limit = 60): Promise<GalleryItem[]> {
    const res = await fetch(`${API_BASE}/gallery?limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch gallery");
    return res.json();
  },

  async getBeforeAfter(limit = 30): Promise<BeforeAfterItem[]> {
    const res = await fetch(`${API_BASE}/before-after?limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch before-after");
    return res.json();
  },
  async register(payload: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
  }) {
    const r = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error((await r.json()).error || "register failed");
    return r.json(); // {token, user}
  },

  async login(payload: { email: string; password: string }) {
    const r = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error((await r.json()).error || "login failed");
    return r.json(); // {token, user}
  },

  async me() {
    const r = await fetch(`${API_BASE}/me`, { headers: { ...authHeaders() } });
    if (!r.ok) throw new Error("me failed");
    return r.json(); // { user, bookings }
  },

  // News
  async getNews(): Promise<News[]> {
    const r = await fetch(`${API_BASE}/news`);
    if (!r.ok) throw new Error("get news failed");
    return r.json();
  },

  async getAllNews(): Promise<News[]> {
    const r = await fetch(`${API_BASE}/news/all`);
    if (!r.ok) throw new Error("get all news failed");
    return r.json();
  },

  async createNews(payload: {
    text: string;
    startDate: string;
    endDate: string;
    active?: boolean;
  }): Promise<News> {
    const r = await fetch(`${API_BASE}/news`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error("create news failed");
    return r.json();
  },

  async deleteNews(id: string): Promise<{ ok: true }> {
    const r = await fetch(`${API_BASE}/news/${id}`, {
      method: "DELETE",
    });
    if (!r.ok) throw new Error("delete news failed");
    return r.json();
  },
};
