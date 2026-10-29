# Supabase Migration Audit Report & Implementation Plan

A comprehensive, non-destructive migration strategy to transition the APPSC Group 2 MCQ Practice Portal (Web App, Admin Panel, and Android Kotlin app) from Firebase to Supabase as the primary backend platform.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Zero-Downtime Dual-Adapter Staging Policy**:
> As confirmed during clarification, Firebase services and credentials remain **fully active and untouched** while Supabase services are provisioned, schema-mapped, and verified. Firebase SDKs and rules will only be retired after full dual-write verification passes all tests.

### Confirmed Decisions

- **Supabase Credentials Strategy**: Supabase Project URL, Anon Public Key, and Service Role Key will be configured via server and client environment variables (`VITE_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_ANON_KEY`).
- **Authentication & Real OTP Provider**: Supabase Auth will be primary, leveraging Twilio / MSG91 SMS & WhatsApp providers configured in the Supabase Dashboard, while preserving our server-side Express fallback endpoint (`/api/otp/send`) for 100% OTP delivery reliability.
- **PostgreSQL Database Schema**: Complete relational schema created via Drizzle ORM / Supabase SQL with explicit foreign keys, indexing, and Row Level Security (RLS) policies.
- **Migration Sequence**: Dual-adapter staging mode where Supabase reads/writes run alongside existing `db.json` and Firebase adapters until complete feature parity is verified across Web, Admin, and Android clients.

---

## 1. Overview & Core Concept

This migration transitions all core backend services—**User Accounts, Authentication, Database Storage, Media/File Assets, and Admin Synchronizations**—from Firebase (Firestore / Auth) to Supabase (PostgreSQL / Supabase Auth / Supabase Storage).

### Migration Scope
1. **Web Portal & Admin Panel**: React + Vite frontend and Express (`server.ts`) backend proxy.
2. **Android Kotlin App**: Capacitor & native Android build configurations (`com.appscgroup2.mcq`).
3. **Data Preservation**: 100% preservation of learning content, subjects, units, topics, 5000+ MCQs, Current Affairs, user bookmarks, test attempts, subscription plans, and Razorpay payment records.

---

## 2. User Experience & Visual Design

- **Login Screen Experience**: Preserve the obsidian-themed mobile app login card with the luxury Indian landmark sliding carousel. The tab controls will offer **SMS OTP**, **WhatsApp OTP**, and **Email / Google** backed by `@supabase/supabase-js`.
- **Admin Panel Control**: Uninterrupted syllabus management, MCQ bulk updates, poster banner management, and subscription plan creation with real-time Supabase PostgreSQL broadcasts.
- **Practice Arena & Performance Board**: Instant latency for MCQ fetches, bookmark toggles, and test attempts using indexed PostgreSQL queries.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Full Relational PostgreSQL Schema over Document Wrappers
- **Chosen Approach**: Normalizing Firestore JSON collections into strict PostgreSQL tables (`users`, `apps`, `subjects`, `units`, `topics`, `subtopics`, `questions`, `current_affairs`, `mock_tests`, `bookmarks`, `purchases`).
- **Rationale**: Provides acid transactions, join efficiency, exact foreign key constraints, and standard Row Level Security (RLS).

### Decision 2: Server-Side Razorpay Order & Signature Security
- **Chosen Approach**: Keep Razorpay order creation (`POST /api/create-order`) and HMAC-SHA256 signature verification (`POST /api/verify-payment`) on the Express backend (`server.ts`).
- **Rationale**: Never exposes Razorpay Key Secret or Supabase Service Role Key to client-side code.

### Decision 3: Dual-Adapter Staging Period
- **Chosen Approach**: Initialize Supabase client alongside Firebase/local adapters (`db.json`).
- **Rationale**: Guarantees zero downtime or data loss during verification.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Web Portal / Mobile PWA / Android                     │
│  (React 19 + Vite + Tailwind CSS + Lucide Icons + Luxury Indian Scene Slider)│
└───────────────────────┬───────────────────────────────┬─────────────────────┘
                        │                               │
        Client Supabase │ Auth & Real-Time Sync         │ Express API Calls
        (@supabase/js)  │                               │ (/api/create-order)
                        ▼                               ▼
