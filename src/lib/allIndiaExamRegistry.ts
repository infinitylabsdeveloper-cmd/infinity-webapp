import { AppConfig, Subject, Topic, TopicTheoryTable } from '../types';
import { RAW_APPS_CONFIG, RawAppRecord } from './appsConfigData';

export const SAMPLE_THEORY_TABLE_CONSTITUTION: TopicTheoryTable = {
  title: 'Key Constitutional Articles & Schedules for Competitive Exams',
  headers: ['Article / Schedule', 'Constitutional Subject Matter', 'Key Examination Relevance'],
  rows: [
    ['Article 14 - 18', 'Right to Equality', 'Prohibition of discrimination (Art 15), Equality in public employment (Art 16), Abolition of Untouchability (Art 17)'],
    ['Article 19 - 22', 'Right to Freedom', 'Six fundamental freedoms (Art 19), Protection in respect of conviction (Art 20), Protection of Life & Personal Liberty (Art 21)'],
    ['Article 32', 'Right to Constitutional Remedies', 'Heart & Soul of Constitution (Dr. Ambedkar) - 5 Writs: Habeas Corpus, Mandamus, Prohibition, Certiorari, Quo-Warranto'],
    ['Article 40', 'Organisation of Village Panchayats', 'Directive Principles of State Policy - foundation for 73rd Constitutional Amendment Act 1992'],
    ['Article 324', 'Election Commission of India', 'Superintendence, direction & control of elections to Parliament, State Legislatures, President & Vice-President'],
    ['Schedule 7', 'Division of Powers', 'Union List (100 subjects), State List (61 subjects), Concurrent List (52 subjects)'],
    ['Schedule 11 & 12', 'Local Self Government', '73rd Amendment (29 functional items for Panchayats) & 74th Amendment (18 items for Municipalities)']
  ]
};

export const SAMPLE_THEORY_TABLE_AP_REORGANISATION: TopicTheoryTable = {
  title: 'AP Reorganisation Act 2014 - Statutory Analysis & Institutions',
  headers: ['Section / Schedule', 'Key Statutory Provision', 'Implementation & Current Status'],
  rows: [
    ['Section 5 & 8', 'Common Capital Hyderabad for max 10 years', 'Governor vested with special responsibility for law & order in common capital area'],
    ['Section 46', 'Tax incentives & Financial measures', 'Special package in lieu of Special Category Status; backward districts developmental grant'],
    ['Section 90', 'Polavaram National Irrigation Project', 'Declared as a Project of National Importance; executed by AP Government on behalf of Centre'],
    ['Schedule 13', 'Establishment of Premier Educational Institutions', 'IIT Tirupati, IIM Visakhapatnam, NIT Tadepalligudem, AIIMS Mangalagiri, Central University Anantapur'],
    ['Section 93 & 94', 'Infrastructure development & Ports', 'Vizag-Chennai Industrial Corridor (VCIC), Ramayapatnam/Dugarajapatnam port, new railway zone at Visakhapatnam']
  ]
};

export const SAMPLE_THEORY_TABLE_FIVE_YEAR_PLANS: TopicTheoryTable = {
  title: 'Evolution of Indian Planning: Five Year Plans vs NITI Aayog',
  headers: ['Planning Model', 'Time Period & Architecture', 'Primary Objectives & Impact'],
  rows: [
    ['1st Five Year Plan (Harrod-Domar)', '1951 - 1956', 'Agricultural development, irrigation projects (Bhakra Nangal, Hirakud dams)'],
    ['2nd Five Year Plan (Mahalanobis)', '1956 - 1961', 'Rapid industrialization, heavy capital goods industries (Bhilai, Durgapur, Rourkela steel plants)'],
    ['12th Five Year Plan', '2012 - 2017', 'Faster, Sustainable and More Inclusive Growth (Last Five Year Plan of Planning Commission)'],
    ['NITI Aayog (Think Tank)', '1st Jan 2015 - Present', 'Cooperative Federalism, bottom-up approach, SDG India Index, Aspirational Districts Programme']
  ]
};

