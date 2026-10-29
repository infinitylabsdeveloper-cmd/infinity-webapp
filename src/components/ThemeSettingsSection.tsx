/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, 
  Sparkles, 
  CheckCircle2, 
  Sun, 
  Moon, 
  Layers, 
  Eye, 
  Flame, 
  Heart, 
  Crown,
  Zap,
  Check
} from 'lucide-react';
import { THEME_PRESETS, AppThemeId, applyGlobalTheme, getSavedTheme, ThemeConfig } from '../lib/themeRegistry';

interface ThemeSettingsSectionProps {
  title?: string;
  subtitle?: string;
  isCompact?: boolean;
}

export const ThemeSettingsSection: React.FC<ThemeSettingsSectionProps> = ({
  title = "Themes & Visual Aesthetics",
  subtitle = "Customize your learning experience with Sahara, Candy, Silk, and other premium color schemes.",
  isCompact = false,
}) => {
  const [activeTheme, setActiveTheme] = useState<AppThemeId>('default');
  const [justChanged, setJustChanged] = useState<string | null>(null);

  useEffect(() => {
    const saved = getSavedTheme();
    setActiveTheme(saved);
  }, []);

  const handleSelectTheme = (themeId: AppThemeId) => {
    setActiveTheme(themeId);
    applyGlobalTheme(themeId);
    setJustChanged(themeId);
    setTimeout(() => setJustChanged(null), 1800);
  };

  const currentThemeConfig = THEME_PRESETS.find(t => t.id === activeTheme) || THEME_PRESETS[0];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-indigo-600 text-white shadow-sm">
              <Palette className="h-5 w-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              {title}
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium max-w-2xl">
            {subtitle}
          </p>
        </div>

        {/* Active Theme Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Active:
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-black border shadow-xs flex items-center gap-1.5 ${currentThemeConfig.badgeColor}`}>
            <Sparkles className="h-3.5 w-3.5" />
            {currentThemeConfig.name}
          </span>
        </div>
      </div>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {justChanged && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-bold flex items-center gap-2.5 shadow-sm"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Theme updated to <strong>{currentThemeConfig.name}</strong> with smooth visual transitions!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid of Theme Cards */}
      <div className={`grid gap-4 ${isCompact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
        {THEME_PRESETS.map((theme, idx) => {
          const isSelected = activeTheme === theme.id;
          return (
            <motion.div
              key={theme.id}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectTheme(theme.id)}
              className={`rounded-3xl p-5 border-2 transition-all cursor-pointer relative flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                isSelected 
                  ? 'border-indigo-600 bg-white ring-4 ring-indigo-500/15 shadow-lg' 
                  : 'border-slate-200/90 bg-white hover:border-slate-300'
              }`}
            >
              {/* Top Accent Gradient Bar & Badge */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">{theme.name}</span>
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${theme.badgeColor}`}>
                    {theme.tag}
                  </span>
                </div>

                {/* Color Palette Swatch Strip */}
                <div className="h-12 w-full rounded-2xl overflow-hidden shadow-inner p-1.5 flex items-center gap-1.5 bg-slate-100 border border-slate-200/60">
                  <div className={`h-full flex-1 rounded-xl shadow-xs ${theme.previewClass}`} />
                  <div 
                    className="h-full w-9 rounded-xl shadow-xs border border-white/40 flex items-center justify-center text-white text-[10px] font-black"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    ✦
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-black text-slate-700">{theme.tagline}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">
                    {theme.description}
                  </p>
                </div>
              </div>

              {/* Bottom Action / Selection State */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                  <span>Hex:</span>
                  <span className="font-mono text-slate-600">{theme.primaryColor}</span>
                </div>

                {isSelected ? (
                  <span className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 font-black text-[10px] flex items-center gap-1 border border-indigo-200">
                    <Check className="h-3 w-3" /> Active
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-600">
                    Tap to Apply →
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Live Interactive Aesthetic Preview Studio */}
      <div className="rounded-3xl p-6 border border-slate-200 bg-slate-50/70 space-y-4 shadow-inner">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-slate-600" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              Live Theme Preview: {currentThemeConfig.name}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            Real-Time Sample Components
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card Preview 1: Header Banner */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
            <div className={`h-8 w-full rounded-xl flex items-center justify-between px-3 text-white text-xs font-black ${currentThemeConfig.previewClass}`}>
              <span>Exam Portal</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md">Live</span>
            </div>
            <p className="text-xs font-bold text-slate-800">Prelims MCQ Practice Arena</p>
            <p className="text-[11px] text-slate-500">Smooth contrast & calibrated typography.</p>
          </div>

          {/* Card Preview 2: Button & Badge Action */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Mastery Progress</span>
                <span className="text-xs font-black text-emerald-600">85%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${currentThemeConfig.previewClass}`} 
                  style={{ width: '85%' }} 
                />
              </div>
            </div>
            <button 
              className={`w-full py-2 rounded-xl text-white text-xs font-black shadow-sm transition-all flex items-center justify-center gap-1.5 ${currentThemeConfig.previewClass}`}
            >
              <Zap className="h-3.5 w-3.5 fill-white" />
              <span>Start Practice Set</span>
            </button>
          </div>

          {/* Card Preview 3: Badge & Highlights */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${currentThemeConfig.badgeColor}`}>
                ✦ {currentThemeConfig.tagline}
              </span>
              <p className="text-xs font-bold text-slate-800">
                {currentThemeConfig.name} Aesthetic
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Fluid background & border transitions enabled.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
