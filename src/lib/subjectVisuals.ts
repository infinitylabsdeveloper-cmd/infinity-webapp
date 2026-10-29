import React, { useState } from 'react';

export interface BrightCardTheme {
  id: string;
  name: string;
  cardBgHex: string;
  cardBgClass: string;
  bodyBgClass: string;
  borderClass: string;
  badgeBgClass: string;
  badgeTextClass: string;
  mcqPillClass: string;
  metaPillClass: string;
  titleColorClass: string;
  subtitleColorClass: string;
  ctaGradientClass: string;
  accentBarClass: string;
}

/**
 * Bright, pleasant, daylight-first card themes (Sky Blue, Emerald Green, Soft Teal,
 * Pink/Rose, Peach, Warm Ivory, Lavender, Royal Champagne).
 * Never uses black, dark-gray, or charcoal card surfaces.
 */
export const BRIGHT_CARD_THEMES: Record<string, BrightCardTheme> = {
  sky: {
    id: 'sky',
    name: 'Sapphire Sky',
    cardBgHex: '#DCEBFF',
    cardBgClass: 'bg-[#EEF6FF]',
    bodyBgClass: 'bg-gradient-to-b from-[#F5FAFF] via-[#DCEBFF]/85 to-[#DCEBFF]',
    borderClass: 'border-sky-300/90 hover:border-sky-500',
    badgeBgClass: 'bg-sky-600 text-white border-white/50',
    badgeTextClass: 'text-sky-950',
    mcqPillClass: 'bg-[#FFF8E7]/95 text-[#1E1B4B] border-sky-300',
    metaPillClass: 'bg-white/90 text-[#1E1B4B] border-sky-300/80',
    titleColorClass: 'text-[#1E1B4B] group-hover:text-sky-800',
    subtitleColorClass: 'text-slate-700',
    ctaGradientClass: 'from-sky-600 via-blue-600 to-indigo-600 text-white',
    accentBarClass: 'from-sky-400 to-blue-600',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Mint',
    cardBgHex: '#D9FBE8',
    cardBgClass: 'bg-[#EDFCF4]',
    bodyBgClass: 'bg-gradient-to-b from-[#F4FDF8] via-[#D9FBE8]/85 to-[#D9FBE8]',
    borderClass: 'border-emerald-300/90 hover:border-emerald-500',
    badgeBgClass: 'bg-emerald-600 text-white border-white/50',
    badgeTextClass: 'text-emerald-950',
    mcqPillClass: 'bg-[#FFF8E7]/95 text-[#1E1B4B] border-emerald-300',
    metaPillClass: 'bg-white/90 text-[#1E1B4B] border-emerald-300/80',
    titleColorClass: 'text-[#1E1B4B] group-hover:text-emerald-800',
    subtitleColorClass: 'text-slate-700',
    ctaGradientClass: 'from-emerald-600 via-teal-600 to-green-600 text-white',
    accentBarClass: 'from-emerald-400 to-teal-600',
  },
  teal: {
    id: 'teal',
    name: 'Soft Aqua Teal',
    cardBgHex: '#D8F7F5',
    cardBgClass: 'bg-[#ECFCFB]',
    bodyBgClass: 'bg-gradient-to-b from-[#F3FEFD] via-[#D8F7F5]/85 to-[#D8F7F5]',
    borderClass: 'border-teal-300/90 hover:border-teal-500',
    badgeBgClass: 'bg-teal-600 text-white border-white/50',
    badgeTextClass: 'text-teal-950',
    mcqPillClass: 'bg-[#FFF8E7]/95 text-[#1E1B4B] border-teal-300',
    metaPillClass: 'bg-white/90 text-[#1E1B4B] border-teal-300/80',
    titleColorClass: 'text-[#1E1B4B] group-hover:text-teal-800',
    subtitleColorClass: 'text-slate-700',
    ctaGradientClass: 'from-teal-600 via-cyan-600 to-emerald-600 text-white',
    accentBarClass: 'from-teal-400 to-cyan-600',
  },
  rose: {
    id: 'rose',
    name: 'Luxury Rose Pink',
    cardBgHex: '#FFE0EA',
    cardBgClass: 'bg-[#FFF0F5]',
    bodyBgClass: 'bg-gradient-to-b from-[#FFF7FA] via-[#FFE0EA]/85 to-[#FFE0EA]',
    borderClass: 'border-pink-300/90 hover:border-rose-500',
    badgeBgClass: 'bg-rose-600 text-white border-white/50',
    badgeTextClass: 'text-rose-950',
    mcqPillClass: 'bg-[#FFF8E7]/95 text-[#1E1B4B] border-pink-300',
    metaPillClass: 'bg-white/90 text-[#1E1B4B] border-pink-300/80',
    titleColorClass: 'text-[#1E1B4B] group-hover:text-rose-800',
    subtitleColorClass: 'text-slate-700',
    ctaGradientClass: 'from-rose-600 via-pink-600 to-fuchsia-600 text-white',
    accentBarClass: 'from-rose-400 to-pink-600',
  },
  peach: {
    id: 'peach',
    name: 'Peach Pearl',
    cardBgHex: '#FFE4D1',
    cardBgClass: 'bg-[#FFF3EB]',
    bodyBgClass: 'bg-gradient-to-b from-[#FFF9F5] via-[#FFE4D1]/85 to-[#FFE4D1]',
    borderClass: 'border-orange-300/90 hover:border-orange-500',
    badgeBgClass: 'bg-orange-600 text-white border-white/50',
    badgeTextClass: 'text-orange-950',
    mcqPillClass: 'bg-[#FFF8E7]/95 text-[#1E1B4B] border-orange-300',
    metaPillClass: 'bg-white/90 text-[#1E1B4B] border-orange-300/80',
    titleColorClass: 'text-[#1E1B4B] group-hover:text-orange-800',
    subtitleColorClass: 'text-slate-700',
    ctaGradientClass: 'from-orange-500 via-amber-600 to-orange-600 text-white',
    accentBarClass: 'from-orange-400 to-amber-600',
  },
  champagne: {
    id: 'champagne',
    name: 'Royal Champagne',
    cardBgHex: '#FFF1CC',
    cardBgClass: 'bg-[#FFF9E6]',
    bodyBgClass: 'bg-gradient-to-b from-[#FFFCF2] via-[#FFF1CC]/85 to-[#FFF1CC]',
    borderClass: 'border-amber-300/90 hover:border-amber-500',
    badgeBgClass: 'bg-amber-600 text-white border-white/50',
    badgeTextClass: 'text-amber-950',
    mcqPillClass: 'bg-white/95 text-[#1E1B4B] border-amber-300',
    metaPillClass: 'bg-white/90 text-[#1E1B4B] border-amber-300/80',
    titleColorClass: 'text-[#1E1B4B] group-hover:text-amber-800',
    subtitleColorClass: 'text-slate-700',
    ctaGradientClass: 'from-amber-600 via-orange-500 to-amber-700 text-white',
    accentBarClass: 'from-amber-400 to-orange-500',
  },
  lavender: {
    id: 'lavender',
    name: 'Premium Lavender',
    cardBgHex: '#EDE7FF',
    cardBgClass: 'bg-[#F6F3FF]',
    bodyBgClass: 'bg-gradient-to-b from-[#FAF8FF] via-[#EDE7FF]/85 to-[#EDE7FF]',
    borderClass: 'border-violet-300/90 hover:border-violet-500',
    badgeBgClass: 'bg-violet-600 text-white border-white/50',
    badgeTextClass: 'text-violet-950',
    mcqPillClass: 'bg-[#FFF8E7]/95 text-[#1E1B4B] border-violet-300',
    metaPillClass: 'bg-white/90 text-[#1E1B4B] border-violet-300/80',
    titleColorClass: 'text-[#1E1B4B] group-hover:text-violet-800',
    subtitleColorClass: 'text-slate-700',
    ctaGradientClass: 'from-violet-600 via-purple-600 to-indigo-600 text-white',
    accentBarClass: 'from-violet-400 to-purple-600',
  },
  ivory: {
    id: 'ivory',
    name: 'Ivory Pearl',
    cardBgHex: '#FFF8E7',
    cardBgClass: 'bg-[#FFFBF2]',
    bodyBgClass: 'bg-gradient-to-b from-[#FFFFFF] via-[#FFF8E7]/90 to-[#FFF1CC]/70',
    borderClass: 'border-amber-200/90 hover:border-amber-400',
    badgeBgClass: 'bg-indigo-600 text-white border-white/50',
    badgeTextClass: 'text-indigo-950',
    mcqPillClass: 'bg-white/95 text-[#1E1B4B] border-amber-300',
    metaPillClass: 'bg-white/90 text-[#1E1B4B] border-amber-200/90',
    titleColorClass: 'text-[#1E1B4B] group-hover:text-indigo-800',
    subtitleColorClass: 'text-slate-700',
    ctaGradientClass: 'from-indigo-600 via-blue-600 to-sky-600 text-white',
    accentBarClass: 'from-amber-400 to-indigo-500',
  },
};

