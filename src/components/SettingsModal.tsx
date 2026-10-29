import React, { useState, useEffect } from 'react';
import { 
  X, 
  Type, 
  RotateCcw, 
  Check, 
  Eye, 
  CheckCircle2, 
  ZoomIn, 
  AlignLeft,
  Bold,
  Trash2,
  AlertTriangle,
  CheckSquare,
  Square,
  History,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Columns2,
  Palette
} from 'lucide-react';
import { motion } from 'motion/react';
import { AppConfig, Subject } from '../types';
import { McqFontControls } from './McqFontControls';
import { McqThemeCustomizer } from './McqThemeCustomizer';
import { useMcqFontSize } from '../lib/mcqFontStore';
import { 
  FontSettings, 
  FONT_PRESETS, 
  FontSizeScale, 
  FontWeightPreference, 
  LineHeightScale, 
  getSavedFontSettings, 
  saveFontSettings, 
  DEFAULT_FONT_SETTINGS 
} from '../lib/fontSettings';
import { useMcqAppearance } from '../lib/mcqAppearanceStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeApp?: AppConfig;
  subjects?: Subject[];
  onResetSubjectProgress?: (subjectIds: string[]) => void;
}

const defaultSubjects: Subject[] = [
  {
    id: 'history',
    name: 'Indian History & Cultural Heritage',
    icon: 'BookOpen',
    units: [
      { id: 'u1', name: 'Ancient India & Indus Valley Civilization', topics: [] },
      { id: 'u2', name: 'Medieval India & Art Architecture', topics: [] },
      { id: 'u3', name: 'Modern India & Freedom Struggle', topics: [] },
    ],
  },
  {
    id: 'polity',
    name: 'Indian Polity & Constitutional Governance',
    icon: 'Shield',
    units: [
      { id: 'u4', name: 'Constitutional Framework & Rights', topics: [] },
      { id: 'u5', name: 'Union Executive & Parliament', topics: [] },
    ],
  },
  {
    id: 'geography',
    name: 'Geography & Environmental Ecology',
    icon: 'Globe',
    units: [
      { id: 'u6', name: 'Physical & Indian Geography', topics: [] },
      { id: 'u7', name: 'Environment, Climate & Biodiversity', topics: [] },
    ],
  },
  {
    id: 'economy',
    name: 'Indian Economy & Economic Development',
    icon: 'TrendingUp',
    units: [
      { id: 'u8', name: 'Economic Planning & National Income', topics: [] },
      { id: 'u9', name: 'Banking, Money & Inflation', topics: [] },
    ],
  },
  {
    id: 'science',
    name: 'General Science & Technology',
    icon: 'Zap',
    units: [
      { id: 'u10', name: 'Physics, Chemistry & Life Sciences', topics: [] },
      { id: 'u11', name: 'Space, IT, AI & Defense Tech', topics: [] },
    ],
  },
];

