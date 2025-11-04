# cPanel Deployment Instructions

This guide explains how to deploy this Next.js static site to cPanel hosting.

## Prerequisites

- cPanel hosting account with File Manager access
- Node.js installed locally (for building)
- Firebase project with Firestore enabled

## Step 1: Configure Environment Variables

1. Copy `.env.example` to `.env` (if not already done)
2. Fill in your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Step 2: Build the Static Export

1. Install dependencies:
```bash
npm install
```

2. Generate the static build and compressed archive:
```bash
npm run export:zip
```

This command will:
- Remove any existing `out` directory
- Build the Next.js project with static export
- Create a `site.tar.gz` file in the project root containing all static files

## Step 3: Upload to cPanel

1. Log in to your cPanel account
2. Navigate to **File Manager**
3. Go to the `public_html` directory (or your domain's root directory)
4. **Delete all existing files** in the directory (or backup first)
5. Click **Upload** and select the `site.tar.gz` file from your project root
6. After upload completes, right-click on `site.tar.gz` and select **Extract**
7. Confirm extraction to current directory
8. Delete the `site.tar.gz` file after extraction

## Step 4: Verify .htaccess

The `.htaccess` file should be automatically included in the export. If not present, create it manually with this content:

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} !=on
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# SPA fallback for static export
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## Step 5: Test Your Site

1. Visit your domain in a browser
2. Test the booking form to ensure Firestore integration works
3. Check that all pages and assets load correctly

## Important Notes

### Firebase Setup Required

This site uses **client-side Firebase** for data persistence:
- All bookings are saved directly to Firestore from the browser
- No server-side API routes are used in production
- Ensure your Firebase project has proper security rules configured

### Firestore Security Rules

For production, set appropriate security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bookings/{booking} {
      // Allow anyone to create bookings
      allow create: if true;
      // Only authenticated users can read/update/delete
      allow read, update, delete: if request.auth != null;
    }
    match /services/{service} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /cities/{city} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Seed Data

The `/seed` page is included in the build but should be protected:
- Only use it once to initialize your Firestore database
- Consider removing it after initial setup or adding authentication

### Excluded Features

Since this is a static export, the following server-side features are not available:
- `/api/book` route (replaced with direct Firestore client calls)
- Server-side rendering (SSR)
- Incremental Static Regeneration (ISR)
- API routes

### Troubleshooting

**Problem:** Blank page or 404 errors
- **Solution:** Check that `.htaccess` is present and RewriteEngine is enabled in cPanel

**Problem:** Booking form doesn't work
- **Solution:** Verify Firebase environment variables and Firestore security rules

**Problem:** Images not loading
- **Solution:** Ensure `images.unoptimized = true` is set in `next.config.js`

**Problem:** Links result in 404
- **Solution:** Check that `trailingSlash: true` is set in `next.config.js`

## File Structure After Deployment

```
public_html/
├── .htaccess
├── index.html
├── 404.html
├── kontakt/
│   └── index.html
├── preise/
│   └── index.html
├── seed/
│   └── index.html
├── service/
│   └── [city]/
│       └── index.html
├── _next/
│   └── static/
└── favicon.ico
```

## Rebuilding and Redeploying

Whenever you make changes:

1. Update your local code
2. Run `npm run export:zip`
3. Upload the new `site.zip` to cPanel
4. Extract and overwrite existing files

---

**Need Help?** Check the main README.md or Firebase documentation for more details.