const THEME_KEYS = Object.keys(BRIGHT_CARD_THEMES);

/**
 * Returns a deterministic bright card theme based on Subject/Unit/Topic name & index
 */
export function getBrightCardTheme(nameOrId: string = '', index: number = 0): BrightCardTheme {
  const n = (nameOrId || '').toLowerCase();
  if (n.includes('geography') || n.includes('river') || n.includes('climate') || n.includes('ocean') || n.includes('water')) {
    return BRIGHT_CARD_THEMES.teal;
  }
  if (n.includes('environment') || n.includes('ecology') || n.includes('biodiversity') || n.includes('forest') || n.includes('agriculture')) {
    return BRIGHT_CARD_THEMES.emerald;
  }
  if (n.includes('history') || n.includes('ancient') || n.includes('medieval') || n.includes('harappa') || n.includes('heritage') || n.includes('vedic')) {
    return BRIGHT_CARD_THEMES.champagne;
  }
  if (n.includes('andhra') || n.includes('telangana') || n.includes('cultural') || n.includes('modern') || n.includes('freedom')) {
    return BRIGHT_CARD_THEMES.peach;
  }
  if (n.includes('polity') || n.includes('constitution') || n.includes('parliament') || n.includes('judiciary') || n.includes('governance') || n.includes('law')) {
    return BRIGHT_CARD_THEMES.sky;
  }
  if (n.includes('economy') || n.includes('economic') || n.includes('budget') || n.includes('banking') || n.includes('finance') || n.includes('fiscal')) {
    return BRIGHT_CARD_THEMES.emerald;
  }
  if (n.includes('science') || n.includes('tech') || n.includes('space') || n.includes('isro') || n.includes('nuclear') || n.includes('defence') || n.includes('computer')) {
    return BRIGHT_CARD_THEMES.lavender;
  }
  if (n.includes('society') || n.includes('social') || n.includes('women') || n.includes('welfare') || n.includes('caste') || n.includes('tribe')) {
    return BRIGHT_CARD_THEMES.rose;
  }
  if (n.includes('mental') || n.includes('reasoning') || n.includes('aptitude') || n.includes('quant') || n.includes('data') || n.includes('math')) {
    return BRIGHT_CARD_THEMES.sky;
  }
  if (n.includes('current') || n.includes('affair') || n.includes('news')) {
    return BRIGHT_CARD_THEMES.ivory;
  }

  return BRIGHT_CARD_THEMES[THEME_KEYS[index % THEME_KEYS.length]];
}

