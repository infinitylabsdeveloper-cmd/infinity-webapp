import React, { useState, useEffect, useMemo } from 'react';
import { AppConfig, Question, Subject, Topic, Unit } from '../types';
import { 
  BookOpen, ChevronRight, Layers, ArrowLeft, Loader2, Compass, Award, 
  ShieldCheck, TrendingUp, Zap, BarChart2, Check, ArrowUpRight, X, Sparkles,
  Folder, ChevronDown, CheckCircle2, CircleDot, PlayCircle, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SubtopicsView from './SubtopicsView';
import LevelSetsView from './LevelSetsView';
import TheoryReaderModal from './TheoryReaderModal';
import {
  getCuratedSubjectImage,
  getCuratedUnitImage,
  getCuratedTopicImage,
  getBrightCardTheme,
  SmartCardImage,
  ReferenceStatStrip,
  computeSetsFromQuestions,
  computeTopicCompletionPercentage,
} from '../lib/subjectVisuals';

interface SyllabusExploreProps {
  activeApp: AppConfig;
  questions: Question[];
  initialSubjectId?: string;
  onSelectSubtopic: (subjectId: string, unitId: string, topicId: string, subtopic: string) => void;
  onSelectSet?: (subjectId: string, unitId: string, topicId: string, setId: number, setName: string, questionList?: Question[]) => void;
  onBackToHome: () => void;
  onOpenSubscriptionPlans?: () => void;
  selectedLanguage: string;
}

export default function SyllabusExplore({
  activeApp,
  questions,
  initialSubjectId,
  onSelectSubtopic,
  onSelectSet,
  onBackToHome,
  onOpenSubscriptionPlans,
  selectedLanguage,
}: SyllabusExploreProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`syllabus_selected_subject_id_${activeApp.id}`);
      if (saved) return saved;
    } catch (e) {}
    return initialSubjectId || activeApp.syllabus[0]?.id || '';
  });
  
  // Active selected unit (null means showing Units overview/list)
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(`syllabus_selected_unit_id_${activeApp.id}`);
      if (saved) return saved;
    } catch (e) {}
    return null;
  });
  const [viewMode, setViewMode] = useState<'units' | 'all-topics'>(() => {
    try {
      const saved = localStorage.getItem(`syllabus_view_mode_${activeApp.id}`);
      if (saved === 'all-topics' || saved === 'units') return saved;
    } catch (e) {}
    return 'units';
  });
  
  const [selectedTopicForSubtopics, setSelectedTopicForSubtopics] = useState<{
    unitId: string;
    unitName: string;
    topic: Topic;
  } | null>(() => {
    try {
      const saved = localStorage.getItem(`syllabus_selected_topic_for_subtopics_${activeApp.id}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [readingTheoryTopic, setReadingTheoryTopic] = useState<{ topic: Topic; unitName: string } | null>(null);
  const [refreshVersion, setRefreshVersion] = useState<number>(0);

  useEffect(() => {
    try {
      if (selectedSubjectId) {
        localStorage.setItem(`syllabus_selected_subject_id_${activeApp.id}`, selectedSubjectId);
      }
    } catch (e) {}
  }, [selectedSubjectId, activeApp.id]);

  useEffect(() => {
    try {
      if (selectedUnitId) {
        localStorage.setItem(`syllabus_selected_unit_id_${activeApp.id}`, selectedUnitId);
      } else {
        localStorage.removeItem(`syllabus_selected_unit_id_${activeApp.id}`);
      }
    } catch (e) {}
  }, [selectedUnitId, activeApp.id]);

  useEffect(() => {
    try {
      localStorage.setItem(`syllabus_view_mode_${activeApp.id}`, viewMode);
    } catch (e) {}
  }, [viewMode, activeApp.id]);

  useEffect(() => {
    try {
      if (selectedTopicForSubtopics) {
        localStorage.setItem(`syllabus_selected_topic_for_subtopics_${activeApp.id}`, JSON.stringify(selectedTopicForSubtopics));
      } else {
        localStorage.removeItem(`syllabus_selected_topic_for_subtopics_${activeApp.id}`);
      }
    } catch (e) {}
  }, [selectedTopicForSubtopics, activeApp.id]);

  useEffect(() => {
    const handleProgressReset = () => {
      setRefreshVersion(v => v + 1);
    };
    window.addEventListener('aspirant_progress_reset', handleProgressReset);
    window.addEventListener('storage', handleProgressReset);
    return () => {
      window.removeEventListener('aspirant_progress_reset', handleProgressReset);
      window.removeEventListener('storage', handleProgressReset);
    };
  }, []);

  useEffect(() => {
    const isReturning = localStorage.getItem('aspirant_returning_from_practice') === 'true';
    if (isReturning) {
      localStorage.removeItem('aspirant_returning_from_practice');
      try {
        const savedTopic = localStorage.getItem(`syllabus_selected_topic_for_subtopics_${activeApp.id}`);
        const savedUnit = localStorage.getItem(`syllabus_selected_unit_id_${activeApp.id}`);
        const savedSubject = localStorage.getItem(`syllabus_selected_subject_id_${activeApp.id}`);
        if (savedTopic) setSelectedTopicForSubtopics(JSON.parse(savedTopic));
        if (savedUnit) setSelectedUnitId(savedUnit);
        if (savedSubject) setSelectedSubjectId(savedSubject);
      } catch (e) {}
      return;
    }

    if (initialSubjectId) {
      setSelectedSubjectId(initialSubjectId);
      setSelectedUnitId(null);
      setSelectedTopicForSubtopics(null);
      try {
        localStorage.removeItem(`syllabus_selected_unit_id_${activeApp.id}`);
        localStorage.removeItem(`syllabus_selected_topic_for_subtopics_${activeApp.id}`);
      } catch (e) {}
    }
  }, [initialSubjectId, activeApp.id]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [selectedSubjectId, selectedUnitId]);

  const currentSubject: Subject = activeApp.syllabus.find(s => s.id === selectedSubjectId) || activeApp.syllabus[0] || {
    id: 'default',
    name: 'General Studies',
    icon: 'BookOpen',
    units: []
  };

  const selectedUnit: Unit | undefined = currentSubject.units?.find(u => u.id === selectedUnitId);

  const subjectUnits = currentSubject.units || [];
  const totalSubjectTopicsCount = subjectUnits.reduce((acc, u) => acc + (u.topics?.length || 0), 0);

  // Strict filtering: match appId and language preference
  const appQuestions = useMemo(() => {
    return (questions || []).filter(q => 
      q && 
      q.appId === activeApp?.id && 
      (q.language === selectedLanguage || (!q.language && selectedLanguage === 'en'))
    );
  }, [questions, activeApp?.id, selectedLanguage]);

  // Pre-indexed Question Counts & Lists Map by Unit, Topic, and Subtopic (Single O(N) pass)
  const {
    topicQuestionsCountMap,
    unitQuestionsCountMap,
    subtopicQuestionsCountMap,
    topicQuestionsListMap,
    unitDirectQuestionsListMap,
  } = useMemo(() => {
    const topicMap: Record<string, number> = {};
    const unitMap: Record<string, number> = {};
    const subtopicMap: Record<string, number> = {};
    const topicListMap: Record<string, Question[]> = {};
    const unitDirectListMap: Record<string, Question[]> = {};

    (appQuestions || []).forEach(q => {
      if (!q) return;
      if (q.subjectId && q.unitId) {
        const uKey = `${q.subjectId}_${q.unitId}`;
        unitMap[uKey] = (unitMap[uKey] || 0) + 1;
        if (!q.topicId) {
          if (!unitDirectListMap[uKey]) unitDirectListMap[uKey] = [];
          unitDirectListMap[uKey].push(q);
        }
      }
      if (q.subjectId && q.topicId) {
        const tKey = `${q.subjectId}_${q.topicId}`;
        topicMap[tKey] = (topicMap[tKey] || 0) + 1;
        if (!topicListMap[tKey]) topicListMap[tKey] = [];
        topicListMap[tKey].push(q);
      }
      if (q.subjectId && q.topicId && q.subtopic) {
        const sKey = `${q.subjectId}_${q.unitId || ''}_${q.topicId}_${String(q.subtopic).toLowerCase().trim()}`;
        subtopicMap[sKey] = (subtopicMap[sKey] || 0) + 1;
      }
    });

    return {
      topicQuestionsCountMap: topicMap,
      unitQuestionsCountMap: unitMap,
      subtopicQuestionsCountMap: subtopicMap,
      topicQuestionsListMap: topicListMap,
      unitDirectQuestionsListMap: unitDirectListMap,
    };
  }, [appQuestions]);

  // Fast in-memory cache of local progress to prevent blocking disk I/O on every subtopic
  const progressCache = useMemo(() => {
    const cache: Record<string, string | null> = {};
    try {
      const prefixCompleted = `completed_sub_${activeApp.id}`;
      const prefixPractice = `exam_practice_${activeApp.id}`;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith(prefixCompleted) || key.startsWith(prefixPractice))) {
          cache[key] = localStorage.getItem(key);
        }
      }
    } catch (e) {}
    return cache;
  }, [activeApp.id, refreshVersion]);

  const getSubName = (val: any): string => {
    if (typeof val === 'string') return val;
    if (val && typeof val === 'object' && 'name' in val) return String(val.name);
    return String(val || '');
  };

  const getSubtopicState = (sId: string, uId: string, tId: string, sub: string) => {
    const completedKey = `completed_sub_${activeApp.id}_${sId}_${uId}_${tId}_${sub}`;
    if (progressCache[completedKey] === 'true') return 'completed';
    
    const practiceKey = `exam_practice_${activeApp.id}_${sId}_${uId}_${tId}_${sub}`;
    const raw = progressCache[practiceKey];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.selectedAnswers && Object.keys(parsed.selectedAnswers).length > 0) {
          return 'in-progress';
        }
      } catch (e) {}
    }
    return 'not-started';
  };

  const getSubtopicPercentage = (sId: string, uId: string, tId: string, sub: any) => {
    const subName = getSubName(sub);
    const state = getSubtopicState(sId, uId, tId, subName);
    if (state === 'completed') return 100;
    if (state === 'in-progress') {
      const practiceKey = `exam_practice_${activeApp.id}_${sId}_${uId}_${tId}_${subName}`;
      const raw = progressCache[practiceKey];
      try {
        const parsed = JSON.parse(raw!);
        const ansCount = Object.keys(parsed.selectedAnswers || {}).length;
        const subKey = `${sId}_${uId || ''}_${tId || ''}_${subName.toLowerCase().trim()}`;
        const subQCount = subtopicQuestionsCountMap[subKey] || 1;
        const pct = Math.min(Math.round((ansCount / subQCount) * 100), 99);
        return Math.max(pct, 15);
      } catch (e) {
        return 40;
      }
    }
    return 0;
  };

  const getTopicSetsCount = (sId: string, topic?: Topic) => {
    if (!topic) return 0;
    const list = topicQuestionsListMap[`${sId}_${topic.id}`] || [];
    return computeSetsFromQuestions(list);
  };

  const getUnitSetsCount = (sId: string, unit?: Unit) => {
    if (!unit) return 0;
    let total = computeSetsFromQuestions(unitDirectQuestionsListMap[`${sId}_${unit.id}`] || []);
    (unit.topics || []).forEach(t => {
      if (t) total += getTopicSetsCount(sId, t);
    });
    if (total === 0) {
      const uMcqs = unitQuestionsCountMap[`${sId}_${unit.id}`] || 0;
      if (uMcqs > 0) total = Math.ceil(uMcqs / 10);
    }
    return total;
  };

  const getTopicPercentage = (sId: string, uId: string, topic?: Topic) => {
    if (!topic) return 0;
    const tList = topicQuestionsListMap[`${sId}_${topic.id}`] || [];
    const setOrSubPct = computeTopicCompletionPercentage(activeApp.id, sId, uId, topic, tList);
    if (setOrSubPct > 0) return setOrSubPct;

    const subtopics = topic.subtopics || [];
    if (subtopics.length === 0) {
      const state = getSubtopicState(sId, uId, topic.id, topic.name);
      return state === 'completed' ? 100 : state === 'in-progress' ? 50 : 0;
    }
    const total = subtopics.reduce((acc: number, sub: any) => acc + getSubtopicPercentage(sId, uId, topic.id, sub), 0);
    return Math.round(total / (subtopics.length || 1));
  };

  const getUnitPercentage = (sId: string, unit?: Unit) => {
    if (!unit) return 0;
    const topics = unit.topics || [];
    if (topics.length === 0) return 0;
    const total = topics.reduce((acc, t) => acc + (t ? getTopicPercentage(sId, unit.id, t) : 0), 0);
    return Math.round(total / (topics.length || 1));
  };

  const getUnitQuestionsCount = (sId: string, unit?: Unit) => {
    if (!unit) return 0;
    return unitQuestionsCountMap[`${sId}_${unit.id}`] || 0;
  };

  // Accurate count of all MCQs belonging to current subject
  const totalSubjectQuestionsCount = useMemo(() => {
    if (!currentSubject) return 0;
    const sId = currentSubject.id;
    const unitIds = new Set((currentSubject.units || []).map(u => u.id));
    const allTopicIds = new Set((currentSubject.units || []).flatMap(u => (u.topics || []).map(t => t.id)));
    
    return (appQuestions || []).filter(q => {
      if (!q) return false;
      if (q.subjectId && q.subjectId === sId) return true;
      if (q.unitId && unitIds.has(q.unitId)) return true;
      if (q.topicId && allTopicIds.has(q.topicId)) return true;
      return false;
    }).length;
  }, [questions, activeApp?.id, currentSubject]);

  const selectedUnitQuestionsCount = useMemo(() => {
    if (!selectedUnit) return 0;
    return getUnitQuestionsCount(currentSubject.id, selectedUnit);
  }, [selectedUnit, currentSubject?.id, questions, activeApp?.id]);

  const displaySubjectMcqs = useMemo(() => {
    if (selectedUnit) {
      if (selectedUnitQuestionsCount > 0) {
        return `${selectedUnitQuestionsCount.toLocaleString()} MCQs`;
      }
      return `0 MCQs`;
    }
    
    if (totalSubjectQuestionsCount > 0) {
      return `${totalSubjectQuestionsCount.toLocaleString()} MCQs`;
    }
    return `0 MCQs`;
  }, [selectedUnit, selectedUnitQuestionsCount, totalSubjectQuestionsCount]);

  if (activeApp.syllabus.length === 0) {
    return (
      <div className="space-y-6 pb-28 font-sans max-w-4xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={onBackToHome}
            className="h-10 w-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-900">Syllabus Explorer</h2>
            <p className="text-xs text-slate-500">{activeApp.name}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-10 border border-dashed border-slate-300 text-center space-y-4 shadow-sm">
          <div className="h-16 w-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto text-3xl font-black">
            📚
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-black text-slate-900">No Syllabus Units Added</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              The syllabus structure for <span className="font-bold text-slate-800">{activeApp.name}</span> hasn't been set up yet. You can manually design custom subjects, units, topics, and MCQs separately for this exam in the Admin Panel.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={onBackToHome}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Questions for the currently selected unit
  const selectedUnitQuestions = selectedUnit ? (questions || []).filter(q => {
    if (!q || q.appId !== activeApp?.id) return false;
    if (q.subjectId && q.subjectId !== currentSubject?.id) return false;
    if (q.unitId === selectedUnit.id) return true;
    if (selectedUnit.topics && selectedUnit.topics.some(t => t.id === q.topicId)) return true;
    return false;
  }) : [];

  // Direct questions uploaded to selected unit without a topic
  const selectedUnitDirectQuestions = selectedUnit ? (questions || []).filter(q => 
    q && q.appId === activeApp?.id &&
    (q.subjectId === currentSubject?.id || !q.subjectId) &&
    q.unitId === selectedUnit.id &&
    (!q.topicId || q.topicId === '')
  ) : [];

  const handleSubjectChange = (subId: string) => {
    if (subId === selectedSubjectId) return;
    setIsLoading(true);
    setSelectedSubjectId(subId);
    setSelectedUnitId(null);
    setSelectedTopicForSubtopics(null);
    setTimeout(() => {
      setIsLoading(false);
    }, 150);
  };

  // Helper for Subject icon
  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen': return <BookOpen className="h-4 w-4" />;
      case 'ShieldCheck': return <ShieldCheck className="h-4 w-4" />;
      case 'TrendingUp': return <TrendingUp className="h-4 w-4" />;
      case 'Compass': return <Compass className="h-4 w-4" />;
      case 'Award': return <Award className="h-4 w-4" />;
      case 'Zap': return <Zap className="h-4 w-4" />;
      case 'BarChart2': return <BarChart2 className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  // Helper for curated bright daylight Subject background image
  const getSubjectImage = (subj: any, idx: number = 0) => {
    return getCuratedSubjectImage(subj, idx);
  };

  // Helper for curated bright daylight Unit background image
  const getUnitImage = (unit: any, subjectName: string, unitIdx: number = 0) => {
    return getCuratedUnitImage(unit, subjectName, unitIdx);
  };

  // Helper for curated bright daylight Topic background image matching subject and topic content
  const getTopicImage = (topic: any, unit: any, subjectName: string, topicIdx: number = 0) => {
    return getCuratedTopicImage(topic, unit, subjectName, topicIdx);
  };

  // Flatten all topics for current subject with unit info
  const allTopicsInSubject: { unitId: string; unitName: string; topic: Topic }[] = [];
  if (currentSubject && currentSubject.units) {
    currentSubject.units.forEach((unit, uIdx) => {
      if (unit.topics) {
        unit.topics.forEach(topic => {
          allTopicsInSubject.push({
            unitId: unit.id,
            unitName: unit.name || `Unit ${uIdx + 1}`,
            topic,
          });
        });
      }
    });
  }

  // If subtopic screen is open
  if (selectedTopicForSubtopics) {
    return (
      <SubtopicsView
        activeApp={activeApp}
        subjectId={currentSubject.id}
        subjectName={currentSubject.name}
        unitId={selectedTopicForSubtopics.unitId}
        unitName={selectedTopicForSubtopics.unitName}
        topic={selectedTopicForSubtopics.topic}
        questions={appQuestions}
        onSelectSubtopic={(sId, uId, tId, sub) => {
          onSelectSubtopic(sId, uId, tId, sub);
        }}
        onSelectSet={(sId, uId, tId, setId, setName, qList) => {
          if (onSelectSet) {
            onSelectSet(sId, uId, tId, setId, setName, qList);
          } else {
            onSelectSubtopic(sId, uId, tId, `${selectedTopicForSubtopics.topic.name} • ${setName}`);
          }
        }}
        onBack={() => setSelectedTopicForSubtopics(null)}
        onOpenSubscriptionPlans={onOpenSubscriptionPlans}
      />
    );
  }

  const currentHeroImage = selectedUnit 
    ? (getUnitImage(selectedUnit, currentSubject.name) || getSubjectImage(currentSubject))
    : getSubjectImage(currentSubject);

  return (
    <div className="space-y-6 pb-6 md:pb-8 font-sans w-full max-w-full">
      {/* 1. Bright Daylight Unit / Topic Dashboard Banner — Exact Same Dimensions as Subjects Dashboard */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-[#1E1B4B] shadow-lg bg-[#FFF8E7] border-2 border-sky-200/90">
        {/* Related Subject / Unit Background Image with Bright Daylight Blend */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <SmartCardImage
            src={currentHeroImage}
            alt={currentSubject.name}
            fallbackLabel={currentSubject.name}
            className="w-full h-full object-cover object-center opacity-45 sm:opacity-55 scale-100 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFF8E7]/95 via-[#FFF8E7]/85 to-[#DCEBFF]/65"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#FFF8E7]/95 via-[#FFF8E7]/50 to-transparent"></div>
        </div>

        <div className="relative z-10 space-y-3 sm:space-y-4">
          <button
            onClick={() => {
              if (selectedUnitId) {
                setSelectedUnitId(null);
              } else {
                onBackToHome();
              }
            }}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/90 hover:bg-white backdrop-blur-md rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer w-fit text-[#1E1B4B] border border-sky-200 shadow-xs active:scale-95"
          >
            ← {selectedUnitId ? `Back to ${currentSubject.name}` : 'Back to Dashboard'}
          </button>

          <div className="space-y-1 sm:space-y-1.5 max-w-xl">
            <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/90 text-[#1E1B4B] text-[10px] sm:text-[11px] font-black uppercase tracking-widest border border-sky-200 inline-block">
              {selectedUnit
                ? `${currentSubject.name} • ${(selectedUnit.topics?.length || 0)} Topics`
                : `${currentSubject.category === 'mains' ? 'Main Examination' : 'Prelims & Mains'} • ${subjectUnits.length} Units`}
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#1E1B4B] leading-tight truncate">
              {selectedUnit ? selectedUnit.name : currentSubject.name}
            </h2>
            <p className="text-[11px] sm:text-xs md:text-sm text-slate-700 leading-relaxed line-clamp-2">
              {selectedUnit
                ? `Explore structured topics, practice sets, and exam-focused MCQs under ${selectedUnit.name}.`
                : `Explore all high-scoring units, topic-wise practice sets, and exam MCQs for ${currentSubject.name}.`}
            </p>
          </div>

          <div className="pt-2 sm:pt-3 border-t border-sky-200/80 flex items-center justify-between text-[11px] sm:text-xs font-bold text-[#1E1B4B]/90">
            <span>
              {selectedUnit
                ? `Total Topics: ${selectedUnit.topics?.length || 0}`
                : `Total Units: ${subjectUnits.length} • Topics: ${totalSubjectTopicsCount}`}
            </span>
            <span className="bg-white/90 border border-sky-200 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full">
              Total MCQs: {(selectedUnit ? selectedUnitQuestionsCount : totalSubjectQuestionsCount).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Dynamic Content Rendering: Level 1 (Units View) OR Level 2 (Unit Topics View) */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-24 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-slate-200"
          >
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            <p className="text-xs font-bold text-slate-600">Loading {currentSubject?.name}...</p>
          </motion.div>
        ) : selectedUnit ? (
          /* =========================================================================
             LEVEL 2: SELECTED UNIT'S TOPICS VIEW (TOPIC DASHBOARD)
             ========================================================================= */
          <motion.div
            key={`unit-${selectedUnit.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-3 sm:space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2 truncate">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 shrink-0" />
                <span className="truncate">{selectedUnit.name} Topics ({selectedUnit.topics?.length || 0})</span>
              </h3>
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shrink-0">
                Interactive Grid
              </span>
            </div>

            {/* LevelSetsView for Direct Unit MCQs */}
            <LevelSetsView
              activeApp={activeApp}
              subjectId={currentSubject.id}
              unitId={selectedUnit.id}
              questions={appQuestions}
              onSelectSet={(setId, setName, qList) => {
                if (onSelectSet) onSelectSet(currentSubject.id, selectedUnit.id, '', setId, setName, qList);
              }}
              title={`${selectedUnit.name} Unit Sets`}
              subtitle={`Practise sets organized directly under ${selectedUnit.name}`}
            />

            {/* Topics Grid for this specific unit */}
            {selectedUnit.topics && selectedUnit.topics.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                {selectedUnit.topics.map((topic, idx) => {
                  const topicPercentage = getTopicPercentage(currentSubject.id, selectedUnit.id, topic);
                  const topicImg = getTopicImage(topic, selectedUnit, currentSubject.name, idx);
                  const cardTheme = getBrightCardTheme(`${topic.name || ''} ${selectedUnit.name || ''} ${currentSubject.name || ''}`, idx);
                  const topicQuestionsCount = topicQuestionsCountMap[`${currentSubject.id}_${topic.id}`] || 0;
                  const topicSetsCount = getTopicSetsCount(currentSubject.id, topic);
                  const hasTheory = topic.hasTheory === true || !!topic.theoryContent;

                  return (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.03 }}
                      whileHover={{ y: -3, scale: 1.005 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedTopicForSubtopics({ unitId: selectedUnit.id, unitName: selectedUnit.name, topic })}
                      className={`${cardTheme.cardBgClass} rounded-2xl sm:rounded-3xl overflow-hidden border-2 ${cardTheme.borderClass} shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col group relative p-1.5 sm:p-2`}
                    >
                      {/* Prominent Bright Daylight Topic Image — Generous Visibility Without Overlapping Text */}
                      <div className="relative h-56 sm:h-64 md:h-72 w-full overflow-hidden rounded-xl sm:rounded-2xl bg-sky-100 z-10 shrink-0">
                        <SmartCardImage
                          src={topicImg}
                          alt={topic.name}
                          fallbackLabel={topic.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />

                        {/* Top Bar: Topic Pill, Optional Theory Pill & MCQ Counter */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 z-10">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-md border ${cardTheme.badgeBgClass} flex items-center gap-1`}>
                              <span>⚡</span>
                              <span>TOPIC {idx + 1}</span>
                            </span>
                            {hasTheory && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReadingTheoryTopic({ topic, unitName: selectedUnit.name });
                                }}
                                className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-md border border-amber-400 bg-[#FFF1CC] hover:bg-amber-200 text-[#1E1B4B] flex items-center gap-1 cursor-pointer transition-colors"
                                title="Open Theory Notes"
                              >
                                📖 Notes
                              </button>
                            )}
                          </div>

                          <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black shadow-md bg-white/95 text-[#1E1B4B] border flex items-center gap-1.5 tracking-tight shrink-0">
                            <span className="text-xs">📝</span>
                            <span className="font-extrabold">{topicQuestionsCount.toLocaleString()} MCQs</span>
                          </span>
                        </div>
                      </div>

                      {/* Compact Single-Row Bottom Bar Matching Approved Reference Design */}
                      <div className={`px-2 sm:px-3.5 py-2 min-h-[60px] sm:min-h-[68px] relative z-10 flex flex-row items-center justify-between gap-1.5 sm:gap-2.5 ${cardTheme.bodyBgClass} rounded-b-xl sm:rounded-b-2xl shrink-0`}>
                        <div className="min-w-0 flex-1">
                          <div className={`h-1 sm:h-1.5 w-8 sm:w-10 rounded-full bg-gradient-to-r ${cardTheme.accentBarClass} mb-1`} />
                          <h4 className="text-[11px] sm:text-[13px] font-black text-[#1E1B4B] leading-tight line-clamp-2">
                            {topic.name}
                          </h4>
                        </div>

                        <ReferenceStatStrip
                          themeId={cardTheme.id}
                          percentage={topicPercentage}
                          tiles={[
                            { type: 'sets', count: topicSetsCount, label: 'Sets' },
                            { type: 'mcqs', count: topicQuestionsCount, label: "MCQ's" },
                          ]}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : selectedUnitQuestions.length > 0 ? (
              /* --- UNIT LEVEL PRACTICE ARENA (WHEN NO TOPICS EXIST, BUT QUESTIONS ARE ATTACHED TO UNIT) --- */
              <div className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <LevelSetsView
                  activeApp={activeApp}
                  subjectId={currentSubject.id}
                  unitId={selectedUnit.id}
                  questions={appQuestions}
                  onSelectSet={(setId, setName, qList) => {
                    if (onSelectSet) onSelectSet(currentSubject.id, selectedUnit.id, '', setId, setName, qList);
                  }}
                  title={`${selectedUnit.name} Unit Sets`}
                  subtitle={`Practise sets organized directly under ${selectedUnit.name}`}
                />
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-300 space-y-3 shadow-2xs">
                <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl font-black">
                  📝
                </div>
                <h4 className="text-base font-black text-slate-900">No Topics in this Unit Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Topics and MCQs can be added to this Unit using the Admin Panel.
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          /* =========================================================================
             LEVEL 1: PRIMARY SUBJECT UNITS OVERVIEW (UNIT DASHBOARD)
             ========================================================================= */
          <motion.div
            key={`units-overview-${currentSubject.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-3 sm:space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2 truncate">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 shrink-0" />
                <span className="truncate">
                  {viewMode === 'units'
                    ? `${currentSubject.name} Units (${subjectUnits.length})`
                    : `${currentSubject.name} Topics (${allTopicsInSubject.length})`}
                </span>
              </h3>

              {allTopicsInSubject.length > 0 ? (
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                  <button
                    onClick={() => setViewMode('units')}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-black transition-all cursor-pointer ${
                      viewMode === 'units'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Units ({subjectUnits.length})
                  </button>
                  <button
                    onClick={() => setViewMode('all-topics')}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-black transition-all cursor-pointer ${
                      viewMode === 'all-topics'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Topics ({allTopicsInSubject.length})
                  </button>
                </div>
              ) : (
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shrink-0">
                  Interactive Grid
                </span>
              )}
            </div>

            {/* LevelSetsView for Direct Subject MCQs - shown at top of subject overview regardless of view mode */}
            <LevelSetsView
              activeApp={activeApp}
              subjectId={currentSubject.id}
              questions={appQuestions}
              onSelectSet={(setId, setName, qList) => {
                if (onSelectSet) onSelectSet(currentSubject.id, '', '', setId, setName, qList);
              }}
              title={`${currentSubject.name} Direct Sets`}
              subtitle={`Foundation sets for ${currentSubject.name}`}
            />

            {viewMode === 'units' ? (
              /* --- UNITS CARDS GRID --- */
              subjectUnits.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                  {subjectUnits.map((unit, uIdx) => {
                    const unitTopics = unit.topics || [];
                    const unitMcqCount = getUnitQuestionsCount(currentSubject.id, unit);
                    const unitSetsCount = getUnitSetsCount(currentSubject.id, unit);
                    const unitMastery = getUnitPercentage(currentSubject.id, unit);
                    const unitImg = getUnitImage(unit, currentSubject.name, uIdx);
                    const cardTheme = getBrightCardTheme(`${unit.name || ''} ${currentSubject.name || ''}`, uIdx);

                    // Formulate display title
                    let displayUnitName = unit.name;
                    if (/^\d+$/.test(unit.name.trim())) {
                      displayUnitName = `Unit ${unit.name.trim()}: Syllabus Unit`;
                    }

                    return (
                      <motion.div
                        key={unit.id || uIdx}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: uIdx * 0.04 }}
                        whileHover={{ y: -3, scale: 1.005 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedUnitId(unit.id)}
                        className={`${cardTheme.cardBgClass} rounded-2xl sm:rounded-3xl overflow-hidden border-2 ${cardTheme.borderClass} shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col group relative p-1.5 sm:p-2`}
                      >
                        {/* Prominent Bright Daylight Unit Image — Generous Visibility Without Overlapping Text */}
                        <div className="relative h-56 sm:h-64 md:h-72 w-full overflow-hidden rounded-xl sm:rounded-2xl bg-sky-100 z-10 shrink-0">
                          <SmartCardImage
                            src={unitImg}
                            alt={unit.name}
                            fallbackLabel={displayUnitName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />

                          {/* Top Bar: Unit Pill & MCQ Counter */}
                          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 z-10">
                            <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-md border ${cardTheme.badgeBgClass} flex items-center gap-1.5`}>
                              <span>🎯</span>
                              <span>UNIT {uIdx + 1}</span>
                            </span>

                            <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black shadow-md bg-white/95 text-[#1E1B4B] border flex items-center gap-1.5 tracking-tight shrink-0">
                              <span className="text-xs">📝</span>
                              <span className="font-extrabold">{unitMcqCount.toLocaleString()} MCQs</span>
                            </span>
                          </div>
                        </div>

                        {/* Compact Single-Row Bottom Bar Matching Approved Reference Design */}
                        <div className={`px-2 sm:px-3.5 py-2 min-h-[60px] sm:min-h-[68px] relative z-10 flex flex-row items-center justify-between gap-1.5 sm:gap-2.5 ${cardTheme.bodyBgClass} rounded-b-xl sm:rounded-b-2xl shrink-0`}>
                          <div className="min-w-0 flex-1">
                            <div className={`h-1 sm:h-1.5 w-8 sm:w-10 rounded-full bg-gradient-to-r ${cardTheme.accentBarClass} mb-1`} />
                            <h4 className="text-[11px] sm:text-[13px] font-black text-[#1E1B4B] leading-tight line-clamp-2">
                              {displayUnitName}
                            </h4>
                          </div>

                          <ReferenceStatStrip
                            themeId={cardTheme.id}
                            percentage={unitMastery}
                            tiles={[
                              { type: 'topics', count: unitTopics.length, label: 'Topics' },
                              { type: 'sets', count: unitSetsCount, label: 'Sets' },
                              { type: 'mcqs', count: unitMcqCount, label: "MCQ's" },
                            ]}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 space-y-4 shadow-2xs">
                  <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-3xl font-black">
                    📁
                  </div>
                  <div className="space-y-1.5 max-w-md mx-auto">
                    <h4 className="text-lg font-black text-slate-900">No Units Configured for this Subject</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      You can add Units, Topics, and MCQs for <span className="font-bold text-slate-700">"{currentSubject.name}"</span> anytime via the Admin Panel.
                    </p>
                  </div>
                </div>
              )
            ) : (
              /* --- ALL TOPICS VIEW (FLAT GRID) --- */
              allTopicsInSubject.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                  {allTopicsInSubject.map(({ unitId, unitName, topic }, idx) => {
                    const topicPercentage = getTopicPercentage(currentSubject.id, unitId, topic);
                    const topicImg = getTopicImage(topic, { id: unitId, name: unitName }, currentSubject.name, idx);
                    const cardTheme = getBrightCardTheme(`${topic.name || ''} ${unitName || ''} ${currentSubject.name || ''}`, idx);
                    const topicQuestionsCount = topicQuestionsCountMap[`${currentSubject.id}_${topic.id}`] || 0;
                    const topicSetsCount = getTopicSetsCount(currentSubject.id, topic);
                    const hasTheory = topic.hasTheory === true || !!topic.theoryContent;

                    return (
                      <motion.div
                        key={`${unitId}-${topic.id}`}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: idx * 0.03 }}
                        whileHover={{ y: -3, scale: 1.005 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedTopicForSubtopics({ unitId, unitName, topic })}
                        className={`${cardTheme.cardBgClass} rounded-2xl sm:rounded-3xl overflow-hidden border-2 ${cardTheme.borderClass} shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col group relative p-1.5 sm:p-2`}
                      >
                        {/* Prominent Bright Daylight Topic Image — Generous Visibility Without Overlapping Text */}
                        <div className="relative h-56 sm:h-64 md:h-72 w-full overflow-hidden rounded-xl sm:rounded-2xl bg-sky-100 z-10 shrink-0">
                          <SmartCardImage
                            src={topicImg}
                            alt={topic.name}
                            fallbackLabel={topic.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />

                          {/* Top Bar: Topic Pill, Optional Theory Pill & MCQ Counter */}
                          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 z-10">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-md border ${cardTheme.badgeBgClass} flex items-center gap-1`}>
                                <span>⚡</span>
                                <span>TOPIC {idx + 1}</span>
                              </span>
                              {hasTheory && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setReadingTheoryTopic({ topic, unitName });
                                  }}
                                  className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-md border border-amber-400 bg-[#FFF1CC] hover:bg-amber-200 text-[#1E1B4B] flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Open Theory Notes"
                                >
                                  📖 Notes
                                </button>
                              )}
                            </div>

                            <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black shadow-md bg-white/95 text-[#1E1B4B] border flex items-center gap-1.5 tracking-tight shrink-0">
                              <span className="text-xs">📝</span>
                              <span className="font-extrabold">{topicQuestionsCount.toLocaleString()} MCQs</span>
                            </span>
                          </div>
                        </div>

                        {/* Compact Single-Row Bottom Bar Matching Approved Reference Design */}
                        <div className={`px-2 sm:px-3.5 py-2 min-h-[60px] sm:min-h-[68px] relative z-10 flex flex-row items-center justify-between gap-1.5 sm:gap-2.5 ${cardTheme.bodyBgClass} rounded-b-xl sm:rounded-b-2xl shrink-0`}>
                          <div className="min-w-0 flex-1">
                            <div className={`h-1 sm:h-1.5 w-8 sm:w-10 rounded-full bg-gradient-to-r ${cardTheme.accentBarClass} mb-1`} />
                            <h4 className="text-[11px] sm:text-[13px] font-black text-[#1E1B4B] leading-tight line-clamp-2">
                              {topic.name}
                            </h4>
                          </div>

                          <ReferenceStatStrip
                            themeId={cardTheme.id}
                            percentage={topicPercentage}
                            tiles={[
                              { type: 'sets', count: topicSetsCount, label: 'Sets' },
                              { type: 'mcqs', count: topicQuestionsCount, label: "MCQ's" },
                            ]}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
            ) : (
              <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-300 space-y-3 shadow-2xs">
                <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl font-black">
                  📚
                </div>
                <h4 className="text-base font-black text-slate-900">No Topics Found</h4>
              </div>
            )
          )}
        </motion.div>
      )}
    </AnimatePresence>

    {/* Reading Theory Modal */}
    {readingTheoryTopic && (
      <TheoryReaderModal
        isOpen={!!readingTheoryTopic}
        onClose={() => setReadingTheoryTopic(null)}
        topic={readingTheoryTopic.topic}
        unitName={readingTheoryTopic.unitName}
        subjectName={currentSubject.name}
        activeApp={activeApp}
        onStartPractice={() => {
          setSelectedTopicForSubtopics({
            unitId: selectedUnit?.id || '',
            unitName: readingTheoryTopic.unitName,
            topic: readingTheoryTopic.topic
          });
        }}
      />
    )}
  </div>
  );
}
