import React, { useState, useMemo } from 'react';
import { MockTest, MockTestAttempt, AppConfig } from '../types';
import { 
  Award, Clock, CheckCircle2, Play, Plus, Search, Filter, 
  Trash2, ShieldCheck, Zap, RotateCcw, Sparkles, BookOpen, 
  Calendar, FileText, ChevronRight, Layers, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MockTestsListProps {
  mockTests: MockTest[];
  mockTestAttempts: MockTestAttempt[];
  activeApp: AppConfig;
  userId?: string;
  onOpenGenerator: () => void;
  onStartTest: (test: MockTest) => void;
  onDeleteTest?: (testId: string) => void;
}

export default function MockTestsList({
  mockTests = [],
  mockTestAttempts = [],
  activeApp,
  userId = 'user-guest',
  onOpenGenerator,
  onStartTest,
  onDeleteTest
}: MockTestsListProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'official' | 'custom'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtered Tests
  const filteredTests = useMemo(() => {
    return (mockTests || []).filter(t => {
      if (!t) return false;
      // App isolation check
      if (t.appId && t.appId !== activeApp?.id && t.appId !== 'all') return false;

      // Ownership & Official check
      if (activeTab === 'official' && !t.isOfficial) return false;
      if (activeTab === 'custom' && t.isOfficial) return false;

      // Type Filter
      if (typeFilter !== 'all' && t.config?.testType !== typeFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (t.title || '').toLowerCase().includes(q);
        const descMatch = (t.description || '').toLowerCase().includes(q);
        if (!titleMatch && !descMatch) return false;
      }

      return true;
    });
  }, [mockTests, activeApp?.id, activeTab, typeFilter, searchQuery]);

  // Helper to find latest attempt for a test
  const getLatestAttempt = (testId: string) => {
    const attempts = (mockTestAttempts || []).filter(a => a.mockTestId === testId);
    if (attempts.length === 0) return null;
    return attempts[attempts.length - 1]; // Latest
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner Header — Bright Royal Champagne, Ivory & Sapphire Sky */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#FFF1CC] via-[#FFF8E7] to-[#DCEBFF] text-[#1E1B4B] shadow-lg border-2 border-amber-300 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-xl z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/90 text-[#1E1B4B] border border-amber-300 text-xs font-black uppercase tracking-wider shadow-2xs">
              🏆 {activeApp?.name || 'Exam'} Test Series
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1E1B4B]">
            Available Mock Tests & Test Series
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold">
            Practice full-length grand mocks, subject tests, topic diagnostics, and monthly current affairs with real exam marking rules and instant solution analysis.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenGenerator}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 hover:brightness-105 text-white font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0 z-10"
        >
          <Zap className="w-5 h-5 fill-current stroke-none text-amber-300" />
          <span>Generate Custom Mock Test ⚡</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#FFF8E7] p-3 sm:p-4 rounded-2xl border-2 border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        
        {/* Main Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-amber-300 w-full sm:w-auto shadow-2xs">
          {[
            { id: 'all', label: 'All Tests' },
            { id: 'official', label: 'Official Published' },
            { id: 'custom', label: 'My Custom Tests' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xs' 
                  : 'text-[#1E1B4B] hover:bg-[#FFF1CC]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Dropdown & Search Bar */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-[#1E1B4B] focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Test Types</option>
            <option value="full_length">Full Length</option>
            <option value="subject_wise">Subject Wise</option>
            <option value="unit_wise">Unit Wise</option>
            <option value="topic_wise">Topic Wise</option>
            <option value="current_affairs">Current Affairs</option>
            <option value="custom_mixed">Custom Mixed</option>
          </select>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-semibold text-[#1E1B4B] placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

      </div>

      {/* Mock Tests Cards Grid */}
      {filteredTests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTests.map((test, idx) => {
            const attempt = getLatestAttempt(test.id);
            const isOwner = test.creatorUserId === userId;
            const cardThemes = [
              'bg-gradient-to-b from-[#FFFCF0] via-[#FFF8E7] to-[#FFF1CC] border-amber-300',
              'bg-gradient-to-b from-[#F4F9FF] via-white to-[#DCEBFF] border-sky-300',
              'bg-gradient-to-b from-[#F2FEF7] via-white to-[#D9FBE8] border-emerald-300',
              'bg-gradient-to-b from-[#F8F5FF] via-white to-[#EDE7FF] border-violet-300',
              'bg-gradient-to-b from-[#FFF5F8] via-white to-[#FFE0EA] border-pink-300',
              'bg-gradient-to-b from-[#F2FCFB] via-white to-[#D8F7F5] border-teal-300',
            ];
            const cardStyle = cardThemes[idx % cardThemes.length];

            return (
              <motion.div
                key={test.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-3xl ${cardStyle} border-2 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-4`}
              >
                <div className="space-y-3">
                  {/* Badges row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      test.isOfficial 
                        ? 'bg-[#FFF1CC] text-[#1E1B4B] border border-amber-400' 
                        : 'bg-[#DCEBFF] text-[#1E1B4B] border border-sky-300'
                    }`}>
                      {test.isOfficial ? '👑 Official Test' : '⚡ Custom Generator'}
                    </span>

                    <span className="text-[11px] font-extrabold text-indigo-800 capitalize">
                      {test.config?.stage || 'Prelims'} Stage
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-black text-[#1E1B4B] text-base leading-snug line-clamp-2">
                      {test.title}
                    </h3>
                    {test.description && (
                      <p className="text-xs text-slate-600 font-medium line-clamp-2 mt-1">
                        {test.description}
                      </p>
                    )}
                  </div>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-bold text-[#1E1B4B]">
                    <div className="p-2 rounded-xl bg-white/90 border border-amber-200/80 flex items-center gap-1.5 shadow-2xs">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{test.questionsCount || test.questionIds?.length || 0} Qs</span>
                    </div>

                    <div className="p-2 rounded-xl bg-white/90 border border-amber-200/80 flex items-center gap-1.5 shadow-2xs">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{test.durationMinutes} Mins</span>
                    </div>

                    <div className="p-2 rounded-xl bg-white/90 border border-amber-200/80 flex items-center gap-1.5 shadow-2xs">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{test.totalMarks} Marks</span>
                    </div>
                  </div>
                </div>

                {/* Footer Status & Actions */}
                <div className="pt-3 border-t border-amber-200/80 flex items-center justify-between gap-2">
                  <div>
                    {attempt ? (
                      <span className="text-xs font-black text-emerald-700 block">
                        Score: {attempt.score}/{attempt.maxMarks} Marks ({attempt.percentage}%)
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-600 block">
                        Not Attempted Yet
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwner && onDeleteTest && (
                      <button
                        type="button"
                        onClick={() => onDeleteTest(test.id)}
                        className="p-2 rounded-xl bg-[#FFE0EA] hover:bg-rose-200 text-rose-700 border border-pink-300 transition-colors cursor-pointer"
                        title="Delete Custom Test"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onStartTest(test)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:brightness-105 text-white font-black text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current stroke-none" />
                      <span>{attempt ? 'Review / Retry' : 'Start Test'}</span>
                    </button>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-gradient-to-br from-[#FFF8E7] via-white to-[#DCEBFF]/60 border-2 border-amber-300 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF1CC] text-amber-700 border border-amber-400 flex items-center justify-center mx-auto text-2xl font-black shadow-2xs">
            📚
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-[#1E1B4B]">
              No Mock Tests Found
            </h3>
            <p className="text-xs text-slate-600 font-semibold max-w-sm mx-auto">
              There are no mock tests matching your filter criteria. You can create your own custom mock test in seconds!
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenGenerator}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:brightness-105 text-white font-black text-xs shadow-md transition-all cursor-pointer"
          >
            Generate Custom Mock Test
          </button>
        </div>
      )}

    </div>
  );
}
