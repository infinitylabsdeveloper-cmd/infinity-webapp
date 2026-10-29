import React, { useState, useMemo } from 'react';
import { 
  X, Search, Globe, Check, Sparkles, MapPin, 
  BookOpen, Info, ShieldCheck, Compass, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LanguageCode, LANGUAGES, LanguageOption, isRTL } from '../lib/i18n';

interface LanguageRegionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: LanguageCode;
  onLanguageChange: (code: LanguageCode) => void;
  activeAppName?: string;
}

export default function LanguageRegionModal({
  isOpen,
  onClose,
  selectedLanguage,
  onLanguageChange,
  activeAppName = 'Competitive Exam'
}: LanguageRegionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [justSelected, setJustSelected] = useState<LanguageCode | null>(null);

  const zones = ['All', 'South', 'North', 'East', 'West', 'North-East', 'National'];

  const filteredLanguages = useMemo(() => {
    return LANGUAGES.filter(lang => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        lang.label.toLowerCase().includes(q) ||
        lang.nativeLabel.toLowerCase().includes(q) ||
        lang.region.toLowerCase().includes(q) ||
        lang.script.toLowerCase().includes(q) ||
        lang.code.toLowerCase().includes(q);

      const matchesZone = selectedZone === 'All' || lang.zone === selectedZone;

      return matchesSearch && matchesZone;
    });
  }, [searchQuery, selectedZone]);

  const handleSelect = (code: LanguageCode) => {
    setJustSelected(code);
    onLanguageChange(code);
    setTimeout(() => {
      onClose();
      setJustSelected(null);
    }, 280);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/30 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden font-sans"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/70 via-slate-50 to-white dark:from-slate-900 dark:to-slate-950 shrink-0 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Language & Region
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300">
                    22 Indian Languages
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Eighth Schedule of the Constitution of India • Active Exam App: <strong className="text-indigo-600 dark:text-indigo-400">{activeAppName}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Zone Filter Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-950/40 shrink-0">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by language (e.g., Telugu, हिन्दी, Urdu, Bangla, Tamil)..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Zone Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1">Zone:</span>
              {zones.map((zone) => (
                <button
                  key={zone}
                  onClick={() => setSelectedZone(zone)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedZone === zone
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {zone}
                </button>
              ))}
            </div>
          </div>

          {/* Languages Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredLanguages.map((lang) => {
                const isSelected = selectedLanguage === lang.code;
                const isRtlLang = isRTL(lang.code);

                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelect(lang.code)}
                    className={`relative p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between gap-3 group active:scale-[0.98] ${
                      isSelected
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-indigo-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-base sm:text-lg">{lang.flag}</span>
                          <span className={`text-base sm:text-lg font-black text-slate-900 dark:text-white truncate ${isRtlLang ? 'font-serif' : ''}`}>
                            {lang.nativeLabel}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5">
                          {lang.label}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-1">
                        {isRtlLang && (
                          <span className="text-[9px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.5 rounded-md">
                            RTL
                          </span>
                        )}
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-700 group-hover:border-indigo-400" />
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="truncate max-w-[140px] font-medium" title={lang.region}>
                        📍 {lang.region.split(',')[0]}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                        {lang.script.split('/')[0].trim()}
                      </span>
                    </div>

                    {justSelected === lang.code && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 bg-indigo-600/90 rounded-2xl flex items-center justify-center text-white font-black text-sm gap-2 backdrop-blur-2xs"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Language Applied!</span>
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>

            {filteredLanguages.length === 0 && (
              <div className="text-center py-12 space-y-3">
                <Globe className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-sm font-black text-slate-700 dark:text-slate-300">No language found matching "{searchQuery}"</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try searching by language name, script (e.g. Devanagari, Gurmukhi), or Indian state.
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedZone('All'); }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* Footer Notice */}
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Info className="w-4 h-4 text-indigo-500 shrink-0" />
              <p className="leading-tight">
                Language changes interface text instantly. Your exam app identity (<strong className="text-slate-800 dark:text-slate-200">{activeAppName}</strong>) and study progress remain preserved.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs transition-colors shrink-0 cursor-pointer shadow-sm"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
