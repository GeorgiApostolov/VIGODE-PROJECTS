/**
 * Barbershop backend (Node.js + Express + MongoDB)
 * Base path: /backend
 */

import path from "path";
import fs from "fs";
import url from "url";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// МОДЕЛИ (имаш ги в отделни файлове)
import Service from "./models/Service.js";
import GalleryItem from "./models/GalleryItem.js";
import BeforeAfterItem from "./models/BeforeAfterItem.js";
import User from "./models/User.js"; // models/User.js трябва да има поле profilePhoto

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ----------------------- Config ----------------------- */
const PORT = Number(process.env.PORT || 4000);
const MONGO_URI = process.env.MONGO_URI || "";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "*";
const BASE_PATH = process.env.BASE_PATH || "/backend";
const PUBLIC_BASE_URL =
  process.env.PUBLIC_BASE_URL || "https://barbershopgentlemens13.com";
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || ""; // получател за известия
const JWT_SECRET = process.env.JWT_SECRET || "change-me-please";

/* ----------------------- App -------------------------- */
const app = express();
app.set("trust proxy", 1);
app.use(cors({ origin: CLIENT_ORIGIN, credentials: false }));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("tiny"));

/* -------------------- Uploads (общо) ------------------ */
const uploadsRoot = path.join(__dirname, "uploads");
const bookingDir = path.join(uploadsRoot, "bookings");
const profilesDir = path.join(uploadsRoot, "profiles");
[uploadsRoot, bookingDir, profilesDir].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const imageFilter = (_req, file, cb) => {
  const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
  cb(ok ? null : new Error("Unsupported file type"), ok);
};
const filenameGen = (_req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  const safe = Date.now() + "-" + Math.random().toString(36).slice(2) + ext;
  cb(null, safe);
};

// За снимки към резервации
const storageBooking = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, bookingDir),
  filename: filenameGen,
});
const uploadBooking = multer({
  storage: storageBooking,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: imageFilter,
});

// За профилни снимки при регистрация
const storageProfiles = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, profilesDir),
  filename: filenameGen,
});
const uploadProfile = multer({
  storage: storageProfiles,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: imageFilter,
});

// статично сервиране на ВСИЧКО от uploads/
app.use(
  `${BASE_PATH}/uploads`,
  express.static(uploadsRoot, {
    setHeaders(res) {
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
    maxAge: "1y",
  })
);

/* ------------------- Mongo ---------------------------- */
let dbStatus = "❌ Not connected";

mongoose.connection.on("connected", () => (dbStatus = "✅ MongoDB Connected"));
mongoose.connection.on(
  "error",
  (err) => (dbStatus = "❌ MongoDB Error: " + err.message)
);

if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout след 5 секунди
      socketTimeoutMS: 45000, // Timeout за socket след 45 секунди
    })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.log("❌ MongoDB Error:", err.message));
} else {
  console.warn("⚠️ MONGO_URI is not set. API will run without DB.");
}

/* -------------------- Schemas (inline) ---------------- */
// Barber
const BarberSchema = new mongoose.Schema(
  {
    name: String,
    title: String,
    image: String,
    schedule: {
      regular: String,
      wednesday: String,
      sunday: String,
    },
    workHours: {
      start: { type: Number, default: 8 }, // Начален час (8 = 08:00)
      end: { type: Number, default: 20 }, // Краен час (20 = 20:00)
      wednesdayStart: { type: Number }, // Начален час в сряда (nullable)
      lunchBreak: { type: Boolean, default: true }, // Пауза в 13:00
    },
  },
  { timestamps: true }
);
const Barber = mongoose.models.Barber || mongoose.model("Barber", BarberSchema);

// Booking
const BookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    fullName: String,
    email: String,
    phone: String,
    barberId: { type: mongoose.Schema.Types.ObjectId, ref: "Barber" },
    date: String, // YYYY-MM-DD
    time: String, // HH:mm
    service: String,
    comment: String,
    photoUrl: String,
    sendReminder: { type: Boolean, default: true },
    reminderSent: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// хваща дублиран слот (pending/approved)
BookingSchema.index(
  { barberId: 1, date: 1, time: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending", "approved"] } },
  }
);

const Booking =
  mongoose.models.Booking || mongoose.model("Booking", BookingSchema);

/* ----------------- Auth helpers ----------------------- */
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}
function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (_e) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

/* --------------- Email helpers (safe) ----------------- */
/** Динамично зареждаме email.js. Ако липсва nodemailer или файлът — няма краш. */
async function withEmail(fnName, args) {
  try {
    const mod = await import("./email.js");
    if (typeof mod[fnName] === "function") {
      await mod[fnName](args);
    }
  } catch (e) {
    console.warn(`(email) ${fnName} skipped:`, e?.message);
  }
}

