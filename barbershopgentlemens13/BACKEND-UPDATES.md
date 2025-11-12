# Backend Updates - Manual Booking & Email Reminders

## Summary

Added three major features to the backend:

1. **Manual booking endpoint** for admin quick-booking from phone calls
2. **userId tracking** in bookings for user booking history
3. **Automated email reminders** sent 2 hours before appointments

---

## 1. Manual Booking Endpoint

### Backend: `server.js`

**New endpoint:** `POST /backend/api/bookings/manual`

**Features:**

- Requires authentication (JWT token with `isAdmin` role)
- Accepts FormData for optional photo upload
- Auto-approves bookings (status: "approved")
- Sends confirmation email immediately
- Handles duplicate time slot conflicts (409 error)

**Request payload:**

```typescript
{
  userId?: string;        // Optional - links booking to user account
  fullName: string;
  email?: string;
  phone: string;
  barberId: string;
  date: string;          // YYYY-MM-DD
  time: string;          // HH:mm
  service: string;
  comment?: string;
  photo?: File;          // Optional
  sendReminder?: boolean; // Default: true
}
```

**Response:** Returns created booking object with status "approved"

---

## 2. User ID Tracking

### Database Schema Update

**File:** `backend/server.js` - BookingSchema

**Added fields:**

```javascript
{
  userId: { type: String, default: null }, // Already existed, now used
  reminderSent: { type: Boolean, default: false } // New - tracks reminder emails
}
```

### Frontend Integration

**File:** `src/lib/api.ts`

**Updated functions:**

- `createBooking()` - Now sends `userId` when user is logged in
- `createManualBooking()` - Supports `userId` parameter for linking bookings to accounts

**Usage:**

```typescript
// Automatic booking (user-initiated)
await api.createBooking({
  userId: user?._id, // Auto-filled from AuthContext
  fullName: "John Doe",
  // ... other fields
});

// Manual booking (admin-initiated from phone call)
await api.createManualBooking({
  userId: selectedUser?._id, // Optional - can link to existing user
  fullName: "Jane Smith",
  phone: "+359123456789",
  // ... other fields
});
```

---

## 3. Email Reminder System

### New Email Function

**File:** `backend/email.js`

**Added function:** `sendBookingReminder()`

```javascript
export async function sendBookingReminder({
  customerEmail,
  fullName,
  date,
  time,
  service,
  barberName
})
```

Sends email in Bulgarian with:

- Customer name
- Appointment date and time
- Service name
- Barber name
- Friendly reminder message with 💈 emoji

---

### Reminder Scheduler

**File:** `backend/reminder-scheduler.js` (NEW)

**How it works:**

1. Runs every 15 minutes (aligned with booking time slots)
2. Finds approved bookings with `sendReminder: true` and `reminderSent: false`
3. Checks if booking is exactly 2 hours away (±15 min window)
4. Sends reminder email via `sendBookingReminder()`
5. Marks booking as `reminderSent: true` to avoid duplicates

**Scheduler logic:**

```javascript
// Runs every 15 minutes
cron.schedule("*/15 * * * *", async () => {
  console.log("🔔 Checking for appointment reminders...");
  await sendReminders();
});
```

**Time window:**

- Sends reminder between 1:45 and 2:15 hours before appointment
- Example: For 14:00 appointment, sends reminder at 12:00 (±15 min)

**Integration:**

- Auto-starts when server launches (`server.js` line ~730)
- Gracefully handles errors (logs warning if scheduler fails)
- Dynamic import to avoid crashes if dependencies missing

---

## Installation Requirements

### Backend Dependencies

```bash
cd backend
npm install node-cron
```

**Already installed:**

- nodemailer (email sending)
- mongoose (database)
- express (web server)
- multer (file uploads)

---

## Configuration

### Environment Variables (.env)

Ensure these are set for email functionality:

```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=465
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
MAIL_FROM=Barbershop <no-reply@barbershop.com>
NOTIFY_EMAIL=admin@barbershop.com
```

### MongoDB URI

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

---

## Testing

### 1. Test Manual Booking

```bash
# Login as admin first
curl -X POST https://barbershopgentlemens13.com/backend/api/bookings/manual \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "fullName=Test User" \
  -F "phone=+359123456789" \
  -F "email=test@example.com" \
  -F "barberId=BARBER_ID" \
  -F "date=2024-01-15" \
  -F "time=14:00" \
  -F "service=Haircut"
```

Expected response: 201 Created with booking object (status: "approved")

---

### 2. Test Email Reminders

```bash
# Create a booking 2 hours in the future
# Wait for next 15-minute cron cycle
# Check server logs for:
# "🔔 Checking for appointment reminders..."
# "📧 Sending reminder for booking [ID] to [email]"
# "✅ Reminder sent for booking [ID]"
```

---

### 3. Test User ID Tracking

