import React, { useState } from 'react';
import { AppConfig, Question } from '../types';
import { Award, TrendingUp, CheckCircle, AlertCircle, BarChart2, Zap, Clock, ShieldCheck, Flame, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

interface PerformanceBoardProps {
  activeApp: AppConfig;
  questions: Question[];
}

export default function PerformanceBoard({ activeApp, questions }: PerformanceBoardProps) {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('week');

  // Calculate real performance metrics from actual practice sessions
  const { totalPracticed, correctAnswers, accuracyRate, avgSecondsPerQ } = React.useMemo(() => {
    let total = 0;
    let correct = 0;
    let totalTime = 0;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('exam_practice_') || key.startsWith('test_attempt_'))) {
          const val = localStorage.getItem(key);
          if (val) {
            const parsed = JSON.parse(val);
            if (parsed && typeof parsed === 'object') {
              if (parsed.total) total += Number(parsed.total) || 0;
              if (parsed.correct) correct += Number(parsed.correct) || 0;
              if (parsed.timeSpentSeconds) totalTime += Number(parsed.timeSpentSeconds) || 0;
            }
          }
        }
      }
    } catch (e) {}

    const acc = total > 0 ? ((correct / total) * 100).toFixed(1) : '0';
    const avgSec = total > 0 && totalTime > 0 ? Math.round(totalTime / total) : 0;
    return {
      totalPracticed: total,
      correctAnswers: correct,
      accuracyRate: acc,
      avgSecondsPerQ: avgSec
    };
  }, [activeApp.id]);

  return (
    <div className="w-full max-w-6xl xl:max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      {/* Header Banner with Bright Premium Gradient */}
      <div className="bg-gradient-to-r from-[#DCEBFF] via-[#EDE7FF] to-[#FFF1CC] text-[#1E1B4B] rounded-3xl p-6 sm:p-8 shadow-lg space-y-3 relative overflow-hidden border-2 border-sky-300">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-15 text-9xl pointer-events-none select-none">📊</div>
        <div className="relative z-10 space-y-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/90 text-[#1E1B4B] rounded-full text-xs font-black border border-sky-300 shadow-2xs">
              <TrendingUp className="h-3.5 w-3.5 text-indigo-600" /> Advanced Analytics & Speed Insights
            </div>

            {/* Time Filter Pills */}
            <div className="flex items-center gap-1 bg-white/95 p-1 rounded-2xl border border-amber-300 shadow-2xs">
              <button
                onClick={() => setTimeFilter('week')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  timeFilter === 'week' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm' : 'text-[#1E1B4B] hover:bg-[#FFF1CC]'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setTimeFilter('month')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  timeFilter === 'month' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm' : 'text-[#1E1B4B] hover:bg-[#FFF1CC]'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setTimeFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  timeFilter === 'all' ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm' : 'text-[#1E1B4B] hover:bg-[#FFF1CC]'
                }`}
              >
                All Time
              </button>
            </div>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-black text-[#1E1B4B]">Performance Analytics Dashboard</h2>
          <p className="text-xs text-slate-700 font-semibold">Detailed subject-wise accuracy, speed analysis, and mock test scores for {activeApp.name}.</p>
        </div>
      </div>

      {totalPracticed === 0 ? (
        <div className="bg-gradient-to-br from-[#FFF8E7] via-white to-[#DCEBFF]/60 rounded-3xl p-10 sm:p-14 text-center border-2 border-amber-300 shadow-md space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-[#DCEBFF] text-indigo-700 border border-sky-300 flex items-center justify-center mx-auto text-3xl font-black shadow-2xs">
            📊
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-black text-[#1E1B4B]">No Performance Data Available</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              Start practicing MCQs and taking full-length mock tests to generate your real accuracy breakdown, speed insights, and topic mastery.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Overview Metric Cards with Real Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-b from-[#F4F9FF] via-[#DCEBFF] to-[#DCEBFF] p-6 rounded-3xl border-2 border-sky-300 shadow-md space-y-2 relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#1E1B4B] uppercase tracking-wider">Total MCQs Practiced</span>
                <span className="p-2.5 rounded-2xl bg-sky-600 text-white font-bold shadow-md">📝</span>
              </div>
              <p className="text-3xl font-black text-[#1E1B4B]">{totalPracticed} <span className="text-xs font-bold text-indigo-700">MCQs</span></p>
              <p className="text-[11px] text-emerald-800 font-extrabold flex items-center gap-1">
                <span>✓</span> Real-time practice sessions recorded
              </p>
            </div>

            <div className="bg-gradient-to-b from-[#F2FEF7] via-[#D9FBE8] to-[#D9FBE8] p-6 rounded-3xl border-2 border-emerald-300 shadow-md space-y-2 relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#1E1B4B] uppercase tracking-wider">Correct Answers</span>
                <span className="p-2.5 rounded-2xl bg-emerald-600 text-white font-bold shadow-md">✅</span>
              </div>
              <p className="text-3xl font-black text-emerald-700">{correctAnswers} <span className="text-sm font-bold text-[#1E1B4B]">({accuracyRate}%)</span></p>
              <p className="text-[11px] text-emerald-900 font-bold">Overall accuracy rate</p>
            </div>

            <div className="bg-gradient-to-b from-[#FFFCF0] via-[#FFF1CC] to-[#FFF1CC] p-6 rounded-3xl border-2 border-amber-300 shadow-md space-y-2 relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#1E1B4B] uppercase tracking-wider">Avg. Speed</span>
                <span className="p-2.5 rounded-2xl bg-amber-600 text-white font-bold shadow-md">⏱️</span>
              </div>
              <p className="text-3xl font-black text-amber-800">{avgSecondsPerQ > 0 ? `${avgSecondsPerQ}s` : '--'} <span className="text-xs text-slate-600 font-bold">/ Question</span></p>
              <p className="text-[11px] text-amber-900 font-extrabold flex items-center gap-1">
                <span>⚡</span> Average time spent per question
              </p>
            </div>
          </div>

          {/* Speed & Accuracy Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-white via-[#F8F5FF] to-[#EDE7FF]/70 rounded-3xl p-6 sm:p-7 border-2 border-violet-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-violet-200/80 pb-4">
                <h3 className="text-sm font-black text-[#1E1B4B] flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-violet-600" />
                  Subject-Wise Accuracy
                </h3>
              </div>
              <div className="py-6 text-center text-slate-600 font-semibold text-xs">
                Detailed subject breakdowns update as questions are completed in multiple subjects.
              </div>
            </div>

            <div className="bg-gradient-to-br from-white via-[#F2FCFB] to-[#D8F7F5]/70 rounded-3xl p-6 sm:p-7 border-2 border-teal-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-teal-200/80 pb-4">
                <h3 className="text-sm font-black text-[#1E1B4B] flex items-center gap-2">
                  <Clock className="h-5 w-5 text-teal-600" />
                  Time & Speed Breakdown
                </h3>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-teal-200 flex items-center justify-between shadow-2xs">
                  <div>
                    <p className="text-xs font-bold text-slate-600">Avg. Time per Question</p>
                    <p className="text-lg font-black text-[#1E1B4B]">{avgSecondsPerQ > 0 ? `${avgSecondsPerQ} seconds` : 'Calculating...'}</p>
                  </div>
                  <span className="p-3 rounded-2xl bg-[#D9FBE8] text-emerald-700 border border-emerald-200 text-lg">⚡</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