/**
 * Curated Bright Daylight High-Clarity Images for Subjects (Never reused across unrelated subjects)
 */
const SUBJECT_IMAGE_CATALOG: Record<string, string> = {
  // Geography -> Daylight Himalayan mountains, turquoise rivers & lush valleys
  geography: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
  ap_geography: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=80',
  world_geography: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1000&q=80',

  // History -> Sunlit Indian heritage monuments & architecture
  indian_history: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1000&q=80',
  ap_history: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80',
  ts_history: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1000&q=80',
  modern_history: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1000&q=80',

  // Indian Polity -> Classical democratic architecture, civic columns & constitution
  polity: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1000&q=80',
  governance: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1000&q=80',

  // Economy -> Bright financial district, growth analytics, golden harvest & trade
  economy: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
  ap_economy: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1000&q=80',

  // Science & Technology -> Bright space rocket launch, clean tech & research laboratory
  science_tech: 'https://images.unsplash.com/photo-1517976487468-f20514c44f53?auto=format&fit=crop&w=1000&q=80',
  general_science: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80',

  // Environment & Ecology -> Sunlit emerald forest canopy, wildlife & sustainability
  environment: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=80',
  disaster: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80',

  // Indian Society -> Vibrant community, culture & social harmony in daylight
  society: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80',

  // Mental Ability / Aptitude / Reasoning -> Bright analytical geometry & problem solving
  mental_ability: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1000&q=80',

  // Current Affairs -> Global summits, daylight globe & press briefing
  current_affairs: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1000&q=80',

  // Ethics / English / General Studies
  ethics: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1000&q=80',
  english: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1000&q=80',
  general_studies: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1000&q=80',
};

/**
 * Returns a distinct, bright daylight image for a Subject
 */
export function getCuratedSubjectImage(subj: any, index: number = 0): string {
  if (subj?.imageUrl && subj.imageUrl.trim() && !subj.imageUrl.includes('photo-1451187580459')) {
    return subj.imageUrl;
  }
  const n = `${subj?.id || ''} ${subj?.name || ''}`.toLowerCase();

  if (n.includes('geography')) {
    if (n.includes('andhra') || n.includes('telangana') || n.includes('state')) return SUBJECT_IMAGE_CATALOG.ap_geography;
    if (n.includes('world')) return SUBJECT_IMAGE_CATALOG.world_geography;
    return SUBJECT_IMAGE_CATALOG.geography;
  }
  if (n.includes('andhra') && (n.includes('history') || n.includes('cultural') || n.includes('social'))) {
    return SUBJECT_IMAGE_CATALOG.ap_history;
  }
  if (n.includes('telangana') && (n.includes('history') || n.includes('movement') || n.includes('cultural'))) {
    return SUBJECT_IMAGE_CATALOG.ts_history;
  }
  if (n.includes('history') || n.includes('heritage')) {
    if (n.includes('modern') || n.includes('freedom')) return SUBJECT_IMAGE_CATALOG.modern_history;
    return SUBJECT_IMAGE_CATALOG.indian_history;
  }
  if (n.includes('society') || n.includes('social issue') || n.includes('social justice') || n.includes('welfare')) {
    return SUBJECT_IMAGE_CATALOG.society;
  }
  if (n.includes('mental') || n.includes('reasoning') || n.includes('aptitude') || n.includes('ability') || n.includes('quant') || n.includes('arithmetic') || n.includes('math')) {
    return SUBJECT_IMAGE_CATALOG.mental_ability;
  }
  if (n.includes('constitution') || n.includes('polity') || n.includes('civics') || n.includes('law')) {
    return SUBJECT_IMAGE_CATALOG.polity;
  }
  if (n.includes('governance') || n.includes('administration') || n.includes('public')) {
    return SUBJECT_IMAGE_CATALOG.governance;
  }
  if (n.includes('economy') || n.includes('economic') || n.includes('planning') || n.includes('budget')) {
    if (n.includes('andhra') || n.includes('telangana') || n.includes('agriculture')) return SUBJECT_IMAGE_CATALOG.ap_economy;
    return SUBJECT_IMAGE_CATALOG.economy;
  }
  if (n.includes('environment') || n.includes('ecology') || n.includes('biodiversity') || n.includes('climate')) {
    return SUBJECT_IMAGE_CATALOG.environment;
  }
  if (n.includes('disaster')) {
    return SUBJECT_IMAGE_CATALOG.disaster;
  }
  if (n.includes('science') || n.includes('tech') || n.includes('space')) {
    if (n.includes('general science') || n.includes('biology') || n.includes('chemistry')) return SUBJECT_IMAGE_CATALOG.general_science;
    return SUBJECT_IMAGE_CATALOG.science_tech;
  }
  if (n.includes('current') || n.includes('affair') || n.includes('events') || n.includes('news')) {
    return SUBJECT_IMAGE_CATALOG.current_affairs;
  }
  if (n.includes('ethic') || n.includes('integrity')) {
    return SUBJECT_IMAGE_CATALOG.ethics;
  }
  if (n.includes('english') || n.includes('language') || n.includes('comprehension')) {
    return SUBJECT_IMAGE_CATALOG.english;
  }

  const keys = Object.keys(SUBJECT_IMAGE_CATALOG);
  return SUBJECT_IMAGE_CATALOG[keys[index % keys.length]];
}

