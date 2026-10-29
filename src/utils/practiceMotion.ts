/**
 * Utilities and Configuration for Premium Hero Transition Effects
 * and 3D Flashcard Flip Effects in MCQ Practice and Current Affairs screens.
 */

export type PracticeAnimationStyle = '3d-flip' | 'hero-slide' | 'fade-scale' | 'minimal';

export interface PracticeMotionConfig {
  style: PracticeAnimationStyle;
  enable3dDepth: boolean;
  isFlashcardMode: boolean; // MCQ or Current Affairs 3D Flashcard Flip Mode
  reducedMotion: boolean; // For low-end Android or accessibility
}

export const DEFAULT_MOTION_CONFIG: PracticeMotionConfig = {
  style: 'fade-scale',
  enable3dDepth: false,
  isFlashcardMode: false,
  reducedMotion: false,
};

const STORAGE_KEY = 'aspirant_practice_motion_config';
const EVENT_NAME = 'aspirant_practice_motion_changed';

export function getSavedMotionConfig(): PracticeMotionConfig {
  if (typeof window === 'undefined') return DEFAULT_MOTION_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Check system preference
      const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        return { ...DEFAULT_MOTION_CONFIG, style: 'minimal', reducedMotion: true };
      }
      return DEFAULT_MOTION_CONFIG;
    }
    const parsed = JSON.parse(raw);
    return {
      style: ['3d-flip', 'hero-slide', 'fade-scale', 'minimal'].includes(parsed.style) ? parsed.style : 'fade-scale',
      enable3dDepth: typeof parsed.enable3dDepth === 'boolean' ? parsed.enable3dDepth : false,
      isFlashcardMode: typeof parsed.isFlashcardMode === 'boolean' ? parsed.isFlashcardMode : false,
      reducedMotion: typeof parsed.reducedMotion === 'boolean' ? parsed.reducedMotion : false,
    };
  } catch (e) {
    return DEFAULT_MOTION_CONFIG;
  }
}

export function saveMotionConfig(config: Partial<PracticeMotionConfig>): PracticeMotionConfig {
  const current = getSavedMotionConfig();
  const updated: PracticeMotionConfig = { ...current, ...config };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
    } catch (e) {
      console.warn('Failed to save motion config:', e);
    }
  }
  return updated;
}

/**
 * Returns Framer Motion animation variants tailored to the chosen style and direction.
 * Ensures 0ms latency for answering options and clean transition between cards.
 */
export function getQuestionMotionVariants(
  style: PracticeAnimationStyle,
  slideDir: number = 1,
  reducedMotion: boolean = false
) {
  if (reducedMotion || style === 'minimal') {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.08, ease: 'linear' },
    };
  }

  if (style === 'hero-slide') {
    return {
      initial: {
        opacity: 0,
        x: slideDir * 40,
        scale: 0.98,
      },
      animate: {
        opacity: 1,
        x: 0,
        scale: 1,
      },
      exit: {
        opacity: 0,
        x: slideDir * -40,
        scale: 0.98,
      },
      transition: {
        duration: 0.22,
        ease: [0.16, 1, 0.3, 1], // Fluid cubic bezier spring
      },
    };
  }

  if (style === 'fade-scale') {
    return {
      initial: {
        opacity: 0,
        scale: 0.98,
        y: 6,
      },
      animate: {
        opacity: 1,
        scale: 1,
        y: 0,
      },
      exit: {
        opacity: 0,
        scale: 0.98,
        y: -6,
      },
      transition: {
        duration: 0.18,
        ease: 'easeOut',
      },
    };
  }

  // Smooth 2D page-turn entrance/exit (avoids 3D plane intersection artifacts on mobile GPUs)
  return {
    initial: {
      opacity: 0,
      x: slideDir > 0 ? 28 : -28,
      scale: 0.98,
    },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
    },
    exit: {
      opacity: 0,
      x: slideDir > 0 ? -28 : 28,
      scale: 0.98,
    },
    transition: {
      duration: 0.22,
      ease: [0.22, 1, 0.36, 1],
    },
  };
}
