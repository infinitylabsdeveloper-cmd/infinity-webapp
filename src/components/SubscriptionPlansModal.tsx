import React, { useState, useEffect, useMemo } from 'react';
import { SubscriptionPackage, AppConfig, CouponCode } from '../types';
import { 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Headphones, 
  Layers, 
  FileText, 
  GraduationCap, 
  TrendingUp, 
  Newspaper, 
  FileDown, 
  Video, 
  Flame, 
  Target, 
  Sprout, 
  Crown, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  ExternalLink, 
  ArrowRight,
  Sparkles,
  BarChart2,
  MapPin,
  Pause,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SupportCenterModal from './SupportCenterModal';

interface SubscriptionPlansModalProps {
  activeApp: AppConfig;
  subscriptions: SubscriptionPackage[];
  coupons: CouponCode[];
  onClose: () => void;
  onSelectPackage: (pkg: SubscriptionPackage) => void;
  onPaymentSuccess?: () => void;
}

// Iconic Andhra Pradesh Heritage & Scenic Landscape Imagery
const AP_LANDMARKS = [
  {
    id: 'amaravati',
    name: 'Amaravati Dhyana Buddha',
    district: 'Guntur / Krishna River',
    tagline: 'Capital Heritage of Wisdom & Enlightenment',
    imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=2400&q=85',
    accentColor: '#10B981',
  },
  {
    id: 'vizag-coast',
    name: 'Visakhapatnam (Vizag) Rishikonda',
    district: 'City of Destiny, Bay of Bengal',
    tagline: 'Coastal Pride & Blue Economy Gateway',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=85',
    accentColor: '#0EA5E9',
  },
  {
    id: 'godavari-bridge',
    name: 'Historic Godavari Arch Bridge',
    district: 'Rajahmundry, East Godavari',
    tagline: 'Lifeline of Andhra Culture & Majestic River Godavari',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=2400&q=85',
    accentColor: '#F59E0B',
  },
  {
    id: 'araku-valley',
    name: 'Araku Valley & Eastern Ghats',
    district: 'Alluri Sitharama Raju District',
    tagline: 'Emerald Mist Hills, Coffee Plantations & Waterfalls',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2400&q=85',
    accentColor: '#059669',
  },
  {
    id: 'gandikota-canyon',
    name: 'Gandikota Grand Canyon & Fort',
    district: 'Kadapa District, Penna River',
    tagline: 'Historic Architectural Splendor of Andhra Pradesh',
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2400&q=85',
    accentColor: '#E11D48',
  },
  {
    id: 'lepakshi-heritage',
    name: 'Lepakshi Temple Architecture',
    district: 'Sri Sathya Sai District',
    tagline: 'Timeless Sculpture, Monolithic Nandi & Frescoes',
    imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=2400&q=85',
    accentColor: '#D97706',
  },
];

// Payment brand logos (UPI, GPay, PhonePe, Paytm)
function UpiLogo({ className = "h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 28L20 4H12L4 28H12Z" fill="#097939" />
      <path d="M22 28L30 4H22L14 28H22Z" fill="#ED752E" />
      <text x="35" y="24" fontFamily="sans-serif" fontSize="22" fontWeight="900" fill="#2E3192" letterSpacing="0.5">UPI</text>
    </svg>
  );
}

function GPayLogo({ className = "h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 74 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.2 11.8v4.4h-6.8v-4.4h6.8zm-6.8-6.9h6.8v4.4h-6.8V4.9zm0 13.7h6.8v4.4h-6.8v-4.4z" fill="#4285F4" opacity="0" />
      <path d="M13.6 13.9c0-.7-.1-1.3-.2-1.9H7.1v3.6h3.7c-.2.9-.7 1.7-1.4 2.2v1.8h2.3c1.3-1.2 2.1-3.1 2.1-5.7z" fill="#4285F4" />
      <path d="M7.1 20.5c1.9 0 3.5-.6 4.7-1.7l-2.3-1.8c-.6.4-1.4.7-2.4.7-1.8 0-3.4-1.2-4-2.9H.7v1.9c1.2 2.3 3.7 3.8 6.4 3.8z" fill="#34A853" />
      <path d="M3.1 14.8c-.1-.5-.2-1-.2-1.6 0-.6.1-1.1.2-1.6V9.7H.7C.3 10.6 0 11.6 0 13.2s.3 2.6.7 3.5l2.4-1.9z" fill="#FBBC05" />
      <path d="M7.1 5.9c1 0 2 .4 2.7 1.1l2-2C10.6 3.9 9 3.2 7.1 3.2 4.4 3.2 1.9 4.7.7 7l2.4 1.9c.6-1.7 2.2-3 4-3z" fill="#EA4335" />
      <text x="18" y="19" fontFamily="sans-serif" fontSize="16" fontWeight="700" fill="#5F6368">Pay</text>
    </svg>
  );
}

function PhonePeLogo({ className = "h-5" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="h-6 w-6 rounded-full bg-[#5f259f] flex items-center justify-center text-white font-black text-xs shadow-xs">
        पे
      </div>
      <span className="font-extrabold text-[#5f259f] dark:text-purple-300 text-sm tracking-tight">PhonePe</span>
    </div>
  );
}

function PaytmLogo({ className = "h-5" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <span className="font-black text-[#002e6e] dark:text-sky-400 text-sm tracking-tighter">pay</span>
      <span className="font-black text-[#00baf2] text-sm tracking-tighter">tm</span>
    </div>
  );
}

// 3D Gift Box SVG Icon
function GiftBox3D({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="24" width="48" height="34" rx="4" fill="url(#giftBoxGradModalFull)" />
      <rect x="6" y="16" width="52" height="10" rx="2" fill="#FF5E3A" />
      <rect x="28" y="16" width="8" height="42" fill="#FFDF00" />
      <path d="M28 16C28 16 26 6 18 6C12 6 12 12 16 15C20 18 28 16 28 16Z" fill="#FFE144" stroke="#D99B00" strokeWidth="1.5" />
      <path d="M36 16C36 16 38 6 46 6C52 6 52 12 48 15C44 18 36 16 36 16Z" fill="#FFE144" stroke="#D99B00" strokeWidth="1.5" />
      <defs>
        <linearGradient id="giftBoxGradModalFull" x1="8" y1="24" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF334B" />
          <stop offset="1" stopColor="#B3001F" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function SubscriptionPlansModal({
  activeApp,
  subscriptions,
  coupons,
  onClose,
  onSelectPackage,
  onPaymentSuccess,
}: SubscriptionPlansModalProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Full-Screen Automatic Background Slideshow State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAutoSlidePaused, setIsAutoSlidePaused] = useState(false);

  useEffect(() => {
    if (isAutoSlidePaused) return;

    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % AP_LANDMARKS.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isAutoSlidePaused]);

  const activeLandmark = AP_LANDMARKS[currentSlideIndex];

  // Default curated plans fallback (preserving ₹99 Offline Subscription + all existing plans across all apps)
  const fallbackPackages: SubscriptionPackage[] = useMemo(() => {
    const targetAppId = activeApp?.id || 'andhra-pradesh-appsc-group-2-en';
    const appTitle = activeApp?.name || 'Exam Preparation';
    return [
      {
        id: 'sub-offline-99',
        appId: targetAppId,
        name: 'Offline Practice Pack',
        description: `Offline MCQ Practice & Rapid Revision Pack for ${appTitle}`,
        price: 99,
        originalPrice: 299,
        currencySymbol: '₹',
        billingCycle: 'quarterly',
        duration: '90 Days',
        features: [
          'Offline Practice Sets & Saved Bookmarks',
          'Downloadable Revision Notes & PDFs',
          'Topic-Wise High-Yield MCQ Banks',
          'Detailed Answers & Explanations',
          'Ad-Free Offline Study Mode'
        ],
        status: 'active',
        startDate: '2026-01-01',
        isPopular: false
      },
      {
        id: 'sub-1',
        appId: targetAppId,
        name: '1 Month Starter',
        description: 'Quick Revision & Prelims Booster Pack',
        price: 199,
        originalPrice: 499,
        currencySymbol: '₹',
        billingCycle: 'monthly',
        duration: '30 Days',
        features: [
          'Full Access to All Subjects',
          '15,000+ Practice MCQs',
          'Detailed Step-by-Step Explanations',
          'Subject-Wise Performance Analytics',
          'Daily Current Affairs Updates'
        ],
        status: 'active',
        startDate: '2026-01-01',
        isPopular: false
      },
      {
        id: 'sub-2',
        appId: targetAppId,
        name: '3 Months Pro',
        description: 'Complete Prelims + Mains Foundation',
        price: 499,
        originalPrice: 1299,
        currencySymbol: '₹',
        billingCycle: 'quarterly',
        duration: '90 Days',
        features: [
          'Full Access to All Prelims & Mains Subjects',
          'Unlimited Topic-Wise & Set-Wise Practice',
          'Previous Year Question Papers (PYQs)',
          'Full-Length Mock Test Series',
          'Monthly Current Affairs PDF Compendiums'
        ],
        status: 'active',
        startDate: '2026-01-01',
        isPopular: true
      },
      {
        id: 'sub-3',
        appId: targetAppId,
        name: '6 Months Target',
        description: 'Dedicated Ranker Preparation Package',
        price: 799,
        originalPrice: 1999,
        currencySymbol: '₹',
        billingCycle: 'half-yearly',
        duration: '180 Days',
        features: [
          'Complete Syllabus Coverage (Prelims + Mains)',
          'All Mock Tests & Grand Test Series',
          '100% Ad-Free Uninterrupted Learning',
          'Priority Doubt Resolution & Mentor Notes',
          'Detailed Rank & Percentile Analytics'
        ],
        status: 'active',
        startDate: '2026-01-01',
        isPopular: false
      },
      {
        id: 'sub-4',
        appId: targetAppId,
        name: '12 Months Ultimate',
        description: '1-Year All-Access Pass with Selection Guarantee Tools',
        price: 999,
        originalPrice: 2999,
        currencySymbol: '₹',
        billingCycle: 'yearly',
        duration: '365 Days',
        features: [
          '1 Full Year Unlimited Access to All Modules',
          'All Prelims + Mains + Mock Tests Unlocked',
          'Downloadable Revision PDFs & Economic Survey',
          '100% Ad-Free + Offline Bookmark Sync',
          '1-on-1 Strategy & Priority Support'
        ],
        status: 'active',
        startDate: '2026-01-01',
        isPopular: true
      }
    ];
  }, [activeApp?.id, activeApp?.name]);

  // Real subscription plans received from database / props, merged with ₹99 Offline Pack & fallbacks
  const displayPlans = useMemo(() => {
    const activeAppId = activeApp?.id;
    const relevantProps = (subscriptions || []).filter(
      (pkg) =>
        pkg &&
        pkg.status !== 'disabled' &&
        pkg.id !== 'sub-24h' &&
        (!pkg.appId || pkg.appId === 'all' || pkg.appId === activeAppId || pkg.appId === 'andhra-pradesh-appsc-group-2-en')
    );

    const baseList = relevantProps.length > 0 ? [...relevantProps] : [...fallbackPackages];

    // Ensure ₹99 Offline Practice Pack is always preserved and available
    if (!baseList.some((p) => p.id === 'sub-offline-99' || p.price === 99)) {
      baseList.unshift(fallbackPackages[0]);
    }

    const LUXURY_PLAN_PALETTES = [
      {
        name: 'Sapphire Sky',
        hex: '#DCEBFF',
        cardBgClass: 'bg-gradient-to-b from-[#F4F9FF] via-[#DCEBFF] to-[#DCEBFF]',
        borderClass: 'border-sky-300 hover:border-sky-500',
        iconBoxClass: 'bg-sky-600 text-white border-sky-400/50 shadow-md shadow-sky-500/20',
        subtitleClass: 'text-sky-800',
        priceBoxClass: 'bg-white/90 border-sky-200',
        badgeBgClass: 'bg-sky-100 text-[#1E1B4B] border border-sky-300',
        checkIconClass: 'bg-sky-600 text-white',
        buttonBgClass: 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:brightness-105 text-white shadow-lg',
      },
      {
        name: 'Emerald Mint',
        hex: '#D9FBE8',
        cardBgClass: 'bg-gradient-to-b from-[#F2FEF7] via-[#D9FBE8] to-[#D9FBE8]',
        borderClass: 'border-emerald-300 hover:border-emerald-500',
        iconBoxClass: 'bg-emerald-600 text-white border-emerald-400/50 shadow-md shadow-emerald-500/20',
        subtitleClass: 'text-emerald-800',
        priceBoxClass: 'bg-white/90 border-emerald-200',
        badgeBgClass: 'bg-emerald-100 text-[#1E1B4B] border border-emerald-300',
        checkIconClass: 'bg-emerald-600 text-white',
        buttonBgClass: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:brightness-105 text-white shadow-lg',
      },
      {
        name: 'Premium Lavender',
        hex: '#EDE7FF',
        cardBgClass: 'bg-gradient-to-b from-[#F8F5FF] via-[#EDE7FF] to-[#EDE7FF]',
        borderClass: 'border-violet-300 hover:border-violet-500',
        iconBoxClass: 'bg-violet-600 text-white border-violet-400/50 shadow-md shadow-violet-500/20',
        subtitleClass: 'text-violet-800',
        priceBoxClass: 'bg-white/90 border-violet-200',
        badgeBgClass: 'bg-violet-100 text-[#1E1B4B] border border-violet-300',
        checkIconClass: 'bg-violet-600 text-white',
        buttonBgClass: 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:brightness-105 text-white shadow-lg',
      },
      {
        name: 'Luxury Rose Pink',
        hex: '#FFE0EA',
        cardBgClass: 'bg-gradient-to-b from-[#FFF5F8] via-[#FFE0EA] to-[#FFE0EA]',
        borderClass: 'border-pink-300 hover:border-rose-500',
        iconBoxClass: 'bg-rose-600 text-white border-rose-400/50 shadow-md shadow-rose-500/20',
        subtitleClass: 'text-rose-800',
        priceBoxClass: 'bg-white/90 border-pink-200',
        badgeBgClass: 'bg-pink-100 text-[#1E1B4B] border border-pink-300',
        checkIconClass: 'bg-rose-600 text-white',
        buttonBgClass: 'bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 hover:brightness-105 text-white shadow-lg',
      },
      {
        name: 'Royal Champagne',
        hex: '#FFF1CC',
        cardBgClass: 'bg-gradient-to-b from-[#FFFCF0] via-[#FFF1CC] to-[#FFF1CC]',
        borderClass: 'border-amber-400 hover:border-amber-500',
        iconBoxClass: 'bg-amber-600 text-white border-amber-400/50 shadow-md shadow-amber-500/20',
        subtitleClass: 'text-amber-900',
        priceBoxClass: 'bg-white/90 border-amber-300',
        badgeBgClass: 'bg-amber-100 text-[#1E1B4B] border border-amber-400',
        checkIconClass: 'bg-amber-600 text-white',
        buttonBgClass: 'bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:brightness-105 text-white shadow-xl',
      },
      {
        name: 'Soft Aqua Teal',
        hex: '#D8F7F5',
        cardBgClass: 'bg-gradient-to-b from-[#F2FCFB] via-[#D8F7F5] to-[#D8F7F5]',
        borderClass: 'border-teal-300 hover:border-teal-500',
        iconBoxClass: 'bg-teal-600 text-white border-teal-400/50 shadow-md shadow-teal-500/20',
        subtitleClass: 'text-teal-800',
        priceBoxClass: 'bg-white/90 border-teal-200',
        badgeBgClass: 'bg-teal-100 text-[#1E1B4B] border border-teal-300',
        checkIconClass: 'bg-teal-600 text-white',
        buttonBgClass: 'bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 hover:brightness-105 text-white shadow-lg',
      },
      {
        name: 'Peach Pearl',
        hex: '#FFE4D1',
        cardBgClass: 'bg-gradient-to-b from-[#FFF8F2] via-[#FFE4D1] to-[#FFE4D1]',
        borderClass: 'border-orange-300 hover:border-orange-500',
        iconBoxClass: 'bg-orange-600 text-white border-orange-400/50 shadow-md shadow-orange-500/20',
        subtitleClass: 'text-orange-900',
        priceBoxClass: 'bg-white/90 border-orange-200',
        badgeBgClass: 'bg-orange-100 text-[#1E1B4B] border border-orange-300',
        checkIconClass: 'bg-orange-600 text-white',
        buttonBgClass: 'bg-gradient-to-r from-orange-500 via-amber-600 to-orange-600 hover:brightness-105 text-white shadow-lg',
      },
      {
        name: 'Ivory Pearl',
        hex: '#FFF8E7',
        cardBgClass: 'bg-gradient-to-b from-[#FFFFFF] via-[#FFF8E7] to-[#FFF1CC]',
        borderClass: 'border-amber-300 hover:border-indigo-400',
        iconBoxClass: 'bg-indigo-600 text-white border-indigo-400/50 shadow-md shadow-indigo-500/20',
        subtitleClass: 'text-indigo-800',
        priceBoxClass: 'bg-white/95 border-amber-200',
        badgeBgClass: 'bg-indigo-50 text-[#1E1B4B] border border-indigo-200',
        checkIconClass: 'bg-indigo-600 text-white',
        buttonBgClass: 'bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 hover:brightness-105 text-white shadow-lg',
      },
    ];

    return baseList.map((pkg, idx) => {
      const iconTypes: Array<'sprout' | 'target' | 'flame' | 'crown'> = ['sprout', 'target', 'flame', 'crown'];
      const themeColors = ['blue', 'green', 'orange', 'red'];
      const iconType = iconTypes[idx % iconTypes.length];
      const themeColor = themeColors[idx % themeColors.length];
      const isBestValue = !!pkg.isPopular || idx === (baseList.length - 1);
      // Ensure Best Value plan gets Royal Champagne (#FFF1CC) while every other plan gets a distinct luxury palette
      const palette = isBestValue
        ? LUXURY_PLAN_PALETTES[4] // Royal Champagne (#FFF1CC)
        : LUXURY_PLAN_PALETTES[idx % LUXURY_PLAN_PALETTES.length];

      const isOffline99 = pkg.id === 'sub-offline-99' || pkg.price === 99;

      return {
        id: pkg.id,
        billingCycle: pkg.billingCycle || 'monthly',
        durationKey: pkg.duration ? pkg.duration : pkg.billingCycle || 'Package',
        title: pkg.name,
        subtitle: isOffline99 ? 'Offline & Revision Special' : pkg.isPopular ? 'Most Popular' : 'Premium Package',
        iconType,
        price: pkg.price,
        originalPrice: pkg.originalPrice || pkg.price,
        savingsText: pkg.originalPrice && pkg.originalPrice > pkg.price ? `Save ₹${pkg.originalPrice - pkg.price}` : 'Verified Plan',
        rateSubtext: `₹${pkg.price} / ${pkg.duration || pkg.billingCycle || 'cycle'}`,
        themeColor,
        palette,
        badgeBg: palette.badgeBgClass,
        buttonBg: palette.buttonBgClass,
        features: Array.isArray(pkg.features) && pkg.features.length > 0 ? pkg.features : [
          'Full Access to Exam Subjects',
          'Practice MCQs & Test Series',
          'Detailed Explanations',
          'Performance Analytics'
        ],
        isBestValue,
        rawPackage: {
          ...pkg,
          appId: activeApp?.id || pkg.appId || 'andhra-pradesh-appsc-group-2-en',
          currencySymbol: pkg.currencySymbol || '₹'
        }
      };
    });
  }, [subscriptions, fallbackPackages, activeApp?.id]);

  // Helper to map plan to SubscriptionPackage
  const handleChoosePlan = (plan: typeof displayPlans[0]) => {
    onSelectPackage(plan.rawPackage);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto font-sans flex flex-col justify-start items-center bg-[#FFF8E7] text-[#1E1B4B] min-h-screen"
      onMouseEnter={() => setIsAutoSlidePaused(true)}
      onMouseLeave={() => setIsAutoSlidePaused(false)}
    >
      {/* ======================================================== */}
      {/* 1. FULL-SCREEN BRIGHT DAYLIGHT SLIDESHOW BACKGROUND */}
      {/* ======================================================== */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLandmark.id}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={activeLandmark.imageUrl}
              alt={activeLandmark.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center opacity-25"
            />
          </motion.div>
        </AnimatePresence>

        {/* Bright Warm Ivory, Sky & Champagne Daylight Wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFF8E7]/90 via-[#DCEBFF]/75 to-[#FFF1CC]/90 backdrop-blur-[2px]" />
      </div>

      {/* ======================================================== */}
      {/* 2. TOP BRIGHT STICKY HEADER */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 w-full bg-[#FFF8E7]/95 backdrop-blur-xl border-b border-amber-300/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-[#1E1B4B] hover:bg-[#FFF1CC] transition-all cursor-pointer p-2 rounded-2xl bg-white border border-amber-300 shadow-2xs"
            aria-label="Back to App"
          >
            <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
          </button>

          <div className="text-left">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-[#1E1B4B] uppercase tracking-wider">
                {activeApp?.name || 'APPSC GROUP-2'}
              </h2>
              <span className="hidden sm:inline-block bg-[#FFF1CC] text-[#1E1B4B] border border-amber-400 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                Premium
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-emerald-800 font-bold">
              Prepare | Practice | Perform | Serve {activeApp?.stateName || 'State'}
            </p>
          </div>
        </div>

        {/* Landmark Pill & Help button */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-[#D9FBE8] border border-emerald-300 px-3.5 py-1.5 rounded-full text-xs text-[#1E1B4B] font-bold shadow-2xs">
            <MapPin className="h-3.5 w-3.5 text-emerald-700 animate-pulse" />
            <span>{activeLandmark.name}</span>
          </div>

          <button
            onClick={() => setIsHelpOpen(true)}
            className="flex items-center gap-1.5 text-[#1E1B4B] font-bold text-xs cursor-pointer px-3.5 py-2 rounded-2xl bg-white hover:bg-[#DCEBFF] border border-sky-300 transition-all shadow-2xs"
          >
            <Headphones className="h-4 w-4 text-sky-700" />
            <span>Need Help?</span>
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 3. MAIN FULL-WIDTH CONTAINER */}
      {/* ======================================================== */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 flex-1">
        {/* ======================================================== */}
        {/* HERO SECTION - BRIGHT DAYLIGHT STATE LANDMARK BANNER */}
        {/* ======================================================== */}
        <div className="relative rounded-3xl overflow-hidden shadow-lg border-2 border-amber-300 bg-gradient-to-r from-[#FFF1CC] via-[#FFF8E7] to-[#DCEBFF] text-[#1E1B4B] p-6 sm:p-10">
          {/* Daylight Landmark Image Accent on Right */}
          <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 opacity-25 pointer-events-none">
            <img
              src={activeLandmark.imageUrl}
              alt={activeLandmark.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#FFF8E7] via-[#FFF8E7]/70 to-transparent" />
          </div>

          {/* Top Bar inside Hero: Active Landmark Location Pill & Slide Controls */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1E1B4B]/10">
            <div className="flex items-center gap-2.5 bg-white/90 border border-amber-300 px-4 py-1.5 rounded-full text-xs text-[#1E1B4B] font-bold shadow-2xs">
              <MapPin className="h-4 w-4 text-amber-600 shrink-0" />
              <span className="font-extrabold">{activeLandmark.name}</span>
              <span className="text-slate-600 text-[11px] hidden sm:inline">• {activeLandmark.district}</span>
            </div>

            {/* Slide Navigation Dots & Arrows */}
            <div className="flex items-center gap-2 bg-white/90 border border-amber-300 px-2 py-1 rounded-full shadow-2xs">
              <button
                type="button"
                onClick={() => setCurrentSlideIndex((prev) => (prev - 1 + AP_LANDMARKS.length) % AP_LANDMARKS.length)}
                className="p-1 rounded-full hover:bg-amber-100 text-[#1E1B4B] transition-colors cursor-pointer"
                title="Previous Andhra Landmark"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1.5 px-1.5">
                {AP_LANDMARKS.map((landmark, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setCurrentSlideIndex(dotIdx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      dotIdx === currentSlideIndex 
                        ? 'w-6 bg-gradient-to-r from-amber-500 to-emerald-600 shadow-xs' 
                        : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                    title={landmark.name}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % AP_LANDMARKS.length)}
                className="p-1 rounded-full hover:bg-amber-100 text-[#1E1B4B] transition-colors cursor-pointer"
                title="Next Andhra Landmark"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Central Slogan and Aspirants Badge */}
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 pt-6">
            <div className="space-y-3 text-center md:text-left max-w-3xl">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <span className="font-serif italic text-amber-800 text-sm sm:text-lg font-bold tracking-wide">
                  Mana Rashtram Mana Badhyata
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-[#1E1B4B] uppercase leading-tight font-sans">
                A Brighter {activeApp?.stateName || 'State'} <br className="hidden sm:inline" />
                Begins with Better Learners
              </h1>

              <div className="space-y-1.5">
                {(activeApp?.locale === 'te' || activeApp?.id?.includes('-te') || (activeApp?.mediums && activeApp?.mediums.includes('Telugu'))) && (
                  <p className="text-lg sm:text-xl font-bold text-indigo-900">
                    “చదువుతోనే మంచి పాలన సాధ్యం”
                  </p>
                )}
                <p className="text-xs sm:text-sm font-black text-emerald-800 uppercase tracking-widest">
                  Prepare Today For A Stronger {activeApp?.stateName || 'State'}
                </p>
                <div className="h-1.5 w-36 bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-600 rounded-full mx-auto md:mx-0 mt-2 shadow-2xs" />
              </div>
            </div>

            {/* Right Side Aspirants Stat Badge */}
            <div className="shrink-0 flex flex-col items-center md:items-end gap-3">
              <div className="bg-[#D9FBE8] border-2 border-emerald-300 rounded-3xl p-4 sm:p-5 flex items-center gap-4 shadow-md">
                <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-sm">
                  <BarChart2 className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-[#1E1B4B] leading-tight">Join Thousands</p>
                  <p className="text-xs text-emerald-900 font-semibold leading-tight">of Aspirants Achieving Their Dreams</p>
                </div>
              </div>

              <span className="font-serif italic text-indigo-900 text-xs sm:text-sm font-bold tracking-wider">
                People • Progress • Prosperity
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 5. 24-HOUR ACCESS PASS HIGHLIGHT BANNER — Soft Aqua Teal (#D8F7F5) & Peach Pearl (#FFE4D1) */}
        {/* ======================================================== */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#D8F7F5] via-[#D9FBE8] to-[#FFE4D1] text-[#1E1B4B] p-4 sm:p-6 shadow-md border-2 border-teal-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white border border-teal-300 flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="h-7 w-7 text-amber-500" />
            </div>
            <div className="text-left">
              <h3 className="text-base sm:text-lg font-black text-[#1E1B4B] leading-tight flex flex-wrap items-center gap-2">
                <span>Need Instant Exam Practice? 24-Hour Pass @ ₹49!</span>
                <span className="bg-amber-400 text-[#1E1B4B] font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase border border-amber-500">
                  Instant
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 font-semibold mt-0.5">
                Full Premium Access to All Subjects, Sets & Explanations for 24 Hours.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const pass24: SubscriptionPackage = subscriptions.find(s => s.id === 'sub-24h' || s.price === 49) || {
                id: 'sub-24h',
                appId: activeApp.id,
                name: '24 Hours Access',
                price: 49,
                billingCycle: '24 Hours',
                currencySymbol: '₹',
                status: 'active',
                features: ['24 Hours Unlimited Practice', 'All Subjects Unlocked', 'Detailed Explanations'],
                startDate: new Date().toISOString()
              };
              onSelectPackage(pass24);
            }}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:brightness-105 text-white font-black text-xs sm:text-sm py-3.5 px-6 rounded-full shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 hover:scale-105 active:scale-95"
          >
            <span>GET 24-HOUR PASS FOR ₹49</span>
            <ChevronRight className="h-4 w-4 stroke-[3]" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* 6. LUXURY BRIGHT SUBSCRIPTION PLAN CARDS */}
        {/* ======================================================== */}
        <div className="space-y-8">
          {displayPlans.length === 0 ? (
            <div className="bg-[#FFF8E7] rounded-3xl p-10 sm:p-14 text-center border-2 border-amber-300 space-y-4 max-w-lg mx-auto my-6">
              <div className="h-16 w-16 rounded-2xl bg-[#FFF1CC] text-amber-700 flex items-center justify-center mx-auto text-3xl font-black border border-amber-400">
                💳
              </div>
              <div className="space-y-1.5">
                <h4 className="text-lg font-black text-[#1E1B4B]">No Subscription Plans Available</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  No subscription packages have been configured yet. Packages configured by the administrator in the Admin Panel will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 sm:gap-6 items-stretch">
              {displayPlans.map((plan) => {
                const pal = plan.palette;
                return (
                  <div
                    key={plan.id}
                    style={{ backgroundColor: pal.hex }}
                    className={`rounded-3xl p-6 flex flex-col justify-between transition-all relative ${pal.cardBgClass} ${
                      plan.isBestValue
                        ? 'border-2 border-amber-500 shadow-xl ring-4 ring-amber-400/35 -translate-y-1'
                        : `border-2 ${pal.borderClass} shadow-md hover:shadow-xl hover:-translate-y-1`
                    }`}
                  >
                    {/* Best Value Top Crown Badge */}
                    {plan.isBestValue && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white border-2 border-white font-black text-[11px] px-4 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1.5 z-10 whitespace-nowrap">
                        <Crown className="h-3.5 w-3.5 text-amber-200 fill-amber-200" />
                        <span>BEST VALUE</span>
                      </div>
                    )}

                    <div className="space-y-5">
                      {/* Card Header & Icon */}
                      <div className="flex items-center gap-3 pt-1">
                        <div
                          className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black shrink-0 border ${pal.iconBoxClass}`}
                        >
                          {plan.iconType === 'sprout' && <Sprout className="h-6 w-6" />}
                          {plan.iconType === 'target' && <Target className="h-6 w-6" />}
                          {plan.iconType === 'flame' && <Flame className="h-6 w-6" />}
                          {plan.iconType === 'crown' && <Crown className="h-6 w-6" />}
                        </div>

                        <div>
                          <h4 className="text-lg font-black text-[#1E1B4B] leading-tight">
                            {plan.title}
                          </h4>
                          <p className={`text-xs font-black tracking-wide ${pal.subtitleClass}`}>
                            {plan.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Price & Validity Box */}
                      <div className={`text-center py-3 space-y-1.5 rounded-2xl p-3 border shadow-2xs ${pal.priceBoxClass}`}>
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-3xl sm:text-4xl font-black text-[#1E1B4B] tracking-tight">
                            ₹{plan.price}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-600">
                          {plan.rateSubtext}
                        </p>

                        {/* Savings Pill */}
                        <div className="pt-1.5 flex flex-col items-center gap-1">
                          <span
                            className={`text-[11px] font-black px-3.5 py-1 rounded-full ${plan.badgeBg}`}
                          >
                            {plan.savingsText}
                          </span>
                          {plan.originalPrice > plan.price && (
                            <span className="text-xs text-rose-600 font-bold line-through">
                              ₹{plan.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Feature Checklist */}
                      <ul className="space-y-3 pt-2 text-xs">
                        {plan.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2.5">
                            <div
                              className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${pal.checkIconClass}`}
                            >
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            </div>
                            <span className="text-[#1E1B4B] font-semibold leading-tight">
                              {feat}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Card Action Button */}
                    <div className="pt-6 mt-4">
                      <button
                        type="button"
                        onClick={() => handleChoosePlan(plan)}
                        className={`w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.03] active:scale-[0.98] ${plan.buttonBg}`}
                      >
                        <span>Choose Plan</span>
                        <ChevronRight className="h-4 w-4 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ======================================================== */}
          {/* 7. PREMIUM FEATURES GRID (8 Luxury Pastel Accents) */}
          {/* ======================================================== */}
          <div className="space-y-4 pt-4">
            <h3 className="text-base font-black text-[#1E1B4B] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span>Premium Features Included</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { title: 'All Subjects', sub: 'Unlocked', icon: Layers, bg: 'bg-[#FFE0EA] border-pink-300 text-rose-700' },
                { title: 'Detailed', sub: 'Explanations', icon: FileText, bg: 'bg-[#DCEBFF] border-sky-300 text-sky-700' },
                { title: 'Subject-wise', sub: 'Analytics', icon: TrendingUp, bg: 'bg-[#D9FBE8] border-emerald-300 text-emerald-700' },
                { title: 'Daily', sub: 'Current Affairs', icon: Newspaper, bg: 'bg-[#FFF1CC] border-amber-300 text-amber-700' },
                { title: 'Previous Year', sub: 'Papers (PYQs)', icon: GraduationCap, bg: 'bg-[#EDE7FF] border-violet-300 text-violet-700' },
                { title: '100% Ad-Free', sub: 'Learning', icon: Sparkles, bg: 'bg-[#D8F7F5] border-teal-300 text-teal-700' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl p-3.5 border-2 text-center flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 shadow-xs ${item.bg}`}
                  >
                    <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shadow-2xs">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="leading-tight">
                      <p className="text-[11px] font-black text-[#1E1B4B]">{item.title}</p>
                      <p className="text-[10px] font-bold text-slate-600">{item.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* 8. 100% SECURE PAYMENTS BAR */}
          {/* ======================================================== */}
          <div className="rounded-3xl p-5 bg-[#FFF8E7] border-2 border-emerald-300 shadow-md flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div>
                <h5 className="text-sm sm:text-base font-black text-[#1E1B4B]">
                  100% Secure Payments
                </h5>
                <p className="text-xs text-emerald-800 font-bold">
                  UPI, Cards, Net Banking Supported
                </p>
              </div>
            </div>

            {/* Brand Logos */}
            <div className="flex flex-wrap items-center justify-center gap-4 bg-white px-5 py-2.5 rounded-2xl border border-emerald-200 shadow-xs">
              <UpiLogo className="h-5 w-auto" />
              <div className="h-4 w-px bg-slate-300" />
              <GPayLogo className="h-5 w-auto" />
              <div className="h-4 w-px bg-slate-300" />
              <PhonePeLogo className="h-5 w-auto" />
              <div className="h-4 w-px bg-slate-300" />
              <PaytmLogo className="h-5 w-auto" />
              <div className="h-4 w-px bg-slate-300" />
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#1E1B4B]">
                <CreditCard className="h-4 w-4 text-indigo-700" />
                <span>All Major Cards</span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 9. BOTTOM CTA BUTTON */}
          {/* ======================================================== */}
          <div className="pt-4 text-center space-y-2.5">
            <button
              type="button"
              onClick={() => {
                const pass24: SubscriptionPackage = subscriptions.find(s => s.id === 'sub-24h' || s.price === 49) || {
                  id: 'sub-24h',
                  appId: activeApp.id,
                  name: '24 Hours Access',
                  price: 49,
                  billingCycle: '24 Hours',
                  currencySymbol: '₹',
                  status: 'active',
                  features: ['24 Hours Unlimited Practice', 'All Subjects Unlocked', 'Detailed Explanations'],
                  startDate: new Date().toISOString()
                };
                onSelectPackage(pass24);
              }}
              className="w-full max-w-xl mx-auto py-4 px-8 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:brightness-105 text-white font-black text-base sm:text-lg shadow-xl flex items-center justify-center gap-2.5 cursor-pointer transition-all hover:scale-105 active:scale-95 border border-white/40"
            >
              <Crown className="h-6 w-6 text-amber-300 fill-amber-300" />
              <span>Get 24 Hours Access @ ₹49</span>
              <ChevronRight className="h-6 w-6 stroke-[3]" />
            </button>
            <p className="text-xs text-[#1E1B4B]/80 font-bold">
              Instant Activation • 24 Hours Unlimited Practice • Razorpay Secure
            </p>
          </div>
        </div>
      </main>

      {/* ======================================================== */}
      {/* NEED HELP / SUPPORT MODAL (LUXURY IVORY & CHAMPAGNE GOLD) */}
      {/* ======================================================== */}
      <SupportCenterModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        appName={activeApp?.name || 'Exam Preparation Portal'}
      />
    </div>
  );
}
