import React from 'react';
import { 
  PracticeAnimationStyle, 
  PracticeMotionConfig, 
  saveMotionConfig 
} from '../utils/practiceMotion';
import { 
  Sparkles, 
  Layers, 
  Zap, 
  MoveRight, 
  Check, 
  X, 
  Smartphone, 
  Rotate3d,
  Eye,
  Sliders,
  HelpCircle
} from 'lucide-react';

interface PracticeMotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PracticeMotionConfig;
  onChange: (newConfig: PracticeMotionConfig) => void;
  title?: string;
  allowFlashcardModeToggle?: boolean;
}

export default function PracticeMotionModal({
  isOpen,
  onClose,
  config,
  onChange,
  title = 'Motion & 3D Transition Settings',
  allowFlashcardModeToggle = true,
}: PracticeMotionModalProps) {
  if (!isOpen) return null;

  const handleSelectStyle = (style: PracticeAnimationStyle) => {
    const updated = saveMotionConfig({ style, reducedMotion: style === 'minimal' });
    onChange(updated);
  };

  const handleToggle3dDepth = () => {
    const updated = saveMotionConfig({ enable3dDepth: !config.enable3dDepth });
    onChange(updated);
  };

  const handleToggleFlashcard = () => {
    const updated = saveMotionConfig({ isFlashcardMode: !config.isFlashcardMode });
    onChange(updated);
  };

  const handleLowEndPreset = () => {
    const updated = saveMotionConfig({ 
      style: 'minimal', 
      enable3dDepth: false, 
      reducedMotion: true 
    });
    onChange(updated);
  };

  const handleUltra3dPreset = () => {
    const updated = saveMotionConfig({ 
      style: '3d-flip', 
      enable3dDepth: true, 
      reducedMotion: false 
    });
    onChange(updated);
  };

  const stylesList: {
    id: PracticeAnimationStyle;
    title: string;
    description: string;
    badge: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: '3d-flip',
      title: '3D Flashcard Flip & Depth',
      description: 'Realistic 3D perspective flip with subtle rotational depth between cards.',
      badge: 'Premium 3D',
      icon: <Rotate3d className="w-5 h-5 text-indigo-400" />,
    },
    {
      id: 'hero-slide',
      title: 'Hero Motion Slide',
      description: 'Cinematic directional slide with smooth spring damping and scale depth.',
      badge: 'Fluid',
      icon: <MoveRight className="w-5 h-5 text-blue-400" />,
    },
    {
      id: 'fade-scale',
      title: 'Fade & Scale Zoom',
      description: 'Elegant soft zoom and cross-fade without horizontal displacement.',
      badge: 'Gentle',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'minimal',
      title: 'Minimal / Reduced Motion',
      description: 'Instant 0-lag transition. Specially tuned for older Android devices and low battery.',
      badge: 'High Performance',
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner">
              <Rotate3d className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">{title}</h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Customize transition physics, 3D card flips, and low-end device optimization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 scrollbar-thin">
          
          {/* Quick Presets Banner */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950/50 p-2 rounded-2xl border border-slate-800">
            <button
              onClick={handleUltra3dPreset}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                config.style === '3d-flip' && config.enable3dDepth
                  ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-300 ring-1 ring-indigo-500/40'
                  : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Ultra 3D Mode
              </span>
              <span className="text-xs font-bold leading-tight">Rich 3D Flips & Depth</span>
            </button>

            <button
              onClick={handleLowEndPreset}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                config.style === 'minimal'
                  ? 'bg-emerald-600/20 border-emerald-500/60 text-emerald-300 ring-1 ring-emerald-500/40'
                  : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <Smartphone className="w-3 h-3" /> Android / Saver
              </span>
              <span className="text-xs font-bold leading-tight">Instant 0-Lag Smooth</span>
            </button>
          </div>

          {/* Transition Style Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Transition Style
            </label>
            <div className="space-y-2">
              {stylesList.map((item) => {
                const isSelected = config.style === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectStyle(item.id)}
                    className={`w-full p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 relative ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-lg ring-1 ring-indigo-500/50'
                        : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0 p-2 rounded-xl bg-slate-900 border border-slate-800">
                      {item.icon}
                    </div>
                    <div className="flex-1 pr-6">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-black">{item.title}</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isSelected 
                            ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {item.description}
                      </p>
                    </div>
                    <div className="absolute right-3.5 top-4">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                        isSelected 
                          ? 'bg-indigo-500 border-indigo-400 text-white' 
                          : 'border-slate-600 bg-slate-800'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Features: 3D Flashcard Mode & 3D Depth Toggle */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <label className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Advanced Visual & Flashcard Options
            </label>



            <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs sm:text-sm font-black text-slate-200">
                  Subtle 3D Depth & Tilt Shadows
                </span>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Adds realistic perspective depth and card layering shadows
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggle3dDepth}
                className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer shrink-0 p-0.5 ${
                  config.enable3dDepth ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
                aria-label="Toggle 3D Depth"
              >
                <div className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transition-transform ${
                  config.enable3dDepth ? 'translate-x-5.5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">
            Settings auto-save instantly for all practice sessions
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition-colors cursor-pointer shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
