import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Question, AppConfig } from '../types';
import { 
  ArrowLeft, RotateCcw, Award, Sparkles, CheckCircle2, XCircle, 
  Target, Clock, BarChart3, ChevronRight, HelpCircle, Check,
  Flame, BookOpen, AlertCircle, RefreshCw, Zap, Trophy, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MathText from './MathText';
import { getSavedFontSettings, FontSettings } from '../lib/fontSettings';
import { useMcqFontSize } from '../lib/mcqFontStore';
import { McqFontControls } from './McqFontControls';
import { useMcqAppearance } from '../lib/mcqAppearanceStore';

export interface PerformanceFeedback {
  status: string;
  statusBadgeColor: string;
  message: string;
  subMessage: string;
  primaryActionLabel: string;
  primaryActionType: 'study-again' | 'practice-again' | 'improve-mistakes' | 'target-90' | 'target-100' | 'next-topic';
  secondaryActionLabel: string;
  secondaryActionType: 'practice-again' | 'review-mistakes';
  accentGradient: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  circleColor: string;
  celebrationType: 'gentle' | 'progress' | 'achievement' | 'sparkle' | 'perfect';
  targetPercent: number | null;
  targetPercentLabel: string;
  extraCorrectRequired: number;
  iconSymbol: string;
}

export function getScoreFeedback(percentage: number, totalQuestions: number, correctCount: number): PerformanceFeedback {
  if (percentage < 60) {
    const targetPct = 70;
    const requiredTotalCorrect = Math.ceil((targetPct / 100) * totalQuestions);
    const extra = Math.max(1, requiredTotalCorrect - correctCount);

    return {
      status: 'KEEP GOING',
      statusBadgeColor: 'bg-rose-50 text-rose-700 border-rose-300',
      message: 'Keep going! Revise the key concepts for this topic and practice the missed questions again.',
      subMessage: 'Focus on understanding core fundamentals before retrying.',
      primaryActionLabel: '📊 SUMMARY',
      primaryActionType: 'study-again',
      secondaryActionLabel: '🔄 PRACTICE AGAIN',
      secondaryActionType: 'practice-again',
      accentGradient: 'from-rose-500 via-rose-400 to-amber-500',
      badgeBg: 'bg-rose-50',
      badgeBorder: 'border-rose-300',
      badgeText: 'text-rose-700',
      circleColor: '#f43f5e',
      celebrationType: 'gentle',
      targetPercent: 70,
      targetPercentLabel: '70%+',
      extraCorrectRequired: extra,
      iconSymbol: '🔴',
    };
  } else if (percentage < 70) {
    const targetPct = 70;
    const requiredTotalCorrect = Math.ceil((targetPct / 100) * totalQuestions);
    const extra = Math.max(1, requiredTotalCorrect - correctCount);

    return {
      status: 'KEEP IMPROVING',
      statusBadgeColor: 'bg-amber-50 text-amber-800 border-amber-300',
      message: 'Good start! You understand the key ideas. A little more focused practice will get you past 70%+.',
      subMessage: 'Identify your mistakes and practice again.',
      primaryActionLabel: '🔄 PRACTICE AGAIN',
      primaryActionType: 'practice-again',
      secondaryActionLabel: '❌ REVIEW MISTAKES',
      secondaryActionType: 'review-mistakes',
      accentGradient: 'from-amber-500 via-orange-400 to-amber-400',
      badgeBg: 'bg-amber-50',
      badgeBorder: 'border-amber-300',
      badgeText: 'text-amber-800',
      circleColor: '#f59e0b',
      celebrationType: 'progress',
      targetPercent: 70,
      targetPercentLabel: '70%+',
      extraCorrectRequired: extra,
      iconSymbol: '🟠',
    };
  } else if (percentage < 80) {
    const targetPct = 80;
    const requiredTotalCorrect = Math.ceil((targetPct / 100) * totalQuestions);
    const extra = Math.max(1, requiredTotalCorrect - correctCount);

    return {
      status: 'GOOD PROGRESS',
      statusBadgeColor: 'bg-amber-50 text-amber-800 border-amber-300',
      message: 'Great progress! Your preparation is strong. Review the incorrect questions to reach 80%+.',
      subMessage: 'Next target milestone: 80%+',
      primaryActionLabel: '🎯 IMPROVE MISTAKES',
      primaryActionType: 'improve-mistakes',
      secondaryActionLabel: '🔄 PRACTICE AGAIN',
      secondaryActionType: 'practice-again',
      accentGradient: 'from-amber-500 via-yellow-500 to-lime-500',
      badgeBg: 'bg-amber-50',
      badgeBorder: 'border-amber-300',
      badgeText: 'text-amber-800',
      circleColor: '#eab308',
      celebrationType: 'progress',
      targetPercent: 80,
      targetPercentLabel: '80%+',
      extraCorrectRequired: extra,
      iconSymbol: '🟡',
    };
  } else if (percentage < 90) {
    const targetPct = 90;
    const requiredTotalCorrect = Math.ceil((targetPct / 100) * totalQuestions);
    const extra = Math.max(1, requiredTotalCorrect - correctCount);

    return {
      status: 'VERY GOOD',
      statusBadgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-300',
      message: 'Excellent! Your concepts are solid. Eliminating small mistakes will push you above 90%+.',
      subMessage: 'Next target milestone: 90%+',
      primaryActionLabel: '🚀 TARGET 90%+',
      primaryActionType: 'target-90',
      secondaryActionLabel: '❌ REVIEW MISTAKES',
      secondaryActionType: 'review-mistakes',
      accentGradient: 'from-emerald-500 via-teal-500 to-emerald-400',
      badgeBg: 'bg-emerald-50',
      badgeBorder: 'border-emerald-300',
      badgeText: 'text-emerald-700',
      circleColor: '#10b981',
      celebrationType: 'achievement',
      targetPercent: 90,
      targetPercentLabel: '90%+',
      extraCorrectRequired: extra,
      iconSymbol: '🟢',
    };
  } else if (percentage < 100) {
    const targetPct = 100;
    const requiredTotalCorrect = totalQuestions;
    const extra = Math.max(1, requiredTotalCorrect - correctCount);

    return {
      status: 'OUTSTANDING',
      statusBadgeColor: 'bg-purple-50 text-purple-700 border-purple-300',
      message: 'Outstanding performance! You are almost perfect. Polish the remaining questions to achieve 100%.',
      subMessage: 'Next target milestone: 100% PERFECT SCORE',
      primaryActionLabel: '🏆 TARGET 100%',
      primaryActionType: 'target-100',
      secondaryActionLabel: '❌ REVIEW MISTAKES',
      secondaryActionType: 'review-mistakes',
      accentGradient: 'from-purple-500 via-indigo-500 to-pink-500',
      badgeBg: 'bg-purple-50',
      badgeBorder: 'border-purple-300',
      badgeText: 'text-purple-700',
      circleColor: '#a855f7',
      celebrationType: 'sparkle',
      targetPercent: 100,
      targetPercentLabel: '100% PERFECT SCORE',
      extraCorrectRequired: extra,
      iconSymbol: '💎',
    };
  } else {
    return {
      status: 'PERFECT SCORE',
      statusBadgeColor: 'bg-amber-50 text-amber-800 border-amber-400',
      message: 'Perfect score! 🎉 Outstanding mastery on this topic.',
      subMessage: 'Keep up the momentum and proceed to the next topic.',
      primaryActionLabel: '➡️ NEXT TOPIC',
      primaryActionType: 'next-topic',
      secondaryActionLabel: '🔁 PRACTICE AGAIN',
      secondaryActionType: 'practice-again',
      accentGradient: 'from-amber-500 via-emerald-500 to-teal-400',
      badgeBg: 'bg-amber-50',
      badgeBorder: 'border-amber-400',
      badgeText: 'text-amber-800',
      circleColor: '#f59e0b',
      celebrationType: 'perfect',
      targetPercent: null,
      targetPercentLabel: 'Perfect — Next Topic',
      extraCorrectRequired: 0,
      iconSymbol: '🏆',
    };
  }
}

export interface PremiumResultScreenProps {
  activeApp: AppConfig;
  subjectName: string;
  unitName?: string;
  topicName?: string;
  subtopicName: string;
  questions: Question[];
  selectedAnswers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  timeSpentSeconds?: number;
  onPracticeAgain: () => void;
  onBackToHome: () => void;
  onNextTopic?: () => void;
  nextTopicLabel?: string;
  isSetMode?: boolean;
  practiceMode?: 'sets' | 'subtopics';
  nextActionType?: 'next-subtopic' | 'next-set' | 'next-topic';
  nextActionLabel?: string;
  onNextAction?: () => void;
}

export default function PremiumResultScreen({
  activeApp,
  subjectName,
  unitName,
  topicName,
  subtopicName,
  questions,
  selectedAnswers,
  timeSpentSeconds = 145,
  onPracticeAgain,
  onBackToHome,
  onNextTopic,
  nextTopicLabel,
  isSetMode,
  practiceMode,
  nextActionType,
  nextActionLabel,
  onNextAction,
}: PremiumResultScreenProps) {
  // MCQ Font size scaling hook
  const { scaledTextStyle } = useMcqFontSize();
  // MCQ Appearance customization hook
  const { settings: appearance } = useMcqAppearance();
  const effectiveIsSetMode = practiceMode ? practiceMode === 'sets' : !!isSetMode;
  const [activeTab, setActiveTab] = useState<'overview' | 'all' | 'mistakes' | 'unanswered'>('overview');
  const [animatedScore, setAnimatedScore] = useState(0);
  const [fontSettings] = useState<FontSettings>(getSavedFontSettings);

  const safeQuestions = (questions || []).filter(Boolean);
  const totalQuestions = safeQuestions.length;

  let correctCount = 0;
  safeQuestions.forEach(q => {
    if (q && q.id && q.correctOption) {
      const userAns = (selectedAnswers?.[q.id] || '').toUpperCase().trim();
      const correct = String(q.correctOption).toUpperCase().trim();
      if (userAns && userAns === correct) {
        correctCount++;
      }
    }
  });

  const attemptedCount = Object.keys(selectedAnswers || {}).length;
  const incorrectCount = Math.max(0, attemptedCount - correctCount);
  const unansweredCount = Math.max(0, totalQuestions - attemptedCount);
  const finalPercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const feedback = getScoreFeedback(finalPercentage, totalQuestions || 1, correctCount);

  // Celebratory Confetti Animation - ONLY when score is strictly ABOVE 70%
  const triggerCelebration = useCallback((scorePct: number) => {
    // 70% or below -> No burst/celebration animation
    if (scorePct <= 70) {
      return;
    }

    try {
      if (scorePct === 100) {
        // 🏆 Perfect 100% Score: Subtle, elegant dual-stream particles (soft & non-intrusive)
        confetti({
          particleCount: 42,
          angle: 60,
          spread: 55,
          origin: { x: 0.15, y: 0.3 },
          colors: ['#f59e0b', '#10b981', '#38bdf8', '#a855f7', '#fbbf24'],
          scalar: 0.8,
          ticks: 200,
          gravity: 0.95,
          startVelocity: 28,
          shapes: ['circle'],
        });
        confetti({
          particleCount: 42,
          angle: 120,
          spread: 55,
          origin: { x: 0.85, y: 0.3 },
          colors: ['#f59e0b', '#10b981', '#38bdf8', '#a855f7', '#fbbf24'],
          scalar: 0.8,
          ticks: 200,
          gravity: 0.95,
          startVelocity: 28,
          shapes: ['circle'],
        });

        // Stage 2: Gentle small shimmer drift
        setTimeout(() => {
          confetti({
            particleCount: 28,
            spread: 65,
            origin: { x: 0.5, y: 0.22 },
            colors: ['#facc15', '#34d399', '#60a5fa', '#f472b6'],
            shapes: ['circle'],
            scalar: 0.75,
            ticks: 180,
            gravity: 1.0,
            startVelocity: 24,
          });
        }, 220);
      } else {
        // 🚀 Score above 70% (> 70%): Beautiful, subtle, premium small particles/confetti
        // Gentle side cascades that do not cover or block score or action buttons
        confetti({
          particleCount: 32,
          angle: 60,
          spread: 50,
          origin: { x: 0.15, y: 0.32 },
          colors: ['#10b981', '#06b6d4', '#3b82f6', '#f59e0b', '#8b5cf6', '#34d399'],
          scalar: 0.75,
          ticks: 180,
          gravity: 0.95,
          startVelocity: 25,
          shapes: ['circle'],
        });
        confetti({
          particleCount: 32,
          angle: 120,
          spread: 50,
          origin: { x: 0.85, y: 0.32 },
          colors: ['#10b981', '#06b6d4', '#3b82f6', '#f59e0b', '#8b5cf6', '#34d399'],
          scalar: 0.75,
          ticks: 180,
          gravity: 0.95,
          startVelocity: 25,
          shapes: ['circle'],
        });
      }
    } catch {
      // ignore
    }
  }, []);

  // Trigger celebration on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerCelebration(finalPercentage);
    }, 220);
    return () => clearTimeout(timer);
  }, [finalPercentage, triggerCelebration]);

  // Smooth Count-Up Animation for Score
  useEffect(() => {
    let start = 0;
    const duration = 1200; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing curve
      const easeOutQuad = 1 - (1 - progress) * (1 - progress);
      setAnimatedScore(Math.round(easeOutQuad * finalPercentage));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedScore(finalPercentage);
      }
    };

    requestAnimationFrame(animate);
  }, [finalPercentage]);

  // Formatted Time (e.g., 02:25)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Filtered Questions for Review
  const filteredQuestions = safeQuestions.filter(q => {
    if (!q) return false;
    const userAns = (selectedAnswers?.[q.id] || '').toUpperCase().trim();
    const correct = String(q.correctOption || '').toUpperCase().trim();
    const isCorrect = userAns && userAns === correct;
    const isUnanswered = !userAns;

    if (activeTab === 'mistakes') return userAns && !isCorrect;
    if (activeTab === 'unanswered') return isUnanswered;
    return true; // 'all' or 'overview'
  });

  // Circular SVG calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans relative pb-28">
      {/* Subtle Clean Ambient Top Gradient (No GPU-heavy blur-3xl orbs that overflow mobile viewports) */}
      <div className="absolute top-0 inset-x-0 h-[360px] bg-gradient-to-b from-indigo-50/70 via-sky-50/30 to-transparent pointer-events-none" />
      
      {/* Celebration Sparkles Overlay ONLY for Scores strictly ABOVE 70% */}
      {finalPercentage > 70 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          <div className="absolute top-8 left-6 sm:left-12 text-xl sm:text-2xl opacity-80">
            ✨
          </div>
          <div className="absolute top-16 right-6 sm:right-14 text-2xl sm:text-3xl opacity-80">
            🎉
          </div>
          <div className="absolute top-36 left-8 sm:left-24 text-xl sm:text-2xl opacity-80">
            ⭐
          </div>
          <div className="absolute top-32 right-8 sm:right-24 text-xl sm:text-2xl opacity-80">
            {finalPercentage === 100 ? '👑' : '🌟'}
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl xl:max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 space-y-5">

        {/* 1. Header Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <button
            onClick={onBackToHome}
            className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-full bg-[var(--card-bg)] hover:bg-[var(--bg-secondary)] active:scale-95 border border-[var(--card-border)] text-[var(--text-primary)] flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span>Dashboard</span>
          </button>

          <div className="flex items-center justify-center min-w-0 flex-1 px-1">
            <div className="px-3 py-1.5 rounded-full bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xs max-w-full">
              <span className="text-xs font-black text-[var(--text-primary)] truncate block max-w-[160px] sm:max-w-xs">
                {subtopicName}
              </span>
            </div>
          </div>

          <div className="flex items-center shrink-0">
            <span className={`px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-black tracking-wide border flex items-center gap-1.5 shadow-2xs ${feedback.badgeBg} ${feedback.badgeBorder} ${feedback.badgeText}`}>
              <span>{feedback.iconSymbol}</span>
              <span>{feedback.status}</span>
            </span>
          </div>
        </div>

        {/* 2. Score Header with Circular Animated Progress */}
        <div className="relative rounded-[28px] bg-[var(--card-bg)] border border-[var(--card-border)] p-5 sm:p-8 shadow-lg text-center overflow-hidden">
          <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-3">
            Performance Summary • Your Score
          </p>

          <div className="relative flex items-center justify-center my-2">
            {/* SVG Circular Progress Ring */}
            <svg className="w-40 h-40 sm:w-44 sm:h-44 -rotate-90 transform" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-slate-200"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={feedback.circleColor}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Inner Score Label */}
            <div className="absolute flex flex-col items-center justify-center px-2">
              <span className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                {animatedScore}%
              </span>
              <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider mt-1 px-2.5 py-0.5 rounded-full ${feedback.badgeBg} ${feedback.badgeText} border ${feedback.badgeBorder}`}>
                {feedback.status}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-bold text-[var(--text-secondary)] mt-2">
            You answered <span className="font-black text-[var(--text-primary)]">{correctCount}</span> out of <span className="font-black text-[var(--text-primary)]">{totalQuestions}</span> questions correctly
          </p>

          {finalPercentage > 70 && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => triggerCelebration(finalPercentage)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-900 border border-amber-200/90 shadow-2xs transition-all cursor-pointer"
                title="Click to trigger celebration animation"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>{finalPercentage === 100 ? '🎉 Celebrate Perfect Score!' : '✨ Replay Celebration'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Score Analysis: 3-column grid with proper height so mobile text never overlaps */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <BarChart3 className="h-4 w-4" />
              </div>
              <h3 className="text-sm sm:text-base font-black text-[var(--text-primary)]">
                Score Analysis
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-600">
              {finalPercentage}% Accuracy
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {/* Card 1: Final Score */}
            <div className="min-h-[76px] sm:min-h-[105px] p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-indigo-200/90 shadow-2xs sm:shadow-sm flex flex-col justify-between gap-1 overflow-hidden">
              <div className="flex items-center justify-between text-indigo-800 min-w-0">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight sm:tracking-wide truncate mr-1">
                  Final Score
                </span>
                <Trophy className="h-3.5 w-3.5 sm:h-5 sm:w-5 shrink-0 text-amber-500" />
              </div>
              <p className="text-sm sm:text-2xl font-black text-slate-900 leading-snug truncate">
                {correctCount - incorrectCount} <span className="text-[10px] sm:text-xs font-bold text-slate-500">Marks</span>
              </p>
              <p className="text-[9px] sm:text-[10px] font-semibold text-indigo-700 truncate">
                <span className="inline sm:hidden">+1 / -1 Mark</span>
                <span className="hidden sm:inline">Correct (+1) | Wrong (-1)</span>
              </p>
            </div>

            {/* Card 2: Correct Answers */}
            <div className="min-h-[76px] sm:min-h-[105px] p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[var(--card-bg)] border border-emerald-300 shadow-2xs sm:shadow-sm flex flex-col justify-between gap-1 overflow-hidden">
              <div className="flex items-center justify-between text-emerald-700 min-w-0">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight sm:tracking-wide truncate mr-1">
                  Correct
                </span>
                <CheckCircle2 className="h-3.5 w-3.5 sm:h-5 sm:w-5 shrink-0" />
              </div>
              <p className="text-sm sm:text-2xl font-black text-[var(--text-primary)] leading-snug truncate">
                {correctCount}
              </p>
              <p className="text-[9px] sm:text-[11px] font-semibold text-emerald-700 truncate">
                +1 Mark each
              </p>
            </div>

            {/* Card 3: Wrong Answers */}
            <div className="min-h-[76px] sm:min-h-[105px] p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[var(--card-bg)] border border-rose-300 shadow-2xs sm:shadow-sm flex flex-col justify-between gap-1 overflow-hidden">
              <div className="flex items-center justify-between text-rose-700 min-w-0">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight sm:tracking-wide truncate mr-1">
                  Wrong
                </span>
                <XCircle className="h-3.5 w-3.5 sm:h-5 sm:w-5 shrink-0" />
              </div>
              <p className="text-sm sm:text-2xl font-black text-[var(--text-primary)] leading-snug truncate">
                {incorrectCount}
              </p>
              <p className="text-[9px] sm:text-[11px] font-semibold text-rose-700 truncate">
                -1 Mark each
              </p>
            </div>

            {/* Card 4: Accuracy */}
            <div className="min-h-[76px] sm:min-h-[105px] p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[var(--card-bg)] border border-blue-300 shadow-2xs sm:shadow-sm flex flex-col justify-between gap-1 overflow-hidden">
              <div className="flex items-center justify-between text-blue-700 min-w-0">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight sm:tracking-wide truncate mr-1">
                  Accuracy
                </span>
                <BarChart3 className="h-3.5 w-3.5 sm:h-5 sm:w-5 shrink-0" />
              </div>
              <p className="text-sm sm:text-2xl font-black text-[var(--text-primary)] leading-snug truncate">
                {finalPercentage}%
              </p>
              <p className="text-[9px] sm:text-[11px] font-semibold text-blue-700 truncate">
                <span className="inline sm:hidden">Score rate</span>
                <span className="hidden sm:inline">Score percentage</span>
              </p>
            </div>

            {/* Card 5: Total Questions */}
            <div className="min-h-[76px] sm:min-h-[105px] p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[var(--card-bg)] border border-purple-300 shadow-2xs sm:shadow-sm flex flex-col justify-between gap-1 overflow-hidden">
              <div className="flex items-center justify-between text-purple-700 min-w-0">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight sm:tracking-wide truncate mr-1">
                  <span className="inline sm:hidden">Total Qs</span>
                  <span className="hidden sm:inline">Total Questions</span>
                </span>
                <BookOpen className="h-3.5 w-3.5 sm:h-5 sm:w-5 shrink-0" />
              </div>
              <p className="text-sm sm:text-2xl font-black text-[var(--text-primary)] leading-snug truncate">
                {totalQuestions}
              </p>
              <p className="text-[9px] sm:text-[11px] font-semibold text-purple-700 truncate">
                {unansweredCount > 0 ? `${attemptedCount} done • ${unansweredCount} skip` : 'All attempted'}
              </p>
            </div>

            {/* Card 6: Time Taken */}
            <div className="min-h-[76px] sm:min-h-[105px] p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[var(--card-bg)] border border-amber-300 shadow-2xs sm:shadow-sm flex flex-col justify-between gap-1 overflow-hidden">
              <div className="flex items-center justify-between text-amber-700 min-w-0">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-tight sm:tracking-wide truncate mr-1">
                  Time Taken
                </span>
                <Clock className="h-3.5 w-3.5 sm:h-5 sm:w-5 shrink-0" />
              </div>
              <p className="text-sm sm:text-2xl font-black text-[var(--text-primary)] leading-snug truncate">
                {formatTime(timeSpentSeconds)}
              </p>
              <p className="text-[9px] sm:text-[11px] font-semibold text-amber-700 truncate">
                Pace & Speed
              </p>
            </div>
          </div>
        </div>

        {/* 5. Primary & Secondary Recommended Actions */}
        <div className="pt-3 space-y-3">
          {/* Top Row: Summary & Practice Again */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Summary Button */}
            <button
              type="button"
              onClick={() => {
                setActiveTab(incorrectCount > 0 ? 'mistakes' : 'all');
                const reviewEl = document.getElementById('question-review-section');
                if (reviewEl) reviewEl.scrollIntoView({ behavior: 'smooth' });
              }}
              className="rounded-2xl bg-[var(--card-bg)] hover:bg-[var(--bg-secondary)] border border-[var(--card-border)] text-[var(--text-primary)] font-black py-4 px-6 text-sm tracking-wide shadow-md flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 transition-all"
            >
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              <span>📊 SUMMARY</span>
            </button>

            {/* 2. Practice Again Button */}
            <button
              type="button"
              onClick={onPracticeAgain}
              className="rounded-2xl bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 hover:from-amber-500 hover:to-orange-400 text-white font-black py-4 px-6 text-sm tracking-wide shadow-lg flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 transition-all"
            >
              <RotateCcw className="h-5 w-5" />
              <span>🔄 PRACTICE AGAIN</span>
            </button>
          </div>

          {/* Bottom Row (కిందకి): Next Subtopic / Next / Go to Next Topic */}
          {(onNextAction || onNextTopic) && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (onNextAction) {
                  onNextAction();
                } else if (onNextTopic) {
                  onNextTopic();
                }
              }}
              className={`w-full rounded-2xl py-4 px-6 text-sm font-black tracking-wide shadow-xl flex items-center justify-center gap-2.5 cursor-pointer transition-all ${
                nextActionType === 'next-topic'
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/20'
                  : nextActionType === 'next-set'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-indigo-500/20'
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-purple-500/20'
              }`}
            >
              {nextActionType === 'next-topic' ? (
                <>
                  <Trophy className="h-5 w-5 text-amber-950 shrink-0" />
                  <span className="text-sm font-black">Go to Next Topic</span>
                  {nextActionLabel && (
                    <span className="bg-black/15 text-slate-950 font-extrabold text-xs px-2.5 py-0.5 rounded-lg truncate max-w-[260px]">
                      {nextActionLabel}
                    </span>
                  )}
                  <ChevronRight className="h-5 w-5 stroke-[2.5] ml-auto shrink-0" />
                </>
              ) : nextActionType === 'next-set' ? (
                <>
                  <Sparkles className="h-5 w-5 text-cyan-200 shrink-0" />
                  <span className="text-sm font-black">Next Set</span>
                  {nextActionLabel && (
                    <span className="bg-white/20 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-lg">
                      {nextActionLabel}
                    </span>
                  )}
                  <ChevronRight className="h-5 w-5 stroke-[2.5] ml-auto shrink-0" />
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 text-pink-200 shrink-0" />
                  <span className="text-sm font-black">Next Subtopic</span>
                  {nextActionLabel && (
                    <span className="bg-white/20 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-lg truncate max-w-[260px]">
                      {nextActionLabel}
                    </span>
                  )}
                  <ChevronRight className="h-5 w-5 stroke-[2.5] ml-auto shrink-0" />
                </>
              )}
            </motion.button>
          )}
        </div>

        {/* 6. Questions & Detailed Solutions Review Section */}
        <div id="question-review-section" className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--card-border)] pb-3">
            <h3 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              Detailed Solutions & Concept Review
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              {/* MCQ Font Size Controls (A-, A+, Reset) */}
              <McqFontControls variant="light" />

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'all' || activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  All ({totalQuestions})
                </button>
                {incorrectCount > 0 && (
                  <button
                    onClick={() => setActiveTab('mistakes')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'mistakes' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700 hover:text-rose-900'
                    }`}
                  >
                    Mistakes ({incorrectCount})
                  </button>
                )}
                {unansweredCount > 0 && (
                  <button
                    onClick={() => setActiveTab('unanswered')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'unanswered' ? 'bg-slate-700 text-white shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Skipped ({unansweredCount})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Questions List */}
          {filteredQuestions.length === 0 ? (
            <div className="p-8 text-center bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] text-[var(--text-secondary)] space-y-2 shadow-sm">
              <Check className="h-8 w-8 text-emerald-600 mx-auto" />
              <p className="font-bold text-sm text-[var(--text-primary)]">No questions found under this filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((q, idx) => {
                const userAns = (selectedAnswers?.[q.id] || '').toUpperCase().trim();
                const correctOpt = String(q.correctOption || '').toUpperCase().trim();
                const isCorrect = userAns && userAns === correctOpt;
                const isUnanswered = !userAns;

                const qNum = safeQuestions.findIndex(item => item && item.id === q.id);
                const displayNumber = qNum >= 0 ? qNum + 1 : idx + 1;

                return (
                  <div
                    key={q.id || idx}
                    className="rounded-[22px] border p-4 sm:p-6 space-y-4 shadow-sm overflow-hidden"
                    style={{ 
                      background: appearance.optionsBg,
                      borderColor: `${appearance.optionsText}25`
                    }}
                  >
                    {/* Header: Question Number & Result Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-primary)] text-xs font-black border border-[var(--card-border)] shrink-0">
                        Q{String(displayNumber).padStart(2, '0')}
                      </span>

                      <span className={`text-xs font-black px-3 py-1 rounded-full border shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isUnanswered
                          ? 'bg-slate-100 text-slate-600 border-slate-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {isCorrect ? '✓ Correct (+1)' : isUnanswered ? '⚪ Skipped' : '✕ Incorrect'}
                      </span>
                    </div>

                    {/* Question Text */}
                    <div 
                      style={{ 
                        ...scaledTextStyle, 
                        background: appearance.questionBg,
                        color: appearance.questionText
                      }} 
                      className="p-4 sm:p-5 rounded-2xl border-2 border-indigo-200/80 font-bold leading-relaxed shadow-2xs mcq-scalable-text overflow-hidden"
                    >
                      <MathText text={q.questionText || ''} />
                    </div>

                    {/* Options Grid - Unique Options Only */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(['A', 'B', 'C', 'D'] as const)
                        .filter((optKey, idx, arr) => {
                          const optText = q?.options ? q.options[optKey] : null;
                          if (!optText || !optText.trim()) return false;
                          const norm = optText.trim().toLowerCase().replace(/\s+/g, ' ');
                          return arr.findIndex(k => (q?.options?.[k] || '').trim().toLowerCase().replace(/\s+/g, ' ') === norm) === idx;
                        })
                        .map(optKey => {
                        const optText = q?.options ? q.options[optKey] : null;
                        if (!optText) return null;
                        const isOptionCorrect = optKey === correctOpt;
                        const isOptionSelected = optKey === userAns;

                        let borderStyle = 'border-[var(--card-border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] shadow-2xs';
                        if (isOptionCorrect) {
                          borderStyle = 'border-emerald-300 bg-emerald-50 text-emerald-900 font-bold shadow-2xs';
                        } else if (isOptionSelected && !isOptionCorrect) {
                          borderStyle = 'border-rose-300 bg-rose-50 text-rose-900 font-bold shadow-2xs';
                        }

                        return (
                          <div 
                            key={optKey} 
                            className={`p-3 sm:p-3.5 rounded-2xl border-2 flex items-start sm:items-center justify-between gap-2 transition-colors overflow-hidden ${borderStyle}`}
                          >
                            <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                              <span 
                                className="h-6 w-6 shrink-0 rounded-lg flex items-center justify-center font-black text-xs shadow-2xs mt-0.5 sm:mt-0"
                                style={{
                                  background: isOptionCorrect ? '#059669' : isOptionSelected ? '#e11d48' : appearance.questionBg,
                                  color: isOptionCorrect || isOptionSelected ? '#ffffff' : appearance.questionText
                                }}
                              >
                                {optKey}
                              </span>
                              <div className="flex flex-col flex-1 min-w-0">
                                <span style={{ ...scaledTextStyle, lineHeight: 1.55 }} className="mcq-scalable-text font-medium"><MathText text={optText} /></span>
                              </div>
                            </div>

                            {isOptionCorrect && (
                              <span className="text-[10px] font-black text-emerald-700 shrink-0 ml-1">Correct</span>
                            )}
                            {isOptionSelected && !isOptionCorrect && (
                              <span className="text-[10px] font-black text-rose-700 shrink-0 ml-1">Your Answer</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && typeof q.explanation === 'string' && q.explanation.trim() !== '' && (
                      <div 
                        style={{ 
                          ...scaledTextStyle, 
                          background: appearance.explanationBg,
                          borderColor: `${appearance.accentColor}30`,
                          color: appearance.explanationText
                        }} 
                        className="p-4 sm:p-5 rounded-2xl border-2 space-y-2 shadow-2xs mcq-scalable-text overflow-hidden"
                      >
                        <p className="font-black flex items-center gap-1.5 text-xs sm:text-sm" style={{ color: appearance.accentColor }}>
                          <Sparkles className="h-4 w-4 shrink-0" /> Explanation & Concept Breakdown:
                        </p>
                        <div 
                          className="leading-relaxed font-medium pl-1 sm:pl-5 space-y-1.5 mcq-scalable-text"
                          style={{ color: appearance.explanationText }}
                        >
                          <MathText text={q.explanation} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 7. Bottom Navigation Bar */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onPracticeAgain}
            className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 text-xs font-black tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 transition-all"
          >
            <RotateCcw className="h-4 w-4" /> Practice Again
          </button>

          {onNextAction ? (
            <button
              type="button"
              onClick={onNextAction}
              className={`flex-1 rounded-2xl py-4 text-xs font-black tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 transition-all ${
                nextActionType === 'next-topic'
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-black'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-black'
              }`}
            >
              {nextActionType === 'next-set'
                ? 'Next Set'
                : nextActionType === 'next-subtopic'
                ? 'Next Subtopic'
                : effectiveIsSetMode
                ? 'Next Topic Sets'
                : 'Next Subtopic'} ({nextActionLabel || 'Continue'}) →
            </button>
          ) : onNextTopic ? (
            <button
              type="button"
              onClick={onNextTopic}
              className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 text-xs font-black tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 transition-all"
            >
              {effectiveIsSetMode ? 'Next Topic Sets' : 'Next Subtopic'} ({nextTopicLabel || 'Continue'}) →
            </button>
          ) : null}

          <button
            type="button"
            onClick={onBackToHome}
            className="flex-1 rounded-2xl bg-[var(--card-bg)] hover:bg-[var(--bg-secondary)] active:scale-98 border-2 border-[var(--card-border)] hover:border-indigo-500 text-[var(--text-primary)] hover:text-indigo-700 py-4 px-6 text-sm font-black tracking-wide shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <ArrowLeft className="h-4.5 w-4.5 text-indigo-600 stroke-[2.8]" />
            <span className="text-[var(--text-primary)] hover:text-indigo-700 font-black text-sm">
              {effectiveIsSetMode ? 'Back to Sets' : 'Back to Subtopics'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
