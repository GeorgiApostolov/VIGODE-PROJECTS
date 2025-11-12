# 💈 Gentlemen's Barbershop 13 - Booking System

A modern, full-stack booking system for barbershops built with React, TypeScript, and Node.js.

**Live Site:** [barbershopgentlemens13.com](https://barbershopgentlemens13.com)

---

## 🎯 About This Project

This project was developed for **Gentlemen's Barbershop 13** in Berkovitsa, Bulgaria as part of the web development services provided by [**VigoDE Web Agency**](https://vigode.com).

### Development Team & Tools:

- **Client:** Gentlemen's Barbershop 13, Berkovitsa
- **Agency:** [VigoDE.com](https://vigode.com) - Web Development & Design
- **AI Assistants Used:**
  - Bolt.new AI - Initial project scaffolding
  - ChatGPT - Feature planning and architecture
  - GitHub Copilot - Code implementation and optimization

---

## ✨ Features

## Features

### Design

- Black/White/Red (#e50914) color scheme
- Premium, masculine, minimal, and elegant aesthetic
- Montserrat font family
- Fully responsive for desktop, tablet, and mobile
- Smooth scrolling and fade-in animations
- Sticky header with dynamic background

### Pages & Sections

#### Home Page (/)

- **Hero Section**: Fullscreen hero with barbershop interior image and call-to-action
- **Services**: 4 service cards with pricing (Подстрижка, Оформяне на брада, Комбо, Класическо бръснене)
- **Team**: Two barbers with hover cards showing work schedules
  - Иван Кръстев - Майстор бръснар
  - Теодор Балтов - Модерен стилист
- **Gallery**: Before/After slider with interactive comparison
- **Booking Form**: Complete booking system with photo upload
- **About**: Placeholder section for barbershop information
- **Contact**: Contact information with map placeholder
- **Footer**: Social links, quick links, and legal information

#### Profile Page (/profile)

- User authentication required
- Booking history with tabs:
  - Предстоящи (Upcoming bookings)
  - Минали (Past bookings)
- View booking details, photos, and status
- "Book Again" functionality

#### Admin Panel (/admin)

- Token-based authentication (default token: `admin123`)
- View all bookings with filtering by:
  - Status (pending, approved, rejected, completed)
  - Barber
- Approve or reject pending bookings
- View booking photos
- Comprehensive booking management

### Authentication

- Email/password authentication via Supabase
- Guest booking option (no account required)
- User registration with profile creation
- Session management

### Booking System

- Select barber, date, time, and service
- Photo upload (required, max 3MB, JPG/PNG/WebP)
- Date picker with Sunday blocking (closed)
- Time slots from 08:00-20:00 (15-min intervals)
- Optional comment field
- GDPR consent checkbox
- Email reminder option (2 hours before appointment)
- Autofill for logged-in users

### Database Schema

- **profiles**: User profiles with contact information
- **barbers**: Barber information and schedules
- **bookings**: Booking records with status tracking
- **blackout_dates**: Holiday/vacation management
- **admin_tokens**: Admin authentication
- **photos storage**: Image uploads in Supabase Storage

### Working Hours

- Monday - Saturday: 08:00 - 20:00
- Wednesday special hours:
  - Иван: 12:00 - 20:00
  - Теодор: 08:00 - 20:00
- Sunday: Closed

## Tech Stack

### Frontend

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router v6
- **State Management**: React Context API

### Backend

- **Runtime**: Node.js + Express
- **Database**: MongoDB Atlas
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer
- **Email**: Nodemailer (SMTP)
- **Cron Jobs**: node-cron (reminder system)

### Features

- ✅ Real-time booking system
- ✅ Admin panel with notifications
- ✅ Email reminders (2 hours before appointment)
- ✅ Photo upload for reference
- ✅ User authentication & profiles
- ✅ Dynamic work hours from database
- ✅ SEO optimization (meta tags, sitemap, structured data)
- ✅ Responsive design (mobile-first)
- ✅ Browser sound notifications for admins

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- SMTP email account (for reminders)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/your-username/barbershop13.git
cd barbershop13
```

2. **Install dependencies:**

```bash
npm install
cd backend && npm install && cd ..
```

3. **Configure environment variables:**

Create `.env` in `/backend`:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_smtp_email@gmail.com
EMAIL_PASS=your_smtp_password
PUBLIC_BASE_URL=https://barbershopgentlemens13.com
```

4. **Run development:**

```bash
# Frontend
npm run dev

# Backend (in another terminal)
cd backend && node server.js
```

5. **Build for production:**

```bash
npm run build
```

---

## 📦 Deployment

1. Upload `dist/` folder to your web hosting
2. Upload `backend/server.js` and dependencies
3. Set up Node.js on server
4. Configure MongoDB Atlas whitelist
5. Run migration script (see `MIGRATION-WORK-HOURS.md`)

---

## 🔧 Customization

### Change Barber Work Hours

Update directly in MongoDB:

```javascript
db.barbers.updateOne(
  { name: "Иван Кръстев" },
  {
    $set: {
      workHours: {
        start: 10, // Start at 10:00
        end: 18, // End at 18:00
        wednesdayStart: 12, // Wednesday starts at 12:00
        lunchBreak: false, // No lunch break
      },
    },
  }
);
```

### Add New Services

Edit in MongoDB `services` collection or update via admin panel.

### Change Admin Password

Default: `berkovica123` (set in `src/pages/AdminPage.tsx` line 273)

---

## 📞 Support & Contact

**Client:** Gentlemen's Barbershop 13  
📍 ул. Поручик Неделчо Бончев 20, Берковица, България  
📱 Phone: +359 888 123 456  
✉️ Email: info@barbershopgentlemens13.com

**Development Agency:**  
🌐 [VigoDE.com](https://vigode.com) - Professional Web Development & Design

---

## 📄 License

© 2025 Gentlemen's Barbershop 13. All rights reserved.  
Developed by [VigoDE Web Agency](https://vigode.com)

---

## 🙏 Acknowledgments

Special thanks to the AI tools that helped accelerate development:

- **Bolt.new AI** - Rapid prototyping
- **ChatGPT** - Architecture planning
- **GitHub Copilot** - Code completion & optimization