/* ---------------- Services cache ---------------------- */
let SERVICES = [];
async function loadServices() {
  try {
    const list = await Service.find().sort({ order: 1, createdAt: 1, name: 1 });
    SERVICES = list;
    console.log("✅ Services loaded:", SERVICES.length);
  } catch (err) {
    console.error("❌ Failed to load services:", err.message);
  }
}
loadServices();
setInterval(loadServices, 60_000);

/* --------------------- Routes ------------------------- */
// Admin middleware - check for hardcoded admin token
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.replace("Bearer ", "");
  if (token === "admin123") {
    req.isAdmin = true;
    return next();
  }
  // If not admin token, check if it's a valid user JWT
  return requireAuth(req, res, next);
}

// Health
app.get(`${BASE_PATH}`, (_req, res) => {
  res.status(200).send(`
    <h1 style="font-family: system-ui">✅ Barbershop API is running</h1>
    <p>Database Status: <strong>${dbStatus}</strong></p>
  `);
});
app.get(`${BASE_PATH}/health`, (_req, res) =>
  res.json({ ok: true, db: dbStatus })
);

// Services
app.get(`${BASE_PATH}/api/services`, async (_req, res, next) => {
  try {
    const services = await Service.find().lean();
    const preferredOrder = [
      "Fade прическа + оформяне с ножица",
      "Стандартно подстригване",
      "Измиване на коса с 3 вида продукти",
      "Оформяне на брада",
      "Кола маска - нос, уши",
    ];
    const sorted = services.sort((a, b) => {
      const ia = preferredOrder.indexOf(a.name);
      const ib = preferredOrder.indexOf(b.name);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });
    res.json(sorted);
  } catch (e) {
    next(e);
  }
});

// Barbers
app.get(`${BASE_PATH}/api/barbers`, async (_req, res, next) => {
  try {
    if (!MONGO_URI) return res.json([]);
    const docs = await Barber.find()
      .select("name title schedule image workHours createdAt")
      .sort({ createdAt: 1 })
      .lean();

    const barbers = docs.map((b) => ({
      _id: b._id,
      name: b.name,
      title: b.title,
      schedule: b.schedule,
      image: b.image || null,
      workHours: b.workHours || { start: 8, end: 20, lunchBreak: true },
    }));
    res.json(barbers);
  } catch (e) {
    next(e);
  }
});

// Update barber work hours (admin only) - за миграция
app.post(
  `${BASE_PATH}/api/barbers/migrate-hours`,
  requireAdmin,
  async (_req, res, next) => {
    try {
      // Намери Иван и добави работните часове
      const ivan = await Barber.findOne({
        $or: [
          { name: /иван/i },
          { name: /ivan/i },
          { _id: "690c9a836832a4d4a7087762" },
        ],
      });

      if (ivan && !ivan.workHours) {
        ivan.workHours = {
          start: 8,
          end: 20,
          wednesdayStart: 12, // В сряда от 12:00
          lunchBreak: true,
        };
        await ivan.save();
      }

      // Актуализирай всички останали барбъри с default часове ако нямат
      await Barber.updateMany(
        { workHours: { $exists: false } },
        { $set: { workHours: { start: 8, end: 20, lunchBreak: true } } }
      );

      res.json({ success: true, message: "Work hours migrated" });
    } catch (e) {
      next(e);
    }
  }
);

// Bookings
app.post(
  `${BASE_PATH}/api/bookings`,
  uploadBooking.single("photo"),
  async (req, res, next) => {
    try {
      const {
        userId,
        fullName,
        email,
        phone,
        barberId,
        date,
        time,
        service,
        comment,
        sendReminder = true,
      } = req.body;

      if (!date || !time || !service || !barberId) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      let photoUrl = null;
      if (req.file) {
        photoUrl = `${PUBLIC_BASE_URL}${BASE_PATH}/uploads/bookings/${req.file.filename}`;
      } else if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        // Ако няма качена снимка, но има userId, използвай профилната снимка
        try {
          const user = await User.findById(userId).lean();
          if (user?.profilePhoto) {
            photoUrl = user.profilePhoto;
          }
        } catch (err) {
          console.log("Could not fetch user profile photo:", err);
        }
      }

      // Convert userId string to ObjectId if present
      let userObjectId = null;
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        userObjectId = new mongoose.Types.ObjectId(userId);
      }

      const created = await Booking.create({
        userId: userObjectId,
        fullName,
        email,
        phone,
        barberId,
        date,
        time,
        service,
        comment,
        sendReminder: String(sendReminder) === "true",
        photoUrl,
        status: "pending",
      });

      // Имейл до клиента + вътрешно известие (ако email.js е наличен)
      let barberName = "";
      try {
        const barber = await Barber.findById(barberId).lean();
        barberName = barber?.name || "";
      } catch {}
      await withEmail("sendBookingReceived", {
        customerEmail: created.email,
        notifyEmail: NOTIFY_EMAIL || undefined,
        fullName: created.fullName,
        phone: created.phone,
        service: created.service,
        barberName,
        date: created.date,
        time: created.time,
        comment: created.comment,
        photoUrl: created.photoUrl,
      });

      res.status(201).json(created);
    } catch (e) {
      if (e?.code === 11000) {
        return res
          .status(409)
          .json({ error: "Този слот вече е зает, моля изберете друг час." });
      }
      next(e);
    }
  }
);

