import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { Question, AppConfig } from '../types';
import { 
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ArrowLeft, RotateCcw, 
  Award, Sparkles, BarChart3, CheckCircle, 
  XCircle, CheckCircle2, Check, HelpCircle, CheckCheck, 
  Layers, ArrowRight, Trophy, Target, AlertCircle, PlayCircle,
  Maximize2, Minimize2, Flag, Volume2, VolumeX, Edit3, SkipForward,
  Info, Clock, Languages, X, Type, Grid3X3,
  Smartphone, Tablet, Laptop, Monitor,
  BookOpen, Eye, EyeOff, Rotate3d,
  Bookmark, BookmarkCheck
} from 'lucide-react';
import { isBookmarked, toggleBookmarkMCQ, fetchBookmarks } from '../services/bookmarkService';
import { savePracticeResultToFirestore } from '../lib/firebase';
import { BookmarkItem } from '../types';
import MathText from './MathText';
import PremiumResultScreen from './PremiumResultScreen';
import ScratchpadModal from './ScratchpadModal';
import { useMcqFontSize } from '../lib/mcqFontStore';
import { McqFontControls } from './McqFontControls';
import { 
  getSavedFontSettings, 
  FontSettings, 
  FONT_PRESETS 
} from '../lib/fontSettings';
import { useMcqAppearance } from '../lib/mcqAppearanceStore';
import { 
  getSavedMotionConfig, 
  saveMotionConfig, 
  getQuestionMotionVariants, 
  PracticeMotionConfig 
} from '../utils/practiceMotion';
import { perfMonitor } from '../utils/performanceMonitor';
import PracticeMotionModal from './PracticeMotionModal';

interface PracticeArenaProps {
  activeApp: AppConfig;
  subjectId: string;
  unitId: string;
  topicId: string;
  subtopic?: string;
  setId?: number;
  setName?: string;
  customQuestions?: Question[];
  questions: Question[];
  practiceMode?: 'sets' | 'subtopics';
  onBackToHome: () => void;
  onSelectSubtopic?: (subjectId: string, unitId: string, topicId: string, subtopic: string) => void;
  onSelectSet?: (subjectId: string, unitId: string, topicId: string, setId: number, setName: string, questionList?: Question[]) => void;
  onOpenSettings?: () => void;
  selectedLanguage: string;
}

export type FocusBgTheme = 'warm-espresso' | 'soft-sepia' | 'midnight-indigo' | 'pure-dark';

export type ScreenSize = 'small' | 'medium' | 'large' | 'xl';

export interface ScreenSizeConfig {
  id: ScreenSize;
  label: string;
  shortLabel: string;
  desc: string;
  widthDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  containerClass: string;
  cardPaddingClass: string;
  questionBoxPaddingClass: string;
  questionBoxMinHeightClass: string;
  questionTextClass: string;
  optionPaddingClass: string;
  optionTextClass: string;
  optionLetterClass: string;
  explanationPaddingClass: string;
  navButtonClass: string;
}

export const SCREEN_SIZE_CONFIGS: Record<ScreenSize, ScreenSizeConfig> = {
  small: {
    id: 'small',
    label: 'Small',
    shortLabel: 'S',
    desc: 'Compact phone-width layout',
    widthDesc: 'Max 576px',
    icon: Smartphone,
    containerClass: 'max-w-lg md:max-w-xl',
    cardPaddingClass: 'p-2 sm:p-3',
    questionBoxPaddingClass: 'px-3 py-2.5 sm:px-4 sm:py-3',
    questionBoxMinHeightClass: 'min-h-[42px] sm:min-h-[52px]',
    questionTextClass: 'text-xs sm:text-sm font-bold',
    optionPaddingClass: 'px-2.5 py-1.5 sm:px-3 sm:py-2',
    optionTextClass: 'text-xs sm:text-sm',
    optionLetterClass: 'text-xs sm:text-sm font-black',
    explanationPaddingClass: 'p-2.5 sm:p-3.5',
    navButtonClass: 'min-w-[80px] px-3 py-1.5 sm:py-2 text-xs',
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    shortLabel: 'M',
    desc: 'Standard tablet-width layout',
    widthDesc: 'Max 768px',
    icon: Tablet,
    containerClass: 'max-w-2xl lg:max-w-3xl',
    cardPaddingClass: 'p-2.5 sm:p-3.5',
    questionBoxPaddingClass: 'px-3.5 py-3 sm:px-4.5 sm:py-3.5',
    questionBoxMinHeightClass: 'min-h-[48px] sm:min-h-[60px]',
    questionTextClass: 'text-xs sm:text-sm md:text-base font-bold',
    optionPaddingClass: 'px-3 py-1.5 sm:px-3.5 sm:py-2',
    optionTextClass: 'text-xs sm:text-sm md:text-base',
    optionLetterClass: 'text-xs sm:text-sm font-black',
    explanationPaddingClass: 'p-3 sm:p-4',
    navButtonClass: 'min-w-[95px] px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm',
  },
  large: {
    id: 'large',
    label: 'Large',
    shortLabel: 'L',
    desc: 'Roomy desktop-width layout',
    widthDesc: 'Max 1720px',
    icon: Laptop,
    containerClass: 'max-w-4xl xl:max-w-5xl',
    cardPaddingClass: 'p-3.5 sm:p-4.5 lg:p-5',
    questionBoxPaddingClass: 'px-4 py-3.5 sm:px-6 sm:py-4',
    questionBoxMinHeightClass: 'min-h-[60px] sm:min-h-[75px]',
    questionTextClass: 'text-sm sm:text-base lg:text-lg font-bold',
    optionPaddingClass: 'px-3.5 py-2 sm:px-4 sm:py-2.5',
    optionTextClass: 'text-sm sm:text-base',
    optionLetterClass: 'text-sm sm:text-base font-black',
    explanationPaddingClass: 'p-3.5 sm:p-4.5',
    navButtonClass: 'min-w-[110px] px-4 py-2 sm:py-2.5 text-sm',
  },
  xl: {
    id: 'xl',
    label: 'XL',
    shortLabel: 'XL',
    desc: 'Expansive widescreen presentation',
    widthDesc: 'Max 1800px+',
    icon: Monitor,
    containerClass: 'max-w-5xl 2xl:max-w-[1600px]',
    cardPaddingClass: 'p-4 sm:p-5 lg:p-6',
    questionBoxPaddingClass: 'px-5 py-4 sm:px-7 sm:py-5',
    questionBoxMinHeightClass: 'min-h-[70px] sm:min-h-[85px]',
    questionTextClass: 'text-base sm:text-lg lg:text-xl font-bold',
    optionPaddingClass: 'px-4 py-2.5 sm:px-5 sm:py-3',
    optionTextClass: 'text-base sm:text-lg',
    optionLetterClass: 'text-base sm:text-lg font-black',
    explanationPaddingClass: 'p-4 sm:p-5',
    navButtonClass: 'min-w-[120px] px-5 py-2.5 text-sm sm:text-base',
  },
};

// Helper to scroll safely inside iframes without throwing errors
const safeScrollToTop = () => {
  try {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  } catch (e) {
    try {
      window.scrollTo(0, 0);
    } catch (err) {
      // ignore
    }
  }
};

// Celebratory balloon blasting & confetti burst animation manager for correct MCQ options
// Guaranteed: Starts immediately on selection, automatically disappears after exactly 1.5s (1500ms),
// cleanups on navigation/unmount, prevents overlapping animations and remnants.
export class RightAnswerBurstManager {
  private static subBurstTimer: any = null;
  private static cleanupTimer: any = null;

  static stopAndClean() {
    if (this.subBurstTimer) {
      clearTimeout(this.subBurstTimer);
      this.subBurstTimer = null;
    }
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    try {
      const activeConfetti = typeof confetti === 'function' ? confetti : (confetti as any)?.default;
      if (activeConfetti && typeof activeConfetti.reset === 'function') {
        activeConfetti.reset();
      }
    } catch (e) {
      // ignore
    }
  }

  static trigger(eventOrX?: React.MouseEvent | number, clientYParam?: number) {
    // 1. Immediately cancel any active animation or timers to prevent overlap or lingering
    this.stopAndClean();

    // 2. Start exact 1.5s (1500ms) timer immediately when the user selects the correct option
    this.cleanupTimer = setTimeout(() => {
      RightAnswerBurstManager.stopAndClean();
    }, 1500);

    try {
      let originX = 0.5;
      let originY = 0.6;
      if (typeof window !== 'undefined') {
        const x = typeof eventOrX === 'number' ? eventOrX : (eventOrX as React.MouseEvent)?.clientX;
        const y = typeof clientYParam === 'number' ? clientYParam : (eventOrX as React.MouseEvent)?.clientY;
        if (typeof x === 'number' && typeof y === 'number' && !isNaN(x) && !isNaN(y)) {
          originX = Math.max(0.1, Math.min(0.9, x / window.innerWidth));
          originY = Math.max(0.1, Math.min(0.9, y / window.innerHeight));
        }
      }

      const activeConfetti = typeof confetti === 'function' ? confetti : (confetti as any)?.default;
      if (!activeConfetti || typeof activeConfetti !== 'function') return;

      // 1. Vibrant balloon pop burst (Existing design & visual effects preserved)
      activeConfetti({
        particleCount: 65,
        spread: 75,
        origin: { x: originX, y: originY },
        colors: ['#10b981', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#fbbf24', '#f43f5e'],
        scalar: 1.25,
        shapes: ['circle', 'square'],
        ticks: 200,
        gravity: 0.85,
        startVelocity: 32,
      });

      // 2. Twin upward balloon burst fireworks (Tracked with subBurstTimer)
      this.subBurstTimer = setTimeout(() => {
        try {
          activeConfetti({
            particleCount: 35,
            angle: 60,
            spread: 60,
            origin: { x: Math.max(0.05, originX - 0.1), y: originY },
            colors: ['#34d399', '#38bdf8', '#fb923c', '#e879f9'],
            scalar: 1.1,
          });
          activeConfetti({
            particleCount: 35,
            angle: 120,
            spread: 60,
            origin: { x: Math.min(0.95, originX + 0.1), y: originY },
            colors: ['#4ade80', '#a855f7', '#f43f5e', '#facc15'],
            scalar: 1.1,
          });
        } catch (e) {}
      }, 120);
    } catch (err) {
      // ignore
    }
  }
}

// Backward-compatible trigger function
const triggerBalloonBlast = (eventOrX?: React.MouseEvent | number, clientYParam?: number) => {
  RightAnswerBurstManager.trigger(eventOrX, clientYParam);
};

import { normalizeSingleQuestion, deduplicateQuestionOptions } from '../lib/questionParser';

const formatTimer = (totalSeconds: number) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const PracticeTimerDisplay = React.memo(({ isSubmitted }: { isSubmitted: boolean }) => {
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setSecs(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted]);

  return (
    <span className="bg-[var(--bg-secondary)] text-[var(--text-primary)] px-1.5 sm:px-2 py-0.5 rounded-md border border-[var(--card-border)] flex items-center gap-0.5 text-xs sm:text-sm font-mono font-bold">
      <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
      {formatTimer(secs)}
    </span>
  );
});