┌───────────────────────────────────────┐   ┌─────────────────────────────────┐
│        Supabase Cloud Backend         │   │       Node.js Express Server    │
│                                       │   │           (server.ts)           │
│  ┌─────────────────────────────────┐  │   │  ┌───────────────────────────┐  │
│  │ Supabase Auth (SMS/WA/Email/G)  │  │   │  │ Razorpay SDK Order/Verify │  │
│  └─────────────────────────────────┘  │   │  └───────────────────────────┘  │
│  ┌─────────────────────────────────┐  │   │  ┌───────────────────────────┐  │
│  │ PostgreSQL DB + RLS Policies    │  │   │  │ Supabase Admin Client     │  │
│  │ (Users, MCQs, Tests, Purchases) │  │   │  │ (Service Role Bypasses)   │  │
│  └─────────────────────────────────┘  │   │  └───────────────────────────┘  │
│  ┌─────────────────────────────────┐  │   └─────────────────────────────────┘
│  │ Supabase Storage (PDFs/Images)  │  │
│  └─────────────────────────────────┘  │
└───────────────────────────────────────┘
```

---

## 5. PostgreSQL Relational Schema Design

```sql
-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  uid TEXT UNIQUE NOT NULL,
  phone_number TEXT UNIQUE,
  email TEXT UNIQUE,
  display_name TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  title TEXT NOT NULL,
  title_telugu TEXT,
  icon TEXT,
  order_index INT DEFAULT 0
);

-- 3. Units Table
CREATE TABLE IF NOT EXISTS public.units (
  id TEXT PRIMARY KEY,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_telugu TEXT,
  order_index INT DEFAULT 0
);

-- 4. Topics Table
CREATE TABLE IF NOT EXISTS public.topics (
  id TEXT PRIMARY KEY,
  unit_id TEXT REFERENCES public.units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_telugu TEXT,
  order_index INT DEFAULT 0
);

-- 5. MCQs / Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE CASCADE,
  unit_id TEXT REFERENCES public.units(id) ON DELETE CASCADE,
  topic_id TEXT REFERENCES public.topics(id) ON DELETE CASCADE,
  subtopic TEXT DEFAULT 'General Practice',
  question TEXT NOT NULL,
  question_telugu TEXT,
  options JSONB NOT NULL,
  options_telugu JSONB,
  correct_option INT NOT NULL,
  explanation TEXT,
  explanation_telugu TEXT,
  difficulty TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Current Affairs Table
CREATE TABLE IF NOT EXISTS public.current_affairs (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  month TEXT NOT NULL,
  title TEXT NOT NULL,
  title_telugu TEXT,
  content TEXT NOT NULL,
  published_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Purchases & Subscriptions Table
CREATE TABLE IF NOT EXISTS public.purchases (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL,
  payment_id TEXT,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Speed
CREATE INDEX IF NOT EXISTS idx_questions_hierarchy ON public.questions(app_id, subject_id, unit_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_users_uid ON public.users(uid);
```

---

## 6. Affected Codebase Files & Migration Plan

| File | Purpose | Planned Change |
| :--- | :--- | :--- |
| `src/lib/supabase.ts` | **NEW** Supabase Client | Client-side `@supabase/supabase-js` initialization. |
| `src/lib/supabase-admin.ts` | **NEW** Supabase Admin Client | Server-side Service Role Client for Express API. |
| `src/services/supabaseService.ts` | **NEW** Data Access Service | PostgreSQL CRUD operations replacing Firestore queries. |
| `src/lib/firebase.ts` | Firebase Client Bridge | Wrapped into dual-adapter proxy during migration. |
| `src/lib/firebaseConfig.ts` | Firebase Config | Wrapped in fallback check. |
| `server.ts` | Express Backend Server | Updated to write purchases & user records to Supabase PostgreSQL. |
| `src/components/LoginScreen.tsx` | Auth UI | Updated to use Supabase Auth for SMS/WhatsApp/Google/Email. |
| `src/components/AdminPanel.tsx` | Content Management | Updated to publish MCQs and Current Affairs to Supabase. |
| `.env` & `.env.example` | Environment Variables | Adding `VITE_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_ANON_KEY`. |

---

## 7. Migration Risks & Mitigations

1. **Risk**: RLS permission errors blocking student MCQ reads.
   - **Mitigation**: Define public SELECT policies for `subjects`, `units`, `topics`, `questions`, and `current_affairs`.
2. **Risk**: User phone number format mismatches (+91 vs 10 digits).
   - **Mitigation**: Apply `sanitizeIndianPhoneNumber` utility consistently across client and server.
3. **Risk**: Razorpay payment signature verification delay.
   - **Mitigation**: Server processes payment verification synchronously and writes to Supabase with Service Role bypass.
