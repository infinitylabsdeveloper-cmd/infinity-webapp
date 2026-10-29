import React, { useState, useEffect } from 'react';
import { AppState, AppConfig, Question, SubscriptionPackage, Poster, CurrentAffairsItem, CouponCode } from './types';
import { defaultDbState } from './lib/defaultData';
import { mergeExamNetworkWithExistingDb } from './lib/allIndiaExamRegistry';
import { LanguageCode, isRTL } from './lib/i18n';
import Header from './components/Header';
import LegalView from './components/LegalView';
import LoginScreen from './components/LoginScreen';
import StudentHome from './components/StudentHome';
import PracticeArena from './components/PracticeArena';
import ProfileView from './components/ProfileView';
import PerformanceBoard from './components/PerformanceBoard';
import LeaderboardView from './components/LeaderboardView';
import SyllabusExplore from './components/SyllabusExplore';
import CurrentAffairsView from './components/CurrentAffairsView';
import MockTestsList from './components/MockTestsList';
import MockTestGeneratorModal from './components/MockTestGeneratorModal';
import MockTestRunnerModal from './components/MockTestRunnerModal';
import { 
  fetchMockTestsFromFirestore, 
  fetchMockTestAttemptsFromFirestore, 
  deleteMockTestFromFirestore,
  fetchBookmarksFromFirestore,
  AUTHORIZED_ADMIN_EMAIL,
  subscribeToAuthChanges,
  logoutUser,
  loginWithEmailPassword,
  syncUserProfileToFirestore,
  syncAppSyllabusToFirestore,
  fetchAppSyllabusFromFirestore
} from './lib/firebase';
import { fetchBookmarks } from './services/bookmarkService';
import { BookmarksDashboard } from './components/BookmarksDashboard';
import { BookmarkItem, MockTest, MockTestAttempt } from './types';
import SubscriptionCheckout from './components/SubscriptionCheckout';

