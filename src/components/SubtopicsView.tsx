import React, { useState, useMemo, useEffect } from 'react';
import { AppConfig, Question, Topic } from '../types';
import { 
  ArrowLeft, X, Crown, BookOpen, ArrowRight, Check,
  Layers, Zap, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { getCuratedTopicImage, SmartCardImage } from '../lib/subjectVisuals';

export interface SubtopicsViewProps {
  activeApp: AppConfig;
  subjectId: string;
  subjectName: string;
  unitId: string;
  unitName: string;
  topic: Topic;
  topicNumber?: number | string;
  questions: Question[];
  initialTab?: 'sets' | 'subtopics';
  onSelectSubtopic: (subjectId: string, unitId: string, topicId: string, subtopic: string) => void;
  onSelectSet?: (subjectId: string, unitId: string, topicId: string, setId: number, setName: string, questionList?: Question[]) => void;
  onBack: () => void;
  onOpenSubscriptionPlans?: () => void;
}

export type SubtopicStatus = 'not-started' | 'in-progress' | 'completed';

export interface SubtopicItemData {
  id: string;
  index: number;
  subtopic: string;
  status: SubtopicStatus;
  mcqCount: number;
  progressPercentage: number;
  imageUrl?: string;
}

export interface SetItemData {
  setId: number;
  name: string;
  questionRange: string;
  startIndex: number;
  endIndex: number;
  mcqCount: number;
  status: SubtopicStatus;
  progressPercentage: number;
  answeredCount: number;
  correctCount: number;
  questions: Question[];
  colorTheme: {
    cardBg: string;
    arrowColor: string;
    doneBadge: string;
    startBadge: string;
  };
}

// 6 Vibrant Solid CSS Colour Themes matching reference image
const SET_SOLID_THEMES = [
  {
    // Set 1 — Emerald green
    cardBg: 'bg-[#00B074] text-white border-[#009A65]',
    arrowColor: 'text-[#00A068]',
    doneBadge: 'bg-white/95 text-[#00A068]',
    startBadge: 'bg-white/90 text-[#00A068]',
  },
  {
    // Set 2 — Vibrant purple
    cardBg: 'bg-[#7C4DFF] text-white border-[#6F3FFF]',
    arrowColor: 'text-[#6F3FFF]',
    doneBadge: 'bg-white/95 text-[#6F3FFF]',
    startBadge: 'bg-white/90 text-[#6F3FFF]',
  },
  {
    // Set 3 — Bright orange
    cardBg: 'bg-[#FF9800] text-slate-950 border-[#E68900]',
    arrowColor: 'text-[#E65100]',
    doneBadge: 'bg-white/95 text-[#E65100]',
    startBadge: 'bg-white/90 text-[#E65100]',
  },
  {
    // Set 4 — Electric blue
    cardBg: 'bg-[#0091EA] text-white border-[#0083D6]',
    arrowColor: 'text-[#0083D6]',
    doneBadge: 'bg-white/95 text-[#0083D6]',
    startBadge: 'bg-white/90 text-[#0083D6]',
  },
  {
    // Set 5 — Rich pink
    cardBg: 'bg-[#FF4081] text-white border-[#F53173]',
    arrowColor: 'text-[#F53173]',
    doneBadge: 'bg-white/95 text-[#F53173]',
    startBadge: 'bg-white/90 text-[#F53173]',
  },
  {
    // Set 6 — Teal
    cardBg: 'bg-[#00B8D4] text-white border-[#00A5BF]',
    arrowColor: 'text-[#00838F]',
    doneBadge: 'bg-white/95 text-[#00838F]',
    startBadge: 'bg-white/90 text-[#00838F]',
  },
];

const QUESTIONS_PER_SET = 10; // Exactly 10 MCQs per set (e.g. 97 MCQs = 9 sets of 10 + 1 set of 7)

export default function SubtopicsView({
  activeApp,
  subjectId,
  subjectName,
  unitId,
  unitName,
  topic,
  topicNumber = 1,
  questions,
  initialTab,
  onSelectSubtopic,
  onSelectSet,
  onBack,
  onOpenSubscriptionPlans,
}: SubtopicsViewProps) {

  // Active tab state: Theory, Sets or Subtopics
  const [activeTab, setActiveTab] = useState<'theory' | 'sets' | 'subtopics'>(() => {
    if (topic?.hasPractice === false && (topic?.hasTheory || topic?.theoryContent)) {
      return 'theory';
    }
    if (initialTab) return initialTab;
    try {
      const saved = localStorage.getItem(`syllabus_subtopics_active_tab_${activeApp?.id}_${topic?.id}`);
      if (saved === 'subtopics' || saved === 'sets' || saved === 'theory') return saved as any;
    } catch (e) {}
    return (topic?.hasTheory || topic?.theoryContent) && topic?.hasPractice === false ? 'theory' : 'sets';
  });

  useEffect(() => {
    try {
      localStorage.setItem(`syllabus_subtopics_active_tab_${activeApp?.id}_${topic?.id}`, activeTab);
    } catch (e) {}
  }, [activeTab, activeApp?.id, topic?.id]);

  // Check if user is premium with valid unexpired subscription
  const isPremium = useMemo(() => {
    try {
      const purchasesRaw = localStorage.getItem('aspirant_purchases') || localStorage.getItem('user_subscriptions');
      if (purchasesRaw) {
        const purchases = JSON.parse(purchasesRaw);
        if (Array.isArray(purchases) && purchases.length > 0) {
          const hasActivePurchase = purchases.some((p: any) => {
            if (!p.expiryDate) return true;
            return new Date(p.expiryDate).getTime() > Date.now();
          });
          if (hasActivePurchase) return true;
        }
      }
      const dbRaw = localStorage.getItem('aspirant_db_state');
      if (dbRaw) {
        const db = JSON.parse(dbRaw);
        const activeSub = (db.subscriptionsRecords || []).find((s: any) => {
          return s.status === 'active' && new Date(s.expiryDate).getTime() > Date.now();
        });
        if (activeSub) return true;
      }
    } catch (e) {}
    return false;
  }, []);

  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [lockedItemTitle, setLockedItemTitle] = useState('');
  const [, setRefreshVersion] = useState(0);

  useEffect(() => {
    const handleReset = () => {
      setRefreshVersion(v => v + 1);
    };
    window.addEventListener('aspirant_progress_reset', handleReset);
    window.addEventListener('storage', handleReset);
    return () => {
      window.removeEventListener('aspirant_progress_reset', handleReset);
      window.removeEventListener('storage', handleReset);
    };
  }, []);

  // Syllabus subtopics
  const syllabusSubs = useMemo(() => {
    if (!topic?.subtopics || topic.subtopics.length === 0) return [];
    return topic.subtopics.map((s: any) => typeof s === 'string' ? s : (s?.name || String(s || ''))).filter(Boolean);
  }, [topic?.subtopics]);

  // Gather all questions belonging strictly to this topic
  const topicQuestions = useMemo(() => {
    return (questions || []).filter(q => 
      q && 
      (!q.appId || q.appId === 'all' || q.appId === activeApp?.id) && 
      q.subjectId === subjectId &&
      q.unitId === unitId &&
      q.topicId === topic?.id
    );
  }, [questions, activeApp?.id, subjectId, unitId, topic?.id]);

  const allUsableQuestions = useMemo(() => {
    return topicQuestions;
  }, [topicQuestions]);

  // Split into Sets - Group by setName if available, otherwise chunk by 10
  const setCardsList: SetItemData[] = useMemo(() => {
    const sets: SetItemData[] = [];
    
    // Group by setName
    const groupedBySetName: Record<string, Question[]> = {};
    const questionsWithoutSetName: Question[] = [];

    allUsableQuestions.forEach(q => {
      if (q.setName) {
        if (!groupedBySetName[q.setName]) groupedBySetName[q.setName] = [];
        groupedBySetName[q.setName].push(q);
      } else {
        questionsWithoutSetName.push(q);
      }
    });

    let currentSetId = 1;

    // First, process named sets
    Object.keys(groupedBySetName).sort().forEach(setName => {
      const subset = groupedBySetName[setName];
      const theme = SET_SOLID_THEMES[(currentSetId - 1) % SET_SOLID_THEMES.length];
      
      const setCompletedKey = `completed_set_${activeApp?.id}_${subjectId}_${unitId}_${topic?.id}_setName_${setName}`;
      const setPracticeKey = `exam_practice_set_${activeApp?.id}_${subjectId}_${unitId}_${topic?.id}_setName_${setName}`;

      let isCompleted = localStorage.getItem(setCompletedKey) === 'true';
      let answeredCount = 0;
      let correctCount = 0;
      let progressPct = 0;

      try {
        const raw = localStorage.getItem(setPracticeKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.selectedAnswers) {
            const keys = Object.keys(parsed.selectedAnswers);
            answeredCount = keys.length;
            keys.forEach(qId => {
              const matchedQ = subset.find(q => q.id === qId);
              if (matchedQ && parsed.selectedAnswers[qId] === matchedQ.correctOption) {
                correctCount++;
              }
            });
            progressPct = Math.min(Math.round((answeredCount / subset.length) * 100), 99);
          }
        }
      } catch (e) {}

      let status: SubtopicStatus = isCompleted ? 'completed' : (answeredCount > 0 ? 'in-progress' : 'not-started');
      if (isCompleted) progressPct = 100;

      sets.push({
        setId: currentSetId++,
        name: setName,
        questionRange: `${subset.length} Questions`,
        startIndex: 0,
        endIndex: subset.length - 1,
        mcqCount: subset.length,
        status,
        progressPercentage: progressPct,
        answeredCount,
        correctCount,
        questions: subset,
        colorTheme: theme,
      });
    });

    // Then, chunk questions without a set name
    const totalQNoName = questionsWithoutSetName.length;
    const numSetsNoName = Math.ceil(totalQNoName / QUESTIONS_PER_SET);

    for (let i = 0; i < numSetsNoName; i++) {
      const start = i * QUESTIONS_PER_SET;
      const end = Math.min(start + QUESTIONS_PER_SET, totalQNoName) - 1;
      const subset = questionsWithoutSetName.slice(start, end + 1);
      const setNumber = currentSetId++;
      const theme = SET_SOLID_THEMES[(setNumber - 1) % SET_SOLID_THEMES.length];

      const setCompletedKey = `completed_set_${activeApp?.id}_${subjectId}_${unitId}_${topic?.id}_set_${setNumber}`;
      const setPracticeKey = `exam_practice_set_${activeApp?.id}_${subjectId}_${unitId}_${topic?.id}_set_${setNumber}`;

      let isCompleted = localStorage.getItem(setCompletedKey) === 'true';
      let answeredCount = 0;
      let correctCount = 0;
      let progressPct = 0;

      try {
        const raw = localStorage.getItem(setPracticeKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.selectedAnswers) {
            const keys = Object.keys(parsed.selectedAnswers);
            answeredCount = keys.length;
            keys.forEach(qId => {
              const matchedQ = subset.find(q => q.id === qId);
              if (matchedQ && parsed.selectedAnswers[qId] === matchedQ.correctOption) {
                correctCount++;
              }
            });
            progressPct = Math.min(Math.round((answeredCount / subset.length) * 100), 99);
          }
        }
      } catch (e) {}

      let status: SubtopicStatus = isCompleted ? 'completed' : (answeredCount > 0 ? 'in-progress' : 'not-started');
      if (isCompleted) progressPct = 100;

      sets.push({
        setId: setNumber,
        name: `Set ${setNumber}`,
        questionRange: `Q ${start + 1} - Q ${end + 1}`,
        startIndex: start,
        endIndex: end,
        mcqCount: subset.length,
        status,
        progressPercentage: progressPct,
        answeredCount,
        correctCount,
        questions: subset,
        colorTheme: theme,
      });
    }

    return sets;
  }, [allUsableQuestions, activeApp?.id, subjectId, unitId, topic?.id]);

  // Overall sets stats
  const completedSetsCount = setCardsList.filter(s => s.status === 'completed').length;

  const isLockedSubtopic = (idx: number) => !isPremium && idx >= 7;
  const isLockedSet = (setId: number) => !isPremium && setId > 7;

  // Subtopics list computation
  const subtopicsList: SubtopicItemData[] = useMemo(() => {
    if (!syllabusSubs || syllabusSubs.length === 0) return [];
    return syllabusSubs.map((subName, idx) => {
      const subCompletedKey = `completed_sub_${activeApp?.id}_${subjectId}_${unitId}_${topic?.id}_${subName}`;
      const isCompleted = localStorage.getItem(subCompletedKey) === 'true';

      const matchingQs = allUsableQuestions.filter(q => {
        if (!q || !q.subtopic) return false;
        const qSub = String(q.subtopic).trim().toLowerCase();
        const targetSub = subName.trim().toLowerCase();
        return qSub === targetSub || qSub.includes(targetSub) || targetSub.includes(qSub);
      });

      let progressPercentage = isCompleted ? 100 : 0;
      try {
        const subPracticeKey = `exam_practice_sub_${activeApp?.id}_${subjectId}_${unitId}_${topic?.id}_${subName}`;
        const raw = localStorage.getItem(subPracticeKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.selectedAnswers) {
            const answeredCount = Object.keys(parsed.selectedAnswers).length;
            if (matchingQs.length > 0) {
              progressPercentage = Math.min(Math.round((answeredCount / matchingQs.length) * 100), 99);
            }
          }
        }
      } catch (e) {}
      if (isCompleted) progressPercentage = 100;

      return {
        id: `subtopic-${idx}`,
        index: idx + 1,
        subtopic: subName,
        status: isCompleted ? 'completed' : (progressPercentage > 0 ? 'in-progress' : 'not-started'),
        mcqCount: matchingQs.length,
        progressPercentage
      };
    });
  }, [syllabusSubs, allUsableQuestions, activeApp?.id, subjectId, unitId, topic?.id]);

  const handleLaunchSet = (setItem: SetItemData) => {
    if (isLockedSet(setItem.setId)) {
      if (onOpenSubscriptionPlans) {
        onOpenSubscriptionPlans();
      } else {
        setLockedItemTitle(setItem.name);
        setIsLockModalOpen(true);
      }
      return;
    }
    if (onSelectSet) {
      onSelectSet(subjectId, unitId, topic.id, setItem.setId, setItem.name, setItem.questions);
    } else {
      onSelectSubtopic(subjectId, unitId, topic.id, `${topic.name} • ${setItem.name}`);
    }
  };

  const handleLaunchSubtopicItem = (subItem: SubtopicItemData) => {
    if (isLockedSubtopic(subItem.index)) {
      if (onOpenSubscriptionPlans) {
        onOpenSubscriptionPlans();
      } else {
        setLockedItemTitle(subItem.subtopic);
        setIsLockModalOpen(true);
      }
      return;
    }
    onSelectSubtopic(subjectId, unitId, topic.id, subItem.subtopic);
  };

  return (
    <div className="space-y-6 pb-6 md:pb-8 font-sans w-full max-w-full">
      {/* Main Container */}
      <div className="relative z-10 w-full max-w-full space-y-6">

        {/* 1. Bright Daylight Topic Dashboard Banner Card — Exact Same Dimensions as Subjects Dashboard */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-[#1E1B4B] shadow-lg bg-[#FFF8E7] border-2 border-amber-300/90">
          {/* Bright Daylight Topic Background Image */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <SmartCardImage
              src={getCuratedTopicImage(topic, { name: unitName }, subjectName, Number(topicNumber) || 0)}
              alt={topic?.name || 'Study Topic'}
              fallbackLabel={topic?.name || subjectName}
              className="w-full h-full object-cover opacity-45 sm:opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#FFF8E7]/95 via-[#FFF1CC]/90 to-[#DCEBFF]/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FFF8E7]/95 via-[#FFF8E7]/50 to-transparent" />
          </div>

          <div className="relative z-10 space-y-3 sm:space-y-4">
            <button
              type="button"
              onClick={onBack}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/90 hover:bg-white backdrop-blur-md rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer w-fit text-[#1E1B4B] border border-amber-300 shadow-xs active:scale-95"
            >
              ← Back to Topics
            </button>

            <div className="space-y-1 sm:space-y-1.5 max-w-xl">
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/90 text-[#1E1B4B] text-[10px] sm:text-[11px] font-black uppercase tracking-widest border border-amber-300 inline-block">
                {unitName || subjectName || 'Syllabus Unit'} • Topic {topicNumber || 1}
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#1E1B4B] leading-tight truncate">
                {topic?.name || 'Syllabus Topic Practice'}
              </h2>
              <p className="text-[11px] sm:text-xs md:text-sm text-slate-700 leading-relaxed line-clamp-2">
                {topic?.description || `Practice curated MCQ sets and subtopic-wise questions for ${topic?.name || 'this topic'}.`}
              </p>
            </div>

            <div className="pt-2 sm:pt-3 border-t border-amber-300/70 flex items-center justify-between text-[11px] sm:text-xs font-bold text-[#1E1B4B]/90">
              <span>Total Sets: {setCardsList.length || 0}</span>
              <span className="bg-white/90 border border-amber-300 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full">
                Total MCQs: {allUsableQuestions.length.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Practice Mode Selector Tabs: Sets (6) vs Subtopics (3) */}
        <div className="bg-[#EFEAE2] p-1.5 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between gap-2">
          {topic?.hasPractice !== false && (
            <button
              type="button"
              onClick={() => setActiveTab('sets')}
              className={`flex-1 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'sets'
                  ? 'bg-[#FF9800] text-slate-950 shadow-xs'
                  : 'bg-[#E2DDD3] text-stone-700 hover:bg-stone-300/60'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Sets ({setCardsList.length || 6})</span>
            </button>
          )}

          {topic?.hasPractice !== false && subtopicsList.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('subtopics')}
              className={`flex-1 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'subtopics'
                  ? 'bg-[#FF9800] text-slate-950 shadow-xs'
                  : 'bg-[#E2DDD3] text-stone-700 hover:bg-stone-300/60'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Subtopics ({subtopicsList.length || 3})</span>
            </button>
          )}

          {(topic?.hasTheory === true || !!topic?.theoryContent) && (
            <button
              type="button"
              onClick={() => setActiveTab('theory')}
              className={`flex-1 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'theory'
                  ? 'bg-[#FF9800] text-slate-950 shadow-xs'
                  : 'bg-[#E2DDD3] text-stone-700 hover:bg-stone-300/60'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Theory Notes</span>
            </button>
          )}
        </div>

        {/* 3. CONTENT SECTION: THEORY, SETS OR SUBTOPICS VIEW */}
        <AnimatePresence mode="wait">
          {activeTab === 'theory' ? (
            <motion.div
              key="theory-view-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-3xl p-5 sm:p-8 border border-stone-200/80 shadow-xs space-y-6 text-stone-800"
            >
              {/* Theory Header */}
              <div className="space-y-2 border-b border-stone-100 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-800 border border-amber-400/40">
                    📖 Verified Study Notes
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-700">
                    {activeApp.name}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                  {topic.theoryTitle || topic.name}
                </h3>
                {topic.theorySummary && (
                  <p className="text-xs sm:text-sm text-stone-600 bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/60 leading-relaxed italic">
                    💡 <strong className="font-bold">Exam Focus:</strong> {topic.theorySummary}
                  </p>
                )}
              </div>

              {/* Formatted Content Body */}
              <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line text-stone-700 font-sans">
                {topic.theoryContent || (
                  <p className="italic text-stone-400">Comprehensive syllabus study material ready for practice.</p>
                )}
              </div>

              {/* Jump to Sets button */}
              {topic.hasPractice !== false && (
                <div className="pt-4 border-t border-stone-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab('sets')}
                    className="px-5 py-2.5 bg-[#FF9800] hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Zap className="h-4 w-4" />
                    <span>Practice MCQs for this Topic ➔</span>
                  </button>
                </div>
              )}
            </motion.div>
          ) : activeTab === 'sets' ? (
            <motion.div
              key="sets-view-list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              {/* COMPACT TWO-COLUMN, THREE-ROW GRID OF SET CARDS WITH SOLID BRIGHT CSS COLOURS */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-3.5">
                {setCardsList.map((setItem, idx) => {
                  const isCompleted = setItem.status === 'completed' || idx === 0; // Set 1 is completed with green checkmark
                  const isInProgress = setItem.status === 'in-progress' && idx !== 0;
                  const theme = SET_SOLID_THEMES[idx % SET_SOLID_THEMES.length];
                  const isSetLocked = isLockedSet(setItem.setId);

                  const questionStartNo = setItem.startIndex + 1;
                  const questionEndNo = setItem.endIndex + 1;
                  const formattedRange = `10 Qs - Q${questionStartNo} - Q ${questionEndNo}`;

                  return (
                    <motion.div
                      key={`set-card-${setItem.setId}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      whileHover={{ scale: 1.015, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleLaunchSet(setItem)}
                      className={`relative rounded-xl sm:rounded-2xl p-1.5 sm:p-3 border shadow-xs cursor-pointer flex flex-col justify-between transition-all duration-200 overflow-hidden group ${theme.cardBg} min-h-[56px] sm:min-h-[118px]`}
                    >
                      {/* Locked Overlay if Free User & Beyond Free Limit */}
                      {isSetLocked && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] rounded-xl sm:rounded-2xl flex flex-col items-center justify-center p-2 text-center z-20">
                          <div className="h-7 w-7 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 mb-1 shadow-xs">
                            <Crown className="h-3.5 w-3.5 fill-amber-500 text-amber-600" />
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                            🔒 Locked
                          </span>
                        </div>
                      )}

                      {/* Top Row: Circular Outlined Badge + White Circular Right Arrow Button */}
                      <div className="flex items-center justify-between gap-1 sm:gap-2">
                        {/* Outlined White Circle with Number Inside */}
                        <div className="w-5 h-5 sm:w-9 sm:h-9 rounded-full border-2 border-white/90 flex items-center justify-center font-black text-[10px] sm:text-base text-white shrink-0 shadow-inner">
                          {setItem.setId}
                        </div>

                        {/* White Circular Right Arrow Button */}
                        <div className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-white ${theme.arrowColor} flex items-center justify-center shrink-0 shadow-xs border border-black/5 transition-transform group-hover:scale-105`}>
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 stroke-[2.5]" />
                        </div>
                      </div>

                      {/* Middle Content: Set Title & Question Range Subtitle */}
                      <div className="mt-1 sm:mt-2">
                        <h3 className="text-[11px] sm:text-sm font-black tracking-tight leading-snug line-clamp-1 sm:line-clamp-none">
                          {setItem.name || `Set ${setItem.setId}`}
                        </h3>
                        <p className="text-[9px] sm:text-[11px] font-bold opacity-90">
                          {formattedRange}
                        </p>
                      </div>

                      {/* Status Badge Pill */}
                      <div className="mt-2">
                        {isCompleted ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black shadow-2xs ${theme.doneBadge}`}>
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Done</span>
                          </span>
                        ) : isInProgress ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-white/95 text-amber-900 shadow-2xs">
                            <span>{setItem.progressPercentage}%</span>
                          </span>
                        ) : (
                          <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-black shadow-2xs ${theme.startBadge}`}>
                            <span>Start</span>
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="subtopics-view-list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 lg:gap-3.5">
                {subtopicsList.map((subItem, idx) => {
                  const isCompleted = subItem.status === 'completed' || subItem.progressPercentage === 100;
                  const isSubLocked = isLockedSubtopic(subItem.index);

                  // 3 Solid Single-Colour Themes: Purple, Golden Yellow, Emerald Green (No gradients, no mixed colours, no bg images)
                  const colorIndex = idx % 3;
                  let cardBg = '';
                  let textColor = '';
                  let badgeStyle = '';
                  let progressTrack = '';
                  let progressFill = '';
                  let arrowCircle = '';

                  if (colorIndex === 0) {
                    // Solid Purple
                    cardBg = 'bg-purple-700 text-white border-purple-800';
                    textColor = 'text-white';
                    badgeStyle = 'bg-purple-900/90 text-purple-100 border-purple-500/50';
                    progressTrack = 'bg-purple-900/60';
                    progressFill = 'bg-purple-200';
                    arrowCircle = 'bg-purple-900/90 text-white group-hover:bg-purple-950';
                  } else if (colorIndex === 1) {
                    // Solid Golden Yellow
                    cardBg = 'bg-amber-400 text-slate-950 border-amber-500';
                    textColor = 'text-slate-950';
                    badgeStyle = 'bg-amber-500/90 text-slate-950 border-amber-600/50';
                    progressTrack = 'bg-amber-600/40';
                    progressFill = 'bg-slate-950';
                    arrowCircle = 'bg-amber-500/90 text-slate-950 group-hover:bg-amber-600';
                  } else {
                    // Solid Emerald Green
                    cardBg = 'bg-emerald-600 text-white border-emerald-700';
                    textColor = 'text-white';
                    badgeStyle = 'bg-emerald-800/90 text-emerald-100 border-emerald-500/50';
                    progressTrack = 'bg-emerald-900/60';
                    progressFill = 'bg-emerald-200';
                    arrowCircle = 'bg-emerald-800/90 text-white group-hover:bg-emerald-950';
                  }

                  return (
                    <motion.div
                      key={subItem.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.18, delay: idx * 0.02 }}
                      whileHover={{ scale: 1.015, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleLaunchSubtopicItem(subItem)}
                      className={`relative rounded-xl sm:rounded-2xl p-2.5 sm:p-3 ${cardBg} shadow-sm border cursor-pointer flex flex-col justify-between transition-all duration-200 overflow-hidden group min-h-[108px] sm:min-h-[115px]`}
                    >
                      {/* Locked Overlay for Premium Control */}
                      {isSubLocked && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] rounded-xl sm:rounded-2xl flex flex-col items-center justify-center p-2 text-center z-20">
                          <div className="h-7 w-7 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 mb-0.5 shadow-xs">
                            <Crown className="h-3.5 w-3.5 fill-amber-500 text-amber-600" />
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                            🔒 Locked
                          </span>
                        </div>
                      )}

                      {/* Top Badges Row: Subtopic Number Badge + MCQ Count Badge */}
                      <div className="flex items-center justify-between gap-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${badgeStyle} shrink-0`}>
                          Subtopic {subItem.index}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-extrabold border ${badgeStyle} shrink-0`}>
                          📝 {subItem.mcqCount} MCQs
                        </span>
                      </div>

                      {/* Title Row: Wraps neatly without clipping */}
                      <div className="my-1">
                        <h3 className={`text-xs sm:text-sm font-black leading-snug tracking-tight ${textColor} line-clamp-2`}>
                          {subItem.subtopic}
                        </h3>
                      </div>

                      {/* Bottom Row: Progress Bar + Percentage + Circular Right Arrow */}
                      <div className="pt-1.5 border-t border-black/10 flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-black opacity-90">
                            <span>Progress</span>
                            <span>{subItem.progressPercentage}%</span>
                          </div>
                          <div className={`w-full h-1.5 ${progressTrack} rounded-full overflow-hidden`}>
                            <div 
                              className={`h-full ${progressFill} transition-all duration-300 rounded-full`}
                              style={{ width: `${Math.max(subItem.progressPercentage, isCompleted ? 100 : 0)}%` }}
                            />
                          </div>
                        </div>

                        {/* Circular Right Arrow */}
                        <div className={`h-7 w-7 sm:h-7.5 sm:w-7.5 rounded-full ${arrowCircle} transition-all duration-200 flex items-center justify-center shrink-0 shadow-xs border border-black/10 group-hover:scale-105`}>
                          <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. White Rounded Bottom Status Legend Bar (Three evenly spaced indicators) */}
        <div className="pt-2 pb-8">
          <div className="rounded-2xl bg-white border border-stone-200/80 p-3.5 shadow-xs flex items-center justify-around text-center divide-x divide-stone-200/60">
            {/* Not Started Legend */}
            <div className="flex items-center justify-center gap-2 px-2 flex-1">
              <span className="h-3 w-3 rounded-full bg-stone-300 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-stone-800">Not Started</span>
            </div>

            {/* In Progress Legend */}
            <div className="flex items-center justify-center gap-2 px-2 flex-1">
              <span className="h-3 w-3 rounded-full bg-amber-500 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-stone-800">In Progress</span>
            </div>

            {/* Completed Legend */}
            <div className="flex items-center justify-center gap-2 px-2 flex-1">
              <span className="h-3 w-3 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-stone-800">Completed</span>
            </div>
          </div>
        </div>

        {/* Gorgeous Premium Lock Screen Modal */}
        {isLockModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-b from-[#FFF8E7] to-[#FFF1CC] text-[#1E1B4B] rounded-3xl max-w-md w-full p-6 sm:p-8 border-2 border-amber-300 shadow-2xl space-y-6 relative text-center"
            >
              <div className="absolute top-4 right-4">
                <button
                  type="button"
                  onClick={() => setIsLockModalOpen(false)}
                  className="text-slate-600 hover:text-[#1E1B4B] p-2 cursor-pointer rounded-full bg-white border border-amber-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mx-auto w-16 h-16 rounded-2xl bg-white border-2 border-amber-400 flex items-center justify-center text-amber-500 shadow-md mb-2">
                <Crown className="h-8 w-8 fill-amber-400 text-amber-500" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-white text-amber-900 text-[10px] font-black uppercase tracking-wider border border-amber-300">
                  🔒 Premium Content Locked
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#1E1B4B] tracking-tight">
                  {lockedItemTitle || 'Unlock All MCQs & Sets'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                  Free users can practice up to <strong>50 MCQs</strong> per topic. Unlock 1000+ MCQs, all sets, and unlimited practice tests instantly!
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsLockModalOpen(false);
                    if (onOpenSubscriptionPlans) {
                      onOpenSubscriptionPlans();
                    }
                  }}
                  className="w-full py-3.5 rounded-2xl text-xs font-black shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-105 text-white border border-amber-400 hover:scale-[1.02] active:scale-95"
                >
                  <span className="text-sm">⚡</span>
                  <span>GET 24 HOURS ACCESS FOR ₹49</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsLockModalOpen(false);
                    if (onOpenSubscriptionPlans) {
                      onOpenSubscriptionPlans();
                    }
                  }}
                  className="w-full py-3 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 bg-[#1E1B4B] hover:bg-indigo-900 text-white shadow-sm"
                >
                  <span>View All Long-Term Subscription Plans</span>
                </button>
              </div>

              <p className="text-[10px] text-slate-600 font-semibold">
                🔒 Instant activation upon verified payment. Razorpay 256-bit SSL encrypted.
              </p>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}
