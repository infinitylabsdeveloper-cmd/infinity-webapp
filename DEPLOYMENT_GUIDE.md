# Production Deployment & Play Store PWA Guide (ఉత్పత్తి డిప్లాయ్‌మెంట్ & ప్లే స్టోర్ పీడబ్ల్యూఏ గైడ్)

This guide provides step-by-step instructions and configuration files to deploy your APPSC Group-2 MCQ Practice Portal as a production-grade web application with native **"Play Store-like" installation** on mobile and desktop devices.

---

## 📱 What is a PWA (Progressive Web App)?
Your app is fully configured as a PWA with:
- **`manifest.json`**: Defines app name, icons, standalone window mode, and theme color.
- **Service Worker (Workbox)**: Enables lightning-fast caching and offline access to MCQs, subtopics, and current affairs.
- **Install Prompt**: Allows users on Android, iOS, and PC to tap **"Install App"** and run it just like a native Play Store APK.

---

## 🚀 Option 1: Deploy to Vercel (Recommended & Easiest)
Vercel offers instant global CDN deployment and automatic HTTPS SSL certificates.

1. **Install Vercel CLI (Optional)**:
   ```bash
   npm i -g vercel
   ```
2. **Deploy**:
   - Push your code to GitHub.
   - Go to [vercel.com](https://vercel.com), click **New Project**, and import your repository.
   - Vercel will automatically detect Vite (`npm run build` -> `dist`).
   - Click **Deploy**. Your app will be live instantly with the `vercel.json` routing rules!

---

## 🔥 Option 2: Deploy to Firebase Hosting
Firebase Hosting provides robust, secure static and full-stack hosting backed by Google.

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```
2. **Login to Firebase**:
   ```bash
   firebase login
   ```
3. **Initialize & Deploy**:
   ```bash
   firebase init hosting
   ```
   - Select your existing Firebase project.
   - Set public directory to `dist`.
   - Configure as a single-page app (`y`).
   - Build your app: `npm run build`
   - Deploy:
     ```bash
     firebase deploy
     ```

---

## ☁️ Option 3: Deploy to Google Cloud Run (Full-Stack / Docker)
If you are running the Express backend along with Vite:

1. **Build and test locally**:
   ```bash
   npm run build
   npm start
   ```
2. **Deploy via Google Cloud Build & Cloud Run**:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/app
   gcloud run deploy app --image gcr.io/YOUR_PROJECT_ID/app --platform managed --region asia-southeast1 --allow-unauthenticated
   ```

---

## 📥 How Users Install the App (Play Store Experience)
Once deployed on HTTPS:
1. Open the website on an **Android phone** using Google Chrome.
2. Tap the browser menu (three dots `⋮` at the top right).
3. Select **"Install App"** or **"Add to Home screen"**.
4. An app icon will appear on the phone's home screen, launching the portal in a **clean standalone window** (just like an app downloaded from the Google Play Store)!