/**
 * Distinct, bright daylight Unit images tailored to specific Unit topics and Subject context
 */
const UNIT_GALLERY = {
  // History Units
  ancient_indus: 'https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?auto=format&fit=crop&w=1000&q=80',
  medieval_temple: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80',
  modern_india_gate: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1000&q=80',
  buddhist_stupa: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1000&q=80',
  fort_architecture: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1000&q=80',

  // Geography Units
  physical_mountains: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80',
  rivers_delta: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
  economic_agriculture: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80',
  human_demography: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1000&q=80',
  coastal_oceans: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',

  // Polity Units
  constitution_law: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80',
  parliament_dome: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1000&q=80',
  federal_state: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1000&q=80',
  local_panchayat: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1000&q=80',
  public_policy: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80',

  // Economy Units
  national_income: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
  money_banking: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1000&q=80',
  budget_fiscal: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
  rural_farming: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1000&q=80',
  industry_infra: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1000&q=80',

  // Science & Environment Units
  space_rocket: 'https://images.unsplash.com/photo-1517976487468-f20514c44f53?auto=format&fit=crop&w=1000&q=80',
  biotech_lab: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80',
  clean_solar: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1000&q=80',
  forest_ecology: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=80',
  digital_ict: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80',

  // Society & Aptitude Units
  social_structure: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80',
  women_empowerment: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1000&q=80',
  logical_reasoning: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1000&q=80',
  data_analytics: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
};