const QUESTIONS_PER_SET = 10; // Exactly 10 MCQs per set to match SubtopicsView.tsx

// Helper to normalize any incoming question into a guaranteed valid Question object
function normalizeQuestion(q: any, fallbackIndex: number, fallbackTopic: string, fallbackSubtopic: string): Question {
  return normalizeSingleQuestion(q, fallbackIndex, fallbackTopic, fallbackSubtopic);
}

// Helper to deduplicate options and randomly shuffle options (A, B, C, D) for each question and remap correctOption accurately
function shuffleQuestionOptions(q: Question): Question {
  if (!q || !q.options) return q;

  // 1. Remove duplicate options from question and preserve correctOption mapping
  const rawCorrect = ((q.correctOption || 'A') as 'A' | 'B' | 'C' | 'D');
  const { options: dedupedOptions, correctOption: dedupedCorrect } = deduplicateQuestionOptions(q.options, rawCorrect);

  const validKeys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

  // Find all keys that actually have non-empty unique option text
  const availableKeys = validKeys.filter(
    k => dedupedOptions[k] !== undefined && dedupedOptions[k] !== null && String(dedupedOptions[k]).trim() !== ''
  );

  if (availableKeys.length <= 1) {
    return {
      ...q,
      options: dedupedOptions,
      correctOption: dedupedCorrect
    };
  }

  // Create an array of { originalKey, text }
  const optionEntries = availableKeys.map(k => ({
    originalKey: k,
    text: dedupedOptions[k]
  }));

  // Fisher-Yates shuffle algorithm on unique options
  for (let i = optionEntries.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = optionEntries[i];
    optionEntries[i] = optionEntries[j];
    optionEntries[j] = temp;
  }

  const newOptions: { A: string; B: string; C: string; D: string } = {
    A: '',
    B: '',
    C: '',
    D: ''
  };

  let newCorrectOption: 'A' | 'B' | 'C' | 'D' = 'A';

  availableKeys.forEach((key, index) => {
    const entry = optionEntries[index];
    newOptions[key] = entry.text;
    if (entry.originalKey === dedupedCorrect) {
      newCorrectOption = key;
    }
  });

  return {
    ...q,
    options: newOptions,
    correctOption: newCorrectOption
  };
}

