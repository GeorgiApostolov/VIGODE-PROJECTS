import mongoose from "mongoose";
import cron from "node-cron";

const MONGO_URI = process.env.MONGO_URI || "";

// Booking Schema - same as in server.js
const BookingSchema = new mongoose.Schema(
  {
    userId: { type: String, default: null },
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
    reminderSent: { type: Boolean, default: false }, // Track if reminder already sent
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Booking =
  mongoose.models.Booking || mongoose.model("Booking", BookingSchema);

// Barber Schema (for getting barber name)
const BarberSchema = new mongoose.Schema({
  name: String,
  // other fields...
});
const Barber = mongoose.models.Barber || mongoose.model("Barber", BarberSchema);

/** Dynamic import email functions to avoid crashes */
async function withEmail(fnName, args) {
  try {
    const mod = await import("./email.js");
    if (typeof mod[fnName] === "function") {
      await mod[fnName](args);
    }
  } catch (e) {
    console.error(`Email helper error (${fnName}):`, e?.message);
  }
}

/**
 * Check bookings and send reminders 2 hours before appointment
 */
async function sendReminders() {
  try {
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // Get today's date in YYYY-MM-DD format
    const todayStr = now.toISOString().split("T")[0];
    const twoHoursLaterStr = twoHoursLater.toISOString().split("T")[0];

    // Time in HH:mm format (2 hours from now)
    const targetHour = String(twoHoursLater.getHours()).padStart(2, "0");
    const targetMinute = String(twoHoursLater.getMinutes()).padStart(2, "0");
    const targetTime = `${targetHour}:${targetMinute}`;

    // Find bookings that:
    // 1. Are approved
    // 2. Have sendReminder: true
    // 3. Haven't sent reminder yet
    // 4. Are scheduled for today or tomorrow (in case time passes midnight)
    // 5. Match the target time (within same 15-min window)
    const bookings = await Booking.find({
      status: "approved",
      sendReminder: true,
      reminderSent: { $ne: true },
      $or: [{ date: todayStr }, { date: twoHoursLaterStr }],
    }).lean();

    for (const booking of bookings) {
      // Parse booking datetime
      const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`);
      const timeDiff = bookingDateTime - now;

      // Send if within 2 hours window (between 1:45 and 2:15 hours)
      if (
        timeDiff >= 1.75 * 60 * 60 * 1000 &&
        timeDiff <= 2.25 * 60 * 60 * 1000
      ) {
        console.log(
          `📧 Sending reminder for booking ${booking._id} to ${booking.email}`
        );

        // Get barber name
        let barberName = "";
        try {
          const barber = await Barber.findById(booking.barberId).lean();
          barberName = barber?.name || "";
        } catch {}

        // Send reminder email
        await withEmail("sendBookingReminder", {
          customerEmail: booking.email,
          fullName: booking.fullName,
          date: booking.date,
          time: booking.time,
          service: booking.service,
          barberName,
        });

        // Mark as sent
        await Booking.updateOne(
          { _id: booking._id },
          { $set: { reminderSent: true } }
        );

        console.log(`✅ Reminder sent for booking ${booking._id}`);
      }
    }
  } catch (error) {
    console.error("❌ Error sending reminders:", error);
  }
}

/**
 * Initialize reminder scheduler
 */
export async function startReminderScheduler() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Reminder scheduler: MongoDB connected");

    // Run every 15 minutes (aligned with booking slots)
    cron.schedule("*/15 * * * *", async () => {
      console.log("🔔 Checking for appointment reminders...");
      await sendReminders();
    });

    console.log("✅ Reminder scheduler: Started (runs every 15 minutes)");

    // Run immediately on startup
    await sendReminders();
  } catch (error) {
    console.error("❌ Reminder scheduler failed to start:", error);
  }
}

// If running as standalone script
if (import.meta.url === `file://${process.argv[1]}`) {
  startReminderScheduler();
}