export function getCuratedUnitImage(unit: any, subjectName: string = '', unitIndex: number = 0): string {
  if (unit?.imageUrl && unit.imageUrl.trim() && !unit.imageUrl.includes('photo-1451187580459')) {
    return unit.imageUrl;
  }
  const uName = (unit?.name || '').toLowerCase();
  const sName = (subjectName || '').toLowerCase();

  // Direct unit keyword matching
  if (uName.includes('ancient') || uName.includes('indus') || uName.includes('harappa') || uName.includes('vedic') || uName.includes('satavahana') || uName.includes('ikshvaku')) {
    return UNIT_GALLERY.ancient_indus;
  }
  if (uName.includes('buddh') || uName.includes('jain') || uName.includes('amaravati') || uName.includes('maurya')) {
    return UNIT_GALLERY.buddhist_stupa;
  }
  if (uName.includes('medieval') || uName.includes('vijayanagara') || uName.includes('kakatiya') || uName.includes('reddi') || uName.includes('chola') || uName.includes('temple')) {
    return UNIT_GALLERY.medieval_temple;
  }
  if (uName.includes('mughal') || uName.includes('sultanate') || uName.includes('qutb') || uName.includes('asaf') || uName.includes('fort')) {
    return UNIT_GALLERY.fort_architecture;
  }
  if (uName.includes('modern') || uName.includes('freedom') || uName.includes('national') || uName.includes('british') || uName.includes('reorganisation') || uName.includes('movement')) {
    return UNIT_GALLERY.modern_india_gate;
  }

  if (uName.includes('physical') || uName.includes('relief') || uName.includes('physiograph') || uName.includes('general geography') || uName.includes('mountain')) {
    return UNIT_GALLERY.physical_mountains;
  }
  if (uName.includes('river') || uName.includes('drainage') || uName.includes('climate') || uName.includes('monsoon') || uName.includes('water') || uName.includes('irrigation')) {
    return UNIT_GALLERY.rivers_delta;
  }
  if (uName.includes('coast') || uName.includes('marine') || uName.includes('ocean') || uName.includes('port')) {
    return UNIT_GALLERY.coastal_oceans;
  }
  if (uName.includes('agricultur') || uName.includes('soil') || uName.includes('crop') || uName.includes('rural') || uName.includes('land reform')) {
    return UNIT_GALLERY.rural_farming;
  }
  if (uName.includes('human') || uName.includes('demograph') || uName.includes('population') || uName.includes('urban') || uName.includes('migration')) {
    return UNIT_GALLERY.human_demography;
  }

  if (uName.includes('preamble') || uName.includes('fundamental') || uName.includes('directive') || uName.includes('constitutional') || uName.includes('judiciary') || uName.includes('court') || uName.includes('rights')) {
    return UNIT_GALLERY.constitution_law;
  }
  if (uName.includes('parliament') || uName.includes('union') || uName.includes('executive') || uName.includes('president') || uName.includes('legislature')) {
    return UNIT_GALLERY.parliament_dome;
  }
  if (uName.includes('federal') || uName.includes('centre-state') || uName.includes('center-state') || uName.includes('state government') || uName.includes('governor')) {
    return UNIT_GALLERY.federal_state;
  }
  if (uName.includes('local') || uName.includes('panchayat') || uName.includes('municipal') || uName.includes('decentral')) {
    return UNIT_GALLERY.local_panchayat;
  }
  if (uName.includes('policy') || uName.includes('commission') || uName.includes('election') || uName.includes('statutory') || uName.includes('governance')) {
    return UNIT_GALLERY.public_policy;
  }

  if (uName.includes('bank') || uName.includes('monetary') || uName.includes('rbi') || uName.includes('inflation') || uName.includes('financial')) {
    return UNIT_GALLERY.money_banking;
  }
  if (uName.includes('budget') || uName.includes('fiscal') || uName.includes('tax') || uName.includes('gst') || uName.includes('public finance')) {
    return UNIT_GALLERY.budget_fiscal;
  }
  if (uName.includes('industr') || uName.includes('infrastruct') || uName.includes('transport') || uName.includes('mineral') || uName.includes('resource')) {
    return UNIT_GALLERY.industry_infra;
  }
  if (uName.includes('income') || uName.includes('growth') || uName.includes('planning') || uName.includes('niti') || uName.includes('economy')) {
    return UNIT_GALLERY.national_income;
  }

  if (uName.includes('space') || uName.includes('isro') || uName.includes('satellite') || uName.includes('defence') || uName.includes('drdo') || uName.includes('missile')) {
    return UNIT_GALLERY.space_rocket;
  }
  if (uName.includes('biotech') || uName.includes('health') || uName.includes('disease') || uName.includes('vaccine') || uName.includes('life science') || uName.includes('biology')) {
    return UNIT_GALLERY.biotech_lab;
  }
  if (uName.includes('energy') || uName.includes('solar') || uName.includes('nuclear') || uName.includes('renewable') || uName.includes('power')) {
    return UNIT_GALLERY.clean_solar;
  }
  if (uName.includes('computer') || uName.includes('ict') || uName.includes('cyber') || uName.includes('digital') || uName.includes('information') || uName.includes('ai')) {
    return UNIT_GALLERY.digital_ict;
  }
  if (uName.includes('ecology') || uName.includes('environment') || uName.includes('biodiversity') || uName.includes('forest') || uName.includes('pollution') || uName.includes('wildlife')) {
    return UNIT_GALLERY.forest_ecology;
  }

  if (uName.includes('women') || uName.includes('child') || uName.includes('welfare') || uName.includes('empowerment') || uName.includes('vulnerable')) {
    return UNIT_GALLERY.women_empowerment;
  }
  if (uName.includes('family') || uName.includes('marriage') || uName.includes('caste') || uName.includes('tribe') || uName.includes('religion') || uName.includes('society')) {
    return UNIT_GALLERY.social_structure;
  }
  if (uName.includes('data') || uName.includes('chart') || uName.includes('table') || uName.includes('statist') || uName.includes('percentage')) {
    return UNIT_GALLERY.data_analytics;
  }
  if (uName.includes('logical') || uName.includes('reasoning') || uName.includes('number') || uName.includes('series') || uName.includes('coding') || uName.includes('aptitude')) {
    return UNIT_GALLERY.logical_reasoning;
  }

  // Fallback by Subject pool so each unit within a subject gets a distinct relevant photo
  if (sName.includes('history') || sName.includes('cultural')) {
    const pool = [
      UNIT_GALLERY.ancient_indus,
      UNIT_GALLERY.medieval_temple,
      UNIT_GALLERY.buddhist_stupa,
      UNIT_GALLERY.fort_architecture,
      UNIT_GALLERY.modern_india_gate,
    ];
    return pool[unitIndex % pool.length];
  }
  if (sName.includes('geography')) {
    const pool = [
      UNIT_GALLERY.physical_mountains,
      UNIT_GALLERY.rivers_delta,
      UNIT_GALLERY.economic_agriculture,
      UNIT_GALLERY.human_demography,
      UNIT_GALLERY.coastal_oceans,
    ];
    return pool[unitIndex % pool.length];
  }
  if (sName.includes('polity') || sName.includes('constitution')) {
    const pool = [
      UNIT_GALLERY.constitution_law,
      UNIT_GALLERY.parliament_dome,
      UNIT_GALLERY.federal_state,
      UNIT_GALLERY.local_panchayat,
      UNIT_GALLERY.public_policy,
    ];
    return pool[unitIndex % pool.length];
  }
  if (sName.includes('economy')) {
    const pool = [
      UNIT_GALLERY.national_income,
      UNIT_GALLERY.budget_fiscal,
      UNIT_GALLERY.money_banking,
      UNIT_GALLERY.rural_farming,
      UNIT_GALLERY.industry_infra,
    ];
    return pool[unitIndex % pool.length];
  }
  if (sName.includes('science') || sName.includes('tech') || sName.includes('environment')) {
    const pool = [
      UNIT_GALLERY.space_rocket,
      UNIT_GALLERY.biotech_lab,
      UNIT_GALLERY.clean_solar,
      UNIT_GALLERY.forest_ecology,
      UNIT_GALLERY.digital_ict,
    ];
    return pool[unitIndex % pool.length];
  }

  const allValues = Object.values(UNIT_GALLERY);
  return allValues[unitIndex % allValues.length];
}

