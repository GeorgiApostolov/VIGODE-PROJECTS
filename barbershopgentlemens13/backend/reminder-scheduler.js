import mongoose from "mongoose";
import cron from "node-cron";

// Use existing mongoose models from server.js (shared connection)
let Booking, Barber;

// Initialize models from existing mongoose connection
function getModels() {
  if (!Booking) {
    Booking =
      mongoose.models.Booking ||
      mongoose.model(
        "Booking",
        new mongoose.Schema(
          {
            userId: { type: String, default: null },
            fullName: String,
            email: String,
            phone: String,
            barberId: { type: mongoose.Schema.Types.ObjectId, ref: "Barber" },
            date: String,
            time: String,
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
        )
      );
  }

  if (!Barber) {
    Barber =
      mongoose.models.Barber ||
      mongoose.model(
        "Barber",
        new mongoose.Schema({
          name: String,
        })
      );
  }

  return { Booking, Barber };
}

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
 * Check if a booking needs a reminder (called periodically)
 */
async function checkAndSendReminders() {
  try {
    const { Booking, Barber } = getModels();

    // Find all approved bookings that haven't sent reminder yet
    const bookings = await Booking.find({
      status: "approved",
      sendReminder: true,
      reminderSent: false,
    }).lean();

    if (bookings.length === 0) {
      console.log("✅ No pending reminders to check");
      return;
    }

    console.log(`🔍 Checking ${bookings.length} booking(s) for reminders...`);

    const now = new Date();

    for (const booking of bookings) {
      try {
        // Parse booking datetime - локално българско време
        const [year, month, day] = booking.date.split("-").map(Number);
        const [hours, minutes] = booking.time.split(":").map(Number);
        const bookingDateTime = new Date(
          year,
          month - 1,
          day,
          hours,
          minutes,
          0
        );

        // Calculate time until appointment
        const timeUntilAppointment = bookingDateTime.getTime() - now.getTime();
        const hoursUntilAppointment = timeUntilAppointment / (60 * 60 * 1000);

        console.log(
          `📋 ${booking.fullName} - ${booking.date} ${
            booking.time
          } - ${hoursUntilAppointment.toFixed(2)}h remaining`
        );

        // If appointment has passed, skip
        if (timeUntilAppointment < 0) {
          console.log(`  ⏭️ Appointment has passed, skipping`);
          continue;
        }

        // If appointment is in 2 hours or less, send reminder NOW
        if (hoursUntilAppointment <= 2) {
          console.log(
            `  📧 Sending reminder NOW (${hoursUntilAppointment.toFixed(
              2
            )}h remaining)`
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

          console.log(`  ✅ Reminder sent for booking ${booking._id}`);
        } else {
          console.log(
            `  ⏰ Not yet time (will send when ${
              hoursUntilAppointment.toFixed(2) - 2
            }h pass)`
          );
        }
      } catch (err) {
        console.error(`  ❌ Error processing booking ${booking._id}:`, err);
      }
    }
  } catch (error) {
    console.error("❌ Error in checkAndSendReminders:", error);
  }
}

/**
 * Legacy function - no longer used, kept for compatibility
 */
export async function scheduleReminder(bookingId) {
  console.log(
    `📌 scheduleReminder called for ${bookingId} (now using periodic checks)`
  );
}

/**
 * Send reminder email for a booking
 */
async function sendReminderEmail(booking) {
  // This function is no longer used - reminders sent directly in checkAndSendReminders
  console.log(`⚠️ sendReminderEmail called (deprecated)`);
}

/**
 * Auto-complete past bookings
 */
async function autoCompletePastBookings() {
  try {
    const { Booking } = getModels();
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`; // HH:mm

    // Find all approved bookings that are in the past
    const pastBookings = await Booking.find({
      status: "approved",
      $or: [
        { date: { $lt: currentDate } }, // Date before today
        {
          date: currentDate,
          time: { $lt: currentTime }, // Today but time has passed
        },
      ],
    });

    if (pastBookings.length > 0) {
      // Update all to completed
      await Booking.updateMany(
        {
          _id: { $in: pastBookings.map((b) => b._id) },
        },
        {
          $set: { status: "completed" },
        }
      );

      console.log(`✅ Auto-completed ${pastBookings.length} past booking(s)`);
    }
  } catch (error) {
    console.error("❌ Error auto-completing past bookings:", error);
  }
}

/**
 * Re-schedule all pending reminders on server start
 */
async function rescheduleAllReminders() {
  // No longer needed - periodic checks handle everything
  console.log(
    "✅ Using periodic reminder checks (no manual rescheduling needed)"
  );
}

/**
 * Initialize reminder scheduler
 * NOTE: Uses shared mongoose connection from server.js
 */
export async function startReminderScheduler() {
  try {
    // Initialize models from existing connection
    getModels();

    console.log("✅ Reminder scheduler: Using shared MongoDB connection");

    // Check and send reminders every 15 minutes
    cron.schedule("*/15 * * * *", async () => {
      console.log("🔔 Checking for reminders to send...");
      await checkAndSendReminders();
    });

    console.log(
      "✅ Reminder scheduler: Started (checks every 15 min for reminders)"
    );

    // Run checks immediately on startup
    console.log("🚀 Running initial checks...");
    await checkAndSendReminders();
  } catch (error) {
    console.error("❌ Reminder scheduler failed to start:", error);
  }
}
