import React from 'react';
import { 
  Palette, 
  RotateCcw, 
  Check, 
  Sparkles,
  Type,
  Square,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { useMcqAppearance, MCQ_APPEARANCE_PRESETS } from '../lib/mcqAppearanceStore';

interface McqThemeCustomizerProps {
  isCompact?: boolean;
}

export const McqThemeCustomizer: React.FC<McqThemeCustomizerProps> = ({ isCompact = false }) => {
  const { settings, updateSetting, resetToDefault, applyPreset, presets } = useMcqAppearance();

  const colorFields = [
    { id: 'questionBg', label: 'Question Box', type: 'bg' as const },
    { id: 'questionText', label: 'Question Text', type: 'text' as const },
    { id: 'optionsBg', label: 'Options Box', type: 'bg' as const },
    { id: 'optionsText', label: 'Options Text', type: 'text' as const },
    { id: 'explanationBg', label: 'Explanation Box', type: 'bg' as const },
    { id: 'explanationText', label: 'Explanation Text', type: 'text' as const },
    { id: 'accentColor', label: 'Accent Highlight', type: 'accent' as const },
  ];

  return (
    <div className="space-y-6">
      {!isCompact && (
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Palette className="h-4 w-4 text-pink-600" />
              Premium MCQ Card Customization
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Personalize colors for questions, options, and explanations to your reading style.
            </p>
          </div>
          <button
            onClick={resetToDefault}
            className="text-[11px] font-black text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Reset Colors
          </button>
        </div>
      )}

      {/* Preset Gallery */}
      <div className="space-y-3">
        <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-amber-500" />
          Ready-Made Study Themes
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className="group relative h-16 rounded-xl overflow-hidden border-2 border-transparent hover:border-slate-300 transition-all cursor-pointer shadow-sm active:scale-95"
              title={preset.name}
            >
              <div 
                className="absolute inset-0 flex flex-col"
                style={{ background: preset.settings.questionBg }}
              >
                <div 
                  className="flex-1 w-full" 
                  style={{ background: preset.settings.questionBg }} 
                />
                <div 
                  className="h-1/3 w-full" 
                  style={{ background: preset.settings.optionsBg }} 
                />
              </div>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                <span className="text-[10px] font-black text-white drop-shadow-md text-center px-1">
                  {preset.name}
                </span>
              </div>
              {/* Active Indicator */}
              {JSON.stringify(settings) === JSON.stringify(preset.settings) && (
                <div className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow-sm">
                  <Check className="h-2.5 w-2.5 text-indigo-600 stroke-[3]" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Color Pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {colorFields.map((field) => (
          <div 
            key={field.id}
            className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-black text-slate-700 truncate">
                {field.label}
              </span>
              <div className="flex items-center gap-1.5">
                {/* Hex Display */}
                <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 uppercase">
                  {(settings as any)[field.id]?.startsWith('linear') ? 'Gradient' : (settings as any)[field.id]}
                </span>
                
                {/* Color Input */}
                <div className="relative h-6 w-10 rounded-lg overflow-hidden border border-slate-200 shadow-xs cursor-pointer group">
                  <input
                    type="color"
                    value={(settings as any)[field.id]?.startsWith('linear') ? '#ffffff' : (settings as any)[field.id]}
                    onChange={(e) => updateSetting({ [field.id]: e.target.value })}
                    className="absolute -inset-2 w-[150%] h-[150%] cursor-pointer opacity-0"
                    disabled={(settings as any)[field.id]?.startsWith('linear')}
                  />
                  <div 
                    className="w-full h-full" 
                    style={{ background: (settings as any)[field.id] }}
                  />
                  {(settings as any)[field.id]?.startsWith('linear') && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <Sparkles className="h-2 w-2 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Quick Suggestions for specific field */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
              {(field.type === 'text' ? ['#000000', '#ffffff', '#1e293b', '#4a148c', '#064e3b'] : field.type === 'accent' ? ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] : ['#f8fafc', '#ffffff', '#fffbeb', '#f0f9ff', '#f5f3ff']).map(c => (
                <button
                  key={c}
                  onClick={() => updateSetting({ [field.id]: c })}
                  className="w-4 h-4 rounded-full border border-slate-200 shrink-0 transition-transform active:scale-75"
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Customization Note */}
      <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
        <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-xs shrink-0 mt-0.5">
          <Palette className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <h5 className="text-[11px] font-black text-indigo-950 uppercase tracking-wide">Pro Design Control</h5>
          <p className="text-[11px] text-indigo-800 leading-relaxed font-medium">
            Mix and match colors to create your perfect study environment. Use soft, muted colors for backgrounds and high-contrast colors for text to ensure maximum eye comfort during long study hours.
          </p>
        </div>
      </div>
    </div>
  );
};
