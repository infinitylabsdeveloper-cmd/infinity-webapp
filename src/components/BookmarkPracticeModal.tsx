/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookmarkItem, Question } from '../types';
import {
  X,
  Play,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Award,
  ChevronLeft,
  ChevronRight,
  BookmarkCheck,
  Sparkles
} from 'lucide-react';

interface BookmarkPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: BookmarkItem[];
  title?: string;
}

export const BookmarkPracticeModal: React.FC<BookmarkPracticeModalProps> = ({
  isOpen,
  onClose,
  bookmarks,
  title = 'Practice Saved Questions'
}) => {
  // Extract questions from MCQ bookmarks
  const questions: Question[] = React.useMemo(() => {
    return bookmarks
      .filter((b) => b.itemType === 'mcq' && b.question)
      .map((b) => b.question as Question);
  }, [bookmarks]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <BookmarkCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No MCQ Bookmarks Available</h3>
          <p className="text-slate-400 text-sm mb-6">
            You don't have any bookmarked questions matching this filter. Bookmark questions while practicing or taking mock tests to review them here.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const selectedOpt = selectedAnswers[currentQ.id];
  const isAnswered = selectedOpt !== undefined;

  const handleSelectOption = (opt: 'A' | 'B' | 'C' | 'D') => {
    if (selectedAnswers[currentQ.id]) return; // locked once answered in practice mode
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: opt }));
    setShowExplanation((prev) => ({ ...prev, [currentQ.id]: true }));
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  let correctCount = 0;
  Object.entries(selectedAnswers).forEach(([qId, ans]) => {
    const q = questions.find((item) => item.id === qId);
    if (q && q.correctOption === ans) correctCount++;
  });

  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  const handleFinish = () => {
    setIsCompleted(true);
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setShowExplanation({});
    setCurrentIndex(0);
    setIsCompleted(false);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{title}</h2>
              <p className="text-xs text-slate-400">
                Question {currentIndex + 1} of {questions.length} • {answeredCount} Answered
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!isCompleted ? (
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <div className="space-y-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Bookmarked MCQ
              </span>
              <h3 className="text-lg font-medium text-slate-100 leading-relaxed">
                {currentQ.questionText}
              </h3>
            </div>

            {/* Options - Unique answer options only */}
            <div className="space-y-3">
              {(['A', 'B', 'C', 'D'] as const)
                .filter((key, idx, arr) => {
                  const text = currentQ.options?.[key];
                  if (!text || !text.trim()) return false;
                  const norm = text.trim().toLowerCase().replace(/\s+/g, ' ');
                  return arr.findIndex(k => (currentQ.options?.[k] || '').trim().toLowerCase().replace(/\s+/g, ' ') === norm) === idx;
                })
                .map((key) => {
                const text = currentQ.options[key];
                if (!text) return null;

                const isSelected = selectedOpt === key;
                const isCorrect = currentQ.correctOption === key;

                let stateClasses = 'bg-slate-800/60 border-slate-700/60 text-slate-200 hover:border-slate-600 hover:bg-slate-800';
                if (isAnswered) {
                  if (isCorrect) {
                    stateClasses = 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-medium';
                  } else if (isSelected) {
                    stateClasses = 'bg-rose-500/10 border-rose-500 text-rose-300';
                  } else {
                    stateClasses = 'bg-slate-800/30 border-slate-800 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={key}
                    onClick={() => handleSelectOption(key)}
                    disabled={isAnswered}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${stateClasses}`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                        isAnswered && isCorrect
                          ? 'bg-emerald-500 text-white'
                          : isAnswered && isSelected
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {key}
                    </span>
                    <div className="flex-1 text-sm pt-0.5 leading-relaxed">{text}</div>
                    {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {isAnswered && currentQ.explanation && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1 text-sm">
                <div className="flex items-center gap-2 font-semibold text-amber-400 text-xs uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" /> Explanation
                </div>
                <p className="text-slate-200 text-sm leading-relaxed">{currentQ.explanation}</p>
              </div>
            )}
          </div>
        ) : (
          /* Results View */
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto">
              <Award className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Practice Complete!</h3>
              <p className="text-slate-400 text-sm">Great job reviewing your saved questions.</p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 text-center">
                <div className="text-2xl font-bold text-white">{questions.length}</div>
                <div className="text-xs text-slate-400">Questions</div>
              </div>
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                <div className="text-2xl font-bold text-emerald-400">{correctCount}</div>
                <div className="text-xs text-emerald-300/80">Correct</div>
              </div>
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                <div className="text-2xl font-bold text-amber-400">{accuracy}%</div>
                <div className="text-xs text-amber-300/80">Accuracy</div>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <button
                onClick={handleRestart}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Practice Again
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-sm font-bold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        {!isCompleted && (
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
              >
                Finish Review
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