export default function PracticeArena({
  activeApp,
  subjectId,
  unitId,
  topicId,
  subtopic = '',
  setId,
  setName,
  customQuestions,
  questions,
  practiceMode,
  onBackToHome,
  onSelectSubtopic,
  onSelectSet,
  onOpenSettings,
  selectedLanguage,
}: PracticeArenaProps) {
  // MCQ Font Size scaling style hook
  const { scaledTextStyle } = useMcqFontSize();
  // MCQ Appearance customization hook
  const { settings: appearance } = useMcqAppearance();

  // Session random seed to regenerate shuffled options on new sessions/retries
  const [sessionSeed, setSessionSeed] = useState<number>(() => Date.now());

  // Retrieve metadata
  const currentSubject = activeApp?.syllabus?.find(s => s.id === subjectId);
  const subjName = currentSubject ? currentSubject.name : 'Practice Subject';
  const unitObj = currentSubject?.units?.find(u => u.id === unitId);
  const topicObj = unitObj?.topics?.find(t => t.id === topicId) || currentSubject?.units?.flatMap(u => u.topics || []).find(t => t?.id === topicId);
  const topicName = topicObj ? topicObj.name : '';
  const isSetMode = practiceMode ? practiceMode === 'sets' : (!!setId || !!setName);
  const activeTitle = setName || subtopic || (setId ? `Set ${setId}` : 'Practice Arena');

  // Strict filtering: match appId, subjectId and language preference
  const appQuestions = useMemo(() => {
    return (questions || []).filter(q => 
      q && 
      q.appId === activeApp?.id && 
      (q.language === selectedLanguage || (!q.language && selectedLanguage === 'en'))
    );
  }, [questions, activeApp?.id, selectedLanguage]);

  const subjectFiltered = useMemo(() => {
    return subjectId 
      ? appQuestions.filter(q => q.subjectId === subjectId)
      : appQuestions;
  }, [appQuestions, subjectId]);

  const examPrefix = activeApp?.name?.includes('TSPSC') || activeApp?.stateId === 'telangana' ? 'TSPSC' : 'APPSC';

  // Determine active questions strictly scoped to this Subject -> Unit -> Topic hierarchy
  const activeQuestions = useMemo<Question[]>(() => {
    let resultList: any[] = [];

    if (customQuestions && Array.isArray(customQuestions) && customQuestions.length > 0) {
      resultList = customQuestions;
    } else if (isSetMode && (setName || setId)) {
      // Get questions belonging strictly to this topic
      const topicQ = subjectFiltered.filter(q => 
        q && 
        q.subjectId === subjectId && 
        (unitId ? q.unitId === unitId : true) &&
        (topicId ? q.topicId === topicId : true)
      );
      if (setName) {
        const namedQ = topicQ.filter(q => q.setName && q.setName.trim().toLowerCase() === setName.trim().toLowerCase());
        if (namedQ.length > 0) resultList = namedQ;
      }
      if (resultList.length === 0 && setId) {
        const withoutNamed = topicQ.filter(q => !q.setName);
        const pool = withoutNamed.length > 0 ? withoutNamed : topicQ;
        const start = (setId - 1) * QUESTIONS_PER_SET;
        const end = start + QUESTIONS_PER_SET;
        const sliced = pool.slice(start, end);
        if (sliced.length > 0) resultList = sliced;
      }
    } else if (subtopic && subtopic.trim()) {
      // Subtopic filtering - ONLY match questions bound strictly to this topic and subtopic
      const normalizedSubtopic = subtopic.trim().toLowerCase();
      const matched = subjectFiltered.filter(q => {
        if (!q) return false;
        if (q.subjectId !== subjectId) return false;
        if (unitId && q.unitId && q.unitId !== unitId) return false;
        if (topicId && q.topicId && q.topicId !== topicId) return false;
        const qs = String(q.subtopic || q.subtopicId || '').trim().toLowerCase();
        return qs === normalizedSubtopic || qs.includes(normalizedSubtopic) || normalizedSubtopic.includes(qs);
      });
      if (matched.length > 0) resultList = matched;
    } else if (topicId) {
      // Topic level filtering - ONLY match questions bound strictly to this topicId
      const topicMatched = subjectFiltered.filter(q => {
        if (!q) return false;
        if (q.subjectId !== subjectId) return false;
        if (unitId && q.unitId && q.unitId !== unitId) return false;
        return q.topicId === topicId;
      });
      if (topicMatched.length > 0) resultList = topicMatched;
    } else if (unitId) {
      // Unit level filtering (only when no topicId specified)
      const unitMatched = subjectFiltered.filter(q => q && q.subjectId === subjectId && q.unitId === unitId);
      if (unitMatched.length > 0) resultList = unitMatched;
    } else if (subjectId) {
      // Subject level filtering (only when opened for entire subject)
      const subjMatched = subjectFiltered.filter(q => q && q.subjectId === subjectId);
      if (subjMatched.length > 0) resultList = subjMatched;
    }

    if (resultList.length === 0) {
      resultList = [];
    }

    // Normalize and shuffle options for every question in this practice session
    return resultList.map((q, idx) => {
      const normalized = normalizeQuestion(q, idx, topicName, subtopic || activeTitle);
      return shuffleQuestionOptions(normalized);
    });
  }, [customQuestions, isSetMode, setId, setName, subjectFiltered, topicId, subtopic, activeApp?.id, subjectId, unitId, topicName, activeTitle, subjName, sessionSeed]);

  const storageKey = isSetMode
    ? (setName
        ? `exam_practice_set_${activeApp?.id || 'default'}_${subjectId || 'subj'}_${unitId || 'u'}_${topicId || 't'}_setName_${setName}`
        : `exam_practice_set_${activeApp?.id || 'default'}_${subjectId || 'subj'}_${unitId || 'u'}_${topicId || 't'}_set_${setId || 1}`)
    : `exam_practice_${activeApp?.id || 'default'}_${subjectId || 'subj'}_${unitId || 'u'}_${topicId || 't'}_${subtopic || 'default'}`;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);

  // Flagged questions state
  const flagStorageKey = `flagged_questions_${activeApp?.id || 'default'}`;
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, { questionText?: string; subtopic?: string; reason: string; note: string; timestamp: number }>>(() => {
    try {
      const raw = localStorage.getItem(flagStorageKey);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  });

  // Bookmarks state
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    fetchBookmarks('default_user_1', activeApp?.id).then((bList) => {
      if (bList) setBookmarks(bList);
    });
  }, [activeApp?.id]);

  const handleToggleBookmarkCurrent = async () => {
    if (!currentQ) return;
    const { updatedBookmarks } = await toggleBookmarkMCQ({
      userId: 'default_user_1',
      appId: activeApp?.id || 'default',
      question: currentQ,
      currentBookmarks: bookmarks,
      appConfig: activeApp
    });
    setBookmarks(updatedBookmarks);
  };

  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('Ambiguous / Confusing Options');
  const [flagNote, setFlagNote] = useState('');
  const [flagSuccessToast, setFlagSuccessToast] = useState(false);

  const [focusBgTheme, setFocusBgTheme] = useState<FocusBgTheme>(() => {
    try {
      const saved = localStorage.getItem('mcq_focus_bg_theme') as FocusBgTheme;
      if (['warm-espresso', 'soft-sepia', 'midnight-indigo', 'pure-dark'].includes(saved)) {
        return saved;
      }
    } catch (e) {}
    return 'warm-espresso';
  });

  const handleSetFocusBgTheme = (theme: FocusBgTheme) => {
    setFocusBgTheme(theme);
    try {
      localStorage.setItem('mcq_focus_bg_theme', theme);
    } catch (e) {}
  };

  const isFocusReadingMode = false;
  const toggleFocusReadingMode = () => {};

  // Keyboard shortcut listener for Focus Reading Mode (Esc key to exit)
  useEffect(() => {
    // Focus Reading Mode removed
  }, []);

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [slideDir, setSlideDir] = useState<number>(1);

  // Dynamic Font and Language Settings with Real-Time Event Synchronization
  const [fontSettings, setFontSettings] = useState<FontSettings>(getSavedFontSettings);

  useEffect(() => {
    const handleSettingsChange = (e: any) => {
      if (e?.detail) {
        setFontSettings(e.detail);
      } else {
        setFontSettings(getSavedFontSettings());
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'aspirant_font_settings') {
        setFontSettings(getSavedFontSettings());
      }
    };

    window.addEventListener('aspirant_font_settings_changed' as any, handleSettingsChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('aspirant_font_settings_changed' as any, handleSettingsChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  // New features matching screenshot

  const [isExplanationCollapsed, setIsExplanationCollapsed] = useState(false);

  // Motion & 3D Flashcard Settings
  const [motionConfig, setMotionConfig] = useState<PracticeMotionConfig>(getSavedMotionConfig);
  const [isMotionModalOpen, setIsMotionModalOpen] = useState<boolean>(false);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);

  useEffect(() => {
    const handleMotionChange = (e: any) => {
      if (e?.detail) {
        setMotionConfig(e.detail);
      } else {
        setMotionConfig(getSavedMotionConfig());
      }
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'aspirant_practice_motion_config') {
        setMotionConfig(getSavedMotionConfig());
      }
    };
    window.addEventListener('aspirant_practice_motion_changed' as any, handleMotionChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('aspirant_practice_motion_changed' as any, handleMotionChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Screen View Size Setting (Small, Medium, Large, XL)
  const [screenSize, setScreenSize] = useState<ScreenSize>(() => {
    try {
      const saved = localStorage.getItem('mcq_screen_size_mode');
      if (saved && ['small', 'medium', 'large', 'xl'].includes(saved)) {
        return saved as ScreenSize;
      }
    } catch (e) {
      // ignore
    }
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 'small';
      if (window.innerWidth < 1024) return 'medium';
    }
    return 'large';
  });

  const handleSelectScreenSize = (size: ScreenSize) => {
    setScreenSize(size);
    try {
      localStorage.setItem('mcq_screen_size_mode', size);
      window.dispatchEvent(new CustomEvent('mcq_screen_size_changed', { detail: size }));
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    const handleScreenSizeChange = (e: any) => {
      if (e?.detail && ['small', 'medium', 'large', 'xl'].includes(e.detail)) {
        setScreenSize(e.detail as ScreenSize);
      }
    };

    window.addEventListener('mcq_screen_size_changed' as any, handleScreenSizeChange);
    return () => {
      window.removeEventListener('mcq_screen_size_changed' as any, handleScreenSizeChange);
    };
  }, []);

  const currentScreenConfig = SCREEN_SIZE_CONFIGS[screenSize] || SCREEN_SIZE_CONFIGS.large;

  // Reset flashcard side on index change, and clean up any active burst animation
  useEffect(() => {
    RightAnswerBurstManager.stopAndClean();
    setIsExplanationCollapsed(false);
    setIsCardFlipped(false);

  }, [currentIdx]);

  // Clean up burst animation timers and particles when leaving screen / unmounting
  useEffect(() => {
    return () => {
      RightAnswerBurstManager.stopAndClean();
    };
  }, []);

  // Clean up burst animation timers and particles on test submission
  useEffect(() => {
    if (isTestSubmitted) {
      RightAnswerBurstManager.stopAndClean();
    }
  }, [isTestSubmitted]);

  // Timer
  const startTimeRef = useRef<number>(Date.now());
  const [totalTimeSpentSeconds, setTotalTimeSpentSeconds] = useState(0);

  // Reset state on new session
  useEffect(() => {
    setIsTestSubmitted(false);
    setSelectedAnswers({});
    setCurrentIdx(0);
    setSessionSeed(Date.now());
    startTimeRef.current = Date.now();
    safeScrollToTop();

  }, [storageKey]);

  // Save session state
  useEffect(() => {
    if (!isTestSubmitted && (Object.keys(selectedAnswers).length > 0 || currentIdx > 0)) {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ currentIdx, selectedAnswers }));
      } catch (e) {
        console.warn('Could not save progress:', e);
      }
    }
  }, [currentIdx, selectedAnswers, isTestSubmitted, storageKey]);

  const totalQuestionsCount = activeQuestions.length;
  const safeIdx = Math.max(0, Math.min(currentIdx, Math.max(0, totalQuestionsCount - 1)));
  const currentQ = activeQuestions[safeIdx] || activeQuestions[0];

  // Ensure each question displays only its unique answer options without duplicates
  const uniqueOptionKeys = useMemo<('A' | 'B' | 'C' | 'D')[]>(() => {
    if (!currentQ?.options) return [];
    const validKeys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
    const seen = new Set<string>();
    const keys: ('A' | 'B' | 'C' | 'D')[] = [];

    validKeys.forEach(k => {
      const val = currentQ.options[k];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        const norm = String(val).trim().toLowerCase().replace(/\s+/g, ' ');
        if (!seen.has(norm)) {
          seen.add(norm);
          keys.push(k);
        }
      }
    });

    return keys;
  }, [currentQ]);

  const handleSaveFlag = () => {
    if (!currentQ || !currentQ.id) return;
    const updated = {
      ...flaggedQuestions,
      [currentQ.id]: {
        questionText: currentQ.questionText,
        subtopic: currentQ.subtopic || activeTitle,
        reason: flagReason,
        note: flagNote,
        timestamp: Date.now()
      }
    };
    setFlaggedQuestions(updated);
    try {
      localStorage.setItem(flagStorageKey, JSON.stringify(updated));
    } catch (e) {}

    setIsFlagModalOpen(false);
    setFlagNote('');
    setFlagSuccessToast(true);
    setTimeout(() => setFlagSuccessToast(false), 3000);
  };

  const handleRemoveFlag = () => {
    if (!currentQ || !currentQ.id) return;
    const updated = { ...flaggedQuestions };
    delete updated[currentQ.id];
    setFlaggedQuestions(updated);
    try {
      localStorage.setItem(flagStorageKey, JSON.stringify(updated));
    } catch (e) {}
  };

  const isCurrentFlagged = currentQ && currentQ.id ? !!flaggedQuestions[currentQ.id] : false;

  const handleSelectOption = useCallback((qId: string, opt: 'A' | 'B' | 'C' | 'D', e?: React.MouseEvent) => {
    if (!qId || isTestSubmitted) return;
    
    // Extract click coordinates synchronously before any asynchronous timers
    const clickX = e?.clientX;
    const clickY = e?.clientY;

    // Immediately set selected answer to guarantee 0ms instant UI update and zero lag
    setSelectedAnswers(prev => {
      if (prev[qId] === opt) return prev;
      return {
        ...prev,
        [qId]: opt
      };
    });

    // Check if correct and trigger celebratory balloon blast immediately on correct selection
    const targetQ = activeQuestions.find(q => q.id === qId) || currentQ;
    const isCorrect = targetQ && String(targetQ.correctOption || '').toUpperCase().trim() === opt;
    if (isCorrect) {
      // Start the burst animation and the exact 1500ms disappearance timer immediately
      RightAnswerBurstManager.trigger(clickX, clickY);
    } else {
      // User selected wrong option - immediately clean up any active burst animation
      RightAnswerBurstManager.stopAndClean();
    }
  }, [isTestSubmitted, activeQuestions, currentQ]);



  // Calculate score
  const calculateScore = useCallback(() => {
    let score = 0;
    (activeQuestions || []).forEach(q => {
      if (q && q.id && q.correctOption) {
        const userAns = (selectedAnswers[q.id] || '').toUpperCase().trim();
        const correct = String(q.correctOption).toUpperCase().trim();
        if (userAns) {
          if (userAns === correct) {
            score += 1;
          } else {
            score -= 1;
          }
        }
      }
    });
    return score;
  }, [activeQuestions, selectedAnswers]);

  const totalAttempted = Object.keys(selectedAnswers).length;

  const handleSubmitTest = () => {
    const duration = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    setTotalTimeSpentSeconds(duration);
    setIsTestSubmitted(true);
    safeScrollToTop();
    try {
      if (isSetMode && setId) {
        localStorage.setItem(`completed_set_${activeApp?.id || 'app'}_${subjectId}_${unitId}_${topicId}_set_${setId}`, 'true');
      } else if (subtopic) {
        localStorage.setItem(`completed_sub_${activeApp?.id || 'app'}_${subjectId}_${unitId}_${topicId}_${subtopic}`, 'true');
      }
      localStorage.removeItem(storageKey);

      // Securely persist practice result to Firestore for the user
      const userUid = localStorage.getItem('aspirant_user_uid') || localStorage.getItem('aspirant_user_email') || 'student_guest';
      const totalQuestions = activeQuestions.length;
      const calculatedScore = calculateScore();
      const accuracyPct = totalQuestions > 0 ? Math.round((calculatedScore / totalQuestions) * 100) : 0;
      savePracticeResultToFirestore({
        userId: userUid,
        appId: activeApp?.id || 'andhra-pradesh-appsc-group-2-en',
        subjectId,
        unitId,
        topicId,
        subtopic: subtopic || (isSetMode ? `Set ${setId}` : undefined),
        score: calculatedScore,
        total: totalQuestions,
        accuracy: accuracyPct,
        timeSpentSeconds: duration,
        answers: selectedAnswers,
      }).catch((err) => console.warn('Practice result firestore sync notice:', err));
    } catch (e) {}
  };

  // Performance benchmarking refs for 100 navigations (P50/P95)
  const navTimingsRef = useRef<number[]>([]);

  const handleNext = () => {
    const tStart = performance.now();
    if (safeIdx < activeQuestions.length - 1) {
      const tPreloadStart = performance.now();
      const nextQ = activeQuestions[safeIdx + 1];
      if (nextQ && nextQ.imageUrl) {
        const img = new Image();
        img.src = nextQ.imageUrl;
      }
      perfMonitor.recordPreload(performance.now() - tPreloadStart);

      setSlideDir(1);
      setCurrentIdx(safeIdx + 1);

      requestAnimationFrame(() => {
        const tDuration = performance.now() - tStart;
        perfMonitor.recordNavigation(tDuration);
      });
    } else {
      handleSubmitTest();
    }
  };

  const handlePrev = () => {
    const tStart = performance.now();
    if (safeIdx > 0) {
      const tPreloadStart = performance.now();
      const prevQ = activeQuestions[safeIdx - 1];
      if (prevQ && prevQ.imageUrl) {
        const img = new Image();
        img.src = prevQ.imageUrl;
      }
      perfMonitor.recordPreload(performance.now() - tPreloadStart);

      setSlideDir(-1);
      setCurrentIdx(safeIdx - 1);

      requestAnimationFrame(() => {
        const tDuration = performance.now() - tStart;
        perfMonitor.recordNavigation(tDuration);
      });
    }
  };

  const getFirstSubtopic = (t: any): string => {
    if (!t?.subtopics || t.subtopics.length === 0) return 'Core Concepts';
    const first = t.subtopics[0];
    return typeof first === 'string' ? first : (first?.name || String(first || 'Core Concepts'));
  };

  // Subtopics list for current topic
  const subtopicNames = (topicObj?.subtopics && topicObj.subtopics.length > 0)
    ? topicObj.subtopics.map((s: any) => typeof s === 'string' ? s : (s?.name || String(s || '')))
    : [];

  // Calculate total sets for this topic
  const topicAllQ = useMemo(() => {
    return subjectFiltered.filter(q => q && q.topicId === topicId);
  }, [subjectFiltered, topicId]);

  const totalSets = Math.max(1, Math.ceil((topicAllQ.length > 0 ? topicAllQ.length : 42) / QUESTIONS_PER_SET));

  // Find next topic across syllabus
  const findNextTopicInfo = () => {
    if (!activeApp || !activeApp.syllabus) return null;
    const currentSubjIdx = activeApp.syllabus.findIndex(s => s.id === subjectId);
    if (currentSubjIdx === -1) return null;

    const currentSubj = activeApp.syllabus[currentSubjIdx];
    const units = currentSubj.units || [];
    const currentUnitIdx = units.findIndex(u => u.id === unitId);
    if (currentUnitIdx === -1) return null;

    const currentUnit = units[currentUnitIdx];
    const topics = currentUnit.topics || [];
    const currentTopicIdx = topics.findIndex(t => t.id === topicId);

    // 1. Next topic in same unit
    if (currentTopicIdx >= 0 && currentTopicIdx < topics.length - 1) {
      const nextT = topics[currentTopicIdx + 1];
      return {
        subjectId: currentSubj.id,
        subjectName: currentSubj.name,
        unitId: currentUnit.id,
        unitName: currentUnit.name,
        topicId: nextT.id,
        topicName: nextT.name,
        firstSubtopic: getFirstSubtopic(nextT),
      };
    }

    // 2. First topic in next unit of same subject
    if (currentUnitIdx < units.length - 1) {
      for (let u = currentUnitIdx + 1; u < units.length; u++) {
        const nextUnit = units[u];
        if (nextUnit.topics && nextUnit.topics.length > 0) {
          const nextT = nextUnit.topics[0];
          return {
            subjectId: currentSubj.id,
            subjectName: currentSubj.name,
            unitId: nextUnit.id,
            unitName: nextUnit.name,
            topicId: nextT.id,
            topicName: nextT.name,
            firstSubtopic: getFirstSubtopic(nextT),
          };
        }
      }
    }

    // 3. First topic in next subject
    if (currentSubjIdx < activeApp.syllabus.length - 1) {
      for (let s = currentSubjIdx + 1; s < activeApp.syllabus.length; s++) {
        const nextSubj = activeApp.syllabus[s];
        for (const nextUnit of (nextSubj.units || [])) {
          if (nextUnit.topics && nextUnit.topics.length > 0) {
            const nextT = nextUnit.topics[0];
            return {
              subjectId: nextSubj.id,
              subjectName: nextSubj.name,
              unitId: nextUnit.id,
              unitName: nextUnit.name,
              topicId: nextT.id,
              topicName: nextT.name,
              firstSubtopic: getFirstSubtopic(nextT),
            };
          }
        }
      }
    }

    return null;
  };

  const nextTopicInfo = findNextTopicInfo();

  let nextActionType: 'next-subtopic' | 'next-set' | 'next-topic' | undefined = undefined;
  let nextActionLabel = '';
  let onNextAction: (() => void) | undefined = undefined;

  if (isSetMode && setId) {
    if (setId < totalSets) {
      // Next Set exists
      nextActionType = 'next-set';
      nextActionLabel = `Set ${setId + 1}`;
      if (onSelectSet) {
        onNextAction = () => {
          setIsTestSubmitted(false);
          setSelectedAnswers({});
          setCurrentIdx(0);
          startTimeRef.current = Date.now();
          safeScrollToTop();
          
          const topicQ = questions.filter(q => 
            q && 
            q.appId === activeApp?.id &&
            q.subjectId === subjectId &&
            (unitId ? q.unitId === unitId : (!q.unitId || q.unitId === '')) &&
            (topicId ? q.topicId === topicId : (!q.topicId || q.topicId === ''))
          );
          const nextSetId = setId + 1;
          const start = (nextSetId - 1) * QUESTIONS_PER_SET;
          const end = start + QUESTIONS_PER_SET;
          const nextSetQuestions = topicQ.slice(start, end);
          onSelectSet(subjectId, unitId, topicId, nextSetId, `Set ${nextSetId}`, nextSetQuestions);
        };
      }
    } else {
      // Last Set of Topic -> Go to Next Topic
      nextActionType = 'next-topic';
      nextActionLabel = nextTopicInfo ? nextTopicInfo.topicName : (topicName || 'Syllabus');
      onNextAction = () => {
        setIsTestSubmitted(false);
        setSelectedAnswers({});
        setCurrentIdx(0);
        startTimeRef.current = Date.now();
        safeScrollToTop();
        if (nextTopicInfo && onSelectSet) {
          const nextTopicObj = activeApp?.syllabus?.find(s => s.id === nextTopicInfo.subjectId)?.units?.find(u => u.id === nextTopicInfo.unitId)?.topics?.find(t => t.id === nextTopicInfo.topicId);
          const nextSyllabusSubs = (nextTopicObj?.subtopics || []).map((s: any) => typeof s === 'string' ? s : (s?.name || String(s || ''))).filter(Boolean);
          const nextTopicQ = appQuestions.filter(q => 
            q && 
            q.subjectId === nextTopicInfo.subjectId && 
            (q.topicId === nextTopicInfo.topicId || 
             (nextTopicInfo.topicName && q.subtopic && String(q.subtopic).toLowerCase().trim() === String(nextTopicInfo.topicName).toLowerCase().trim()) ||
             nextSyllabusSubs.some(s => String(s || '').toLowerCase().trim() === String(q.subtopic || '').toLowerCase().trim())
            ) && 
            (!nextTopicInfo.unitId || q.unitId === nextTopicInfo.unitId)
          );
          const nextSetQuestions = nextTopicQ.slice(0, QUESTIONS_PER_SET);
          onSelectSet(nextTopicInfo.subjectId, nextTopicInfo.unitId, nextTopicInfo.topicId, 1, 'Set 1', nextSetQuestions);
        } else {
          onBackToHome();
        }
      };
    }
  } else {
    // Subtopics Mode
    const currentSubIndex = subtopicNames.findIndex(s => s.toLowerCase().trim() === (subtopic || '').toLowerCase().trim());
    if (currentSubIndex >= 0 && currentSubIndex < subtopicNames.length - 1) {
      // Next Subtopic in same Topic
      const nextSubtopicName = subtopicNames[currentSubIndex + 1];
      nextActionType = 'next-subtopic';
      nextActionLabel = nextSubtopicName;
      if (onSelectSubtopic) {
        onNextAction = () => {
          setIsTestSubmitted(false);
          setSelectedAnswers({});
          setCurrentIdx(0);
          startTimeRef.current = Date.now();
          safeScrollToTop();
          onSelectSubtopic(subjectId, unitId, topicId, nextSubtopicName);
        };
      }
    } else {
      // Last Subtopic of Topic -> Go to Next Topic Subtopic
      nextActionType = 'next-topic';
      nextActionLabel = nextTopicInfo ? nextTopicInfo.topicName : (topicName || 'Syllabus');
      onNextAction = () => {
        setIsTestSubmitted(false);
        setSelectedAnswers({});
        setCurrentIdx(0);
        startTimeRef.current = Date.now();
        safeScrollToTop();
        if (nextTopicInfo && onSelectSubtopic) {
          onSelectSubtopic(nextTopicInfo.subjectId, nextTopicInfo.unitId, nextTopicInfo.topicId, nextTopicInfo.firstSubtopic);
        } else {
          onBackToHome();
        }
      };
    }
  }

  // If test is submitted, render Premium Result Screen
  if (isTestSubmitted) {
    return (
      <PremiumResultScreen
        activeApp={activeApp}
        subjectName={subjName}
        unitName={unitObj?.name}
        topicName={topicName}
        subtopicName={activeTitle}
        questions={activeQuestions}
        selectedAnswers={selectedAnswers}
        timeSpentSeconds={totalTimeSpentSeconds || 120}
        onPracticeAgain={() => {
          setIsTestSubmitted(false);
          setSelectedAnswers({});
          setCurrentIdx(0);
          setSessionSeed(Date.now());
          startTimeRef.current = Date.now();
          safeScrollToTop();
        }}
        onBackToHome={onBackToHome}
        isSetMode={isSetMode}
        practiceMode={isSetMode ? 'sets' : 'subtopics'}
        nextActionType={nextActionType}
        nextActionLabel={nextActionLabel}
        onNextAction={onNextAction}
      />
    );
  }

  // Safety check: if currentQ is missing
  if (!currentQ) {
    return (
      <div className="bg-white rounded-3xl p-8 max-w-lg mx-auto text-center border-2 border-slate-300 shadow-md space-y-4 my-8">
        <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-xl font-bold">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-black text-slate-900">Loading Practice Arena</h3>
          <p className="text-xs text-slate-600 font-semibold">Preparing MCQ questions and concept notes...</p>
        </div>
        <button
          onClick={onBackToHome}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>
    );
  }

  // Explanation text and answered state
  const currentExplanationText = (currentQ?.explanation || '').trim();
  const hasAnsweredCurrent = !!selectedAnswers[currentQ?.id] || isTestSubmitted;
  const isSplitView = hasAnsweredCurrent && !!currentExplanationText;

  // Active outer container width - matches exact widening as Focus Mode across desktop & widescreen devices
  const activeContainerClass = screenSize === 'small'
    ? (isSplitView ? 'max-w-xl md:max-w-4xl lg:max-w-5xl' : 'max-w-xl')
    : screenSize === 'medium'
      ? (isSplitView ? 'max-w-3xl md:max-w-5xl lg:max-w-6xl' : 'max-w-3xl')
      : screenSize === 'xl'
        ? (isSplitView ? 'max-w-full 2xl:max-w-[1800px]' : 'max-w-4xl lg:max-w-5xl')
        : (isSplitView ? 'max-w-5xl xl:max-w-7xl 2xl:max-w-[1720px]' : 'max-w-3xl lg:max-w-4xl');

  return (
    <div className={`space-y-4 lg:space-y-6 pb-28 font-sans w-full ${activeContainerClass} mx-auto px-2 sm:px-4 transition-all duration-300`}>

      {/* Success Toast for Flag */}
      {flagSuccessToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-amber-400 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">Question flagged successfully for admin review!</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* COMPACT CONSOLIDATED PRACTICE HEADER (Space-Saving & Responsive) */}
      {/* ======================================================== */}
      <div className="bg-[var(--card-bg)]/90 backdrop-blur-md rounded-2xl px-2 sm:px-3 py-2 border border-[var(--card-border)] shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full overflow-hidden sm:overflow-visible">
        {/* Row 1 on mobile / Left group on desktop: Back Button, Set Badge, Timer, Q-Count & Score */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap font-mono font-bold text-slate-900 min-w-0">
          <button
            type="button"
            onClick={() => {
              localStorage.setItem('aspirant_returning_from_practice', 'true');
              onBackToHome();
            }}
            className="inline-flex items-center justify-center w-8 h-8 bg-slate-900 text-white border border-slate-700 rounded-lg shadow-2xs transition-all cursor-pointer active:scale-95 touch-manipulation"
            title={isSetMode ? 'Back to Sets' : 'Back to Subtopics'}
            aria-label={isSetMode ? 'Back to Sets screen' : 'Back to Subtopics screen'}
          >
            <ArrowLeft className="h-4.5 w-4.5 stroke-[2.5]" />
          </button>

          {/* Prominent Set Identification Badge */}
          <span className="bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-lg border border-amber-600 font-black text-xs sm:text-sm tracking-wide shadow-2xs">
            {setName || (setId ? `Set ${setId}` : 'Practice')}
          </span>

          <PracticeTimerDisplay isSubmitted={isTestSubmitted} />

          <span className="bg-indigo-50 text-indigo-950 px-2 py-0.5 rounded-md border border-indigo-100 font-black text-xs sm:text-sm">
            {safeIdx + 1}/{activeQuestions.length}
          </span>

          <span className="bg-purple-100 text-purple-950 px-2 py-0.5 rounded-md border border-purple-200 font-extrabold text-xs sm:text-sm">
            Score: {calculateScore()}
          </span>
        </div>

        {/* Row 2 on mobile / Right group on desktop: Action Buttons & Submit */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-between sm:justify-end w-full sm:w-auto pt-1.5 sm:pt-0 border-t sm:border-t-0 border-[var(--card-border)]/50">


          {/* 3D Motion & Transition Effects Settings */}
          <button
            type="button"
            onClick={() => setIsMotionModalOpen(true)}
            className="h-8 w-8 rounded-lg bg-[var(--bg-secondary)] hover:bg-indigo-50/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-colors cursor-pointer border border-[var(--card-border)] shrink-0"
            title="3D Effects & Transition Settings"
            aria-label="3D Effects & Transition Settings"
          >
            <Sparkles className="h-4 w-4 text-indigo-500" />
          </button>


          {/* Question Palette */}
          <button
            type="button"
            onClick={() => setIsPaletteOpen(!isPaletteOpen)}
            className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer border text-[11px] font-bold shrink-0 ${
              isPaletteOpen
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-1 ring-indigo-400'
                : 'bg-[var(--bg-secondary)] hover:bg-indigo-50 text-indigo-600 border-[var(--card-border)]'
            }`}
            title="Question Palette (List of questions)"
            aria-label="Question Palette"
          >
            <Grid3X3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </button>

          {/* Display & Font Settings (Text & Typography button) */}
          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="h-8 w-8 rounded-lg bg-[var(--bg-secondary)] hover:bg-amber-50/80 text-orange-600 flex items-center justify-center transition-colors cursor-pointer border border-[var(--card-border)] shrink-0"
              title="Text & Typography / Display Settings"
              aria-label="Text & Typography Settings"
            >
              <Type className="h-4 w-4 text-orange-500" />
            </button>
          )}

          {/* MCQ Font Size Controls (A-, A+, Reset) */}
          <McqFontControls showLabel={false} />



          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmitTest}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-2xs border border-amber-600 shrink-0 ml-0.5"
          >
            Submit
          </button>
        </div>
      </div>



      {/* Question Palette Dropdown when Palette is clicked */}
      {isPaletteOpen && (
        <div className="bg-white rounded-2xl p-4 border-2 border-slate-200 shadow-xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Question Palette ({activeQuestions.length})</span>
            <button
              type="button"
              onClick={() => setIsPaletteOpen(false)}
              className="h-7 w-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {activeQuestions.map((q, idx) => {
              const userAns = selectedAnswers[q.id];
              const isCorrect = userAns && userAns.toUpperCase().trim() === String(q.correctOption || '').toUpperCase().trim();
              const isSelected = safeIdx === idx;

              let dotStyle = 'bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border-[var(--card-border)]';
              if (userAns) {
                if (isCorrect) {
                  dotStyle = 'bg-emerald-600 text-white border-emerald-500 shadow-xs';
                } else {
                  dotStyle = 'bg-rose-600 text-white border-rose-500 shadow-xs';
                }
              }
              if (isSelected) {
                dotStyle += ' ring-2 ring-indigo-500 font-black';
              }

              return (
                <button
                  type="button"
                  key={q.id || idx}
                  onClick={() => {
                    setCurrentIdx(idx);
                    setIsPaletteOpen(false);
                  }}
                  className={`h-9 rounded-xl text-xs font-black flex items-center justify-center border transition-all cursor-pointer ${dotStyle}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. MAIN QUESTION & EXPLANATION CARD (Adjustable Desktop Side-by-Side for Lengthy Explanations) */}
      {/* ======================================================== */}
      {(() => {
        const questionText = currentQ.questionText || '';
        const hasAnswered = !!selectedAnswers[currentQ.id];
        const correctOpt = String(currentQ.correctOption || '').toUpperCase().trim();
        const isCurrentAnswerCorrect = hasAnswered && selectedAnswers[currentQ.id] === correctOpt;

        // Reusable Question Box Component
        const renderQuestionBox = () => {
          const bookmarkedNow = isBookmarked(bookmarks, 'mcq', currentQ?.id);

          return (
            <div 
              className={`rounded-xl sm:rounded-2xl overflow-hidden ${currentScreenConfig.questionBoxPaddingClass} text-center shadow-sm ${currentScreenConfig.questionBoxMinHeightClass} flex flex-col items-center justify-center relative transition-all duration-300`}
              style={{ 
                background: appearance.questionBg,
                color: appearance.questionText
              }}
            >
              {/* Bookmark Button */}
              <button
                type="button"
                onClick={handleToggleBookmarkCurrent}
                title={bookmarkedNow ? 'Remove Bookmark' : 'Bookmark Question'}
                className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-xl border transition-all active:scale-90 cursor-pointer ${
                  bookmarkedNow
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-black/20 hover:bg-black/30 text-slate-300 border-white/10'
                }`}
              >
                {bookmarkedNow ? (
                  <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950" />
                ) : (
                  <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>

              <div className="space-y-1 text-center w-full mx-auto py-1 pr-8 sm:pr-10">
                <h3 
                  style={{ ...scaledTextStyle, color: appearance.questionText }} 
                  className={`${currentScreenConfig.questionTextClass} leading-snug text-center drop-shadow-xs`}
                >
                  <MathText text={questionText} />
                </h3>
              </div>
            </div>
          );
        };

        // Reusable Options Buttons List Component
        const renderOptionsButtons = () => (
          <div className="space-y-1.5 sm:space-y-2">
            {uniqueOptionKeys.map((optKey) => {
              const optText = currentQ?.options ? currentQ.options[optKey] : null;
              if (!optText) return null;
              const isSelected = selectedAnswers[currentQ.id] === optKey;
              const isCorrect = optKey === correctOpt;

              let boxStyle = '';
              let textStyle = '';
              let letterStyle = '';
              let boxInlineStyle: React.CSSProperties = {};
              let textInlineStyle: React.CSSProperties = {};
              let letterInlineStyle: React.CSSProperties = {};

              if (!hasAnswered) {
                // Default unclicked state: User-defined options background
                boxStyle = 'hover:opacity-90 border shadow-2xs cursor-pointer active:scale-[0.99]';
                boxInlineStyle = { 
                  background: appearance.optionsBg, 
                  color: appearance.optionsText,
                  borderColor: `${appearance.optionsText}20` 
                };
                textStyle = 'font-bold';
                textInlineStyle = { color: appearance.optionsText };
                letterStyle = 'font-black';
                letterInlineStyle = { color: appearance.accentColor };
              } else {
                if (isCorrect) {
                  // Correct state: Solid Emerald green, crisp white text
                  boxStyle = 'bg-[#10b981] text-white border-2 border-emerald-600 shadow-sm cursor-default scale-[1.005]';
                  textStyle = 'text-white font-bold';
                  letterStyle = 'text-white font-black';
                } else if (isSelected && !isCorrect) {
                  // Wrong selected state: Solid vibrant red, crisp white text
                  boxStyle = 'bg-[#ef4444] text-white border-2 border-rose-600 shadow-sm cursor-default scale-[1.005]';
                  textStyle = 'text-white font-bold';
                  letterStyle = 'text-white font-black';
                } else {
                  // Remaining unselected options: User-defined options background
                  boxStyle = 'border shadow-2xs cursor-default opacity-60';
                  boxInlineStyle = { 
                    background: appearance.optionsBg, 
                    color: appearance.optionsText,
                    borderColor: `${appearance.optionsText}10` 
                  };
                  textStyle = 'font-semibold';
                  textInlineStyle = { color: appearance.optionsText };
                  letterStyle = 'font-bold';
                  letterInlineStyle = { color: appearance.accentColor };
                }
              }

              return (
                <button
                  type="button"
                  key={optKey}
                  disabled={hasAnswered}
                  onClick={(e) => handleSelectOption(currentQ.id, optKey, e)}
                  className={`w-full min-h-[34px] sm:min-h-[38px] ${currentScreenConfig.optionPaddingClass} rounded-lg sm:rounded-xl text-left transition-colors duration-150 flex items-center justify-between select-none touch-manipulation ${boxStyle}`}
                  style={boxInlineStyle}
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <span 
                      className={`${currentScreenConfig.optionLetterClass} ${letterStyle} shrink-0`}
                      style={letterInlineStyle}
                    >
                      {optKey})
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span 
                        style={{ ...scaledTextStyle, ...textInlineStyle }} 
                        className={`leading-snug ${currentScreenConfig.optionTextClass} ${textStyle}`}
                      >
                        <MathText text={optText} />
                      </span>
                    </div>
                  </div>

                  {/* White Circle with Emerald Check Icon */}
                  {hasAnswered && isCorrect && (
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white flex items-center justify-center text-[#10b981] shrink-0 ml-2 shadow-xs font-black">
                      <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3.5]" />
                    </span>
                  )}
                  {/* White Circle with Red Cross for Wrong Selection */}
                  {hasAnswered && isSelected && !isCorrect && (
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white flex items-center justify-center text-[#ef4444] shrink-0 ml-2 shadow-xs text-[10px] sm:text-xs font-black">
                      ✕
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        );

        // Reusable Card Footer (Flag Question)
        const renderCardFooter = () => (
          <div className="pt-1.5 border-t border-purple-200/60 flex items-center justify-end gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-2">
              {isCurrentFlagged ? (
                <button
                  type="button"
                  onClick={handleRemoveFlag}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                >
                  <Flag className="h-3.5 w-3.5 fill-rose-600" />
                  <span>Flagged (Remove)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsFlagModalOpen(true)}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                >
                  <Flag className="h-3.5 w-3.5" />
                  <span>Flag Question</span>
                </button>
              )}
            </div>
          </div>
        );

        // Reusable Options Box Container (Separate Box Type)
        const renderOptionsBox = () => (
          <div 
            className="rounded-xl sm:rounded-2xl overflow-hidden border shadow-2xs p-2.5 sm:p-3.5 lg:p-4 space-y-2 sm:space-y-2.5 relative transition-all duration-300"
            style={{ 
              background: appearance.optionsBg,
              borderColor: `${appearance.optionsText}30`
            }}
          >
            {/* Top Accent Gradient Line */}
            <div 
              className="absolute top-0 left-0 right-0 h-1 rounded-t-xl sm:rounded-t-2xl opacity-60" 
              style={{ background: appearance.accentColor }}
            />

            {/* Options Header Bar */}
            <div 
              className="flex items-center justify-between pb-1 sm:pb-1.5 border-b"
              style={{ borderColor: `${appearance.optionsText}20` }}
            >
              <div className="flex items-center gap-1.5">
                <span 
                  className="p-0.5 sm:p-1 rounded-md opacity-80"
                  style={{ background: `${appearance.accentColor}20`, color: appearance.accentColor }}
                >
                  <Layers className="h-3.5 w-3.5" />
                </span>
                <span 
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: appearance.optionsText }}
                >
                  Options
                </span>
              </div>
              {hasAnswered && (
                <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md border ${
                  isCurrentAnswerCorrect 
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                    : 'bg-rose-100 text-rose-900 border-rose-300'
                }`}>
                  {isCurrentAnswerCorrect ? '✓ Correct Option' : '✕ Incorrect Selection'}
                </span>
              )}
            </div>

            {/* Options List */}
            {renderOptionsButtons()}

            {/* Subtopics & Flag */}
            {renderCardFooter()}
          </div>
        );

        // Reusable Premium Explanation Box (Separate Box Type, Right Side to User in Desktop Mode)
        const renderExplanationBox = (isSplit = false) => {
          if (!hasAnswered || !currentQ.explanation) return null;
          return (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl sm:rounded-3xl overflow-hidden border-2 shadow-xl ${currentScreenConfig.explanationPaddingClass} space-y-3.5 lg:space-y-4 relative transition-all duration-300 ${
                isSplit ? 'md:sticky md:top-4' : ''
              }`}
              style={{ 
                background: appearance.explanationBg,
                borderColor: `${appearance.accentColor}30`,
                color: appearance.explanationText
              }}
            >
              {/* Subtle top shimmer line */}
              <div 
                className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl sm:rounded-t-3xl opacity-60" 
                style={{ background: appearance.accentColor }}
              />

              {/* Header: Verified Emerald Icon + Bold themed "Explanation" + TTS + Orientation Toggle */}
              <div 
                className="flex items-center justify-between gap-2 border-b pb-2.5"
                style={{ borderColor: `${appearance.explanationText}20` }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 lg:w-8 lg:h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center font-black shadow-md shadow-emerald-600/30 shrink-0">
                    <Check className="w-4 h-4 lg:w-5 lg:h-5 stroke-[3.5]" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-base sm:text-lg lg:text-xl font-black tracking-tight"
                        style={{ color: appearance.explanationText }}
                      >
                        Explanation
                      </span>
                      <span 
                        className="hidden sm:inline-flex items-center gap-1 text-[10px] sm:text-xs font-black uppercase px-2 py-0.5 rounded-full border"
                        style={{ 
                          background: `${appearance.accentColor}15`, 
                          color: appearance.accentColor,
                          borderColor: `${appearance.accentColor}30`
                        }}
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        Verified Concept
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">


                  {/* Collapse toggle */}
                  <button
                    type="button"
                    onClick={() => setIsExplanationCollapsed(!isExplanationCollapsed)}
                    className="px-2.5 py-1.5 rounded-xl bg-white/80 hover:bg-white text-xs sm:text-sm font-black text-slate-800 hover:text-amber-950 border border-amber-200/80 shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <span>{isExplanationCollapsed ? 'Show Details' : 'Hide'}</span>
                    {isExplanationCollapsed ? (
                      <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Explanation Content: High contrast, readable rich text */}
              {!isExplanationCollapsed && (
                <div 
                  style={{ 
                    ...scaledTextStyle, 
                    color: appearance.explanationText,
                    borderColor: `${appearance.explanationText}15`
                  }} 
                  className="text-sm sm:text-base lg:text-lg leading-relaxed font-normal pt-1 border-t mt-2 space-y-2"
                >
                  <MathText text={currentQ.explanation || ''} />
                </div>
              )}
            </motion.div>
          );
        };

        const motionVariants = getQuestionMotionVariants(
          motionConfig.style, 
          slideDir, 
          motionConfig.reducedMotion
        );



        return (
          <AnimatePresence mode="wait">
            <motion.div
              key={safeIdx}
              variants={motionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              <div className="w-full max-w-3xl lg:max-w-4xl space-y-5 mx-auto">
                {/* Separate Box 1: Question Box */}
                {renderQuestionBox()}

                {/* Separate Box 2: Options Box */}
                {renderOptionsBox()}

                {/* Explanation Box - smoothly fades in stably directly below options */}
                {hasAnswered && currentQ.explanation && (
                  renderExplanationBox(false)
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        );
      })()}

      {/* ======================================================== */}
      {/* 5. BOTTOM NAVIGATION (High Contrast Visible Previous + Solid Royal Blue Next) */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between gap-3 sm:gap-4 pt-2 lg:pt-4">
        {/* Previous Button - Bold, High-Contrast & Clearly Visible */}
        <button
          type="button"
          disabled={safeIdx === 0}
          onClick={handlePrev}
          className={`flex-1 sm:flex-initial min-h-[48px] ${currentScreenConfig.navButtonClass} rounded-2xl font-black shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 touch-manipulation ${
            safeIdx === 0
              ? 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-2 border-[var(--card-border)] cursor-not-allowed opacity-50'
              : 'bg-[var(--card-bg)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:text-indigo-700 border-2 border-[var(--card-border)] hover:border-indigo-500 cursor-pointer shadow-sm hover:shadow-md'
          }`}
        >
          <ArrowLeft className={`w-4.5 h-4.5 lg:w-5 lg:h-5 stroke-[2.8] ${safeIdx === 0 ? 'text-slate-400' : 'text-indigo-600'}`} />
          <span>Previous</span>
        </button>

        {/* Next / Submit Button (Solid Royal Blue Pill with Right Arrow) */}
        {safeIdx < activeQuestions.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className={`flex-1 sm:flex-initial min-h-[48px] ${currentScreenConfig.navButtonClass} rounded-2xl bg-[#1a66ff] hover:bg-[#1555d4] text-white font-bold shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer touch-manipulation`}
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 stroke-[2.2]" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmitTest}
            className={`flex-1 sm:flex-initial min-h-[48px] ${currentScreenConfig.navButtonClass} rounded-2xl bg-[#10b981] hover:bg-[#059669] text-white font-bold shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer touch-manipulation`}
          >
            <span>Submit Test</span>
            <Check className="w-4 h-4 lg:w-5 lg:h-5 stroke-[3]" />
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* FOCUS READING MODE IMMERSIVE OVERLAY (Side-by-Side Explanation & Eye-Safe Warm Background) */}
      {/* ======================================================== */}
      {isFocusReadingMode && (() => {
        const questionText = currentQ.questionText || '';
        const hasAnswered = !!selectedAnswers[currentQ.id];
        const correctOpt = String(currentQ.correctOption || '').toUpperCase().trim();
        const isCurrentAnswerCorrect = hasAnswered && selectedAnswers[currentQ.id] === correctOpt;

        const focusThemeStyles: Record<FocusBgTheme, {
          container: string;
          ambientGlow: string;
          header: string;
          headerBtn: string;
          label: string;
          dot: string;
          badge: string;
          navPrev: string;
          paletteContainer: string;
          paletteHeader: string;
          paletteItemDefault: string;
          paletteCloseBtn: string;
          infoBox: string;
        }> = {
          'warm-espresso': {
            container: 'bg-[#151311]/98 text-amber-50',
            ambientGlow: 'bg-[radial-gradient(ellipse_80%_65%_at_50%_15%,rgba(245,158,11,0.14),rgba(21,19,17,0.99))]',
            header: 'bg-[#211d19]/95 border-amber-900/50 text-amber-50',
            headerBtn: 'bg-[#2e2823] hover:bg-[#3d352e] text-amber-100 border-amber-800/50',
            label: 'Espresso',
            dot: 'bg-amber-500',
            badge: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
            navPrev: 'bg-[#241e1a] hover:bg-[#332b25] text-amber-100 border-[#3d332c]',
            paletteContainer: 'bg-[#1f1a16] border-2 border-amber-800/70 text-amber-50 shadow-2xl',
            paletteHeader: 'border-amber-900/50 text-amber-200',
            paletteItemDefault: 'bg-[#29221c] text-amber-200 hover:bg-[#382f27] border-amber-800/50',
            paletteCloseBtn: 'bg-amber-950/70 hover:bg-amber-900 text-amber-300',
            infoBox: 'bg-[#231e19] border-amber-800/60 text-amber-100',
          },
          'soft-sepia': {
            container: 'bg-[#1c1713]/98 text-amber-100',
            ambientGlow: 'bg-[radial-gradient(ellipse_80%_65%_at_50%_15%,rgba(217,119,6,0.18),rgba(28,23,19,0.99))]',
            header: 'bg-[#29221c]/95 border-amber-800/50 text-amber-100',
            headerBtn: 'bg-[#372e26] hover:bg-[#483d33] text-amber-100 border-amber-700/50',
            label: 'Sepia',
            dot: 'bg-orange-400',
            badge: 'bg-amber-900/60 text-amber-200 border-amber-700/60',
            navPrev: 'bg-[#2d241e] hover:bg-[#3d322a] text-amber-100 border-[#4a3b31]',
            paletteContainer: 'bg-[#261f18] border-2 border-amber-700/70 text-amber-100 shadow-2xl',
            paletteHeader: 'border-amber-800/50 text-amber-200',
            paletteItemDefault: 'bg-[#332a21] text-amber-200 hover:bg-[#42372c] border-amber-700/50',
            paletteCloseBtn: 'bg-amber-950/70 hover:bg-amber-900 text-amber-200',
            infoBox: 'bg-[#2b221a] border-amber-700/60 text-amber-100',
          },
          'midnight-indigo': {
            container: 'bg-[#0a0f1d]/98 text-indigo-50',
            ambientGlow: 'bg-[radial-gradient(ellipse_80%_65%_at_50%_15%,rgba(99,102,241,0.16),rgba(10,15,29,0.99))]',
            header: 'bg-[#141b31]/95 border-indigo-800/50 text-indigo-50',
            headerBtn: 'bg-[#1e2744] hover:bg-[#28345c] text-indigo-100 border-indigo-700/50',
            label: 'Midnight',
            dot: 'bg-indigo-400',
            badge: 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60',
            navPrev: 'bg-[#141c33] hover:bg-[#1d2747] text-indigo-100 border-[#2b3961]',
            paletteContainer: 'bg-[#12182d] border-2 border-indigo-700/70 text-indigo-50 shadow-2xl',
            paletteHeader: 'border-indigo-800/50 text-indigo-200',
            paletteItemDefault: 'bg-[#1a2340] text-indigo-200 hover:bg-[#232f57] border-indigo-700/50',
            paletteCloseBtn: 'bg-indigo-950/70 hover:bg-indigo-900 text-indigo-200',
            infoBox: 'bg-[#151c33] border-indigo-700/60 text-indigo-100',
          },
          'pure-dark': {
            container: 'bg-[#080808]/98 text-zinc-100',
            ambientGlow: 'bg-[radial-gradient(ellipse_80%_65%_at_50%_15%,rgba(255,255,255,0.06),rgba(8,8,8,0.99))]',
            header: 'bg-[#161616]/95 border-zinc-800 text-zinc-100',
            headerBtn: 'bg-[#222222] hover:bg-[#2e2e2e] text-zinc-100 border-zinc-700',
            label: 'Pure Dark',
            dot: 'bg-zinc-300',
            badge: 'bg-zinc-900 text-zinc-300 border-zinc-700',
            navPrev: 'bg-[#1c1c1c] hover:bg-[#282828] text-zinc-100 border-zinc-700',
            paletteContainer: 'bg-[#141414] border-2 border-zinc-700 text-zinc-100 shadow-2xl',
            paletteHeader: 'border-zinc-800 text-zinc-200',
            paletteItemDefault: 'bg-[#202020] text-zinc-200 hover:bg-[#2c2c2c] border-zinc-700',
            paletteCloseBtn: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300',
            infoBox: 'bg-[#181818] border-zinc-700 text-zinc-200',
          },
        };

        const activeTheme = focusThemeStyles[focusBgTheme] || focusThemeStyles['warm-espresso'];
        const isSplitView = hasAnswered && !!currentQ.explanation;
        const activeContainerWidth = isSplitView ? 'max-w-5xl xl:max-w-7xl 2xl:max-w-[1720px]' : 'max-w-3xl lg:max-w-4xl';

        // Focus Mode Question Box
        const renderFocusQuestionBox = () => (
          <div className="bg-gradient-to-r from-[#ff5a43] via-[#ff6f44] to-[#ff9147] rounded-3xl p-6 sm:p-8 lg:p-10 text-center text-white shadow-2xl border-2 border-orange-300/30 flex flex-col items-center justify-center relative">
            <div className="space-y-2 text-center w-full max-w-4xl mx-auto py-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-orange-100 text-xs font-bold mb-1">
                <span>Question {safeIdx + 1} of {activeQuestions.length}</span>
              </div>
              <h3 style={scaledTextStyle} className="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-relaxed text-center drop-shadow-xs">
                <MathText text={questionText} />
              </h3>
            </div>
          </div>
        );

        // Focus Mode Options Box
        const renderFocusOptionsBox = () => (
          <div className="bg-[#F3E5F5] rounded-3xl border-2 border-purple-200/90 shadow-2xl p-4 sm:p-6 lg:p-7 space-y-4 relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-purple-500 to-indigo-600" />

            <div className="flex items-center justify-between pb-2 border-b border-purple-200/70">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-purple-200/80 text-purple-900">
                  <Layers className="h-4 w-4" />
                </span>
                <span className="text-xs sm:text-sm font-black text-purple-950 uppercase tracking-wider">
                  Choose the Correct Answer
                </span>
              </div>
              {hasAnswered && (
                <span className={`text-[11px] sm:text-xs font-black px-2.5 py-1 rounded-lg border ${
                  isCurrentAnswerCorrect 
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                    : 'bg-rose-100 text-rose-900 border-rose-300'
                }`}>
                  {isCurrentAnswerCorrect ? '✓ Correct Option' : '✕ Incorrect Selection'}
                </span>
              )}
            </div>

            <div className="space-y-3">
              {uniqueOptionKeys.map((optKey) => {
                const optText = currentQ?.options ? currentQ.options[optKey] : null;
                if (!optText) return null;
                const isSelected = selectedAnswers[currentQ.id] === optKey;
                const isCorrect = optKey === correctOpt;

                let boxStyle = '';
                let textStyle = '';
                let letterStyle = '';

                if (!hasAnswered) {
                  boxStyle = 'bg-[#E3F2FD] hover:bg-[#D0E8FF] text-slate-900 border-2 border-[#BBDEFB] hover:border-blue-400 shadow-xs cursor-pointer active:scale-[0.99]';
                  textStyle = 'text-slate-900 font-bold';
                  letterStyle = 'text-blue-900 font-black';
                } else {
                  if (isCorrect) {
                    boxStyle = 'bg-[#10b981] text-white border-2 border-emerald-600 shadow-md cursor-default scale-[1.01]';
                    textStyle = 'text-white font-bold';
                    letterStyle = 'text-white font-black';
                  } else if (isSelected && !isCorrect) {
                    boxStyle = 'bg-[#ef4444] text-white border-2 border-rose-600 shadow-md cursor-default scale-[1.01]';
                    textStyle = 'text-white font-bold';
                    letterStyle = 'text-white font-black';
                  } else {
                    boxStyle = 'bg-[#E3F2FD] text-slate-800 border border-[#BBDEFB] shadow-2xs cursor-default';
                    textStyle = 'text-slate-800 font-semibold';
                    letterStyle = 'text-blue-900 font-bold';
                  }
                }

                return (
                  <button
                    type="button"
                    key={optKey}
                    disabled={hasAnswered}
                    onClick={(e) => handleSelectOption(currentQ.id, optKey, e)}
                    className={`w-full px-5 py-4 rounded-2xl text-left transition-all duration-200 flex items-center justify-between select-none ${boxStyle}`}
                  >
                    <div className="flex items-center gap-3 lg:gap-4">
                      <span className={`text-base sm:text-lg font-black ${letterStyle} shrink-0`}>
                        {optKey})
                      </span>
                      <div className="flex flex-col">
                        <span style={scaledTextStyle} className={`leading-snug text-sm sm:text-base ${textStyle}`}>
                          <MathText text={optText} />
                        </span>
                      </div>
                    </div>

                    {hasAnswered && isCorrect && (
                      <span className="w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-white flex items-center justify-center text-[#10b981] shrink-0 ml-3 shadow-md font-black">
                        <Check className="w-4 h-4 lg:w-4.5 lg:h-4.5 stroke-[3.5]" />
                      </span>
                    )}
                    {hasAnswered && isSelected && !isCorrect && (
                      <span className="w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-white flex items-center justify-center text-[#ef4444] shrink-0 ml-3 shadow-md text-xs lg:text-sm font-black">
                        ✕
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2.5 border-t border-purple-200/60 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFlagModalOpen(true)}
                  className="text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                >
                  <Flag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Flag</span>
                </button>
              </div>
              <span className="text-xs font-semibold text-slate-500">Focus Reading Mode</span>
            </div>
          </div>
        );

        // Focus Mode Explanation Box
        const renderFocusExplanationBox = (isSplit = false) => {
          if (!hasAnswered || !currentQ.explanation) return null;
          return (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-gradient-to-br from-[#fffdf7] via-[#fef9eb] to-[#fbf0d3] rounded-3xl border-2 border-amber-300/90 shadow-2xl p-5 sm:p-7 space-y-3.5 relative text-slate-900 ${
                isSplit ? 'md:sticky md:top-4' : ''
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-t-3xl" />
              
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
                    <Check className="w-4 h-4 stroke-[3.5]" />
                  </span>
                  <div>
                    <span className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
                      Concept Explanation
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">


                  <button
                    type="button"
                    onClick={() => setIsExplanationCollapsed(!isExplanationCollapsed)}
                    className="px-2.5 py-1.5 rounded-xl bg-white/80 hover:bg-white text-xs font-black text-slate-800 hover:text-amber-950 border border-amber-200/80 shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <span>{isExplanationCollapsed ? 'Show' : 'Hide'}</span>
                    {isExplanationCollapsed ? (
                      <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
                    )}
                  </button>
                </div>
              </div>

              {!isExplanationCollapsed && (
                <div style={scaledTextStyle} className="text-sm sm:text-base text-slate-900 leading-relaxed font-normal pt-1 space-y-2">
                  <MathText text={currentQ.explanation || ''} />
                </div>
              )}
            </motion.div>
          );
        };

        return (
          <div className={`fixed inset-0 z-[60] ${activeTheme.container} backdrop-blur-xl overflow-y-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col justify-between items-center animate-in fade-in duration-200 min-h-screen`}>
            {/* Ambient Eye-Care Radial Lighting */}
            <div className={`fixed inset-0 pointer-events-none ${activeTheme.ambientGlow}`} />

            {/* 1. TOP FOCUS HEADER BAR */}
            <div className={`relative z-10 w-full ${activeContainerWidth} mx-auto ${activeTheme.header} border rounded-2xl px-3 sm:px-5 py-2.5 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-2.5 transition-all duration-300`}>
              {/* Left: Exit Focus Mode Button & Active Subject Badge */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleFocusReadingMode}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95 shrink-0"
                  title="Exit Focus Mode (or press Esc)"
                >
                  <Minimize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[2.5]" />
                  <span>Exit Focus <kbd className="hidden sm:inline bg-amber-600/60 px-1 py-0.2 rounded text-[10px] text-slate-950 font-mono">Esc</kbd></span>
                </button>

                <div className="hidden md:flex items-center gap-1.5 text-xs text-amber-200/90 font-black tracking-wider truncate max-w-[200px]">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  <span className="truncate font-black uppercase tracking-wider">{activeTitle}</span>
                </div>

                <McqFontControls variant="dark" showLabel={false} />
              </div>

              {/* Center: Question Counter & Timer */}
              <div className="flex items-center gap-2 font-mono font-bold text-xs sm:text-sm">
                <PracticeTimerDisplay isSubmitted={isTestSubmitted} />
                <span className="bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/40 font-black">
                  {safeIdx + 1} / {activeQuestions.length}
                </span>
              </div>

              {/* Right: Background Tone Switcher + Quick Actions (Audio, Scratchpad, Settings, Palette, Submit) */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                {/* Background Theme Selector Swatches */}
                <div className="hidden sm:flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/10 mr-1" title="Change Focus Mode Background Colour">
                  {(['warm-espresso', 'soft-sepia', 'midnight-indigo', 'pure-dark'] as FocusBgTheme[]).map((themeKey) => {
                    const t = focusThemeStyles[themeKey];
                    const isSelected = focusBgTheme === themeKey;
                    return (
                      <button
                        type="button"
                        key={themeKey}
                        onClick={() => handleSetFocusBgTheme(themeKey)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-white/20 text-white shadow-xs ring-1 ring-white/40' 
                            : 'text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                        title={`Switch to ${t.label} Background`}
                      >
                        <span className={`w-2 h-2 rounded-full ${t.dot}`} />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>



                {/* Question Palette */}
                <button
                  type="button"
                  onClick={() => setIsPaletteOpen(!isPaletteOpen)}
                  className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer border ${
                    isPaletteOpen ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold' : `${activeTheme.headerBtn} text-amber-300`
                  }`}
                  title="Question Palette"
                >
                  <Layers className="h-3.5 w-3.5" />
                </button>

                {/* Display / Font Settings */}
                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className={`h-8 w-8 rounded-lg ${activeTheme.headerBtn} text-orange-400 flex items-center justify-center transition-colors cursor-pointer border`}
                    title="Display & Font Settings"
                  >
                    <Type className="h-3.5 w-3.5" />
                  </button>
                )}

                {/* 3D Motion & Flashcard settings */}
                <button
                  type="button"
                  onClick={() => setIsMotionModalOpen(true)}
                  className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer border ${activeTheme.headerBtn} text-indigo-300`}
                  title="3D Transition & Flashcard Settings"
                >
                  <Rotate3d className="h-3.5 w-3.5" />
                </button>



                {/* Submit */}
                <button
                  type="button"
                  onClick={handleSubmitTest}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs border border-amber-600 ml-1 shrink-0"
                >
                  Submit
                </button>
              </div>
            </div>



            {/* Focus Mode Question Palette Dropdown matching Focus Theme Colour */}
            {isPaletteOpen && (
              <div className={`relative z-20 w-full ${activeContainerWidth} mx-auto mt-2 p-4 rounded-2xl border shadow-2xl space-y-3 animate-in fade-in duration-150 ${activeTheme.paletteContainer}`}>
                <div className={`flex items-center justify-between border-b pb-2 ${activeTheme.paletteHeader}`}>
                  <span className="text-xs font-black uppercase tracking-wider">
                    Question Palette ({activeQuestions.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsPaletteOpen(false)}
                    className={`h-7 w-7 rounded-lg text-xs font-bold flex items-center justify-center transition-colors cursor-pointer ${activeTheme.paletteCloseBtn}`}
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-60 overflow-y-auto p-1 custom-scrollbar">
                  {activeQuestions.map((q, idx) => {
                    const userAns = selectedAnswers[q.id];
                    const isCorrect = userAns && userAns.toUpperCase().trim() === String(q.correctOption || '').toUpperCase().trim();
                    const isSelected = safeIdx === idx;

                    let dotStyle = `${activeTheme.paletteItemDefault}`;
                    if (userAns) {
                      if (isCorrect) {
                        dotStyle = 'bg-emerald-600 text-white border-emerald-500 shadow-md font-black';
                      } else {
                        dotStyle = 'bg-rose-600 text-white border-rose-500 shadow-md font-black';
                      }
                    }
                    if (isSelected) {
                      dotStyle += ' ring-2 ring-amber-400 font-black scale-105';
                    }

                    return (
                      <button
                        type="button"
                        key={q.id || idx}
                        onClick={() => {
                          setCurrentIdx(idx);
                          setIsPaletteOpen(false);
                        }}
                        className={`h-9 rounded-xl text-xs font-black flex items-center justify-center border transition-all cursor-pointer ${dotStyle}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. QUESTION, OPTIONS & EXPLANATION LAYOUT */}
            <div className={`relative z-10 w-full ${activeContainerWidth} mx-auto my-auto py-4`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={safeIdx}
                  variants={getQuestionMotionVariants(motionConfig.style, slideDir, motionConfig.reducedMotion)}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="w-full"
                  style={{
                    perspective: motionConfig.enable3dDepth ? 1200 : undefined,
                  }}
                >
                  <div className="w-full max-w-3xl lg:max-w-4xl mx-auto space-y-5">
                    {/* Question Box & Options Box (Stably mounted) */}
                    {renderFocusQuestionBox()}
                    {renderFocusOptionsBox()}

                    {/* Concept Explanation Box: stably rendered directly below options when answered */}
                    {isSplitView && (
                      renderFocusExplanationBox(false)
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* 3. CENTERED FOCUS BOTTOM NAVIGATION */}
            <div className={`relative z-10 w-full ${activeContainerWidth} mx-auto flex items-center justify-between gap-2.5 sm:gap-4 pt-3 pb-2 transition-all duration-300`}>
              <button
                type="button"
                disabled={safeIdx === 0}
                onClick={handlePrev}
                className={`flex-1 sm:flex-initial min-w-[100px] sm:min-w-[130px] px-3 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-black shadow-md flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer text-xs sm:text-sm active:scale-95 ${
                  safeIdx === 0
                    ? 'bg-black/30 text-white/30 border border-white/10 cursor-not-allowed opacity-50'
                    : `${activeTheme.navPrev} border-2`
                }`}
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.8]" />
                <span>Previous</span>
              </button>

              <div className="hidden md:flex items-center gap-2 text-xs text-amber-200/60 font-semibold">
                <span>{isSplitView ? 'Side-by-side explanation view active' : 'Distraction-free focus reading mode'}</span>
              </div>

              {safeIdx < activeQuestions.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 sm:flex-initial min-w-[100px] sm:min-w-[130px] px-3 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-[#1a66ff] hover:bg-[#1555d4] text-white font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer text-xs sm:text-sm active:scale-95"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitTest}
                  className="flex-1 sm:flex-initial min-w-[100px] sm:min-w-[130px] px-3 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-[#10b981] hover:bg-[#059669] text-white font-bold shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer text-xs sm:text-sm active:scale-95"
                >
                  <span>Submit Test</span>
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>
              )}
            </div>
          </div>
        );
      })()}


      {/* Flag Question Modal */}
      {isFlagModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  🚩
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Flag Question for Review</h3>
                  <p className="text-xs text-slate-500">Help us improve MCQ accuracy for everyone</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFlagModalOpen(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for flagging:</label>
                <div className="space-y-2">
                  {[
                    'Ambiguous / Confusing Question text',
                    'Incorrect Correct Answer option',
                    'Typo or Spelling mistake',
                    'Explanation is unclear / incorrect',
                    'Other issue'
                  ].map(reason => (
                    <label key={reason} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-800">
                      <input
                        type="radio"
                        name="flagReason"
                        value={reason}
                        checked={flagReason === reason}
                        onChange={e => setFlagReason(e.target.value)}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Additional details (Optional):</label>
                <textarea
                  value={flagNote}
                  onChange={e => setFlagNote(e.target.value)}
                  placeholder="Describe why this question needs admin attention..."
                  className="w-full rounded-2xl border border-slate-300 p-3 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none min-h-[80px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsFlagModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveFlag}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-md transition-colors cursor-pointer"
              >
                Submit Flag
              </button>
            </div>
          </div>
        </div>
      )}



      {/* 3D Motion and Flashcard Transition Settings Modal */}
      <PracticeMotionModal
        isOpen={isMotionModalOpen}
        onClose={() => setIsMotionModalOpen(false)}
        config={motionConfig}
        onChange={(newConfig) => setMotionConfig(newConfig)}
        title="MCQ Motion & 3D Transition Settings"
      />
    </div>
  );
}
