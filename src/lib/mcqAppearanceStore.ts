import { useState, useEffect } from 'react';

export interface McqAppearanceSettings {
  questionBg: string;
  questionText: string;
  optionsBg: string;
  optionsText: string;
  explanationBg: string;
  explanationText: string;
  accentColor: string;
}

export interface McqAppearancePreset {
  id: string;
  name: string;
  settings: McqAppearanceSettings;
}

export const DEFAULT_MCQ_APPEARANCE: McqAppearanceSettings = {
  questionBg: 'linear-gradient(to right, #ff5a43, #ff6f44, #ff9147)',
  questionText: '#ffffff',
  optionsBg: '#F3E5F5',
  optionsText: '#4a148c',
  explanationBg: 'linear-gradient(to bottom right, #fffdf7, #fef9eb, #fbf0d3)',
  explanationText: '#0f172a',
  accentColor: '#4f46e5',
};

export const MCQ_APPEARANCE_PRESETS: McqAppearancePreset[] = [
  {
    id: 'default',
    name: 'Classic Pro',
    settings: DEFAULT_MCQ_APPEARANCE,
  },
  {
    id: 'premium-gold',
    name: 'Premium Gold',
    settings: {
      questionBg: 'linear-gradient(to right, #B8860B, #D4AF37, #F3E5AB)',
      questionText: '#1c1917',
      optionsBg: '#FFFDF0',
      optionsText: '#78350f',
      explanationBg: 'linear-gradient(to bottom right, #FFFCF0, #FEF9C3, #FEF08A)',
      explanationText: '#451a03',
      accentColor: '#D4AF37',
    },
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    settings: {
      questionBg: 'linear-gradient(to right, #0F4C81, #1E3A8A, #2563EB)',
      questionText: '#ffffff',
      optionsBg: '#EFF6FF',
      optionsText: '#1E3A8A',
      explanationBg: 'linear-gradient(to bottom right, #F0F9FF, #E0F2FE, #BAE6FD)',
      explanationText: '#0C4A6E',
      accentColor: '#2563EB',
    },
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    settings: {
      questionBg: 'linear-gradient(to right, #14532D, #166534, #15803D)',
      questionText: '#ffffff',
      optionsBg: '#F0FDF4',
      optionsText: '#14532D',
      explanationBg: 'linear-gradient(to bottom right, #F0FDF4, #DCFCE7, #BBF7D0)',
      explanationText: '#064E3B',
      accentColor: '#16A34A',
    },
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    settings: {
      questionBg: 'linear-gradient(to right, #581C87, #6B21A8, #7E22CE)',
      questionText: '#ffffff',
      optionsBg: '#FAF5FF',
      optionsText: '#581C87',
      explanationBg: 'linear-gradient(to bottom right, #FAF5FF, #F3E8FF, #E9D5FF)',
      explanationText: '#3B0764',
      accentColor: '#9333EA',
    },
  },
  {
    id: 'rose-pink',
    name: 'Rose Pink',
    settings: {
      questionBg: 'linear-gradient(to right, #881337, #9F1239, #BE123C)',
      questionText: '#ffffff',
      optionsBg: '#FFF1F2',
      optionsText: '#881337',
      explanationBg: 'linear-gradient(to bottom right, #FFF1F2, #FFE4E6, #FECDD3)',
      explanationText: '#4C0519',
      accentColor: '#E11D48',
    },
  },
  {
    id: 'minimal-white',
    name: 'Minimal White',
    settings: {
      questionBg: '#FFFFFF',
      questionText: '#0F172A',
      optionsBg: '#F8FAFC',
      optionsText: '#1E293B',
      explanationBg: '#F1F5F9',
      explanationText: '#0F172A',
      accentColor: '#0EA5E9',
    },
  },
  {
    id: 'dark-mode',
    name: 'Dark Mode',
    settings: {
      questionBg: '#0F172A',
      questionText: '#F8FAFC',
      optionsBg: '#1E293B',
      optionsText: '#E2E8F0',
      explanationBg: '#131B2E',
      explanationText: '#F1F5F9',
      accentColor: '#6366F1',
    },
  },
  {
    id: 'soft-pastel',
    name: 'Soft Pastel',
    settings: {
      questionBg: 'linear-gradient(to right, #FCE7F3, #F3E8FF, #E0E7FF)',
      questionText: '#3730A3',
      optionsBg: '#FDF4FF',
      optionsText: '#701A75',
      explanationBg: 'linear-gradient(to bottom right, #FEFCE8, #FEF9C3, #FEF08A)',
      explanationText: '#713F12',
      accentColor: '#C084FC',
    },
  },
];

