export type FontFamilyId = 
  | 'default'
  | 'academic-serif'
  | 'dyslexic'
  | 'tech-mono'
  | 'poppins';

export type FontSizeScale = 'small' | 'default' | 'medium' | 'large' | 'xlarge';
export type FontWeightPreference = 'regular' | 'medium' | 'bold';
export type LineHeightScale = 'compact' | 'normal' | 'relaxed' | 'spacious';

export interface FontPreset {
  id: FontFamilyId;
  name: string;
  nativeName: string;
  description: string;
  tag: string;
  fontFamilyCSS: string;
  sampleEn: string;
  recommendedFor: string;
}

export type LanguageDisplayMode = 'english';

export interface FontSettings {
  fontFamily: FontFamilyId;
  fontSize: FontSizeScale;
  fontWeight: FontWeightPreference;
  lineHeight: LineHeightScale;
  highContrastText: boolean;
  languageMode: LanguageDisplayMode;
}

export const FONT_PRESETS: FontPreset[] = [
  {
    id: 'default',
    name: 'Modern Sans (Plus Jakarta)',
    nativeName: 'Plus Jakarta Sans',
    description: 'Clean, contemporary UI typography with supreme readability on screens.',
    tag: 'Standard Default',
    fontFamilyCSS: "'Plus Jakarta Sans', 'Noto Sans Telugu', system-ui, -apple-system, sans-serif",
    sampleEn: 'Which Article of the Constitution deals with the Election Commission?',
    recommendedFor: 'General Studies & Fast UI Navigation'
  },
  {
    id: 'academic-serif',
    name: 'Academic Book Serif (Merriweather)',
    nativeName: 'Merriweather Serif',
    description: 'Classical editorial serif font mimicking standard reference textbooks and government gazettes.',
    tag: 'Long Reading',
    fontFamilyCSS: "'Merriweather', 'Noto Sans Telugu', Georgia, serif",
    sampleEn: 'The Ryotwari system was introduced in Madras Presidency by Thomas Munro.',
    recommendedFor: 'History, Polity & Descriptive Reading'
  },
  {
    id: 'dyslexic',
    name: 'Hyper-Legible (Atkinson)',
    nativeName: 'Atkinson Hyperlegible',
    description: 'Specially crafted for low eye strain and distinct character recognition (O vs 0, I vs l vs 1).',
    tag: 'Zero Eye-Strain',
    fontFamilyCSS: "'Atkinson Hyperlegible', 'Plus Jakarta Sans', 'Noto Sans Telugu', system-ui, sans-serif",
    sampleEn: 'Calculate the compound interest on ₹10,000 for 2 years at 10% per annum.',
    recommendedFor: 'Aspirants studying long continuous hours'
  },
  {
    id: 'poppins',
    name: 'Modern Geometric (Poppins)',
    nativeName: 'Poppins Sans',
    description: 'Balanced circular curves creating a friendly, ultra-smooth visual aesthetic.',
    tag: 'Soft Modern',
    fontFamilyCSS: "'Poppins', 'Noto Sans Telugu', system-ui, sans-serif",
    sampleEn: 'What is the full form of NITI in NITI Aayog?',
    recommendedFor: 'Current Affairs & Daily General Knowledge'
  },
  {
    id: 'tech-mono',
    name: 'Precision Mono (JetBrains)',
    nativeName: 'JetBrains Mono',
    description: 'Fixed-width numbers and structured glyphs perfect for arithmetic, data interpretation & science.',
    tag: 'Math & Reasoning',
    fontFamilyCSS: "'JetBrains Mono', 'Noto Sans Telugu', monospace",
    sampleEn: 'If A:B = 3:4 and B:C = 8:9, find A:C.',
    recommendedFor: 'Quantitative Aptitude, Mental Ability & Science'
  }
];

export const DEFAULT_FONT_SETTINGS: FontSettings = {
  fontFamily: 'default',
  fontSize: 'default',
  fontWeight: 'regular',
  lineHeight: 'normal',
  highContrastText: false,
  languageMode: 'english',
};

const STORAGE_KEY = 'aspirant_font_settings';

export function getSavedFontSettings(): FontSettings {
  if (typeof window === 'undefined') return DEFAULT_FONT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Clean up legacy font families if any
      let fontFam = parsed.fontFamily;
      if (fontFam === 'telugu-clarity' || fontFam === 'telugu-bold') {
        fontFam = 'default';
      }
      return {
        ...DEFAULT_FONT_SETTINGS,
        ...parsed,
        fontFamily: fontFam,
        languageMode: 'english',
      };
    }
  } catch (e) {
    console.error('Error reading font settings:', e);
  }
  return DEFAULT_FONT_SETTINGS;
}

export function saveFontSettings(settings: FontSettings): void {
  if (typeof window === 'undefined') return;
  try {
    const cleanSettings = {
      ...settings,
      languageMode: 'english' as const,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanSettings));
    applyFontSettingsToDOM(cleanSettings);
  } catch (e) {
    console.error('Error saving font settings:', e);
  }
}

export function applyFontSettingsToDOM(settings: FontSettings): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const body = document.body;

  // 1. Remove previous font family classes
  FONT_PRESETS.forEach(preset => {
    root.classList.remove(`font-family-${preset.id}`);
    body.classList.remove(`font-family-${preset.id}`);
  });
  root.classList.remove('font-family-telugu-clarity');
  root.classList.remove('font-family-telugu-bold');
  root.classList.remove('telugu-enhanced');

  root.classList.add(`font-family-${settings.fontFamily}`);
  body.classList.add(`font-family-${settings.fontFamily}`);

  // Apply custom CSS variable for font-family
  const activePreset = FONT_PRESETS.find(p => p.id === settings.fontFamily) || FONT_PRESETS[0];
  root.style.setProperty('--app-font-family', activePreset.fontFamilyCSS);
  body.style.fontFamily = activePreset.fontFamilyCSS;

  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.style.fontFamily = activePreset.fontFamilyCSS;
  }

  // 2. Remove & apply font size classes
  ['small', 'default', 'medium', 'large', 'xlarge'].forEach(scale => {
    root.classList.remove(`font-scale-${scale}`);
  });
  root.classList.add(`font-scale-${settings.fontSize}`);

  // 3. Remove & apply line-height classes
  ['compact', 'normal', 'relaxed', 'spacious'].forEach(lh => {
    root.classList.remove(`line-height-${lh}`);
  });
  root.classList.add(`line-height-${settings.lineHeight}`);

  // 4. Remove & apply font weight
  ['regular', 'medium', 'bold'].forEach(fw => {
    root.classList.remove(`font-weight-${fw}`);
  });
  root.classList.add(`font-weight-${settings.fontWeight}`);

  // 5. High contrast text
  if (settings.highContrastText) {
    root.classList.add('high-contrast-text');
  } else {
    root.classList.remove('high-contrast-text');
  }

  // 6. Question Language display attribute
  root.setAttribute('data-question-lang', 'english');

  // Trigger custom event so any active component (like PracticeArena) can re-render immediately
  try {
    window.dispatchEvent(new CustomEvent('aspirant_font_settings_changed', { detail: settings }));
  } catch (e) {
    // Ignore in non-browser environments
  }
}
