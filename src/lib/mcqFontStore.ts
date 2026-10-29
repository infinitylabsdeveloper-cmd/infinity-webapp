import { useState, useEffect } from 'react';

// MCQ Font Scale steps
// Step 0 is Default (100% / Reset)
export interface McqFontStepConfig {
  step: number;
  scale: number;
  label: string;
  percentage: string;
}

export const MIN_MCQ_FONT_STEP = -3;
export const MAX_MCQ_FONT_STEP = 6;

export const MCQ_FONT_STEPS: Record<number, McqFontStepConfig> = {
  '-3': { step: -3, scale: 0.70, label: 'Minimum', percentage: '70%' },
  '-2': { step: -2, scale: 0.80, label: 'Compact', percentage: '80%' },
  '-1': { step: -1, scale: 0.90, label: 'Small', percentage: '90%' },
  '0':  { step: 0,  scale: 1.00, label: 'Default', percentage: '100%' },
  '1':  { step: 1,  scale: 1.10, label: 'Medium', percentage: '110%' },
  '2':  { step: 2,  scale: 1.25, label: 'Large', percentage: '125%' },
  '3':  { step: 3,  scale: 1.40, label: 'Extra Large', percentage: '140%' },
  '4':  { step: 4,  scale: 1.60, label: 'Huge', percentage: '160%' },
  '5':  { step: 5,  scale: 1.80, label: 'Super', percentage: '180%' },
  '6':  { step: 6,  scale: 2.00, label: 'Maximum', percentage: '200%' },
};

const STORAGE_KEY = 'aspirant_mcq_font_step';
const CUSTOM_EVENT_NAME = 'aspirant_mcq_font_step_changed';

export function getMcqFontStep(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed >= MIN_MCQ_FONT_STEP && parsed <= MAX_MCQ_FONT_STEP) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading MCQ font step:', e);
  }
  return 0;
}

export function setMcqFontStep(step: number): void {
  if (typeof window === 'undefined') return;
  const validStep = Math.max(MIN_MCQ_FONT_STEP, Math.min(MAX_MCQ_FONT_STEP, step));
  try {
    localStorage.setItem(STORAGE_KEY, String(validStep));
  } catch (e) {
    console.error('Error saving MCQ font step:', e);
  }

  const config = MCQ_FONT_STEPS[validStep] || MCQ_FONT_STEPS[0];
  
  // Set CSS variable on root for global stylesheet access
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--mcq-font-scale', String(config.scale));
  }

  // Dispatch custom event for React components
  try {
    window.dispatchEvent(new CustomEvent(CUSTOM_EVENT_NAME, { detail: { step: validStep, config } }));
  } catch (e) {
    // ignore
  }
}

export function resetMcqFontStep(): void {
  setMcqFontStep(0);
}

export function increaseMcqFontStep(): void {
  const current = getMcqFontStep();
  setMcqFontStep(current + 1);
}

export function decreaseMcqFontStep(): void {
  const current = getMcqFontStep();
  setMcqFontStep(current - 1);
}

// React Hook for instant reactive updates across components
export function useMcqFontSize() {
  const [step, setStepState] = useState<number>(getMcqFontStep);

  useEffect(() => {
    const handleChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ step: number }>;
      if (customEvent.detail && typeof customEvent.detail.step === 'number') {
        setStepState(customEvent.detail.step);
      } else {
        setStepState(getMcqFontStep());
      }
    };

    window.addEventListener(CUSTOM_EVENT_NAME, handleChanged);
    // Apply current CSS variable on mount
    const initialConfig = MCQ_FONT_STEPS[step] || MCQ_FONT_STEPS[0];
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--mcq-font-scale', String(initialConfig.scale));
    }

    return () => {
      window.removeEventListener(CUSTOM_EVENT_NAME, handleChanged);
    };
  }, [step]);

  const config = MCQ_FONT_STEPS[step] || MCQ_FONT_STEPS[0];

  return {
    step,
    scale: config.scale,
    percentage: config.percentage,
    label: config.label,
    isModified: step !== 0,
    isMin: step <= MIN_MCQ_FONT_STEP,
    isMax: step >= MAX_MCQ_FONT_STEP,
    increase: increaseMcqFontStep,
    decrease: decreaseMcqFontStep,
    reset: resetMcqFontStep,
    setStep: setMcqFontStep,
    // Stable inline style generator for MCQ text scaling with robust line height & word break
    scaledTextStyle: {
      fontSize: `calc(1rem * var(--mcq-font-scale, ${config.scale}))`,
      lineHeight: 1.6,
      wordBreak: 'break-word',
      overflowWrap: 'anywhere',
    } as React.CSSProperties,
  };
}