export const DEFAULT_APPSC_GROUP2_SYLLABUS: Subject[] = [
  {
    id: 'g2-sub-history',
    name: 'Indian History',
    icon: 'BookOpen',
    category: 'prelims',
    units: [
      {
        id: 'g2-u1-ancient',
        name: 'Ancient Period',
        topics: [
          {
            id: 'g2-t1-indus',
            name: 'Indus Valley Civilization & Vedic Age',
            subtopics: ['Indus Valley Urban Planning', 'Vedic Literature & Society', 'Buddhism and Jainism Rise'],
            hasTheory: true,
            hasPractice: true
          }
        ]
      },
      {
        id: 'g2-u2-medieval',
        name: 'Medieval Period',
        topics: [
          {
            id: 'g2-t2-delhi',
            name: 'Delhi Sultanate & Mughal Empire',
            subtopics: ['Sultanate Administration', 'Mughal Art and Architecture', 'Bhakti and Sufi Movements'],
            hasTheory: true,
            hasPractice: true
          }
        ]
      },
      {
        id: 'g2-u3-modern',
        name: 'Modern Period',
        topics: [
          {
            id: 'g2-t3-freedom',
            name: 'Indian National Movement (1857-1947)',
            subtopics: ['Revolt of 1857', 'Gandhian Era Movements', 'Partition and Independence'],
            hasTheory: true,
            hasPractice: true
          }
        ]
      }
    ]
  },
  {
    id: 'g2-sub-geography',
    name: 'Geography',
    icon: 'Globe',
    category: 'prelims',
    units: [
      {
        id: 'g2-u-geo1',
        name: 'General and Physical Geography',
        topics: [
          {
            id: 'g2-t-geo1',
            name: 'Solar System, Climate & Physical Features of India',
            subtopics: ['Earth Structure & Monsoons', 'Himalayas & Peninsular Plateau', 'Rivers of India & AP'],
            hasTheory: true,
            hasPractice: true
          }
        ]
      }
    ]
  },
  {
    id: 'g2-sub-polity',
    name: 'Indian Constitution & Polity',
    icon: 'Shield',
    category: 'mains',
    units: [
      {
        id: 'g2-u-polity1',
        name: 'Constitutional Framework',
        topics: [
          {
            id: 'g2-t-polity1',
            name: 'Preamble, Fundamental Rights & DPSP',
            subtopics: ['Preamble & Citizenship', 'Fundamental Rights (Art 12-35)', 'Directive Principles & Duties'],
            hasTheory: true,
            hasPractice: true,
            theoryTables: [SAMPLE_THEORY_TABLE_CONSTITUTION]
          }
        ]
      }
    ]
  },
  {
    id: 'g2-sub-ap-history',
    name: 'Social and Cultural History of Andhra Pradesh',
    icon: 'Landmark',
    category: 'mains',
    units: [
      {
        id: 'g2-u-aphist1',
        name: 'Ancient & Medieval Andhra Dynasties',
        topics: [
          {
            id: 'g2-t-aphist1',
            name: 'Satavahanas, Ikshvakus & Vijayanagara Empire',
            subtopics: ['Satavahana Society & Trade', 'Kakatiya Irrigation & Architecture', 'Vijayanagara Golden Age'],
            hasTheory: true,
            hasPractice: true
          }
        ]
      }
    ]
  },
  {
    id: 'g2-sub-economy',
    name: 'Indian and AP Economy',
    icon: 'TrendingUp',
    category: 'mains',
    units: [
      {
        id: 'g2-u-econ1',
        name: 'Indian Economy & AP Reorganisation',
        topics: [
          {
            id: 'g2-t-econ1',
            name: 'AP Reorganisation Act 2014 & Economic Challenges',
            subtopics: ['AP Bifurcation Deficit', 'Polavaram Project', 'VCIC & Capital Development'],
            hasTheory: true,
            hasPractice: true,
            theoryTables: [SAMPLE_THEORY_TABLE_AP_REORGANISATION, SAMPLE_THEORY_TABLE_FIVE_YEAR_PLANS]
          }
        ]
      }
    ]
  }
];

