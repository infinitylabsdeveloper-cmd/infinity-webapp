/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AppConfig {
  id: string;
  name: string;
  examCategory?: string; // e.g., 'State PSC', 'Police', 'Railway', 'SSC', 'Teaching', 'Forest', 'Central'
  mediums?: string[]; // e.g., ['EM', 'TM', 'HM', 'UM']
  packageId?: string;
  packageName?: string;
  tenantId?: string;
  isActive?: boolean;
  jurisdiction?: string; // optional app metadata
  countryId?: string; // optional metadata
  countryName?: string; // optional metadata
  stateId?: string; // optional metadata
  stateName?: string; // optional metadata
  locale: string; // e.g., 'en', 'hi'
  themeColor: string; // Tailwind color class
  accentColor: string; // Hex color
  currency?: string; // e.g., 'INR'
  currencySymbol?: string; // e.g., '₹'
  bannerImage: string;
  syllabus: Subject[];
}

export interface Subject {
  id: string;
  name: string;
  icon: string; // Lucide icon identifier
  imageUrl?: string; // Premium background image URL
  color?: string; // Custom color gradient/theme for the card
  category?: 'prelims' | 'mains' | 'both'; // Prelims, Mains, or Both
  units: Unit[];
}

export interface Unit {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  topics: Topic[];
}

export interface TopicTheoryTable {
  title?: string;
  headers: string[];
  rows: string[][];
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  subtopics: string[]; // List of subtopics
  subtopicImages?: Record<string, string>; // Optional background images for subtopics (subtopic name -> image URL)
  // Theory & Practice Configuration (Admin controllable per topic)
  hasTheory?: boolean; // Enable Theory / Study Material
  hasPractice?: boolean; // Enable Practice MCQs (defaults to true)
  theoryContent?: string; // Rich text / markdown formatted theory notes
  theoryTitle?: string;
  theorySummary?: string;
  theoryTables?: TopicTheoryTable[]; // Structured tables for comparisons, articles, timelines
  keyTakeaways?: string[]; // Quick bullet memory hooks
}

export interface Question {
  id: string;
  appId: string;
  subjectId: string;
  category?: 'prelims' | 'mains' | 'both'; // Prelims, Mains, or Both category
  unitId: string;
  topicId: string;
  subtopic: string; // We view questions filtered by subtopic
  subtopicId?: string; // Optional unique subtopic identifier
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  setName?: string; // Optional name for the set this MCQ belongs to
  imageUrl?: string; // Optional image or diagram for question
  importBatchId?: string;
  importFileName?: string;
  language?: string; // e.g. "en", "hi", "bn", "ta", "te", "ur"
}

export interface ImportBatch {
  id: string;
  fileName: string;
  date: string;
  count: number;
  appId: string;
}

export interface CurrentAffairsItem {
  id: string;
  appIds: string[]; // Multi-app targeting, e.g. ['andhra-pradesh-appsc-group-2-en', 'all']
  language: string; // e.g. "en", "te", "hi", "ur"
  category: 'state' | 'national' | 'international' | 'education_jobs' | string;
  stateId?: string; // e.g., 'andhra-pradesh', 'telangana', 'national'
  stateName?: string; // e.g. "Andhra Pradesh", "Telangana"
  month: string; // e.g. "October 2026"
  title: string;
  summary: string;
  content: string; // Detailed content
  imageUrl?: string;
  sourceName?: string; // e.g., "PIB India", "AP Govt Portal", "The Hindu"
  sourceUrl?: string; // Link to full original article
  isBreaking?: boolean; // Breaking news banner flag
  isPinned?: boolean; // Pinned story
  examRelevance?: string; // Why it matters for APPSC/UPSC/Group-2 exams
  keyFacts?: string[]; // Quick bullet facts for revision
  publishedDate: string; // Display date & time
  startDate: string; // Scheduling
  endDate?: string; // Optional expiry
  status: 'draft' | 'scheduled' | 'published' | 'expired' | 'disabled';
  createdAt?: string;
}

export interface NewsSourceConfig {
  id: string;
  name: string;
  feedUrl: string;
  category: 'state' | 'national' | 'international' | 'education_jobs';
  stateId?: string;
  enabled: boolean;
  lastFetched?: string;
}

export interface NewsEngineSettings {
  autoRefreshIntervalMinutes: number;
  enableAutoFetch: boolean;
  sources: NewsSourceConfig[];
  defaultLanguage: string;
}

export interface Poster {
  id: string;
  appIds: string[]; // Multi-app targeting
  title: string;
  description?: string;
  imageUrl: string;
  actionUrl?: string;
  ctaText?: string;
  targetType?: 'prelims' | 'mains' | 'subject' | 'current-affairs' | 'subscription' | 'mock-tests' | 'bookmarks' | 'url';
  targetSubjectId?: string;
  position: 'home-banner' | 'home-carousel' | 'sidebar';
  startDate: string;
  endDate: string;
  status: 'draft' | 'scheduled' | 'active' | 'expired' | 'disabled';
  badge?: string;
  subtitle?: string;
}