/**
 * Returns a distinct, bright daylight image for a Topic
 */
export function getCuratedTopicImage(topic: any, unit: any, subjectName: string = '', topicIndex: number = 0): string {
  if (topic?.imageUrl && topic.imageUrl.trim() && !topic.imageUrl.includes('photo-1451187580459')) {
    return topic.imageUrl;
  }
  return getCuratedUnitImage(
    { name: `${topic?.name || ''} ${unit?.name || ''}` },
    subjectName,
    topicIndex + 1
  );
}

/**
 * Returns a bright daylight image for a Current Affairs item based on its category & title
 */
export function getCuratedCurrentAffairsImage(item: { title?: string; category?: string; content?: string; imageUrl?: string }, index: number = 0): string {
  if (item?.imageUrl && item.imageUrl.trim()) return item.imageUrl;
  const text = `${item?.category || ''} ${item?.title || ''} ${item?.content || ''}`.toLowerCase();

  if (text.includes('space') || text.includes('isro') || text.includes('satellite') || text.includes('science') || text.includes('ai') || text.includes('tech')) {
    return UNIT_GALLERY.space_rocket;
  }
  if (text.includes('economy') || text.includes('budget') || text.includes('gdp') || text.includes('rbi') || text.includes('bank') || text.includes('export') || text.includes('finance')) {
    return UNIT_GALLERY.budget_fiscal;
  }
  if (text.includes('environment') || text.includes('climate') || text.includes('forest') || text.includes('solar') || text.includes('green') || text.includes('wildlife') || text.includes('tiger')) {
    return UNIT_GALLERY.forest_ecology;
  }
  if (text.includes('polity') || text.includes('supreme court') || text.includes('parliament') || text.includes('bill') || text.includes('act') || text.includes('constitution') || text.includes('election')) {
    return UNIT_GALLERY.parliament_dome;
  }
  if (text.includes('agricultur') || text.includes('farmer') || text.includes('irrigation') || text.includes('polavaram') || text.includes('crop')) {
    return UNIT_GALLERY.rural_farming;
  }
  if (text.includes('andhra') || text.includes('amaravati') || text.includes('visakhapatnam') || text.includes('telangana') || text.includes('hyderabad') || text.includes('state')) {
    return UNIT_GALLERY.buddhist_stupa;
  }
  if (text.includes('job') || text.includes('notification') || text.includes('appsc') || text.includes('tspsc') || text.includes('upsc') || text.includes('recruitment') || text.includes('education')) {
    return SUBJECT_IMAGE_CATALOG.general_studies;
  }

  const caPool = [
    SUBJECT_IMAGE_CATALOG.current_affairs,
    UNIT_GALLERY.parliament_dome,
    UNIT_GALLERY.budget_fiscal,
    UNIT_GALLERY.space_rocket,
    UNIT_GALLERY.clean_solar,
    UNIT_GALLERY.rivers_delta,
  ];
  return caPool[index % caPool.length];
}

/**
 * Generates an instant, bright daylight SVG data-URI fallback so a broken image icon is NEVER shown even if offline
 */