export function mapRawRecordToAppConfig(raw: RawAppRecord): AppConfig {
  const isTarget = raw.id === 'andhra-pradesh-appsc-group-2-en';
  let examCategory = 'State PSC';
  if (raw.id.includes('police') || raw.id.includes('constable') || raw.id.includes('si')) examCategory = 'Police';
  else if (raw.id.includes('rrb') || raw.id.includes('railway') || raw.id.includes('rpf') || raw.id.includes('alp')) examCategory = 'Railways';
  else if (raw.id.includes('ssc')) examCategory = 'SSC';
  else if (raw.id.includes('tet') || raw.id.includes('trb') || raw.id.includes('dsc') || raw.id.includes('teaching') || raw.id.includes('ctet') || raw.id.includes('kvs') || raw.id.includes('nvs')) examCategory = 'Teaching';
  else if (raw.id.includes('forest')) examCategory = 'Forest';
  else if (raw.id.includes('upsc')) examCategory = 'UPSC';
  else if (raw.id.includes('banking') || raw.id.includes('ibps') || raw.id.includes('sbi') || raw.id.includes('rbi') || raw.id.includes('nabard') || raw.id.includes('sebi')) examCategory = 'Banking';
  else if (raw.id.includes('defence') || raw.id.includes('agniveer') || raw.id.includes('afcat') || raw.id.includes('nda') || raw.id.includes('cds')) examCategory = 'Defence';
  else if (raw.id.startsWith('central-')) examCategory = 'Central';

  const parts = raw.id.split('-');
  let jurisdiction = 'Central';
  if (parts[0] !== 'central') {
    jurisdiction = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    if (parts.length > 1 && (parts[0] === 'andhra' || parts[0] === 'tamil' || parts[0] === 'west' || parts[0] === 'madhya' || parts[0] === 'himachal' || parts[0] === 'arunachal')) {
      jurisdiction = `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} ${parts[1].charAt(0).toUpperCase() + parts[1].slice(1)}`;
    }
  }

  let themeColor = 'indigo';
  let accentColor = '#4f46e5';
  if (examCategory === 'Police') { themeColor = 'blue'; accentColor = '#2563eb'; }
  else if (examCategory === 'Railways') { themeColor = 'rose'; accentColor = '#e11d48'; }
  else if (examCategory === 'SSC') { themeColor = 'emerald'; accentColor = '#059669'; }
  else if (examCategory === 'Teaching') { themeColor = 'amber'; accentColor = '#d97706'; }
  else if (examCategory === 'Forest') { themeColor = 'green'; accentColor = '#16a34a'; }
  else if (examCategory === 'UPSC') { themeColor = 'purple'; accentColor = '#7c3aed'; }
  else if (examCategory === 'Banking') { themeColor = 'cyan'; accentColor = '#0891b2'; }
  else if (examCategory === 'Defence') { themeColor = 'slate'; accentColor = '#475569'; }

  const medCode = raw.medium === 'English' ? 'EM' :
                  raw.medium === 'Telugu' ? 'TM' :
                  raw.medium === 'Hindi' ? 'HM' :
                  raw.medium === 'Tamil' ? 'TM' :
                  raw.medium === 'Kannada' ? 'KM' :
                  raw.medium === 'Malayalam' ? 'MM' :
                  raw.medium === 'Marathi' ? 'MR' :
                  raw.medium === 'Gujarati' ? 'GM' :
                  raw.medium === 'Odia' ? 'OM' :
                  raw.medium === 'Bengali' ? 'BM' :
                  raw.medium === 'Assamese' ? 'AM' :
                  raw.medium === 'Punjabi' ? 'PM' : 'EM';

  return {
    id: raw.id,
    name: raw.name,
    examCategory,
    mediums: [medCode],
    packageId: raw.package,
    packageName: raw.package,
    isActive: true,
    jurisdiction,
    locale: raw.languageCode || 'en',
    themeColor,
    accentColor,
    currency: 'INR',
    currencySymbol: '₹',
    bannerImage: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80',
    syllabus: isTarget ? DEFAULT_APPSC_GROUP2_SYLLABUS : []
  };
}