// Manual booking (admin only)
app.post(
  `${BASE_PATH}/api/bookings/manual`,
  requireAdmin,
  uploadBooking.single("photo"),
  async (req, res, next) => {
    try {
      // Check if hardcoded admin or user with admin role
      if (!req.isAdmin && !req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const {
        userId,
        fullName,
        email,
        phone,
        barberId,
        date,
        time,
        service,
        comment,
        sendReminder = true,
      } = req.body;

      if (!date || !time || !service || !barberId) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      let photoUrl = null;
      if (req.file) {
        photoUrl = `${PUBLIC_BASE_URL}${BASE_PATH}/uploads/bookings/${req.file.filename}`;
      } else if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        // Ако няма качена снимка, но има userId, използвай профилната снимка
        try {
          const user = await User.findById(userId).lean();
          if (user?.profilePhoto) {
            photoUrl = user.profilePhoto;
          }
        } catch (err) {
          console.log("Could not fetch user profile photo:", err);
        }
      }

      // Convert userId string to ObjectId if present
      let userObjectId = null;
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        userObjectId = new mongoose.Types.ObjectId(userId);
      }

      const created = await Booking.create({
        userId: userObjectId,
        fullName,
        email,
        phone,
        barberId,
        date,
        time,
        service,
        comment,
        sendReminder: String(sendReminder) === "true",
        photoUrl,
        status: "approved", // Manual bookings are auto-approved
      });

      // Send confirmation email
      let barberName = "";
      try {
        const barber = await Barber.findById(barberId).lean();
        barberName = barber?.name || "";
      } catch {}

      await withEmail("sendBookingApproved", {
        customerEmail: created.email,
        fullName: created.fullName,
        date: created.date,
        time: created.time,
      });

      res.status(201).json(created);
    } catch (e) {
      if (e?.code === 11000) {
        return res
          .status(409)
          .json({ error: "Този слот вече е зает, моля изберете друг час." });
      }
      next(e);
    }
  }
);

// List bookings
app.get(`${BASE_PATH}/api/bookings`, async (req, res, next) => {
  try {
    const { status, barberId } = req.query;
    const q = {};
    if (status) q.status = status;
    if (barberId) q.barberId = barberId;
    const list = await Booking.find(q).sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (e) {
    next(e);
  }
});

// Approve booking
app.patch(`${BASE_PATH}/api/bookings/:id/approve`, async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!booking) return res.status(404).json({ error: "Not found" });

    await withEmail("sendBookingApproved", {
      customerEmail: booking.email,
      fullName: booking.fullName,
      date: booking.date,
      time: booking.time,
    });

    res.json(booking);
  } catch (e) {
    next(e);
  }
});

// Reject booking
app.patch(`${BASE_PATH}/api/bookings/:id/reject`, async (req, res, next) => {
  try {
    const { reason = "", alternatives = [] } = req.body || {};
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", comment: reason },
      { new: true }
    );
    if (!booking) return res.status(404).json({ error: "Not found" });

    await withEmail("sendBookingRejected", {
      customerEmail: booking.email,
      fullName: booking.fullName,
      reason,
      alternatives, // [{date, time}]
    });

    res.json(booking);
  } catch (e) {
    next(e);
  }
});

// Delete booking (admin only)
app.delete(
  `${BASE_PATH}/api/bookings/:id`,
  requireAdmin,
  async (req, res, next) => {
    try {
      const booking = await Booking.findByIdAndDelete(req.params.id);
      if (!booking) return res.status(404).json({ error: "Not found" });
      res.json({ success: true, message: "Booking deleted" });
    } catch (e) {
      next(e);
    }
  }
);

/* -------------------- Gallery ------------------------- */
app.get(`${BASE_PATH}/api/gallery`, async (req, res, next) => {
  try {
    const { limit = 60, barberId, tag, q } = req.query;
    const filter = { isVisible: true };
    if (barberId) filter.barberId = barberId;
    if (tag) filter.tags = tag;
    if (q) filter.caption = { $regex: q, $options: "i" };

    const items = await GalleryItem.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(Number(limit));
    res.json(items);
  } catch (e) {
    next(e);
  }
});

