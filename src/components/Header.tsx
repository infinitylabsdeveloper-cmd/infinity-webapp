import React, { useState, useRef, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { AppConfig } from '../types';
import { 
  getSavedFontSettings, 
  FontSettings 
} from '../lib/fontSettings';
import { 
  GraduationCap, RefreshCw, ShieldCheck, Menu, X, Home, User, 
  CreditCard, BarChart2, Newspaper, Info, Trophy, Lock, HelpCircle, 
  MessageSquare, Shield, FileText, Type, Sliders, Mail, AlertTriangle, 
  Sun, Moon, Globe, BookmarkCheck, LogOut, Sparkles, ChevronRight, Compass, Crown, Copy, Check
} from 'lucide-react';

import { LanguageCode, LANGUAGES, TRANSLATIONS, getTranslation } from '../lib/i18n';
import AppNetworkSelectorModal from './AppNetworkSelectorModal';
import LanguageRegionModal from './LanguageRegionModal';
import { getStoredSupportConfig, SupportConfig, WhatsAppBrandIcon, TelegramBrandIcon } from './SupportCenterModal';

interface HeaderProps {
  apps: AppConfig[];
  activeApp: AppConfig;
  setActiveAppId: (id: string) => void;
  onRefresh: () => void;
  isSaving: boolean;
  onOpenAdmin: () => void;
  isAdminLoggedIn?: boolean;
  onOpenLegal?: (type: 'privacy' | 'terms') => void;
  onOpenSubscriptions?: () => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
  currentView: 'home' | 'profile' | 'performance' | 'leaderboard' | 'syllabus' | 'current-affairs' | 'mock-tests' | 'bookmarks';
  onSelectView: (view: 'home' | 'profile' | 'performance' | 'leaderboard' | 'syllabus' | 'current-affairs' | 'mock-tests' | 'bookmarks') => void;
  selectedLanguage: LanguageCode;
  onLanguageChange: (code: LanguageCode) => void;
  onOpenSupport?: () => void;
}

function Header({
  apps,
  activeApp,
  setActiveAppId,
  onRefresh,
  isSaving,
  isAdminLoggedIn,
  onOpenAdmin,
  onOpenLegal,
  onOpenSubscriptions,
  onOpenSettings,
  onLogout,
  currentView,
  onSelectView,
  selectedLanguage,
  onLanguageChange,
  onOpenSupport,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isAppNetworkModalOpen, setIsAppNetworkModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [activeModalSection, setActiveModalSection] = useState<string | null>(null);
  const [supportConfig, setSupportConfig] = useState<SupportConfig>(getStoredSupportConfig);
  const [issueFeedbackText, setIssueFeedbackText] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSupportUpdate = () => setSupportConfig(getStoredSupportConfig());
    window.addEventListener('support_config_updated', handleSupportUpdate);
    return () => window.removeEventListener('support_config_updated', handleSupportUpdate);
  }, []);

  const t = getTranslation(selectedLanguage);
  const currentLangObj = LANGUAGES.find(l => l.code === selectedLanguage);

  // Font and Language Settings State
  const [fontSettings, setFontSettings] = useState<FontSettings>(getSavedFontSettings);

  useEffect(() => {
    const handleSettingsChange = (e: any) => {
      if (e?.detail) {
        setFontSettings(e.detail);
      } else {
        setFontSettings(getSavedFontSettings());
      }
    };

    window.addEventListener('aspirant_font_settings_changed' as any, handleSettingsChange);
    window.addEventListener('storage', handleSettingsChange);
    return () => {
      window.removeEventListener('aspirant_font_settings_changed' as any, handleSettingsChange);
      window.removeEventListener('storage', handleSettingsChange);
    };
  }, []);


  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return { text: selectedLanguage === 'en' ? "Good morning!" : "नमस्ते / ਸ਼ੁਭ ਸਵੇਰ", icon: "☀️" };
    } else if (hour < 17) {
      return { text: selectedLanguage === 'en' ? "Good afternoon!" : "नमस्ते / ਸ਼ੁਭ ਦੁਪਹਿਰ", icon: "🌤️" };
    } else {
      return { text: selectedLanguage === 'en' ? "Good evening!" : "नमस्ते / ਸ਼ੁਭ ਸ਼ਾਮ", icon: "🌙" };
    }
  };
  const greeting = getGreeting();

  // Close menu on Escape key and handle body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-[1720px] 2xl:max-w-[1920px] h-16 sm:h-20 items-center justify-between px-3 sm:px-6 lg:px-10 xl:px-12">
          
          {/* Left Side: 3 Lines Hamburger Menu & App Branding */}
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 transition-all flex items-center justify-center shadow-2xs cursor-pointer touch-manipulation"
                title="Toggle Menu"
                aria-label="Toggle navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Left Slide-in Navigation Drawer rendered via Portal with Instant Hardware-Accelerated Animation */}
              {typeof document !== 'undefined' && createPortal(
                <div 
                  className={`fixed inset-0 z-[9999] transition-all duration-200 ${
                    isMenuOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
                  }`}
                  aria-hidden={!isMenuOpen}
                >
                  {/* Dark Overlay Backdrop */}
                  <div
                    onClick={() => setIsMenuOpen(false)}
                    className={`fixed inset-0 bg-slate-950/60 transition-opacity duration-200 ease-out ${
                      isMenuOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  {/* Left Slide-in Drawer Container */}
                  <aside
                    className={`fixed top-0 left-0 bottom-0 z-[10000] w-[88vw] max-w-[340px] bg-white border-r border-slate-200/90 shadow-2xl flex flex-col h-full overflow-hidden text-slate-800 transform transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
                      isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                  >
                        {/* Drawer Header Banner */}
                        <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0 shadow-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div 
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm text-white shadow-md border border-white/20 shrink-0"
                              style={{ backgroundColor: activeApp.accentColor || '#4f46e5' }}
                            >
                              {activeApp.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-indigo-300 block truncate">Exam Prep Portal</span>
                              <h2 className="text-xs sm:text-sm font-black text-white truncate leading-tight">{activeApp.name}</h2>
                            </div>
                          </div>

                          <button
                            onClick={() => setIsMenuOpen(false)}
                            className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 hover:text-white transition-all cursor-pointer shrink-0"
                            aria-label="Close navigation drawer"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Navigation Items List - Compact Mobile Size, Zero Lag */}
                        <div className="flex-1 overflow-y-auto overscroll-contain py-2 px-2 sm:px-3 space-y-3 sm:space-y-5 custom-scrollbar">
                          {/* SECTION 1: CORE NAVIGATION */}
                          <div>
                            <div className="px-1.5 pb-1 text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <Compass className="w-3.5 h-3.5 text-indigo-500" />
                                Core Learning Arena
                              </span>
                              <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md font-extrabold">5 Units</span>
                            </div>

                            <div className="space-y-1.5 sm:space-y-3 mt-1">
                              {/* Home Card */}
                              <button
                                onClick={() => { setIsMenuOpen(false); onSelectView('home'); }}
                                className={`w-full h-[40px] sm:h-[60px] px-2 sm:px-3 rounded-lg sm:rounded-xl border text-left hover:translate-x-0.5 active:scale-[0.98] transition-all duration-100 cursor-pointer group flex items-center justify-between shadow-xs ${
                                  currentView === 'home'
                                    ? 'bg-gradient-to-r from-purple-500/10 via-purple-50/60 to-white border-purple-400/80 ring-1 ring-purple-500/30'
                                    : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/80 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                  <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                    currentView === 'home' ? 'bg-purple-600 text-white shadow-xs shadow-purple-200' : 'bg-purple-100/70 text-purple-700 group-hover:bg-purple-600 group-hover:text-white'
                                  }`}>
                                    <Home className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h3 className={`text-xs sm:text-[15px] font-black truncate leading-tight ${currentView === 'home' ? 'text-purple-950' : 'text-slate-800'}`}>
                                      {t.home}
                                    </h3>
                                    <p className="text-[10px] sm:text-[12px] font-medium text-slate-500 truncate leading-tight">Main dashboard & practice arena</p>
                                  </div>
                                </div>
                                <ChevronRight className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform ${currentView === 'home' ? 'text-purple-600 translate-x-0.5' : 'text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5'}`} />
                              </button>

                              {/* Profile Card */}
                              <button
                                onClick={() => { setIsMenuOpen(false); onSelectView('profile'); }}
                                className={`w-full h-[40px] sm:h-[60px] px-2 sm:px-3 rounded-lg sm:rounded-xl border text-left hover:translate-x-0.5 active:scale-[0.98] transition-all duration-100 cursor-pointer group flex items-center justify-between shadow-xs ${
                                  currentView === 'profile'
                                    ? 'bg-gradient-to-r from-purple-500/10 via-purple-50/60 to-white border-purple-400/80 ring-1 ring-purple-500/30'
                                    : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/80 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                  <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                    currentView === 'profile' ? 'bg-purple-600 text-white shadow-xs shadow-purple-200' : 'bg-blue-100/70 text-blue-700 group-hover:bg-purple-600 group-hover:text-white'
                                  }`}>
                                    <User className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h3 className={`text-xs sm:text-[15px] font-black truncate leading-tight ${currentView === 'profile' ? 'text-purple-950' : 'text-slate-800'}`}>
                                      {t.profile}
                                    </h3>
                                    <p className="text-[10px] sm:text-[12px] font-medium text-slate-500 truncate leading-tight">Account, exam & goal setup</p>
                                  </div>
                                </div>
                                <ChevronRight className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform ${currentView === 'profile' ? 'text-purple-600 translate-x-0.5' : 'text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5'}`} />
                              </button>

                              {/* Mock Test Center Card */}
                              <button
                                onClick={() => { setIsMenuOpen(false); onSelectView('mock-tests'); }}
                                className={`w-full h-[40px] sm:h-[60px] px-2 sm:px-3 rounded-lg sm:rounded-xl border text-left hover:translate-x-0.5 active:scale-[0.98] transition-all duration-100 cursor-pointer group flex items-center justify-between shadow-xs ${
                                  currentView === 'mock-tests'
                                    ? 'bg-gradient-to-r from-purple-500/10 via-purple-50/60 to-white border-purple-400/80 ring-1 ring-purple-500/30'
                                    : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/80 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                  <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                    currentView === 'mock-tests' ? 'bg-purple-600 text-white shadow-xs shadow-purple-200' : 'bg-purple-100/70 text-purple-700 group-hover:bg-purple-600 group-hover:text-white'
                                  }`}>
                                    <Trophy className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <h3 className={`text-xs sm:text-[15px] font-black truncate leading-tight ${currentView === 'mock-tests' ? 'text-purple-950' : 'text-slate-800'}`}>
                                        Mock Test Center
                                      </h3>
                                      <span className="text-[8px] sm:text-[9px] bg-purple-100 text-purple-800 px-1 py-0.2 rounded font-black shrink-0">HOT</span>
                                    </div>
                                    <p className="text-[10px] sm:text-[12px] font-medium text-slate-500 truncate leading-tight">Timed full-length exam simulator</p>
                                  </div>
                                </div>
                                <ChevronRight className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform ${currentView === 'mock-tests' ? 'text-purple-600 translate-x-0.5' : 'text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5'}`} />
                              </button>

                              {/* My Saved Bookmarks Card */}
                              <button
                                onClick={() => { setIsMenuOpen(false); onSelectView('bookmarks'); }}
                                className={`w-full h-[40px] sm:h-[60px] px-2 sm:px-3 rounded-lg sm:rounded-xl border text-left hover:translate-x-0.5 active:scale-[0.98] transition-all duration-100 cursor-pointer group flex items-center justify-between shadow-xs ${
                                  currentView === 'bookmarks'
                                    ? 'bg-gradient-to-r from-purple-500/10 via-purple-50/60 to-white border-purple-400/80 ring-1 ring-purple-500/30'
                                    : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/80 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                  <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                    currentView === 'bookmarks' ? 'bg-purple-600 text-white shadow-xs shadow-purple-200' : 'bg-amber-100/70 text-amber-700 group-hover:bg-purple-600 group-hover:text-white'
                                  }`}>
                                    <BookmarkCheck className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h3 className={`text-xs sm:text-[15px] font-black truncate leading-tight ${currentView === 'bookmarks' ? 'text-purple-950' : 'text-slate-800'}`}>
                                      My Saved Bookmarks
                                    </h3>
                                    <p className="text-[10px] sm:text-[12px] font-medium text-slate-500 truncate leading-tight">Saved questions & custom revision</p>
                                  </div>
                                </div>
                                <ChevronRight className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform ${currentView === 'bookmarks' ? 'text-purple-600 translate-x-0.5' : 'text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5'}`} />
                              </button>

                              {/* Current Affairs Card */}
                              <button
                                onClick={() => { setIsMenuOpen(false); onSelectView('current-affairs'); }}
                                className={`w-full h-[40px] sm:h-[60px] px-2 sm:px-3 rounded-lg sm:rounded-xl border text-left hover:translate-x-0.5 active:scale-[0.98] transition-all duration-100 cursor-pointer group flex items-center justify-between shadow-xs ${
                                  currentView === 'current-affairs'
                                    ? 'bg-gradient-to-r from-purple-500/10 via-purple-50/60 to-white border-purple-400/80 ring-1 ring-purple-500/30'
                                    : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/80 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                  <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                    currentView === 'current-affairs' ? 'bg-purple-600 text-white shadow-xs shadow-purple-200' : 'bg-rose-100/70 text-rose-700 group-hover:bg-purple-600 group-hover:text-white'
                                  }`}>
                                    <Newspaper className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <h3 className={`text-xs sm:text-[15px] font-black truncate leading-tight ${currentView === 'current-affairs' ? 'text-purple-950' : 'text-slate-800'}`}>
                                        {t.currentAffairs}
                                      </h3>
                                      <span className="text-[8px] sm:text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-black shrink-0">LIVE</span>
                                    </div>
                                    <p className="text-[10px] sm:text-[12px] font-medium text-slate-500 truncate leading-tight">Daily news, capsules & exam updates</p>
                                  </div>
                                </div>
                                <ChevronRight className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform ${currentView === 'current-affairs' ? 'text-purple-600 translate-x-0.5' : 'text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5'}`} />
                              </button>
                            </div>
                          </div>

                          {/* SECTION 2: ANALYTICS & PORTAL */}
                          <div className="pt-2 border-t border-slate-100">
                            <div className="px-1.5 pb-1 text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                Analytics & Subscriptions
                              </span>
                            </div>

                            <div className="space-y-1.5 sm:space-y-3 mt-1">
                              {/* Performance Analytics Card */}
                              <button
                                onClick={() => { setIsMenuOpen(false); onSelectView('performance'); }}
                                className={`w-full h-[40px] sm:h-[60px] px-2 sm:px-3 rounded-lg sm:rounded-xl border text-left hover:translate-x-0.5 active:scale-[0.98] transition-all duration-100 cursor-pointer group flex items-center justify-between shadow-xs ${
                                  currentView === 'performance'
                                    ? 'bg-gradient-to-r from-purple-500/10 via-purple-50/60 to-white border-purple-400/80 ring-1 ring-purple-500/30'
                                    : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/80 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                  <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                    currentView === 'performance' ? 'bg-purple-600 text-white shadow-xs shadow-purple-200' : 'bg-cyan-100/70 text-cyan-700 group-hover:bg-purple-600 group-hover:text-white'
                                  }`}>
                                    <BarChart2 className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h3 className={`text-xs sm:text-[15px] font-black truncate leading-tight ${currentView === 'performance' ? 'text-purple-950' : 'text-slate-800'}`}>
                                      {t.performance}
                                    </h3>
                                    <p className="text-[10px] sm:text-[12px] font-medium text-slate-500 truncate leading-tight">Accuracy breakdown & test statistics</p>
                                  </div>
                                </div>
                                <ChevronRight className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform ${currentView === 'performance' ? 'text-purple-600 translate-x-0.5' : 'text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5'}`} />
                              </button>

                              {/* Leaderboard Card */}
                              <button
                                onClick={() => { setIsMenuOpen(false); onSelectView('leaderboard'); }}
                                className={`w-full h-[40px] sm:h-[60px] px-2 sm:px-3 rounded-lg sm:rounded-xl border text-left hover:translate-x-0.5 active:scale-[0.98] transition-all duration-100 cursor-pointer group flex items-center justify-between shadow-xs ${
                                  currentView === 'leaderboard'
                                    ? 'bg-gradient-to-r from-purple-500/10 via-purple-50/60 to-white border-purple-400/80 ring-1 ring-purple-500/30'
                                    : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/80 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                  <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                    currentView === 'leaderboard' ? 'bg-purple-600 text-white shadow-xs shadow-purple-200' : 'bg-amber-100/70 text-amber-700 group-hover:bg-purple-600 group-hover:text-white'
                                  }`}>
                                    <Trophy className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h3 className={`text-xs sm:text-[15px] font-black truncate leading-tight ${currentView === 'leaderboard' ? 'text-purple-950' : 'text-slate-800'}`}>
                                      {t.leaderboard}
                                    </h3>
                                    <p className="text-[10px] sm:text-[12px] font-medium text-slate-500 truncate leading-tight">Aspirant rank comparison</p>
                                  </div>
                                </div>
                                <ChevronRight className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform ${currentView === 'leaderboard' ? 'text-purple-600 translate-x-0.5' : 'text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5'}`} />
                              </button>

                              {/* Subscriptions Card */}
                              <button
                                onClick={() => { setIsMenuOpen(false); onOpenSubscriptions?.(); }}
                                className="w-full h-[40px] sm:h-[60px] px-2 sm:px-3 rounded-lg sm:rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/80 hover:border-slate-300 text-left hover:translate-x-0.5 active:scale-[0.98] transition-all duration-100 cursor-pointer group flex items-center justify-between shadow-xs"
                              >
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-xl bg-emerald-100/70 text-emerald-700 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                                    <CreditCard className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h3 className="text-xs sm:text-[15px] font-black text-slate-800 truncate leading-tight">
                                      {t.subscriptions}
                                    </h3>
                                    <p className="text-[10px] sm:text-[12px] font-medium text-slate-500 truncate leading-tight">Unlock premium test passes</p>
                                  </div>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                              </button>

                              {/* Admin Dashboard Card */}
                              <button
                                onClick={() => { setIsMenuOpen(false); onOpenAdmin(); }}
                                className={`w-full h-[40px] sm:h-[60px] px-2 sm:px-3 rounded-lg sm:rounded-xl border text-left hover:translate-x-0.5 active:scale-[0.98] transition-all duration-100 cursor-pointer group flex items-center justify-between shadow-xs ${
                                  isAdminLoggedIn
                                    ? 'bg-gradient-to-r from-purple-500/10 via-purple-50/60 to-white border-purple-400/80 ring-1 ring-purple-500/30'
                                    : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/80 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                  <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                    isAdminLoggedIn ? 'bg-purple-600 text-white shadow-xs shadow-purple-200' : 'bg-violet-100/70 text-violet-700 group-hover:bg-purple-600 group-hover:text-white'
                                  }`}>
                                    <ShieldCheck className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h3 className={`text-xs sm:text-[15px] font-black truncate leading-tight ${isAdminLoggedIn ? 'text-purple-950' : 'text-slate-800'}`}>
                                      {t.adminDashboard}
                                    </h3>
                                    <p className="text-[10px] sm:text-[12px] font-medium text-slate-500 truncate leading-tight">Question Bank & Admin Controls</p>
                                  </div>
                                </div>
                                {isAdminLoggedIn ? (
                                  <span className="text-[8px] sm:text-[10px] bg-emerald-100 text-emerald-800 px-1.5 sm:px-2 py-0.5 rounded-full font-black shrink-0">
                                    Unlocked
                                  </span>
                                ) : (
                                  <span className="text-[8px] sm:text-[10px] bg-amber-100 text-amber-800 px-1.5 sm:px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0">
                                    <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Pin
                                  </span>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* SECTION 3: PREFERENCES & PERSONALIZATION */}
                          <div className="pt-2 border-t border-slate-100">
                            <div className="px-1.5 pb-1 text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <Sliders className="w-3.5 h-3.5 text-orange-500" />
                                {t.preferences || 'Preferences & Personalization'}
                              </span>
                            </div>

                            <div className="space-y-1.5 sm:space-y-3 mt-1">
                              {/* Premium Support Center */}
                              <button
                                onClick={() => { setIsMenuOpen(false); onOpenSupport?.(); }}
                                className="w-full h-[40px] sm:h-[60px] px-2 sm:px-3 rounded-lg sm:rounded-xl border border-[#E5CFA3] bg-gradient-to-r from-[#FFFDF9] via-[#FAF3E3] to-[#F4E6C8] hover:border-[#C59B27] text-left hover:translate-x-0.5 active:scale-[0.98] transition-all duration-100 cursor-pointer group flex items-center justify-between shadow-2xs"
                              >
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-xl bg-gradient-to-br from-[#B8860B] to-[#9A6B13] text-white flex items-center justify-center shrink-0 shadow-xs">
                                    <HelpCircle className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h3 className="text-xs sm:text-[15px] font-black text-[#2C2013] truncate leading-tight">
                                      Help & Support Center
                                    </h3>
                                    <p className="text-[10px] sm:text-[12px] font-medium text-[#7A5A1E] truncate leading-tight">WhatsApp, Email & Telegram Concierge</p>
                                  </div>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#9A6B13] group-hover:translate-x-0.5 transition-transform" />
                              </button>

                              {/* 1. Language & Region (22 Official Indian Languages) */}
                              <button
                                onClick={() => { setIsMenuOpen(false); setIsLanguageModalOpen(true); }}
                                className="w-full h-[40px] sm:h-[60px] px-2 sm:px-3 rounded-lg sm:rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/80 hover:border-slate-300 text-left hover:translate-x-0.5 active:scale-[0.98] transition-all duration-100 cursor-pointer group flex items-center justify-between shadow-xs"
                              >
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-xl bg-indigo-100/70 text-indigo-700 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                                    <Globe className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h3 className="text-xs sm:text-[15px] font-black text-slate-800 truncate leading-tight">
                                      {t.languageAndRegion || 'Language & Region'}
                                    </h3>
                                    <p className="text-[10px] sm:text-[12px] font-medium text-slate-500 truncate leading-tight">
                                      {currentLangObj ? `${currentLangObj.nativeLabel} (${currentLangObj.label})` : '22 Official Indian Languages'}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-[8px] sm:text-[10px] bg-indigo-50 border border-indigo-200/80 text-indigo-700 px-1.5 sm:px-2 py-0.5 rounded-full font-black shrink-0 flex items-center gap-1">
                                  <span>{currentLangObj?.flag || '🇮🇳'}</span>
                                  <span className="uppercase">{selectedLanguage}</span>
                                </span>
                              </button>

                              {/* 2. Display & Typography */}
                              <button
                                onClick={() => { setIsMenuOpen(false); onOpenSettings?.(); }}
                                className="w-full h-[40px] sm:h-[60px] px-2 sm:px-3 rounded-lg sm:rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/80 hover:border-slate-300 text-left hover:translate-x-0.5 active:scale-[0.98] transition-all duration-100 cursor-pointer group flex items-center justify-between shadow-xs"
                              >
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-xl bg-orange-100/70 text-orange-700 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                                    <Type className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h3 className="text-xs sm:text-[15px] font-black text-slate-800 truncate leading-tight">
                                      {t.displayTypography || 'Display & Typography'}
                                    </h3>
                                    <p className="text-[10px] sm:text-[12px] font-medium text-slate-500 truncate leading-tight">
                                      {t.displayTypographyDesc || 'Font size, line height & reading theme'}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-[8px] sm:text-[10px] bg-orange-100 text-orange-800 px-1.5 sm:px-2 py-0.5 rounded-full font-bold shrink-0">
                                  Aa Font
                                </span>
                              </button>

                              {/* FAQ & Help */}
                              <button
                                onClick={() => { setIsMenuOpen(false); setActiveModalSection('faq'); setIsAboutModalOpen(true); }}
                                className="w-full h-[40px] sm:h-[60px] px-2 sm:px-3 rounded-lg sm:rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/80 hover:border-slate-300 text-left hover:translate-x-0.5 active:scale-[0.98] transition-all duration-100 cursor-pointer group flex items-center justify-between shadow-xs"
                              >
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-xl bg-indigo-100/70 text-indigo-700 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                                    <HelpCircle className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h3 className="text-xs sm:text-[15px] font-black text-slate-800 truncate leading-tight">FAQ & Help Center</h3>
                                    <p className="text-[10px] sm:text-[12px] font-medium text-slate-500 truncate leading-tight">Common questions & app usage guides</p>
                                  </div>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                              </button>

                              {/* Contact Support */}
                              <button
                                onClick={() => { setIsMenuOpen(false); setActiveModalSection('contact'); setIsAboutModalOpen(true); }}
                                className="w-full h-[40px] sm:h-[60px] px-2 sm:px-3 rounded-lg sm:rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/80 hover:border-slate-300 text-left hover:translate-x-0.5 active:scale-[0.98] transition-all duration-100 cursor-pointer group flex items-center justify-between shadow-xs"
                              >
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-xl bg-emerald-100/70 text-emerald-700 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                                    <Mail className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h3 className="text-xs sm:text-[15px] font-black text-slate-800 truncate leading-tight">Contact Support</h3>
                                    <p className="text-[10px] sm:text-[12px] font-medium text-slate-500 truncate leading-tight">Email our exam support team</p>
                                  </div>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                              </button>

                              {/* Report an Issue */}
                              <button
                                onClick={() => { setIsMenuOpen(false); setActiveModalSection('report'); setIsAboutModalOpen(true); }}
                                className="w-full h-[40px] sm:h-[60px] px-2 sm:px-3 rounded-lg sm:rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/80 hover:border-slate-300 text-left hover:translate-x-0.5 active:scale-[0.98] transition-all duration-100 cursor-pointer group flex items-center justify-between shadow-xs"
                              >
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-xl bg-rose-100/70 text-rose-700 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                                    <AlertTriangle className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h3 className="text-xs sm:text-[15px] font-black text-slate-800 truncate leading-tight">Report an Issue</h3>
                                    <p className="text-[10px] sm:text-[12px] font-medium text-slate-500 truncate leading-tight">Flag wrong answers or technical bugs</p>
                                  </div>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                              </button>

                              {/* Send Feedback */}
                              <button
                                onClick={() => { setIsMenuOpen(false); setActiveModalSection('feedback'); setIsAboutModalOpen(true); }}
                                className="w-full h-[40px] sm:h-[60px] px-2 sm:px-3 rounded-lg sm:rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/80 hover:border-slate-300 text-left hover:translate-x-0.5 active:scale-[0.98] transition-all duration-100 cursor-pointer group flex items-center justify-between shadow-xs"
                              >
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-xl bg-blue-100/70 text-blue-700 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                                    <MessageSquare className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h3 className="text-xs sm:text-[15px] font-black text-slate-800 truncate leading-tight">Send Feedback</h3>
                                    <p className="text-[10px] sm:text-[12px] font-medium text-slate-500 truncate leading-tight">Suggest new feature improvements</p>
                                  </div>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                              </button>

                              {/* Privacy Policy */}
                              <button
                                onClick={() => { setIsMenuOpen(false); onOpenLegal?.('privacy'); }}
                                className="w-full h-[40px] sm:h-[60px] px-2 sm:px-3 rounded-lg sm:rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/80 hover:border-slate-300 text-left hover:translate-x-0.5 active:scale-[0.98] transition-all duration-100 cursor-pointer group flex items-center justify-between shadow-xs"
                              >
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-xl bg-slate-200/80 text-slate-700 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                                    <Shield className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h3 className="text-xs sm:text-[15px] font-black text-slate-800 truncate leading-tight">Privacy Policy</h3>
                                    <p className="text-[10px] sm:text-[12px] font-medium text-slate-500 truncate leading-tight">Data protection & user privacy terms</p>
                                  </div>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                              </button>

                              {/* Terms & Conditions */}
                              <button
                                onClick={() => { setIsMenuOpen(false); onOpenLegal?.('terms'); }}
                                className="w-full h-[40px] sm:h-[60px] px-2 sm:px-3 rounded-lg sm:rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/80 hover:border-slate-300 text-left hover:translate-x-0.5 active:scale-[0.98] transition-all duration-100 cursor-pointer group flex items-center justify-between shadow-xs"
                              >
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-xl bg-slate-200/80 text-slate-700 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                                    <FileText className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h3 className="text-xs sm:text-[15px] font-black text-slate-800 truncate leading-tight">Terms & Conditions</h3>
                                    <p className="text-[10px] sm:text-[12px] font-medium text-slate-500 truncate leading-tight">Terms of service agreement</p>
                                  </div>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                              </button>

                              {/* About App */}
                              <button
                                onClick={() => { setIsMenuOpen(false); setActiveModalSection('about'); setIsAboutModalOpen(true); }}
                                className="w-full h-[40px] sm:h-[60px] px-2 sm:px-3 rounded-lg sm:rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/80 hover:border-slate-300 text-left hover:translate-x-0.5 active:scale-[0.98] transition-all duration-100 cursor-pointer group flex items-center justify-between shadow-xs"
                              >
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-md sm:rounded-xl bg-blue-100/70 text-blue-700 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                                    <Info className="w-4 h-4 sm:w-5.5 sm:h-5.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h3 className="text-xs sm:text-[15px] font-black text-slate-800 truncate leading-tight">About the App</h3>
                                    <p className="text-[10px] sm:text-[12px] font-medium text-slate-500 truncate leading-tight">Platform version, details & credits</p>
                                  </div>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Drawer Footer Banner */}
                        <div className="p-3 bg-slate-50 border-t border-slate-100 shrink-0 space-y-2">
                          {onLogout && (
                            <button
                              onClick={() => { setIsMenuOpen(false); onLogout(); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                              <span>Log Out / Switch Account</span>
                            </button>
                          )}
                          <div className="text-center py-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">App Version: 2.4.0-Stable</p>
                          </div>
                        </div>
                      </aside>
                    </div>,
                document.body
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div 
                className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl text-white shadow-md transition-all duration-300 font-black text-xs sm:text-sm shrink-0"
                style={{ backgroundColor: activeApp.accentColor }}
              >
                {activeApp.id.includes('tspsc') ? 'TS' : activeApp.id.includes('andhra-pradesh') || activeApp.id === 'india-psc' ? 'AP' : activeApp.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h1 
                    className="text-sm sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5 truncate max-w-[140px] xs:max-w-[200px] sm:max-w-none"
                    title={activeApp.name}
                  >
                    <span className="truncate">{activeApp.name}</span>
                  </h1>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-700 border border-amber-500/30 shrink-0">
                    {activeApp.name.includes('TM') ? 'TM' : activeApp.name.includes('HM') ? 'HM' : activeApp.name.includes('UM') ? 'UM' : 'EM'}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-amber-600 font-bold flex items-center gap-1 truncate">
                  <span>{greeting.icon}</span> <span className="truncate">{greeting.text}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links (Responsive Desktop Nav Bar) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 mx-4">
            <button
              type="button"
              onClick={() => onSelectView('home')}
              className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'home'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{t.home || 'Home'}</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectView('syllabus')}
              className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'syllabus'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Syllabus & Practice</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectView('mock-tests')}
              className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'mock-tests'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Mock Tests</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectView('current-affairs')}
              className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'current-affairs'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Newspaper className="w-4 h-4" />
              <span>Current Affairs</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectView('bookmarks')}
              className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'bookmarks'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>Bookmarks</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectView('profile')}
              className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                currentView === 'profile'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{t.profile || 'Profile'}</span>
            </button>
          </nav>

          {/* Top Actions: Orange Security Button & Data Sync */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Admin Panel Trigger (if logged in) */}
            {isAdminLoggedIn && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 px-3 py-2 bg-stone-900 text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <ShieldCheck className="h-4 w-4 text-amber-400" />
                <span className="hidden sm:inline">ADMIN</span>
              </button>
            )}

            {/* Luxurious VIP / Premium Subscription Crown Button */}
            <button
              onClick={onOpenSubscriptions}
              className="relative group flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-700 via-amber-500 to-yellow-300 hover:from-amber-600 hover:to-yellow-200 text-slate-950 shadow-md shadow-amber-500/30 border border-amber-200/80 transition-all duration-200 cursor-pointer active:scale-95 touch-manipulation overflow-hidden"
              title="VIP Pro Pass & Subscriptions"
              aria-label="VIP Pro Pass and Subscriptions"
            >
              {/* Shimmer / Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <div className="relative flex items-center justify-center">
                <Crown className="h-5 w-5 fill-slate-950 text-slate-950 drop-shadow-sm group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-200 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-300"></span>
                </span>
              </div>
            </button>

            {/* Refresh Button */}
            <button
              id="sync-db-btn"
              onClick={onRefresh}
              disabled={isSaving}
              className="flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200/80 transition-all duration-200 shadow-2xs cursor-pointer active:scale-95 touch-manipulation"
              title="Reload database state from server"
              aria-label="Sync data from server"
            >
              <RefreshCw className={`h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* App Information & Support Modal (Luxurious Ivory & Champagne Gold Redesign) */}
      {isAboutModalOpen && (() => {
        const cleanCountry = (supportConfig.whatsappCountryCode || '91').replace(/\D/g, '') || '91';
        const cleanPhone = (supportConfig.whatsappPhoneNumber || '9493512768').replace(/\D/g, '');
        const waFull = `${cleanCountry}${cleanPhone}`;
        const formattedWa = `+${cleanCountry} ${cleanPhone}`;
        const cleanTg = (supportConfig.telegramUsername || 'DHANARAJU0').replace(/^@/, '').trim();
        const subjectLabel =
          activeModalSection === 'report'
            ? `Issue Report — ${activeApp.name}`
            : activeModalSection === 'feedback'
            ? `App Feedback — ${activeApp.name}`
            : `Support Inquiry — ${activeApp.name}`;
        const bodyText = issueFeedbackText.trim() || `Hello Support Team, I need assistance regarding ${activeApp.name}.`;
        const waHref = `https://wa.me/${waFull}?text=${encodeURIComponent(`${subjectLabel}\n\n${bodyText}`)}`;
        const mailHref = `mailto:${supportConfig.supportEmail}?subject=${encodeURIComponent(subjectLabel)}&body=${encodeURIComponent(bodyText)}`;
        const tgHref = `https://t.me/${cleanTg}`;

        const copyValue = (val: string, key: string) => {
          navigator.clipboard.writeText(val);
          setCopiedField(key);
          setTimeout(() => setCopiedField(null), 2000);
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A2118]/35 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200">
            <div className="bg-[#FFFDF9] rounded-[2rem] max-w-2xl w-full shadow-[0_25px_70px_-15px_rgba(140,105,45,0.22)] border border-[#E6D4B5] flex flex-col max-h-[90vh] overflow-hidden">
              {/* Warm Champagne & Ivory Header */}
              <div className="bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E4] to-[#F3E5CA] px-6 sm:px-8 py-5 border-b border-[#E6D4B5] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#B8860B] to-[#9A6B13] text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                    {activeApp.id.includes('tspsc') ? 'TS' : activeApp.id.includes('andhra-pradesh') ? 'AP' : activeApp.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8A641B] font-extrabold uppercase tracking-widest block">
                      {activeApp.name}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-[#2C2013] font-serif leading-tight">
                      {activeModalSection === 'faq' ? 'Help Center & Frequently Asked Questions' :
                       activeModalSection === 'contact' ? 'Contact Us & Customer Support' :
                       activeModalSection === 'report' ? 'Report a Question or Technical Issue' :
                       activeModalSection === 'feedback' ? 'Share Your Feedback & Suggestions' :
                       activeModalSection === 'privacy' ? 'Privacy Policy' :
                       activeModalSection === 'terms' ? 'Terms & Conditions' :
                       `About ${activeApp.name}`}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsAboutModalOpen(false);
                    setActiveModalSection(null);
                  }}
                  className="p-2.5 rounded-2xl bg-[#FFFDF9] hover:bg-[#F5E9D3] text-[#63513D] hover:text-[#2C2013] border border-[#DFC9A3] transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Ivory & Pearl Body */}
              <div className="overflow-y-auto p-6 sm:p-8 custom-scrollbar space-y-6 flex-1 text-sm text-[#4A3A28] leading-relaxed bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F7F0E4]">
                
                {(!activeModalSection || activeModalSection === 'about') && (
                  <div className="space-y-5">
                    <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E6D5B8] shadow-2xs space-y-3">
                      <p className="text-xs sm:text-sm text-[#3A2B1C] font-medium leading-relaxed">
                        <strong className="text-[#2C2013] font-black">{activeApp.name}</strong> is a comprehensive competitive examination preparation platform crafted to deliver structured syllabus mastery, topic-wise practice MCQs, full-length mock tests, and real-time performance analytics.
                      </p>
                      <p className="text-xs sm:text-sm text-[#5C4A38] font-medium leading-relaxed">
                        Every study module is designed for clarity, accuracy, and exam-aligned practice across official syllabus subjects.
                      </p>
                    </div>

                    <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E6D5B8] shadow-2xs space-y-4">
                      <p className="text-xs font-black text-[#8A641B] uppercase tracking-widest">
                        Official Support & Contact Channels
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <a
                          href={waHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3.5 rounded-xl bg-[#FAF6EE] hover:bg-[#F3FAF6] border border-[#E6D5B8] hover:border-[#15803D] transition-all flex items-center gap-2.5 text-xs font-bold text-[#2C2013]"
                        >
                          <WhatsAppBrandIcon className="w-4 h-4 text-[#15803D] shrink-0" />
                          <span className="truncate">{formattedWa}</span>
                        </a>
                        <a
                          href={mailHref}
                          className="p-3.5 rounded-xl bg-[#FAF6EE] hover:bg-[#FDF6E7] border border-[#E6D5B8] hover:border-[#B8860B] transition-all flex items-center gap-2.5 text-xs font-bold text-[#2C2013]"
                        >
                          <Mail className="w-4 h-4 text-[#B8860B] shrink-0" />
                          <span className="truncate">{supportConfig.supportEmail}</span>
                        </a>
                        <a
                          href={tgHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3.5 rounded-xl bg-[#FAF6EE] hover:bg-[#F2F8FD] border border-[#E6D5B8] hover:border-[#0369A1] transition-all flex items-center gap-2.5 text-xs font-bold text-[#2C2013]"
                        >
                          <TelegramBrandIcon className="w-4 h-4 text-[#0369A1] shrink-0" />
                          <span className="truncate">@{cleanTg}</span>
                        </a>
                      </div>
                    </div>

                    <div className="pt-2 text-center">
                      <p className="text-[11px] font-bold text-[#8C775E] uppercase tracking-widest">
                        Platform Release 2.4.0 • Verified & Secure
                      </p>
                    </div>
                  </div>
                )}

                {activeModalSection === 'faq' && (
                  <div className="space-y-3.5">
                    {[
                      {
                        q: "How to attempt mock tests and practice questions?",
                        a: "Navigate to the Home screen and choose your target subject or paper. You can start topic-wise practice to solve questions with immediate explanations, or enter the Mock Test Center for full-length timed tests."
                      },
                      {
                        q: "Can I use the app offline?",
                        a: "Yes. Downloaded questions, mock tests, and syllabus progress are cached locally on your device for uninterrupted study and synchronize automatically when back online."
                      },
                      {
                        q: "How does the negative marking and scoring system work?",
                        a: "Standard mock exams follow official competitive exam guidelines (+1 mark for correct answers, -1/3rd negative deduction for incorrect responses, zero penalty for unattempted questions). Topic-wise practice mode allows penalty-free learning."
                      },
                      {
                        q: "Is current affairs updated regularly?",
                        a: "Yes. The Current Affairs Center is updated with national events, state-specific updates, government schemes, economic indicators, and monthly revision capsules."
                      },
                      {
                        q: "How do I save questions for revision and bookmarks?",
                        a: "Click the bookmark icon on any question card during practice or mock review. Access all saved questions in the Bookmarks section to filter by subject and re-test yourself."
                      },
                      {
                        q: "What should I do if I notice an error in a question or explanation?",
                        a: "Use the 'Report an Issue' option or contact our team on WhatsApp or Email with the subject and question details. Our academic review panel verifies and updates flagged questions promptly."
                      },
                      {
                        q: "How can I contact technical or billing support?",
                        a: `You can reach our official support desk via WhatsApp (${formattedWa}), Email (${supportConfig.supportEmail}), or Telegram (@${cleanTg}) for fast assistance.`
                      }
                    ].map((item, i) => (
                      <div key={i} className="p-5 bg-[#FFFFFF] rounded-2xl border border-[#E6D5B8] shadow-2xs space-y-1.5">
                        <p className="text-xs sm:text-sm font-black text-[#2C2013]">{item.q}</p>
                        <p className="text-xs font-medium text-[#5C4A38] leading-relaxed">{item.a}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeModalSection === 'contact' && (
                  <div className="space-y-5">
                    <div className="bg-[#FDF8EC] border border-[#E5CE9C] rounded-2xl p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-[#B8860B] shrink-0" />
                        <p className="text-xs font-bold text-[#4A3A28]">
                          Connect directly with our official support desk via WhatsApp, Email, or Telegram.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* WhatsApp Card */}
                      <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E6D5B8] hover:border-[#C59B27] shadow-2xs flex flex-col justify-between space-y-4">
                        <div className="space-y-2.5">
                          <div className="w-11 h-11 rounded-2xl bg-[#F3FAF6] border border-[#C6E7D4] text-[#15803D] flex items-center justify-center">
                            <WhatsAppBrandIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-[#2C2013]">WhatsApp Support</h4>
                            <p className="text-[11px] text-[#6E5A48] font-medium">Direct instant chat</p>
                          </div>
                          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF6EE] border border-[#E6D5B8] text-xs font-bold text-[#2C2013] font-mono">
                            <span className="truncate">{formattedWa}</span>
                            <button
                              type="button"
                              onClick={() => copyValue(formattedWa, 'wa')}
                              className="text-[#8C6D32] hover:text-[#15803D] cursor-pointer ml-1"
                            >
                              {copiedField === 'wa' ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <a
                          href={waHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#1E8E52] to-[#157A43] text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <WhatsAppBrandIcon className="w-3.5 h-3.5" />
                          <span>Chat on WhatsApp</span>
                        </a>
                      </div>

                      {/* Email Card */}
                      <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E6D5B8] hover:border-[#C59B27] shadow-2xs flex flex-col justify-between space-y-4">
                        <div className="space-y-2.5">
                          <div className="w-11 h-11 rounded-2xl bg-[#FDF6E7] border border-[#E5CA8F] text-[#9A6B13] flex items-center justify-center">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-[#2C2013]">Email Support</h4>
                            <p className="text-[11px] text-[#6E5A48] font-medium">Official support desk</p>
                          </div>
                          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF6EE] border border-[#E6D5B8] text-xs font-bold text-[#2C2013] font-mono">
                            <span className="truncate" title={supportConfig.supportEmail}>{supportConfig.supportEmail}</span>
                            <button
                              type="button"
                              onClick={() => copyValue(supportConfig.supportEmail, 'email')}
                              className="text-[#8C6D32] hover:text-[#9A6B13] cursor-pointer ml-1 shrink-0"
                            >
                              {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <a
                          href={mailHref}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#B8860B] via-[#C99722] to-[#A37408] text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Send Email</span>
                        </a>
                      </div>

                      {/* Telegram Card */}
                      <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E6D5B8] hover:border-[#C59B27] shadow-2xs flex flex-col justify-between space-y-4">
                        <div className="space-y-2.5">
                          <div className="w-11 h-11 rounded-2xl bg-[#F2F8FD] border border-[#C5E0F5] text-[#0369A1] flex items-center justify-center">
                            <TelegramBrandIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-[#2C2013]">Telegram Support</h4>
                            <p className="text-[11px] text-[#6E5A48] font-medium">Direct messenger</p>
                          </div>
                          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF6EE] border border-[#E6D5B8] text-xs font-bold text-[#2C2013] font-mono">
                            <span className="truncate">@{cleanTg}</span>
                            <button
                              type="button"
                              onClick={() => copyValue(`@${cleanTg}`, 'tg')}
                              className="text-[#8C6D32] hover:text-[#0369A1] cursor-pointer ml-1"
                            >
                              {copiedField === 'tg' ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <a
                          href={tgHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <TelegramBrandIcon className="w-3.5 h-3.5" />
                          <span>Open Telegram</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {(activeModalSection === 'report' || activeModalSection === 'feedback') && (
                  <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E6D5B8] shadow-2xs space-y-4">
                    <p className="text-xs font-semibold text-[#5C4A38]">
                      {activeModalSection === 'report'
                        ? 'Found a question error, typo, or technical issue? Describe it below and send it directly to our academic & technical support team.'
                        : 'We value your suggestions! Share your thoughts or feature requests below to send directly to our team.'}
                    </p>
                    <textarea
                      value={issueFeedbackText}
                      onChange={(e) => setIssueFeedbackText(e.target.value)}
                      placeholder={
                        activeModalSection === 'report'
                          ? 'Describe the subject, question number, or technical issue in detail...'
                          : 'Write your feedback or suggestion here...'
                      }
                      className="w-full h-32 bg-[#FAF6EE] border border-[#DFC9A3] rounded-2xl p-4 text-xs font-semibold text-[#2C2013] placeholder:text-[#96836E] focus:bg-white focus:border-[#B8860B] outline-none transition-all resize-none"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <a
                        href={waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-3.5 px-4 bg-gradient-to-r from-[#1E8E52] to-[#157A43] text-white rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xs"
                      >
                        <WhatsAppBrandIcon className="w-4 h-4" />
                        <span>Send via WhatsApp</span>
                      </a>
                      <a
                        href={mailHref}
                        className="py-3.5 px-4 bg-gradient-to-r from-[#B8860B] via-[#C99722] to-[#A37408] text-white rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xs"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Send via Email</span>
                      </a>
                    </div>
                  </div>
                )}

              </div>

              {/* Warm Ivory Modal Footer */}
              <div className="px-6 sm:px-8 py-4 bg-[#FAF4E8] border-t border-[#E6D4B5] flex items-center justify-between shrink-0">
                <span className="text-xs font-semibold text-[#6E5A48]">
                  {supportConfig.supportEmail}
                </span>
                <button
                  onClick={() => {
                    setIsAboutModalOpen(false);
                    setActiveModalSection(null);
                  }}
                  className="px-6 py-2.5 bg-[#EFE3CE] hover:bg-[#E5D3B5] text-[#2C2013] border border-[#D8C098] rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 22 Official Indian Languages & Region Modal */}
      <LanguageRegionModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        selectedLanguage={selectedLanguage}
        onLanguageChange={onLanguageChange}
        activeAppName={activeApp.name}
      />

      {/* All India Exam Apps Network Switcher Modal (Admins only) */}
      {isAdminLoggedIn && isAppNetworkModalOpen && (
        <AppNetworkSelectorModal
          isOpen={isAppNetworkModalOpen}
          onClose={() => setIsAppNetworkModalOpen(false)}
          apps={apps}
          activeAppId={activeApp.id}
          onSelectApp={(id) => setActiveAppId(id)}
        />
      )}
    </>
  );
}
export default memo(Header);