export const ALL_INDIA_EXAMS_REGISTRY: AppConfig[] = RAW_APPS_CONFIG.map(mapRawRecordToAppConfig);

const OBSOLETE_APP_IDS = new Set([
  'india-psc', 'app-appsc-group2-tm', 'app-appsc-group1-em', 'app-appsc-group1-tm',
  'app-appsc-group4-em', 'app-appsc-group4-tm', 'tspsc-group-2', 'app-tspsc-group2-tm',
  'app-tspsc-group1-em', 'app-tspsc-group1-tm', 'app-tspsc-group3-em', 'app-tspsc-group3-tm',
  'app-upsc-cse-em', 'app-upsc-cse-hm', 'app-ap-police-constable-em', 'app-ap-police-constable-tm',
  'app-ap-police-si-em', 'app-ap-police-si-tm', 'app-ts-police-constable-em', 'app-ts-police-constable-tm',
  'app-rrb-ntpc-em', 'app-rrb-ntpc-hm', 'app-rrb-group-d-em', 'app-rrb-group-d-hm',
  'app-rrb-alp-em', 'app-ssc-cgl-em', 'app-ssc-cgl-hm', 'app-ssc-chsl-em',
  'app-ssc-gd-constable-em', 'app-ssc-gd-constable-hm', 'app-ap-forest-beat-officer-em',
  'app-ap-forest-beat-officer-tm', 'app-ap-assistant-beat-officer-em', 'app-ap-assistant-beat-officer-tm',
  'app-ap-dsc-em', 'app-ap-dsc-tm', 'app-ap-tet-em', 'app-ap-tet-tm',
  'app-ts-tet-dsc-em', 'app-ts-tet-dsc-tm', 'app-ap-endowments-eo-em', 'app-ap-endowments-eo-tm'
]);

/**
 * Merge Registry with existing DB state
 * - Guarantees all 662 apps from new catalog are present
 * - Prevents obsolete app definitions (e.g. india-psc) from being restored
 * - Migrates APPSC Group 2 content to andhra-pradesh-appsc-group-2-en
 */
export function mergeExamNetworkWithExistingDb(existingApps: AppConfig[]): AppConfig[] {
  const mergedMap = new Map<string, AppConfig>();

  // 1. First add all 662 apps from RAW_APPS_CONFIG
  for (const regApp of ALL_INDIA_EXAMS_REGISTRY) {
    mergedMap.set(regApp.id, { ...regApp });
  }

  if (!existingApps || !Array.isArray(existingApps)) {
    return Array.from(mergedMap.values());
  }

  // 2. Process existing DB apps
  for (const exApp of existingApps) {
    if (!exApp || !exApp.id) continue;

    // Migrate india-psc syllabus to target app
    if (exApp.id === 'india-psc') {
      const targetApp = mergedMap.get('andhra-pradesh-appsc-group-2-en');
      if (targetApp) {
        mergedMap.set('andhra-pradesh-appsc-group-2-en', {
          ...targetApp,
          syllabus: exApp.syllabus && exApp.syllabus.length > 0 ? exApp.syllabus : targetApp.syllabus
        });
      }
      continue;
    }

    // Ignore obsolete app IDs
    if (OBSOLETE_APP_IDS.has(exApp.id)) {
      continue;
    }

    const baseReg = mergedMap.get(exApp.id);
    if (baseReg) {
      mergedMap.set(exApp.id, {
        ...baseReg,
        ...exApp,
        syllabus: (exApp.syllabus && exApp.syllabus.length > 0) ? exApp.syllabus : baseReg.syllabus
      });
    } else {
      // Keep valid custom admin apps
      mergedMap.set(exApp.id, exApp);
    }
  }

  return Array.from(mergedMap.values());
}