const STORAGE_KEY = 'aspirant_mcq_appearance';
const CUSTOM_EVENT_NAME = 'aspirant_mcq_appearance_changed';

export function getSavedMcqAppearance(): McqAppearanceSettings {
  if (typeof window === 'undefined') return DEFAULT_MCQ_APPEARANCE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading MCQ appearance:', e);
  }
  return DEFAULT_MCQ_APPEARANCE;
}

export function saveMcqAppearance(settings: McqAppearanceSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    // Apply as CSS variables for non-react usage or global styles
    const root = document.documentElement;
    root.style.setProperty('--mcq-q-bg', settings.questionBg);
    root.style.setProperty('--mcq-q-text', settings.questionText);
    root.style.setProperty('--mcq-o-bg', settings.optionsBg);
    root.style.setProperty('--mcq-o-text', settings.optionsText);
    root.style.setProperty('--mcq-e-bg', settings.explanationBg);
    root.style.setProperty('--mcq-e-text', settings.explanationText);
    root.style.setProperty('--mcq-accent', settings.accentColor);
    
    window.dispatchEvent(new CustomEvent(CUSTOM_EVENT_NAME, { detail: settings }));
  } catch (e) {
    console.error('Error saving MCQ appearance:', e);
  }
}

export function useMcqAppearance() {
  const [settings, setSettingsState] = useState<McqAppearanceSettings>(getSavedMcqAppearance);

  useEffect(() => {
    const handleChanged = (e: Event) => {
      const customEvent = e as CustomEvent<McqAppearanceSettings>;
      if (customEvent.detail) {
        setSettingsState(customEvent.detail);
      } else {
        setSettingsState(getSavedMcqAppearance());
      }
    };

    window.addEventListener(CUSTOM_EVENT_NAME, handleChanged);
    
    // Apply variables on mount
    const current = getSavedMcqAppearance();
    const root = document.documentElement;
    root.style.setProperty('--mcq-q-bg', current.questionBg);
    root.style.setProperty('--mcq-q-text', current.questionText);
    root.style.setProperty('--mcq-o-bg', current.optionsBg);
    root.style.setProperty('--mcq-o-text', current.optionsText);
    root.style.setProperty('--mcq-e-bg', current.explanationBg);
    root.style.setProperty('--mcq-e-text', current.explanationText);
    root.style.setProperty('--mcq-accent', current.accentColor);

    return () => {
      window.removeEventListener(CUSTOM_EVENT_NAME, handleChanged);
    };
  }, []);

  const updateSetting = (newSettings: Partial<McqAppearanceSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettingsState(updated);
    saveMcqAppearance(updated);
  };

  const resetToDefault = () => {
    setSettingsState(DEFAULT_MCQ_APPEARANCE);
    saveMcqAppearance(DEFAULT_MCQ_APPEARANCE);
  };

  const applyPreset = (presetId: string) => {
    const preset = MCQ_APPEARANCE_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSettingsState(preset.settings);
      saveMcqAppearance(preset.settings);
    }
  };

  return {
    settings,
    updateSetting,
    resetToDefault,
    applyPreset,
    presets: MCQ_APPEARANCE_PRESETS,
  };
}