```bash
# Login as user
# Create booking from frontend
# Check database - booking should have userId field populated
# View profile page - booking should appear in history
```

---

## API Routes Summary

### New Routes

- `POST /backend/api/bookings/manual` - Admin-only manual booking creation

### Updated Routes

- `POST /backend/api/bookings` - Now accepts and saves `userId` field

### Unchanged Routes

- `GET /backend/api/bookings` - List all bookings
- `PATCH /backend/api/bookings/:id/approve` - Approve booking
- `PATCH /backend/api/bookings/:id/reject` - Reject booking
- `GET /backend/me` - Get user profile with booking history

---

## Database Schema Changes

### Booking Collection

```javascript
{
  userId: String,              // NEW USAGE - links to User._id
  reminderSent: Boolean,       // NEW - tracks if reminder email sent
  fullName: String,
  email: String,
  phone: String,
  barberId: ObjectId,
  date: String,               // YYYY-MM-DD
  time: String,               // HH:mm
  service: String,
  comment: String,
  photoUrl: String,
  sendReminder: Boolean,      // Default: true
  status: String,             // pending | approved | rejected | completed
  createdAt: Date,
  updatedAt: Date
}
```

---

## Deployment Notes

### cPanel Deployment

⚠️ **Important:** Server entry point is `server.js`

**Steps:**

1. Upload updated files:

   - `backend/server.js` (updated)
   - `backend/email.js` (updated)
   - `backend/reminder-scheduler.js` (NEW)
   - `backend/package.json` (updated with node-cron)

2. SSH into server:

```bash
cd /path/to/backend
npm install
pm2 restart server.js
```

3. Verify logs:

```bash
pm2 logs
# Should see:
# ✅ Server running on port [PORT]
# ✅ SMTP: ready
# ✅ Reminder scheduler: Started (runs every 15 minutes)
# 🔔 Checking for appointment reminders...
```

---

## Error Handling

### Manual Booking Errors

- **401 Unauthorized** - No admin token provided
- **403 Forbidden** - User is not admin
- **409 Conflict** - Time slot already booked
- **400 Bad Request** - Missing required fields

### Email Reminder Errors

- Logged to console but don't crash server
- Failed emails retry on next cron cycle
- Database tracks `reminderSent` to avoid duplicates

### Scheduler Errors

- Gracefully handles missing dependencies
- Logs warnings if SMTP configuration incomplete
- Continues running server even if scheduler fails

---

## Monitoring

### Check Scheduler Status

```bash
# View server logs
pm2 logs server

# Look for these messages every 15 minutes:
# 🔔 Checking for appointment reminders...
# 📧 Sending reminder for booking [ID] to [email]
# ✅ Reminder sent for booking [ID]
```

### Database Queries

```javascript
// Check bookings needing reminders
db.bookings.find({
  status: "approved",
  sendReminder: true,
  reminderSent: false,
});

// Check sent reminders
db.bookings.find({
  reminderSent: true,
});
```

---

## Troubleshooting

### Reminders Not Sending

1. Check SMTP configuration in `.env`
2. Verify `node-cron` installed: `npm list node-cron`
3. Check server logs for scheduler errors
4. Verify booking has `sendReminder: true` and `status: "approved"`
5. Check `reminderSent` field - should be `false`

### Manual Booking Fails

1. Verify user has admin role: `req.user.isAdmin === true`
2. Check JWT token in Authorization header
3. Verify all required fields provided
4. Check for time slot conflicts in database

### User ID Not Saving

1. Verify frontend sends `userId` in request body
2. Check AuthContext provides user object
3. Verify MongoDB connection working
4. Check server logs for database errors

---

## Future Enhancements

### Potential Improvements

- [ ] SMS reminders via Twilio/other provider
- [ ] Multiple reminder times (24h, 2h, 30min)
- [ ] Customizable reminder templates per service
- [ ] Push notifications for mobile app
- [ ] Admin dashboard for reminder statistics
- [ ] Resend failed reminders automatically
- [ ] Calendar integration (Google Calendar, iCal)

---

## Files Changed

### Backend

- ✏️ `backend/server.js` - Added manual booking endpoint, userId tracking, reminderSent field, scheduler integration
- ✏️ `backend/email.js` - Added sendBookingReminder() function
- ✏️ `backend/package.json` - Added node-cron dependency
- ➕ `backend/reminder-scheduler.js` - NEW cron scheduler for email reminders

### Frontend

- ✏️ `src/lib/api.ts` - Updated createManualBooking() with FormData support, fixed authHeaders() type

### Documentation

- ➕ `BACKEND-UPDATES.md` - This file

---

## Support

For issues or questions:

1. Check server logs: `pm2 logs server`
2. Verify environment variables set correctly
3. Test SMTP connection: `node -e "require('./backend/email.js').verifySmtp()"`
4. Review MongoDB connection logs
5. Check cPanel error logs for deployment issues
