import React, { useState } from 'react';
import { AppConfig, Question, Poster, CurrentAffairsItem, SubscriptionPackage, NotificationItem } from '../types';
import { BookOpen, Award, CheckCircle, ChevronRight, ChevronLeft, ArrowRight, ArrowLeft, ExternalLink, Play, Bookmark, Calendar, FileText, Sparkles, Star, Shield, Bell, X, Flame, Globe, Compass, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { defaultCuratedPosters } from '../lib/defaultData';
import {
  getCuratedSubjectImage,
  getBrightCardTheme,
  SmartCardImage,
  ReferenceStatStrip,
  computeSetsFromQuestions,
  computeTopicCompletionPercentage,
} from '../lib/subjectVisuals';

interface StudentHomeProps {
  activeApp: AppConfig;
  apps?: AppConfig[];
  questions: Question[];
  posters: Poster[];
  currentAffairs: CurrentAffairsItem[];
  subscriptions: SubscriptionPackage[];
  notifications?: NotificationItem[];
  onSelectApp?: (appId: string) => void;
  onSelectSubtopic: (subjectId: string, unitId: string, topicId: string, subtopic: string) => void;
  onSelectSubject?: (subjectId: string) => void;
  onOpenCheckout: (pack: SubscriptionPackage) => void;
  onOpenSubscriptionPlans?: () => void;
  onNavigateToCurrentAffairs: () => void;
  onNavigateToMockTests?: () => void;
  onNavigateToBookmarks?: () => void;
  onOpenGenerator?: () => void;
  selectedLanguage: string;
}

export default function StudentHome({
  activeApp,
  apps = [],
  questions = [],
  posters = [],
  currentAffairs = [],
  subscriptions = [],
  notifications = [],
  onSelectApp,
  onSelectSubtopic,
  onSelectSubject,
  onOpenCheckout,
  onOpenSubscriptionPlans,
  onNavigateToCurrentAffairs,
  onNavigateToMockTests,
  onNavigateToBookmarks,
  onOpenGenerator,
  selectedLanguage,
}: StudentHomeProps) {
  const examPrefix = (activeApp?.name || 'Exam').split(' ')[0] || 'Exam';
  const syllabusList = activeApp?.syllabus || [];

  // Track images that failed to load over network or CORS
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Robust poster list resolution with graceful default curated fallback
  const appPosters = React.useMemo(() => {
    const now = new Date();
    const activeAppId = activeApp?.id || 'andhra-pradesh-appsc-group-2-en';

    const liveCustomPosters = (posters || []).filter(p => {
      if (!p || !p.title) return false;
      const pAppIds = Array.isArray(p.appIds) ? p.appIds : [];
      const isTargeted = pAppIds.length === 0 || pAppIds.includes(activeAppId) || pAppIds.includes('all');
      if (!isTargeted) return false;
      if (p.status === 'disabled' || p.status === 'draft') return false;
      
      const start = p.startDate ? new Date(p.startDate) : null;
      const end = p.endDate ? new Date(p.endDate) : null;
      
      const isStartValid = start && !isNaN(start.getTime());
      const isEndValid = end && !isNaN(end.getTime());
      
      if (isStartValid && now < start!) return false;
      if (isEndValid && now > end!) return false;
      
      return true;
    });

    // If custom posters exist and match, return them
    if (liveCustomPosters.length > 0) {
      return liveCustomPosters;
    }

    // Graceful fallback to rich curated posters for this app
    const fallbackList = (defaultCuratedPosters || []).filter(p => {
      const pAppIds = p.appIds || [];
      return pAppIds.includes('all') || pAppIds.includes(activeAppId);
    });

    return fallbackList.length > 0 ? fallbackList : defaultCuratedPosters || [];
  }, [posters, activeApp?.id]);

  const [subjectFilter, setSubjectFilter] = useState<'all' | 'prelims' | 'mains'>('all');

  // Auto sliding poster index state with bounds clamping
  const [currentPosterIndex, setCurrentPosterIndex] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Touch gesture state for native mobile swipe
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsCarouselHovered(true);
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsCarouselHovered(false);
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 45;
    if (distance > minSwipeDistance && appPosters.length > 1) {
      // Swiped left -> next
      setCurrentPosterIndex(prev => (prev + 1) % appPosters.length);
    } else if (distance < -minSwipeDistance && appPosters.length > 1) {
      // Swiped right -> prev
      setCurrentPosterIndex(prev => (prev - 1 + appPosters.length) % appPosters.length);
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const adminNotifications = (notifications || []).filter(n => 
    n && 
    n.appIds?.includes(activeApp?.id)
  ).map(n => ({
    id: n.id,
    title: n.title,
    message: n.message,
    time: n.date,
    read: false,
    type: 'Admin Broadcast'
  }));

  const notificationsList = adminNotifications;
  const unreadCount = notificationsList.filter(n => !n.read).length;

  React.useEffect(() => {
    if (appPosters.length <= 1 || isCarouselHovered) return;
    const interval = setInterval(() => {
      setCurrentPosterIndex((prev) => (prev + 1) % appPosters.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [appPosters.length, isCarouselHovered]);

  const filteredSubjects = syllabusList.filter(subj => {
    if (!subj) return false;
    if (subjectFilter === 'prelims') return subj.category === 'prelims' || subj.category === 'both' || !subj.category;
    if (subjectFilter === 'mains') return subj.category === 'mains' || subj.category === 'both';
    return true;
  });

  // Helper to get bright daylight, domain-specific subject images
  const getSubjectImage = (subj: any, index: number = 0) => {
    return getCuratedSubjectImage(subj, index);
  };

  const getSubjectColor = (subj: any) => {
    if (subj?.color) return subj.color;
    
    const n = (subj?.name || '').toLowerCase();
    if (n.includes('geography')) return 'from-teal-600 to-emerald-700';
    if (n.includes('history') && !n.includes('andhra')) return 'from-amber-600 to-orange-700';
    if (n.includes('society')) return 'from-orange-500 to-amber-600';
    if (n.includes('mental') || n.includes('ability')) return 'from-indigo-600 to-blue-700';
    if (n.includes('andhra') || n.includes('cultural')) return 'from-amber-600 to-orange-700';
    if (n.includes('constitution')) return 'from-blue-700 to-indigo-800';
    if (n.includes('economy')) return 'from-emerald-600 to-teal-800';
    if (n.includes('science') || n.includes('tech')) return 'from-cyan-600 to-blue-800';
    return 'from-orange-500 to-orange-700';
  };

  // Fast precomputed MCQ counts per subject (O(N) once instead of O(N * S) on every render)
  const subjectQuestionsCountMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    if (!questions || !activeApp?.syllabus) return map;

    const lookups = (activeApp.syllabus || []).map(s => ({
      id: s.id,
      name: s.name,
      unitIds: new Set((s.units || []).map((u: any) => u?.id).filter(Boolean)),
      topicIds: new Set((s.units || []).flatMap((u: any) => (u?.topics || []).map((t: any) => t?.id).filter(Boolean)))
    }));

    (questions || []).forEach(q => {
      if (!q || (activeApp?.id && q.appId && q.appId !== activeApp.id)) return;
      for (let i = 0; i < lookups.length; i++) {
        const subj = lookups[i];
        if ((q.subjectId && (q.subjectId === subj.id || q.subjectId === subj.name)) ||
            (q.unitId && subj.unitIds.has(q.unitId)) ||
            (q.topicId && subj.topicIds.has(q.topicId))) {
          map[subj.id] = (map[subj.id] || 0) + 1;
          break;
        }
      }
    });

    return map;
  }, [questions, activeApp]);

  // Precomputed questions list per subject and topic for accurate Sets & Completion % calculation
  const subjectStatsMap = React.useMemo(() => {
    const stats: Record<string, { mcqsCount: number; setsCount: number; completionPct: number }> = {};
    if (!activeApp?.syllabus) return stats;

    const appId = activeApp.id || '';
    const validQuestions = (questions || []).filter(
      (q) => q && (!appId || !q.appId || q.appId === appId || q.appId === 'all')
    );

    const byTopic: Record<string, Question[]> = {};
    const byUnitDirect: Record<string, Question[]> = {};
    const bySubjectDirect: Record<string, Question[]> = {};

    validQuestions.forEach((q) => {
      if (q.topicId) {
        if (!byTopic[q.topicId]) byTopic[q.topicId] = [];
        byTopic[q.topicId].push(q);
      } else if (q.unitId) {
        if (!byUnitDirect[q.unitId]) byUnitDirect[q.unitId] = [];
        byUnitDirect[q.unitId].push(q);
      } else if (q.subjectId) {
        if (!bySubjectDirect[q.subjectId]) bySubjectDirect[q.subjectId] = [];
        bySubjectDirect[q.subjectId].push(q);
      }
    });

    (activeApp.syllabus || []).forEach((subj: any) => {
      if (!subj) return;
      const units = Array.isArray(subj.units) ? subj.units : [];
      let setsCount = computeSetsFromQuestions(bySubjectDirect[subj.id] || []);
      let topicPctSum = 0;
      let topicCountForPct = 0;

      units.forEach((u: any) => {
        if (!u) return;
        setsCount += computeSetsFromQuestions(byUnitDirect[u.id] || []);
        const topics = Array.isArray(u.topics) ? u.topics : [];
        topics.forEach((t: any) => {
          if (!t) return;
          const tQuestions = byTopic[t.id] || [];
          setsCount += computeSetsFromQuestions(tQuestions);
          topicPctSum += computeTopicCompletionPercentage(appId, subj.id, u.id, t, tQuestions);
          topicCountForPct++;
        });
      });

      const mcqsCount = subjectQuestionsCountMap[subj.id] || 0;
      if (setsCount === 0 && mcqsCount > 0) {
        setsCount = Math.ceil(mcqsCount / 10);
      }
      const completionPct = topicCountForPct > 0 ? Math.round(topicPctSum / topicCountForPct) : 0;

      stats[subj.id] = { mcqsCount, setsCount, completionPct };
    });

    return stats;
  }, [questions, activeApp, selectedLanguage, subjectQuestionsCountMap]);

  // Helper to dynamically calculate total MCQs for each subject
  const getSubjectQuestionsCount = (subj: any) => {
    if (!subj) return 0;
    return subjectQuestionsCountMap[subj.id] || 0;
  };

  const getSubjectMcqsDisplay = (subj: any, _totalTopics: number) => {
    const realCount = getSubjectQuestionsCount(subj);
    if (realCount > 0) {
      return `${realCount.toLocaleString()} MCQs`;
    }
    return `0 MCQs`;
  };

  const handleStartCard = (subjectId: string) => {
    try {
      if (activeApp?.id) {
        localStorage.removeItem(`syllabus_selected_unit_id_${activeApp.id}`);
        localStorage.removeItem(`syllabus_selected_topic_for_subtopics_${activeApp.id}`);
      }
    } catch (e) {}

    if (onSelectSubject) {
      onSelectSubject(subjectId);
    } else {
      onSelectSubtopic(subjectId, '', '', 'General Practice');
    }
  };

  // Helper to handle poster click and redirect to the concerned page
  const handlePosterClick = (poster: Poster) => {
    if (!poster) return;

    // 1. Explicit targetType routing
    if (poster.targetType === 'prelims') {
      setSubjectFilter('prelims');
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    if (poster.targetType === 'mains') {
      setSubjectFilter('mains');
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    if (poster.targetType === 'current-affairs') {
      onNavigateToCurrentAffairs();
      return;
    }

    if (poster.targetType === 'mock-tests') {
      if (onNavigateToMockTests) {
        onNavigateToMockTests();
      } else if (onOpenGenerator) {
        onOpenGenerator();
      }
      return;
    }

    if (poster.targetType === 'bookmarks') {
      if (onNavigateToBookmarks) {
        onNavigateToBookmarks();
      }
      return;
    }

    if (poster.targetType === 'subscription') {
      if (onOpenSubscriptionPlans) {
        onOpenSubscriptionPlans();
      } else if (subscriptions && subscriptions.length > 0) {
        onOpenCheckout(subscriptions[0]);
      }
      return;
    }

    if (poster.targetType === 'subject' && poster.targetSubjectId) {
      if (onSelectSubject) {
        onSelectSubject(poster.targetSubjectId);
      } else {
        handleStartCard(poster.targetSubjectId);
      }
      return;
    }

    if (poster.targetType === 'url' || (poster.actionUrl && (poster.actionUrl.startsWith('http://') || poster.actionUrl.startsWith('https://')))) {
      if (poster.actionUrl) {
        try {
          const a = document.createElement('a');
          a.href = poster.actionUrl;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } catch {
          // graceful fallback
        }
        return;
      }
    }

    // 2. Hash / Route keyword in actionUrl
    if (poster.actionUrl) {
      const url = poster.actionUrl.toLowerCase();
      if (url.includes('mock') || url.includes('test') || url.includes('quiz')) {
        if (onNavigateToMockTests) {
          onNavigateToMockTests();
          return;
        }
        if (onOpenGenerator) {
          onOpenGenerator();
          return;
        }
      }
      if (url.includes('bookmark')) {
        if (onNavigateToBookmarks) {
          onNavigateToBookmarks();
          return;
        }
      }
      if (url.includes('current-affairs') || url.includes('affairs') || url.includes('news')) {
        onNavigateToCurrentAffairs();
        return;
      }
      if (url.includes('subscri') || url.includes('plan') || url.includes('offer') || url.includes('pro') || url.includes('checkout')) {
        if (onOpenSubscriptionPlans) onOpenSubscriptionPlans();
        else if (subscriptions.length > 0) onOpenCheckout(subscriptions[0]);
        return;
      }
      if (url.includes('prelim')) {
        setSubjectFilter('prelims');
        return;
      }
      if (url.includes('main')) {
        setSubjectFilter('mains');
        return;
      }
      const matched = syllabusList.find(s => s.id === poster.actionUrl || url.includes(s.id.toLowerCase()));
      if (matched) {
        if (onSelectSubject) onSelectSubject(matched.id);
        else handleStartCard(matched.id);
        return;
      }
    }

    // 3. Intelligent Content Fallback from title, subtitle & badge
    const text = `${poster.title || ''} ${poster.subtitle || ''} ${poster.badge || ''}`.toLowerCase();

    if (text.includes('mock') || text.includes('simulator') || text.includes('grand test') || text.includes('full length')) {
      if (onNavigateToMockTests) {
        onNavigateToMockTests();
        return;
      }
      if (onOpenGenerator) {
        onOpenGenerator();
        return;
      }
    }

    if (text.includes('current affairs') || text.includes('daily quiz') || text.includes('compendium') || text.includes('వర్తమాన')) {
      onNavigateToCurrentAffairs();
      return;
    }

    if (text.includes('subscription') || text.includes('plan') || text.includes('offer') || text.includes('50%') || text.includes('scholarship') || text.includes('pricing') || text.includes('pro')) {
      if (onOpenSubscriptionPlans) {
        onOpenSubscriptionPlans();
      } else if (subscriptions.length > 0) {
        onOpenCheckout(subscriptions[0]);
      }
      return;
    }

    // Subject name matching
    for (const subj of syllabusList) {
      const sName = (subj.name || '').toLowerCase();
      const keywords = sName.split(/[\s,&-]+/).filter(w => w.length >= 3);
      if (text.includes(sName) || keywords.some(k => text.includes(k))) {
        if (onSelectSubject) onSelectSubject(subj.id);
        else handleStartCard(subj.id);
        return;
      }
    }

    // Prelims vs Mains detection
    if (text.includes('prelim') || text.includes('screening') || text.includes('test series') || text.includes('pyqs')) {
      setSubjectFilter('prelims');
      return;
    }

    if (text.includes('main') || text.includes('strategy') || text.includes('mentorship') || text.includes('guidance')) {
      setSubjectFilter('mains');
      return;
    }

    // Default fallback
    setSubjectFilter('prelims');
  };

  const getPosterCtaLabel = (poster: Poster) => {
    if (!poster) return 'Explore Now';
    if (poster.ctaText && poster.ctaText.trim()) return poster.ctaText.trim();
    if (poster.targetType === 'current-affairs') return 'Open Current Affairs';
    if (poster.targetType === 'mock-tests') return 'Attempt Mock Test';
    if (poster.targetType === 'bookmarks') return 'View Bookmarks';
    if (poster.targetType === 'subscription') return 'View Plans & Offers';
    if (poster.targetType === 'prelims') return 'Explore Prelims Syllabus';
    if (poster.targetType === 'mains') return 'Explore Mains Syllabus';
    if (poster.targetType === 'subject') return 'Practice Subject';
    if (poster.targetType === 'url' || (poster.actionUrl && poster.actionUrl.startsWith('http'))) return 'Open Link';

    const text = `${poster.title || ''} ${poster.subtitle || ''} ${poster.badge || ''}`.toLowerCase();
    if (text.includes('mock') || text.includes('simulator') || text.includes('test series')) return 'Attempt Mock Test';
    if (text.includes('current affairs') || text.includes('daily quiz')) return 'Open Current Affairs';
    if (text.includes('subscription') || text.includes('offer') || text.includes('50%') || text.includes('scholarship')) return 'View Plans & Offers';
    if (text.includes('prelim')) return 'Explore Prelims';
    if (text.includes('main')) return 'Explore Mains';
    if (text.includes('polity') || text.includes('constitution') || text.includes('history') || text.includes('economy') || text.includes('geography') || text.includes('science') || text.includes('reasoning')) return 'Start Practice';
    return 'Explore Now';
  };

  return (
    <div className="space-y-6 pb-6 md:pb-8 font-sans">
      
      {/* HEADER BAR (Visible on Home Screen Top Right) */}
      {subjectFilter === 'all' && (
        <div className="flex items-center justify-between px-1">
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-tight">Welcome back!</h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Your Success Partner for {activeApp.name}</p>
          </div>
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative h-11 w-11 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all cursor-pointer group"
          >
            <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow-md border-2 border-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      )}
      
      {/* SUBJECTS SECTION (Shown ONLY when Prelims or Mains is opened) */}
      {subjectFilter !== 'all' ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6 transform-gpu"
        >
          {/* Back Navigation Bar & Gorgeous Banner (Mobile Compact & Native Feel) */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-white shadow-lg bg-gradient-to-br from-orange-500 via-orange-600 to-amber-700 border border-orange-400/40">
            <div className="absolute right-3 top-3 opacity-15 text-6xl sm:text-8xl pointer-events-none">
              {subjectFilter === 'prelims' ? '🎯' : '📖'}
            </div>
            
            <div className="relative z-10 space-y-3 sm:space-y-4">
              <button
                onClick={() => setSubjectFilter('all')}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer w-fit text-white border border-white/25 shadow-xs active:scale-95"
              >
                ← Back to Dashboard
              </button>

              <div className="space-y-1 sm:space-y-1.5 max-w-xl">
                <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 text-white text-[10px] sm:text-[11px] font-black uppercase tracking-widest border border-white/25 inline-block">
                  {subjectFilter === 'prelims' ? 'Screening Test • 150 Marks' : 'Main Examination • 450 Marks'}
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight truncate">
                  {subjectFilter === 'prelims' ? `${examPrefix} Group-2 Prelims Syllabus` : `${examPrefix} Group-2 Mains Syllabus`}
                </h2>
                <p className="text-[11px] sm:text-xs md:text-sm text-slate-100/90 leading-relaxed line-clamp-2">
                  {subjectFilter === 'prelims' 
                    ? 'Explore all high-scoring Prelims subjects loaded with comprehensive units, topic-wise practice, and exam MCQs.' 
                    : 'Explore complete Mains subjects covering AP History, Polity, Economy & Science Technology with structured study units.'}
                </p>
              </div>

              <div className="pt-2 sm:pt-3 border-t border-white/20 flex items-center justify-between text-[11px] sm:text-xs font-bold text-white/90">
                <span>Total Subjects: {filteredSubjects.length}</span>
                <span className="bg-white/20 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full">Interactive Learning Mode</span>
              </div>
            </div>
          </div>

          {/* Subjects Grid with Beautiful Images (Responsive Grids for Phones & Tablets) */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" /> 
                {subjectFilter === 'prelims' ? 'Prelims Subjects Grid' : 'Mains Subjects Grid'} ({filteredSubjects.length})
              </h3>
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full">
                Interactive Grid
              </span>
            </div>

            {filteredSubjects.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                {filteredSubjects.map((subj, idx) => {
                  const subjectImg = getSubjectImage(subj, idx);
                  const cardTheme = getBrightCardTheme(`${subj.id || ''} ${subj.name || ''}`, idx);
                  const units = subj.units || [];
                  const totalTopics = units.reduce((acc, u) => acc + (u?.topics?.length || 0), 0);
                  const totalMcqsDisplay = getSubjectMcqsDisplay(subj, totalTopics);
                  const subjStats = subjectStatsMap[subj.id] || { mcqsCount: 0, setsCount: 0, completionPct: 0 };

                  return (
                    <motion.div
                      key={subj.id}
                      whileHover={{ y: -3, scale: 1.005 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleStartCard(subj.id)}
                      className={`${cardTheme.cardBgClass} rounded-2xl sm:rounded-3xl overflow-hidden border-2 ${cardTheme.borderClass} shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col group relative p-1.5 sm:p-2`}
                    >
                      {/* Prominent Bright Daylight Subject Image — Generous Visibility Without Overlapping Text */}
                      <div className="relative h-56 sm:h-64 md:h-72 w-full overflow-hidden rounded-xl sm:rounded-2xl bg-sky-100 z-10 shrink-0">
                        <SmartCardImage
                          src={subjectImg}
                          alt={subj.name}
                          fallbackLabel={subj.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />

                        {/* Top Bar: PRELIMS/MAINS Badge & Total MCQ Badge */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 z-10">
                          <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-md border ${cardTheme.badgeBgClass} flex items-center gap-1.5`}>
                            <span>🎯</span>
                            <span>{subj.category === 'mains' ? 'MAINS' : subj.category === 'both' ? 'DUAL' : 'PRELIMS'}</span>
                          </span>

                          <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black shadow-md bg-white/95 text-[#1E1B4B] border flex items-center gap-1.5 tracking-tight shrink-0">
                            <span className="text-xs">📝</span>
                            <span className="font-extrabold">{totalMcqsDisplay}</span>
                          </span>
                        </div>
                      </div>

                      {/* Compact Single-Row Bottom Bar Matching Approved Reference Design */}
                      <div className={`px-2 sm:px-3.5 py-2 min-h-[60px] sm:min-h-[68px] relative z-10 flex flex-row items-center justify-between gap-1.5 sm:gap-2.5 ${cardTheme.bodyBgClass} rounded-b-xl sm:rounded-b-2xl shrink-0`}>
                        <div className="min-w-0 flex-1">
                          <div className={`h-1 sm:h-1.5 w-8 sm:w-10 rounded-full bg-gradient-to-r ${cardTheme.accentBarClass} mb-1`} />
                          <h4 className="text-[11px] sm:text-[13px] font-black text-[#1E1B4B] leading-tight line-clamp-2">
                            {subj.name}
                          </h4>
                        </div>

                        <ReferenceStatStrip
                          themeId={cardTheme.id}
                          percentage={subjStats.completionPct}
                          tiles={[
                            { type: 'units', count: units.length, label: 'Units' },
                            { type: 'topics', count: totalTopics, label: 'Topics' },
                            { type: 'sets', count: subjStats.setsCount, label: 'Sets' },
                            { type: 'mcqs', count: subjStats.mcqsCount, label: "MCQ's" },
                          ]}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-3 shadow-2xs">
                <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto text-2xl font-black">
                  📭
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-slate-900">No Subjects Found ({subjectFilter})</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    No subjects found matching this category. You can add subjects anytime in the Admin Panel.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
<>

          {/* Posters & Promotional Banner Section (Touch-Optimized for Mobile, Tablet & Desktop) */}
          <div className="space-y-3 my-3 sm:my-4">
            {appPosters.length > 0 ? (
              <div
                onMouseEnter={() => setIsCarouselHovered(true)}
                onMouseLeave={() => setIsCarouselHovered(false)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    setCurrentPosterIndex((prev) => (prev - 1 + appPosters.length) % appPosters.length);
                  } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    setCurrentPosterIndex((prev) => (prev + 1) % appPosters.length);
                  }
                }}
                className="relative group w-full focus:outline-none focus:ring-2 focus:ring-amber-500/50 rounded-3xl"
                aria-label="Promotional Carousel"
              >
                <div className="relative h-[180px] sm:h-[220px] md:h-[260px] lg:h-[280px] w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-950/20 border border-slate-200/80 dark:border-slate-800 bg-slate-950 select-none">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={currentPosterIndex % appPosters.length}
                      initial={{ opacity: 0, x: 24, scale: 0.99 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -24, scale: 0.99 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 w-full h-full"
                    >
                      {(() => {
                        const activePoster = appPosters[currentPosterIndex % appPosters.length];
                        const ctaText = getPosterCtaLabel(activePoster);
                        const hasFailedImage = !activePoster.imageUrl || failedImages[activePoster.id];
                        
                        return (
                          <div 
                            onClick={() => handlePosterClick(activePoster)}
                            className="w-full h-full relative p-4 sm:p-6 md:p-8 text-white flex flex-col justify-between cursor-pointer touch-manipulation group/banner"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handlePosterClick(activePoster);
                              }
                            }}
                          >
                            {/* Poster Image Background or High-Fidelity Themed Gradient Fallback */}
                            {!hasFailedImage ? (
                              <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                                <img 
                                  src={activePoster.imageUrl} 
                                  alt={activePoster.title} 
                                  referrerPolicy="no-referrer"
                                  onError={() => {
                                    setFailedImages(prev => ({ ...prev, [activePoster.id]: true }));
                                  }}
                                  className="w-full h-full object-cover object-center transform group-hover/banner:scale-105 transition-transform duration-700 ease-out" 
                                />
                                {/* Dual-directional protective gradient overlays for crystal-clear contrast */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/25 sm:bg-gradient-to-r sm:from-slate-950 sm:via-slate-950/70 sm:to-black/30" />
                              </div>
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 pointer-events-none overflow-hidden">
                                {/* Decorative grid pattern and ambient glow */}
                                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
                                <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-500/20 blur-3xl" />
                                <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl" />
                              </div>
                            )}

                            {/* Top Row: Badge & Progress Indicators */}
                            <div className="relative z-10 flex items-start justify-between gap-2">
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/20">
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>{activePoster.badge || 'Featured'}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] sm:text-xs font-black text-white/95 border border-white/20 shadow-md">
                                  {(currentPosterIndex % appPosters.length) + 1} / {appPosters.length}
                                </span>
                              </div>
                            </div>

                            {/* Middle Row: Content Details with Elevated Typography */}
                            <div className="relative z-10 space-y-1.5 sm:space-y-2 max-w-2xl my-auto">
                              <h4 className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-tight">
                                {activePoster.title}
                              </h4>
                              {activePoster.subtitle && (
                                <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed drop-shadow-md line-clamp-2 max-w-xl opacity-95">
                                  {activePoster.subtitle}
                                </p>
                              )}
                            </div>

                            {/* Bottom Row: Slide Dots & Action CTA */}
                            <div className="relative z-10 flex items-center justify-between gap-3 pt-2">
                              {/* Slide Indicator Dots with Touch Clickability */}
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                {appPosters.map((_, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCurrentPosterIndex(idx);
                                    }}
                                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                      (currentPosterIndex % appPosters.length) === idx 
                                        ? 'w-7 sm:w-8 bg-amber-400 shadow-md shadow-amber-400/50' 
                                        : 'w-2 bg-white/40 hover:bg-white/70'
                                    }`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                  />
                                ))}
                              </div>

                              {/* Interactive Call-to-Action Pill */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePosterClick(activePoster);
                                }}
                                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white hover:bg-amber-400 text-slate-950 font-black rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all duration-200 shadow-xl shadow-black/40 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer group-hover/banner:bg-amber-400"
                              >
                                <span>{ctaText}</span>
                                <ArrowRight className="h-4 w-4 transition-transform group-hover/banner:translate-x-1" />
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Left & Right Navigation Arrows */}
                {appPosters.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPosterIndex((prev) => (prev - 1 + appPosters.length) % appPosters.length);
                      }}
                      className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl opacity-75 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer z-20 hover:scale-110 active:scale-95"
                      aria-label="Previous Slide"
                    >
                      <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentPosterIndex((prev) => (prev + 1) % appPosters.length);
                      }}
                      className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl opacity-75 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer z-20 hover:scale-110 active:scale-95"
                      aria-label="Next Slide"
                    >
                      <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              /* Fallback Hero Banner when no posters configured */
              <div 
                onClick={() => setSubjectFilter('prelims')}
                className="relative h-[180px] sm:h-[220px] md:h-[260px] w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-950/20 border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-indigo-950 via-slate-900 to-amber-950 p-4 sm:p-6 md:p-8 text-white flex flex-col justify-between cursor-pointer group"
                role="button"
                tabIndex={0}
              >
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="relative z-10 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>2026 Batch</span>
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-500/30">
                    High-Yield Preparation
                  </span>
                </div>
                <div className="relative z-10 space-y-1 max-w-xl">
                  <h4 className="text-lg sm:text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md">
                    {activeApp?.name || 'Competitive Exams'} Master Hub
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-200 font-medium line-clamp-2">
                    Access complete Prelims & Mains Syllabus, 5,000+ Topic MCQs, and Daily Curated Current Affairs.
                  </p>
                </div>
                <div className="relative z-10 flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <span>⚡ Quick Launch</span>
                  </div>
                  <button
                    type="button"
                    className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all shadow-xl flex items-center gap-2 cursor-pointer group-hover:scale-105"
                  >
                    <span>Start Practice</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SYLLABUS SECTION HEADER */}
          <div className="pt-6 pb-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                    Syllabus Units
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {activeApp.syllabus.length > 0 ? 'Select your exam stage to begin syllabus practice' : 'Custom syllabus structure for this exam'}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {activeApp.syllabus.length > 0 ? `${activeApp.syllabus.length} Subjects` : 'Manual Setup'}
              </span>
            </div>
          </div>

          {/* PRELIMS & MAINS QUICK ACTION CARDS & ALL SUBJECTS GRID */}
          {syllabusList.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-dashed border-slate-300 text-center space-y-4 shadow-sm">
              <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto text-2xl font-black">
                📚
              </div>
              <div className="space-y-1.5 max-w-lg mx-auto">
                <h4 className="text-lg font-black text-slate-900">Syllabus Not Configured Yet</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  No syllabus structure is present for <span className="font-bold text-slate-800">{activeApp?.name || 'this exam'}</span>. You can manually design subjects, units, topics, and MCQs separately for this exam in the Admin Panel.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={onNavigateToCurrentAffairs}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Explore Current Affairs
                </button>
                {onOpenSubscriptionPlans && (
                  <button
                    onClick={onOpenSubscriptionPlans}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    View Subscription Plans
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {subjectFilter === 'all' ? (
                /* Dual Gateways: Prelims & Mains Quick Action Cards on Home Screen */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                  <div 
                    onClick={() => setSubjectFilter('prelims')}
                    className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-700 text-white shadow-md cursor-pointer border border-orange-400/40 hover:scale-[1.01] transition-all group"
                  >
                    <div className="absolute right-2.5 top-2.5 opacity-20 text-4xl sm:text-5xl group-hover:scale-110 transition-transform">🎯</div>
                    <div className="relative z-10 space-y-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-orange-50 text-[10px] font-bold uppercase tracking-wider border border-white/25">
                        Screening Test (150 Marks)
                      </span>
                      <h3 className="text-lg sm:text-xl font-black">{examPrefix} PRELIMS</h3>
                      <div className="h-1 w-12 bg-gradient-to-r from-amber-200 to-yellow-300 rounded-full shadow-xs"></div>
                      <p className="text-xs text-orange-50 leading-relaxed">
                        General Studies & Mental Ability. Tap to view all Prelims subjects & practice sets.
                      </p>
                    </div>
                    <div className="relative z-10 mt-4 flex items-center justify-between pt-2.5 border-t border-white/20">
                      <span className="text-xs font-bold text-orange-100">
                        {syllabusList.filter(s => s && (s.category === 'prelims' || s.category === 'both' || !s.category)).length} Subjects
                      </span>
                      <span className="px-3 py-1.5 bg-white text-orange-950 font-black rounded-xl text-xs flex items-center gap-1 shadow-xs group-hover:bg-amber-100 transition-colors">
                        Open Prelims <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>

                  <div 
                    onClick={() => setSubjectFilter('mains')}
                    className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-amber-600 via-orange-700 to-orange-800 text-white shadow-md cursor-pointer border border-orange-500/40 hover:scale-[1.01] transition-all group"
                  >
                    <div className="absolute right-2.5 top-2.5 opacity-20 text-4xl sm:text-5xl group-hover:scale-110 transition-transform">📖</div>
                    <div className="relative z-10 space-y-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-orange-50 text-[10px] font-bold uppercase tracking-wider border border-white/25">
                        Main Examination (450 Marks)
                      </span>
                      <h3 className="text-lg sm:text-xl font-black">{examPrefix} MAINS</h3>
                      <div className="h-1 w-12 bg-gradient-to-r from-amber-200 to-yellow-300 rounded-full shadow-xs"></div>
                      <p className="text-xs text-orange-50 leading-relaxed">
                        Core subjects, history, polity, economy, science & technology units. Tap to view Mains subjects.
                      </p>
                    </div>
                    <div className="relative z-10 mt-4 flex items-center justify-between pt-2.5 border-t border-white/20">
                      <span className="text-xs font-bold text-orange-100">
                        {syllabusList.filter(s => s && (s.category === 'mains' || s.category === 'both')).length} Subjects
                      </span>
                      <span className="px-3 py-1.5 bg-white text-orange-950 font-black rounded-xl text-xs flex items-center gap-1 shadow-xs group-hover:bg-amber-100 transition-colors">
                        Open Mains <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>

                  {/* Mock Test Series Gateway Card */}
                  <div 
                    onClick={() => onNavigateToMockTests?.()}
                    className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-sky-600 via-indigo-600 to-violet-700 text-white shadow-md cursor-pointer border border-sky-400/50 hover:scale-[1.01] transition-all group col-span-1 sm:col-span-2"
                  >
                    <div className="absolute right-4 top-3 opacity-20 text-5xl sm:text-6xl group-hover:scale-110 transition-transform">🏆</div>
                    <div className="relative z-10 space-y-2 max-w-xl">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-300 text-[#1E1B4B] text-[10px] font-black uppercase tracking-wider shadow-2xs">
                        ⚡ Mock Test Simulator
                      </span>
                      <h3 className="text-lg sm:text-2xl font-black">{examPrefix} Grand Mock Test Series</h3>
                      <div className="h-1 w-16 bg-gradient-to-r from-amber-300 to-yellow-200 rounded-full shadow-xs"></div>
                      <p className="text-xs sm:text-sm text-sky-50 leading-relaxed font-medium">
                        Generate custom full-length, subject-wise, or current affairs mock tests with real negative marking rules, timer, and detailed solution reviews.
                      </p>
                    </div>
                    <div className="relative z-10 mt-4 flex items-center justify-between pt-2.5 border-t border-white/25">
                      <span className="text-xs font-bold text-amber-200 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Full-Length, Subject & Monthly CA Tests
                      </span>
                      <div className="flex items-center gap-2">
                        {onOpenGenerator && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onOpenGenerator(); }}
                            className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-[#1E1B4B] font-black rounded-xl text-xs shadow-md transition-all active:scale-95"
                          >
                            Generate Test ⚡
                          </button>
                        )}
                        <span className="px-3.5 py-1.5 bg-white text-[#1E1B4B] font-black rounded-xl text-xs flex items-center gap-1 shadow-xs group-hover:bg-amber-100 transition-colors">
                          Open Test Series <ChevronRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              ) : (
                /* Inside Prelims or Mains View - Display Header & Filtered Subject Cards */
                <div className="space-y-4 pt-1">
                  {/* Category Section Bar with Back Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSubjectFilter('all')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Home</span>
                      </button>
                      <div>
                        <h4 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                          <span>{subjectFilter === 'prelims' ? '🎯' : '📖'}</span>
                          <span>{examPrefix} {String(subjectFilter).toUpperCase()} Subjects</span>
                        </h4>
                        <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                          Showing {filteredSubjects.length} subjects for {subjectFilter === 'prelims' ? 'Prelims Examination' : 'Mains Examination'}
                        </p>
                      </div>
                    </div>

                    {/* Filter Launch Pills */}
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                      <button
                        onClick={() => setSubjectFilter('prelims')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          subjectFilter === 'prelims' 
                            ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-xs' 
                            : 'bg-transparent text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Prelims ({syllabusList.filter(s => s && (s.category === 'prelims' || s.category === 'both' || !s.category)).length})
                      </button>
                      <button
                        onClick={() => setSubjectFilter('mains')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          subjectFilter === 'mains' 
                            ? 'bg-gradient-to-r from-amber-600 to-orange-700 text-white shadow-xs' 
                            : 'bg-transparent text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Mains ({syllabusList.filter(s => s && (s.category === 'mains' || s.category === 'both')).length})
                      </button>
                    </div>
                  </div>

                  {/* Multi-Column Subject Cards Grid */}
                  {filteredSubjects.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                      {filteredSubjects.map((subj, idx) => {
                        const subjectImg = getSubjectImage(subj, idx);
                        const cardTheme = getBrightCardTheme(`${subj.id || ''} ${subj.name || ''}`, idx);
                        const units = subj.units || [];
                        const totalTopics = units.reduce((acc, u) => acc + (u?.topics?.length || 0), 0);
                        const totalMcqsDisplay = getSubjectMcqsDisplay(subj, totalTopics);
                        const subjStats = subjectStatsMap[subj.id] || { mcqsCount: 0, setsCount: 0, completionPct: 0 };

                        return (
                          <motion.div
                            key={subj.id}
                            whileHover={{ y: -3, scale: 1.005 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleStartCard(subj.id)}
                            className={`${cardTheme.cardBgClass} rounded-2xl sm:rounded-3xl overflow-hidden border-2 ${cardTheme.borderClass} shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col group relative p-1.5 sm:p-2`}
                          >
                            {/* Prominent Bright Daylight Subject Image — Generous Visibility Without Overlapping Text */}
                            <div className="relative h-56 sm:h-64 md:h-72 w-full overflow-hidden rounded-xl sm:rounded-2xl bg-sky-100 z-10 shrink-0">
                              <SmartCardImage
                                src={subjectImg}
                                alt={subj.name}
                                fallbackLabel={subj.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              />

                              {/* Top Bar: PRELIMS/MAINS Badge & Total MCQ Badge */}
                              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 z-10">
                                <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-md border ${cardTheme.badgeBgClass} flex items-center gap-1.5`}>
                                  <span>🎯</span>
                                  <span>{subj.category === 'mains' ? 'MAINS' : subj.category === 'both' ? 'DUAL' : 'PRELIMS'}</span>
                                </span>

                                <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black shadow-md bg-white/95 text-[#1E1B4B] border flex items-center gap-1.5 tracking-tight shrink-0">
                                  <span className="text-xs">📝</span>
                                  <span className="font-extrabold">{totalMcqsDisplay}</span>
                                </span>
                              </div>
                            </div>

                            {/* Compact Single-Row Bottom Bar Matching Approved Reference Design */}
                            <div className={`px-2 sm:px-3.5 py-2 min-h-[60px] sm:min-h-[68px] relative z-10 flex flex-row items-center justify-between gap-1.5 sm:gap-2.5 ${cardTheme.bodyBgClass} rounded-b-xl sm:rounded-b-2xl shrink-0`}>
                              <div className="min-w-0 flex-1">
                                <div className={`h-1 sm:h-1.5 w-8 sm:w-10 rounded-full bg-gradient-to-r ${cardTheme.accentBarClass} mb-1`} />
                                <h4 className="text-[11px] sm:text-[13px] font-black text-[#1E1B4B] leading-tight line-clamp-2">
                                  {subj.name}
                                </h4>
                              </div>

                              <ReferenceStatStrip
                                themeId={cardTheme.id}
                                percentage={subjStats.completionPct}
                                tiles={[
                                  { type: 'units', count: units.length, label: 'Units' },
                                  { type: 'topics', count: totalTopics, label: 'Topics' },
                                  { type: 'sets', count: subjStats.setsCount, label: 'Sets' },
                                  { type: 'mcqs', count: subjStats.mcqsCount, label: "MCQ's" },
                                ]}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl p-8 text-center space-y-3 border border-slate-200 shadow-xs my-4">
                      <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl font-black">
                        📚
                      </div>
                      <h4 className="text-sm font-black text-slate-800">No subjects available in {String(subjectFilter).toUpperCase()}</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                        Check back soon or switch category tabs to view available units.
                      </p>
                      <button
                        onClick={() => setSubjectFilter('all')}
                        className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
                      >
                        Return to Home Screen
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PREMIUM CURRENT AFFAIRS CARD BANNER (Vibrant emerald/teal daylight luxury theme) */}
          <div 
            onClick={onNavigateToCurrentAffairs}
            className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 sm:p-8 text-white shadow-xl cursor-pointer border-2 border-emerald-400/60 hover:scale-[1.01] transition-all group mt-6 mb-4"
          >
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-25 pointer-events-none">
              <img src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80" alt="Current Affairs" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/25 border border-white/40 text-amber-100 text-[10px] font-black uppercase tracking-wider">
                  <span>⚡</span> Premium Feature • Updated Daily
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white group-hover:underline">
                  Current Affairs Center
                </h3>
                {/* Premium Accent Line */}
                <div className="h-1.5 w-16 bg-gradient-to-r from-amber-200 to-yellow-300 rounded-full shadow-sm"></div>
                <p className="text-xs sm:text-sm text-emerald-50 max-w-xl font-medium leading-relaxed">
                  Explore Month-wise & Year-wise current affairs compendiums, {examPrefix} exam alerts, economic survey PDFs, and high-yield study briefs.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2 bg-[#FFF8E7] text-[#1E1B4B] px-5 py-3 rounded-2xl font-black text-xs shadow-lg group-hover:bg-[#FFF1CC] transition-colors">
                <span>Explore Archive</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Notifications Modal */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[95vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black">Push Notifications & Announcements</h3>
                  <p className="text-[11px] text-slate-400">{activeApp.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-3 bg-slate-50">
              {notificationsList.map((n) => (
                <div key={n.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md uppercase font-black">{n.type || 'Announcement'}</span>
                    <span>{n.time || 'Just now'}</span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900">{n.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message || 'Important update regarding your preparation and syllabus schedule.'}</p>
                </div>
              ))}
              {notificationsList.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">No notifications available.</div>
              )}
            </div>

            <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End of Home Modules */}
    </div>
  );
}