app.post(`${BASE_PATH}/api/gallery`, async (req, res, next) => {
  try {
    const {
      imageUrl,
      caption = "",
      tags = [],
      barberId = null,
      sortOrder = 0,
      isVisible = true,
    } = req.body;
    if (!imageUrl)
      return res.status(400).json({ error: "imageUrl is required" });

    const doc = await GalleryItem.create({
      imageUrl,
      caption,
      tags,
      barberId,
      sortOrder,
      isVisible,
    });
    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
});

app.put(`${BASE_PATH}/api/gallery/:id`, async (req, res, next) => {
  try {
    const updated = await GalleryItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

app.delete(`${BASE_PATH}/api/gallery/:id`, async (req, res, next) => {
  try {
    await GalleryItem.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

/* ---------------- Before / After ---------------------- */
app.get(`${BASE_PATH}/api/before-after`, async (req, res, next) => {
  try {
    const { limit = 30, barberId, tag } = req.query;
    const filter = { isVisible: true };
    if (barberId) filter.barberId = barberId;
    if (tag) filter.tags = tag;

    const items = await BeforeAfterItem.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(Number(limit));
    res.json(items);
  } catch (e) {
    next(e);
  }
});

app.post(`${BASE_PATH}/api/before-after`, async (req, res, next) => {
  try {
    const {
      title = "",
      beforeUrl,
      afterUrl,
      tags = [],
      barberId = null,
      sortOrder = 0,
      isVisible = true,
    } = req.body;
    if (!beforeUrl || !afterUrl)
      return res
        .status(400)
        .json({ error: "beforeUrl & afterUrl are required" });

    const doc = await BeforeAfterItem.create({
      title,
      beforeUrl,
      afterUrl,
      tags,
      barberId,
      sortOrder,
      isVisible,
    });
    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
});

app.put(`${BASE_PATH}/api/before-after/:id`, async (req, res, next) => {
  try {
    const updated = await BeforeAfterItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

app.delete(`${BASE_PATH}/api/before-after/:id`, async (req, res, next) => {
  try {
    await BeforeAfterItem.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

/* ------------------ Auth (с профилна снимка) ---------- */
app.post(
  `${BASE_PATH}/api/auth/register`,
  uploadProfile.single("photo"),
  async (req, res, next) => {
    try {
      const { fullName, email, phone, password } = req.body;
      if (!email || !password)
        return res
          .status(400)
          .json({ error: "Email и парола са задължителни" });

      const exists = await User.findOne({ email });
      if (exists)
        return res.status(409).json({ error: "Този имейл вече е регистриран" });

      // ако има качен файл – правим публичен URL
      let profilePhoto = null;
      if (req.file) {
        profilePhoto = `${PUBLIC_BASE_URL}${BASE_PATH}/uploads/profiles/${req.file.filename}`;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        fullName,
        email,
        phone,
        passwordHash,
        profilePhoto, // поле в модела
      });

      const token = signToken({ _id: user._id, email: user.email });

      res.json({
        token,
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          profilePhoto: user.profilePhoto || null,
        },
      });
    } catch (e) {
      next(e);
    }
  }
);

app.post(`${BASE_PATH}/api/auth/login`, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ error: "Невалиден имейл или парола" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok)
      return res.status(401).json({ error: "Невалиден имейл или парола" });

    const token = signToken({ _id: user._id, email: user.email });
    res.json({
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profilePhoto: user.profilePhoto || null,
      },
    });
  } catch (e) {
    next(e);
  }
});

app.get(`${BASE_PATH}/api/me`, requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user) return res.status(404).json({ error: "Not found" });

    const bookings = await Booking.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profilePhoto: user.profilePhoto || null,
      },
      bookings,
    });
  } catch (e) {
    next(e);
  }
});

/* ---------------- Error & 404 ------------------------- */
app.use((req, res, _next) => {
  if (req.path.startsWith(BASE_PATH)) {
    return res.status(404).json({ error: "Not Found" });
  }
  return res.status(404).send("Not Found");
});

app.use((err, _req, res, _next) => {
  console.error("API error:", err);
  res.status(500).json({ error: err.message || "Server error" });
});

/* --------------------- Start -------------------------- */
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`ℹ️  Base path: ${BASE_PATH}`);
});

// SMTP проверка (ако email.js съществува)
withEmail("verifySmtp");

// Start reminder scheduler
(async () => {
  try {
    const { startReminderScheduler } = await import("./reminder-scheduler.js");
    await startReminderScheduler();
  } catch (e) {
    console.warn("⚠️ Reminder scheduler not started:", e?.message);
  }
})();