export function getDaylightSvgFallback(label: string = 'Study Module'): string {
  const safeLabel = (label || 'Study Module').replace(/[<>&"']/g, '').slice(0, 32);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <defs>
      <linearGradient id="sky" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#DCEBFF"/>
        <stop offset="50%" stop-color="#D8F7F5"/>
        <stop offset="100%" stop-color="#FFF1CC"/>
      </linearGradient>
      <linearGradient id="sun" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FDE68A"/>
        <stop offset="100%" stop-color="#F59E0B"/>
      </linearGradient>
      <linearGradient id="hills" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#34D399"/>
        <stop offset="100%" stop-color="#059669"/>
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(#sky)"/>
    <circle cx="650" cy="110" r="56" fill="url(#sun)" opacity="0.85"/>
    <path d="M0 340 Q200 240 420 320 T800 290 L800 450 L0 450 Z" fill="#6EE7B7" opacity="0.65"/>
    <path d="M0 375 Q260 290 520 365 T800 340 L800 450 L0 450 Z" fill="url(#hills)" opacity="0.85"/>
    <rect x="36" y="36" rx="16" ry="16" width="240" height="40" fill="#FFFFFF" opacity="0.85"/>
    <text x="56" y="62" font-family="sans-serif" font-size="16" font-weight="800" fill="#1E1B4B">${safeLabel}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

interface SmartCardImageProps {
  src: string;
  alt: string;
  fallbackLabel?: string;
  className?: string;
}

/**
 * Resilient, high-speed image component that guarantees zero broken image icons
 * and maintains bright, natural daylight clarity.
 */
export const SmartCardImage: React.FC<SmartCardImageProps> = ({
  src,
  alt,
  fallbackLabel,
  className = 'w-full h-full object-cover',
}) => {
  const [imgStage, setImgStage] = useState<'primary' | 'secondary' | 'svg'>('primary');

  const resolvedSrc =
    imgStage === 'primary' && src
      ? src
      : imgStage === 'secondary'
      ? SUBJECT_IMAGE_CATALOG.geography
      : getDaylightSvgFallback(fallbackLabel || alt);

  return React.createElement('img', {
    src: resolvedSrc,
    alt,
    loading: 'lazy',
    decoding: 'async',
    referrerPolicy: 'no-referrer',
    onError: () => {
      setImgStage((prev) => (prev === 'primary' ? 'secondary' : 'svg'));
    },
    className,
  });
};

const QUESTIONS_PER_SET = 10;

/**
 * Calculates the exact number of practice sets from a list of questions
 * using the same grouping logic as SubtopicsView / LevelSetsView (named sets + 10-question chunks).
 */
export function computeSetsFromQuestions(questionsList: any[]): number {
  if (!Array.isArray(questionsList) || questionsList.length === 0) return 0;
  const namedSets = new Set<string>();
  let unnamedCount = 0;
  for (let i = 0; i < questionsList.length; i++) {
    const q = questionsList[i];
    if (!q) continue;
    if (q.setName && String(q.setName).trim()) {
      namedSets.add(String(q.setName).trim());
    } else {
      unnamedCount++;
    }
  }
  return namedSets.size + (unnamedCount > 0 ? Math.ceil(unnamedCount / QUESTIONS_PER_SET) : 0);
}

/**
 * Computes actual completion percentage (0-100) for a Topic from localStorage
 * (checks both Set-based practice and Subtopic-based practice).
 */
export function computeTopicCompletionPercentage(
  appId: string,
  subjectId: string,
  unitId: string,
  topic: any,
  topicQuestions: any[] = []
): number {
  if (!topic || !appId) return 0;
  try {
    // 1. Check set-level progress if topic has questions
    const totalSets = computeSetsFromQuestions(topicQuestions);
    let setProgressTotal = 0;
    let hasAnySetProgress = false;

    if (totalSets > 0) {
      const prefixCompletedSet = `completed_set_${appId}_${subjectId}_${unitId}_${topic.id}_`;
      const prefixPracticeSet = `exam_practice_set_${appId}_${subjectId}_${unitId}_${topic.id}_`;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (key.startsWith(prefixCompletedSet) && localStorage.getItem(key) === 'true') {
          hasAnySetProgress = true;
          setProgressTotal += 100;
        } else if (key.startsWith(prefixPracticeSet)) {
          const completedMirror = key.replace('exam_practice_set_', 'completed_set_');
          if (localStorage.getItem(completedMirror) === 'true') continue;
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            const answered = Object.keys(parsed?.selectedAnswers || {}).length;
            if (answered > 0) {
              hasAnySetProgress = true;
              setProgressTotal += Math.min(Math.round((answered / QUESTIONS_PER_SET) * 100), 95);
            }
          }
        }
      }
    }

    if (hasAnySetProgress && totalSets > 0) {
      return Math.min(100, Math.round(setProgressTotal / totalSets));
    }

    // 2. Check subtopic-level progress
    const subtopics = Array.isArray(topic.subtopics) ? topic.subtopics : [];
    if (subtopics.length > 0) {
      let subTotal = 0;
      for (let i = 0; i < subtopics.length; i++) {
        const sub = subtopics[i];
        const subName = typeof sub === 'string' ? sub : String(sub?.name || sub || '');
        const completedKey = `completed_sub_${appId}_${subjectId}_${unitId}_${topic.id}_${subName}`;
        if (localStorage.getItem(completedKey) === 'true') {
          subTotal += 100;
          continue;
        }
        const practiceKey = `exam_practice_${appId}_${subjectId}_${unitId}_${topic.id}_${subName}`;
        const raw = localStorage.getItem(practiceKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          const ansCount = Object.keys(parsed?.selectedAnswers || {}).length;
          if (ansCount > 0) {
            subTotal += Math.min(95, Math.max(20, ansCount * 10));
          }
        }
      }
      return Math.min(100, Math.round(subTotal / subtopics.length));
    }

    // 3. Direct topic completion check
    const directCompleted = localStorage.getItem(
      `completed_sub_${appId}_${subjectId}_${unitId}_${topic.id}_${topic.name}`
    );
    if (directCompleted === 'true') return 100;
  } catch {
    // ignore storage errors
  }
  return 0;
}

export interface StatTileItem {
  type: 'units' | 'topics' | 'sets' | 'mcqs';
  count: number;
  label: string;
}

interface ReferenceStatStripProps {
  tiles: StatTileItem[];
  percentage: number;
  themeId?: string;
}

/**
 * Renders the aligned compact pastel stat tiles + circular progress ring
 * matching the reference card design.
 */
export const ReferenceStatStrip: React.FC<ReferenceStatStripProps> = ({
  tiles,
  percentage,
  themeId = 'champagne',
}) => {
  const clampedPct = Math.max(0, Math.min(100, Math.round(percentage || 0)));
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference;

  const isRoseRing = themeId === 'rose' || themeId === 'peach';
  const ringTileClass = isRoseRing
    ? 'bg-[#FFEAF1] border-[#FBCFE8]'
    : 'bg-[#E3FBF1] border-[#99F6E4]';
  const ringTrackColor = isRoseRing ? '#F9A8D4' : '#99F6E4';
  const ringStrokeColor = isRoseRing ? '#E11D48' : '#059669';

  const renderTileIcon = (type: StatTileItem['type']) => {
    if (type === 'units') {
      // Stacked books icon
      return React.createElement(
        'span',
        { className: 'text-xs sm:text-sm leading-none shrink-0 select-none', 'aria-hidden': 'true' },
        '📚'
      );
    }
    if (type === 'topics') {
      // Lightning bolt icon
      return React.createElement(
        'span',
        { className: 'text-xs sm:text-sm leading-none shrink-0 select-none text-amber-500', 'aria-hidden': 'true' },
        '⚡'
      );
    }
    if (type === 'sets') {
      // Purple document icon SVG
      return React.createElement(
        'svg',
        {
          className: 'w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-600 shrink-0',
          viewBox: '0 0 24 24',
          fill: 'currentColor',
        },
        React.createElement('path', {
          d: 'M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5zM8 12h8v2H8v-2zm0 4h8v2H8v-2z',
        })
      );
    }
    // MCQs check-box icon SVG
    return React.createElement(
      'svg',
      {
        className: 'w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600 shrink-0',
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '2.5',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
      React.createElement('rect', { x: '3', y: '3', width: '18', height: '18', rx: '4' }),
      React.createElement('path', { d: 'm9 12 2 2 4-4' })
    );
  };

  const getTileStyle = (type: StatTileItem['type']) => {
    switch (type) {
      case 'units':
        return 'bg-[#EBF5FF] border-[#BAE0FF]';
      case 'topics':
        return 'bg-[#FFF9E5] border-[#FDE68A]';
      case 'sets':
        return 'bg-[#F3EEFF] border-[#DDD6FE]';
      case 'mcqs':
        return 'bg-[#FFF0F5] border-[#FECDD3]';
    }
  };

  const tileElements = tiles.map((tile) =>
    React.createElement(
      'div',
      {
        key: tile.type,
        className: `flex items-center gap-0.5 sm:gap-1.5 px-1 sm:px-2 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border shadow-2xs shrink-0 ${getTileStyle(
          tile.type
        )}`,
      },
      renderTileIcon(tile.type),
      React.createElement(
        'div',
        { className: 'flex flex-col leading-none' },
        React.createElement(
          'span',
          { className: 'text-[9.5px] sm:text-xs font-black text-[#1E1B4B] tracking-tight leading-none' },
          tile.count.toLocaleString()
        ),
        React.createElement(
          'span',
          { className: 'text-[7px] sm:text-[9px] font-bold text-[#1E1B4B]/75 mt-0.5 leading-none' },
          tile.label
        )
      )
    )
  );

  // Progress ring tile
  const progressTile = React.createElement(
    'div',
    {
      key: 'progress-ring',
      className: `flex items-center gap-0.5 sm:gap-1.5 px-1 sm:px-2 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border shadow-2xs shrink-0 ${ringTileClass}`,
    },
    React.createElement(
      'svg',
      { className: 'w-3.5 h-3.5 sm:w-5 sm:h-5 -rotate-90 shrink-0', viewBox: '0 0 24 24' },
      React.createElement('circle', {
        cx: '12',
        cy: '12',
        r: String(radius),
        fill: 'none',
        stroke: ringTrackColor,
        strokeWidth: '3',
      }),
      React.createElement('circle', {
        cx: '12',
        cy: '12',
        r: String(radius),
        fill: 'none',
        stroke: ringStrokeColor,
        strokeWidth: '3',
        strokeLinecap: 'round',
        strokeDasharray: String(circumference),
        strokeDashoffset: String(strokeDashoffset),
      })
    ),
    React.createElement(
      'span',
      { className: 'text-[9.5px] sm:text-xs font-black text-[#1E1B4B] tracking-tight leading-none' },
      `${clampedPct}%`
    )
  );

  return React.createElement(
    'div',
    {
      className: 'flex items-center justify-end gap-1 sm:gap-1.5 flex-nowrap shrink-0 max-w-full overflow-x-auto no-scrollbar',
    },
    ...tileElements,
    progressTile
  );
};


