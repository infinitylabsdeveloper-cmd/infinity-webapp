/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppThemeId = 'default' | 'sahara' | 'candy' | 'silk' | 'emerald' | 'midnight' | 'cyberpunk' | 'nordic';

export interface ThemeConfig {
  id: AppThemeId;
  name: string;
  tagline: string;
  description: string;
  primaryColor: string;
  accentGradient: string;
  cardGlow: string;
  previewClass: string;
  bgHex: string;
  cardHex: string;
  accentHex: string;
  tag: string;
  badgeColor: string;
  isPremium?: boolean;
}

export const THEME_PRESETS: ThemeConfig[] = [
  {
    id: 'default',
    name: 'Indigo Aura',
    tagline: 'Modern High-Contrast',
    description: 'Crisp corporate ultramarine paired with high-contrast neutral slate for sharp visual clarity.',
    primaryColor: '#4f46e5',
    accentGradient: 'from-indigo-600 via-blue-600 to-indigo-700',
    cardGlow: 'rgba(79, 70, 229, 0.15)',
    previewClass: 'bg-gradient-to-br from-indigo-500 to-blue-700',
    bgHex: '#f8fafc',
    cardHex: '#ffffff',
    accentHex: '#4f46e5',
    tag: 'Classic',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-200'
  },
  {
    id: 'sahara',
    name: 'Sahara Sunset',
    tagline: 'Warm Amber & Terracotta',
    description: 'Golden desert sunlight, warm terracotta tones, and radiant amber hues designed for soothing day-long focus.',
    primaryColor: '#d97706',
    accentGradient: 'from-amber-500 via-orange-500 to-yellow-600',
    cardGlow: 'rgba(217, 119, 6, 0.22)',
    previewClass: 'bg-gradient-to-br from-amber-500 via-orange-600 to-yellow-600',
    bgHex: '#fffbeb',
    cardHex: '#ffffff',
    accentHex: '#d97706',
    tag: 'Popular',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  {
    id: 'candy',
    name: 'Candy Dream',
    tagline: 'Berry Pink & Peach Sweetness',
    description: 'Playful cotton candy pinks, sweet peach highlights, and vibrant berry accents for an energetic study flow.',
    primaryColor: '#ec4899',
    accentGradient: 'from-pink-500 via-rose-500 to-fuchsia-600',
    cardGlow: 'rgba(236, 72, 153, 0.25)',
    previewClass: 'bg-gradient-to-br from-pink-400 via-rose-500 to-fuchsia-600',
    bgHex: '#fdf2f8',
    cardHex: '#ffffff',
    accentHex: '#ec4899',
    tag: 'Vibrant',
    badgeColor: 'bg-pink-100 text-pink-900 border-pink-300'
  },
  {
    id: 'silk',
    name: 'Silk & Pearl',
    tagline: 'Luxury Champagne Satin',
    description: 'Ultra-luxurious champagne satin, soft blush rose undertones, and delicate glass borders for refined elegance.',
    primaryColor: '#a855f7',
    accentGradient: 'from-rose-400 via-purple-400 to-amber-300',
    cardGlow: 'rgba(168, 85, 247, 0.2)',
    previewClass: 'bg-gradient-to-br from-amber-200 via-rose-300 to-purple-400',
    bgHex: '#faf5ff',
    cardHex: '#ffffff',
    accentHex: '#9333ea',
    tag: 'Luxury',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300'
  },
  {
    id: 'emerald',
    name: 'Emerald Forest',
    tagline: 'Botanical Pine & Mint Jade',
    description: 'Regal deep forest greens and refreshing mint highlights inspired by calm nature landscapes.',
    primaryColor: '#059669',
    accentGradient: 'from-emerald-500 via-teal-600 to-green-700',
    cardGlow: 'rgba(5, 150, 105, 0.22)',
    previewClass: 'bg-gradient-to-br from-emerald-500 via-teal-600 to-green-700',
    bgHex: '#ecfdf5',
    cardHex: '#ffffff',
    accentHex: '#059669',
    tag: 'Natural',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  },
  {
    id: 'midnight',
    name: 'Midnight Velvet',
    tagline: 'Royal Iris & Soft Lavender',
    description: 'Opulent soft lavender white and royal iris accents with refined contrast for comfortable reading.',
    primaryColor: '#6366f1',
    accentGradient: 'from-indigo-500 via-purple-500 to-violet-600',
    cardGlow: 'rgba(99, 102, 241, 0.15)',
    previewClass: 'bg-gradient-to-br from-indigo-100 via-purple-100 to-violet-200',
    bgHex: '#f5f3ff',
    cardHex: '#ffffff',
    accentHex: '#6366f1',
    tag: 'Velvet',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-200'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    tagline: 'Electric Cyan & Ice Blue',
    description: 'Energetic ice blue and crisp cyan accents on pearl white backgrounds.',
    primaryColor: '#0284c7',
    accentGradient: 'from-cyan-500 via-blue-500 to-sky-600',
    cardGlow: 'rgba(6, 182, 212, 0.15)',
    previewClass: 'bg-gradient-to-br from-cyan-100 via-blue-100 to-sky-200',
    bgHex: '#ecfeff',
    cardHex: '#ffffff',
    accentHex: '#0284c7',
    tag: 'Futuristic',
    badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-200'
  },
  {
    id: 'nordic',
    name: 'Nordic Frost',
    tagline: 'Icy Arctic & Cool Minimal',
    description: 'Crisp glacial blue tones, clean negative space, and Scandinavian minimalist aesthetics.',
    primaryColor: '#0284c7',
    accentGradient: 'from-sky-400 via-blue-500 to-cyan-600',
    cardGlow: 'rgba(2, 132, 199, 0.2)',
    previewClass: 'bg-gradient-to-br from-sky-300 via-blue-400 to-indigo-500',
    bgHex: '#f0f9ff',
    cardHex: '#ffffff',
    accentHex: '#0284c7',
    tag: 'Minimal',
    badgeColor: 'bg-sky-100 text-sky-900 border-sky-300'
  }
];

export const applyGlobalTheme = (themeId: AppThemeId) => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const body = document.body;

  // Remove previous theme classes
  THEME_PRESETS.forEach(t => {
    root.classList.remove(`theme-${t.id}`);
    body.classList.remove(`theme-${t.id}`);
  });

  // Add new theme class
  root.classList.add(`theme-${themeId}`);
  body.classList.add(`theme-${themeId}`);

  // Save to localStorage
  try {
    localStorage.setItem('aspirant_app_theme', themeId);
  } catch (e) {
    console.error('Failed to save theme to localStorage', e);
  }
};

export const getSavedTheme = (): AppThemeId => {
  if (typeof localStorage === 'undefined') return 'default';
  const saved = localStorage.getItem('aspirant_app_theme') as AppThemeId;
  if (saved && THEME_PRESETS.some(t => t.id === saved)) {
    return saved;
  }
  return 'default';
};
