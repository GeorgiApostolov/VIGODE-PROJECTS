export type Barber = {
  _id: string;
  name: string;
  title?: string;
  image?: string;
  schedule?: {
    regular?: string;
    wednesday?: string;
    sunday?: string;
  };
  workHours?: {
    start: number;
    end: number;
    wednesdayStart?: number;
    lunchBreak: boolean;
  };
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

const API_BASE = import.meta.env.VITE_API_BASE || "/backend";

function adminHeaders(): Record<string, string> {
  const token = localStorage.getItem("adminToken") || "";
  return token ? { Authorization: `Bearer ${token}` } : {};
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

  async deleteBooking(id: string): Promise<{ success: true }> {
    const r = await fetch(`${API_BASE}/bookings/${id}`, {
      method: "DELETE",
      headers: adminHeaders(),
    });
    if (!r.ok) throw new Error("delete failed");
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
      headers: adminHeaders(), // Use admin token for manual bookings
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
};
