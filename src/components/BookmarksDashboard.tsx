/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { BookmarkItem, AppConfig } from '../types';
import {
  calculateBookmarkStats,
  filterBookmarks,
  removeBookmarks
} from '../services/bookmarkService';
import { BookmarkPracticeModal } from './BookmarkPracticeModal';
import {
  Bookmark,
  BookmarkCheck,
  Search,
  Filter,
  Trash2,
  Play,
  BookOpen,
  Calendar,
  Layers,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  X,
  SlidersHorizontal,
  FolderOpen,
  Sparkles,
  Trophy,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookmarksDashboardProps {
  bookmarks: BookmarkItem[];
  onUpdateBookmarks: (newBookmarks: BookmarkItem[]) => void;
  appConfig?: AppConfig;
}

export const BookmarksDashboard: React.FC<BookmarksDashboardProps> = ({
  bookmarks,
  onUpdateBookmarks,
  appConfig
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'mcq' | 'current_affairs'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'subject'>('newest');

  // Multi-select for deletion
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);

  // Practice modal state
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);

  // Detail preview modal
  const [previewBookmark, setPreviewBookmark] = useState<BookmarkItem | null>(null);

  // Calculate statistics
  const stats = useMemo(() => calculateBookmarkStats(bookmarks), [bookmarks]);

  // Dynamic lists for filters
  const availableSubjects = useMemo(() => Object.values(stats.bySubject), [stats]);
  const availableMonths = useMemo(() => Object.keys(stats.byMonth), [stats]);

  // Filtered bookmarks list
  const filteredList = useMemo(() => {
    return filterBookmarks(bookmarks, {
      itemType: activeTab,
      subjectId: selectedSubject || undefined,
      unitId: selectedUnit || undefined,
      topicId: selectedTopic || undefined,
      month: selectedMonth || undefined,
      searchQuery,
      sortBy
    });
  }, [bookmarks, activeTab, selectedSubject, selectedUnit, selectedTopic, selectedMonth, searchQuery, sortBy]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredList.map((b) => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const updated = await removeBookmarks(selectedIds, bookmarks);
    onUpdateBookmarks(updated);
    setSelectedIds([]);
    setShowConfirmDeleteModal(false);
  };

  const handleSingleDelete = async (id: string) => {
    const updated = await removeBookmarks([id], bookmarks);
    onUpdateBookmarks(updated);
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6 font-sans text-slate-100 pb-28">
      {/* Ultra-Premium Luxury Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white border border-amber-200 shadow-md p-6 sm:p-8"
      >
        {/* Subtle Gold / Amber Glow Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 text-xs font-black uppercase tracking-widest shadow-xs">
              <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" /> Ultra-Secure Saved Vault
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span>My Saved Bookmarks</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-white border border-amber-300 text-amber-800 font-mono shadow-xs">
                {stats.total} Total
              </span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Your personal collection of important questions and current affairs. Access detailed explanations, verify correct answers, and practice bookmarked items anytime.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsPracticeModalOpen(true)}
              disabled={stats.mcqCount === 0}
              className="px-5 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-105 disabled:opacity-40 text-slate-950 rounded-2xl font-black text-xs sm:text-sm shadow-md flex items-center gap-2.5 transition-all cursor-pointer border border-amber-300"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Practice Bookmarks ({stats.mcqCount})</span>
            </motion.button>
          </div>
        </div>

        {/* Luxury Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-amber-200/80 relative z-10">
          <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] text-slate-500 font-black uppercase tracking-wider">Total Saved</div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 font-mono">{stats.total}</div>
          </div>
          <div className="bg-white/90 backdrop-blur-md border border-amber-300 rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] text-amber-800 font-black uppercase tracking-wider">Bookmarked MCQs</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-1 font-mono">{stats.mcqCount}</div>
          </div>
          <div className="bg-white/90 backdrop-blur-md border border-cyan-300 rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] text-cyan-800 font-black uppercase tracking-wider">Current Affairs</div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-700 mt-1 font-mono">{stats.caCount}</div>
          </div>
          <div className="bg-white/90 backdrop-blur-md border border-emerald-300 rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] text-emerald-800 font-black uppercase tracking-wider">Unique Subjects</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1 font-mono">
              {Object.keys(stats.bySubject).length}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs & Search Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 space-y-4 shadow-sm">
        {/* Navigation Tabs & Bulk Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Bookmarks ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab('mcq')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeTab === 'mcq'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              MCQs ({stats.mcqCount})
            </button>
            <button
              onClick={() => setActiveTab('current_affairs')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeTab === 'current_affairs'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Current Affairs ({stats.caCount})
            </button>
          </div>

          {/* Bulk Action Pill */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-2xl">
              <span className="text-xs font-black text-rose-800">
                {selectedIds.length} Selected
              </span>
              <button
                onClick={() => setShowConfirmDeleteModal(true)}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Selected
              </button>
            </div>
          )}
        </div>

        {/* Filter Toolbar Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search question text, explanation, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Subject Filter */}
          {activeTab !== 'current_affairs' && (
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedUnit('');
                setSelectedTopic('');
              }}
              className="bg-white border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="">All Subjects</option>
              {availableSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.count})
                </option>
              ))}
            </select>
          )}

          {/* CA Month Filter */}
          {activeTab !== 'mcq' && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="">All Months</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m} ({stats.byMonth[m]})
                </option>
              ))}
            </select>
          )}

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="subject">Sort: By Subject Name</option>
          </select>
        </div>
      </div>

      {/* Bookmarks List or Empty State */}
      {filteredList.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-200 rounded-3xl p-12 sm:p-16 text-center space-y-4 shadow-sm"
        >
          <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <Bookmark className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900">No Saved Questions Yet</h3>
            <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              You haven't bookmarked any questions or current affairs matching your current filters. Click the bookmark icon during practice to save important questions here.
            </p>
          </div>
          {(selectedSubject || selectedMonth || searchQuery || activeTab !== 'all') && (
            <button
              onClick={() => {
                setSelectedSubject('');
                setSelectedUnit('');
                setSelectedTopic('');
                setSelectedMonth('');
                setSearchQuery('');
                setActiveTab('all');
              }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-amber-800 rounded-2xl text-xs sm:text-sm font-black transition-colors cursor-pointer border border-slate-300"
            >
              Reset Filters & View All
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-4">
          {/* Header Selection Row */}
          <div className="flex items-center justify-between px-2 text-xs font-black text-slate-600 uppercase tracking-widest">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selectedIds.length === filteredList.length && filteredList.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 bg-white cursor-pointer"
              />
              Select All ({filteredList.length})
            </label>
            <span className="font-mono text-slate-500">Showing {filteredList.length} items</span>
          </div>

          {/* Luxury Saved Question Cards */}
          <div className="space-y-3.5">
            {filteredList.map((item, index) => {
              const isSelected = selectedIds.includes(item.id);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className={`rounded-3xl p-4 sm:p-6 transition-all relative group overflow-hidden bg-white border shadow-sm ${
                    isSelected
                      ? 'border-amber-500/85 ring-1 ring-amber-500/50 bg-amber-50/30'
                      : 'border-slate-200 hover:border-amber-300'
                  }`}
                >
                  {/* Subtle Gold Accent Glow */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-start gap-3 sm:gap-4 relative z-10">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(item.id)}
                      className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500 bg-white mt-1 cursor-pointer shrink-0"
                    />

                    {/* Card Main Body */}
                    <div className="flex-1 space-y-3 min-w-0">
                      {/* Metadata Badges */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
                        {item.itemType === 'mcq' ? (
                          <span className="px-2.5 py-0.5 rounded-lg font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <BookmarkCheck className="w-3 h-3 text-amber-600" /> MCQ
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-lg font-black uppercase tracking-wider bg-cyan-50 text-cyan-800 border border-cyan-200">
                            Current Affairs
                          </span>
                        )}

                        {item.subjectName && (
                          <span className="px-2.5 py-0.5 rounded-lg font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {item.subjectName}
                          </span>
                        )}

                        {item.unitName && (
                          <span className="px-2.5 py-0.5 rounded-lg font-medium bg-slate-50 text-slate-600 border border-slate-200">
                            {item.unitName}
                          </span>
                        )}

                        {item.month && (
                          <span className="px-2.5 py-0.5 rounded-lg font-medium bg-cyan-50 text-cyan-800 border border-cyan-200 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-cyan-600" /> {item.month}
                          </span>
                        )}

                        <span className="text-slate-400 text-[11px] ml-auto font-mono">
                          Saved: {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Question / Content Text */}
                      {item.itemType === 'mcq' && item.question && (
                        <div className="space-y-3">
                          <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug tracking-tight">
                            {item.question.questionText}
                          </h4>

                          {/* Options preview */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {(['A', 'B', 'C', 'D'] as const).map((key) => {
                              const optText = item.question?.options[key];
                              if (!optText) return null;
                              const isCorrect = item.question?.correctOption === key;

                              return (
                                <div
                                  key={key}
                                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                                    isCorrect
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                      : 'bg-slate-50 border-slate-200 text-slate-700'
                                  }`}
                                >
                                  <span
                                    className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 ${
                                      isCorrect ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {key}
                                  </span>
                                  <span className="truncate">{optText}</span>
                                  {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {item.itemType === 'current_affairs' && item.currentAffairs && (
                        <div className="space-y-2">
                          <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                            {item.currentAffairs.title}
                          </h4>
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {item.currentAffairs.summary || item.currentAffairs.content}
                          </p>
                        </div>
                      )}

                      {/* Quick Explanation */}
                      {item.itemType === 'mcq' && item.question?.explanation && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-slate-800 space-y-1">
                          <span className="font-black text-amber-800 uppercase text-[10px] tracking-widest block">
                            💡 Explanation:
                          </span>
                          <p className="line-clamp-2 text-slate-700">{item.question.explanation}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions Right */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button
                        onClick={() => setPreviewBookmark(item)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-amber-100 text-slate-800 rounded-xl transition-colors text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer border border-slate-200"
                        title="View Full Details"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                        <span className="hidden sm:inline">View</span>
                      </button>

                      <button
                        onClick={() => handleSingleDelete(item.id)}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition-colors text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer border border-rose-200"
                        title="Remove Bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail Preview Modal */}
      <AnimatePresence>
        {previewBookmark && (
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-amber-300 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setPreviewBookmark(null)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {previewBookmark.itemType === 'mcq' && previewBookmark.question && (
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Bookmarked Question Detail
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-relaxed">
                    {previewBookmark.question.questionText}
                  </h3>

                  <div className="space-y-2.5">
                    {(['A', 'B', 'C', 'D'] as const).map((key) => {
                      const text = previewBookmark.question?.options[key];
                      if (!text) return null;
                      const isCorrect = previewBookmark.question?.correctOption === key;

                      return (
                        <div
                          key={key}
                          className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-xl flex items-center justify-center font-black text-xs ${
                              isCorrect ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {key}
                          </span>
                          <span className="text-xs sm:text-sm">{text}</span>
                          {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {previewBookmark.question.explanation && (
                    <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-1.5">
                      <span className="text-xs font-black text-amber-800 uppercase tracking-widest block">
                        💡 Detailed Explanation:
                      </span>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {previewBookmark.question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {previewBookmark.itemType === 'current_affairs' && previewBookmark.currentAffairs && (
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-100 text-cyan-800 border border-cyan-300 inline-block">
                    Saved Current Affairs
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    {previewBookmark.currentAffairs.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {previewBookmark.currentAffairs.content || previewBookmark.currentAffairs.summary}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Bulk Delete Modal */}
      <AnimatePresence>
        {showConfirmDeleteModal && (
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-rose-300 rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Confirm Removal</h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Are you sure you want to remove <span className="text-amber-800 font-bold">{selectedIds.length}</span> bookmark(s) from your saved vault?
              </p>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  onClick={() => setShowConfirmDeleteModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs sm:text-sm font-black transition-colors cursor-pointer border border-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs sm:text-sm font-black transition-colors cursor-pointer shadow-md"
                >
                  Yes, Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Practice Saved Questions Modal */}
      <BookmarkPracticeModal
        isOpen={isPracticeModalOpen}
        onClose={() => setIsPracticeModalOpen(false)}
        bookmarks={filteredList}
        title="Practice Bookmarked Questions"
      />
    </div>
  );
};
