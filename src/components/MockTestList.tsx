/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  Sparkles,
  Clock,
  HelpCircle,
  Play,
  RotateCcw,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  FileText,
  Calendar,
  AlertCircle,
  Plus,
  BarChart2,
  ChevronRight,
  Zap
} from 'lucide-react';
import {
  AppConfig,
  Question,
  CurrentAffairsItem,
  MockTest,
  MockTestAttempt
} from '../types';
import {
  fetchMockTestsFromFirestore,
  fetchMockAttemptsFromFirestore,
  deleteMockTestFromFirestore
} from '../services/mockTestService';
import MockTestGeneratorModal from './MockTestGeneratorModal';
import MockTestRunnerModal from './MockTestRunnerModal';

import { MockTestResultView } from './MockTestResultView';

interface MockTestListProps {
  currentApp: AppConfig;
  questions: Question[];
  currentAffairs: CurrentAffairsItem[];
  userId?: string;
  userName?: string;
  userEmail?: string;
}

export const MockTestList: React.FC<MockTestListProps> = ({
  currentApp,
  questions,
  currentAffairs,
  userId,
  userName,
  userEmail
}) => {
  const [activeTab, setActiveTab] = useState<'official' | 'custom' | 'history'>('official');
  const [stageFilter, setStageFilter] = useState<'all' | 'prelims' | 'mains'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [tests, setTests] = useState<MockTest[]>([]);
  const [attempts, setAttempts] = useState<MockTestAttempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Active runner/result state
  const [isGeneratorOpen, setIsGeneratorOpen] = useState<boolean>(false);
  const [activeTestForRunner, setActiveTestForRunner] = useState<MockTest | null>(null);
  const [activeAttemptForRunner, setActiveAttemptForRunner] = useState<MockTestAttempt | undefined>(
    undefined
  );
  const [activeResult, setActiveResult] = useState<{
    test: MockTest;
    attempt: MockTestAttempt;
  } | null>(null);

  // Load tests and user attempts
  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedTests, fetchedAttempts] = await Promise.all([
        fetchMockTestsFromFirestore(currentApp.id),
        fetchMockAttemptsFromFirestore(userId, currentApp.id)
      ]);
      setTests(fetchedTests);
      setAttempts(fetchedAttempts);
    } catch (e) {
      console.error('Failed to load mock tests:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentApp.id, userId]);

  // Derived attempts lookup map by mockTestId
  const latestAttemptsMap = useMemo(() => {
    const map = new Map<string, MockTestAttempt>();
    attempts.forEach((a) => {
      const existing = map.get(a.mockTestId);
      if (!existing || new Date(a.startedAt).getTime() > new Date(existing.startedAt).getTime()) {
        map.get(a.mockTestId);
        map.set(a.mockTestId, a);
      }
    });
    return map;
  }, [attempts]);

  // Filtered lists
  const officialTests = useMemo(() => {
    return tests
      .filter((t) => t.creatorType === 'admin' || t.creatorType === 'system' || t.isOfficial)
      .filter((t) => stageFilter === 'all' || !t.config.stage || t.config.stage === stageFilter)
      .filter(
        (t) =>
          !searchQuery ||
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [tests, stageFilter, searchQuery]);

  const customTests = useMemo(() => {
    return tests
      .filter((t) => t.creatorType === 'user' || !t.isOfficial)
      .filter((t) => stageFilter === 'all' || !t.config.stage || t.config.stage === stageFilter)
      .filter(
        (t) =>
          !searchQuery ||
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [tests, stageFilter, searchQuery]);

  // Delete custom mock test
  const handleDeleteCustomTest = async (testId: string) => {
    if (window.confirm('Are you sure you want to delete this custom test?')) {
      await deleteMockTestFromFirestore(testId);
      setTests((prev) => prev.filter((t) => t.id !== testId));
    }
  };

  // Start test
  const handleStartTest = (test: MockTest, existing?: MockTestAttempt) => {
    setActiveTestForRunner(test);
    setActiveAttemptForRunner(existing);
  };

  // Complete runner
  const handleFinishRunner = (attempt: MockTestAttempt) => {
    if (activeTestForRunner) {
      setActiveResult({ test: activeTestForRunner, attempt });
    }
    setActiveTestForRunner(null);
    setActiveAttemptForRunner(undefined);
    loadData();
  };

  // Active Runner view
  if (activeTestForRunner) {
    return (
      <MockTestRunnerModal
        test={activeTestForRunner}
        userId={userId}
        userName={userName}
        userEmail={userEmail}
        existingAttempt={activeAttemptForRunner}
        onClose={() => {
          setActiveTestForRunner(null);
          setActiveAttemptForRunner(undefined);
        }}
        onFinish={handleFinishRunner}
      />
    );
  }

  // Active Result view
  if (activeResult) {
    return (
      <MockTestResultView
        test={activeResult.test}
        attempt={activeResult.attempt}
        onRetake={() => {
          const testToRetake = activeResult.test;
          setActiveResult(null);
          handleStartTest(testToRetake);
        }}
        onBack={() => setActiveResult(null)}
      />
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner & Generator Launcher CTA */}
      <div className="bg-gradient-to-r from-[#FFF1CC] via-[#FFF8E7] to-[#DCEBFF] border-2 border-amber-300 rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden text-[#1E1B4B]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-white/90 text-[#1E1B4B] font-extrabold text-xs border border-amber-300 flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Premium Mock Center
              </span>
              <span className="text-xs font-bold text-indigo-800">• {currentApp.name}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-[#1E1B4B] tracking-tight">
              Mock Exam Hall & Test Generator
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              Experience authentic exam conditions with official curated test papers or generate instant custom practice tests with customizable negative marking rules.
            </p>
          </div>

          <button
            onClick={() => setIsGeneratorOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 hover:brightness-105 text-white font-black text-xs sm:text-sm shadow-lg flex items-center justify-center space-x-2 shrink-0 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Custom Mock Test</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200 pb-4">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 bg-[#FFF8E7] border-2 border-amber-300 p-1.5 rounded-2xl text-xs w-full sm:w-auto shadow-2xs">
          <button
            onClick={() => setActiveTab('official')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-black transition flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === 'official'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm'
                : 'text-[#1E1B4B] hover:bg-[#FFF1CC]'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Official Tests ({officialTests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-black transition flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm'
                : 'text-[#1E1B4B] hover:bg-[#FFF1CC]'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>My Custom Tests ({customTests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl font-black transition flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm'
                : 'text-[#1E1B4B] hover:bg-[#FFF1CC]'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Attempt Reports ({attempts.length})</span>
          </button>
        </div>

        {/* Search & Stage Filter */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-amber-300 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-[#1E1B4B] placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as any)}
            className="bg-white border border-amber-300 text-[#1E1B4B] font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Stages</option>
            <option value="prelims">Prelims</option>
            <option value="mains">Mains</option>
          </select>
        </div>
      </div>

      {/* Tests Grid Content */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Loading mock tests database...</p>
        </div>
      ) : activeTab === 'history' ? (
        /* Past Attempts List */
        attempts.length === 0 ? (
          <div className="bg-gradient-to-br from-[#FFF8E7] via-white to-[#DCEBFF]/60 border-2 border-amber-300 rounded-3xl p-12 text-center space-y-4 shadow-sm">
            <FileText className="w-12 h-12 text-amber-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-black text-[#1E1B4B]">No Attempt History Yet</h3>
              <p className="text-xs text-slate-600 font-semibold">
                Attempt official or custom generated tests to generate performance reports here.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('official')}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-xs font-black cursor-pointer"
            >
              Browse Official Tests
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((attempt) => {
              const matchedTest = tests.find((t) => t.id === attempt.mockTestId);
              return (
                <div
                  key={attempt.id}
                  className="bg-gradient-to-r from-[#FFF8E7] via-white to-[#D9FBE8]/40 border-2 border-amber-200 rounded-2xl p-5 hover:border-amber-400 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="px-2.5 py-0.5 bg-[#D9FBE8] text-emerald-800 border border-emerald-300 rounded-md font-black">
                        {attempt.score.toFixed(1)} / {attempt.maxMarks} Marks
                      </span>
                      <span className="text-slate-600 font-bold">• {attempt.accuracyPercentage}% Accuracy</span>
                    </div>
                    <h3 className="text-sm font-black text-[#1E1B4B]">{attempt.mockTestTitle}</h3>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Attempted on {new Date(attempt.completedAt || attempt.startedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        if (matchedTest) {
                          setActiveResult({ test: matchedTest, attempt });
                        }
                      }}
                      className="px-4 py-2 bg-[#DCEBFF] hover:bg-sky-200 text-[#1E1B4B] border border-sky-300 text-xs font-black rounded-xl transition cursor-pointer"
                    >
                      View Report
                    </button>
                    {matchedTest && (
                      <button
                        onClick={() => handleStartTest(matchedTest)}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-black rounded-xl transition flex items-center space-x-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Re-take</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Official or Custom Test Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(activeTab === 'official' ? officialTests : customTests).length === 0 ? (
            <div className="col-span-full bg-gradient-to-br from-[#FFF8E7] via-white to-[#DCEBFF]/60 border-2 border-amber-300 rounded-3xl p-12 text-center space-y-4 shadow-sm">
              <Zap className="w-12 h-12 text-amber-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-black text-[#1E1B4B]">
                  No {activeTab === 'official' ? 'Official' : 'Custom'} Tests Found
                </h3>
                <p className="text-xs text-slate-600 font-semibold">
                  {activeTab === 'custom'
                    ? 'Generate your first personalized mock test matching your exact study schedule.'
                    : 'No official mock tests uploaded yet. Check back soon or create a custom test.'}
                </p>
              </div>
              {activeTab === 'custom' && (
                <button
                  onClick={() => setIsGeneratorOpen(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
                >
                  Generate Mock Test Now
                </button>
              )}
            </div>
          ) : (
            (activeTab === 'official' ? officialTests : customTests).map((t, idx) => {
              const pastAttempt = latestAttemptsMap.get(t.id);
              const cardThemes = [
                'bg-gradient-to-b from-[#FFFCF0] via-[#FFF8E7] to-[#FFF1CC] border-amber-300',
                'bg-gradient-to-b from-[#F4F9FF] via-white to-[#DCEBFF] border-sky-300',
                'bg-gradient-to-b from-[#F2FEF7] via-white to-[#D9FBE8] border-emerald-300',
              ];
              const cardStyle = cardThemes[idx % cardThemes.length];

              return (
                <div
                  key={t.id}
                  className={`${cardStyle} border-2 rounded-2xl p-5 shadow-md hover:shadow-xl flex flex-col justify-between space-y-4 transition group`}
                >
                  <div className="space-y-3">
                    {/* Header badges */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-white text-[#1E1B4B] font-black border border-amber-300 uppercase text-[10px]">
                        {t.config.stage || 'Prelims'}
                      </span>

                      <div className="flex items-center space-x-2 text-[11px] font-bold text-[#1E1B4B]">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>{t.durationMinutes}m</span>
                        </span>
                        <span>•</span>
                        <span>{t.questionsCount} Qs</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-[#1E1B4B] group-hover:text-indigo-800 transition line-clamp-1">
                        {t.title}
                      </h3>
                      {t.description && (
                        <p className="text-xs text-slate-600 font-medium mt-1 line-clamp-2">{t.description}</p>
                      )}
                    </div>

                    {/* Test Rules Badge */}
                    <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200 text-[11px] text-slate-600 font-bold flex items-center justify-between">
                      <span>Total Marks: <strong className="text-[#1E1B4B]">{t.totalMarks}</strong></span>
                      <span className="text-emerald-700">+{t.positiveMarks}</span>
                      <span className="text-rose-700">-{t.negativeMarks}</span>
                    </div>

                    {/* Past Attempt Status Banner */}
                    {pastAttempt && (
                      <div className="bg-[#D9FBE8] border border-emerald-300 rounded-xl p-2.5 text-xs flex items-center justify-between text-[#1E1B4B]">
                        <div className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span className="font-bold">
                            Last Score: {pastAttempt.score.toFixed(1)} / {pastAttempt.maxMarks}
                          </span>
                        </div>
                        <span className="text-[11px] text-emerald-800 font-black">
                          {pastAttempt.accuracyPercentage}% Acc
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-amber-200/80 flex items-center space-x-2">
                    <button
                      onClick={() => handleStartTest(t, pastAttempt)}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:brightness-105 text-white font-black text-xs shadow-sm flex items-center justify-center space-x-1.5 transition cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{pastAttempt ? 'Re-take Test' : 'Start Mock Test'}</span>
                    </button>

                    {pastAttempt && (
                      <button
                        onClick={() => setActiveResult({ test: t, attempt: pastAttempt })}
                        className="p-2.5 rounded-xl bg-white hover:bg-[#DCEBFF] text-[#1E1B4B] border border-amber-300 text-xs font-bold cursor-pointer"
                        title="View Report"
                      >
                        <BarChart2 className="w-4 h-4" />
                      </button>
                    )}

                    {t.creatorType === 'user' && (
                      <button
                        onClick={() => handleDeleteCustomTest(t.id)}
                        className="p-2.5 rounded-xl bg-[#FFE0EA] hover:bg-rose-200 text-rose-700 border border-pink-300 text-xs font-bold transition cursor-pointer"
                        title="Delete Test"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Generator Modal Component */}
      <MockTestGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        currentApp={currentApp}
        questions={questions}
        currentAffairs={currentAffairs}
        userId={userId}
        userName={userName}
        onTestGenerated={(newTest) => {
          setTests((prev) => [newTest, ...prev]);
          setActiveTab('custom');
          handleStartTest(newTest);
        }}
      />
    </div>
  );
};
