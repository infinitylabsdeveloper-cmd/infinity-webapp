/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  Award,
  BarChart2,
  ArrowLeft,
  RotateCcw,
  Check,
  X,
  HelpCircle,
  Filter,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import { MockTest, MockTestAttempt, Question, BookmarkItem } from '../types';
import { MathText } from './MathText';
import { isBookmarked, toggleBookmarkMCQ, fetchBookmarks } from '../services/bookmarkService';

interface MockTestResultViewProps {
  test: MockTest;
  attempt: MockTestAttempt;
  onRetake: () => void;
  onBack: () => void;
}

type FilterType = 'all' | 'correct' | 'incorrect' | 'unattempted';

export const MockTestResultView: React.FC<MockTestResultViewProps> = ({
  test,
  attempt,
  onRetake,
  onBack
}) => {
  const questions: Question[] = test.questions || [];
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  // Bookmarks state
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  React.useEffect(() => {
    fetchBookmarks('default_user_1', test.appId || 'default').then((bList) => {
      if (bList) setBookmarks(bList);
    });
  }, [test.appId]);

  const handleToggleBookmarkQuestion = async (q: Question, e: React.MouseEvent) => {
    e.stopPropagation();
    const { updatedBookmarks } = await toggleBookmarkMCQ({
      userId: 'default_user_1',
      appId: test.appId || 'default',
      question: q,
      currentBookmarks: bookmarks
    });
    setBookmarks(updatedBookmarks);
  };

  // Subject-wise performance metrics breakdown
  const subjectBreakdown = useMemo(() => {
    const stats: Record<
      string,
      { total: number; correct: number; incorrect: number; unattempted: number; score: number }
    > = {};

    questions.forEach((q) => {
      const subj = q.subjectId || 'General';
      if (!stats[subj]) {
        stats[subj] = { total: 0, correct: 0, incorrect: 0, unattempted: 0, score: 0 };
      }

      stats[subj].total++;
      const userAns = attempt.answers[q.id];
      if (userAns) {
        if (userAns === q.correctOption) {
          stats[subj].correct++;
          stats[subj].score += test.positiveMarks;
        } else {
          stats[subj].incorrect++;
          stats[subj].score -= test.negativeMarks;
        }
      } else {
        stats[subj].unattempted++;
      }
    });

    return Object.entries(stats).map(([subject, data]) => {
      const attempted = data.correct + data.incorrect;
      const accuracy = attempted > 0 ? ((data.correct / attempted) * 100).toFixed(1) : '0.0';
      return {
        subject: subject.toUpperCase(),
        ...data,
        accuracy: parseFloat(accuracy),
        score: Math.max(0, data.score)
      };
    });
  }, [questions, attempt, test]);

  // Filtered solutions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const userAns = attempt.answers[q.id];
      if (filter === 'correct') return userAns === q.correctOption;
      if (filter === 'incorrect') return userAns && userAns !== q.correctOption;
      if (filter === 'unattempted') return !userAns;
      return true;
    });
  }, [questions, attempt, filter]);

  // Format time display
  const formatSeconds = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}m ${s}s`;
  };

  const toggleExpand = (qId: string) => {
    setExpandedSolutions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8E7] via-white to-[#DCEBFF]/40 text-[#1E1B4B] p-4 sm:p-6 lg:p-8 space-y-8 font-sans">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-300 pb-4">
        <button
          onClick={onBack}
          className="px-3.5 py-2 rounded-xl bg-white border border-amber-300 hover:bg-[#FFF1CC] text-[#1E1B4B] text-xs font-extrabold flex items-center space-x-2 w-fit cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Mock Tests</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRetake}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:brightness-105 text-white font-black text-xs shadow-md flex items-center space-x-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-take Test</span>
          </button>
        </div>
      </div>

      {/* Hero Performance Overview Header */}
      <div className="bg-gradient-to-r from-[#FFF1CC] via-[#FFF8E7] to-[#DCEBFF] border-2 border-amber-300 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-amber-300/80 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-black text-indigo-800 uppercase tracking-widest flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-600" />
              Mock Test Report
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#1E1B4B]">{test.title}</h1>
            <p className="text-xs text-slate-600 font-semibold">
              Completed on {new Date(attempt.completedAt || Date.now()).toLocaleString()}
            </p>
          </div>

          {/* Big Score Card */}
          <div className="bg-white/95 border-2 border-amber-300 rounded-2xl px-6 py-4 flex items-center space-x-4 shadow-md">
            <div className="text-center">
              <div className="text-xs font-bold text-slate-600 uppercase">Score</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                {attempt.score.toFixed(1)}{' '}
                <span className="text-sm text-slate-600 font-bold">/ {attempt.maxMarks}</span>
              </div>
            </div>
            <div className="h-10 w-px bg-amber-300" />
            <div className="text-center">
              <div className="text-xs font-bold text-slate-600 uppercase">Percentage</div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-700">
                {attempt.percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/95 border border-sky-300 p-4 rounded-2xl space-y-1 shadow-2xs">
            <div className="text-xs text-slate-600 font-bold flex items-center space-x-1">
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              <span>Accuracy</span>
            </div>
            <div className="text-xl font-black text-[#1E1B4B]">{attempt.accuracyPercentage}%</div>
          </div>

          <div className="bg-[#D9FBE8]/70 border border-emerald-300 p-4 rounded-2xl space-y-1 shadow-2xs">
            <div className="text-xs text-emerald-900 font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Correct</span>
            </div>
            <div className="text-xl font-black text-emerald-800">
              {attempt.correctCount}{' '}
              <span className="text-xs text-emerald-900 font-bold">(+{attempt.positiveMarksAwarded})</span>
            </div>
          </div>

          <div className="bg-[#FFE0EA]/70 border border-pink-300 p-4 rounded-2xl space-y-1 shadow-2xs">
            <div className="text-xs text-rose-900 font-bold flex items-center space-x-1">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Incorrect</span>
            </div>
            <div className="text-xl font-black text-rose-800">
              {attempt.incorrectCount}{' '}
              <span className="text-xs text-rose-900 font-bold">(-{attempt.negativeMarksDeducted})</span>
            </div>
          </div>

          <div className="bg-[#FFF1CC]/70 border border-amber-300 p-4 rounded-2xl space-y-1 shadow-2xs">
            <div className="text-xs text-amber-900 font-bold flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Time Spent</span>
            </div>
            <div className="text-xl font-black text-[#1E1B4B]">{formatSeconds(attempt.timeSpentSeconds)}</div>
          </div>
        </div>
      </div>

      {/* Subject Wise Performance Table */}
      {subjectBreakdown.length > 0 && (
        <div className="bg-white border-2 border-amber-300 rounded-3xl p-6 space-y-4 shadow-md">
          <h3 className="text-base font-black text-[#1E1B4B] flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            <span>Subject-Wise Performance Analysis</span>
          </h3>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-amber-200 text-indigo-900 font-black uppercase tracking-wider bg-[#FFF8E7]">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4 text-center">Correct</th>
                  <th className="py-3 px-4 text-center">Wrong</th>
                  <th className="py-3 px-4 text-center">Unattempted</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-right">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {subjectBreakdown.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#FFF8E7]/60 transition">
                    <td className="py-3 px-4 font-black text-[#1E1B4B]">{row.subject}</td>
                    <td className="py-3 px-4 text-center font-black text-emerald-700">{row.correct}</td>
                    <td className="py-3 px-4 text-center font-black text-rose-700">{row.incorrect}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-600">{row.unattempted}</td>
                    <td className="py-3 px-4 text-center font-black text-indigo-800">{row.score.toFixed(1)}</td>
                    <td className="py-3 px-4 text-right font-black text-[#1E1B4B]">
                      <div className="flex items-center justify-end space-x-2">
                        <div className="w-16 bg-amber-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="bg-emerald-600 h-full rounded-full"
                            style={{ width: `${Math.min(100, row.accuracy)}%` }}
                          />
                        </div>
                        <span>{row.accuracy}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Solutions & Explanations Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base font-black text-[#1E1B4B] flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>Detailed Solutions & Key Takeaways</span>
          </h3>

          {/* Filter Tabs */}
          <div className="flex items-center bg-white border-2 border-amber-300 rounded-xl p-1 text-xs shadow-2xs">
            {[
              { id: 'all', label: `All (${questions.length})` },
              { id: 'correct', label: `Correct (${attempt.correctCount})` },
              { id: 'incorrect', label: `Incorrect (${attempt.incorrectCount})` },
              { id: 'unattempted', label: `Unattempted (${attempt.unattemptedCount})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-extrabold transition cursor-pointer ${
                  filter === tab.id
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white'
                    : 'text-[#1E1B4B] hover:bg-[#FFF1CC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question Cards List */}
        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const userAns = attempt.answers[q.id];
            const isCorrect = userAns === q.correctOption;
            const isUnattempted = !userAns;
            const isExpanded = expandedSolutions[q.id] ?? true;

            return (
              <div
                key={q.id}
                className={`bg-white border-2 rounded-2xl overflow-hidden transition shadow-xs ${
                  isCorrect
                    ? 'border-emerald-300'
                    : isUnattempted
                    ? 'border-amber-200'
                    : 'border-pink-300'
                }`}
              >
                {/* Header */}
                <div
                  onClick={() => toggleExpand(q.id)}
                  className="p-4 sm:p-5 cursor-pointer bg-[#FFF8E7]/60 hover:bg-[#FFF1CC]/50 flex items-start justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="font-black text-indigo-900">Q{questions.indexOf(q) + 1}.</span>
                      <span className="px-2 py-0.5 bg-[#DCEBFF] text-[#1E1B4B] border border-sky-300 font-bold rounded-md text-[11px]">
                        {q.subjectId.toUpperCase()}
                      </span>

                      {/* Result Tag */}
                      {isCorrect && (
                        <span className="px-2.5 py-0.5 bg-[#D9FBE8] text-emerald-900 font-black text-[11px] rounded-md border border-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Correct (+{test.positiveMarks})
                        </span>
                      )}
                      {!isCorrect && !isUnattempted && (
                        <span className="px-2.5 py-0.5 bg-[#FFE0EA] text-rose-900 font-black text-[11px] rounded-md border border-pink-400 flex items-center gap-1">
                          <X className="w-3 h-3" /> Incorrect (-{test.negativeMarks})
                        </span>
                      )}
                      {isUnattempted && (
                        <span className="px-2.5 py-0.5 bg-[#FFF1CC] text-[#1E1B4B] font-bold text-[11px] rounded-md border border-amber-300">
                          Unattempted (0)
                        </span>
                      )}
                    </div>

                    <div className="text-sm sm:text-base font-bold text-[#1E1B4B] leading-relaxed">
                      <MathText text={q.questionText} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleToggleBookmarkQuestion(q, e)}
                      title={isBookmarked(bookmarks, 'mcq', q.id) ? 'Remove Bookmark' : 'Save Question'}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isBookmarked(bookmarks, 'mcq', q.id)
                          ? 'bg-[#FFF1CC] text-[#1E1B4B] border-amber-400'
                          : 'bg-white text-slate-600 hover:text-[#1E1B4B] border-amber-300'
                      }`}
                    >
                      {isBookmarked(bookmarks, 'mcq', q.id) ? (
                        <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-600" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                    <button className="p-1.5 text-slate-600 hover:text-[#1E1B4B] rounded-lg">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 pt-0 space-y-4 border-t border-amber-200 bg-white">
                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-3">
                      {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                        const optText = q.options[optKey];
                        if (!optText) return null;

                        const isCorrectOption = q.correctOption === optKey;
                        const isUserOption = userAns === optKey;

                        let style = 'bg-[#FFF8E7]/50 border-amber-200 text-[#1E1B4B]';
                        if (isCorrectOption) {
                          style = 'bg-[#D9FBE8] border-emerald-500 text-emerald-950 font-bold';
                        } else if (isUserOption && !isCorrectOption) {
                          style = 'bg-[#FFE0EA] border-rose-500 text-rose-950 font-bold';
                        }

                        return (
                          <div
                            key={optKey}
                            className={`p-3 rounded-xl border flex items-start space-x-2.5 ${style}`}
                          >
                            <span className="w-5 h-5 rounded-md flex items-center justify-center font-black text-[11px] shrink-0 bg-white border border-amber-300 text-[#1E1B4B]">
                              {optKey}
                            </span>
                            <div className="flex-1 pt-0.5">
                              <MathText text={optText} />
                            </div>
                            {isCorrectOption && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                            {isUserOption && !isCorrectOption && (
                              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation Box */}
                    {q.explanation && (
                      <div className="bg-[#DCEBFF]/60 border border-sky-300 rounded-xl p-4 text-xs text-[#1E1B4B] space-y-1.5">
                        <div className="font-black text-indigo-900 uppercase tracking-wider text-[11px]">
                          Explanation & Exam Key Takeaways
                        </div>
                        <div className="leading-relaxed font-medium">
                          <MathText text={q.explanation} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MockTestResultView;