export interface SubscriptionPackage {
  id: string;
  appId: string; // App-specific plans
  name: string;
  price: number; 
  originalPrice?: number;
  savings?: number;
  effectiveMonthly?: number;
  duration?: string;
  currency?: string; // e.g. 'INR', 'USD', 'EUR', 'GBP'
  currencySymbol: string;
  billingCycle: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'lifetime' | 'custom' | '24 Hours';
  durationDays?: number; // For custom duration
  features: string[];
  isPopular?: boolean;
  startDate: string;
  endDate?: string;
  status: 'draft' | 'scheduled' | 'active' | 'expired' | 'disabled';
  trialPeriodDays?: number;
  introductoryPrice?: number;
}

export interface CouponCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  expiryDate: string;
  appIds: string[]; // Multi-app targeting, or ["all"]
  eligiblePlans?: string[]; // Optional specific plan IDs
  maxTotalRedemptions: number;
  redemptionCount: number;
  perUserLimit: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  status: 'active' | 'scheduled' | 'expired' | 'disabled' | 'exhausted';
}

export interface NotificationItem {
  id: string;
  appIds: string[]; // Multi-app targeting
  title: string;
  message: string;
  date: string;
  type?: 'purchase' | 'renewal' | 'expiry' | 'failed' | 'offer' | 'coupon' | 'info';
  read?: boolean;
}

export interface PaymentHistoryItem {
  id: string;
  date: string;
  amount: number;
  currencySymbol: string;
  status: 'success' | 'failed' | 'pending';
  method: string; // e.g. "Google Play", "Card", "UPI"
  invoiceUrl?: string;
  orderId?: string;
  transactionId?: string;
  expiryDate?: string;
}

export interface SubscriptionHistoryItem {
  id: string;
  planName: string;
  date: string;
  type: 'purchase' | 'renewal' | 'upgrade' | 'downgrade' | 'cancellation' | 'trial';
  status: 'active' | 'expired' | 'cancelled';
  expiryDate: string;
  amount?: number;
}

export interface SubscriptionPurchase {
  id: string;
  transactionId: string;
  orderId: string;
  appId: string;
  appName: string;
  countryId: string;
  countryName: string;
  packageName: string;
  planStatus: 'active' | 'expired' | 'cancelled';
  amount: number;
  currencySymbol: string;
  userName: string;
  email: string;
  mobile: string;
  date: string;
  platform: 'Android' | 'iOS' | 'Web';
  paymentStatus: 'success' | 'failed' | 'refunded' | 'pending';
  method: string;
  gstAmount?: number;
  couponUsed?: string;
  refundAmount?: number;
  expiryDate?: string;
}

// 1. Users Model
export interface UserAccount {
  id: string;
  name: string;
  mobile: string;
  email: string;
  createdAt: string;
  isPremium?: boolean;
  subscriptionExpiresAt?: string | null;
  trialUsed?: boolean;
  planId?: string | null;
  activePlanName?: string | null;
}

// 2. Orders Model
export interface OrderRecord {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  planId: string;
  planName?: string;
  razorpayOrderId: string;
  amount: number; // In rupees
  amountPaise: number; // In paise for Razorpay
  currency: string;
  status: 'created' | 'attempted' | 'paid' | 'failed';
  createdAt: string;
  notes?: Record<string, string>;
}

// 3. Payments Model
export interface PaymentRecord {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  orderId: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: 'captured' | 'failed' | 'refunded' | 'authorized';
  paymentMethod: string; // 'upi', 'card', 'netbanking', 'wallet'
  createdAt: string;
  errorDescription?: string;
}

// 4. Subscriptions Model
export interface SubscriptionRecord {
  id: string;
  userId: string;
  userEmail?: string;
  planId: string;
  planName: string;
  startDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'cancelled';
  source: 'razorpay' | 'trial' | 'admin' | 'gplay' | 'apple';
  amount: number;
  currency: string;
  orderId?: string;
  paymentId?: string;
  createdAt: string;
}

// 5. Trials Model
export interface TrialRecord {
  id: string;
  userId: string;
  userEmail?: string;
  userPhone?: string;
  startDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'converted';
  used: boolean;
  createdAt: string;
}

// 6. PaymentEvents Model (Webhook Idempotency)
export interface PaymentEventRecord {
  id: string;
  eventId: string;
  eventType: string;
  payload: any;
  processed: boolean;
  createdAt: string;
}

