import React, { useState, useEffect } from 'react';
import { CurrentAffairsItem, AppConfig } from '../types';
import { 
  ArrowLeft, Calendar, Sparkles, ChevronRight, ChevronLeft, BookOpen, Clock, Award, 
  ZoomIn, ZoomOut, Maximize2, Eye, EyeOff, Download, CheckCircle2, Check, 
  Layers, Type, Rotate3d, RotateCcw, Sliders, Shuffle, CheckCircle,
  Bookmark, BookmarkCheck
} from 'lucide-react';
import { isBookmarked, toggleBookmarkCA, fetchBookmarks } from '../services/bookmarkService';
import { BookmarkItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import MathText from './MathText';
import { 
  getSavedMotionConfig, 
  saveMotionConfig, 
  getQuestionMotionVariants, 
  PracticeMotionConfig 
} from '../utils/practiceMotion';
import PracticeMotionModal from './PracticeMotionModal';
import { useMcqFontSize } from '../lib/mcqFontStore';
import { McqFontControls } from './McqFontControls';
import {
  getCuratedCurrentAffairsImage,
  getBrightCardTheme,
  SmartCardImage,
} from '../lib/subjectVisuals';

interface CurrentAffairsViewProps {
  activeApp: AppConfig;
  currentAffairs?: CurrentAffairsItem[];
  onBackToHome: () => void;
  selectedLanguage: string;
}

export default function CurrentAffairsView({
  activeApp,
  currentAffairs = [],
  onBackToHome,
  selectedLanguage,
}: CurrentAffairsViewProps) {
  const { scaledTextStyle } = useMcqFontSize();
  const isTs = activeApp?.id === 'tspsc-group-2';
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedNews, setSelectedNews] = useState<CurrentAffairsItem | null>(null);
  const [fontSize, setFontSize] = useState<number>(18);
  const [readingMode, setReadingMode] = useState<boolean>(false);
  const [readerTheme, setReaderTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [isArticlePaletteOpen, setIsArticlePaletteOpen] = useState<boolean>(false);

  // View Mode: Standard Articles Grid Feed vs 3D Flashcards Practice
  const [activeTab, setActiveTab] = useState<'feed' | 'flashcards'>('feed');

  // 3D Flashcard State
  const [caFlashcardIdx, setCaFlashcardIdx] = useState<number>(0);
  const [isCaCardFlipped, setIsCaCardFlipped] = useState<boolean>(false);
  const [caSlideDir, setCaSlideDir] = useState<number>(1);

  // Detail Reader 3D Flip State (Flip reader card between Full Article & High-Yield Key Points)
  const [isReaderFlipped, setIsReaderFlipped] = useState<boolean>(false);

  // Bookmarks state
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    fetchBookmarks('default_user_1', activeApp?.id).then((data) => {
      if (data) setBookmarks(data);
    });
  }, [activeApp?.id]);

  const handleToggleBookmarkItem = async (caItem: CurrentAffairsItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const { updatedBookmarks } = await toggleBookmarkCA({
      userId: 'default_user_1',
      appId: activeApp?.id || 'default',
      caItem,
      currentBookmarks: bookmarks
    });
    setBookmarks(updatedBookmarks);
  };

  // Motion and 3D Settings
  const [motionConfig, setMotionConfig] = useState<PracticeMotionConfig>(getSavedMotionConfig);
  const [isMotionModalOpen, setIsMotionModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleMotion = (e: any) => {
      if (e?.detail) setMotionConfig(e.detail);
      else setMotionConfig(getSavedMotionConfig());
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'aspirant_practice_motion_config') {
        setMotionConfig(getSavedMotionConfig());
      }
    };
    window.addEventListener('aspirant_practice_motion_changed' as any, handleMotion);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('aspirant_practice_motion_changed' as any, handleMotion);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const caOfflineKey = `offline_ca_download_${activeApp?.id}`;
  const [caDownloaded, setCaDownloaded] = useState<boolean>(() => {
    try {
      return localStorage.getItem(caOfflineKey) === 'true';
    } catch (e) {
      return false;
    }
  });

  const handleDownloadCaOffline = () => {
    try {
      localStorage.setItem(caOfflineKey, 'true');
      localStorage.setItem(`${caOfflineKey}_data`, JSON.stringify({ items: displayNews, savedAt: Date.now() }));
      setCaDownloaded(true);
      alert('📥 Current affairs articles successfully saved for offline reading!');
    } catch (e) {
      console.error(e);
      alert('Failed to save offline articles.');
    }
  };

  const handleClearCaOffline = () => {
    if (window.confirm('Are you sure you want to erase downloaded current affairs articles?')) {
      try {
        localStorage.removeItem(caOfflineKey);
        localStorage.removeItem(`${caOfflineKey}_data`);
        setCaDownloaded(false);
        alert('🗑️ Downloaded current affairs erased successfully.');
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleZoomIn = () => setFontSize(prev => Math.min(prev + 2, 32));
  const handleZoomOut = () => setFontSize(prev => Math.max(prev - 2, 14));

  const years = ['2026', '2025', '2024'];
  const months = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const safeCurrentAffairs = Array.isArray(currentAffairs) ? currentAffairs : [];
  const appNews = safeCurrentAffairs.filter(ca => 
    ca && (
      !ca.appIds ||
      ca.appIds.length === 0 ||
      ca.appIds.includes(activeApp?.id) || 
      ca.appIds.includes('all') || 
      ca.appIds.includes('all-india') || 
      ca.appIds.includes(`all-${activeApp?.countryId}`) ||
      ca.appIds.includes(activeApp?.countryId) ||
      (activeApp?.countryId === 'india' && ca.appIds?.includes('all-india'))
    )
  );

  const langMatchNews = appNews.filter(ca => ca.language === selectedLanguage || (!ca.language && selectedLanguage === 'en'));
  const displayNews = langMatchNews.length > 0 ? langMatchNews : appNews;

  const categories = ['All', 'State News', 'India & National', 'International', 'Education & Jobs'];

  const filteredNews = displayNews.filter(item => {
    if (selectedMonth !== 'All' && !item.month?.toLowerCase().includes(selectedMonth.toLowerCase())) {
      return false;
    }
    if (selectedYear && !item.publishedDate?.includes(selectedYear) && !item.month?.includes(selectedYear)) {
      return false;
    }
    if (selectedCategory !== 'All') {
      const cat = selectedCategory.toLowerCase();
      const itemCat = (item.category || '').toLowerCase();
      const itemTitle = (item.title || '').toLowerCase();
      const itemContent = (item.content || '').toLowerCase();
      
      if (cat.includes('state')) {
        const stateName = isTs ? 'telangana' : 'andhra';
        if (!itemCat.includes('state') && !itemTitle.includes(stateName) && !itemContent.includes(stateName) && !itemTitle.includes('tspsc') && !itemTitle.includes('appsc')) return false;
      } else if (cat.includes('india') || cat.includes('national')) {
        if (!itemCat.includes('india') && !itemCat.includes('national') && !itemTitle.includes('india') && !itemTitle.includes('central') && !itemTitle.includes('union') && !itemTitle.includes('delhi')) return false;
      } else if (cat.includes('international')) {
        if (!itemCat.includes('international') && !itemCat.includes('global') && !itemTitle.includes('world') && !itemTitle.includes('global') && !itemTitle.includes('un ') && !itemTitle.includes('international')) return false;
      } else if (cat.includes('education') || cat.includes('jobs')) {
        if (!itemCat.includes('education') && !itemCat.includes('job') && !itemCat.includes('notification') && !itemTitle.includes('exam') && !itemTitle.includes('recruitment') && !itemTitle.includes('job') && !itemTitle.includes('syllabus')) return false;
      }
    }
    return true;
  });

  // Clamp flashcard index when filteredNews changes
  const safeFlashcardIdx = Math.max(0, Math.min(caFlashcardIdx, Math.max(0, filteredNews.length - 1)));
  const currentFlashcard = filteredNews[safeFlashcardIdx] || filteredNews[0];

  // Reset card flipped when navigating
  const handleNextFlashcard = () => {
    if (safeFlashcardIdx < filteredNews.length - 1) {
      setCaSlideDir(1);
      setCaFlashcardIdx(safeFlashcardIdx + 1);
      setIsCaCardFlipped(false);
    }
  };

  const handlePrevFlashcard = () => {
    if (safeFlashcardIdx > 0) {
      setCaSlideDir(-1);
      setCaFlashcardIdx(safeFlashcardIdx - 1);
      setIsCaCardFlipped(false);
    }
  };

  const handleShuffleFlashcard = () => {
    if (filteredNews.length > 1) {
      let rand = Math.floor(Math.random() * filteredNews.length);
      if (rand === safeFlashcardIdx) {
        rand = (rand + 1) % filteredNews.length;
      }
      setCaSlideDir(1);
      setCaFlashcardIdx(rand);
      setIsCaCardFlipped(false);
    }
  };

  // Helper to extract key bullet points from article content for 3D flashcard reverse face
  const getExamPoints = (text: string) => {
    if (!text) return [];
    const lines = text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 15);
    if (lines.length > 0) {
      return lines.slice(0, 4);
    }
    return [
      'High-yield topic essential for General Studies & Current Affairs paper.',
      'Key focus: Background history, policy objectives, and socioeconomic impact.',
      'Direct relevance to State & National competitive examination syllabi.'
    ];
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Header & Navigation Banner (Vibrant Daylight Sapphire & Teal) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-700 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-sky-400/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-25 pointer-events-none">
          <img src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80" alt="News" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        </div>

        <div className="relative z-10 space-y-2">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold text-white border border-white/30 transition-colors cursor-pointer mb-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
          
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#FFF1CC] border border-amber-300 text-[#1E1B4B] text-[10px] font-black uppercase tracking-wider">
              📰 Premium Edition
            </span>
            <span className="text-xs text-sky-50 font-bold">Daily & Monthly Archive</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Current Affairs & Exam News Center
          </h1>
          <p className="text-xs sm:text-sm text-sky-50 max-w-2xl leading-relaxed">
            Curated daily updates, monthly compendiums, and high-yield study notes specifically designed for competitive exam aspirants.
          </p>
        </div>

        {/* View Mode & 3D Settings Buttons */}
        <div className="relative z-10 flex flex-wrap sm:flex-col items-start sm:items-end gap-2.5">
          <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-2xl border border-white/35 flex items-center gap-1">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'feed'
                  ? 'bg-[#FFF8E7] text-[#1E1B4B] shadow-md'
                  : 'text-white hover:bg-white/15'
              }`}
            >
              <span>📰 Articles Feed</span>
            </button>
          </div>

          <button
            onClick={() => setIsMotionModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-black text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            title="Motion & 3D Transition Settings"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>3D & Effects: {motionConfig.style === '3d-flip' ? '3D Flip' : motionConfig.style === 'hero-slide' ? 'Hero Slide' : motionConfig.style === 'fade-scale' ? 'Fade' : 'Minimal'}</span>
          </button>
        </div>
      </div>

      {/* Year & Month Filter Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* Years Selector */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider mr-1">Year:</span>
            {years.map(yr => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
            <span>Showing <span className="text-indigo-600 font-black">{filteredNews.length}</span> articles</span>
            {activeTab === 'flashcards' && (
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                Flashcard {safeFlashcardIdx + 1}/{filteredNews.length}
              </span>
            )}
          </div>
        </div>

        {/* Months Horizontal Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-2 border-t border-slate-100 scrollbar-thin">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider mr-2 shrink-0">Month:</span>
          {months.map(m => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedMonth === m
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Category Horizontal Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-2 border-t border-slate-100 scrollbar-thin">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider mr-2 shrink-0">Category:</span>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedCategory === c
                  ? 'bg-indigo-600 text-white font-extrabold shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
              }`}
            >
              {c === 'State News' ? '🏛️ Regional State News' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Offline Download Action Banner */}
      <div className="bg-white border border-slate-200 p-3 sm:p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl shrink-0 ${caDownloaded ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
            {caDownloaded ? <CheckCircle2 className="h-5 w-5" /> : <Download className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-xs sm:text-sm font-black text-slate-900">
              {caDownloaded ? 'Current Affairs Saved Offline' : 'Offline Reading Mode'}
            </p>
            <p className="text-[11px] text-slate-500">
              {caDownloaded ? 'Cached for offline access without internet.' : 'Download articles for uninterrupted reading.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          {caDownloaded && (
            <button
              onClick={handleClearCaOffline}
              className="flex-1 sm:flex-initial px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[40px] touch-manipulation"
              title="Erase Downloaded Articles"
            >
              <span>🗑️ Erase</span>
            </button>
          )}
          <button
            onClick={handleDownloadCaOffline}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[40px] touch-manipulation ${
              caDownloaded
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
            }`}
          >
            {caDownloaded ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
            <span>{caDownloaded ? 'Downloaded ✓' : 'Download Offline'}</span>
          </button>
        </div>
      </div>



      {/* ======================================================== */}
      {/* STANDARD ARTICLES GRID FEED VIEW MODE */}
      {/* ======================================================== */}
      {activeTab === 'feed' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNews.length > 0 ? (
            filteredNews.map((item, idx) => {
              const caImg = getCuratedCurrentAffairsImage(item, idx);
              const cardTheme = getBrightCardTheme(`${item.category || ''} ${item.title || ''}`, idx);

              return (
                <motion.div
                  key={item.id}
                  layoutId={`card-${item.id}`}
                  whileHover={{ y: -4, scale: 1.01 }}
                  onClick={() => {
                    setSelectedNews(item);
                    setIsReaderFlipped(false);
                  }}
                  className={`${cardTheme.cardBgClass} rounded-3xl overflow-hidden border-2 ${cardTheme.borderClass} shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer ${
                    motionConfig.enable3dDepth ? 'hover:shadow-[0_16px_36px_-10px_rgba(0,0,0,0.12)]' : ''
                  }`}
                >
                  {/* Bright Daylight Current Affairs Category Image Header */}
                  <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-sky-100">
                    <SmartCardImage
                      src={caImg}
                      alt={item.title}
                      fallbackLabel={item.category || 'Current Affairs'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/60 to-transparent pointer-events-none" />

                    <div className="absolute top-3 left-3.5 right-3.5 flex items-center justify-between gap-2 z-10">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${cardTheme.badgeBgClass}`}>
                        📅 {item.month || selectedYear} {item.category ? `• ${item.category}` : ''}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-2xs border flex items-center gap-1 ${cardTheme.mcqPillClass}`}>
                          <Clock className="h-3 w-3" /> {item.publishedDate || 'Today'}
                        </span>
                        <button
                          onClick={(e) => handleToggleBookmarkItem(item, e)}
                          title={isBookmarked(bookmarks, 'current_affairs', item.id) ? 'Remove Bookmark' : 'Save Article'}
                          className={`p-1.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
                            isBookmarked(bookmarks, 'current_affairs', item.id)
                              ? 'bg-amber-400 text-[#1E1B4B] border-amber-500'
                              : 'bg-white/95 hover:bg-white text-[#1E1B4B] border-slate-200'
                          }`}
                        >
                          {isBookmarked(bookmarks, 'current_affairs', item.id) ? (
                            <BookmarkCheck className="w-3.5 h-3.5 fill-[#1E1B4B]" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bright Luxury Card Body */}
                  <div className={`p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4 ${cardTheme.bodyBgClass} border-t border-white/80`}>
                    <div className="space-y-2.5">
                      <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${cardTheme.accentBarClass}`} />
                      <motion.h3 
                        layoutId={`title-${item.id}`}
                        className={`text-lg font-black ${cardTheme.titleColorClass} transition-colors leading-snug`}
                      >
                        <MathText text={item.title} />
                      </motion.h3>

                      <div className="text-xs text-slate-700 line-clamp-3 leading-relaxed font-medium">
                        <MathText text={item.content} />
                      </div>
                    </div>

                    <div className="pt-3.5 border-t border-[#1E1B4B]/10 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#1E1B4B]/80 flex items-center gap-1">
                        <span>🎯</span> Exam Oriented
                      </span>
                      <button
                        onClick={() => {
                          setSelectedNews(item);
                          setIsReaderFlipped(false);
                        }}
                        className={`px-4 py-2 bg-gradient-to-r ${cardTheme.ctaGradientClass} rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 shadow-sm hover:brightness-105`}
                      >
                        Read More <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <div className="text-4xl">📭</div>
              <h4 className="text-base font-black text-slate-900">No Current Affairs Found for {selectedMonth} {selectedYear}</h4>
              <p className="text-xs text-slate-500">Try selecting 'All' months or another year to browse archive articles.</p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* FULL SCREEN HERO ARTICLE READER MODAL (WITH 3D FLIP TO KEY POINTS) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div
            layoutId={`card-${selectedNews.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 overflow-y-auto overscroll-contain transition-colors duration-300 ${
              readerTheme === 'sepia' 
                ? 'bg-[#fbf0d9]' 
                : readerTheme === 'dark' 
                ? 'bg-[#121824]' 
                : 'bg-slate-950/80 backdrop-blur-md'
            }`}
          >
            <div className="flex flex-col min-h-screen">
              {/* Top Reader Navigation Bar */}
              <div className={`border-b px-6 py-4 flex items-center justify-between shadow-lg shrink-0 transition-all ${
                readingMode ? 'opacity-0 hover:opacity-100 pointer-events-none hover:pointer-events-auto bg-slate-900/90 text-white border-slate-800' : 'bg-slate-900 text-white border-slate-800'
              }`}>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setSelectedNews(null); setReadingMode(false); }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to News
                  </button>
                  <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                    📅 {selectedNews.month || selectedYear}
                  </span>
                </div>

                {/* Reader Controls */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <button
                    onClick={() => setReadingMode(!readingMode)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      readingMode 
                        ? 'bg-amber-500 text-slate-950 shadow-md animate-pulse' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                    title="Toggle Distraction-Free Reading Mode"
                  >
                    {readingMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    <span className="hidden sm:inline">{readingMode ? 'Zen Mode ON' : 'Zen Mode'}</span>
                  </button>

                  {/* Theme Selector */}
                  <div className="hidden md:flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                    <button
                      onClick={() => setReaderTheme('light')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${readerTheme === 'light' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'}`}
                    >
                      Light
                    </button>
                    <button
                      onClick={() => setReaderTheme('sepia')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${readerTheme === 'sepia' ? 'bg-[#f5e6cb] text-slate-900' : 'text-slate-400 hover:text-white'}`}
                    >
                      Sepia
                    </button>
                    <button
                      onClick={() => setReaderTheme('dark')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${readerTheme === 'dark' ? 'bg-slate-950 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      Dark
                    </button>
                  </div>

                  {/* Article Palette Button */}
                  <button
                    onClick={() => setIsArticlePaletteOpen(!isArticlePaletteOpen)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      isArticlePaletteOpen
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md ring-1 ring-indigo-400'
                        : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-slate-700'
                    }`}
                    title="Article Palette"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Palette</span>
                  </button>

                  {/* MCQ Font Size Controls */}
                  <McqFontControls variant="dark" showLabel={false} />

                  <button
                    onClick={() => { setSelectedNews(null); setReadingMode(false); setIsArticlePaletteOpen(false); }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Close Reader"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Article Palette Drawer */}
              {isArticlePaletteOpen && (
                <div className="bg-slate-900/95 border-b border-slate-800 p-4 animate-in slide-in-from-top-2 shadow-xl">
                  <div className="max-w-4xl mx-auto space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                        <Layers className="h-4 w-4" /> Articles Palette ({filteredNews.length})
                      </span>
                      <button
                        onClick={() => setIsArticlePaletteOpen(false)}
                        className="text-xs text-slate-400 hover:text-white cursor-pointer px-2 py-0.5 rounded-md hover:bg-slate-800"
                      >
                        ✕ Close
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                      {filteredNews.map((news, idx) => (
                        <button
                          key={news.id}
                          onClick={() => {
                            setSelectedNews(news);
                            setIsArticlePaletteOpen(false);
                            setIsReaderFlipped(false);
                          }}
                          className={`p-2.5 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                            selectedNews?.id === news.id
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md ring-2 ring-amber-300'
                              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700'
                          }`}
                        >
                          <span className="h-5 w-5 rounded-lg bg-black/30 flex items-center justify-center text-[10px] shrink-0 font-mono">
                            {idx + 1}
                          </span>
                          <span className="truncate flex-1">{news.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Scrollable Reader Article Body with Perspective & 3D Depth */}
              <div className={`p-4 sm:p-8 md:p-12 transition-colors flex-1 ${
                readerTheme === 'sepia' 
                  ? 'bg-[#fbf0d9] text-[#43302b]' 
                  : readerTheme === 'dark' 
                  ? 'bg-[#121824] text-slate-200' 
                  : 'bg-slate-100 text-slate-900'
              }`}>
                <div className="max-w-3xl mx-auto [perspective:1200px]">
                  <motion.div
                    layoutId={`card-${selectedNews.id}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    className={`rounded-3xl shadow-xl p-6 sm:p-10 md:p-14 space-y-8 transition-all ${
                      readerTheme === 'sepia' 
                        ? 'bg-[#f5e6cb] border border-[#e6d0ab]' 
                        : readerTheme === 'dark' 
                        ? 'bg-[#192235] border border-slate-800' 
                        : 'bg-white border border-slate-200'
                    } ${motionConfig.enable3dDepth ? 'shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)]' : ''}`}
                  >
                    {!readingMode && (
                      <div className="space-y-4 border-b border-slate-200/60 pb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-wide">
                              {selectedNews.month || 'Current Affairs'}
                            </span>
                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> {selectedNews.publishedDate || 'Published Recently'}
                            </span>
                          </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => selectedNews && handleToggleBookmarkItem(selectedNews, e)}
                                title={selectedNews && isBookmarked(bookmarks, 'current_affairs', selectedNews.id) ? 'Remove Bookmark' : 'Save Article'}
                                className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer ${
                                  selectedNews && isBookmarked(bookmarks, 'current_affairs', selectedNews.id)
                                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                }`}
                              >
                                {selectedNews && isBookmarked(bookmarks, 'current_affairs', selectedNews.id) ? (
                                  <>
                                    <BookmarkCheck className="w-3.5 h-3.5 fill-slate-950" />
                                    <span>Bookmarked</span>
                                  </>
                                ) : (
                                  <>
                                    <Bookmark className="w-3.5 h-3.5" />
                                    <span>Bookmark</span>
                                  </>
                                )}
                              </button>


                            </div>
                          </div>

                        <motion.h1 
                          layoutId={`title-${selectedNews.id}`}
                          className={`text-2xl sm:text-3xl md:text-4xl font-black leading-tight ${readerTheme === 'dark' ? 'text-white' : readerTheme === 'sepia' ? 'text-[#2c1d1a]' : 'text-slate-900'}`}
                        >
                          <MathText text={selectedNews.title} />
                        </motion.h1>
                      </div>
                    )}

                    {readingMode && (
                      <div className="flex items-center justify-between border-b border-slate-500/20 pb-4">
                        <span className="text-xs font-bold tracking-wider opacity-60 uppercase">Distraction-Free Reading Mode</span>
                        <button
                          onClick={() => setReadingMode(false)}
                          className="text-xs font-bold underline cursor-pointer text-indigo-500 hover:text-indigo-600"
                        >
                          Exit Zen Mode
                        </button>
                      </div>
                    )}

                      {/* Standard Article Text */}
                      <div 
                        className={`whitespace-pre-line leading-relaxed font-normal rounded-2xl p-4 sm:p-6 transition-all ${
                          readerTheme === 'sepia' 
                            ? 'bg-[#fbf0d9]/60 text-[#3b2722]' 
                            : readerTheme === 'dark' 
                            ? 'bg-[#121824]/60 text-slate-200' 
                            : 'bg-slate-50/70 text-slate-800'
                        }`}
                        style={{ ...scaledTextStyle, lineHeight: 1.85 }}
                      >
                        {readingMode && (
                          <h2 className={`text-xl sm:text-2xl font-bold mb-6 pb-4 border-b border-current/10 ${readerTheme === 'dark' ? 'text-white' : readerTheme === 'sepia' ? 'text-[#2c1d1a]' : 'text-slate-900'}`}>
                            <MathText text={selectedNews.title} />
                          </h2>
                        )}
                        <MathText text={selectedNews.content} />
                      </div>

                    <div className="pt-6 border-t border-slate-200/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs font-extrabold opacity-75">
                        <Award className="h-4 w-4 text-indigo-500" />
                        <span>Premium Exam Study Guide</span>
                      </div>
                      <button
                        onClick={() => { setSelectedNews(null); setReadingMode(false); }}
                        className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black shadow-md transition-all cursor-pointer"
                      >
                        Close Reader
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Motion & 3D Transition Settings Modal */}
      <PracticeMotionModal
        isOpen={isMotionModalOpen}
        onClose={() => setIsMotionModalOpen(false)}
        config={motionConfig}
        onChange={(cfg) => setMotionConfig(cfg)}
        title="Current Affairs Motion & 3D Settings"
        allowFlashcardModeToggle={true}
      />

    </div>
  );
}