export default function SettingsModal({
  isOpen,
  onClose,
  activeApp,
  subjects,
  onResetSubjectProgress,
}: SettingsModalProps) {
  const [settings, setSettings] = useState<FontSettings>(getSavedFontSettings);
  const { settings: appearance } = useMcqAppearance();
  const [activeTab, setActiveTab] = useState<'font' | 'size' | 'theme' | 'spacing' | 'screensize' | 'reset'>('font');

  // MCQ Practice Screen Size state
  const [screenSize, setScreenSize] = useState<'small' | 'medium' | 'large' | 'xl'>(() => {
    try {
      const saved = localStorage.getItem('mcq_screen_size_mode');
      if (saved && ['small', 'medium', 'large', 'xl'].includes(saved)) {
        return saved as 'small' | 'medium' | 'large' | 'xl';
      }
    } catch (e) {}
    return 'large';
  });

  const handleSelectScreenSize = (size: 'small' | 'medium' | 'large' | 'xl') => {
    setScreenSize(size);
    try {
      localStorage.setItem('mcq_screen_size_mode', size);
      window.dispatchEvent(new CustomEvent('mcq_screen_size_changed', { detail: size }));
    } catch (e) {}
  };

  // Reset Progress States
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [resetToastMessage, setResetToastMessage] = useState<string | null>(null);

  const availableSubjects: Subject[] = 
    (subjects && subjects.length > 0)
      ? subjects
      : (activeApp?.syllabus && activeApp.syllabus.length > 0)
        ? activeApp.syllabus
        : defaultSubjects;

  useEffect(() => {
    if (isOpen) {
      setSettings(getSavedFontSettings());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const updateSetting = <K extends keyof FontSettings>(key: K, value: FontSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveFontSettings(updated);
  };

  const handleReset = () => {
    setSettings(DEFAULT_FONT_SETTINGS);
    saveFontSettings(DEFAULT_FONT_SETTINGS);
  };

  const checkSubjectHasHistory = (subjectId: string): boolean => {
    const appId = activeApp?.id || 'andhra-pradesh-appsc-group-2-en';
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes(`_${subjectId}_`) ||
        key.endsWith(`_${subjectId}`) ||
        key.includes(`_${appId}_${subjectId}`)
      )) {
        return true;
      }
    }
    return false;
  };

  const handleToggleSubjectSelect = (subjectId: string) => {
    setSelectedSubjectIds(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSelectAllSubjects = () => {
    setSelectedSubjectIds(availableSubjects.map(s => s.id));
  };

  const handleDeselectAllSubjects = () => {
    setSelectedSubjectIds([]);
  };

  const handleExecuteResetProgress = () => {
    if (selectedSubjectIds.length === 0) return;

    const appId = activeApp?.id || 'andhra-pradesh-appsc-group-2-en';
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const isProgressKey =
        key.startsWith('completed_sub_') ||
        key.startsWith('completed_set_') ||
        key.startsWith('exam_practice_') ||
        key.startsWith('exam_practice_set_') ||
        key.startsWith('test_results_') ||
        key.startsWith('subject_performance_') ||
        key.startsWith('user_attempts_') ||
        key.startsWith('flagged_questions_');

      if (isProgressKey) {
        const isTargetSubject = selectedSubjectIds.some(
          sId => key.includes(`_${sId}_`) || key.endsWith(`_${sId}`) || key.includes(`_${appId}_${sId}`)
        );
        if (isTargetSubject) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));

    if (onResetSubjectProgress) {
      onResetSubjectProgress(selectedSubjectIds);
    }

    // Broadcast window event so active screens auto-refresh
    window.dispatchEvent(
      new CustomEvent('aspirant_progress_reset', {
        detail: { subjectIds: selectedSubjectIds, appId }
      })
    );
    window.dispatchEvent(new Event('storage'));

    const countText = selectedSubjectIds.length === 1 ? '1 subject' : `${selectedSubjectIds.length} subjects`;
    setResetToastMessage(`Performance history and practice progress cleared for ${countText}.`);
    setSelectedSubjectIds([]);
    setIsConfirmModalOpen(false);

    setTimeout(() => {
      setResetToastMessage(null);
    }, 4500);
  };

  const activePreset = FONT_PRESETS.find(p => p.id === settings.fontFamily) || FONT_PRESETS[0];

  const sizeLabels: Record<FontSizeScale, { name: string; px: string; desc: string }> = {
    small: { name: 'Small', px: '14px', desc: 'Compact for high density' },
    default: { name: 'Normal', px: '16px', desc: 'Standard platform default' },
    medium: { name: 'Medium', px: '17.5px', desc: 'Comfortable long-reading' },
    large: { name: 'Large', px: '19px', desc: 'High visibility & clarity' },
    xlarge: { name: 'Extra Large', px: '21px', desc: 'Maximum size for easy study' },
  };

  const lineHeightLabels: Record<LineHeightScale, { name: string; val: string; desc: string }> = {
    compact: { name: 'Compact', val: '1.4x', desc: 'Tight vertical lines' },
    normal: { name: 'Normal', val: '1.6x', desc: 'Standard balanced spacing' },
    relaxed: { name: 'Relaxed', val: '1.8x', desc: 'Airy line gap' },
    spacious: { name: 'Spacious', val: '2.0x', desc: 'Extra space for readability' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative w-full max-w-4xl max-h-[94vh] sm:max-h-[92vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col mx-2 sm:mx-4"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-orange-50/40">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-200 font-black shrink-0">
              <Type className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-lg font-black text-slate-900 flex items-center gap-1.5 sm:gap-2 truncate">
                <span>Display & Typography</span>
                <span className="text-[9px] sm:text-[10px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200 shrink-0">
                  Customization
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate hidden sm:block">
                Customize reading fonts, text sizes, line spacing, and contrast modes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleReset}
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Reset to Default Settings"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Close Settings"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 pt-2.5 sm:pt-3 pb-2 border-b border-slate-100 bg-slate-50/60 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            onClick={() => setActiveTab('font')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'font'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Type className="h-3.5 w-3.5 text-amber-400" />
            Fonts ({FONT_PRESETS.length})
          </button>

          <button
            id="tab-size"
            onClick={() => setActiveTab('size')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'size'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <ZoomIn className="h-3.5 w-3.5 text-emerald-400" />
            Text Size ({sizeLabels[settings.fontSize].px})
          </button>

          <button
            id="tab-theme"
            onClick={() => setActiveTab('theme')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'theme'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Palette className="h-3.5 w-3.5 text-pink-500" />
            Q&A Themes
          </button>

          <button
            onClick={() => setActiveTab('spacing')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'spacing'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <AlignLeft className="h-3.5 w-3.5 text-indigo-400" />
            Spacing
          </button>

          <button
            onClick={() => setActiveTab('screensize')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'screensize'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Monitor className="h-3.5 w-3.5 text-sky-400" />
            Screen Size ({screenSize.toUpperCase()})
          </button>

          <button
            onClick={() => setActiveTab('reset')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'reset'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5 text-rose-300" />
            Reset Progress ({selectedSubjectIds.length > 0 ? `${selectedSubjectIds.length}` : '0'})
          </button>
        </div>

        {/* Success Toast Banner */}
        {resetToastMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{resetToastMessage}</span>
            </div>
            <button
              onClick={() => setResetToastMessage(null)}
              className="p-1 rounded-lg hover:bg-emerald-100 text-emerald-700 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Scrollable Settings Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: FONT FAMILIES */}
          {activeTab === 'font' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900">Select Exam Reading Font</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Optimized for competitive examination practice and clear screen reading
                  </p>
                </div>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">
                  Active: {activePreset.name}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {FONT_PRESETS.map((preset) => {
                  const isSelected = settings.fontFamily === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => updateSetting('fontFamily', preset.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected 
                          ? 'border-orange-500 bg-orange-50/40 shadow-sm ring-2 ring-orange-400/20' 
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-black text-slate-900">{preset.name}</span>
                              {isSelected && (
                                <CheckCircle2 className="h-4 w-4 text-orange-600 shrink-0 fill-orange-100" />
                              )}
                            </div>
                            <p className="text-[11px] font-bold text-slate-500">{preset.nativeName}</p>
                          </div>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
                            {preset.tag}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          {preset.description}
                        </p>

                        {/* Font Live Mini Preview Box */}
                        <div 
                          className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1 mt-2"
                          style={{ fontFamily: preset.fontFamilyCSS }}
                        >
                          <p className="text-xs font-bold text-slate-800 line-clamp-2">
                            {preset.sampleEn}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-semibold">Best for:</span>
                        <span className="font-bold text-slate-700">{preset.recommendedFor}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: TEXT SIZE & SCALING */}
          {activeTab === 'size' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-black text-slate-900">Font Sizing & Zoom Level</h4>
                <p className="text-xs text-slate-500 font-medium">
                  Scale question text, options, and explanations to your reading comfort
                </p>
              </div>

              {/* Instant MCQ Font Size Controls (A- / A+ / Reset) */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/50 to-indigo-50 border-2 border-amber-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                <div>
                  <span className="text-xs font-black text-slate-900 block">MCQ Live Font Controls (A− / A+)</span>
                  <span className="text-[11px] text-slate-600">Applies instantly to questions, options & explanations across all screens</span>
                </div>
                <McqFontControls variant="light" />
              </div>

              {/* Sizing Step Selector Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                {(Object.keys(sizeLabels) as FontSizeScale[]).map((scaleKey) => {
                  const isSelected = settings.fontSize === scaleKey;
                  const item = sizeLabels[scaleKey];
                  return (
                    <button
                      key={scaleKey}
                      onClick={() => updateSetting('fontSize', scaleKey)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/50 shadow-sm ring-2 ring-orange-400/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">{item.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-orange-600 font-bold" />}
                      </div>
                      <div className="my-2 text-center py-2 bg-white rounded-xl border border-slate-100">
                        <span className="font-black text-slate-800" style={{ 
                          fontSize: scaleKey === 'small' ? '13px' : scaleKey === 'default' ? '15px' : scaleKey === 'medium' ? '17px' : scaleKey === 'large' ? '19px' : '22px'
                        }}>
                          Aa Bb
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold text-center">{item.px}</p>
                    </button>
                  );
                })}
              </div>

              {/* Weight Selector */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 flex items-center gap-2">
                    <Bold className="h-4 w-4 text-orange-600" />
                    Text Weight & Thickness
                  </span>
                  <span className="text-xs font-bold text-slate-500 capitalize">{settings.fontWeight}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'regular', name: 'Regular (400)', desc: 'Standard light strokes' },
                    { id: 'medium', name: 'Medium (500)', desc: 'Enhanced contrast' },
                    { id: 'bold', name: 'Strong (600)', desc: 'Sharp dark visibility' },
                  ].map((w) => (
                    <button
                      key={w.id}
                      onClick={() => updateSetting('fontWeight', w.id as FontWeightPreference)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        settings.fontWeight === w.id
                          ? 'border-orange-500 bg-white shadow-xs font-bold text-orange-950'
                          : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <p className="text-xs font-black">{w.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{w.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Q&A APPEARANCE THEMES */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <McqThemeCustomizer />
            </div>
          )}

          {/* TAB 3: SPACING & CONTRAST */}
          {activeTab === 'spacing' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-black text-slate-900">Line Spacing & Contrast Adjustments</h4>
                <p className="text-xs text-slate-500 font-medium">
                  Fine-tune vertical line separation and contrast mode for comfortable long study sessions
                </p>
              </div>

              {/* Line Height Selector */}
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-700">Line Height / Vertical Spacing</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(Object.keys(lineHeightLabels) as LineHeightScale[]).map((lhKey) => {
                    const isSelected = settings.lineHeight === lhKey;
                    const item = lineHeightLabels[lhKey];
                    return (
                      <button
                        key={lhKey}
                        onClick={() => updateSetting('lineHeight', lhKey)}
                        className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/50 shadow-sm'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900">{item.name}</span>
                          <span className="text-[10px] font-extrabold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">
                            {item.val}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* High Contrast Toggle */}
              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-black text-slate-900">High-Contrast Text Mode</span>
                    <p className="text-xs text-slate-500">
                      Forces maximum black/white contrast for study under direct sunlight or low-contrast screens.
                    </p>
                  </div>
                  <button
                    onClick={() => updateSetting('highContrastText', !settings.highContrastText)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                      settings.highContrastText ? 'bg-orange-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.highContrastText ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MCQ PRACTICE SCREEN SIZE (Small, Medium, Large, XL) */}
          {activeTab === 'screensize' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-sky-600" />
                  MCQ Practice Screen Size Configuration
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Choose your ideal layout scale and width in the MCQ Practice Arena. Switch to the size that fits your device or reading distance best.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: 'small' as const,
                    title: 'Small Screen',
                    badge: 'S',
                    width: 'Max 576px',
                    desc: 'Compact phone-width layout with tighter margins, compact buttons, and focused vertical reading.',
                    icon: Smartphone,
                    color: 'text-indigo-600',
                    bgColor: 'bg-indigo-50',
                    borderColor: 'border-indigo-200',
                  },
                  {
                    id: 'medium' as const,
                    title: 'Medium Screen',
                    badge: 'M',
                    width: 'Max 768px',
                    desc: 'Standard tablet-width layout with balanced spacing, comfortable button touch targets, and natural line length.',
                    icon: Tablet,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                  },
                  {
                    id: 'large' as const,
                    title: 'Large Screen',
                    badge: 'L',
                    width: 'Max 1024px',
                    desc: 'Standard desktop-width layout with spacious question cards, larger text, and prominent option cards.',
                    icon: Laptop,
                    color: 'text-sky-600',
                    bgColor: 'bg-sky-50',
                    borderColor: 'border-sky-200',
                  },
                  {
                    id: 'xl' as const,
                    title: 'XL Screen',
                    badge: 'XL',
                    width: 'Max 1560px',
                    desc: 'Expansive widescreen presentation with maximum padding, ultra-prominent question box, and grand typography.',
                    icon: Monitor,
                    color: 'text-violet-600',
                    bgColor: 'bg-violet-50',
                    borderColor: 'border-violet-200',
                  },
                ].map((item) => {
                  const isSelected = screenSize === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectScreenSize(item.id)}
                      className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`p-2 rounded-xl ${isSelected ? 'bg-indigo-600 text-white' : `${item.bgColor} ${item.color}`}`}>
                            <Icon className="h-5 w-5" />
                          </span>
                          <div>
                            <h5 className="text-sm font-black text-slate-900">{item.title}</h5>
                            <span className="text-[11px] font-bold text-slate-500">{item.width}</span>
                          </div>
                        </div>

                        <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.badge}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.desc}
                      </p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400">
                          {isSelected ? '✓ Currently Active' : 'Click to Activate'}
                        </span>
                        {isSelected && (
                          <span className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                            ✓
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Informational Built-in Desktop Feature Note */}
              <div className="pt-4 border-t border-slate-200">
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-3">
                  <span className="p-1.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                    <Columns2 className="h-4 w-4" />
                  </span>
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-black text-slate-900 flex items-center gap-2">
                      Desktop Explanations View (Permanent Built-in)
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-950">
                        Active
                      </span>
                    </h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                      Detailed explanations are placed on the left side, with the questions and options area kept constant on the right in desktop mode.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RESET SUBJECT PROGRESS */}
          {activeTab === 'reset' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-rose-600" />
                    Reset Subject Performance History
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Select specific subjects to erase practice test records, topic accuracy, and completed set flags.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleSelectAllSubjects}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckSquare className="h-3.5 w-3.5 text-slate-600" />
                    Select All
                  </button>
                  <button
                    onClick={handleDeselectAllSubjects}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Square className="h-3.5 w-3.5 text-slate-600" />
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Warning Banner */}
              <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200/90 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1 text-rose-950">
                  <p className="font-bold">Important Notice regarding Performance History:</p>
                  <p className="text-rose-900/80 leading-relaxed font-medium">
                    Resetting a subject will permanently erase your practice test attempt records, answer logs, and set completion status for that subject. Your app subscription and global account credentials will remain untouched.
                  </p>
                </div>
              </div>

              {/* Subject Cards Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {availableSubjects.map((subj) => {
                  const isSelected = selectedSubjectIds.includes(subj.id);
                  const hasHistory = checkSubjectHasHistory(subj.id);
                  const unitCount = subj.units?.length || 0;

                  return (
                    <div
                      key={subj.id}
                      onClick={() => handleToggleSubjectSelect(subj.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50/50 shadow-xs ring-2 ring-rose-400/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                            isSelected
                              ? 'bg-rose-600 border-rose-600 text-white'
                              : 'bg-slate-100 border-slate-300 text-transparent'
                          }`}
                        >
                          <Check className="h-4 w-4 stroke-[3]" />
                        </div>

                        <div className="space-y-1">
                          <h5 className="text-xs font-black text-slate-900">{subj.name}</h5>
                          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                            <span>{unitCount} Syllabus {unitCount === 1 ? 'Unit' : 'Units'}</span>
                            <span>•</span>
                            {hasHistory ? (
                              <span className="text-amber-800 bg-amber-100 border border-amber-200 font-bold px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1">
                                <History className="h-3 w-3 text-amber-600" /> Recorded Progress
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">Clean History</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200 shrink-0">
                          To Reset
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Primary Reset Action Button */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500">
                  {selectedSubjectIds.length === 0
                    ? 'Select at least 1 subject to enable reset'
                    : `${selectedSubjectIds.length} ${selectedSubjectIds.length === 1 ? 'subject' : 'subjects'} marked for progress reset`}
                </span>

                <button
                  disabled={selectedSubjectIds.length === 0}
                  onClick={() => setIsConfirmModalOpen(true)}
                  className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                    selectedSubjectIds.length > 0
                      ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-700 hover:to-red-700 shadow-rose-200 active:scale-98'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                  Reset Progress ({selectedSubjectIds.length})
                </button>
              </div>
            </div>
          )}

          <div className="pt-2">
            <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                    Live Study Card Preview
                  </span>
                </div>
              </div>

              {/* Dynamic Styled Question Preview Card */}
              <div 
                className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4"
                style={{
                  fontFamily: activePreset.fontFamilyCSS,
                }}
              >
                {/* Question Header & Prompt */}
                <div 
                  className="space-y-2 p-4 rounded-xl shadow-sm"
                  style={{ background: appearance.questionBg, color: appearance.questionText }}
                >
                  <span 
                    className="px-2.5 py-0.5 rounded-md border text-[11px] font-black uppercase"
                    style={{ background: 'rgba(0,0,0,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: appearance.questionText }}
                  >
                    Sample Question #14
                  </span>
                  
                  <p className="font-bold leading-relaxed text-sm sm:text-base">
                    According to which Article of the Indian Constitution does the President have the power to proclaim a National Emergency?
                  </p>
                </div>

                {/* Sample Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {[
                    { id: 'A', text: 'Article 352', correct: true },
                    { id: 'B', text: 'Article 356', correct: false },
                    { id: 'C', text: 'Article 360', correct: false },
                    { id: 'D', text: 'Article 368', correct: false },
                  ].map((opt) => (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-xl border flex items-center gap-3 ${
                        opt.correct 
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200' 
                          : ''
                      }`}
                      style={!opt.correct ? { 
                        background: appearance.optionsBg, 
                        borderColor: `${appearance.optionsText}20`,
                        color: appearance.optionsText 
                      } : {}}
                    >
                      <span 
                        className="h-6 w-6 rounded-lg text-xs font-black flex items-center justify-center shadow-xs"
                        style={{ 
                          background: opt.correct ? '#10b981' : appearance.accentColor,
                          color: '#ffffff'
                        }}
                      >
                        {opt.id}
                      </span>
                      <span className="text-xs font-semibold">{opt.text}</span>
                    </div>
                  ))}
                </div>

                {/* Explanation Card */}
                <div 
                  className="p-4 rounded-2xl border-2 text-xs space-y-1.5 shadow-md"
                  style={{ 
                    background: appearance.explanationBg, 
                    color: appearance.explanationText,
                    borderColor: `${appearance.accentColor}30`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-black flex items-center gap-1.5 text-xs" style={{ color: appearance.accentColor }}>
                      <span className="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                        ✓
                      </span>
                      Explanation & Concept Breakdown
                    </p>
                    <span 
                      className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border"
                      style={{ 
                        background: `${appearance.accentColor}15`, 
                        color: appearance.accentColor,
                        borderColor: `${appearance.accentColor}30`
                      }}
                    >
                      Verified
                    </span>
                  </div>
                  <p className="leading-relaxed font-normal pt-0.5 opacity-90">
                    Article 352 allows National Emergency on grounds of war, external aggression or armed rebellion. Article 356 deals with President's Rule and Article 360 deals with Financial Emergency.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              Applied Font: <span className="font-bold text-slate-900">{activePreset.name}</span> ({sizeLabels[settings.fontSize].px})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-black hover:bg-orange-700 transition-colors shadow-md shadow-orange-200 cursor-pointer"
            >
              Done & Save
            </button>
          </div>
        </div>

        {/* Confirmation Modal Overlay */}
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-60 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="h-10 w-10 rounded-2xl bg-rose-100 flex items-center justify-center font-bold">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Confirm Resetting Progress?</h4>
                  <p className="text-xs text-slate-500 font-medium">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                Are you sure you want to clear practice performance records and completion marks for the following <strong>{selectedSubjectIds.length}</strong> subject(s)?
              </p>

              <ul className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-1.5 max-h-36 overflow-y-auto text-xs font-bold text-slate-800">
                {selectedSubjectIds.map(sId => {
                  const subjObj = availableSubjects.find(s => s.id === sId);
                  return (
                    <li key={sId} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                      <span>{subjObj?.name || sId}</span>
                    </li>
                  );
                })}
              </ul>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteResetProgress}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-colors shadow-md shadow-rose-200 cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Confirm & Erase Progress
                </button>
              </div>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
}
