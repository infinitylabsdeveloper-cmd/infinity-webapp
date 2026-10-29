import React, { useState, useEffect, useRef } from 'react';
import { MockTest, Question, MockTestAttempt, AppConfig } from '../types';
import { 
  X, Clock, Award, CheckCircle, AlertCircle, HelpCircle, 
  ChevronLeft, ChevronRight, Check, RotateCcw, Eye, EyeOff, 
  BarChart3, ShieldCheck, Play, ArrowLeft, Bookmark, BookmarkCheck, Zap
} from 'lucide-react';
import { isBookmarked, toggleBookmarkMCQ, fetchBookmarks } from '../services/bookmarkService';
import { BookmarkItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import MathText from './MathText';
import { saveMockTestAttemptToFirestore } from '../lib/firebase';
import { useMcqFontSize } from '../lib/mcqFontStore';
import { McqFontControls } from './McqFontControls';
import { useMcqAppearance } from '../lib/mcqAppearanceStore';

interface MockTestRunnerModalProps {
  isOpen?: boolean;
  onClose: () => void;
  mockTest?: MockTest;
  test?: MockTest;
  activeApp?: AppConfig;
  userEmail?: string;
  userName?: string;
  userId?: string;
  existingAttempt?: MockTestAttempt | null;
  onAttemptCompleted?: (attempt: MockTestAttempt) => void;
  onFinish?: (attempt: MockTestAttempt) => void;
}

export default function MockTestRunnerModal({
  isOpen = true,
  onClose,
  mockTest: propMockTest,
  test: propTest,
  activeApp,
  userEmail,
  userName,
  userId = 'user-guest',
  existingAttempt,
  onAttemptCompleted,
  onFinish
}: MockTestRunnerModalProps) {
  const { scaledTextStyle } = useMcqFontSize();
  const mockTest = propMockTest || propTest!;
  const handleFinish = onFinish || onAttemptCompleted;
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [visited, setVisited] = useState<Record<string, boolean>>({});

  // Bookmarks state
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    fetchBookmarks(userId, activeApp?.id).then((bList) => {
      if (bList) setBookmarks(bList);
    });
  }, [userId, activeApp?.id]);

  const handleToggleBookmarkCurrent = async () => {
    if (!currentQ) return;
    const { updatedBookmarks } = await toggleBookmarkMCQ({
      userId,
      appId: activeApp?.id || mockTest?.appId || 'default',
      question: currentQ,
      currentBookmarks: bookmarks,
      appConfig: activeApp
    });
    setBookmarks(updatedBookmarks);
  };

  // Timer state
  const durationSecs = (mockTest?.durationMinutes || 30) * 60;
  const [timeLeftSecs, setTimeLeftSecs] = useState<number>(durationSecs);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);

  // Status: 'running' | 'submitting' | 'result'
  const [testState, setTestState] = useState<'running' | 'confirm_submit' | 'result'>('running');
  const [completedAttempt, setCompletedAttempt] = useState<MockTestAttempt | null>(null);

  const questions: Question[] = mockTest?.questions || [];
  const currentQ = questions[currentIdx];

  // Initialize from existing attempt if resuming or reviewing
  useEffect(() => {
    if (existingAttempt) {
      setAnswers(existingAttempt.answers || {});
      if (existingAttempt.status === 'completed' || existingAttempt.status === 'submitted') {
        setCompletedAttempt(existingAttempt);
        setTestState('result');
      }
    } else {
      setAnswers({});
      setMarkedForReview({});
      setVisited({ [questions[0]?.id || '0']: true });
      setTimeLeftSecs((mockTest?.durationMinutes || 30) * 60);
      setTestState('running');
    }
  }, [existingAttempt, mockTest]);

  // Mark current question as visited
  useEffect(() => {
    if (currentQ?.id) {
      setVisited(prev => ({ ...prev, [currentQ.id]: true }));
    }
  }, [currentIdx, currentQ]);

  const calculateEvaluation = () => {
    let attempted = 0;
    let correct = 0;
    let incorrect = 0;

    questions.forEach(q => {
      const userOpt = answers[q.id];
      if (userOpt) {
        attempted++;
        if (userOpt === q.correctOption) {
          correct++;
        } else {
          incorrect++;
        }
      }
    });

    const unattempted = questions.length - attempted;
    const posMarks = mockTest?.positiveMarks || 1;
    const negMarks = mockTest?.negativeMarks || 0.25;

    const posAwarded = correct * posMarks;
    const negDeducted = incorrect * negMarks;
    const rawScore = Math.max(0, posAwarded - negDeducted);
    const maxMarks = mockTest?.totalMarks || (questions.length * posMarks);
    const percentage = maxMarks > 0 ? (rawScore / maxMarks) * 100 : 0;
    const accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;

    return {
      attempted,
      correct,
      incorrect,
      unattempted,
      posAwarded,
      negDeducted,
      score: Math.round(rawScore * 100) / 100,
      maxMarks,
      percentage: Math.round(percentage * 10) / 10,
      accuracy: Math.round(accuracy * 10) / 10,
      passed: percentage >= 40
    };
  };

  const finalizeSubmission = async () => {
    const evalResult = calculateEvaluation();
    const attemptId = existingAttempt?.id || `mta-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const attemptData: MockTestAttempt = {
      id: attemptId,
      mockTestId: mockTest?.id || 'mt-custom',
      mockTestTitle: mockTest?.title || 'Mock Test',
      appId: activeApp?.id || 'default',
      userId,
      userEmail,
      userName,
      status: 'completed',
      answers,
      timeSpentSeconds,
      totalQuestions: questions.length,
      attemptedCount: evalResult.attempted,
      correctCount: evalResult.correct,
      incorrectCount: evalResult.incorrect,
      unattemptedCount: evalResult.unattempted,
      score: evalResult.score,
      maxMarks: evalResult.maxMarks,
      percentage: evalResult.percentage,
      accuracyPercentage: evalResult.accuracy,
      positiveMarksAwarded: evalResult.posAwarded,
      negativeMarksDeducted: evalResult.negDeducted,
      startedAt: new Date(Date.now() - timeSpentSeconds * 1000).toISOString(),
      completedAt: new Date().toISOString(),
      passed: evalResult.passed
    };

    setCompletedAttempt(attemptData);
    setTestState('result');

    saveMockTestAttemptToFirestore(attemptData).catch(() => {});
    if (handleFinish) {
      handleFinish(attemptData);
    }
  };

  const handleAutoSubmit = async () => {
    await finalizeSubmission();
  };

  // Countdown timer effect
  useEffect(() => {
    if (testState !== 'running' || isPaused || timeLeftSecs <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSecs(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
      setTimeSpentSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [testState, isPaused]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (opt: 'A' | 'B' | 'C' | 'D') => {
    if (testState !== 'running' || !currentQ) return;
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: opt
    }));
  };

  const handleClearOption = () => {
    if (!currentQ) return;
    setAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
  };

  const handleToggleReview = () => {
    if (!currentQ) return;
    setMarkedForReview(prev => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#FFF8E7] via-white to-[#DCEBFF]/40 flex flex-col overflow-hidden text-[#1E1B4B] font-sans">
      
      {/* TEST RUNNER HEADER */}
      <div className="px-4 py-3 bg-gradient-to-r from-[#FFF1CC] via-[#FFF8E7] to-[#DCEBFF] border-b-2 border-amber-300 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-[#FFF1CC] text-[#1E1B4B] border border-amber-300 transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm sm:text-base font-black text-[#1E1B4B] truncate max-w-xs sm:max-w-md">
              {mockTest?.title}
            </h2>
            <span className="text-[11px] font-extrabold text-indigo-800 block">
              {mockTest?.appName || activeApp?.name} • {questions.length} Questions
            </span>
          </div>
        </div>

        {/* Live Timer Badge */}
        {testState === 'running' && (
          <div className={`px-4 py-1.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 border-2 shadow-xs ${
            timeLeftSecs < 300 
              ? 'bg-[#FFE0EA] text-rose-800 border-pink-400 animate-pulse' 
              : 'bg-white text-[#1E1B4B] border-amber-300'
          }`}>
            <Clock className="w-4 h-4 stroke-[2.5] text-amber-600" />
            <span>Time Left: {formatTimer(timeLeftSecs)}</span>
          </div>
        )}

        {testState === 'running' && (
          <button
            onClick={() => setTestState('confirm_submit')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 text-white font-black text-xs shadow-md transition-all cursor-pointer"
          >
            Submit Test 🏁
          </button>
        )}
      </div>

      {/* TEST RUNNER MAIN CONTENT */}
      {testState === 'running' && currentQ && (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Question Display Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 max-w-4xl mx-auto w-full">
            
            {/* Question Header Status */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-700 border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-[#FFF1CC] text-[#1E1B4B] border border-amber-300 font-extrabold">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <McqFontControls variant="light" showLabel={false} />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleBookmarkCurrent}
                  title={isBookmarked(bookmarks, 'mcq', currentQ.id) ? 'Remove Bookmark' : 'Save to Vault'}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 text-xs border ${
                    isBookmarked(bookmarks, 'mcq', currentQ.id)
                      ? 'bg-[#FFF1CC] text-[#1E1B4B] border-amber-400 shadow-2xs'
                      : 'bg-white text-[#1E1B4B] border-amber-300 hover:bg-[#FFF8E7]'
                  }`}
                >
                  {isBookmarked(bookmarks, 'mcq', currentQ.id) ? (
                    <BookmarkCheck className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                  ) : (
                    <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
                  )}
                  <span>{isBookmarked(bookmarks, 'mcq', currentQ.id) ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleReview}
                  className={`px-3 py-1 rounded-lg font-black transition-all cursor-pointer flex items-center gap-1.5 text-xs border ${
                    markedForReview[currentQ.id] 
                      ? 'bg-[#EDE7FF] text-violet-900 border-violet-400 shadow-2xs' 
                      : 'bg-white text-[#1E1B4B] border-amber-300 hover:bg-[#FFF8E7]'
                  }`}
                >
                  <span>{markedForReview[currentQ.id] ? 'Marked for Review ★' : 'Mark for Review'}</span>
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#FFF8E7] via-white to-[#DCEBFF]/40 border-2 border-amber-300 shadow-md space-y-4">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-700 block">
                {currentQ.subtopic || currentQ.subjectId}
              </span>
              <div className="text-base sm:text-lg lg:text-xl font-bold leading-relaxed text-[#1E1B4B] break-words" style={scaledTextStyle}>
                <MathText text={currentQ.questionText} />
              </div>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {(['A', 'B', 'C', 'D'] as const).map(optKey => {
                const optText = currentQ.options[optKey];
                if (!optText) return null;
                const isSelected = answers[currentQ.id] === optKey;

                return (
                  <button
                    key={optKey}
                    type="button"
                    onClick={() => handleSelectOption(optKey)}
                    className={`w-full p-4 sm:p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-4 ${
                      isSelected 
                        ? 'bg-gradient-to-r from-[#DCEBFF] to-[#EDE7FF] border-indigo-500 text-[#1E1B4B] shadow-md ring-2 ring-indigo-400/30' 
                        : 'bg-white hover:bg-[#FFF8E7] border-amber-200 text-[#1E1B4B] shadow-2xs'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-[#FFF1CC] text-[#1E1B4B] border border-amber-300'
                    }`}>
                      {optKey}
                    </div>
                    <div className="font-semibold text-sm sm:text-base leading-snug flex-1 break-words" style={scaledTextStyle}>
                      <MathText text={optText} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Question Footer Actions */}
            <div className="pt-4 flex items-center justify-between border-t border-amber-200">
              <button
                type="button"
                onClick={handleClearOption}
                className="text-xs font-bold text-slate-600 hover:text-[#1E1B4B] underline cursor-pointer"
              >
                Clear Selection
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FFF1CC] border border-amber-300 font-extrabold text-xs text-[#1E1B4B] disabled:opacity-40 cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  type="button"
                  disabled={currentIdx === questions.length - 1}
                  onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:brightness-105 font-black text-xs text-white shadow-md cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Question Palette Sidebar */}
          <div className="w-full md:w-72 bg-[#FFF8E7] border-t-2 md:border-t-0 md:border-l-2 border-amber-300 p-4 shrink-0 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1E1B4B]">
                Question Palette ({questions.length})
              </h3>

              <div className="grid grid-cols-5 gap-2 max-h-60 md:max-h-96 overflow-y-auto p-1">
                {questions.map((q, idx) => {
                  const isAns = !!answers[q.id];
                  const isRev = !!markedForReview[q.id];
                  const isVis = !!visited[q.id];
                  const isCurr = idx === currentIdx;

                  let bg = 'bg-white text-slate-600 border-amber-200';
                  if (isAns) bg = 'bg-[#D9FBE8] text-emerald-900 border-emerald-400 font-black';
                  else if (isRev) bg = 'bg-[#FFF1CC] text-amber-900 border-amber-400 font-black';
                  else if (isVis) bg = 'bg-[#FFE0EA] text-rose-900 border-pink-300 font-bold';

                  if (isCurr) bg += ' ring-2 ring-indigo-600 shadow-md';

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-9 rounded-xl border text-xs flex items-center justify-center transition-all cursor-pointer ${bg}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="pt-4 border-t border-amber-200 text-[11px] font-bold text-[#1E1B4B] space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-emerald-500" /> Answered
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-amber-400" /> Marked for Review
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-[#FFE0EA] border border-pink-400" /> Unanswered
              </div>
            </div>
          </div>

        </div>
      )}

      {/* CONFIRM SUBMISSION DIALOG */}
      {testState === 'confirm_submit' && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-gradient-to-b from-[#FFF8E7] via-white to-[#DCEBFF]/50 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-xl">
            <div className="w-16 h-16 rounded-full bg-[#FFF1CC] text-amber-700 border border-amber-400 flex items-center justify-center mx-auto text-2xl font-black shadow-xs">
              🏁
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-[#1E1B4B]">Submit Your Mock Test?</h3>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                Are you sure you want to finish and view your final score breakdown?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold bg-white p-4 rounded-2xl border border-amber-300 shadow-2xs">
              <div>
                <span className="text-slate-600 block text-[10px]">Attempted</span>
                <span className="text-emerald-700 text-base font-black">{Object.keys(answers).length}</span>
              </div>
              <div>
                <span className="text-slate-600 block text-[10px]">Unattempted</span>
                <span className="text-rose-600 text-base font-black">{questions.length - Object.keys(answers).length}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTestState('running')}
                className="flex-1 py-3 rounded-xl bg-white hover:bg-[#FFF1CC] border border-amber-300 text-[#1E1B4B] text-xs font-extrabold cursor-pointer"
              >
                Return to Test
              </button>
              <button
                type="button"
                onClick={finalizeSubmission}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 text-white text-xs font-black shadow-md cursor-pointer"
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED EVALUATION RESULTS VIEW */}
      {testState === 'result' && completedAttempt && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 max-w-4xl mx-auto w-full">
          
          {/* Result Score Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#FFF1CC] via-[#FFF8E7] to-[#DCEBFF] border-2 border-amber-300 shadow-xl text-center space-y-4">
            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
              completedAttempt.passed ? 'bg-[#D9FBE8] text-emerald-900 border border-emerald-400' : 'bg-[#FFE0EA] text-rose-900 border border-pink-400'
            }`}>
              {completedAttempt.passed ? '🎉 Test Passed!' : '🎯 Keep Practicing'}
            </span>

            <h1 className="text-3xl sm:text-5xl font-black text-[#1E1B4B]">
              {completedAttempt.score} <span className="text-lg text-slate-600">/ {completedAttempt.maxMarks} Marks</span>
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-2xl bg-white/95 border border-amber-300 shadow-2xs">
                <span className="text-slate-600 block text-[10px] uppercase font-bold">Accuracy Rate</span>
                <span className="text-amber-700 font-black text-base">{completedAttempt.accuracyPercentage}%</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/95 border border-sky-300 shadow-2xs">
                <span className="text-slate-600 block text-[10px] uppercase font-bold">Percentage</span>
                <span className="text-indigo-700 font-black text-base">{completedAttempt.percentage}%</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/95 border border-emerald-300 shadow-2xs">
                <span className="text-slate-600 block text-[10px] uppercase font-bold">Correct / Incorrect</span>
                <span className="text-emerald-700 font-black text-base">{completedAttempt.correctCount} ✓ / {completedAttempt.incorrectCount} ✗</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/95 border border-violet-300 shadow-2xs">
                <span className="text-slate-600 block text-[10px] uppercase font-bold">Time Taken</span>
                <span className="text-[#1E1B4B] font-black text-base">{Math.floor(completedAttempt.timeSpentSeconds / 60)}m {completedAttempt.timeSpentSeconds % 60}s</span>
              </div>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-[#1E1B4B] flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" />
              Question-by-Question Solution Review
            </h3>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const userAns = completedAttempt.answers[q.id];
                const isCorrect = userAns === q.correctOption;
                const isSkipped = !userAns;

                return (
                  <div 
                    key={q.id}
                    className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-amber-200 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-indigo-900 font-black">Q{idx + 1}. {q.subtopic || 'General'}</span>
                      <span className={`px-3 py-1 rounded-lg font-black ${
                        isCorrect 
                          ? 'bg-[#D9FBE8] text-emerald-900 border border-emerald-400' 
                          : isSkipped 
                          ? 'bg-[#FFF8E7] text-slate-700 border border-amber-300' 
                          : 'bg-[#FFE0EA] text-rose-900 border border-pink-400'
                      }`}>
                        {isCorrect ? 'Correct ✓' : isSkipped ? 'Unattempted' : 'Incorrect ✗'}
                      </span>
                    </div>

                    <div className="text-sm sm:text-base font-bold text-[#1E1B4B] leading-relaxed">
                      <MathText text={q.questionText} />
                    </div>

                    {/* Options list in review */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {(['A', 'B', 'C', 'D'] as const).map(optKey => {
                        const optText = q.options[optKey];
                        if (!optText) return null;
                        const isUserChoice = userAns === optKey;
                        const isRightKey = q.correctOption === optKey;

                        let borderBg = 'bg-[#FFF8E7]/60 border-amber-200 text-[#1E1B4B]';
                        if (isRightKey) borderBg = 'bg-[#D9FBE8] border-emerald-500 text-emerald-950 font-bold';
                        else if (isUserChoice && !isRightKey) borderBg = 'bg-[#FFE0EA] border-rose-500 text-rose-950 font-bold';

                        return (
                          <div key={optKey} className={`p-3 rounded-xl border flex items-center gap-2 ${borderBg}`}>
                            <span className="font-black opacity-80">{optKey}.</span>
                            <span className="flex-1"><MathText text={optText} /></span>
                            {isRightKey && <span className="text-emerald-700 font-black">Correct Key</span>}
                            {isUserChoice && !isRightKey && <span className="text-rose-700 font-black">Your Choice</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-4 rounded-2xl bg-[#DCEBFF]/60 border border-sky-300 text-xs text-[#1E1B4B] leading-relaxed space-y-1">
                        <span className="font-black uppercase tracking-wider text-[10px] text-indigo-800 block">Detailed Explanation:</span>
                        <MathText text={q.explanation} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Close button */}
          <div className="text-center pt-4">
            <button
              onClick={onClose}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:brightness-105 text-white font-black text-sm shadow-xl transition-all cursor-pointer"
            >
              Close Test Review
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

