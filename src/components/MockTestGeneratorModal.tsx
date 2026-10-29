import React, { useState, useMemo, useEffect } from 'react';
import { AppConfig, Question, CurrentAffairsItem, MockTest, MockTestConfig, MockTestSubjectConfig, MockTestSectionConfig } from '../types';
import { 
  X, Sparkles, Check, AlertCircle, Layers, BookOpen, Clock, Award, 
  ChevronRight, ChevronLeft, Sliders, CheckCircle2, RotateCcw, 
  Calendar, FileText, Zap, Shield, Play, Plus, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  calculateAvailableQuestionPool, 
  generateMockTestQuestions, 
  validateTestConfiguration 
} from '../utils/mockTestGenerator';
import { saveMockTestToFirestore } from '../lib/firebase';

interface MockTestGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeApp?: AppConfig;
  currentApp?: AppConfig;
  questions?: Question[];
  currentAffairs?: CurrentAffairsItem[];
  userEmail?: string;
  userName?: string;
  userId?: string;
  onTestCreated?: (newTest: MockTest, startImmediately?: boolean) => void;
  onTestGenerated?: (newTest: MockTest) => void;
}

export default function MockTestGeneratorModal({
  isOpen,
  onClose,
  activeApp: propActiveApp,
  currentApp: propCurrentApp,
  questions = [],
  currentAffairs = [],
  userEmail,
  userName,
  userId = 'user-guest',
  onTestCreated,
  onTestGenerated
}: MockTestGeneratorModalProps) {
  const activeApp = propActiveApp || propCurrentApp!;
  const handleCreated = (test: MockTest, startNow?: boolean) => {
    if (onTestCreated) onTestCreated(test, startNow);
    if (onTestGenerated) onTestGenerated(test);
  };
  const [step, setStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Step 1 State
  const [testTitle, setTestTitle] = useState<string>('');
  const [testType, setTestType] = useState<MockTestConfig['testType']>('full_length');
  const [examStage, setExamStage] = useState<'prelims' | 'mains' | 'both'>('prelims');
  const [difficulty, setDifficulty] = useState<MockTestConfig['difficulty']>('mixed');

  // Step 2 State (Syllabus Selection)
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  
  // Subject Question Counts mapping: subjectId -> count
  const [subjectQuestionCounts, setSubjectQuestionCounts] = useState<Record<string, number>>({});

  // Current Affairs Selection
  const [selectedCaMonths, setSelectedCaMonths] = useState<string[]>([]);
  const [caQuestionCount, setCaQuestionCount] = useState<number>(10);

  // Manual Section-Wise Distribution State
  const [sections, setSections] = useState<MockTestSectionConfig[]>([
    { id: 'sec-1', sectionName: 'General Studies', questionCount: 25 },
    { id: 'sec-2', sectionName: 'Arithmetic', questionCount: 20 },
    { id: 'sec-3', sectionName: 'Reasoning', questionCount: 20 },
    { id: 'sec-4', sectionName: 'English', questionCount: 15 },
    { id: 'sec-5', sectionName: 'Subject Knowledge', questionCount: 20 }
  ]);

  const handleAddSection = () => {
    setSections(prev => [
      ...prev,
      { id: `sec-${Date.now()}`, sectionName: `Section ${prev.length + 1}`, questionCount: 10 }
    ]);
  };

  const handleRemoveSection = (id: string) => {
    if (sections.length <= 1) {
      alert('At least one section is required.');
      return;
    }
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdateSection = (id: string, field: keyof MockTestSectionConfig, value: any) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  useEffect(() => {
    const sum = sections.reduce((acc, s) => acc + (Number(s.questionCount) || 0), 0);
    if (sum > 0) {
      setTotalQuestions(sum);
    }
  }, [sections]);

  // Step 3 State (Rules)
  const [totalQuestions, setTotalQuestions] = useState<number>(30);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [positiveMarks, setPositiveMarks] = useState<number>(1);
  const [negativeMarks, setNegativeMarks] = useState<number>(0.25);
  const [totalMarks, setTotalMarks] = useState<number>(30);

  // Auto-generate title default
  useEffect(() => {
    if (!testTitle) {
      const stageName = examStage === 'both' ? 'Prelims & Mains' : examStage === 'prelims' ? 'Prelims' : 'Mains';
      const typeLabel = testType === 'full_length' ? 'Full Syllabus Grand Mock' 
                      : testType === 'subject_wise' ? 'Subject Special Mock'
                      : testType === 'unit_wise' ? 'Unit Diagnostic Mock'
                      : testType === 'topic_wise' ? 'Topic Practice Mock'
                      : testType === 'current_affairs' ? 'Current Affairs Mock'
                      : 'Custom Mixed Mock';
      setTestTitle(`${activeApp?.name || 'Exam'} ${typeLabel} (${stageName})`);
    }
  }, [testType, examStage, activeApp?.name]);

  // Sync Total Marks when Total Questions or Positive Marks change
  useEffect(() => {
    setTotalMarks(totalQuestions * positiveMarks);
  }, [totalQuestions, positiveMarks]);

  const syllabus = activeApp?.syllabus || [];

  // Available Units based on Selected Subjects
  const availableUnits = useMemo(() => {
    if (selectedSubjectIds.length === 0) return [];
    return syllabus
      .filter(s => selectedSubjectIds.includes(s.id))
      .flatMap(s => (s.units || []).map(u => ({ ...u, subjectId: s.id, subjectName: s.name })));
  }, [syllabus, selectedSubjectIds]);

  // Available Topics based on Selected Units
  const availableTopics = useMemo(() => {
    if (selectedUnitIds.length === 0) return [];
    return availableUnits
      .filter(u => selectedUnitIds.includes(u.id))
      .flatMap(u => (u.topics || []).map(t => ({ ...t, unitId: u.id, unitName: u.name, subjectId: u.subjectId })));
  }, [availableUnits, selectedUnitIds]);

  // Unique CA Months from current affairs items
  const availableCaMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    (currentAffairs || []).forEach(ca => {
      if (ca.month) monthsSet.add(ca.month);
    });
    return Array.from(monthsSet).slice(0, 12);
  }, [currentAffairs]);

  // Live Question Availability Estimator
  const poolResult = useMemo(() => {
    const currentConfig: Partial<MockTestConfig> = {
      testType,
      stage: examStage,
      difficulty,
      subjects: selectedSubjectIds.map(sId => ({
        subjectId: sId,
        unitIds: selectedUnitIds,
        topicIds: selectedTopicIds,
        questionCount: subjectQuestionCounts[sId] || 0
      })),
      caConfig: {
        months: selectedCaMonths,
        totalCaQuestions: testType === 'current_affairs' ? totalQuestions : caQuestionCount
      }
    };

    return calculateAvailableQuestionPool(
      questions,
      currentAffairs,
      activeApp?.id,
      currentConfig
    );
  }, [questions, currentAffairs, activeApp?.id, testType, examStage, difficulty, selectedSubjectIds, selectedUnitIds, selectedTopicIds, selectedCaMonths, subjectQuestionCounts, caQuestionCount, totalQuestions]);

  // Validation
  const validation = useMemo(() => {
    return validateTestConfiguration({
      questionCount: totalQuestions,
      durationMinutes,
      positiveMarks,
      negativeMarks,
      totalMarks
    });
  }, [totalQuestions, durationMinutes, positiveMarks, negativeMarks, totalMarks]);

  const handleToggleSubject = (sId: string) => {
    setSelectedSubjectIds(prev => {
      const exists = prev.includes(sId);
      if (exists) {
        // Clear related units/topics
        const subj = syllabus.find(s => s.id === sId);
        const uIdsToRem = (subj?.units || []).map(u => u.id);
        setSelectedUnitIds(uPrev => uPrev.filter(id => !uIdsToRem.includes(id)));
        return prev.filter(id => id !== sId);
      } else {
        return [...prev, sId];
      }
    });
  };

  const handleToggleUnit = (uId: string) => {
    setSelectedUnitIds(prev => 
      prev.includes(uId) ? prev.filter(id => id !== uId) : [...prev, uId]
    );
  };

  const handleToggleTopic = (tId: string) => {
    setSelectedTopicIds(prev => 
      prev.includes(tId) ? prev.filter(id => id !== tId) : [...prev, tId]
    );
  };

  const handleToggleCaMonth = (m: string) => {
    setSelectedCaMonths(prev => 
      prev.includes(m) ? prev.filter(item => item !== m) : [...prev, m]
    );
  };

  const handleGenerate = async (startImmediately: boolean = false) => {
    setGenError(null);
    setIsGenerating(true);

    try {
      const subjectConfigs: MockTestSubjectConfig[] = selectedSubjectIds.map(sId => {
        const subj = syllabus.find(s => s.id === sId);
        return {
          subjectId: sId,
          subjectName: subj?.name,
          unitIds: selectedUnitIds,
          topicIds: selectedTopicIds,
          questionCount: subjectQuestionCounts[sId] || 0
        };
      });

      const config: MockTestConfig = {
        testType,
        stage: examStage,
        subjects: subjectConfigs,
        sections,
        caConfig: {
          months: selectedCaMonths,
          totalCaQuestions: (testType === 'current_affairs' || selectedCaMonths.length > 0) ? caQuestionCount : 0
        },
        difficulty,
        questionCount: totalQuestions,
        durationMinutes,
        totalMarks,
        positiveMarks,
        negativeMarks
      };

      const result = generateMockTestQuestions(
        questions,
        currentAffairs,
        activeApp?.id,
        config
      );

      if (result.error && result.questions.length === 0) {
        setGenError(result.error);
        setIsGenerating(false);
        return;
      }

      const testId = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newMockTest: MockTest = {
        id: testId,
        title: testTitle.trim() || `${activeApp?.name} Mock Test`,
        description: `Custom Generated ${testType.replace('_', ' ').toUpperCase()} Test with ${result.questions.length} questions.`,
        appId: activeApp?.id,
        appName: activeApp?.name,
        creatorType: 'user',
        creatorUserId: userId,
        creatorUserName: userName || userEmail || 'Aspirant',
        status: 'published',
        config,
        questionIds: result.questions.map(q => q.id),
        questions: result.questions,
        questionsCount: result.questions.length,
        durationMinutes,
        totalMarks,
        positiveMarks,
        negativeMarks,
        createdAt: new Date().toISOString()
      };

      // Save persistently to Firestore
      await saveMockTestToFirestore(newMockTest);

      handleCreated(newMockTest, startImmediately);
      setIsGenerating(false);
      onClose();
    } catch (err: any) {
      console.error('Error generating mock test:', err);
      setGenError(err.message || 'Failed to generate test. Please try again.');
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/35 backdrop-blur-md overflow-y-auto font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-3xl bg-gradient-to-b from-[#FFF8E7] via-white to-[#DCEBFF]/40 text-[#1E1B4B] rounded-3xl sm:rounded-[2.5rem] shadow-2xl border-2 border-amber-300 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header Banner - Bright Luxury Champagne, Ivory & Sapphire */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#FFF1CC] via-[#FFF8E7] to-[#DCEBFF] border-b-2 border-amber-300 text-[#1E1B4B] shrink-0 relative flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-100" />
                <span>Premium AI Generator</span>
              </span>
              <span className="text-xs font-extrabold text-[#1E1B4B] bg-white px-2.5 py-0.5 rounded-full border border-amber-300 shadow-2xs">
                Step {step} of 4
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#1E1B4B]">
              Mock Test Generator & Configurator
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-white hover:bg-[#FFE0EA] text-[#1E1B4B] hover:text-rose-700 border border-amber-300 transition-all cursor-pointer shadow-xs"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Wizard Steps Indicator */}
        <div className="bg-[#FFF8E7] px-4 sm:px-6 py-3 border-b border-amber-200 shrink-0">
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
            {[
              { num: 1, label: 'Type & Stage' },
              { num: 2, label: 'Syllabus & CA' },
              { num: 3, label: 'Rules & Marks' },
              { num: 4, label: 'Summary & Preview' }
            ].map(s => {
              const isActive = step === s.num;
              const isPassed = step > s.num;
              return (
                <button 
                  key={s.num}
                  type="button"
                  onClick={() => setStep(s.num)} 
                  className={`py-1.5 sm:py-2 px-1 rounded-xl transition-all duration-200 cursor-pointer text-[11px] sm:text-xs font-black truncate border ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 text-white border-indigo-500 shadow-md' 
                      : isPassed 
                        ? 'bg-[#D9FBE8] text-emerald-900 border-emerald-300' 
                        : 'bg-white text-slate-600 border-amber-200 hover:bg-[#FFF1CC] hover:text-[#1E1B4B]'
                  }`}
                >
                  <span>{s.num}. {s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 custom-scrollbar">

          {/* STEP 1: TEST TYPE & EXAM STAGE */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-indigo-900 uppercase tracking-wider mb-2">
                  Mock Test Title
                </label>
                <input
                  type="text"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  placeholder="e.g. APPSC Group-2 Grand Mock Test 2026"
                  className="w-full px-4 py-3.5 bg-white border-2 border-amber-300 rounded-2xl text-sm font-bold text-[#1E1B4B] placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-indigo-900 uppercase tracking-wider mb-3">
                  Select Test Category / Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'full_length', label: 'Full-Length Mock', desc: 'Full syllabus grand exam', icon: '🏆', activeBg: 'bg-gradient-to-br from-[#FFFCF0] via-[#FFF1CC] to-[#FFE4D1] border-amber-400 ring-amber-300/50', idleBg: 'bg-[#FFF8E7] hover:bg-[#FFF1CC] border-amber-200' },
                    { id: 'unit_wise', label: 'Unit-Wise Mock', desc: 'Unit-specific test module', icon: '🧩', activeBg: 'bg-gradient-to-br from-[#F4F9FF] via-[#DCEBFF] to-[#EDE7FF] border-sky-400 ring-sky-300/50', idleBg: 'bg-[#F4F9FF] hover:bg-[#DCEBFF] border-sky-200' },
                    { id: 'subject_wise', label: 'Subject-Wise Mock', desc: 'Subject diagnostic test', icon: '📚', activeBg: 'bg-gradient-to-br from-[#F2FEF7] via-[#D9FBE8] to-[#D8F7F5] border-emerald-400 ring-emerald-300/50', idleBg: 'bg-[#F2FEF7] hover:bg-[#D9FBE8] border-emerald-200' },
                    { id: 'topic_wise', label: 'Topic-Wise Mock', desc: 'Targeted topic mastery', icon: '🎯', activeBg: 'bg-gradient-to-br from-[#FFF5F8] via-[#FFE0EA] to-[#FFE4D1] border-pink-400 ring-pink-300/50', idleBg: 'bg-[#FFF5F8] hover:bg-[#FFE0EA] border-pink-200' },
                    { id: 'practice', label: 'Practice Tests', desc: 'Adaptive quick practice', icon: '⚡', activeBg: 'bg-gradient-to-br from-[#F8F5FF] via-[#EDE7FF] to-[#DCEBFF] border-violet-400 ring-violet-300/50', idleBg: 'bg-[#F8F5FF] hover:bg-[#EDE7FF] border-violet-200' },
                    { id: 'previous_papers', label: 'Previous Papers', desc: 'Authentic past paper series', icon: '📜', activeBg: 'bg-gradient-to-br from-[#F2FCFB] via-[#D8F7F5] to-[#D9FBE8] border-teal-400 ring-teal-300/50', idleBg: 'bg-[#F2FCFB] hover:bg-[#D8F7F5] border-teal-200' },
                    { id: 'custom_mixed', label: 'Custom Mock Tests', desc: 'Sectional custom distribution', icon: '⚙️', activeBg: 'bg-gradient-to-br from-[#FFF8F2] via-[#FFE4D1] to-[#FFF1CC] border-orange-400 ring-orange-300/50', idleBg: 'bg-[#FFF8F2] hover:bg-[#FFE4D1] border-orange-200' }
                  ].map(t => {
                    const isSelected = testType === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTestType(t.id as any)}
                        className={`p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                          isSelected 
                            ? `${t.activeBg} border-2 text-[#1E1B4B] shadow-md scale-[1.02] ring-2` 
                            : `${t.idleBg} border text-[#1E1B4B] shadow-2xs`
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">{t.icon}</span>
                          {isSelected && (
                            <span className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                              ✓
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-black text-sm tracking-tight text-[#1E1B4B]">{t.label}</div>
                          <div className={`text-[11px] font-semibold mt-0.5 ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>
                            {t.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-xs font-black text-indigo-900 uppercase tracking-wider mb-2">
                    Exam Stage
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'prelims', label: 'Prelims' },
                      { id: 'mains', label: 'Mains' },
                      { id: 'both', label: 'Both / Mixed' }
                    ].map(st => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setExamStage(st.id as any)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-black cursor-pointer transition-all ${
                          examStage === st.id 
                            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-indigo-500 shadow-md font-black' 
                            : 'bg-white border-amber-300 text-[#1E1B4B] hover:bg-[#FFF1CC]'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-indigo-900 uppercase tracking-wider mb-2">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'mixed', label: 'Mixed' },
                      { id: 'easy', label: 'Easy' },
                      { id: 'medium', label: 'Medium' },
                      { id: 'hard', label: 'Hard' }
                    ].map(d => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setDifficulty(d.id as any)}
                        className={`py-2.5 px-1.5 rounded-xl border text-[11px] font-black cursor-pointer transition-all ${
                          difficulty === d.id 
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-md font-black' 
                            : 'bg-white border-amber-300 text-[#1E1B4B] hover:bg-[#D9FBE8]'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: MANUAL SECTION-WISE QUESTION DISTRIBUTION */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-[#1E1B4B] uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-600" />
                    <span>Section-Wise Question Distribution</span>
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Configure individual sections and question allocations for your custom mock test.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 hover:brightness-105 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Section</span>
                </button>
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                {sections.map((sec, idx) => (
                  <div key={sec.id} className="p-4 rounded-2xl bg-gradient-to-r from-[#FFF8E7] via-white to-[#DCEBFF]/40 border-2 border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="w-8 h-8 rounded-xl bg-[#DCEBFF] text-indigo-900 border border-sky-300 font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-black text-indigo-900 uppercase">Section Name / Subject</label>
                        <input
                          type="text"
                          value={sec.sectionName}
                          onChange={(e) => handleUpdateSection(sec.id, 'sectionName', e.target.value)}
                          placeholder="e.g. General Studies, Arithmetic..."
                          className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-[#1E1B4B] focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-32 sm:w-36 space-y-1">
                        <label className="text-[10px] font-black text-indigo-900 uppercase">Questions</label>
                        <input
                          type="number"
                          min={1}
                          max={200}
                          value={sec.questionCount}
                          onChange={(e) => handleUpdateSection(sec.id, 'questionCount', parseInt(e.target.value) || 0)}
                          className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-xs font-black text-indigo-700 text-center focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveSection(sec.id)}
                        className="p-2.5 rounded-xl bg-[#FFE0EA] text-rose-700 border border-pink-300 hover:bg-rose-200 transition-colors cursor-pointer self-end sm:self-auto mt-5 sm:mt-0"
                        title="Remove Section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFF1CC] via-[#FFF8E7] to-[#D9FBE8] border-2 border-amber-300 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-xs font-black text-indigo-900 uppercase tracking-wider block">
                    Total Questions Across All Sections
                  </span>
                  <span className="text-2xl font-black text-[#1E1B4B]">
                    {sections.reduce((acc, s) => acc + (Number(s.questionCount) || 0), 0)} Questions
                  </span>
                </div>
                <span className="text-xs font-black text-[#1E1B4B] bg-white px-3.5 py-1.5 rounded-xl border border-amber-300 shadow-2xs">
                  {sections.length} Sections Configured
                </span>
              </div>
            </motion.div>
          )}

          {/* STEP 3: MANUAL MARKS & DURATION CONFIGURATION */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-indigo-900 uppercase tracking-wider mb-2">
                    Total Questions
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={totalQuestions}
                    onChange={(e) => setTotalQuestions(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 bg-white border-2 border-amber-300 rounded-2xl text-sm font-bold text-[#1E1B4B] focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-indigo-900 uppercase tracking-wider mb-2">
                    Exam Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={600}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 bg-white border-2 border-amber-300 rounded-2xl text-sm font-bold text-[#1E1B4B] focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-indigo-900 uppercase tracking-wider mb-2">
                    Positive Marks per Correct Answer
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.25"
                    max="10"
                    value={positiveMarks}
                    onChange={(e) => setPositiveMarks(parseFloat(e.target.value) || 1)}
                    className="w-full px-4 py-3 bg-white border-2 border-amber-300 rounded-2xl text-sm font-bold text-[#1E1B4B] focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-indigo-900 uppercase tracking-wider mb-2">
                    Negative Marks per Incorrect Answer (0 to Disable)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="5"
                    value={negativeMarks}
                    onChange={(e) => setNegativeMarks(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-white border-2 border-amber-300 rounded-2xl text-sm font-bold text-[#1E1B4B] focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-indigo-900 uppercase tracking-wider mb-2">
                    Total Marks for Test
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="1000"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-white border-2 border-amber-300 rounded-2xl text-sm font-bold text-[#1E1B4B] focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Total Marks & Auto-Fix Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#DCEBFF] via-[#F4F9FF] to-[#EDE7FF] border-2 border-sky-300 flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-xs font-black text-indigo-900 uppercase tracking-wider block">
                    Calculated Maximum Marks
                  </span>
                  <span className="text-2xl font-black text-[#1E1B4B]">
                    {totalMarks} Marks
                  </span>
                  <span className="text-[11px] text-slate-600 font-semibold block mt-0.5">
                    ({totalQuestions} Questions × {positiveMarks} Marks each)
                  </span>
                </div>

                {!validation.isValid && (
                  <button
                    type="button"
                    onClick={() => setTotalMarks(validation.suggestedTotalMarks || totalQuestions * positiveMarks)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-xs cursor-pointer shadow-md hover:brightness-110"
                  >
                    Auto-Fix Total Marks
                  </button>
                )}
              </div>

              {!validation.isValid && (
                <div className="p-3.5 rounded-xl bg-[#FFE0EA] border border-pink-300 text-rose-900 text-xs space-y-1">
                  {validation.errors.map((err, i) => (
                    <div key={i} className="flex items-center gap-1.5 font-bold">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 4: SUMMARY & LIVE PREVIEW */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              {/* Question Bank Coverage Check Banner */}
              <div className={`p-4 rounded-2xl border-2 flex items-start gap-3 shadow-sm ${
                poolResult.totalAvailable >= totalQuestions
                  ? 'bg-[#D9FBE8] border-emerald-300 text-[#1E1B4B]'
                  : 'bg-[#FFF1CC] border-amber-400 text-[#1E1B4B]'
              }`}>
                {poolResult.totalAvailable >= totalQuestions ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <span className="font-black text-sm block text-[#1E1B4B]">
                    {poolResult.totalAvailable >= totalQuestions
                      ? `Sufficient Question Coverage (${poolResult.totalAvailable} questions eligible)`
                      : `Question Bank Limit Warning (${poolResult.totalAvailable} eligible questions vs ${totalQuestions} requested)`}
                  </span>
                  <p className="text-xs font-medium leading-relaxed text-slate-700">
                    {poolResult.totalAvailable >= totalQuestions
                      ? 'The question selection engine has enough published, active questions to generate a non-repetitive mock test.'
                      : 'Not enough matching questions in bank for this configuration. The generator will use available questions or you can adjust counts in Step 2.'}
                  </p>
                </div>
              </div>

              {/* Final Configuration Overview Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#FFF8E7] via-white to-[#DCEBFF]/50 border-2 border-amber-300 space-y-4 shadow-md">
                <h3 className="text-sm font-black text-[#1E1B4B] uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>Mock Test Configuration Summary</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-amber-200 shadow-2xs">
                    <span className="text-indigo-800 block text-[10px] uppercase font-black">Exam Target:</span>
                    <span className="font-extrabold text-[#1E1B4B]">{activeApp?.name}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-amber-200 shadow-2xs">
                    <span className="text-indigo-800 block text-[10px] uppercase font-black">Test Type:</span>
                    <span className="font-extrabold text-amber-700 capitalize">{testType.replace('_', ' ')}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-amber-200 shadow-2xs">
                    <span className="text-indigo-800 block text-[10px] uppercase font-black">Questions & Marks:</span>
                    <span className="font-extrabold text-[#1E1B4B]">{totalQuestions} Qs ({totalMarks} Marks)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-amber-200 shadow-2xs">
                    <span className="text-indigo-800 block text-[10px] uppercase font-black">Exam Duration:</span>
                    <span className="font-extrabold text-[#1E1B4B]">{durationMinutes} Minutes</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-amber-200 shadow-2xs">
                    <span className="text-indigo-800 block text-[10px] uppercase font-black">Marking Scheme:</span>
                    <span className="font-extrabold text-emerald-700">+{positiveMarks} / -{negativeMarks}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-amber-200 shadow-2xs">
                    <span className="text-indigo-800 block text-[10px] uppercase font-black">Stage & Difficulty:</span>
                    <span className="font-extrabold text-[#1E1B4B] capitalize">{examStage} • {difficulty}</span>
                  </div>
                </div>

                {/* Selected Subjects Pill Badges */}
                {selectedSubjectIds.length > 0 && (
                  <div>
                    <span className="text-[10px] font-black text-indigo-900 uppercase tracking-wider block mb-1">
                      Targeted Subjects:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSubjectIds.map(sId => {
                        const s = syllabus.find(sub => sub.id === sId);
                        return (
                          <span key={sId} className="px-2.5 py-1 rounded-lg bg-[#FFF1CC] text-[#1E1B4B] border border-amber-400 font-black text-[11px]">
                            {s?.name || sId}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {genError && (
                <div className="p-4 rounded-2xl bg-[#FFE0EA] border border-pink-300 text-rose-900 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                  <span>{genError}</span>
                </div>
              )}
            </motion.div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-[#FFF8E7] border-t-2 border-amber-300 shrink-0 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl bg-white border border-amber-300 text-[#1E1B4B] hover:bg-[#FFF1CC] font-black text-xs cursor-pointer flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 hover:brightness-105 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={isGenerating || !validation.isValid}
                  onClick={() => handleGenerate(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#DCEBFF] hover:bg-sky-200 text-[#1E1B4B] border border-sky-300 font-black text-xs shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
                >
                  Save to My Tests
                </button>
                <button
                  type="button"
                  disabled={isGenerating || !validation.isValid}
                  onClick={() => handleGenerate(true)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:brightness-105 text-white font-black text-xs shadow-lg cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-current stroke-none" />
                  <span>Start Test Now 🚀</span>
                </button>
              </>
            )}
          </div>
        </div>

      </motion.div>
    </div>
  );
}
