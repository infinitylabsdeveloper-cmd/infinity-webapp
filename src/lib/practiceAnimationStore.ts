import { useState, useEffect } from 'react';

export type PracticeAnimationStyle = '3d-flip' | 'hero-slide' | 'fade-scale' | 'reduced';

export interface PracticeAnimationSettings {
  style: PracticeAnimationStyle;
  flashcardMode: boolean; // 3D Flashcard Mode for active recall
  depthEffects: boolean; // Subtle 3D tilt & perspective depth shadows
  soundEffects?: boolean;
}

const STORAGE_KEY = 'aspirant_practice_animation_settings';

export const DEFAULT_ANIMATION_SETTINGS: PracticeAnimationSettings = {
  style: 'hero-slide',
  flashcardMode: false,
  depthEffects: true,
};

export const ANIMATION_STYLE_OPTIONS: {
  id: PracticeAnimationStyle;
  label: string;
  shortLabel: string;
  iconName: string;
  description: string;
}[] = [
  {
    id: 'hero-slide',
    label: 'Hero Depth Slide',
    shortLabel: 'Hero Slide',
    iconName: 'Sparkles',
    description: 'Smooth spring slide with spatial depth scaling and elastic curves',
  },
  {
    id: '3d-flip',
    label: '3D Flashcard Flip',
    shortLabel: '3D Flip',
    iconName: 'Rotate3D',
    description: 'Realistic 3D perspective rotation with preserve-3d spatial depth',
  },
  {
    id: 'fade-scale',
    label: 'Elevate & Fade',
    shortLabel: 'Elevate',
    iconName: 'Layers',
    description: 'Gentle vertical elevation zoom with subtle backdrop depth',
  },
  {
    id: 'reduced',
    label: 'Reduced Motion (Fast)',
    shortLabel: 'Reduced',
    iconName: 'Zap',
    description: 'Instant zero-lag transitions optimized for low-end devices and battery saving',
  },
];

export function getSavedAnimationSettings(): PracticeAnimationSettings {
  if (typeof window === 'undefined') return DEFAULT_ANIMATION_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ANIMATION_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      style: ['3d-flip', 'hero-slide', 'fade-scale', 'reduced'].includes(parsed.style)
        ? parsed.style
        : DEFAULT_ANIMATION_SETTINGS.style,
      flashcardMode: Boolean(parsed.flashcardMode),
      depthEffects: parsed.depthEffects !== false,
    };
  } catch (e) {
    return DEFAULT_ANIMATION_SETTINGS;
  }
}

export function saveAnimationSettings(settings: Partial<PracticeAnimationSettings>): PracticeAnimationSettings {
  const current = getSavedAnimationSettings();
  const updated: PracticeAnimationSettings = { ...current, ...settings };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('aspirant_animation_settings_changed', { detail: updated }));
  } catch (e) {
    console.warn('Failed to save animation settings:', e);
  }
  return updated;
}

export function usePracticeAnimation() {
  const [settings, setSettings] = useState<PracticeAnimationSettings>(getSavedAnimationSettings);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e?.detail) {
        setSettings(e.detail);
      } else {
        setSettings(getSavedAnimationSettings());
      }
    };

    window.addEventListener('aspirant_animation_settings_changed', handleUpdate);
    return () => window.removeEventListener('aspirant_animation_settings_changed', handleUpdate);
  }, []);

  const setStyle = (style: PracticeAnimationStyle) => {
    const updated = saveAnimationSettings({ style });
    setSettings(updated);
  };

  const toggleFlashcardMode = () => {
    const updated = saveAnimationSettings({ flashcardMode: !settings.flashcardMode });
    setSettings(updated);
  };

  const setFlashcardMode = (val: boolean) => {
    const updated = saveAnimationSettings({ flashcardMode: val });
    setSettings(updated);
  };

  const toggleDepthEffects = () => {
    const updated = saveAnimationSettings({ depthEffects: !settings.depthEffects });
    setSettings(updated);
  };

  return {
    settings,
    setStyle,
    toggleFlashcardMode,
    setFlashcardMode,
    toggleDepthEffects,
    is3D: settings.style === '3d-flip' || settings.flashcardMode,
    isReduced: settings.style === 'reduced',
  };
}
