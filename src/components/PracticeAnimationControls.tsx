import React from 'react';
import { 
  Sparkles, RotateCw, Layers, Zap, Check, Eye, Sliders, X, FlipHorizontal2 
} from 'lucide-react';
import { 
  usePracticeAnimation, 
  ANIMATION_STYLE_OPTIONS, 
  PracticeAnimationStyle 
} from '../lib/practiceAnimationStore';

interface PracticeAnimationControlsProps {
  isOpen: boolean;
  onClose: () => void;
  showFlashcardToggle?: boolean;
}

export const PracticeAnimationControlsModal: React.FC<PracticeAnimationControlsProps> = ({
  isOpen,
  onClose,
  showFlashcardToggle = true,
}) => {
  const { settings, setStyle, toggleFlashcardMode, toggleDepthEffects } = usePracticeAnimation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="animation-settings-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 id="animation-settings-title" className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Motion & 3D Transition Effects
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Customize question navigation and 3D flashcard physics
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto">


          {/* Animation Styles */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Question Navigation Transition Style
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ANIMATION_STYLE_OPTIONS.map((opt) => {
                const isSelected = settings.style === opt.id;
                const getIcon = () => {
                  switch (opt.id) {
                    case '3d-flip': return <RotateCw className="w-4 h-4" />;
                    case 'hero-slide': return <Sparkles className="w-4 h-4" />;
                    case 'fade-scale': return <Layers className="w-4 h-4" />;
                    case 'reduced': return <Zap className="w-4 h-4" />;
                  }
                };

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStyle(opt.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                          {getIcon()}
                        </span>
                        <span className="text-xs font-black">{opt.label}</span>
                      </div>
                      {isSelected && (
                        <span className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                      {opt.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Depth Effects & Shadows Toggle */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Spatial Depth & Dynamic Shadows
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Adds 3D perspective elevation and soft ambient depth
              </p>
            </div>
            <button
              type="button"
              onClick={toggleDepthEffects}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.depthEffects ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              role="switch"
              aria-checked={settings.depthEffects}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.depthEffects ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
