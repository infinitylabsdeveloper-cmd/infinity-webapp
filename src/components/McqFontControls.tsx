import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useMcqFontSize } from '../lib/mcqFontStore';

interface McqFontControlsProps {
  className?: string;
  variant?: 'light' | 'dark' | 'compact' | 'minimal';
  showLabel?: boolean;
}

export const McqFontControls: React.FC<McqFontControlsProps> = ({
  className = '',
  variant = 'light',
  showLabel = true,
}) => {
  const { percentage, isModified, isMin, isMax, increase, decrease, reset } = useMcqFontSize();

  if (variant === 'dark') {
    return (
      <div className={`inline-flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--bg-secondary)]/90 border border-[var(--card-border)] text-[var(--text-primary)] shadow-md backdrop-blur-md select-none ${className}`}>
        {showLabel && (
          <span className="text-[10px] font-black uppercase tracking-wider px-1.5 text-[var(--text-muted)] hidden sm:inline-block">
            Font
          </span>
        )}
        <button
          type="button"
          onClick={decrease}
          disabled={isMin}
          className="h-7 px-2.5 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] active:bg-[var(--card-border)] disabled:opacity-30 disabled:hover:bg-[var(--bg-primary)] disabled:cursor-not-allowed text-[var(--text-primary)] font-black text-xs transition-all cursor-pointer flex items-center justify-center border border-[var(--card-border)]"
          title="Decrease MCQ Font Size (A−)"
        >
          A−
        </button>

        <span className="text-[11px] font-black text-[var(--theme-accent)] min-w-[38px] text-center px-0.5">
          {percentage}
        </span>

        <button
          type="button"
          onClick={increase}
          disabled={isMax}
          className="h-7 px-2.5 rounded-xl bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] active:bg-[var(--card-border)] disabled:opacity-30 disabled:hover:bg-[var(--bg-primary)] disabled:cursor-not-allowed text-[var(--text-primary)] font-black text-xs transition-all cursor-pointer flex items-center justify-center border border-[var(--card-border)]"
          title="Increase MCQ Font Size (A+)"
        >
          A+
        </button>

        {isModified && (
          <button
            type="button"
            onClick={reset}
            className="h-7 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-[10px] sm:text-xs transition-all cursor-pointer flex items-center gap-1 shadow-xs ml-0.5"
            title="Reset Font Size to Default (100%)"
          >
            <RotateCcw className="w-3 h-3 stroke-[3]" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={`inline-flex items-center gap-1 p-0.5 rounded-xl bg-slate-100/90 border border-slate-200 text-slate-800 select-none ${className}`}>
        <button
          type="button"
          onClick={decrease}
          disabled={isMin}
          className="w-6 h-6 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-800 font-extrabold text-xs flex items-center justify-center shadow-2xs border border-slate-200 cursor-pointer"
          title="Decrease MCQ Font Size (A−)"
        >
          A−
        </button>
        <span className="text-[10px] font-black text-indigo-700 px-1 min-w-[32px] text-center">
          {percentage}
        </span>
        <button
          type="button"
          onClick={increase}
          disabled={isMax}
          className="w-6 h-6 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-slate-800 font-extrabold text-xs flex items-center justify-center shadow-2xs border border-slate-200 cursor-pointer"
          title="Increase MCQ Font Size (A+)"
        >
          A+
        </button>
        {isModified && (
          <button
            type="button"
            onClick={reset}
            className="h-6 px-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] flex items-center gap-0.5 shadow-2xs cursor-pointer"
            title="Reset Font Size"
          >
            <RotateCcw className="w-2.5 h-2.5 stroke-[3]" />
          </button>
        )}
      </div>
    );
  }

  // Default Light Mode / Standard
  return (
    <div className={`inline-flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--card-bg)]/95 border-2 border-[var(--card-border)] shadow-sm text-[var(--text-primary)] backdrop-blur-md select-none ${className}`}>
      {showLabel && (
        <span className="text-[10px] font-black uppercase tracking-wider px-1.5 text-[var(--text-muted)] hidden sm:inline-block">
          Text Size
        </span>
      )}

      <button
        type="button"
        onClick={decrease}
        disabled={isMin}
        className="h-7 px-2.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] active:bg-[var(--card-border)] disabled:opacity-30 disabled:hover:bg-[var(--bg-secondary)] disabled:cursor-not-allowed text-[var(--text-primary)] font-black text-xs transition-all cursor-pointer flex items-center justify-center border border-[var(--card-border)]"
        title="Decrease MCQ Font Size (A−)"
      >
        A−
      </button>

      <span className="text-[11px] font-black text-[var(--theme-accent)] min-w-[38px] text-center px-0.5">
        {percentage}
      </span>

      <button
        type="button"
        onClick={increase}
        disabled={isMax}
        className="h-7 px-2.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] active:bg-[var(--card-border)] disabled:opacity-30 disabled:hover:bg-[var(--bg-secondary)] disabled:cursor-not-allowed text-[var(--text-primary)] font-black text-xs transition-all cursor-pointer flex items-center justify-center border border-[var(--card-border)]"
        title="Increase MCQ Font Size (A+)"
      >
        A+
      </button>

      {isModified && (
        <button
          type="button"
          onClick={reset}
          className="h-7 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black text-[10px] sm:text-xs transition-all cursor-pointer flex items-center gap-1 shadow-xs ml-0.5"
          title="Reset Font Size to Default (100%)"
        >
          <RotateCcw className="w-3 h-3 stroke-[3]" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      )}
    </div>
  );
};