import SubscriptionPlansModal from './components/SubscriptionPlansModal';
import SettingsModal from './components/SettingsModal';
import SupportCenterModal from './components/SupportCenterModal';
import { PrivacyTermsModal } from './components/PrivacyTermsModal';
import { getSavedFontSettings, applyFontSettingsToDOM } from './lib/fontSettings';
import { getSavedTheme, applyGlobalTheme } from './lib/themeRegistry';
import { saveMcqAppearance, getSavedMcqAppearance } from './lib/mcqAppearanceStore';
import AdminPanel from './components/AdminPanel';
import InspirationalSplash from './components/InspirationalSplash';
import ErrorBoundary from './components/ErrorBoundary';
import { RefreshCw, GraduationCap, Compass, HelpCircle, Lock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { App as CapacitorApp } from '@capacitor/app';

export default function App() {
  /**
   * CRITICAL: PERSISTENCE & DATA INTEGRITY
   * All syllabus subjects for APPSC Group 2 (andhra-pradesh-appsc-group-2-en) are managed via the Admin Panel
   * and persisted in the server's db.json and cached locally. 
   * DO NOT hardcode new subjects here. ALWAYS use the Admin Panel to add/edit content
   * to ensure your changes are saved and do not conflict with the existing database.
   */
  const [state, setState] = useState<AppState>(() => {
    try {
      const cached = localStorage.getItem('aspirant_db_state');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.apps) && parsed.apps.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore parse errors
    }
    return defaultDbState;
  });

  const TARGET_STUDENT_APP_ID = 'andhra-pradesh-appsc-group-2-en';
  const [activeAppId, setActiveAppId] = useState<string>(TARGET_STUDENT_APP_ID);


  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('selectedLanguage');
    if (saved === 'te' || !saved) {
      localStorage.setItem('selectedLanguage', 'en');
      return 'en';
    }
    return (saved as LanguageCode) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('selectedLanguage', selectedLanguage);
    document.documentElement.dir = isRTL(selectedLanguage) ? 'rtl' : 'ltr';
    document.documentElement.lang = selectedLanguage;
  }, [selectedLanguage]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(`aspirant_user_logged_in_${activeAppId}`) === 'true' ||
           localStorage.getItem('aspirant_user_logged_in') === 'true';
  });

  // Sync login status whenever activeAppId changes to enforce independent per-app authentication
  useEffect(() => {
    const isAppUserLoggedIn = localStorage.getItem(`aspirant_user_logged_in_${activeAppId}`) === 'true';
    setIsLoggedIn(isAppUserLoggedIn);
  }, [activeAppId]);

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('aspirant_admin_logged_in') === 'true';
  });

  // Enforce student restriction: Non-admin users are strictly locked to APPSC Group 2 EN
  useEffect(() => {
    if (!isAdminLoggedIn && activeAppId !== TARGET_STUDENT_APP_ID) {
      setActiveAppId(TARGET_STUDENT_APP_ID);
    }
  }, [isAdminLoggedIn, activeAppId]);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [adminLoginLoading, setAdminLoginLoading] = useState<boolean>(false);
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  // Verify stored admin token against server
  useEffect(() => {
    const token = localStorage.getItem('aspirant_admin_token');
    if (token) {
      fetch('/api/admin/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (!data.valid) {
          localStorage.removeItem('aspirant_admin_token');
          localStorage.removeItem('aspirant_admin_logged_in');
          setIsAdminLoggedIn(false);
        }
      })
      .catch(() => {});
    }
  }, []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('aspirant_splash_shown');
    } catch (e) {
      return true;
    }
  });
  const [legalView, setLegalView] = useState<'privacy' | 'terms' | null>(null);
  const [isPrivacyTermsOpen, setIsPrivacyTermsOpen] = useState<boolean>(false);

  // Real-time Firebase Authentication State Listener & Session Persistence
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      if (firebaseUser) {
        localStorage.setItem(`aspirant_user_logged_in_${activeAppId}`, 'true');
        localStorage.setItem('aspirant_user_logged_in', 'true');
        if (firebaseUser.email) {
          localStorage.setItem('aspirant_user_email', firebaseUser.email);
        }
        if (firebaseUser.uid) {
          localStorage.setItem('aspirant_user_uid', firebaseUser.uid);
        }
        setIsLoggedIn(true);
      }
    });
    return () => unsubscribe();
  }, [activeAppId]);

  const handleUserLoginSuccess = () => {
    localStorage.setItem(`aspirant_user_logged_in_${activeAppId}`, 'true');
    localStorage.setItem('aspirant_user_logged_in', 'true');
    setIsLoggedIn(true);
  };

  const handleUserLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn('Firebase logout notice:', e);
    }
    localStorage.removeItem(`aspirant_user_logged_in_${activeAppId}`);
    localStorage.removeItem('aspirant_user_logged_in');
    localStorage.removeItem('aspirant_user_email');
    localStorage.removeItem('aspirant_user_uid');
    setIsLoggedIn(false);
  };

  const handleOpenAdminTrigger = () => {
    if (isAdminLoggedIn) {
      handleOpenAdmin(true);
    } else {
      setIsAdminLoginModalOpen(true);
    }
  };



  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLoginLoading) return;
    const cleanEmail = adminEmail.trim();
    const cleanPassword = adminPassword;

    if (!cleanEmail || !cleanPassword) {
      setAdminLoginError('Please enter both administrator email and password.');
      return;
    }

    setAdminLoginLoading(true);
    setAdminLoginError(null);

    try {
      // 1. Check backend administrator credentials first for verified server session token
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.token) {
        // Also attempt Firebase Auth sign-in quietly so Firestore admin rules apply seamlessly
        try {
          await loginWithEmailPassword(cleanEmail, cleanPassword);
        } catch (fbErr) {
          console.warn('Firebase Auth secondary sign-in notice:', fbErr);
        }
        localStorage.setItem('aspirant_admin_logged_in', 'true');
        localStorage.setItem('aspirant_admin_token', data.token);
        setIsAdminLoggedIn(true);
        setIsAdminLoginModalOpen(false);
        setAdminPassword('');
        handleOpenAdmin(true);
        return;
      }

      // 2. Fallback: Authenticate using Firebase Email/Password
      const user = await loginWithEmailPassword(cleanEmail, cleanPassword);
      const userEmail = user?.email ? user.email.toLowerCase() : '';
      const isAuthorizedAdmin = userEmail === AUTHORIZED_ADMIN_EMAIL.toLowerCase();

      if (!isAuthorizedAdmin) {
        await logoutUser();
        setAdminLoginError('Access Denied: This account does not have administrator privileges. Only the verified administrator may access the Admin Panel.');
        return;
      }

      // 3. Success: Grant admin access
      localStorage.setItem('aspirant_admin_logged_in', 'true');
      localStorage.setItem('aspirant_admin_token', 'firebase_auth_' + (user?.uid || 'admin'));
      setIsAdminLoggedIn(true);
      setIsAdminLoginModalOpen(false);
      setAdminPassword('');
      handleOpenAdmin(true);
    } catch (err: any) {
      const msg = err?.message || 'Authentication failed';
      let friendlyError = msg;
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found') || msg.includes('auth/invalid-email')) {
        friendlyError = 'Invalid administrator email or password. Please verify your credentials.';
      } else if (msg.includes('auth/too-many-requests')) {
        friendlyError = 'Access temporarily blocked due to multiple failed login attempts. Please try again later.';
      }
      setAdminLoginError(friendlyError);
    } finally {
      setAdminLoginLoading(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('aspirant_admin_token');
    localStorage.removeItem('aspirant_admin_logged_in');
    setIsAdminLoggedIn(false);
    setIsAdminOpen(false);
  };

  const handleAdminSwitchApp = async (appId: string) => {
    try {
      const token = localStorage.getItem('aspirant_admin_token');
      if (token) {
        await fetch('/api/admin/switch-app', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ appId })
        });
      }
    } catch (err) {
      console.warn('Admin switch app audit notification failed:', err);
    }
    setActiveAppId(appId);
  };

  // Student Navigation View State
  const [currentStudentView, setCurrentStudentView] = useState<'home' | 'profile' | 'performance' | 'leaderboard' | 'syllabus' | 'current-affairs' | 'mock-tests' | 'bookmarks'>('home');
  const [selectedSyllabusSubjectId, setSelectedSyllabusSubjectId] = useState<string>('');

  // Multi-Screen Shell: Keep visited screens mounted for instant 0ms switching
  const [visitedViews, setVisitedViews] = useState<Record<string, boolean>>(() => ({ home: true }));

  useEffect(() => {
    setVisitedViews(prev => prev[currentStudentView] ? prev : { ...prev, [currentStudentView]: true });
  }, [currentStudentView]);

  useEffect(() => {
    // When switching active exam app, reset visited views to ensure clean per-app state
    setVisitedViews({ [currentStudentView]: true });
  }, [activeAppId]);

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    fetchBookmarks('default_user_1', activeAppId).then((data) => {
      if (data && Array.isArray(data)) {
        setBookmarks(data);
      }
    });
  }, [activeAppId]);

  // Practice state
  const [activePracticeSession, setActivePracticeSession] = useState<{
    subjectId: string;
    unitId: string;
    topicId: string;
    subtopic?: string;
    setId?: number;
    setName?: string;
    customQuestions?: Question[];
    practiceMode?: 'sets' | 'subtopics';
  } | null>(() => {
    try {
      const saved = localStorage.getItem('aspirant_active_practice_session');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  // Mock Test State
  const [isMockGeneratorOpen, setIsMockGeneratorOpen] = useState<boolean>(false);
  const [activeMockTest, setActiveMockTest] = useState<MockTest | null>(null);
  const [activeMockAttempt, setActiveMockAttempt] = useState<MockTestAttempt | null>(null);
  const [firestoreMockTests, setFirestoreMockTests] = useState<MockTest[]>([]);
  const [firestoreMockAttempts, setFirestoreMockAttempts] = useState<MockTestAttempt[]>([]);

  useEffect(() => {
    fetchMockTestsFromFirestore(activeAppId).then(tests => {
      if (tests && Array.isArray(tests)) {
        setFirestoreMockTests(tests);
      }
    });
    fetchMockTestAttemptsFromFirestore(activeAppId).then(attempts => {
      if (attempts && Array.isArray(attempts)) {
        setFirestoreMockAttempts(attempts);
      }
    });
  }, [activeAppId]);

  // Font Settings Modal State & Mount Effect
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);


  useEffect(() => {
    // Apply saved font family, size, line-height & accessibility settings
    applyFontSettingsToDOM(getSavedFontSettings());
    // Apply saved color theme (Sahara, Candy, Silk, Emerald, etc.)
    applyGlobalTheme(getSavedTheme());
    // Apply saved MCQ appearance (Question, Options, Explanation colors)
    saveMcqAppearance(getSavedMcqAppearance());
  }, []);

  // Checkout modal state
  const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | null>(null);
  const [isSubscriptionPlansModalOpen, setIsSubscriptionPlansModalOpen] = useState<boolean>(false);

  // Mobile Hardware Back Button Navigation Handler (Capacitor Native + Browser PopState)
  useEffect(() => {
    const handleBackAction = () => {
      if (isSettingsModalOpen) {
        setIsSettingsModalOpen(false);
      } else if (isSubscriptionPlansModalOpen) {
        setIsSubscriptionPlansModalOpen(false);
      } else if (selectedPackage) {
        setSelectedPackage(null);
      } else if (isAdminOpen) {
        setIsAdminOpen(false);
      } else if (legalView) {
        setLegalView(null);
      } else if (activePracticeSession) {
        setActivePracticeSession(null);
      } else if (currentStudentView !== 'home') {
        setCurrentStudentView('home');
      } else {
        try {
          CapacitorApp.minimizeApp();
        } catch (e) {
          // ignore web browser
        }
      }
    };

    const handlePopState = (event: PopStateEvent) => {
      handleBackAction();
    };

    let capListener: any = null;
    try {
      CapacitorApp.addListener('backButton', (data) => {
        handleBackAction();
      }).then(l => {
        capListener = l;
      });
    } catch (e) {
      // Running in standard browser environment
    }

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (capListener && typeof capListener.remove === 'function') {
        capListener.remove();
      }
    };
  }, [isSettingsModalOpen, isSubscriptionPlansModalOpen, selectedPackage, isAdminOpen, legalView, activePracticeSession, currentStudentView]);

  const handleNavigateView = (view: 'home' | 'profile' | 'performance' | 'leaderboard' | 'syllabus' | 'current-affairs' | 'mock-tests' | 'bookmarks') => {
    window.history.pushState({ view }, '');
    setCurrentStudentView(view);
    setActivePracticeSession(null);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  const handleStartPractice = (session: { 
    subjectId: string; 
    unitId: string; 
    topicId: string; 
    subtopic?: string; 
    setId?: number; 
    setName?: string; 
    customQuestions?: Question[];
    practiceMode?: 'sets' | 'subtopics';
  }) => {
    const mode: 'sets' | 'subtopics' = session.practiceMode || (session.setId !== undefined || session.setName ? 'sets' : 'subtopics');
    const fullSession = { ...session, practiceMode: mode };
    
    try {
      localStorage.setItem('aspirant_active_practice_session', JSON.stringify(fullSession));
      if (activeApp && session.topicId) {
        localStorage.setItem(`syllabus_subtopics_active_tab_${activeApp.id}_${session.topicId}`, mode);
      }
    } catch (e) {}

    window.history.pushState({ practice: true }, '');
    setActivePracticeSession(fullSession);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  const handleOpenAdmin = (open: boolean) => {
    if (open) {
      window.history.pushState({ admin: true }, '');
    }
    setIsAdminOpen(open);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  const handleOpenLegal = (type: 'privacy' | 'terms' | null) => {
    if (type) {
      window.history.pushState({ legal: true }, '');
    }
    setLegalView(type);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  const handleOpenCheckout = (pkg: SubscriptionPackage | null) => {
    if (pkg) {
      window.history.pushState({ checkout: true }, '');
    }
    setSelectedPackage(pkg);
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  };

  // Scroll to top whenever view or practice session changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [currentStudentView, activePracticeSession, selectedSyllabusSubjectId]);

  // Fetch the full database state from the Express backend
  const fetchState = async (silent = false) => {
    if (!silent) setIsLoading(false); // keep rendering immediate cached data
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error(`Server status ${response.status}`);
      }
      const data: AppState = await response.json();
      if (data.apps && Array.isArray(data.apps)) {
        data.apps = mergeExamNetworkWithExistingDb(data.apps);
      }
      if (!data.currentAffairs) data.currentAffairs = [];
      if (!data.questions) data.questions = [];
      if (!data.posters) data.posters = [];
      if (!data.subscriptions) data.subscriptions = [];
      if (!data.notifications) data.notifications = [];
      
      setState(data);
      try {
        localStorage.setItem('aspirant_db_state', JSON.stringify(data));
      } catch (e) {
        // ignore localStorage quota warnings
      }
      
      if (data.apps && data.apps.length > 0) {
        const ids = data.apps.map(a => a.id);
        const isAdmin = localStorage.getItem('aspirant_admin_logged_in') === 'true';
        if (!isAdmin) {
          setActiveAppId(TARGET_STUDENT_APP_ID);
        } else if (!ids.includes(activeAppId)) {
          setActiveAppId(ids.includes(TARGET_STUDENT_APP_ID) ? TARGET_STUDENT_APP_ID : ids[0]);
        }
      }
    } catch (error) {
      console.warn('Backend sync note (using local cache):', error);
      // Auto-retry in background after 4 seconds
      setTimeout(() => {
        fetchState(true);
      }, 4000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  // Save the state back to Express and update disk database
  const saveState = async (newState: AppState) => {
    // 1. Optimistically update local memory and localStorage immediately
    setState(newState);
    try {
      localStorage.setItem('aspirant_db_state', JSON.stringify(newState));
    } catch (e) {
      // ignore
    }

    // Dispatch global real-time event so all mounted components update state immediately
    try {
      window.dispatchEvent(new CustomEvent('aspirant_state_updated', { detail: newState }));
    } catch (e) {
      // ignore
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newState),
      });
      if (!response.ok) {
        console.warn('Server save non-200 status, cached locally');
      }

      // If syllabus was modified, also sync with Firestore appSyllabus
      if (isAdminLoggedIn && newState.apps) {
        const currentApp = newState.apps.find(a => a.id === activeAppId);
        if (currentApp && currentApp.syllabus) {
          syncAppSyllabusToFirestore(activeAppId, currentApp.syllabus).catch(e => {
            console.warn('Firestore syllabus sync note:', e);
          });
        }
      }
    } catch (error) {
      console.warn('Note: Server save deferred, saved to local cache:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addNotification = (
    title: string, 
    message: string, 
    type: 'purchase' | 'renewal' | 'expiry' | 'failed' | 'offer' | 'coupon' | 'info' = 'info'
  ) => {
    if (!state) return;
    const newNotif = {
      id: `notif-${Date.now()}`,
      appIds: [activeAppId],
      title,
      message,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      type,
      read: false
    };
    const newState = {
      ...state,
      notifications: [newNotif, ...(state.notifications || [])]
    };
    saveState(newState);
  };

  const activeApp = state?.apps?.find((a) => a.id === activeAppId) || state?.apps?.[0] || null;

  if (showSplash) {
    return (
      <InspirationalSplash
        appName={activeApp?.name || 'All India Exam Network'}
        onComplete={() => {
          try {
            sessionStorage.setItem('aspirant_splash_shown', 'true');
          } catch (e) {}
          setShowSplash(false);
        }}
      />
    );
  }

  if (isLoading || !state) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50 space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin" />
          <GraduationCap className="h-5 w-5 text-slate-800 absolute" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-sm font-bold text-slate-800 animate-pulse">
            Connecting to Database...
          </h2>
          <p className="text-xs text-slate-400">Loading exam apps and syllabus structure.</p>
        </div>
      </div>
    );
  }

  // Clean empty state when zero apps exist in database
  if (!activeApp || !state.apps || state.apps.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">
              🎓
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-slate-900">Exam Preparation Portal</h1>
              <p className="text-[11px] text-slate-500 font-medium">Competitive Exam Preparation System</p>
            </div>
          </div>
          <button
            onClick={handleOpenAdminTrigger}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <ShieldCheck className="h-4 w-4" /> Admin Panel
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center border border-slate-200 shadow-xl space-y-5">
            <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-3xl font-black">
              📚
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900">No Exam Apps Available</h2>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                No examination syllabus or app packages have been created yet. As an administrator, you can add new exam apps, configure subjects, and import MCQs directly via the Admin Panel.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleOpenAdminTrigger}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="h-4 w-4" /> Launch Admin Panel
              </button>
              <button
                onClick={() => fetchState()}
                className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="h-4 w-4" /> Refresh Data
              </button>
            </div>
          </div>
        </main>

        {/* Admin Login Modal if opened */}
        {isAdminLoginModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Admin Authentication</h3>
                    <p className="text-[11px] text-slate-500">Sign in to manage apps & questions</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAdminLoginModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Admin Email</label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="appsc.developer@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Admin Password</label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={adminLoginLoading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {adminLoginLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Verifying on Server...</span>
                    </>
                  ) : (
                    <span>Verify & Enter Admin Panel</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Admin Panel Modal if opened */}
        {isAdminOpen && (
          <AdminPanel
            state={state}
            activeApp={{ id: 'app-default', name: 'Exam Portal', countryId: 'india', countryName: 'India', stateId: 'ap', stateName: 'AP', locale: 'en', themeColor: 'indigo', accentColor: '#4f46e5', bannerImage: '', syllabus: [] }}
            onSaveState={saveState}
            onClose={() => handleOpenAdmin(false)}
            onLogout={handleAdminLogout}
            onSelectApp={(newId) => handleAdminSwitchApp(newId)}
          />
        )}
      </div>
    );
  }

  // If not logged in, show exact Design 1 Login Screen
  if (!isLoggedIn) {
    return (
      <LoginScreen
        activeApp={activeApp}
        onLoginSuccess={handleUserLoginSuccess}
        onOpenLegal={(type) => setLegalView(type)}
      />
    );
  }

  return (
      <div 
        className="min-h-screen w-full overflow-x-hidden flex flex-col antialiased font-sans relative bg-slate-100 py-0 sm:py-2 md:py-4 px-0 sm:px-2 md:px-4 lg:px-6"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(248, 250, 252, 0.94), rgba(241, 245, 249, 0.92)), url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2000&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="w-full max-w-full md:max-w-5xl lg:max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto md:rounded-3xl lg:rounded-[2.5rem] md:shadow-2xl md:border md:border-slate-300/80 bg-white flex flex-col relative overflow-x-hidden min-h-screen md:min-h-[95vh]">
          {/* 1. Header Navigation Bar with Left Hamburger Menu */}
          {!activePracticeSession && (
            <Header
              apps={state.apps}
              activeApp={activeApp}
              setActiveAppId={(id) => {
                setActiveAppId(id);
                setActivePracticeSession(null);
                setCurrentStudentView('home');
              }}
              onRefresh={fetchState}
              isSaving={isSaving}
              isAdminLoggedIn={isAdminLoggedIn}
              onOpenAdmin={handleOpenAdminTrigger}
              onOpenLegal={(type) => handleOpenLegal(type)}
              onOpenSubscriptions={() => {
                setIsSubscriptionPlansModalOpen(true);
              }}
              onOpenSettings={() => {
                window.history.pushState({ settings: true }, '');
                setIsSettingsModalOpen(true);
              }}
              onLogout={handleUserLogout}
              currentView={currentStudentView}
              onSelectView={(view) => handleNavigateView(view)}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              onOpenSupport={() => setIsSupportModalOpen(true)}
            />
          )}

        {/* Main Content Container with Compact Mobile Spacing */}
        <main className={`flex-1 mx-auto w-full max-w-full ${activePracticeSession ? 'px-2 sm:px-3 py-2' : 'px-3 sm:px-4 pt-3 pb-6'} overflow-x-hidden`}>
          <ErrorBoundary>
            <div className="w-full">
            {activePracticeSession ? (
              /* Interactive MCQ Practice Arena */
              <div className="w-full">
                <PracticeArena
                  activeApp={activeApp}
                  subjectId={activePracticeSession.subjectId}
                  unitId={activePracticeSession.unitId}
                  topicId={activePracticeSession.topicId}
                  subtopic={activePracticeSession.subtopic || ''}
                  setId={activePracticeSession.setId}
                  setName={activePracticeSession.setName}
                  customQuestions={activePracticeSession.customQuestions}
                  questions={state.questions}
                  practiceMode={activePracticeSession.practiceMode || (activePracticeSession.setId !== undefined || activePracticeSession.setName ? 'sets' : 'subtopics')}
                  onBackToHome={() => {
                    try {
                      localStorage.setItem('aspirant_returning_from_practice', 'true');
                      localStorage.removeItem('aspirant_active_practice_session');
                    } catch (e) {}
                    
                    if (activePracticeSession && activeApp) {
                      const { subjectId, unitId, topicId, practiceMode, setId, setName } = activePracticeSession;
                      const mode = practiceMode || (setId !== undefined || setName ? 'sets' : 'subtopics');
                      try {
                        const currentSubject = activeApp.syllabus.find(s => s.id === subjectId);
                        const unitObj = currentSubject?.units?.find(u => u.id === unitId);
                        const topicObj = unitObj?.topics?.find(t => t.id === topicId) || currentSubject?.units?.flatMap(u => u.topics || []).find(t => t?.id === topicId);
                        const realUnitId = unitObj?.id || currentSubject?.units?.find(u => u.topics?.some(t => t.id === topicId))?.id || unitId;
                        
                        if (topicObj) {
                          const topicSelection = {
                            unitId: realUnitId,
                            unitName: unitObj?.name || 'Unit',
                            topic: topicObj
                          };
                          localStorage.setItem(`syllabus_selected_topic_for_subtopics_${activeApp.id}`, JSON.stringify(topicSelection));
                          localStorage.setItem(`syllabus_selected_unit_id_${activeApp.id}`, realUnitId);
                          localStorage.setItem(`syllabus_selected_subject_id_${activeApp.id}`, subjectId);
                          localStorage.setItem(`syllabus_subtopics_active_tab_${activeApp.id}_${topicId}`, mode);
                        }
                      } catch (err) {}
                      
                      setSelectedSyllabusSubjectId(subjectId);
                    }
                    
                    setCurrentStudentView('syllabus');
                    setActivePracticeSession(null);
                  }}
                  onSelectSubtopic={(sId, uId, tId, sub) => {
                    handleStartPractice({ subjectId: sId, unitId: uId, topicId: tId, subtopic: sub, practiceMode: 'subtopics' });
                  }}
                  onSelectSet={(sId, uId, tId, sIdNum, sName, qList) => {
                    handleStartPractice({ subjectId: sId, unitId: uId, topicId: tId, setId: sIdNum, setName: sName, customQuestions: qList, practiceMode: 'sets' });
                  }}
                  onOpenSettings={() => {
                    window.history.pushState({ settings: true }, '');
                    setIsSettingsModalOpen(true);
                  }}
                  selectedLanguage={selectedLanguage}
                />
              </div>
            ) : (
              /* High-Speed Multi-Screen Shell: Zero-delay Instant Screen Rendering */
              <div className="w-full">
                {visitedViews['home'] && (
                  <div className={currentStudentView === 'home' ? 'block' : 'hidden'} aria-hidden={currentStudentView !== 'home'}>
                    <StudentHome
                      activeApp={activeApp}
                      apps={state.apps || []}
                      questions={state.questions || []}
                      posters={state.posters || []}
                      currentAffairs={state.currentAffairs || []}
                      subscriptions={state.subscriptions || []}
                      notifications={state.notifications || []}
                      onSelectApp={(id) => setActiveAppId(id)}
                      onSelectSubtopic={(subjectId, unitId, topicId, subtopic) => {
                        handleStartPractice({ subjectId, unitId, topicId, subtopic });
                      }}
                      onSelectSubject={(subjectId) => {
                        setSelectedSyllabusSubjectId(subjectId);
                        setCurrentStudentView('syllabus');
                      }}
                      onOpenCheckout={(pack) => handleOpenCheckout(pack)}
                      onOpenSubscriptionPlans={() => {
                        window.history.pushState({ plans: true }, '');
                        setIsSubscriptionPlansModalOpen(true);
                      }}
                      onNavigateToCurrentAffairs={() => handleNavigateView('current-affairs')}
                      onNavigateToMockTests={() => handleNavigateView('mock-tests')}
                      onNavigateToBookmarks={() => handleNavigateView('bookmarks')}
                      onOpenGenerator={() => setIsMockGeneratorOpen(true)}
                      selectedLanguage={selectedLanguage}
                    />
                  </div>
                )}

                {visitedViews['syllabus'] && (
                  <div className={currentStudentView === 'syllabus' ? 'block' : 'hidden'} aria-hidden={currentStudentView !== 'syllabus'}>
                    <SyllabusExplore
                      activeApp={activeApp}
                      questions={state.questions}
                      initialSubjectId={selectedSyllabusSubjectId}
                      onSelectSubtopic={(subjectId, unitId, topicId, subtopic) => {
                        handleStartPractice({ subjectId, unitId, topicId, subtopic });
                      }}
                      onSelectSet={(subjectId, unitId, topicId, sIdNum, sName, qList) => {
                        handleStartPractice({ subjectId, unitId, topicId, setId: sIdNum, setName: sName, customQuestions: qList });
                      }}
                      onBackToHome={() => handleNavigateView('home')}
                      onOpenSubscriptionPlans={() => {
                        window.history.pushState({ plans: true }, '');
                        setIsSubscriptionPlansModalOpen(true);
                      }}
                      selectedLanguage={selectedLanguage}
                    />
                  </div>
                )}

                {visitedViews['profile'] && (
                  <div className={currentStudentView === 'profile' ? 'block' : 'hidden'} aria-hidden={currentStudentView !== 'profile'}>
                    <ProfileView
                      activeApp={activeApp}
                      subscriptions={state.subscriptions}
                      subscriptionHistory={state.subscriptionHistory || []}
                      paymentHistory={state.paymentHistory || []}
                      onOpenCheckout={(pack) => handleOpenCheckout(pack)}
                      onLogout={handleUserLogout}
                      onOpenLegal={(type) => setLegalView(type)}
                      onOpenSettings={() => {
                        window.history.pushState({ settings: true }, '');
                        setIsSettingsModalOpen(true);
                      }}
                      onOpenSupport={() => setIsSupportModalOpen(true)}
                    />
                  </div>
                )}

                {visitedViews['performance'] && (
                  <div className={currentStudentView === 'performance' ? 'block' : 'hidden'} aria-hidden={currentStudentView !== 'performance'}>
                    <PerformanceBoard
                      activeApp={activeApp}
                      questions={state.questions}
                    />
                  </div>
                )}

                {visitedViews['leaderboard'] && (
                  <div className={currentStudentView === 'leaderboard' ? 'block' : 'hidden'} aria-hidden={currentStudentView !== 'leaderboard'}>
                    <LeaderboardView
                      activeApp={activeApp}
                    />
                  </div>
                )}

                {visitedViews['current-affairs'] && (
                  <div className={currentStudentView === 'current-affairs' ? 'block' : 'hidden'} aria-hidden={currentStudentView !== 'current-affairs'}>
                    <CurrentAffairsView
                      activeApp={activeApp}
                      currentAffairs={state.currentAffairs || []}
                      onBackToHome={() => handleNavigateView('home')}
                      selectedLanguage={selectedLanguage}
                    />
                  </div>
                )}

                {visitedViews['mock-tests'] && (
                  <div className={currentStudentView === 'mock-tests' ? 'block' : 'hidden'} aria-hidden={currentStudentView !== 'mock-tests'}>
                    <MockTestsList
                      mockTests={firestoreMockTests.length > 0 ? firestoreMockTests : (state.mockTests || [])}
                      mockTestAttempts={firestoreMockAttempts.length > 0 ? firestoreMockAttempts : (state.mockTestAttempts || [])}
                      activeApp={activeApp}
                      onOpenGenerator={() => setIsMockGeneratorOpen(true)}
                      onStartTest={(test) => setActiveMockTest(test)}
                      onDeleteTest={async (testId) => {
                        await deleteMockTestFromFirestore(testId);
                        setFirestoreMockTests(prev => prev.filter(t => t.id !== testId));
                      }}
                    />
                  </div>
                )}

                {visitedViews['bookmarks'] && (
                  <div className={currentStudentView === 'bookmarks' ? 'block' : 'hidden'} aria-hidden={currentStudentView !== 'bookmarks'}>
                    <BookmarksDashboard
                      bookmarks={bookmarks}
                      onUpdateBookmarks={(newBookmarks) => setBookmarks(newBookmarks)}
                      appConfig={activeApp}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </ErrorBoundary>
      </main>

      {/* Mock Test Generator Wizard Modal */}
      {isMockGeneratorOpen && (
        <MockTestGeneratorModal
          isOpen={isMockGeneratorOpen}
          onClose={() => setIsMockGeneratorOpen(false)}
          activeApp={activeApp}
          questions={state.questions || []}
          currentAffairs={state.currentAffairs || []}
          onTestCreated={(newTest, startImmediately) => {
            setFirestoreMockTests(prev => [newTest, ...prev]);
            if (startImmediately) {
              setActiveMockTest(newTest);
            } else {
              handleNavigateView('mock-tests');
            }
          }}
        />
      )}

      {/* Mock Test Runner Modal */}
      {activeMockTest && (
        <MockTestRunnerModal
          isOpen={!!activeMockTest}
          onClose={() => setActiveMockTest(null)}
          mockTest={activeMockTest}
          activeApp={activeApp}
          existingAttempt={activeMockAttempt}
          onAttemptCompleted={(attempt) => {
            setFirestoreMockAttempts(prev => [...prev, attempt]);
          }}
        />
      )}


      {/* Admin Panel Modal */}
      <AnimatePresence>
        {isAdminOpen && (
          <AdminPanel
            state={state}
            activeApp={activeApp}
            onSaveState={saveState}
            onClose={() => handleOpenAdmin(false)}
            onLogout={handleAdminLogout}
            onSelectApp={(appId) => handleAdminSwitchApp(appId)}
            adminEmail={adminEmail}
          />
        )}
      </AnimatePresence>

      {/* Legal Views Modal Overlay */}
      <AnimatePresence>
        {legalView && (
          <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-50">
            <LegalView
              activeApp={activeApp}
              type={legalView}
              onBack={() => handleOpenLegal(null)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {isAdminLoginModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative font-sans"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
                    <Lock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Admin Authentication</h3>
                    <p className="text-xs text-slate-500">Restricted Access. Enter credentials.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAdminLoginModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
                {adminLoginError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold leading-relaxed">
                    {adminLoginError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Admin Email ID</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@example.com"
                    value={adminEmail}
                    onChange={(e) => {
                      setAdminEmail(e.target.value);
                      if (adminLoginError) setAdminLoginError(null);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 outline-none focus:border-indigo-600 bg-slate-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Admin Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      if (adminLoginError) setAdminLoginError(null);
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 outline-none focus:border-indigo-600 bg-slate-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={adminLoginLoading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white font-bold text-sm tracking-wide shadow-lg hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShieldCheck className="h-4 w-4 text-amber-400" />
                  <span>{adminLoginLoading ? 'VERIFYING CREDENTIALS...' : 'LOGIN AS ADMIN'}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Font & Display Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        activeApp={activeApp}
        subjects={activeApp?.syllabus}
      />

      {/* Subscription Plans Modal with Google Play Billing */}
      <AnimatePresence>
        {isSubscriptionPlansModalOpen && (
          <SubscriptionPlansModal
            activeApp={activeApp}
            subscriptions={state.subscriptions}
            coupons={state.coupons}
            onClose={() => setIsSubscriptionPlansModalOpen(false)}
            onSelectPackage={(pack) => {
              setIsSubscriptionPlansModalOpen(false);
              handleOpenCheckout(pack);
            }}
          />
        )}
      </AnimatePresence>

      {/* 3. Global Premium Checkout Dialog Modal */}
      <AnimatePresence>
        {selectedPackage && state && (
          <SubscriptionCheckout
            activeApp={activeApp}
            selectedPackage={selectedPackage}
            coupons={state.coupons}
            state={state}
            onSaveState={saveState}
            onClose={() => handleOpenCheckout(null)}
            onPaymentSuccess={() => {
              addNotification(
                'Purchase Successful! 🎉',
                `You have successfully subscribed to ${selectedPackage.name}. Welcome to ${activeApp.name}!`,
                'purchase'
              );
            }}
          />
        )}
      </AnimatePresence>

      {/* 4. Tiny Elegant Footer */}
      <footer className="border-t border-slate-200/55 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-[11px] text-slate-400 font-semibold uppercase tracking-wider space-y-2">
          <p>© 2026 Exam Preparation Portal. All Rights Reserved.</p>
          <div className="flex items-center justify-center gap-4 lowercase normal-case text-slate-500 font-medium">
            <button
              onClick={() => setIsSupportModalOpen(true)}
              className="hover:text-blue-600 underline font-bold cursor-pointer transition-colors text-blue-900"
            >
              Help & Support Center
            </button>
            <span>•</span>
            <button
              onClick={() => setIsPrivacyTermsOpen(true)}
              className="hover:text-amber-600 underline cursor-pointer transition-colors"
            >
              Google Play Store Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => setIsPrivacyTermsOpen(true)}
              className="hover:text-amber-600 underline cursor-pointer transition-colors"
            >
              Terms of Service
            </button>
          </div>

        </div>
      </footer>

      <SupportCenterModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        appName={activeApp.name}
      />

      <PrivacyTermsModal
        isOpen={isPrivacyTermsOpen}
        onClose={() => setIsPrivacyTermsOpen(false)}
      />

        </div>
    </div>
  );
}