// 7. Admin Payment & Subscription Analytics
export interface AdminPaymentMetrics {
  totalUsers: number;
  premiumUsers: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  trialUsers: number;
  trialConversions: number;
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  refunds: number;
  totalRevenue: number;
  planWiseSales: {
    m1: { count: number; revenue: number };
    m3: { count: number; revenue: number };
    m6: { count: number; revenue: number };
    m12: { count: number; revenue: number };
  };
  dailyRevenue: Array<{ date: string; amount: number; count: number }>;
  monthlyRevenue: Array<{ month: string; amount: number; count: number }>;
  yearlyRevenue: Array<{ year: string; amount: number; count: number }>;
  plans: SubscriptionPackage[];
  recentPayments: PaymentRecord[];
  activeSubscriptionsList: SubscriptionRecord[];
}

export interface MockTestSubjectConfig {
  subjectId: string;
  subjectName?: string;
  unitIds?: string[];
  topicIds?: string[];
  questionCount: number;
}

export interface MockTestCaConfig {
  months: string[]; // e.g., ["August 2026", "July 2026"]
  questionCountPerMonth?: Record<string, number>;
  totalCaQuestions: number;
}

export interface MockTestSectionConfig {
  id: string;
  sectionName: string;
  subjectId?: string;
  unitId?: string;
  topicId?: string;
  questionCount: number;
}

export interface MockTestConfig {
  testType: 'full_length' | 'unit_wise' | 'subject_wise' | 'topic_wise' | 'practice' | 'previous_papers' | 'current_affairs' | 'custom_mixed' | 'custom';
  stage?: 'prelims' | 'mains' | 'both';
  subjects?: MockTestSubjectConfig[];
  sections?: MockTestSectionConfig[];
  caConfig?: MockTestCaConfig;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  language?: string;
  questionCount: number;
  durationMinutes: number;
  totalMarks: number;
  positiveMarks: number;
  negativeMarks: number;
}

export interface MockTest {
  id: string;
  title: string;
  description?: string;
  appId: string;
  appName?: string;
  creatorType: 'system' | 'admin' | 'user';
  creatorUserId?: string;
  creatorUserName?: string;
  status: 'draft' | 'published' | 'unpublished' | 'archived' | 'disabled';
  config: MockTestConfig;
  questionIds: string[];
  questions?: Question[]; // Embedded/frozen snapshot of selected questions
  questionsCount: number;
  durationMinutes: number;
  totalMarks: number;
  positiveMarks: number;
  negativeMarks: number;
  isOfficial?: boolean;
  scheduledPublishDate?: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt?: string;
  attemptsCount?: number;
  avgScore?: number;
}

export interface MockTestAttempt {
  id: string;
  mockTestId: string;
  mockTestTitle: string;
  appId: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  status: 'in_progress' | 'completed' | 'submitted' | 'abandoned';
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  questionTimings?: Record<string, number>;
  timeSpentSeconds: number;
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  score: number;
  accuracyPercentage: number;
  maxMarks: number;
  percentage: number;
  positiveMarksAwarded: number;
  negativeMarksDeducted: number;
  startedAt: string;
  completedAt?: string;
  passed?: boolean;
}

export interface BookmarkItem {
  id: string; // `${userId}_${itemType}_${itemId}`
  userId: string;
  appId: string;
  itemType: 'mcq' | 'current_affairs';
  itemId: string; // questionId or caId
  question?: Question;
  currentAffairs?: CurrentAffairsItem;
  subjectId?: string;
  subjectName?: string;
  unitId?: string;
  unitName?: string;
  topicId?: string;
  topicName?: string;
  month?: string; // e.g., "August 2026"
  category?: string;
  notes?: string;
  createdAt: string;
}

export interface AppState {
  apps: AppConfig[];
  questions: Question[];
  currentAffairs: CurrentAffairsItem[];
  posters: Poster[];
  subscriptions: SubscriptionPackage[];
  coupons: CouponCode[];
  notifications?: NotificationItem[];
  purchases?: SubscriptionPurchase[];
  paymentHistory?: PaymentHistoryItem[];
  subscriptionHistory?: SubscriptionHistoryItem[];
  importBatches?: ImportBatch[];
  users?: UserAccount[];
  orders?: OrderRecord[];
  payments?: PaymentRecord[];
  subscriptionsRecords?: SubscriptionRecord[];
  trials?: TrialRecord[];
  paymentEvents?: PaymentEventRecord[];
  auditLogs?: AuditLog[];
  mockTests?: MockTest[];
  mockTestAttempts?: MockTestAttempt[];
  bookmarks?: BookmarkItem[];
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  action: string; // e.g. "CREATE_POSTER", "DELETE_MCQ", "PUBLISH_MOCK_TEST"
  targetId: string;
  targetType: 'poster' | 'coupon' | 'ca' | 'subscription' | 'mcq' | 'app' | 'notification' | 'mock_test';
  timestamp: string;
  details?: string;
}

