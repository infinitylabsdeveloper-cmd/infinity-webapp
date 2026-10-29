import React, { useState, useMemo } from 'react';
import { AppConfig } from '../types';
import { 
  X, Search, BookOpen, Layers, Check, 
  Sparkles, Filter, ChevronRight, Shield, Award, Landmark,
  Compass, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AppNetworkSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  apps: AppConfig[];
  activeAppId: string;
  onSelectApp: (appId: string) => void;
}

export default function AppNetworkSelectorModal({
  isOpen,
  onClose,
  apps,
  activeAppId,
  onSelectApp
}: AppNetworkSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMedium, setSelectedMedium] = useState<string>('all');

  // Filter categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    apps.forEach(app => {
      if (app.examCategory) set.add(app.examCategory);
    });
    return ['all', ...Array.from(set)];
  }, [apps]);

  // Filtered Apps
  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      // Search
      const matchSearch = 
        !searchQuery.trim() || 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.jurisdiction && app.jurisdiction.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (app.examCategory && app.examCategory.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category
      const matchCategory = selectedCategory === 'all' || app.examCategory === selectedCategory;

      // Medium
      const matchMedium = 
        selectedMedium === 'all' || 
        (app.mediums && app.mediums.includes(selectedMedium)) ||
        (selectedMedium === 'EM' && app.name.includes('EM')) ||
        (selectedMedium === 'TM' && app.name.includes('TM')) ||
        (selectedMedium === 'HM' && app.name.includes('HM')) ||
        (selectedMedium === 'UM' && app.name.includes('UM'));

      return matchSearch && matchCategory && matchMedium;
    });
  }, [apps, searchQuery, selectedCategory, selectedMedium]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden font-sans"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-md">
                  🇮🇳 ALL INDIA
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Competitive Exams Network
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select your target examination portal across Public Service Commissions, Police, Railways, SSC, Forest & Teaching.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search & Filter Controls */}
          <div className="p-3.5 sm:p-5 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Exam Name, Category, or Board (e.g., Public Service, Police, Group 1, DSC, RRB, SSC)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Pills & Medium Suffix Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat === 'all' ? 'All Categories' : cat}
                  </button>
                ))}
              </div>

              {/* Medium Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 self-start sm:self-auto">
                <span className="text-[10px] font-black text-slate-400 uppercase px-1.5">Medium:</span>
                {['all', 'EM', 'TM', 'HM', 'UM'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMedium(m)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      selectedMedium === m
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {m === 'all' ? 'All' : m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Apps Grid */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-6">
            {filteredApps.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-xl">
                  🔍
                </div>
                <h4 className="text-base font-black text-slate-900 dark:text-white">No matching exams found</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Try adjusting your search terms, medium filter, or category pills.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredApps.map((app) => {
                  const isCurrent = app.id === activeAppId;
                  const subjectsCount = app.syllabus?.length || 0;

                  // Extract medium code
                  const mediumBadge = 
                    app.name.includes('TM') ? 'TM' :
                    app.name.includes('EM') ? 'EM' :
                    app.name.includes('HM') ? 'HM' :
                    app.name.includes('UM') ? 'UM' :
                    app.locale === 'te' ? 'TM' :
                    app.locale === 'hi' ? 'HM' : 'EM';

                  return (
                    <div
                      key={app.id}
                      onClick={() => {
                        onSelectApp(app.id);
                        onClose();
                      }}
                      className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                          : 'bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-xs hover:shadow-md'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Top Tag Row */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                            {app.examCategory || 'Competitive Exam'}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                              {mediumBadge}
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500 text-white flex items-center gap-0.5">
                                <Check className="h-2.5 w-2.5" /> ACTIVE
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug line-clamp-2">
                          {app.name}
                        </h3>

                        {/* Jurisdiction & Mediums summary */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          {app.jurisdiction && (
                            <span className="flex items-center gap-1">
                              📍 {app.jurisdiction}
                            </span>
                          )}
                          <span>•</span>
                          <span>📚 {subjectsCount} Subjects</span>
                        </div>
                      </div>

                      {/* Bottom Switch Trigger */}
                      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          {app.packageId || app.id}
                        </span>
                        <span className={`text-xs font-black flex items-center gap-1 ${
                          isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 group-hover:text-indigo-600'
                        }`}>
                          {isCurrent ? 'Current Portal' : 'Switch Portal'} <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 shrink-0">
            Showing <strong className="font-bold text-slate-700 dark:text-slate-200">{filteredApps.length}</strong> exam portals. State apps support Mother Language + English + Urdu. Central exams support English + Hindi + Urdu.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
