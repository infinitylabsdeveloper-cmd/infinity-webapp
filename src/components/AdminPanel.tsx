import React, { useState, useRef, useEffect } from 'react';
import { AppState, AppConfig, Question, Poster, SubscriptionPackage, CouponCode, NotificationItem, Subject, Unit, Topic, CurrentAffairsItem, ImportBatch, AuditLog } from '../types';
import { defaultCuratedPosters } from '../lib/defaultData';
import { SupportConfig, DEFAULT_SUPPORT_CONFIG, getStoredSupportConfig, saveSupportConfig } from './SupportCenterModal';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  BookOpen, 
  Layers, 
  CheckCircle, 
  Globe, 
  MapPin, 
  Tag, 
  CreditCard, 
  Bell, 
  Image as ImageIcon, 
  Edit2, 
  FolderPlus,
  Search,
  Filter,
  Download,
  FileText,
  BarChart3,
  CalendarDays,
  FileSpreadsheet,
  RefreshCw,
  Wallet,
  Receipt,
  User as UserIcon,
  Smartphone,
  Mail as MailIcon,
  Hash,
  FileJson,
  FileCheck,
  FileX,
  Home,
  Maximize2,
  Minimize2,
  Upload,
  FileUp,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowRight,
  Copy,
  Check,
  Zap,
  HelpCircle,
  UploadCloud,
  FilePlus,
  FileCode,
  BookmarkCheck,
  ChevronUp,
  ChevronDown,
  Shield,
  Info,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import MathText from './MathText';
import { extractOptions, resolveCorrectOption, normalizeSingleQuestion } from '../lib/questionParser';
import { useMcqFontSize } from '../lib/mcqFontStore';
import AdminTheoryEditorModal from './AdminTheoryEditorModal';
import { mergeExamNetworkWithExistingDb } from '../lib/allIndiaExamRegistry';
import { McqFontControls } from './McqFontControls';
import { LANGUAGES, LanguageOption, LanguageCode, TRANSLATIONS, getTranslation, isRTL } from '../lib/i18n';
import { AdminMockTestManager } from './AdminMockTestManager';
import FileUploadStatusModal from './FileUploadStatusModal';
import FileDeleteConfirmModal from './FileDeleteConfirmModal';
import ContentUploadReportModal, { DetailedUploadReport, UploadRecordIssue, SuccessfulRecordSummary } from './ContentUploadReportModal';

const AppTargetingSelector = ({ 
  apps, 
  selectedIds, 
  onToggle, 
  onSelectAll, 
  onClear 
}: { 
  apps: AppConfig[], 
  selectedIds: string[], 
  onToggle: (id: string) => void,
  onSelectAll: () => void,
  onClear: () => void
}) => {
  const [search, setSearch] = useState('');
  const filteredApps = apps.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3.5 shadow-2xs">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-indigo-600 shrink-0" />
          Target Applications ({selectedIds.length})
        </h4>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={onSelectAll}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
          >
            Select All
          </button>
          <span className="text-slate-300">|</span>
          <button 
            type="button"
            onClick={onClear}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
          >
            Clear Selection
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input 
          type="text"
          placeholder="Search apps by name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-2xs transition-all"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
        {filteredApps.map(app => (
          <label 
            key={app.id} 
            className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
              selectedIds.includes(app.id)
                ? 'bg-indigo-50/80 border-indigo-300 shadow-2xs'
                : 'bg-white border-slate-200 hover:bg-slate-100/70'
            }`}
          >
            <div className="relative flex items-center">
              <input 
                type="checkbox"
                checked={selectedIds.includes(app.id)}
                onChange={() => onToggle(app.id)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
              />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-900 truncate">{app.name}</span>
              <span className="text-[10px] text-slate-500 font-semibold truncate">{app.id}</span>
            </div>
          </label>
        ))}
        {filteredApps.length === 0 && (
          <div className="col-span-full py-4 text-center text-xs font-bold text-slate-500">
            No matching apps found.
          </div>
        )}
      </div>
    </div>
  );
};

export const SYLLABUS_IMAGE_PRESETS = [
  { label: '🏛️ Indian History & Heritage', url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80' },
  { label: '🪨 Ancient Indian History', url: 'https://images.unsplash.com/photo-1621682372775-533449e550ed?auto=format&fit=crop&w=1200&q=80' },
  { label: '🏰 Medieval Indian History', url: 'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=1200&q=80' },
  { label: '🇮🇳 Modern History & Freedom', url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80' },
  { label: '🗺️ Geography & Topography', url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80' },
  { label: '⚖️ Indian Polity & Constitution', url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80' },
  { label: '📈 Indian Economy & Finance', url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80' },
  { label: '🚀 Science & Space Technology', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80' },
  { label: '🧠 Mental Ability & Math', url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80' },
  { label: '🛕 Andhra Heritage & Lepakshi', url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80' },
  { label: '⛰️ Tirupati & Seshachalam', url: 'https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?auto=format&fit=crop&w=1200&q=80' },
  { label: '🌾 Agriculture & Rural Economy', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80' },
  { label: '🌿 Environment & Biodiversity', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80' },
  { label: '📚 Study & Reference Library', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80' },
  { label: '🌊 Coastal & Marine Vistas', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
];

interface AdminPanelProps {
  state: AppState;
  activeApp: AppConfig;
  onSaveState: (newState: AppState) => Promise<void>;
  onClose: () => void;
  onLogout?: () => void;
  onSelectApp?: (appId: string) => void;
  adminEmail?: string;
  adminRole?: 'admin' | 'staff';
}

export default function AdminPanel({ 
  state, 
  activeApp, 
  onSaveState, 
  onClose, 
  onLogout, 
  onSelectApp, 
  adminEmail = 'sobhadhanaraju1@gmail.com',
  adminRole = 'admin'
}: AdminPanelProps) {
  const isAdmin = adminRole === 'admin';
  // Audit Logging Helper
  const logAuditAction = async (action: string, targetId: string, targetType: 'poster' | 'coupon' | 'ca' | 'subscription' | 'mcq' | 'app' | 'notification', details?: string) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      adminEmail,
      action,
      targetId,
      targetType,
      details,
      timestamp: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...(state.auditLogs || [])].slice(0, 500); // Keep last 500 logs
    await onSaveState({ ...state, auditLogs: updatedLogs });
  };

  // App selection state in Admin (Independent Apps managed by unique App ID)
  const [selectedAppId, setSelectedAppId] = useState<string>(activeApp.id);
  const selectedAdminApp = state.apps.find(a => a.id === selectedAppId) || activeApp;

  const [activeTab, setActiveTab] = useState<'content' | 'syllabus' | 'coupons' | 'subscriptions' | 'posters' | 'notifications' | 'current-affairs' | 'revenue' | 'reports' | 'dashboard' | 'app-settings' | 'mock-tests' | 'app-network' | 'translations' | 'support-settings'>('dashboard');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Support & Contact Details Admin State
  const [supportForm, setSupportForm] = useState<SupportConfig>(getStoredSupportConfig);
  const [isRestoreConfirmOpen, setIsRestoreConfirmOpen] = useState(false);

  // App Network & Multilingual Localization Admin State
  const [appNetworkSearch, setAppNetworkSearch] = useState('');
  const [translationAdminLang, setTranslationAdminLang] = useState<LanguageCode>('te');
  const [translationSearch, setTranslationSearch] = useState('');
  const [translationZone, setTranslationZone] = useState<string>('All');
  const [languageStatusOverrides, setLanguageStatusOverrides] = useState<Record<string, 'Published' | 'In Review' | 'Draft'>>({});

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [couponSearch, setCouponSearch] = useState('');
  const [posterSearch, setPosterSearch] = useState('');
  const [caSearch, setCaSearch] = useState('');
  const [searchField, setSearchField] = useState<'mobile' | 'email' | 'transactionId' | 'orderId' | 'packageName' | 'paymentStatus' | 'platform'>('mobile');
  const [filterExam, setFilterExam] = useState('all');
  const [filterPlanStatus, setFilterPlanStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterAppId, setFilterAppId] = useState('all');
  const [filterCurrency, setFilterCurrency] = useState('all');
  const [reportType, setReportType] = useState<'revenue' | 'subscription' | 'payment' | 'refund' | 'coupon' | 'gst' | 'monthly' | 'yearly' | 'current-affairs' | 'usage_stats' | 'audit_logs'>('revenue');

  // App Configuration State
  const [configAppName, setConfigAppName] = useState(selectedAdminApp.name);
  const [configAppTheme, setConfigAppTheme] = useState(selectedAdminApp.themeColor || 'indigo');
  const [configAppAccent, setConfigAppAccent] = useState(selectedAdminApp.accentColor || '#4f46e5');
  const [configAppBanner, setConfigAppBanner] = useState(selectedAdminApp.bannerImage || '');
  const [configAppLocale, setConfigAppLocale] = useState(selectedAdminApp.locale || 'en');
  const [configAppCurrency, setConfigAppCurrency] = useState(selectedAdminApp.currency || 'INR');
  const [configAppCurrencySymbol, setConfigAppCurrencySymbol] = useState(selectedAdminApp.currencySymbol || '₹');
  const [configAppCategory, setConfigAppCategory] = useState(selectedAdminApp.examCategory || 'State PSC');
  const [configAppMediums, setConfigAppMediums] = useState((selectedAdminApp.mediums || ['EM', 'TM']).join(', '));
  const [configAppPackageId, setConfigAppPackageId] = useState(selectedAdminApp.packageId || '');
  const [configAppJurisdiction, setConfigAppJurisdiction] = useState(selectedAdminApp.jurisdiction || '');
  const [configAppIsActive, setConfigAppIsActive] = useState(selectedAdminApp.isActive ?? true);

  // Add App Modal State
  const [isAddAppModalOpen, setIsAddAppModalOpen] = useState(false);
  const [newAppId, setNewAppId] = useState('');
  const [newAppName, setNewAppName] = useState('');
  const [newAppCategory, setNewAppCategory] = useState('State PSC');
  const [newAppMediums, setNewAppMediums] = useState('EM, TM');
  const [newAppPackageId, setNewAppPackageId] = useState('');
  const [newAppJurisdiction, setNewAppJurisdiction] = useState('');
  const [newAppTheme, setNewAppTheme] = useState('indigo');
  const [newAppAccent, setNewAppAccent] = useState('#4f46e5');
  const [newAppBanner, setNewAppBanner] = useState('https://images.unsplash.com/photo-1532375811400-2ac29100ef06?auto=format&fit=crop&w=1200&q=80');

  useEffect(() => {
    setConfigAppName(selectedAdminApp.name);
    setConfigAppTheme(selectedAdminApp.themeColor || 'indigo');
    setConfigAppAccent(selectedAdminApp.accentColor || '#4f46e5');
    setConfigAppBanner(selectedAdminApp.bannerImage || '');
    setConfigAppLocale(selectedAdminApp.locale || 'en');
    setConfigAppCurrency(selectedAdminApp.currency || 'INR');
    setConfigAppCurrencySymbol(selectedAdminApp.currencySymbol || '₹');
    setConfigAppCategory(selectedAdminApp.examCategory || 'State PSC');
    setConfigAppMediums((selectedAdminApp.mediums || ['EM', 'TM']).join(', '));
    setConfigAppPackageId(selectedAdminApp.packageId || '');
    setConfigAppJurisdiction(selectedAdminApp.jurisdiction || '');
    setConfigAppIsActive(selectedAdminApp.isActive ?? true);
  }, [selectedAdminApp]);

  // Supported Currencies for Per-App Multi-Currency Subscriptions
  const SUPPORTED_CURRENCIES = [
    { code: 'INR', symbol: '₹', name: 'INR (₹) - Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'USD ($) - US Dollar' },
    { code: 'EUR', symbol: '€', name: 'EUR (€) - Euro' },
    { code: 'GBP', symbol: '£', name: 'GBP (£) - British Pound' },
    { code: 'AED', symbol: 'AED', name: 'AED (AED) - UAE Dirham' },
    { code: 'CAD', symbol: 'CA$', name: 'CAD ($) - Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'AUD ($) - Australian Dollar' },
    { code: 'SGD', symbol: 'S$', name: 'SGD ($) - Singapore Dollar' },
    { code: 'JPY', symbol: '¥', name: 'JPY (¥) - Japanese Yen' },
  ];

  // Navigation Groups Configuration
  const navGroups = [
    {
      title: 'ANALYTICS & REPORTS',
      items: [
        { id: 'dashboard', label: 'Master Dashboard', icon: Home },
        { id: 'revenue', label: 'Financial Analytics', icon: Wallet, adminOnly: true },
        { id: 'reports', label: 'Advanced Reports', icon: BarChart3, adminOnly: true },
      ]
    },
    {
      title: 'CONTENT HUB',
      items: [
        { id: 'syllabus', label: 'Syllabus Hierarchy', icon: Layers },
        { id: 'content', label: 'MCQ Question Bank', icon: BookOpen, count: state.questions.length },
        { id: 'mock-tests', label: 'Official Mock Tests', icon: Sparkles },
        { id: 'current-affairs', label: 'Current Affairs Studio', icon: Globe, count: state.currentAffairs.length },
      ]
    },

    {
      title: 'MARKETING & GROWTH',
      items: [
        { id: 'posters', label: 'Posters & Banners', icon: ImageIcon, count: state.posters.length },
        { id: 'coupons', label: 'Coupon Engine', icon: Tag, adminOnly: true, count: state.coupons.length },
        { id: 'notifications', label: 'Push Notifications', icon: Bell },
      ]
    },
    {
      title: 'APP MANAGEMENT',
      items: [
        { id: 'app-settings', label: 'App Configuration', icon: Smartphone, adminOnly: true },
        { id: 'app-network', label: 'App Network Switcher', icon: Globe, adminOnly: true, count: state.apps.length },
        { id: 'translations', label: '22 Languages Localization', icon: FileText, adminOnly: true, count: LANGUAGES.length },
        { id: 'subscriptions', label: 'Subscription Plans', icon: CreditCard, adminOnly: true, count: state.subscriptions.length },
        { id: 'support-settings', label: 'Support & Contact Details', icon: HelpCircle, adminOnly: true },
      ]
    }
  ];

  // MCQ Font Size scaling hook
  const { scaledTextStyle } = useMcqFontSize();

  // MCQ Form State (Strict 3-Level Hierarchy: Subject -> Unit -> Topic)
  const [newQText, setNewQText] = useState('');
  const [newSubId, setNewSubId] = useState(selectedAdminApp.syllabus[0]?.id || '');
  const [newUnitId, setNewUnitId] = useState(selectedAdminApp.syllabus[0]?.units?.[0]?.id || '');
  const [newTopicId, setNewTopicId] = useState(selectedAdminApp.syllabus[0]?.units?.[0]?.topics?.[0]?.id || '');
  const [newQLanguage, setNewQLanguage] = useState('en');
  
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOpt, setCorrectOpt] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [explanation, setExplanation] = useState('');

  // Syllabus Manager State
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCategory, setNewSubjectCategory] = useState<'prelims' | 'mains' | 'both'>('prelims');
  const [newSubjectImageUrl, setNewSubjectImageUrl] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState('from-orange-500 to-amber-600');
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitImageUrl, setNewUnitImageUrl] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicImageUrl, setNewTopicImageUrl] = useState('');
  const [newSubtopicText, setNewSubtopicText] = useState('');
  const [newSubtopicImageUrl, setNewSubtopicImageUrl] = useState('');

  const [targetSubjectId, setTargetSubjectId] = useState(selectedAdminApp.syllabus[0]?.id || '');
  const [targetUnitId, setTargetUnitId] = useState(selectedAdminApp.syllabus[0]?.units[0]?.id || '');
  const [targetTopicId, setTargetTopicId] = useState(selectedAdminApp.syllabus[0]?.units[0]?.topics[0]?.id || '');

  // Delete filtration state
  const [deleteFilterSubjectId, setDeleteFilterSubjectId] = useState<string>('');
  const [deleteFilterTopicId, setDeleteFilterTopicId] = useState<string>('');

  // Edit / Delete Modal State for Syllabus Items
  const [editingItem, setEditingItem] = useState<{
    type: 'subject' | 'unit' | 'topic' | 'subtopic';
    subId: string;
    unitId?: string;
    topicId?: string;
    oldName?: string;
    name: string;
    imageUrl?: string;
    color?: string;
  } | null>(null);

  // Theory & Practice Options Editor Modal State
  const [adminTheoryTarget, setAdminTheoryTarget] = useState<{
    subjectName: string;
    unitName: string;
    topic: Topic;
    subjectId: string;
    unitId: string;
  } | null>(null);

  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // Single Question Form State
  const [singleQuestionText, setSingleQuestionText] = useState('');
  const [singleCorrectOption, setSingleCorrectOption] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [singleOptions, setSingleOptions] = useState<{ A: string; B: string; C: string; D: string }>({ A: '', B: '', C: '', D: '' });
  const [singleExplanation, setSingleExplanation] = useState('');

  // Editing existing MCQ state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'subject' | 'unit' | 'topic' | 'subtopic' | 'all' | 'question' | 'batch' | 'batch-subject' | 'coupon' | 'subscription' | 'poster' | 'notification' | 'ca' | 'topic-questions';
    subId?: string;
    unitId?: string;
    topicId?: string;
    subtopicName?: string;
    targetId?: string;
    title: string;
  } | null>(null);

  // JSON & Spreadsheet (Excel/CSV) Import State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isWideLayout, setIsWideLayout] = useState<boolean>(true);
  const [uploadMode, setUploadMode] = useState<'bulk' | 'single'>('bulk');
  const [uploadFileType, setUploadFileType] = useState<'json' | 'excel' | 'csv' | null>(null);
  const [parsedPreviewCount, setParsedPreviewCount] = useState<number | null>(null);
  const [jsonInputText, setJsonInputText] = useState('');
  const [importFileName, setImportFileName] = useState('');
  const [importFileSize, setImportFileSize] = useState('');
  const [isDraggingJson, setIsDraggingJson] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const [jsonUploadReport, setJsonUploadReport] = useState<{
    total: number;
    successCount: number;
    failedCount: number;
    errors: { index: number; reason: string }[];
    type: 'mcq' | 'syllabus';
  } | null>(null);

  const [bulkActionConfirm, setBulkActionConfirm] = useState<{
    action: string;
    description: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // Reusable Confirmation Dialogs & Upload Reports State
  const [isUploadingContent, setIsUploadingContent] = useState<boolean>(false);
  const [uploadStatusModal, setUploadStatusModal] = useState<{
    isOpen: boolean;
    status: 'success' | 'error';
    fileName: string;
    fileType?: string;
    fileSize?: string;
    title?: string;
    message: string;
    details?: {
      total?: number;
      successCount?: number;
      failedCount?: number;
      duplicatesCount?: number;
    };
    onViewReport?: () => void;
  } | null>(null);

  const [deleteFileTarget, setDeleteFileTarget] = useState<{
    fileName: string;
    fileDetails?: string;
    fileType?: string;
    recordCount?: number;
    onConfirm: () => Promise<void>;
    title?: string;
    message?: string;
  } | null>(null);

  const [detailedReport, setDetailedReport] = useState<DetailedUploadReport | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Syllabus Bulk Upload & Report State
  const syllabusFileInputRef = useRef<HTMLInputElement>(null);
  const [syllabusFileName, setSyllabusFileName] = useState<string>('');
  const [syllabusFileSize, setSyllabusFileSize] = useState<string>('');
  const [syllabusFileType, setSyllabusFileType] = useState<'json' | 'excel' | 'csv' | null>(null);
  const [isUploadingSyllabus, setIsUploadingSyllabus] = useState<boolean>(false);
  const [isDraggingSyllabus, setIsDraggingSyllabus] = useState<boolean>(false);
  const [syllabusInputText, setSyllabusInputText] = useState<string>('');
  const [isSyllabusUploadExpanded, setIsSyllabusUploadExpanded] = useState<boolean>(false);

  // Toggle browser fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Helper to download templates
  const downloadSampleExcel = () => {
    const sampleData = [
      {
        "Question": "Who was the Chairman of the Drafting Committee of the Indian Constitution?",
        "Option A": "Dr. Rajendra Prasad",
        "Option B": "Dr. B.R. Ambedkar",
        "Option C": "Jawaharlal Nehru",
        "Option D": "Sardar Vallabhbhai Patel",
        "Correct Option": "B",
        "Explanation": "Dr. B.R. Ambedkar served as the Chairman of the Drafting Committee appointed on August 29, 1947."
      },
      {
        "Question": "Under which Article of the Constitution can Financial Emergency be proclaimed?",
        "Option A": "Article 352",
        "Option B": "Article 356",
        "Option C": "Article 360",
        "Option D": "Article 368",
        "Correct Option": "C",
        "Explanation": "Article 360 empowers the President to proclaim a Financial Emergency."
      },
      {
        "Question": "Which Constitutional Amendment Act introduced GST in India?",
        "Option A": "100th Amendment Act",
        "Option B": "101st Amendment Act",
        "Option C": "102nd Amendment Act",
        "Option D": "103rd Amendment Act",
        "Correct Option": "B",
        "Explanation": "The 101st Constitutional Amendment Act, 2016 paved the way for the introduction of Goods and Services Tax."
      }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "MCQ_Template");
    XLSX.writeFile(wb, `${selectedAdminApp.id}_MCQ_Upload_Template.xlsx`);
  };

  const downloadSampleCSV = () => {
    const csvContent = `"Question","Option A","Option B","Option C","Option D","Correct Option","Explanation"\n"Who was the Chairman of the Drafting Committee of the Indian Constitution?","Dr. Rajendra Prasad","Dr. B.R. Ambedkar","Jawaharlal Nehru","Sardar Vallabhbhai Patel","B","Dr. B.R. Ambedkar was Chairman of Drafting Committee."\n"Under which Article can Financial Emergency be proclaimed?","Article 352","Article 356","Article 360","Article 368","C","Article 360 empowers Financial Emergency proclamation."`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedAdminApp.id}_MCQ_Upload_Template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSampleJSON = () => {
    const sampleJson = [
      {
        "questionText": "Who was the Chairman of the Drafting Committee of the Indian Constitution?",
        "options": {
          "A": "Dr. Rajendra Prasad",
          "B": "Dr. B.R. Ambedkar",
          "C": "Jawaharlal Nehru",
          "D": "Sardar Vallabhbhai Patel"
        },
        "correctOption": "B",
        "explanation": "Dr. B.R. Ambedkar served as the Chairman of the Drafting Committee appointed on August 29, 1947."
      },
      {
        "questionText": "Under which Article of the Constitution can Financial Emergency be proclaimed?",
        "options": {
          "A": "Article 352",
          "B": "Article 356",
          "C": "Article 360",
          "D": "Article 368"
        },
        "correctOption": "C",
        "explanation": "Article 360 empowers the President to proclaim a Financial Emergency."
      }
    ];
    const blob = new Blob([JSON.stringify(sampleJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedAdminApp.id}_MCQ_Upload_Template.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Universal File Processor for JSON, Excel (.xlsx, .xls) and CSV (.csv)
  const processUploadedFile = (file: File) => {
    setImportFileName(file.name);
    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
      : `${Math.round(file.size / 1024)} KB`;
    setImportFileSize(sizeStr);
    const fileNameLower = file.name.toLowerCase();
    const isJson = fileNameLower.endsWith('.json');
    const isExcelOrCsv = fileNameLower.endsWith('.xlsx') || fileNameLower.endsWith('.xls') || fileNameLower.endsWith('.csv');

    if (isJson) {
      setUploadFileType('json');
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          const text = evt.target.result as string;
          setJsonInputText(text);
          try {
            const parsed = JSON.parse(text);
            const count = Array.isArray(parsed) ? parsed.length : 1;
            setParsedPreviewCount(count);
          } catch {
            setParsedPreviewCount(null);
          }
        }
      };
      reader.readAsText(file);
    } else if (isExcelOrCsv) {
      setUploadFileType(fileNameLower.endsWith('.csv') ? 'csv' : 'excel');
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

          const normalizedQuestions = jsonRows.map((row: any, idx: number) => {
            const qText = row.Question || row.question || row['Question Text'] || row.questionText || row.Text || row.Statement || row.Q || row.q || `Question ${idx + 1}`;
            const optA = row['Option A'] || row['OptionA'] || row.optionA || row.A || row.a || row.optA || row['Option 1'] || '';
            const optB = row['Option B'] || row['OptionB'] || row.optionB || row.B || row.b || row.optB || row['Option 2'] || '';
            const optC = row['Option C'] || row['OptionC'] || row.optionC || row.C || row.c || row.optC || row['Option 3'] || '';
            const optD = row['Option D'] || row['OptionD'] || row.optionD || row.D || row.d || row.optD || row['Option 4'] || '';
            const rawAns = row['Correct Option'] || row['Correct Answer'] || row.correctOption || row.Answer || row.Correct || row.ans || row.Ans || 'A';
            const exp = row.Explanation || row.explanation || row.Solution || row.solution || row.Description || row.desc || '';
            const setVal = row['Set Name'] || row.SetName || row.setName || row['Set'] || row.Set || row.set || row['Practice Set'] || '';
            const lang = row.Language || row.language || row.Lang || row.lang || 'en';

            let parsedSetName: string | undefined = undefined;
            if (setVal !== undefined && setVal !== null && String(setVal).trim() !== '') {
              const str = String(setVal).trim();
              parsedSetName = /^\d+$/.test(str) ? `Set ${str}` : str;
            }

            return {
              questionText: String(qText).trim(),
              options: {
                A: String(optA).trim(),
                B: String(optB).trim(),
                C: String(optC).trim(),
                D: String(optD).trim()
              },
              correctOption: String(rawAns).trim().toUpperCase().charAt(0) || 'A',
              explanation: String(exp).trim(),
              setName: parsedSetName,
              language: String(lang).trim().toLowerCase() || 'en'
            };
          }).filter(q => q.questionText && (q.options.A || q.options.B));

          setJsonInputText(JSON.stringify(normalizedQuestions, null, 2));
          setParsedPreviewCount(normalizedQuestions.length);
        } catch (err: any) {
          alert('Spreadsheet parse error: ' + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Please upload a valid .json, .xlsx, .xls, or .csv file.');
    }
  };

  // Single Question Direct Add Handler (Strict 3-Level Hierarchy: Subject -> Unit -> Topic)
  const handleAddSingleQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubId || !newUnitId || !newTopicId) {
      alert('Hierarchy Selection Error: Subject, Unit, and Topic are all mandatory. Please select all three levels before adding an MCQ.');
      return;
    }
    const targetSub = selectedAdminApp.syllabus.find(s => s.id === newSubId);
    if (!targetSub) {
      alert('Validation Error: Selected Subject is invalid.');
      return;
    }
    const targetUnit = targetSub.units?.find(u => u.id === newUnitId);
    if (!targetUnit) {
      alert('Validation Error: Selected Unit is invalid. Please select a valid Unit.');
      return;
    }
    const targetTopic = targetUnit.topics?.find(t => t.id === newTopicId);
    if (!targetTopic) {
      alert('Validation Error: Selected Topic is invalid. Please select a valid Topic.');
      return;
    }

    const qText = (singleQuestionText || newQText).trim();
    if (!qText) {
      alert('Please enter the question text.');
      return;
    }

    const optionA = (singleOptions.A || optA).trim();
    const optionB = (singleOptions.B || optB).trim();
    const optionC = (singleOptions.C || optC).trim() || 'None of the above';
    const optionD = (singleOptions.D || optD).trim() || 'All of the above';

    if (!optionA || !optionB) {
      alert('Please provide at least Option A and Option B.');
      return;
    }

    const chosenCorrect = singleCorrectOption || correctOpt || 'A';
    const expVal = (singleExplanation || explanation).trim();

    const singleQ: Question = {
      id: `q-manual-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      appId: selectedAdminApp.id,
      subjectId: targetSub.id,
      unitId: targetUnit.id,
      topicId: targetTopic.id,
      subtopic: '',
      subtopicId: '',
      setName: undefined, // Never automatically assign Set 1
      category: targetSub.category || 'prelims',
      questionText: qText,
      options: {
        A: optionA,
        B: optionB,
        C: optionC,
        D: optionD,
      },
      correctOption: chosenCorrect,
      explanation: expVal,
      language: newQLanguage
    };

    const updatedQuestions = [singleQ, ...state.questions];
    await onSaveState({ ...state, questions: updatedQuestions });
    
    const pathLabel = `${targetSub.name} → ${targetUnit.name} → ${targetTopic.name}`;
    setSuccessMsg(`MCQ added successfully under ${pathLabel}!`);
    setNewQText('');
    setSingleQuestionText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setSingleOptions({ A: '', B: '', C: '', D: '' });
    setExplanation('');
    setSingleExplanation('');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // MCQ Quick Edit Handlers
  const handleStartEditQuestion = (q: Question) => {
    setEditingQuestion({ ...q });
  };

  const handleSaveEditedQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    if (!editingQuestion.questionText.trim()) {
      alert('Question text cannot be empty.');
      return;
    }
    const updatedQuestions = state.questions.map(q => q.id === editingQuestion.id ? editingQuestion : q);
    await onSaveState({ ...state, questions: updatedQuestions });
    setEditingQuestion(null);
    setSuccessMsg('MCQ updated successfully!');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // Banner direct image file reader with responsive canvas compression
  const handlePosterImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadStatusModal({
        isOpen: true,
        status: 'error',
        fileName: file.name,
        fileType: file.type || 'unknown',
        title: 'Invalid Image File',
        message: 'Please select a valid image file (.png, .jpg, .jpeg, .webp, or .svg).'
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) return;
      const rawDataUrl = e.target.result as string;
      
      // Auto-compress high-res uploads to max 1280px to protect database and memory
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1280;
        const maxHeight = 720;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPosterImageUrl(compressedDataUrl);
        } else {
          setPosterImageUrl(rawDataUrl);
        }

        setUploadStatusModal({
          isOpen: true,
          status: 'success',
          fileName: file.name,
          fileType: file.type || 'image',
          fileSize: `${Math.round(file.size / 1024)} KB`,
          title: 'Banner Image Loaded Successfully',
          message: `The image file "${file.name}" has been loaded and optimized for display on the home screen.`
        });
      };
      img.onerror = () => {
        setPosterImageUrl(rawDataUrl);
        setUploadStatusModal({
          isOpen: true,
          status: 'error',
          fileName: file.name,
          fileType: file.type,
          title: 'Image Load Warning',
          message: 'Could not compress image preview; loaded raw image directly.'
        });
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Coupon & Subscription & Poster & Notification State
  const [couponCode, setCouponCode] = useState('');
  const [discountPct, setDiscountPct] = useState(20);
  const [expiry, setExpiry] = useState('');

  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState(999);
  const [planSymbol, setPlanSymbol] = useState('₹');
  const [editingSub, setEditingSub] = useState<SubscriptionPackage | null>(null);

  const [notifTitle, setNotifTitle] = useState('');
  const [notifMsg, setNotifMsg] = useState('');

  const [posterTitle, setPosterTitle] = useState('');
  const [posterSubtitle, setPosterSubtitle] = useState('');
  const [posterBadge, setPosterBadge] = useState('NEW');
  const [posterImageUrl, setPosterImageUrl] = useState('');
  const [posterTargetType, setPosterTargetType] = useState<Poster['targetType']>('prelims');
  const [posterTargetSubjectId, setPosterTargetSubjectId] = useState('');
  const [posterActionUrl, setPosterActionUrl] = useState('');
  const [editingPoster, setEditingPoster] = useState<Poster | null>(null);

  useEffect(() => {
    const firstSub = selectedAdminApp.syllabus[0];
    const firstUnit = firstSub?.units?.[0];
    const firstTopic = firstUnit?.topics?.[0];
    setNewSubId(firstSub?.id || '');
    setNewUnitId(firstUnit?.id || '');
    setNewTopicId(firstTopic?.id || '');
    setTargetSubjectId(firstSub?.id || '');
    setTargetUnitId(firstUnit?.id || '');
    setTargetTopicId(firstTopic?.id || '');
  }, [selectedAppId, selectedAdminApp]);

  // Current Affairs Form State
  const [caTitle, setCaTitle] = useState('');
  const [caMonth, setCaMonth] = useState('August 2026');
  const [caPublishedDate, setCaPublishedDate] = useState('August 22, 2026');
  const [caContent, setCaContent] = useState('');
  const [applyToAllIndia, setApplyToAllIndia] = useState<boolean>(true);
  const [editingCa, setEditingCa] = useState<CurrentAffairsItem | null>(null);

  // Multi-app targeting helper (Defaults to current admin app)
  const [selectedTargetAppIds, setSelectedTargetAppIds] = useState<string[]>([selectedAdminApp?.id || 'andhra-pradesh-appsc-group-2-en']);
  const toggleAppSelection = (appId: string) => {
    setSelectedTargetAppIds(prev => 
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  };
  const selectAllApps = () => setSelectedTargetAppIds(state.apps.map(a => a.id));
  const clearAppSelection = () => setSelectedTargetAppIds([]);

  // Poster Management State
  const [posterStartDate, setPosterStartDate] = useState('');
  const [posterEndDate, setPosterEndDate] = useState('');
  const [posterPosition, setPosterPosition] = useState<Poster['position']>('home-banner');
  const [posterStatus, setPosterStatus] = useState<Poster['status']>('active');
  const [posterCtaText, setPosterCtaText] = useState('Explore Now');
  const [posterDescription, setPosterDescription] = useState('');

  // Coupon Management State
  const [couponType, setCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [couponValue, setCouponValue] = useState(0);
  const [couponStartDate, setCouponStartDate] = useState('');
  const [couponEndDate, setCouponEndDate] = useState('');
  const [couponMaxRedemptions, setCouponMaxRedemptions] = useState(100);
  const [couponPerUserLimit, setCouponPerUserLimit] = useState(1);
  const [couponMinPurchase, setCouponMinPurchase] = useState(0);
  const [couponMaxDiscount, setCouponMaxDiscount] = useState(0);
  const [couponStatus, setCouponStatus] = useState<CouponCode['status']>('active');
  const [editingCoupon, setEditingCoupon] = useState<CouponCode | null>(null);

  // Current Affairs Scheduling State
  const [caLanguage, setCaLanguage] = useState('en');
  const [caCategory, setCaCategory] = useState('National');
  const [caSummary, setCaSummary] = useState('');
  const [caStartDate, setCaStartDate] = useState('');
  const [caEndDate, setCaEndDate] = useState('');
  const [caStatus, setCaStatus] = useState<CurrentAffairsItem['status']>('scheduled');
  const [caImageUrl, setCaImageUrl] = useState('');

  // Subscription Management State
  const [subBillingCycle, setSubBillingCycle] = useState<SubscriptionPackage['billingCycle']>('monthly');
  const [subDurationDays, setSubDurationDays] = useState(30);
  const [subFeatures, setSubFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [subStartDate, setSubStartDate] = useState('');
  const [subEndDate, setSubEndDate] = useState('');
  const [subStatus, setSubStatus] = useState<SubscriptionPackage['status']>('active');
  const [subTrialDays, setSubTrialDays] = useState(0);
  const [subIntroPrice, setSubIntroPrice] = useState(0);
  const [isPopular, setIsPopular] = useState(false);

  const handleSaveCurrentAffairs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caTitle || !caContent) {
      alert('Please enter title and content.');
      return;
    }
    const targetApps = selectedTargetAppIds.length > 0 ? selectedTargetAppIds : [selectedAdminApp.id];

    if (editingCa) {
      const updated = (state.currentAffairs || []).map(ca =>
        ca.id === editingCa.id
          ? { 
              ...ca, 
              title: caTitle, 
              month: caMonth, 
              publishedDate: caPublishedDate, 
              content: caContent, 
              appIds: targetApps,
              language: caLanguage || 'en',
              category: caCategory || 'National',
              summary: caSummary,
              startDate: caStartDate || new Date().toISOString(),
              endDate: caEndDate || undefined,
              status: caStatus || 'published',
              imageUrl: caImageUrl
            }
          : ca
      );
      await onSaveState({ ...state, currentAffairs: updated });
      setSuccessMsg('Current Affairs article updated successfully!');
      setEditingCa(null);
    } else {
      const newItem: CurrentAffairsItem = {
        id: `ca-${Date.now()}`,
        appIds: targetApps,
        title: caTitle,
        month: caMonth,
        publishedDate: caPublishedDate,
        content: caContent,
        language: caLanguage || 'en',
        category: caCategory || 'National',
        summary: caSummary,
        startDate: caStartDate || new Date().toISOString(),
        endDate: caEndDate || undefined,
        status: caStatus || 'published',
        imageUrl: caImageUrl
      };
      const updated = [newItem, ...(state.currentAffairs || [])];
      await onSaveState({ ...state, currentAffairs: updated });
      await logAuditAction('CREATE_CURRENT_AFFAIRS', newItem.id, 'ca', `Published: ${newItem.title}`);
      setSuccessMsg(`Current Affairs published for ${targetApps.length} apps!`);
    }
    setCaTitle('');
    setCaContent('');
    setCaSummary('');
    setCaImageUrl('');
    setSelectedTargetAppIds([selectedAdminApp.id]);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleEditCa = (item: CurrentAffairsItem) => {
    setEditingCa(item);
    setCaTitle(item.title);
    setCaMonth(item.month || 'August 2026');
    setCaPublishedDate(item.publishedDate || 'August 22, 2026');
    setCaContent(item.content);
    setCaSummary(item.summary || '');
    setCaLanguage(item.language || 'en');
    setCaCategory(item.category || 'National');
    setCaStatus(item.status || 'published');
    setCaImageUrl(item.imageUrl || '');
    setCaStartDate(item.startDate ? item.startDate.slice(0, 10) : '');
    setCaEndDate(item.endDate ? item.endDate.slice(0, 10) : '');
    setSelectedTargetAppIds(item.appIds && item.appIds.length > 0 ? item.appIds : [selectedAdminApp.id]);
  };

  const handleDeleteCa = (id: string, titleText: string) => {
    setDeleteConfirm({ type: 'ca', targetId: id, title: `Current Affairs item "${titleText}"` });
  };

  // Manual Subscription Grant State
  const [grantUserIdentifier, setGrantUserIdentifier] = useState('');
  const [grantPlanId, setGrantPlanId] = useState('');
  const [grantTargetAppId, setGrantTargetAppId] = useState(selectedAdminApp.id);
  const [grantMsg, setGrantMsg] = useState<string | null>(null);

  const handleManualGrantSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantUserIdentifier.trim()) {
      alert('Please enter user Mobile Number or Gmail ID.');
      return;
    }
    const targetApp = state.apps.find(a => a.id === grantTargetAppId) || selectedAdminApp;
    const subs = (state.subscriptions || []).filter(s => s.appId === targetApp.id || s.appId === 'all');
    const selectedPkg = subs.find(s => s.id === grantPlanId) || subs[0] || { name: 'Elite All-Access Plan', price: 999, currencySymbol: '₹' };

    const newPurchase = {
      id: `manual-grant-${Date.now()}`,
      transactionId: `TXN-MAN-${Date.now()}`,
      orderId: `ORD-MAN-${Date.now()}`,
      appId: targetApp.id,
      appName: targetApp.name,
      countryId: targetApp.countryId,
      countryName: targetApp.countryName,
      packageName: selectedPkg.name,
      planStatus: 'active' as const,
      amount: selectedPkg.price || 999,
      currencySymbol: selectedPkg.currencySymbol || '₹',
      userName: grantUserIdentifier.trim().includes('@') ? grantUserIdentifier.split('@')[0] : 'Elite Student',
      email: grantUserIdentifier.trim().includes('@') ? grantUserIdentifier.trim() : 'student@example.com',
      mobile: grantUserIdentifier.trim().includes('@') ? '0000000000' : grantUserIdentifier.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      platform: 'Web' as const,
      paymentStatus: 'success' as const,
      method: 'Manual Grant',
      gstAmount: (selectedPkg.price || 999) * 0.18,
    };

    const updatedPurchases = [newPurchase, ...(state.purchases || [])];
    await onSaveState({ ...state, purchases: updatedPurchases });
    await logAuditAction('MANUAL_GRANT_SUB', newPurchase.id, 'subscription', `Granted to ${newPurchase.email} for ${newPurchase.appName}`);
    setGrantMsg(`Successfully allotted "${selectedPkg.name}" Elite Premium to (${grantUserIdentifier}) for ${targetApp.name}!`);
    setGrantUserIdentifier('');
    setTimeout(() => setGrantMsg(null), 5000);
  };

  const handleBulkDeletePosters = async () => {
    setBulkActionConfirm({
      action: 'Delete All Posters',
      description: 'This will permanently remove all promotional banners and posters across the entire network.',
      onConfirm: async () => {
        await onSaveState({ ...state, posters: [] });
        await logAuditAction('BULK_DELETE_POSTERS', 'all', 'poster', 'Deleted all posters across the network');
        setSuccessMsg('All posters deleted successfully.');
      }
    });
  };

  const handleSeedCuratedPosters = async () => {
    await onSaveState({ ...state, posters: defaultCuratedPosters });
    await logAuditAction('SEED_CURATED_POSTERS', 'all', 'poster', 'Restored default curated promotional banners');
    setSuccessMsg('Curated promotional banners restored successfully!');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleBulkDisableCoupons = async () => {
    setBulkActionConfirm({
      action: 'Disable All Coupons',
      description: 'This will set the status of all active coupons to "disabled", preventing further redemptions.',
      onConfirm: async () => {
        const updated = (state.coupons || []).map(c => ({ ...c, status: 'disabled' as const }));
        await onSaveState({ ...state, coupons: updated });
        await logAuditAction('BULK_DISABLE_COUPONS', 'all', 'coupon', 'Disabled all coupons across the network');
        setSuccessMsg('All coupons disabled successfully.');
      }
    });
  };

  const handleBulkDisablePlans = async () => {
    setBulkActionConfirm({
      action: 'Archive All Subscription Plans',
      description: 'This will archive and disable all subscription plans. Existing subscribers will not be affected.',
      onConfirm: async () => {
        const updated = (state.subscriptions || []).map(s => ({ ...s, status: 'disabled' as const }));
        await onSaveState({ ...state, subscriptions: updated });
        await logAuditAction('BULK_DISABLE_PLANS', 'all', 'subscription', 'Archived all subscription plans');
        setSuccessMsg('All plans archived successfully.');
      }
    });
  };

  const executeEdit = () => {
    if (!editingItem || !editingItem.name.trim()) return;
    const { type, subId, unitId, topicId, oldName, name } = editingItem;
    const trimmed = name.trim();

    if (type === 'subject') {
      const updated = selectedAdminApp.syllabus.map(s => s.id === subId ? { ...s, name: trimmed, imageUrl: editingItem.imageUrl?.trim() || undefined, color: editingItem.color } : s);
      updateAppSyllabus(updated, 'Subject updated successfully!');
    } else if (type === 'unit' && unitId) {
      const updated = selectedAdminApp.syllabus.map(s => {
        if (s.id === subId) {
          return { ...s, units: s.units.map(u => u.id === unitId ? { ...u, name: trimmed, imageUrl: editingItem.imageUrl?.trim() || undefined } : u) };
        }
        return s;
      });
      updateAppSyllabus(updated, 'Unit updated successfully!');
    } else if (type === 'topic' && unitId && topicId) {
      const updated = selectedAdminApp.syllabus.map(s => {
        if (s.id === subId) {
          return {
            ...s,
            units: s.units.map(u => {
              if (u.id === unitId) {
                return {
                  ...u,
                  topics: u.topics.map(t => t.id === topicId ? { ...t, name: trimmed, imageUrl: editingItem.imageUrl?.trim() || undefined } : t)
                };
              }
              return u;
            })
          };
        }
        return s;
      });
      updateAppSyllabus(updated, 'Topic updated successfully!');
    } else if (type === 'subtopic' && unitId && topicId && oldName !== undefined) {
      const updated = selectedAdminApp.syllabus.map(s => {
        if (s.id === subId) {
          return {
            ...s,
            units: s.units.map(u => {
              if (u.id === unitId) {
                return {
                  ...u,
                  topics: u.topics.map(t => {
                    if (t.id === topicId) {
                      const updatedImages = { ...(t.subtopicImages || {}) };
                      if (oldName !== trimmed && updatedImages[oldName]) {
                        delete updatedImages[oldName];
                      }
                      if (editingItem.imageUrl?.trim()) {
                        updatedImages[trimmed] = editingItem.imageUrl.trim();
                      } else {
                        delete updatedImages[trimmed];
                        if (oldName) delete updatedImages[oldName];
                      }
                      return {
                        ...t,
                        subtopics: t.subtopics.map(st => st === oldName ? trimmed : st),
                        subtopicImages: updatedImages
                      };
                    }
                    return t;
                  })
                };
              }
              return u;
            })
          };
        }
        return s;
      });
      updateAppSyllabus(updated, 'Subtopic updated successfully!');
    }
    setEditingItem(null);
  };

  const executeDelete = async () => {
    if (!isAdmin) {
      alert('Security Violation: Access Denied. Only Senior Administrators can delete records.');
      return;
    }
    if (!deleteConfirm) return;
    const { type, subId, unitId, topicId, subtopicName, targetId } = deleteConfirm;

    if (type === 'all') {
      updateAppSyllabus([], 'All subjects deleted successfully!');
    } else if (type === 'subject' && subId) {
      const updated = selectedAdminApp.syllabus.filter(s => s.id !== subId);
      updateAppSyllabus(updated, 'Subject deleted successfully!');
    } else if (type === 'unit' && subId && unitId) {
      const updated = selectedAdminApp.syllabus.map(s => {
        if (s.id === subId) {
          return { ...s, units: s.units.filter(u => u.id !== unitId) };
        }
        return s;
      });
      updateAppSyllabus(updated, 'Unit deleted successfully!');
    } else if (type === 'topic' && subId && unitId && topicId) {
      const updated = selectedAdminApp.syllabus.map(s => {
        if (s.id === subId) {
          return {
            ...s,
            units: s.units.map(u => {
              if (u.id === unitId) {
                return { ...u, topics: u.topics.filter(t => t.id !== topicId) };
              }
              return u;
            })
          };
        }
        return s;
      });
      updateAppSyllabus(updated, 'Topic deleted successfully!');
    } else if (type === 'subtopic' && subId && unitId && topicId && subtopicName) {
      const updated = selectedAdminApp.syllabus.map(s => {
        if (s.id === subId) {
          return {
            ...s,
            units: s.units.map(u => {
              if (u.id === unitId) {
                return {
                  ...u,
                  topics: u.topics.map(t => {
                    if (t.id === topicId) {
                      const updatedImages = { ...(t.subtopicImages || {}) };
                      delete updatedImages[subtopicName];
                      return { 
                        ...t, 
                        subtopics: t.subtopics.filter(st => st !== subtopicName),
                        subtopicImages: updatedImages
                      };
                    }
                    return t;
                  })
                };
              }
              return u;
            })
          };
        }
        return s;
      });
      updateAppSyllabus(updated, 'Subtopic deleted successfully!');
    } else if (type === 'ca' && targetId) {
      const updated = (state.currentAffairs || []).filter(ca => ca.id !== targetId);
      await onSaveState({ ...state, currentAffairs: updated });
      await logAuditAction('DELETE_CURRENT_AFFAIRS', targetId, 'ca', `Deleted item ID: ${targetId}`);
      setSuccessMsg('Current Affairs item deleted successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } else if (type === 'question' && targetId) {
      const updatedQuestions = state.questions.filter((q) => q.id !== targetId);
      await onSaveState({ ...state, questions: updatedQuestions });
      await logAuditAction('DELETE_QUESTION', targetId, 'mcq', `Deleted question ID: ${targetId}`);
      setSuccessMsg('Question deleted successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } else if (type === 'batch' && targetId) {
      const updatedQuestions = state.questions.filter((q) => q.importBatchId !== targetId);
      const updatedBatches = (state.importBatches || []).filter(b => b.id !== targetId);
      await onSaveState({ ...state, questions: updatedQuestions, importBatches: updatedBatches });
      await logAuditAction('DELETE_BATCH', targetId, 'mcq', `Deleted batch: ${targetId}`);
      if (jsonFileInputRef.current) {
        jsonFileInputRef.current.value = '';
      }
      setImportFileName('');
      setJsonInputText('');
      setSuccessMsg('Questions from selected file deleted successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } else if (type === 'batch-subject' && targetId && subId) {
      const updatedQuestions = state.questions.filter((q) => !(q.importBatchId === targetId && q.subjectId === subId));
      const remainingQuestionsInBatch = updatedQuestions.filter((q) => q.importBatchId === targetId);

      let updatedBatches = [...(state.importBatches || [])];
      if (remainingQuestionsInBatch.length === 0) {
        updatedBatches = updatedBatches.filter((b) => b.id !== targetId);
      } else {
        updatedBatches = updatedBatches.map((b) => b.id === targetId ? { ...b, count: remainingQuestionsInBatch.length } : b);
      }
      await onSaveState({ ...state, questions: updatedQuestions, importBatches: updatedBatches });
      if (jsonFileInputRef.current) {
        jsonFileInputRef.current.value = '';
      }
      setImportFileName('');
      setJsonInputText('');
      setSuccessMsg(`Deleted questions from the selected file successfully.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else if (type === 'coupon' && targetId) {
      const updatedCoupons = (state.coupons || []).filter(c => c.id !== targetId);
      await onSaveState({ ...state, coupons: updatedCoupons });
      await logAuditAction('DELETE_COUPON', targetId, 'coupon', `Deleted coupon ID: ${targetId}`);
      setSuccessMsg('Coupon deleted successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } else if (type === 'subscription' && targetId) {
      const updatedSubs = (state.subscriptions || []).filter(s => s.id !== targetId);
      await onSaveState({ ...state, subscriptions: updatedSubs });
      await logAuditAction('DELETE_SUBSCRIPTION', targetId, 'subscription', `Deleted plan ID: ${targetId}`);
      setSuccessMsg('Subscription plan deleted successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } else if (type === 'poster' && targetId) {
      const updatedPosters = (state.posters || []).filter(p => p.id !== targetId);
      await onSaveState({ ...state, posters: updatedPosters });
      setSuccessMsg('Banner poster deleted successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } else if (type === 'notification' && targetId) {
      const updatedNotifs = (state.notifications || []).filter(n => n.id !== targetId);
      await onSaveState({ ...state, notifications: updatedNotifs });
      setSuccessMsg('Notification deleted successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } else if (type === 'topic-questions' && subId && topicId) {
      const updatedQuestions = state.questions.filter(
        q => !(q.appId === selectedAdminApp.id && q.subjectId === subId && q.topicId === topicId)
      );
      await onSaveState({ ...state, questions: updatedQuestions });
      setSuccessMsg('All questions for the selected topic have been deleted successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    }
    setDeleteConfirm(null);
  };

  const handleDeleteSubject = (subId: string, name: string) => {
    setDeleteConfirm({ type: 'subject', subId, title: `Subject "${name}" and all its contents` });
  };

  const handleDeleteAllSubjects = () => {
    setDeleteConfirm({ type: 'all', title: 'ALL Subjects created for this exam app' });
  };

  const handleDeleteUnit = (subId: string, unitId: string, name: string) => {
    setDeleteConfirm({ type: 'unit', subId, unitId, title: `Unit "${name}"` });
  };

  const handleDeleteTopic = (subId: string, unitId: string, topicId: string, name: string) => {
    setDeleteConfirm({ type: 'topic', subId, unitId, topicId, title: `Topic "${name}"` });
  };

  const handleDeleteSubtopic = (subId: string, unitId: string, topicId: string, subtopicName: string) => {
    setDeleteConfirm({ type: 'subtopic', subId, unitId, topicId, subtopicName, title: `Subtopic "${subtopicName}"` });
  };

  const handleUpdateSubject = (subId: string, currentName: string, imageUrl?: string, color?: string) => {
    setEditingItem({ type: 'subject', subId, name: currentName, imageUrl, color });
  };

  const handleUpdateUnit = (subId: string, unitId: string, currentName: string, imageUrl?: string) => {
    setEditingItem({ type: 'unit', subId, unitId, name: currentName, imageUrl });
  };

  const handleUpdateTopic = (subId: string, unitId: string, topicId: string, currentName: string, imageUrl?: string) => {
    setEditingItem({ type: 'topic', subId, unitId, topicId, name: currentName, imageUrl });
  };

  const handleUpdateSubtopic = (subId: string, unitId: string, topicId: string, oldName: string, imageUrl?: string) => {
    setEditingItem({ type: 'subtopic', subId, unitId, topicId, oldName, name: oldName, imageUrl });
  };

  const handleJsonImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploadingContent) return;
    setJsonUploadReport(null);
    if (!jsonInputText.trim()) {
      alert('Please paste JSON data or upload a .json / .xlsx / .csv file.');
      return;
    }

    setIsUploadingContent(true);
    try {
      let rawParsed;
      try {
        rawParsed = JSON.parse(jsonInputText);
      } catch (err: any) {
        setUploadStatusModal({
          isOpen: true,
          status: 'error',
          fileName: importFileName || 'Direct JSON Input',
          fileType: uploadFileType || 'json',
          title: 'Invalid File Syntax',
          message: 'The file or pasted input contains invalid JSON syntax: ' + err.message
        });
        setIsUploadingContent(false);
        return;
      }

      let parsed: any[] = [];
      if (Array.isArray(rawParsed)) {
        parsed = rawParsed;
      } else if (rawParsed && typeof rawParsed === 'object') {
        const possibleArrayKey = Object.keys(rawParsed).find(k => Array.isArray(rawParsed[k]));
        if (possibleArrayKey) {
          parsed = rawParsed[possibleArrayKey];
        } else {
          parsed = [rawParsed];
        }
      } else {
        setUploadStatusModal({
          isOpen: true,
          status: 'error',
          fileName: importFileName || 'Direct JSON Input',
          fileType: uploadFileType || 'json',
          title: 'Invalid Data Format',
          message: 'JSON root element must be an array of question records or an object containing an array.'
        });
        setIsUploadingContent(false);
        return;
      }

      if (parsed.length === 0) {
        setUploadStatusModal({
          isOpen: true,
          status: 'error',
          fileName: importFileName || 'Direct JSON Input',
          fileType: uploadFileType || 'json',
          title: 'Empty File',
          message: 'The submitted file or JSON data contains 0 records.'
        });
        setIsUploadingContent(false);
        return;
      }

      // AUTO-DETECT TYPE: MCQ vs Current Affairs
      const firstItem = parsed[0];
      const isCA = firstItem && (firstItem.content || firstItem.summary) && !firstItem.questionText && !firstItem.question;

      if (isCA) {
        const issues: UploadRecordIssue[] = [];
        const successfulRecords: SuccessfulRecordSummary[] = [];
        let successCount = 0;
        const validCA: CurrentAffairsItem[] = [];

        parsed.forEach((item, i) => {
          const rowNum = i + 1;
          if (!item.title || !item.content) {
            issues.push({
              rowNumber: rowNum,
              identifier: item.id || `ca-row-${rowNum}`,
              recordSnippet: item.title || 'Untitled',
              field: !item.title ? 'title' : 'content',
              issueType: 'rejected',
              reason: 'Missing required title or content field'
            });
            return;
          }
          const caId = `ca-json-${Date.now()}-${i}`;
          validCA.push({
            id: caId,
            appIds: item.targetApps || item.appIds || [selectedAdminApp.id],
            title: item.title,
            language: item.language || 'en',
            category: item.category || 'National',
            summary: item.summary || '',
            content: item.content,
            imageUrl: item.imageUrl || '',
            publishedDate: item.publishedAt || item.publishedDate || new Date().toISOString(),
            startDate: item.publishedAt || item.startDate || new Date().toISOString(),
            month: item.month || new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
            endDate: item.expiresAt || item.endDate || undefined,
            status: item.status || 'published'
          });
          successfulRecords.push({
            rowNumber: rowNum,
            identifier: caId,
            title: item.title,
            details: `Category: ${item.category || 'National'}`
          });
          successCount++;
        });

        if (validCA.length > 0) {
          try {
            await onSaveState({ ...state, currentAffairs: [...validCA, ...(state.currentAffairs || [])] });
            await logAuditAction('IMPORT_CURRENT_AFFAIRS', `batch-ca-${Date.now()}`, 'ca', `Imported ${validCA.length} items from ${importFileName || 'JSON'}`);
          } catch (dbErr: any) {
            setUploadStatusModal({
              isOpen: true,
              status: 'error',
              fileName: importFileName || 'Current Affairs File',
              title: 'Database Save Failed',
              message: 'Failed to write current affairs to database: ' + (dbErr?.message || 'Error')
            });
            setIsUploadingContent(false);
            return;
          }
        }

        const rep: DetailedUploadReport = {
          contentType: 'current_affairs',
          fileName: importFileName || 'Pasted Current Affairs',
          fileType: uploadFileType || 'json',
          fileSize: importFileSize || undefined,
          targetAppId: selectedAdminApp.id,
          targetAppName: selectedAdminApp.name,
          totalDetected: parsed.length,
          successfullyUploaded: successCount,
          rejectedCount: issues.filter(x => x.issueType === 'rejected').length,
          failedCount: issues.filter(x => x.issueType === 'failed').length,
          duplicatesSkipped: 0,
          issues,
          successfulRecords,
          timestamp: new Date().toLocaleString()
        };
        setDetailedReport(rep);
        setUploadStatusModal({
          isOpen: true,
          status: successCount > 0 ? 'success' : 'error',
          fileName: importFileName || 'Current Affairs Upload',
          fileType: uploadFileType || 'json',
          title: successCount > 0 ? 'Current Affairs Upload Successful' : 'Current Affairs Validation Failed',
          message: successCount > 0
            ? `Successfully imported and saved ${successCount} current affairs items. ${issues.length > 0 ? `${issues.length} items were rejected.` : 'All items passed validation.'}`
            : 'None of the submitted items passed validation.',
          details: {
            total: parsed.length,
            successCount,
            failedCount: issues.length,
            duplicatesCount: 0
          },
          onViewReport: () => setIsReportModalOpen(true)
        });
        setSuccessMsg(`Successfully imported ${successCount} Current Affairs items!`);
        setIsUploadingContent(false);
        return;
      }

      // Enforce strict 3-level hierarchy: Subject -> Unit -> Topic are mandatory
      if (!newSubId || !newUnitId || !newTopicId) {
        alert('Hierarchy Selection Error: Subject, Unit, and Topic are all mandatory. Please select all three levels before uploading MCQs.');
        setIsUploadingContent(false);
        return;
      }

      const targetSub = selectedAdminApp.syllabus.find(s => s.id === newSubId);
      if (!targetSub) {
        alert(`Validation Error: Target Subject "${newSubId}" does not exist in ${selectedAdminApp.name}.`);
        setIsUploadingContent(false);
        return;
      }

      const targetUnit = targetSub.units?.find(u => u.id === newUnitId);
      if (!targetUnit) {
        alert(`Validation Error: Target Unit "${newUnitId}" does not exist in Subject "${targetSub.name}". Please select a valid Unit.`);
        setIsUploadingContent(false);
        return;
      }

      const targetTopic = targetUnit.topics?.find(t => t.id === newTopicId);
      if (!targetTopic) {
        alert(`Validation Error: Target Topic "${newTopicId}" does not exist in Unit "${targetUnit.name}". Please select a valid Topic.`);
        setIsUploadingContent(false);
        return;
      }

      // Helper to extract ONLY individual question objects (flat list or clean array of questions)
      const extractQuestions = (obj: any): any[] => {
        let results: any[] = [];
        if (!obj) return results;

        if (Array.isArray(obj)) {
          obj.forEach(item => {
            results = results.concat(extractQuestions(item));
          });
        } else if (typeof obj === 'object') {
          const hasQText = obj.questionText || obj.question || obj.text || obj.q || obj.statement || obj.title;
          const hasOpts = obj.options || obj.optionA || obj.optA || obj.a || obj.op1;
          const hasAns = obj.correctOption || obj.correct || obj.answer || obj.ans || obj.right;

          if (hasQText && (hasOpts || hasAns)) {
            results.push(obj);
          } else {
            const childrenKeys = [
              obj.questions, obj.questionList, obj.mcqs, obj.items,
              obj.topics, obj.topicList, obj.subtopics, obj.subtopicList,
              obj.units, obj.unitList, obj.list, obj.chapters, obj.sections
            ];

            childrenKeys.forEach(arr => {
              if (Array.isArray(arr)) {
                arr.forEach(child => {
                  results = results.concat(extractQuestions(child));
                });
              }
            });
          }
        }
        return results;
      };

      const flatQuestionsList = extractQuestions(parsed);
      const finalQuestionsList = flatQuestionsList.length > 0 ? flatQuestionsList : parsed;

      const issues: UploadRecordIssue[] = [];
      const successfulRecords: SuccessfulRecordSummary[] = [];
      let successCount = 0;
      let duplicatesSkipped = 0;
      const batchId = `batch-${Date.now()}`;
      const fileName = importFileName || 'Pasted Content';
      const fileType = uploadFileType || 'json';

      // Set of existing question texts in this topic to detect and skip duplicate MCQs accurately
      const existingQuestionTextsInTopic = new Set(
        state.questions
          .filter(q => q.appId === selectedAdminApp.id && q.subjectId === targetSub.id && q.topicId === targetTopic.id)
          .map(q => q.questionText.trim().toLowerCase())
      );
      const batchSeenQuestionTexts = new Set<string>();

      const validQuestions: Question[] = [];

      for (let i = 0; i < finalQuestionsList.length; i++) {
        const q = finalQuestionsList[i];
        const rowNum = i + 1;
        const rawQText = q.questionText || q.question || q.text || q.q || q.title || q.statement || '';
        const qText = String(rawQText).trim();

        // 1. Validate Question Text
        if (!qText) {
          issues.push({
            rowNumber: rowNum,
            identifier: q.id || `row-${rowNum}`,
            recordSnippet: 'Empty question row',
            field: 'questionText',
            issueType: 'rejected',
            reason: 'Missing required question text: row is blank or text field not found'
          });
          continue;
        }

        // 2. Duplicate Detection
        const lowerQText = qText.toLowerCase();
        if (existingQuestionTextsInTopic.has(lowerQText) || batchSeenQuestionTexts.has(lowerQText)) {
          duplicatesSkipped++;
          issues.push({
            rowNumber: rowNum,
            identifier: q.id || `row-${rowNum}`,
            recordSnippet: qText.substring(0, 75) + '...',
            field: 'questionText',
            issueType: 'duplicate',
            reason: 'Duplicate question skipped: identical question text already exists in this topic or batch'
          });
          continue;
        }
        batchSeenQuestionTexts.add(lowerQText);

        // 3. Extract and Validate Options
        const optionsObj = extractOptions(q);
        if (!optionsObj.A || !optionsObj.B) {
          issues.push({
            rowNumber: rowNum,
            identifier: q.id || `row-${rowNum}`,
            recordSnippet: qText.substring(0, 75) + '...',
            field: 'options',
            issueType: 'rejected',
            reason: 'Missing required answer options: both Option A and Option B must be provided'
          });
          continue;
        }

        // 4. Validate Correct Option
        const correct = resolveCorrectOption(q, optionsObj);
        if (!['A', 'B', 'C', 'D'].includes(correct)) {
          issues.push({
            rowNumber: rowNum,
            identifier: q.id || `row-${rowNum}`,
            recordSnippet: qText.substring(0, 75) + '...',
            field: 'correctOption',
            issueType: 'rejected',
            reason: `Invalid correct answer reference "${correct}": must resolve to A, B, C, or D`
          });
          continue;
        }

        // 5. Resolve Set Name: NEVER automatically assign 'Set 1'
        let finalSetName: string | undefined = undefined;
        const rawSet = q.setName || q.set_name || q.setName || q.set || q.Set || q.setId || q.set_id || q.batch || q.batchName;
        if (rawSet !== undefined && rawSet !== null && String(rawSet).trim() !== '') {
          const setStr = String(rawSet).trim();
          finalSetName = /^\d+$/.test(setStr) ? `Set ${setStr}` : setStr;
        }

        const qId = `q-json-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`;
        validQuestions.push({
          id: qId,
          appId: selectedAdminApp.id,
          subjectId: targetSub.id,
          unitId: targetUnit.id,
          topicId: targetTopic.id,
          subtopic: '',
          subtopicId: '',
          setName: finalSetName,
          category: targetSub.category || 'prelims',
          questionText: qText,
          options: optionsObj,
          correctOption: correct,
          explanation: q.explanation || q.exp || q.solution || q.desc || '',
          language: q.language || q.lang || newQLanguage || 'en',
          importBatchId: batchId,
          importFileName: fileName
        });

        successfulRecords.push({
          rowNumber: rowNum,
          identifier: qId,
          title: qText.substring(0, 80) + (qText.length > 80 ? '...' : ''),
          details: `${targetSub.name} → ${targetUnit.name} → ${targetTopic.name}${finalSetName ? ` (${finalSetName})` : ''}`
        });

        successCount++;
      }

      // 6. Save to Database with explicit validation check
      if (validQuestions.length > 0) {
        try {
          const updatedQuestions = [...validQuestions, ...state.questions];
          const newBatch: ImportBatch = {
            id: batchId,
            fileName: fileName,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            count: successCount,
            appId: selectedAdminApp.id
          };
          const updatedBatches = [newBatch, ...(state.importBatches || [])];
          
          await onSaveState({ ...state, questions: updatedQuestions, importBatches: updatedBatches });
          await logAuditAction('IMPORT_MCQ', batchId, 'mcq', `Imported ${validQuestions.length} questions from ${fileName} under ${targetSub.name} → ${targetUnit.name} → ${targetTopic.name}`);
        } catch (dbErr: any) {
          console.error('Database write error during MCQ import:', dbErr);
          for (const vq of validQuestions) {
            issues.push({
              rowNumber: 'DB',
              identifier: vq.id,
              recordSnippet: vq.questionText.substring(0, 60),
              issueType: 'failed',
              reason: 'Database persistence error: ' + (dbErr?.message || 'Storage error')
            });
          }
          const failedReport: DetailedUploadReport = {
            contentType: 'mcq',
            fileName,
            fileType,
            fileSize: importFileSize || undefined,
            targetAppId: selectedAdminApp.id,
            targetAppName: selectedAdminApp.name,
            totalDetected: finalQuestionsList.length,
            successfullyUploaded: 0,
            rejectedCount: issues.filter(x => x.issueType === 'rejected').length,
            failedCount: validQuestions.length,
            duplicatesSkipped,
            issues,
            timestamp: new Date().toLocaleString()
          };
          setDetailedReport(failedReport);
          setUploadStatusModal({
            isOpen: true,
            status: 'error',
            fileName,
            fileType,
            fileSize: importFileSize || undefined,
            title: 'Database Persistence Failed',
            message: `Could not save questions to the database: ${dbErr?.message || 'Network/server error'}. No questions were saved.`,
            details: {
              total: finalQuestionsList.length,
              successCount: 0,
              failedCount: validQuestions.length,
              duplicatesCount: duplicatesSkipped
            },
            onViewReport: () => setIsReportModalOpen(true)
          });
          setIsUploadingContent(false);
          return;
        }
      }

      const report: DetailedUploadReport = {
        contentType: 'mcq',
        fileName,
        fileType,
        fileSize: importFileSize || undefined,
        targetAppId: selectedAdminApp.id,
        targetAppName: selectedAdminApp.name,
        totalDetected: finalQuestionsList.length,
        successfullyUploaded: successCount,
        rejectedCount: issues.filter(x => x.issueType === 'rejected').length,
        failedCount: issues.filter(x => x.issueType === 'failed').length,
        duplicatesSkipped,
        issues,
        successfulRecords,
        timestamp: new Date().toLocaleString()
      };

      setDetailedReport(report);
      setJsonUploadReport({
        total: finalQuestionsList.length,
        successCount,
        failedCount: issues.length,
        errors: issues.map((iss, idx) => ({ index: typeof iss.rowNumber === 'number' ? iss.rowNumber : idx, reason: iss.reason })),
        type: 'mcq'
      });

      // Post-Upload Confirmation Dialog
      setUploadStatusModal({
        isOpen: true,
        status: successCount > 0 ? 'success' : 'error',
        fileName,
        fileType,
        fileSize: importFileSize || undefined,
        title: successCount > 0 ? 'MCQ Batch Upload Complete' : 'MCQ Batch Validation Failed',
        message: successCount > 0
          ? `Successfully validated and saved ${successCount} MCQs under ${targetSub.name} → ${targetUnit.name} → ${targetTopic.name}. ${issues.length > 0 ? `${issues.length} items were rejected or skipped.` : 'All items passed validation.'}`
          : 'None of the submitted questions passed validation. Please review the detailed upload report for actionable fix suggestions.',
        details: {
          total: finalQuestionsList.length,
          successCount,
          failedCount: issues.length,
          duplicatesCount: duplicatesSkipped
        },
        onViewReport: () => setIsReportModalOpen(true)
      });

      setSuccessMsg(`Successfully imported ${successCount} MCQs under ${targetSub.name} → ${targetUnit.name} → ${targetTopic.name}!`);
      setJsonInputText('');
      setImportFileName('');
      setImportFileSize('');
      if (jsonFileInputRef.current) {
        jsonFileInputRef.current.value = '';
      }
      setTimeout(() => setSuccessMsg(null), 6000);
    } catch (err: any) {
      console.error('MCQ Upload parsing error:', err);
      setUploadStatusModal({
        isOpen: true,
        status: 'error',
        fileName: importFileName || 'Upload File',
        fileType: uploadFileType || undefined,
        fileSize: importFileSize || undefined,
        title: 'Upload Processing Failed',
        message: 'Syntax or processing error: ' + (err?.message || 'Failed to parse file data'),
      });
    } finally {
      setIsUploadingContent(false);
    }
  };

  // Syllabus Universal File Processor (.json, .xlsx, .csv)
  const processSyllabusFile = (file: File) => {
    setSyllabusFileName(file.name);
    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
      : `${Math.round(file.size / 1024)} KB`;
    setSyllabusFileSize(sizeStr);
    const fileNameLower = file.name.toLowerCase();

    if (fileNameLower.endsWith('.json')) {
      setSyllabusFileType('json');
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          const text = evt.target.result as string;
          setSyllabusInputText(text);
        }
      };
      reader.readAsText(file);
    } else if (fileNameLower.endsWith('.xlsx') || fileNameLower.endsWith('.xls') || fileNameLower.endsWith('.csv')) {
      setSyllabusFileType(fileNameLower.endsWith('.csv') ? 'csv' : 'excel');
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonRows: any[] = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
          setSyllabusInputText(JSON.stringify(jsonRows, null, 2));
        } catch (err: any) {
          alert('Spreadsheet parse error: ' + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Please upload a valid .json, .xlsx, .xls, or .csv file for syllabus content.');
    }
  };

  // Syllabus Content Processing & Detailed Report Generation
  const handleProcessSyllabusUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploadingSyllabus) return;
    if (!syllabusInputText.trim()) {
      alert('Please paste or upload syllabus data (.json, .xlsx, or .csv).');
      return;
    }

    setIsUploadingSyllabus(true);
    try {
      let rawParsed;
      try {
        rawParsed = JSON.parse(syllabusInputText);
      } catch (err: any) {
        alert('Invalid JSON syntax in syllabus data: ' + err.message);
        setIsUploadingSyllabus(false);
        return;
      }

      const rows: any[] = Array.isArray(rawParsed) ? rawParsed : [rawParsed];
      const issues: UploadRecordIssue[] = [];
      const successfulRecords: SuccessfulRecordSummary[] = [];
      let successCount = 0;
      let duplicatesSkipped = 0;

      // Work with clone of current syllabus
      const currentSyllabus: Subject[] = JSON.parse(JSON.stringify(selectedAdminApp.syllabus || []));

      // Two possible formats:
      // 1. Array of Subject objects with nested units and topics
      // 2. Tabular row array: { Subject, Unit, Topic, Subtopic, Category, ImageUrl }
      const isTabular = rows.length > 0 && (rows[0].Subject || rows[0].subject || rows[0].Unit || rows[0].unit);

      if (isTabular) {
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const rowNum = i + 1;
          const subName = String(row.Subject || row.subject || row['Subject Name'] || row.subjectName || '').trim();
          const unitName = String(row.Unit || row.unit || row['Unit Name'] || row.unitName || '').trim();
          const topicName = String(row.Topic || row.topic || row['Topic Name'] || row.topicName || '').trim();
          const subtopicName = String(row.Subtopic || row.subtopic || row['Subtopic Name'] || row.subtopicName || '').trim();
          const category = String(row.Category || row.category || 'prelims').toLowerCase();
          const validCat: 'prelims' | 'mains' | 'both' = (category === 'mains' || category === 'both') ? category : 'prelims';

          if (!subName) {
            issues.push({
              rowNumber: rowNum,
              recordSnippet: `Unit: "${unitName || '—'}", Topic: "${topicName || '—'}"`,
              field: 'Subject',
              issueType: 'rejected',
              reason: 'Missing required subject name'
            });
            continue;
          }

          if (!unitName) {
            issues.push({
              rowNumber: rowNum,
              recordSnippet: `Subject: "${subName}"`,
              field: 'Unit',
              issueType: 'rejected',
              reason: 'Missing unit name under subject'
            });
            continue;
          }

          if (!topicName) {
            issues.push({
              rowNumber: rowNum,
              recordSnippet: `Subject: "${subName}", Unit: "${unitName}"`,
              field: 'Topic',
              issueType: 'rejected',
              reason: 'Missing topic name under unit'
            });
            continue;
          }

          // Find or create subject
          let subj = currentSyllabus.find(s => s.name.toLowerCase() === subName.toLowerCase());
          if (!subj) {
            subj = {
              id: `subj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              name: subName,
              icon: 'BookOpen',
              category: validCat,
              units: []
            };
            currentSyllabus.push(subj);
          }

          // Find or create unit
          if (!subj.units) subj.units = [];
          let unit = subj.units.find(u => u.name.toLowerCase() === unitName.toLowerCase());
          if (!unit) {
            unit = {
              id: `unit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              name: unitName,
              topics: []
            };
            subj.units.push(unit);
          }

          // Find or create topic
          if (!unit.topics) unit.topics = [];
          let topic = unit.topics.find(t => t.name.toLowerCase() === topicName.toLowerCase());
          if (topic) {
            // If topic already exists and subtopic provided, append subtopic if not present
            if (subtopicName) {
              if (!topic.subtopics) topic.subtopics = [];
              if (!topic.subtopics.includes(subtopicName)) {
                topic.subtopics.push(subtopicName);
                successCount++;
                successfulRecords.push({
                  rowNumber: rowNum,
                  identifier: topic.id,
                  title: `${subName} → ${unitName} → ${topicName}`,
                  details: `Added subtopic: "${subtopicName}"`
                });
              } else {
                duplicatesSkipped++;
                issues.push({
                  rowNumber: rowNum,
                  identifier: topic.id,
                  recordSnippet: `${subName} / ${unitName} / ${topicName} / ${subtopicName}`,
                  field: 'Subtopic',
                  issueType: 'duplicate',
                  reason: 'Duplicate record skipped: Subtopic already exists in topic'
                });
              }
            } else {
              duplicatesSkipped++;
              issues.push({
                rowNumber: rowNum,
                identifier: topic.id,
                recordSnippet: `${subName} / ${unitName} / ${topicName}`,
                field: 'Topic',
                issueType: 'duplicate',
                reason: 'Duplicate record skipped: Topic already exists in unit'
              });
            }
          } else {
            const newTopic: Topic = {
              id: `topic-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              name: topicName,
              subtopics: subtopicName ? [subtopicName] : [],
              hasPractice: true,
              hasTheory: false
            };
            unit.topics.push(newTopic);
            successCount++;
            successfulRecords.push({
              rowNumber: rowNum,
              identifier: newTopic.id,
              title: `${subName} → ${unitName} → ${topicName}`,
              details: subtopicName ? `Subtopic: "${subtopicName}"` : 'Topic added'
            });
          }
        }
      } else {
        // Nested Subject hierarchy array format
        for (let i = 0; i < rows.length; i++) {
          const sObj = rows[i];
          const rowNum = i + 1;
          const sName = String(sObj.name || sObj.subjectName || '').trim();

          if (!sName) {
            issues.push({
              rowNumber: rowNum,
              recordSnippet: `Record #${rowNum}`,
              field: 'name',
              issueType: 'rejected',
              reason: 'Missing required subject name'
            });
            continue;
          }

          let subj = currentSyllabus.find(s => s.name.toLowerCase() === sName.toLowerCase());
          if (!subj) {
            subj = {
              id: sObj.id || `subj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              name: sName,
              icon: sObj.icon || 'BookOpen',
              category: (sObj.category === 'mains' || sObj.category === 'both') ? sObj.category : 'prelims',
              imageUrl: sObj.imageUrl,
              units: []
            };
            currentSyllabus.push(subj);
          }

          const rawUnits = sObj.units || sObj.unitList || [];
          if (!Array.isArray(rawUnits) || rawUnits.length === 0) {
            issues.push({
              rowNumber: rowNum,
              identifier: subj.id,
              recordSnippet: `Subject: "${sName}"`,
              field: 'units',
              issueType: 'rejected',
              reason: 'Missing unit reference: Subject has no units defined'
            });
            continue;
          }

          for (let uIdx = 0; uIdx < rawUnits.length; uIdx++) {
            const uObj = rawUnits[uIdx];
            const uName = String(uObj.name || uObj.unitName || '').trim();
            if (!uName) {
              issues.push({
                rowNumber: `${rowNum}.${uIdx + 1}`,
                recordSnippet: `Subject: "${sName}", Unit index #${uIdx + 1}`,
                field: 'unit.name',
                issueType: 'rejected',
                reason: 'Missing unit name under subject'
              });
              continue;
            }

            if (!subj.units) subj.units = [];
            let unit = subj.units.find(u => u.name.toLowerCase() === uName.toLowerCase());
            if (!unit) {
              unit = {
                id: uObj.id || `unit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                name: uName,
                topics: []
              };
              subj.units.push(unit);
            }

            const rawTopics = uObj.topics || uObj.topicList || [];
            if (!Array.isArray(rawTopics) || rawTopics.length === 0) {
              issues.push({
                rowNumber: `${rowNum}.${uIdx + 1}`,
                identifier: unit.id,
                recordSnippet: `Unit: "${uName}"`,
                field: 'topics',
                issueType: 'rejected',
                reason: 'Missing topic reference: Unit has no topics defined'
              });
              continue;
            }

            for (let tIdx = 0; tIdx < rawTopics.length; tIdx++) {
              const tObj = rawTopics[tIdx];
              const tName = String(tObj.name || tObj.topicName || (typeof tObj === 'string' ? tObj : '')).trim();
              if (!tName) {
                issues.push({
                  rowNumber: `${rowNum}.${uIdx + 1}.${tIdx + 1}`,
                  recordSnippet: `Unit: "${uName}", Topic index #${tIdx + 1}`,
                  field: 'topic.name',
                  issueType: 'rejected',
                  reason: 'Missing topic name under unit'
                });
                continue;
              }

              if (!unit.topics) unit.topics = [];
              const exists = unit.topics.some(t => t.name.toLowerCase() === tName.toLowerCase());
              if (exists) {
                duplicatesSkipped++;
                issues.push({
                  rowNumber: `${rowNum}.${uIdx + 1}.${tIdx + 1}`,
                  recordSnippet: `${sName} → ${uName} → ${tName}`,
                  field: 'topic',
                  issueType: 'duplicate',
                  reason: 'Duplicate record skipped: Topic already exists in unit'
                });
                continue;
              }

              const newTopic: Topic = {
                id: tObj.id || `topic-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                name: tName,
                subtopics: Array.isArray(tObj.subtopics) ? tObj.subtopics : [],
                hasPractice: tObj.hasPractice ?? true,
                hasTheory: tObj.hasTheory ?? false
              };
              unit.topics.push(newTopic);
              successCount++;
              successfulRecords.push({
                rowNumber: `${rowNum}.${uIdx + 1}.${tIdx + 1}`,
                identifier: newTopic.id,
                title: `${sName} → ${uName} → ${tName}`,
                details: `${(newTopic.subtopics || []).length} subtopics`
              });
            }
          }
        }
      }

      // Persist to database
      if (successCount > 0) {
        try {
          const updatedApps = state.apps.map(app => {
            if (app.id === selectedAdminApp.id) {
              return { ...app, syllabus: currentSyllabus };
            }
            return app;
          });
          await onSaveState({ ...state, apps: updatedApps });
          await logAuditAction(
            'IMPORT_SYLLABUS',
            `syllabus-${Date.now()}`,
            'app',
            `Bulk imported ${successCount} syllabus items for ${selectedAdminApp.name}`
          );
        } catch (dbErr: any) {
          console.error('Database write error during syllabus import:', dbErr);
          const failedReport: DetailedUploadReport = {
            contentType: 'syllabus',
            fileName: syllabusFileName || 'Syllabus Content',
            fileType: syllabusFileType || 'json',
            fileSize: syllabusFileSize || undefined,
            targetAppId: selectedAdminApp.id,
            targetAppName: selectedAdminApp.name,
            totalDetected: rows.length,
            successfullyUploaded: 0,
            rejectedCount: issues.filter(x => x.issueType === 'rejected').length,
            failedCount: successCount,
            duplicatesSkipped,
            issues: [
              ...issues,
              {
                rowNumber: 'DB',
                issueType: 'failed',
                reason: 'Database write error: ' + (dbErr?.message || 'Storage save failure')
              }
            ],
            timestamp: new Date().toLocaleString()
          };
          setDetailedReport(failedReport);
          setUploadStatusModal({
            isOpen: true,
            status: 'error',
            fileName: syllabusFileName || 'Syllabus Content',
            fileType: syllabusFileType || 'json',
            title: 'Syllabus Database Save Failed',
            message: `Could not save syllabus structure to database: ${dbErr?.message || 'Network error'}.`,
            onViewReport: () => setIsReportModalOpen(true)
          });
          setIsUploadingSyllabus(false);
          return;
        }
      }

      const rep: DetailedUploadReport = {
        contentType: 'syllabus',
        fileName: syllabusFileName || 'Syllabus Content',
        fileType: syllabusFileType || 'json',
        fileSize: syllabusFileSize || undefined,
        targetAppId: selectedAdminApp.id,
        targetAppName: selectedAdminApp.name,
        totalDetected: rows.length,
        successfullyUploaded: successCount,
        rejectedCount: issues.filter(x => x.issueType === 'rejected').length,
        failedCount: issues.filter(x => x.issueType === 'failed').length,
        duplicatesSkipped,
        issues,
        successfulRecords,
        timestamp: new Date().toLocaleString()
      };

      setDetailedReport(rep);
      setUploadStatusModal({
        isOpen: true,
        status: successCount > 0 ? 'success' : 'error',
        fileName: syllabusFileName || 'Syllabus Content',
        fileType: syllabusFileType || 'json',
        fileSize: syllabusFileSize || undefined,
        title: successCount > 0 ? 'Syllabus Content Upload Complete' : 'Syllabus Upload Validation Failed',
        message: successCount > 0
          ? `Successfully imported and saved ${successCount} syllabus topics across ${selectedAdminApp.name}. ${issues.length > 0 ? `${issues.length} records were rejected or duplicates.` : 'All records passed validation.'}`
          : 'None of the submitted syllabus records passed validation. View the detailed report for actionable fix suggestions.',
        details: {
          total: rows.length,
          successCount,
          failedCount: issues.length,
          duplicatesCount: duplicatesSkipped
        },
        onViewReport: () => setIsReportModalOpen(true)
      });

      setSyllabusInputText('');
      setSyllabusFileName('');
      setSyllabusFileSize('');
      if (syllabusFileInputRef.current) {
        syllabusFileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Syllabus upload error:', err);
      setUploadStatusModal({
        isOpen: true,
        status: 'error',
        fileName: syllabusFileName || 'Syllabus File',
        title: 'Syllabus Upload Processing Error',
        message: 'Could not process syllabus data: ' + (err?.message || 'Syntax error')
      });
    } finally {
      setIsUploadingSyllabus(false);
    }
  };

  // Helper to update selected app syllabus in state
  const updateAppSyllabus = async (newSyllabus: Subject[], successMessage: string) => {
    const updatedApps = state.apps.map(app => {
      if (app.id === selectedAdminApp.id) {
        return { ...app, syllabus: newSyllabus };
      }
      return app;
    });
    const newState: AppState = { ...state, apps: updatedApps };
    await onSaveState(newState);
    await logAuditAction('UPDATE_SYLLABUS', selectedAdminApp.id, 'app', successMessage);
    setSuccessMsg(successMessage);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleAddNewApp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = newAppId.trim().toLowerCase().replace(/\s+/g, '-');
    if (!cleanId || !newAppName.trim()) {
      alert('Please enter a valid App ID and App Name.');
      return;
    }

    const existingIndex = state.apps.findIndex(a => a.id === cleanId);
    const mediumsArr = newAppMediums.split(',').map(m => m.trim()).filter(Boolean);

    const newAppObj: AppConfig = {
      id: cleanId,
      name: newAppName.trim(),
      examCategory: newAppCategory,
      mediums: mediumsArr.length > 0 ? mediumsArr : ['EM', 'TM'],
      packageId: newAppPackageId.trim() || undefined,
      isActive: true,
      jurisdiction: newAppJurisdiction.trim() || undefined,
      locale: 'en',
      themeColor: newAppTheme,
      accentColor: newAppAccent,
      bannerImage: newAppBanner || 'https://images.unsplash.com/photo-1532375811400-2ac29100ef06?auto=format&fit=crop&w=1200&q=80',
      syllabus: existingIndex >= 0 ? state.apps[existingIndex].syllabus : []
    };

    let updatedApps = [...state.apps];
    if (existingIndex >= 0) {
      updatedApps[existingIndex] = { ...updatedApps[existingIndex], ...newAppObj };
      await logAuditAction('UPDATE_APP', cleanId, 'app', `Updated existing app record for ${newAppName}`);
      setSuccessMsg(`App ID "${cleanId}" already existed. Updated existing record successfully!`);
    } else {
      updatedApps.push(newAppObj);
      await logAuditAction('ADD_APP', cleanId, 'app', `Created new app ${newAppName}`);
      setSuccessMsg(`New application "${newAppName}" added successfully!`);
    }

    await onSaveState({ ...state, apps: updatedApps });
    setIsAddAppModalOpen(false);
    setNewAppId('');
    setNewAppName('');
    setSelectedAppId(cleanId);
    if (onSelectApp) onSelectApp(cleanId);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleUpdateAppConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const mediumsArr = configAppMediums.split(',').map(m => m.trim()).filter(Boolean);
    const updatedApps = state.apps.map(app => {
      if (app.id === selectedAdminApp.id) {
        return {
          ...app,
          name: configAppName,
          themeColor: configAppTheme,
          accentColor: configAppAccent,
          bannerImage: configAppBanner,
          locale: configAppLocale,
          examCategory: configAppCategory,
          mediums: mediumsArr,
          packageId: configAppPackageId.trim() || undefined,
          jurisdiction: configAppJurisdiction.trim() || undefined,
          isActive: configAppIsActive
        };
      }
      return app;
    });
    await onSaveState({ ...state, apps: updatedApps });
    await logAuditAction('UPDATE_APP_CONFIG', selectedAdminApp.id, 'app', `Updated configurations for ${configAppName}`);
    setSuccessMsg('App configurations updated successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleToggleAppActiveStatus = async (appId: string) => {
    const updatedApps = state.apps.map(app => {
      if (app.id === appId) {
        const nextStatus = !(app.isActive ?? true);
        return { ...app, isActive: nextStatus };
      }
      return app;
    });
    await onSaveState({ ...state, apps: updatedApps });
    await logAuditAction('TOGGLE_APP_STATUS', appId, 'app', `Toggled active status for app ${appId}`);
    setSuccessMsg(`App status updated successfully!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // --- SYLLABUS MANAGEMENT HANDLERS ---
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    const newSub: Subject = {
      id: `subj-${Date.now()}`,
      name: newSubjectName.trim(),
      icon: 'BookOpen',
      imageUrl: newSubjectImageUrl.trim() || undefined,
      color: newSubjectColor.trim() || undefined,
      category: newSubjectCategory,
      units: []
    };
    const updatedSyllabus = [...selectedAdminApp.syllabus, newSub];
    updateAppSyllabus(updatedSyllabus, `Subject "${newSub.name}" (${newSubjectCategory.toUpperCase()}) added successfully!`);
    setNewSubjectName('');
    setNewSubjectImageUrl('');
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim() || !targetSubjectId) return;
    const newUnit: Unit = {
      id: `unit-${Date.now()}`,
      name: newUnitName.trim(),
      imageUrl: newUnitImageUrl.trim() || undefined,
      topics: []
    };
    const updatedSyllabus = selectedAdminApp.syllabus.map(sub => {
      if (sub.id === targetSubjectId) {
        return { ...sub, units: [...sub.units, newUnit] };
      }
      return sub;
    });
    updateAppSyllabus(updatedSyllabus, `Unit "${newUnit.name}" added successfully!`);
    setNewUnitName('');
    setNewUnitImageUrl('');
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim() || !targetSubjectId || !targetUnitId) return;
    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      name: newTopicName.trim(),
      imageUrl: newTopicImageUrl.trim() || undefined,
      subtopics: [],
      subtopicImages: {}
    };
    const updatedSyllabus = selectedAdminApp.syllabus.map(sub => {
      if (sub.id === targetSubjectId) {
        const updatedUnits = sub.units.map(unit => {
          if (unit.id === targetUnitId) {
            return { ...unit, topics: [...unit.topics, newTopic] };
          }
          return unit;
        });
        return { ...sub, units: updatedUnits };
      }
      return sub;
    });
    updateAppSyllabus(updatedSyllabus, `Topic "${newTopic.name}" added successfully!`);
    setNewTopicName('');
    setNewTopicImageUrl('');
  };

  const handleAddSubtopic = (subId: string, unitId: string, topicId: string, subName: string, imgUrl?: string) => {
    if (!subName.trim()) return;
    const trimmed = subName.trim();
    const updatedSyllabus = selectedAdminApp.syllabus.map(sub => {
      if (sub.id === subId) {
        const updatedUnits = sub.units.map(unit => {
          if (unit.id === unitId) {
            const updatedTopics = unit.topics.map(topic => {
              if (topic.id === topicId) {
                if (topic.subtopics.includes(trimmed)) {
                  if (imgUrl?.trim()) {
                    return {
                      ...topic,
                      subtopicImages: { ...(topic.subtopicImages || {}), [trimmed]: imgUrl.trim() }
                    };
                  }
                  return topic;
                }
                const updatedImages = { ...(topic.subtopicImages || {}) };
                if (imgUrl?.trim()) {
                  updatedImages[trimmed] = imgUrl.trim();
                }
                return { 
                  ...topic, 
                  subtopics: [...topic.subtopics, trimmed],
                  subtopicImages: updatedImages
                };
              }
              return topic;
            });
            return { ...unit, topics: updatedTopics };
          }
          return unit;
        });
        return { ...sub, units: updatedUnits };
      }
      return sub;
    });
    updateAppSyllabus(updatedSyllabus, `Subtopic "${trimmed}" added successfully!`);
  };

  const handleClearAutoTopics = async () => {
    if (!window.confirm('Are you sure you want to delete all automatically created topics and subtopics? You will add them manually later.')) {
      return;
    }
    const updatedSyllabus = selectedAdminApp.syllabus.map(subject => ({
      ...subject,
      units: subject.units.map(unit => ({
        ...unit,
        topics: []
      }))
    }));
    await updateAppSyllabus(updatedSyllabus, 'Successfully deleted automatically created topics and subtopics! You can now add them manually.');
  };

  const handleClearAllSubtopics = async () => {
    if (!window.confirm('Are you sure you want to clear all subtopics across topics? You can add them manually later.')) {
      return;
    }
    const updatedSyllabus = selectedAdminApp.syllabus.map(subject => ({
      ...subject,
      units: subject.units.map(unit => ({
        ...unit,
        topics: unit.topics.map(topic => ({
          ...topic,
          subtopics: []
        }))
      }))
    }));
    await updateAppSyllabus(updatedSyllabus, 'Successfully cleared all subtopics!');
  };

  const handleSaveTopicTheory = async (updatedFields: Partial<Topic>) => {
    if (!adminTheoryTarget) return;

    const { subjectId, unitId, topic } = adminTheoryTarget;

    const updatedSyllabus = selectedAdminApp.syllabus.map(sub => {
      if (sub.id === subjectId) {
        return {
          ...sub,
          units: sub.units.map(unit => {
            if (unit.id === unitId) {
              return {
                ...unit,
                topics: unit.topics.map(t => {
                  if (t.id === topic.id) {
                    return {
                      ...t,
                      ...updatedFields
                    };
                  }
                  return t;
                })
              };
            }
            return unit;
          })
        };
      }
      return sub;
    });

    await updateAppSyllabus(updatedSyllabus, `Theory options and study notes for "${topic.name}" updated successfully!`);
    setAdminTheoryTarget(null);
  };

  const handlePopulateAllIndiaExams = async () => {
    if (!window.confirm('Populate and merge All India Competitive Exams Network? This will update all canonical exams across State PSCs, Police, Railways, SSC, Forest, Teaching (DSC/TET), and Endowments with proper language mediums (EM, TM, HM, UM) and rich theory notes without losing any existing questions.')) {
      return;
    }
    const mergedApps = mergeExamNetworkWithExistingDb(state.apps);
    const updatedState = { ...state, apps: mergedApps };
    await onSaveState(updatedState);
    alert('All India Competitive Exams Network merged and populated successfully! 25+ exam applications are now active.');
  };



  // Upgraded Multi-App Coupon Handler
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode || couponValue <= 0) {
      alert('Please enter a valid coupon code and discount value.');
      return;
    }
    if (selectedTargetAppIds.length === 0) {
      alert('Please select at least one target app.');
      return;
    }

    if (editingCoupon) {
      const updatedCoupons = (state.coupons || []).map(c => 
        c.id === editingCoupon.id 
          ? { 
              ...c, 
              code: couponCode.toUpperCase(), 
              type: couponType,
              discountValue: Number(couponValue),
              startDate: couponStartDate || new Date().toISOString(),
              expiryDate: couponEndDate || new Date(Date.now() + 30*24*60*60*1000).toISOString(),
              appIds: selectedTargetAppIds,
              maxTotalRedemptions: couponMaxRedemptions,
              perUserLimit: couponPerUserLimit,
              minPurchaseAmount: couponMinPurchase,
              maxDiscountAmount: couponMaxDiscount,
              status: couponStatus
            }
          : c
      );
      await onSaveState({ ...state, coupons: updatedCoupons });
      setSuccessMsg(`Coupon ${couponCode} updated successfully!`);
      setEditingCoupon(null);
    } else {
      const newCoupon: CouponCode = {
        id: `coupon-${Date.now()}`,
        code: couponCode.toUpperCase(),
        type: couponType,
        discountValue: Number(couponValue),
        startDate: couponStartDate || new Date().toISOString(),
        expiryDate: couponEndDate || new Date(Date.now() + 30*24*60*60*1000).toISOString(),
        appIds: selectedTargetAppIds,
        maxTotalRedemptions: couponMaxRedemptions,
        redemptionCount: 0,
        perUserLimit: couponPerUserLimit,
        minPurchaseAmount: couponMinPurchase,
        maxDiscountAmount: couponMaxDiscount,
        status: couponStatus,
      };
      const updatedCoupons = [newCoupon, ...(state.coupons || [])];
      await onSaveState({ ...state, coupons: updatedCoupons });
      await logAuditAction('CREATE_COUPON', newCoupon.id, 'coupon', `Code: ${newCoupon.code}`);
      setSuccessMsg(`Coupon ${newCoupon.code} created for ${selectedTargetAppIds.length} apps!`);
    }
    
    setCouponCode('');
    setCouponValue(0);
    setSelectedTargetAppIds([]);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Upgraded Multi-App Subscription Plan Handler
  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName || !planPrice) {
      alert('Please enter plan name and price.');
      return;
    }
    const priceNum = parseFloat(String(planPrice)) || 499;
    const targetAppId = selectedTargetAppIds.length > 0 ? selectedTargetAppIds[0] : (selectedAdminApp.id || 'all');

    if (editingSub) {
      const updatedSubs = (state.subscriptions || []).map(s => 
        s.id === editingSub.id 
          ? { 
              ...s, 
              appId: targetAppId || s.appId || 'all',
              name: planName, 
              price: priceNum, 
              currencySymbol: planSymbol,
              billingCycle: subBillingCycle,
              durationDays: subDurationDays,
              features: subFeatures.length > 0 ? subFeatures : ['Premium Content Access', 'Mock Test Series', 'Daily Current Affairs'],
              startDate: subStartDate || new Date().toISOString(),
              endDate: subEndDate || undefined,
              status: subStatus,
              trialPeriodDays: subTrialDays,
              introductoryPrice: subIntroPrice,
              isPopular
            }
          : s
      );
      await onSaveState({ ...state, subscriptions: updatedSubs });
      setSuccessMsg('Subscription plan updated successfully!');
      setEditingSub(null);
    } else {
      const newSub: SubscriptionPackage = {
        id: `sub-${Date.now()}`,
        appId: targetAppId,
        name: planName,
        price: priceNum,
        originalPrice: priceNum * 1.5,
        currencySymbol: planSymbol,
        billingCycle: subBillingCycle,
        durationDays: subDurationDays,
        features: subFeatures.length > 0 ? subFeatures : ['Premium Content Access', 'Mock Test Series', 'Daily Current Affairs'],
        isPopular,
        startDate: subStartDate || new Date().toISOString(),
        endDate: subEndDate || undefined,
        status: subStatus,
        trialPeriodDays: subTrialDays,
        introductoryPrice: subIntroPrice,
      };
      const updatedSubs = [newSub, ...(state.subscriptions || [])];
      await onSaveState({ ...state, subscriptions: updatedSubs });
      await logAuditAction('CREATE_SUBSCRIPTION', newSub.id, 'subscription', `Plan: ${newSub.name}`);
      setSuccessMsg(`Subscription plan added successfully for ${selectedAdminApp.name}!`);
    }
    
    setPlanName('');
    setPlanPrice(499);
    setSubFeatures([]);
    setSubStartDate('');
    setSubEndDate('');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleEditSub = (sub: SubscriptionPackage) => {
    setEditingSub(sub);
    setPlanName(sub.name);
    setPlanPrice(sub.price);
    setPlanSymbol(sub.currencySymbol || '₹');
    setSubBillingCycle(sub.billingCycle || 'monthly');
    setSubDurationDays(sub.durationDays || 30);
    setSubFeatures(sub.features || []);
    setSubStatus(sub.status || 'active');
    setIsPopular(!!sub.isPopular);
    setSubTrialDays(sub.trialPeriodDays || 0);
    setSubIntroPrice(sub.introductoryPrice || 0);
    setSubStartDate(sub.startDate ? sub.startDate.slice(0, 10) : '');
    setSubEndDate(sub.endDate ? sub.endDate.slice(0, 10) : '');
    setSelectedTargetAppIds([sub.appId || selectedAdminApp.id]);
  };

  const handleCancelEditSub = () => {
    setEditingSub(null);
    setPlanName('');
    setPlanPrice(499);
    setPlanSymbol('₹');
    setSubFeatures([]);
    setSubStartDate('');
    setSubEndDate('');
  };

  // Send Push Notification Handler
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMsg) {
      alert('Please enter notification title and message.');
      return;
    }
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      appIds: [selectedAdminApp.id],
      title: notifTitle,
      message: notifMsg,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
    const updatedNotifs = [newNotif, ...(state.notifications || [])];
    const newState: AppState = { ...state, notifications: updatedNotifs };
    await onSaveState(newState);
    await logAuditAction('SEND_NOTIFICATION', newNotif.id, 'notification', `Title: ${newNotif.title}`);
    setSuccessMsg(`Push notification successfully broadcasted to all students of ${selectedAdminApp.name}!`);
    setNotifTitle('');
    setNotifMsg('');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Upgraded Multi-App Poster / Banner Handler
  const handleSavePoster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!posterTitle.trim() || !posterImageUrl.trim()) {
      alert('Please enter banner title and provide an image.');
      return;
    }
    
    // Auto fallback to current app if none selected
    const targetApps = selectedTargetAppIds.length > 0 ? selectedTargetAppIds : [selectedAdminApp.id];
    const imageUrl = posterImageUrl.trim();
    
    if (editingPoster) {
      const updatedPosters = (state.posters || []).map(p => 
        p.id === editingPoster.id 
          ? { 
              ...p, 
              title: posterTitle.trim(), 
              subtitle: posterSubtitle.trim(), 
              badge: posterBadge.trim() || 'NEW', 
              imageUrl,
              targetType: posterTargetType,
              targetSubjectId: posterTargetType === 'subject' ? posterTargetSubjectId : undefined,
              actionUrl: posterTargetType === 'url' ? posterActionUrl.trim() : undefined,
              ctaText: posterCtaText.trim() || 'Explore Now',
              description: posterDescription.trim(),
              appIds: targetApps,
              startDate: posterStartDate || new Date().toISOString(),
              endDate: posterEndDate || new Date(Date.now() + 365*24*60*60*1000).toISOString(),
              position: posterPosition,
              status: posterStatus || 'active'
            }
          : p
      );
      await onSaveState({ ...state, posters: updatedPosters });
      setSuccessMsg('Banner poster updated successfully!');
      setEditingPoster(null);
    } else {
      const newPoster: Poster = {
        id: `poster-${Date.now()}`,
        appIds: targetApps,
        title: posterTitle.trim(),
        subtitle: posterSubtitle.trim() || 'Master Prelims & Mains with top exam drills.',
        badge: posterBadge.trim() || 'NEW',
        imageUrl,
        targetType: posterTargetType,
        targetSubjectId: posterTargetType === 'subject' ? posterTargetSubjectId : undefined,
        actionUrl: posterTargetType === 'url' ? posterActionUrl.trim() : undefined,
        ctaText: posterCtaText.trim() || 'Explore Now',
        description: posterDescription.trim(),
        position: posterPosition,
        startDate: posterStartDate || new Date().toISOString(),
        endDate: posterEndDate || new Date(Date.now() + 365*24*60*60*1000).toISOString(),
        status: posterStatus || 'active',
      };
      const updatedPosters = [newPoster, ...(state.posters || [])];
      await onSaveState({ ...state, posters: updatedPosters });
      await logAuditAction('CREATE_POSTER', newPoster.id, 'poster', `Title: ${newPoster.title}`);
      setSuccessMsg(`Banner successfully published to ${targetApps.length} apps!`);
    }
    
    setPosterTitle('');
    setPosterSubtitle('');
    setPosterImageUrl('');
    setSelectedTargetAppIds([selectedAdminApp.id]);
    setPosterDescription('');
    setPosterStartDate('');
    setPosterEndDate('');
    setPosterStatus('active');
    setPosterPosition('home-banner');
    setPosterTargetType('prelims');
    setPosterActionUrl('');
    setPosterCtaText('Explore Now');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const posterTargetSubjectSubjectIdOrFirst = (subId?: string) => {
    if (subId) return subId;
    return selectedAdminApp.syllabus[0]?.id || '';
  };

  const handleEditPoster = (poster: Poster) => {
    setEditingPoster(poster);
    setPosterTitle(poster.title);
    setPosterSubtitle(poster.subtitle || '');
    setPosterBadge(poster.badge || 'NEW');
    setPosterImageUrl(poster.imageUrl || '');
    setPosterTargetType(poster.targetType || 'prelims');
    setPosterTargetSubjectId(poster.targetSubjectId || selectedAdminApp.syllabus[0]?.id || '');
    setPosterActionUrl(poster.actionUrl || '');
    setPosterCtaText(poster.ctaText || 'Explore Now');
    setPosterDescription(poster.description || '');
    setSelectedTargetAppIds(poster.appIds && poster.appIds.length > 0 ? poster.appIds : [selectedAdminApp.id]);
    setPosterStartDate(poster.startDate || '');
    setPosterEndDate(poster.endDate || '');
    setPosterStatus(poster.status || 'active');
    setPosterPosition(poster.position || 'home-banner');
  };

  const handleCancelEditPoster = () => {
    setEditingPoster(null);
    setPosterTitle('');
    setPosterSubtitle('');
    setPosterBadge('NEW');
    setPosterImageUrl('');
    setPosterTargetType('prelims');
    setPosterTargetSubjectId(selectedAdminApp.syllabus[0]?.id || '');
    setPosterActionUrl('');
    setPosterCtaText('Explore Now');
    setPosterDescription('');
    setSelectedTargetAppIds([selectedAdminApp.id]);
    setPosterStartDate('');
    setPosterEndDate('');
    setPosterStatus('active');
    setPosterPosition('home-banner');
  };

  const handleMovePoster = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= (state.posters || []).length) return;
    const newPosters = [...state.posters];
    const temp = newPosters[index];
    newPosters[index] = newPosters[targetIndex];
    newPosters[targetIndex] = temp;
    await onSaveState({ ...state, posters: newPosters });
  };

  // Delete Handlers
  const handleDeleteQuestion = (qId: string) => {
    setDeleteConfirm({ type: 'question', targetId: qId, title: 'the selected question' });
  };

  const handleDeleteBatchQuestions = (batchId: string, fileName: string) => {
    const count = state.questions.filter(q => q.importBatchId === batchId).length;
    setDeleteFileTarget({
      fileName,
      title: 'Confirm File Deletion',
      message: 'Are you sure you want to delete this file? This action may not be reversible.',
      fileType: 'Uploaded MCQ Batch File',
      fileDetails: `Batch ID: ${batchId} • Contains ${count} questions across syllabus topics.`,
      recordCount: count,
      onConfirm: async () => {
        const updatedQs = state.questions.filter(q => q.importBatchId !== batchId);
        const updatedBatches = (state.importBatches || []).filter(b => b.id !== batchId);
        await onSaveState({ ...state, questions: updatedQs, importBatches: updatedBatches });
        await logAuditAction('DELETE_BATCH', batchId, 'mcq', `Deleted batch file: ${fileName} (${count} MCQs)`);
        setUploadStatusModal({
          isOpen: true,
          status: 'success',
          fileName,
          fileType: 'MCQ Batch',
          title: 'File Deleted Successfully',
          message: `The file "${fileName}" and all its ${count} questions have been permanently removed.`
        });
      }
    });
  };

  const handleDeleteBatchSubjectQuestions = (batchId: string, subjectId: string, subjectName: string) => {
    const count = state.questions.filter(q => q.importBatchId === batchId && q.subjectId === subjectId).length;
    const batch = (state.importBatches || []).find(b => b.id === batchId);
    const fileName = batch?.fileName || 'Batch File';
    setDeleteFileTarget({
      fileName: `${fileName} (${subjectName})`,
      title: 'Confirm File Section Deletion',
      message: `Are you sure you want to delete "${subjectName}" questions from this file? This action may not be reversible.`,
      fileType: 'Batch Subject Section',
      fileDetails: `Contains ${count} questions under subject "${subjectName}" in file "${fileName}".`,
      recordCount: count,
      onConfirm: async () => {
        const updatedQs = state.questions.filter(q => !(q.importBatchId === batchId && q.subjectId === subjectId));
        const remainingQuestionsInBatch = updatedQs.filter(q => q.importBatchId === batchId);
        let updatedBatches = [...(state.importBatches || [])];
        if (remainingQuestionsInBatch.length === 0) {
          updatedBatches = updatedBatches.filter(b => b.id !== batchId);
        } else {
          updatedBatches = updatedBatches.map(b => b.id === batchId ? { ...b, count: remainingQuestionsInBatch.length } : b);
        }
        await onSaveState({ ...state, questions: updatedQs, importBatches: updatedBatches });
        await logAuditAction('DELETE_BATCH_SUBJECT', batchId, 'mcq', `Deleted ${subjectName} questions from batch file`);
        setUploadStatusModal({
          isOpen: true,
          status: 'success',
          fileName: `${fileName} (${subjectName})`,
          fileType: 'Batch Subject Section',
          title: 'Subject Questions Deleted Successfully',
          message: `Removed ${count} questions for subject "${subjectName}" from the file.`
        });
      }
    });
  };

  const handleDeleteCoupon = (cId: string, code: string) => {
    setDeleteConfirm({ type: 'coupon', targetId: cId, title: `coupon "${code}"` });
  };

  const handleDeleteSub = (subId: string, planName: string) => {
    setDeleteConfirm({ type: 'subscription', targetId: subId, title: `subscription plan "${planName}"` });
  };

  const handleDeletePoster = (posterId: string, posterTitle: string) => {
    const poster = (state.posters || []).find(p => p.id === posterId);
    setDeleteFileTarget({
      fileName: posterTitle,
      title: 'Confirm Poster Deletion',
      message: 'Are you sure you want to delete this banner poster file? This action may not be reversible.',
      fileType: 'Banner Poster / Graphic',
      fileDetails: poster?.subtitle || `Banner position: ${poster?.position || 'home-banner'}`,
      onConfirm: async () => {
        const updatedPosters = (state.posters || []).filter(p => p.id !== posterId);
        await onSaveState({ ...state, posters: updatedPosters });
        await logAuditAction('DELETE_POSTER', posterId, 'poster', `Deleted banner poster: ${posterTitle}`);
        setUploadStatusModal({
          isOpen: true,
          status: 'success',
          fileName: posterTitle,
          fileType: 'Banner Poster',
          title: 'Banner Poster Deleted',
          message: `The banner poster "${posterTitle}" has been permanently removed.`
        });
      }
    });
  };

  const handleDeleteNotification = (notifId: string, notifTitle: string) => {
    setDeleteConfirm({ type: 'notification', targetId: notifId, title: `notification "${notifTitle}"` });
  };

  const handleDeleteTopicQuestions = (subjId: string, topId: string, topicName: string) => {
    const count = state.questions.filter(q => q.appId === selectedAdminApp.id && q.subjectId === subjId && q.topicId === topId).length;
    setBulkActionConfirm({
      action: 'Topic-wide MCQ Purge',
      description: `You are about to delete ALL ${count} questions in the topic "${topicName}". This will empty this topic completely.`,
      onConfirm: async () => {
        const updatedQs = state.questions.filter(q => !(q.appId === selectedAdminApp.id && q.subjectId === subjId && q.topicId === topId));
        await onSaveState({ ...state, questions: updatedQs });
        await logAuditAction('DELETE_TOPIC_MCQS', topId, 'mcq', `Deleted ${count} questions from topic: ${topicName}`);
        setSuccessMsg(`All questions in "${topicName}" have been purged.`);
      }
    });
  };

  // Reports & Analytics Logic
  const generateReportData = () => {
    let filtered = [...(state.purchases || [])];

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => {
        const value = String((p as any)[searchField] || '').toLowerCase();
        return value.includes(query);
      });
    }

    // Filters
    if (filterExam !== 'all') filtered = filtered.filter(p => p.appId === filterExam);
    if (filterPlanStatus !== 'all') filtered = filtered.filter(p => p.planStatus === filterPlanStatus);
    if (filterPlatform !== 'all') filtered = filtered.filter(p => p.platform === filterPlatform);
    if (filterCurrency !== 'all') filtered = filtered.filter(p => ((p as any).currency === filterCurrency) || (filterCurrency === 'INR' && p.currencySymbol === '₹') || (filterCurrency === 'USD' && p.currencySymbol === '$') || (filterCurrency === 'EUR' && p.currencySymbol === '€') || (filterCurrency === 'GBP' && p.currencySymbol === '£'));
    if (filterDate.trim()) {
      const dQuery = filterDate.toLowerCase().trim();
      filtered = filtered.filter(p => p.date.toLowerCase().includes(dQuery));
    }

    // Report Type specific filtering
    switch (reportType) {
      case 'refund':
        filtered = filtered.filter(p => p.paymentStatus === 'refunded' || (p.refundAmount && p.refundAmount > 0));
        break;
      case 'payment':
        filtered = filtered.filter(p => p.paymentStatus === 'success');
        break;
      case 'coupon':
        filtered = filtered.filter(p => p.couponUsed);
        break;
      case 'gst':
        filtered = filtered.filter(p => p.gstAmount && p.gstAmount > 0);
        break;
      case 'monthly':
        const currentMonth = new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' });
        filtered = filtered.filter(p => p.date.includes(currentMonth));
        break;
      case 'yearly':
        const currentYear = new Date().getFullYear().toString();
        filtered = filtered.filter(p => p.date.includes(currentYear));
        break;
      case 'audit_logs':
        let logs = [...(state.auditLogs || [])];
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          logs = logs.filter(l => 
            l.adminEmail.toLowerCase().includes(q) || 
            l.action.toLowerCase().includes(q) || 
            l.details?.toLowerCase().includes(q)
          );
        }
        return logs.map(l => ({
          'Timestamp': new Date(l.timestamp).toLocaleString(),
          'Admin': l.adminEmail,
          'Action': l.action,
          'Target': `${l.targetType} (${l.targetId})`,
          'Details': l.details || ''
        }));
      case 'current-affairs':
        return (state.currentAffairs || []).map(ca => ({
          'Date': new Date(ca.startDate).toLocaleDateString(),
          'Title': ca.title,
          'Category': ca.category,
          'Language': ca.language,
          'Status': ca.status,
          'Apps': ca.appIds?.length || 0,
          'ID': ca.id
        }));
      case 'usage_stats':
        return [
          { 'Metric': 'Total Apps', 'Value': state.apps.length },
          { 'Metric': 'Active Posters', 'Value': (state.posters || []).filter(p => p.status === 'active').length },
          { 'Metric': 'Scheduled Posters', 'Value': (state.posters || []).filter(p => p.status === 'scheduled').length },
          { 'Metric': 'Active Coupons', 'Value': (state.coupons || []).filter(c => c.status === 'active').length },
          { 'Metric': 'Coupon Redemptions', 'Value': (state.coupons || []).reduce((acc, c) => acc + (c.redemptionCount || 0), 0) },
          { 'Metric': 'Total Subscriptions', 'Value': (state.purchases || []).length },
          { 'Metric': 'Current Affairs Published', 'Value': (state.currentAffairs || []).filter(ca => ca.status === 'published').length },
          { 'Metric': 'Audit Logs', 'Value': (state.auditLogs || []).length }
        ];
    }

    // Map to display format based on report type
    return filtered.map(p => {
      const base = {
        'Date': p.date,
        'Student': p.userName,
        'Plan': p.packageName,
        'Amount': `${p.currencySymbol}${p.amount}`,
        'Status': p.paymentStatus,
        'Exam': p.appName
      };

      if (reportType === 'payment' || reportType === 'revenue') {
        return {
          ...base,
          'Txn ID': p.transactionId,
          'Method': p.method,
          'Platform': p.platform
        };
      }

      if (reportType === 'gst') {
        return {
          ...base,
          'GST Amount': `${p.currencySymbol}${p.gstAmount?.toFixed(2) || '0.00'}`,
          'Order ID': p.orderId
        };
      }

      if (reportType === 'coupon') {
        return {
          ...base,
          'Coupon Code': p.couponUsed || 'N/A',
          'Discount': p.couponUsed ? 'Applied' : 'None'
        };
      }

      if (reportType === 'refund') {
        return {
          ...base,
          'Refund Amt': `${p.currencySymbol}${p.refundAmount?.toFixed(2) || '0.00'}`,
          'Refund ID': `REF-${p.transactionId.split('-').pop()}`
        };
      }

      return {
        ...base,
        'Mobile': p.mobile,
        'Email': p.email,
        'Platform': p.platform
      };
    });
  };

  const exportToExcel = (data: any[], fileName: string) => {
    if (data.length === 0) {
      alert("No data to export");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const exportToCSV = (data: any[], fileName: string) => {
    if (data.length === 0) {
      alert("No data to export");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = (data: any[], fileName: string, title: string) => {
    if (data.length === 0) {
      alert("No data to export");
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`${selectedAdminApp?.name || 'Infinity Labs'} - Admin Reports`, 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`${title} | Generated on ${new Date().toLocaleString()}`, 14, 30);
    
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => Object.values(obj));

    (doc as any).autoTable({
      head: [headers],
      body: rows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillStyle: 'dark', fillColor: [15, 23, 42] }
    });

    doc.save(`${fileName}.pdf`);
  };

  // Filtered items for selected app
  const filteredQuestions = state.questions.filter(q => q.appId === selectedAdminApp.id);

  const deleteSubjectObj = selectedAdminApp.syllabus.find(s => s.id === deleteFilterSubjectId);
  const deleteTopicsList = deleteSubjectObj 
    ? deleteSubjectObj.units.flatMap(u => u.topics.map(t => ({ ...t, unitName: u.name })))
    : [];
  const deleteFilteredQuestions = state.questions.filter(q => 
    q.appId === selectedAdminApp.id && 
    q.subjectId === deleteFilterSubjectId && 
    q.topicId === deleteFilterTopicId
  );
  const filteredCoupons = (state.coupons || []).filter(c => c.appIds?.includes(selectedAdminApp.id) || c.appIds?.includes('all'));
  const filteredSubs = (state.subscriptions || []).filter(s => s.appId === selectedAdminApp.id || s.appId === 'all');
  const filteredPosters = (state.posters || []).filter(p => p.appIds?.includes(selectedAdminApp.id));
  const filteredNotifs = (state.notifications || []).filter(n => n.appIds?.includes(selectedAdminApp.id));
  const filteredCurrentAffairs = (state.currentAffairs || []).filter(ca => 
    ca.appIds?.includes(selectedAdminApp.id) || 
    ca.appIds?.includes('all') || 
    ca.appIds?.includes('all-india') || 
    ca.appIds?.includes(`all-${selectedAdminApp.countryId}`) ||
    ca.appIds?.includes(selectedAdminApp.countryId) ||
    (selectedAdminApp.countryId === 'india' && ca.appIds?.includes('all-india'))
  );

  // Current selected subject, unit, topic for MCQ form
  const currentSubObj = selectedAdminApp.syllabus.find(s => s.id === newSubId);
  const currentUnitObj = newUnitId ? currentSubObj?.units?.find(u => u.id === newUnitId) : undefined;
  const currentTopicObj = newTopicId ? currentUnitObj?.topics?.find(t => t.id === newTopicId) : undefined;

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF9F6] text-slate-900 flex flex-col font-sans overflow-hidden">
      {/* Top Universal Header - Luxurious Light Theme */}
      <div className="flex-none flex flex-col lg:flex-row items-stretch lg:items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-slate-200 gap-3 shadow-xs z-30">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-black shadow-2xs shrink-0">
              <ShieldCheck className="h-6 w-6 text-[#C5A059]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900">Admin Management Center</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider hidden sm:inline-block">
                  Full Network Control
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md font-medium">
                Managing <span className="text-amber-700 font-bold">{selectedAdminApp.name}</span> • Centralized Studio
              </p>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <button
              onClick={toggleFullScreen}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 rounded-xl bg-slate-100 border border-slate-200">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Global Controls: Direct App Management by App ID and App Name */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl text-xs border border-slate-200 shadow-2xs">
              <Layers className="h-3.5 w-3.5 text-[#C5A059] shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 hidden sm:inline">Active App:</span>
              <select
                value={selectedAppId}
                onChange={(e) => {
                  const appId = e.target.value;
                  setSelectedAppId(appId);
                  onSelectApp?.(appId);
                }}
                className="bg-transparent text-slate-900 font-black border-0 focus:outline-none cursor-pointer text-xs max-w-[210px] truncate"
              >
                {state.apps.map(app => (
                  <option key={app.id} value={app.id} className="bg-white text-slate-900 font-bold">
                    {app.name} ({app.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setIsWideLayout(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                isWideLayout ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{isWideLayout ? 'Wide View' : 'Focused'}</span>
            </button>
            <button
              onClick={toggleFullScreen}
              className="p-2 rounded-xl bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-2xs"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>

          <button
            onClick={() => { onSelectApp?.(selectedAppId); onClose(); }}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5"
          >
            <Globe className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Launch App</span>
          </button>

          {onLogout && (
            <button onClick={onLogout} className="px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold shadow-md">
              Logout
            </button>
          )}
          
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 border border-slate-700 hidden lg:block">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR: Grouped Navigation - Luxurious Light Theme */}
        <aside className="w-64 sm:w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 hidden lg:flex overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-8">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-3">
                <h4 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{group.title}</h4>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    if (item.adminOnly && !isAdmin) return null;
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full text-left px-4 py-3 rounded-2xl flex items-center justify-between transition-all group cursor-pointer ${
                          isActive 
                            ? 'bg-[#0F2942] text-white shadow-md' 
                            : 'text-slate-600 hover:bg-[#FAF8F5] hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-[#C5A059]' : 'text-slate-500 group-hover:text-[#0F2942]'}`} />
                          <span className="text-xs font-bold">{item.label}</span>
                        </div>
                        {item.count !== undefined && (
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            {item.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-auto p-4 border-t border-slate-200 bg-[#FAF8F5]">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Role</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 capitalize">{adminRole} Mode</span>
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN WORK AREA */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#FAF9F6] overflow-hidden relative">
          {/* Mobile Grouped Nav Scroller */}
          <div className="lg:hidden flex-none bg-white border-b border-slate-200 overflow-x-auto no-scrollbar py-2 px-4">
            <div className="flex gap-2">
              {navGroups.flatMap(g => g.items).map((item) => {
                if (item.adminOnly && !isAdmin) return null;
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive ? 'bg-[#0F2942] text-white shadow-sm' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Success / Alert Banner */}
          <AnimatePresence>
            {successMsg && (
              <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="absolute top-0 left-0 right-0 z-40 p-4"
              >
                <div className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-2xl flex items-center gap-3 max-w-2xl mx-auto border border-emerald-500/50">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span>{successMsg}</span>
                  <button onClick={() => setSuccessMsg(null)} className="ml-auto p-1 hover:bg-white/20 rounded-lg">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab Content Wrapper */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
            <div className={`transition-all duration-300 mx-auto ${isWideLayout ? 'w-full' : 'max-w-7xl'}`}>

          
          {/* TAB 0: MASTER DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Registered Apps', value: state.apps.length, icon: Smartphone, color: 'indigo', detail: `${state.apps.filter(a => a.syllabus.length > 0).length} Active Content` },
                  { 
                    label: 'Promotions', 
                    value: state.posters.length, 
                    icon: ImageIcon, 
                    color: 'amber',
                    detail: `${state.posters.filter(p => p.status === 'active').length} Active • ${state.posters.filter(p => p.status === 'scheduled').length} Future`
                  },
                  { 
                    label: 'Coupon Status', 
                    value: state.coupons.length, 
                    icon: Tag, 
                    color: 'emerald',
                    detail: `${state.coupons.reduce((sum, c) => sum + (c.redemptionCount || 0), 0)} Redemptions`
                  },
                  { 
                    label: 'System Revenue', 
                    value: `₹${state.purchases?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0).toLocaleString('en-IN')}`, 
                    icon: Wallet, 
                    color: 'rose',
                    detail: `${state.purchases?.length || 0} Successful Transactions`
                  },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-xl`} style={{ backgroundColor: `rgba(var(--${stat.color}-500-rgb), 0.1)` }}>
                        <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Live Metrics</span>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-white">{stat.value}</div>
                      <div className="text-xs font-bold text-slate-300">{stat.label}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{stat.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bookmark & Saved Questions Vault Overview */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <BookmarkCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">Bookmark & Saved Questions Analytics</h3>
                      <p className="text-xs text-slate-400">Aggregate telemetry on saved MCQs and Current Affairs</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 self-start sm:self-auto">
                    Isolated Per-User & App
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/60">
                    <div className="text-[11px] text-slate-400 font-medium">MCQ Question Bank</div>
                    <div className="text-xl font-black text-white mt-0.5">{state.questions.length} Active</div>
                  </div>
                  <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/60">
                    <div className="text-[11px] text-slate-400 font-medium">Current Affairs Vault</div>
                    <div className="text-xl font-black text-cyan-400 mt-0.5">{state.currentAffairs.length} Articles</div>
                  </div>
                  <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/60">
                    <div className="text-[11px] text-slate-400 font-medium">Mock Test Series</div>
                    <div className="text-xl font-black text-purple-400 mt-0.5">{state.mockTests?.length || 0} Created</div>
                  </div>
                  <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/60">
                    <div className="text-[11px] text-slate-400 font-medium">Persistence Sync</div>
                    <div className="text-xl font-black text-emerald-400 mt-0.5">Firestore & Local</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Schedules */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl lg:col-span-1">
                  <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-indigo-400" />
                      Future Activations
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {[
                      ...state.posters.map(p => ({ ...p, type: 'Poster' })),
                      ...state.coupons.map(c => ({ ...c, type: 'Coupon', title: c.code })),
                      ...state.currentAffairs.map(ca => ({ ...ca, type: 'News' })),
                      ...state.subscriptions.map(s => ({ ...s, type: 'Plan', title: s.name }))
                    ]
                    .filter(item => item.status === 'scheduled')
                    .sort((a, b) => new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime())
                    .slice(0, 6)
                    .map((item, i) => (
                      <div key={i} className="p-4 hover:bg-slate-800/30 transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-black ${
                            item.type === 'Poster' ? 'text-amber-400' : item.type === 'Coupon' ? 'text-emerald-400' : 'text-sky-400'
                          }`}>
                            {item.type[0]}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white truncate max-w-[120px]">{item.title}</div>
                            <div className="text-[10px] text-slate-500">{item.type} • {new Date(item.startDate || 0).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[9px] font-black rounded-md uppercase">Wait</span>
                      </div>
                    ))}
                    {(state.posters.filter(p => p.status === 'scheduled').length === 0 && 
                      state.coupons.filter(c => c.status === 'scheduled').length === 0) && (
                      <div className="p-8 text-center text-slate-500 text-xs italic">No future activations scheduled.</div>
                    )}
                  </div>
                </div>

                {/* Audit Logs Preview */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl lg:col-span-2">
                  <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Security Audit Trail
                    </h3>
                    <button 
                      onClick={() => setActiveTab('reports')}
                      className="text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:text-emerald-300"
                    >
                      Full Audit Logs
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-500 font-black uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-3">Timestamp</th>
                          <th className="px-6 py-3">Administrator</th>
                          <th className="px-6 py-3">Action</th>
                          <th className="px-6 py-3">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {(state.auditLogs || []).slice(0, 8).map((log, i) => (
                          <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                            <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-200">
                              {log.adminEmail.split('@')[0]}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-md font-black text-[9px] uppercase ${
                                log.action.includes('DELETE') ? 'bg-rose-500/10 text-rose-400' : 
                                log.action.includes('CREATE') ? 'bg-emerald-500/10 text-emerald-400' :
                                'bg-indigo-500/10 text-indigo-400'
                              }`}>
                                {log.action.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-400 italic">
                              {log.details || `Modified ${log.targetType} (${log.targetId})`}
                            </td>
                          </tr>
                        ))}
                        {(!state.auditLogs || state.auditLogs.length === 0) && (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic">
                              Initial audit trail is empty. System actions will appear here.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* App Distribution */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl lg:col-span-3">
                  <div className="p-6 border-b border-slate-800">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-indigo-400" />
                      Multi-App Content Distribution
                    </h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {state.apps.slice(0, 8).map((app, i) => {
                      const appPosters = state.posters.filter(p => p.appIds?.includes(app.id));
                      const appCoupons = state.coupons.filter(c => c.appIds?.includes(app.id));
                      const appCA = state.currentAffairs.filter(ca => ca.appIds?.includes(app.id));
                      
                      return (
                        <div key={i} className="space-y-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-200 truncate pr-2">{app.name}</span>
                            <span className="text-slate-500 font-mono text-[9px] shrink-0">{app.id}</span>
                          </div>
                          <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-slate-800">
                            <div className="bg-amber-500" style={{ width: `${Math.min(100, appPosters.length * 10)}%` }} />
                            <div className="bg-emerald-500" style={{ width: `${Math.min(100, appCoupons.length * 10)}%` }} />
                            <div className="bg-sky-500" style={{ width: `${Math.min(100, appCA.length * 10)}%` }} />
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {appPosters.length} Posters</span>
                            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {appCoupons.length} Coupons</span>
                            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-sky-500" /> {appCA.length} News</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: ADVANCED REPORTS & ANALYTICS */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Search & Filter Section */}
              <div className="bg-white text-slate-900 p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="relative flex-1 w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder={`Search by ${searchField.replace(/([A-Z])/g, ' $1').toLowerCase()}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                    />
                    <select
                      value={searchField}
                      onChange={(e) => setSearchField(e.target.value as any)}
                      className="absolute right-2 top-2 bottom-2 px-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-800 uppercase tracking-wider outline-none cursor-pointer"
                    >
                      <option value="mobile">Mobile</option>
                      <option value="email">Email</option>
                      <option value="transactionId">Txn ID</option>
                      <option value="orderId">Order ID</option>
                      <option value="packageName">Plan</option>
                      <option value="paymentStatus">Status</option>
                      <option value="platform">Platform</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        setFilterExam('all');
                        setFilterPlanStatus('all');
                        setFilterDate('');
                        setFilterPlatform('all');
                        setFilterCurrency('all');
                      }}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black transition-all flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" /> Reset
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Exam</label>
                    <select value={filterExam} onChange={(e) => setFilterExam(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer">
                      <option value="all">All Exams</option>
                      {state.apps.map(app => <option key={app.id} value={app.id}>{app.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Plan Status</label>
                    <select value={filterPlanStatus} onChange={(e) => setFilterPlanStatus(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer">
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Date</label>
                    <input type="text" placeholder="Aug 2026" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Platform</label>
                    <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer">
                      <option value="all">All Platforms</option>
                      <option value="Android">Android</option>
                      <option value="iOS">iOS</option>
                      <option value="Web">Web</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Currency</label>
                    <select value={filterCurrency} onChange={(e) => setFilterCurrency(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer">
                      <option value="all">All Currencies</option>
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Reports Generation Section */}
              <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <BarChart3 className="h-6 w-6 text-indigo-600" />
                      Reports Hub
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Generate detailed financial and subscription audit logs.</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => exportToExcel(generateReportData(), `Elite_Mastery_${reportType}_Report`)}
                      className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all shadow-sm border border-emerald-100 flex items-center gap-2 text-xs font-black"
                    >
                      <FileSpreadsheet className="h-4 w-4" /> EXCEL
                    </button>
                    <button 
                      onClick={() => exportToCSV(generateReportData(), `Elite_Mastery_${reportType}_Report`)}
                      className="p-3 bg-amber-50 text-amber-700 rounded-2xl hover:bg-amber-100 transition-all shadow-sm border border-amber-100 flex items-center gap-2 text-xs font-black"
                    >
                      <FileText className="h-4 w-4" /> CSV
                    </button>
                    <button 
                      onClick={() => exportToPDF(generateReportData(), `Elite_Mastery_${reportType}_Report`, `${reportType.toUpperCase()} REPORT`)}
                      className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all shadow-sm border border-rose-100 flex items-center gap-2 text-xs font-black"
                    >
                      <Download className="h-4 w-4" /> PDF
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      title: 'Financial & Transactional Reports',
                      items: [
                        { id: 'revenue', label: 'Revenue', icon: Wallet },
                        { id: 'payment', label: 'Payments', icon: Receipt },
                        { id: 'refund', label: 'Refunds', icon: RefreshCw },
                        { id: 'gst', label: 'GST Filings', icon: ShieldCheck },
                        { id: 'monthly', label: 'Monthly Recap', icon: CalendarDays },
                        { id: 'yearly', label: 'Annual Summary', icon: BarChart3 },
                      ]
                    },
                    {
                      title: 'Growth & Content Audit',
                      items: [
                        { id: 'subscription', label: 'Subscribers', icon: UserIcon },
                        { id: 'coupon', label: 'Coupon Usage', icon: Tag },
                        { id: 'current_affairs', label: 'News Archive', icon: Globe },
                        { id: 'usage_stats', label: 'Platform Stats', icon: Zap },
                        { id: 'audit_logs', label: 'Admin Logs', icon: ShieldCheck },
                      ]
                    }
                  ].map((group, gIdx) => (
                    <div key={gIdx} className="space-y-3">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{group.title}</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {group.items.map((btn) => (
                          <button
                            key={btn.id}
                            onClick={() => setReportType(btn.id as any)}
                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2 group ${
                              reportType === btn.id 
                                ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-105' 
                                : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-indigo-50'
                            }`}
                          >
                            <btn.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${reportType === btn.id ? 'text-indigo-400' : 'text-slate-400'}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-center">{btn.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-200/50 border-b border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                          {generateReportData().length > 0 && Object.keys(generateReportData()[0]).map((key) => (
                            <th key={key} className="p-4">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                        {generateReportData().map((row, i) => (
                          <tr key={i} className="bg-white hover:bg-indigo-50/30 transition-colors">
                            {Object.values(row).map((val: any, j) => (
                              <td key={j} className="p-4 whitespace-nowrap">
                                {val === 'success' || val === 'active' ? (
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] uppercase">{val}</span>
                                ) : val === 'failed' || val === 'cancelled' || val === 'refunded' ? (
                                  <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-lg text-[9px] uppercase">{val}</span>
                                ) : val}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {generateReportData().length === 0 && (
                          <tr>
                            <td colSpan={8} className="p-12 text-center text-slate-400 font-medium italic">
                              No records found for the current selection. Adjust your filters or select a different report type.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Mode Switcher: Bulk File Upload vs Single Question Entry */}
              <div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 w-fit">
                <button
                  type="button"
                  onClick={() => setUploadMode('bulk')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                    uploadMode === 'bulk'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <UploadCloud className="h-4 w-4" />
                  <span>Bulk Upload (Excel / CSV / JSON)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('single')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                    uploadMode === 'single'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <FilePlus className="h-4 w-4" />
                  <span>⚡ Single MCQ Fast Entry</span>
                </button>
              </div>

              {/* MODE 1: BULK FILE UPLOAD (EXCEL, CSV, JSON) */}
              {uploadMode === 'bulk' && (
                <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold shrink-0">
                        <UploadCloud className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-black text-white">
                          Universal Bulk Upload Studio ({selectedAdminApp.name})
                        </h4>
                        <p className="text-xs text-slate-400">
                          Import hundreds of MCQs instantly via Excel (<span className="text-emerald-400">.xlsx</span>), CSV (<span className="text-sky-400">.csv</span>), or JSON (<span className="text-amber-400">.json</span>).
                        </p>
                      </div>
                    </div>

                    {/* Download Sample Templates */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400">Sample Templates:</span>
                      <button
                        type="button"
                        onClick={downloadSampleExcel}
                        className="px-2.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="Download sample Excel (.xlsx) file"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Excel Template</span>
                      </button>
                      <button
                        type="button"
                        onClick={downloadSampleCSV}
                        className="px-2.5 py-1.5 bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-700/60 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="Download sample CSV (.csv) file"
                      >
                        <FileCode className="h-3.5 w-3.5 text-sky-400" />
                        <span>CSV Template</span>
                      </button>
                      <button
                        type="button"
                        onClick={downloadSampleJSON}
                        className="px-2.5 py-1.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/60 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="Download sample JSON (.json) file"
                      >
                        <FileJson className="h-3.5 w-3.5 text-amber-400" />
                        <span>JSON Template</span>
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleJsonImport} className="space-y-5">
                    {/* Subject, Unit, Topic & Subtopic Target Hierarchy */}
                    <div className="space-y-3 bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800">
                      <div className="text-xs font-black text-slate-300 flex items-center justify-between gap-2 uppercase tracking-wider flex-wrap">
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-indigo-400" />
                          <span>Step 1: Choose Target Hierarchy (Subject → Unit → Topic)</span>
                        </div>
                        <span className="text-[10px] text-amber-400 font-bold lowercase bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded-md">
                          * all 3 levels required
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        {/* 1. Subject */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">
                            1. Subject <span className="text-amber-400">*</span>
                          </label>
                          <select
                            value={newSubId}
                            onChange={(e) => {
                              setNewSubId(e.target.value);
                              setNewUnitId('');
                              setNewTopicId('');
                            }}
                            required
                            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold cursor-pointer focus:border-indigo-500 focus:outline-none"
                          >
                            <option value="">-- Select Subject * --</option>
                            {selectedAdminApp.syllabus.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* 2. Unit */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">
                            2. Unit <span className="text-amber-400">*</span>
                          </label>
                          <select
                            value={newUnitId}
                            onChange={(e) => {
                              setNewUnitId(e.target.value);
                              setNewTopicId('');
                            }}
                            required
                            disabled={!newSubId || !currentSubObj?.units || currentSubObj.units.length === 0}
                            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-medium disabled:opacity-40 cursor-pointer focus:border-indigo-500 focus:outline-none"
                          >
                            <option value="">
                              {!newSubId 
                                ? '-- Select Subject first --' 
                                : (!currentSubObj?.units || currentSubObj.units.length === 0)
                                ? '-- No Units in this Subject --'
                                : '-- Select Unit * --'
                              }
                            </option>
                            {currentSubObj?.units?.map((u) => (
                              <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* 3. Topic */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">
                            3. Topic <span className="text-amber-400">*</span>
                          </label>
                          <select
                            value={newTopicId}
                            onChange={(e) => {
                              setNewTopicId(e.target.value);
                            }}
                            required
                            disabled={!newUnitId || !currentUnitObj?.topics || currentUnitObj.topics.length === 0}
                            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-medium disabled:opacity-40 cursor-pointer focus:border-indigo-500 focus:outline-none"
                          >
                            <option value="">
                              {!newUnitId 
                                ? '-- Select Unit first --' 
                                : (!currentUnitObj?.topics || currentUnitObj.topics.length === 0)
                                ? '-- No Topics in this Unit --'
                                : '-- Select Topic * --'
                              }
                            </option>
                            {currentUnitObj?.topics?.map((t) => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Hierarchy Live Indicator Breadcrumb */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-[11px] flex-wrap">
                        <span className="font-black text-indigo-400 uppercase tracking-wider">Target Placement:</span>
                        <span className={`px-2.5 py-0.5 rounded-lg font-bold border ${newSubId && currentSubObj ? 'bg-indigo-900/60 border-indigo-700/60 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                          Subject: {currentSubObj?.name || 'Required *'}
                        </span>
                        <span className="text-slate-500">➔</span>
                        <span className={`px-2.5 py-0.5 rounded-lg font-bold border ${newUnitId && currentUnitObj ? 'bg-amber-900/50 border-amber-700/60 text-amber-200' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                          Unit: {currentUnitObj ? currentUnitObj.name : 'Selection Required *'}
                        </span>
                        <span className="text-slate-500">➔</span>
                        <span className={`px-2.5 py-0.5 rounded-lg font-bold border ${newTopicId && currentTopicObj ? 'bg-emerald-900/50 border-emerald-700/60 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                          Topic: {currentTopicObj ? currentTopicObj.name : 'Selection Required *'}
                        </span>
                      </div>
                    </div>

                    {/* Step 2: Drag & Drop / Mobile File Select Zone */}
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingJson(true); }}
                      onDragLeave={() => setIsDraggingJson(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingJson(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) processUploadedFile(file);
                      }}
                      onClick={(e) => {
                        // Allow tapping anywhere on dropzone on mobile to open file picker unless a button was tapped
                        const target = e.target as HTMLElement;
                        if (!target.closest('button')) {
                          if (jsonFileInputRef.current) {
                            jsonFileInputRef.current.value = '';
                            jsonFileInputRef.current.click();
                          }
                        }
                      }}
                      className={`p-5 sm:p-6 rounded-3xl border-2 border-dashed transition-all cursor-pointer ${
                        isDraggingJson 
                          ? 'border-indigo-400 bg-indigo-950/60 scale-[1.01]' 
                          : importFileName
                          ? 'border-emerald-600/70 bg-emerald-950/20'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="file"
                        ref={jsonFileInputRef}
                        accept=".json,.csv,.xlsx,.xls,application/json,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                        onClick={(e) => {
                          (e.target as HTMLInputElement).value = '';
                        }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) processUploadedFile(file);
                        }}
                        className="hidden"
                      />

                      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                            importFileName ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          }`}>
                            {importFileName ? <FileCheck className="h-6 w-6" /> : <UploadCloud className="h-6 w-6" />}
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs sm:text-sm font-black text-white flex items-center gap-2 flex-wrap">
                              <span>{importFileName ? 'File Ready for Processing' : 'Drag & Drop or Tap to Upload'}</span>
                              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md text-[10px] font-mono">
                                .json / .xlsx / .csv
                              </span>
                            </div>

                            {importFileName ? (
                              <div className="flex items-center gap-2 flex-wrap text-xs">
                                <span className="text-emerald-400 font-bold break-all">📄 {importFileName}</span>
                                {importFileSize && (
                                  <span className="px-2 py-0.5 bg-emerald-900/50 text-emerald-300 rounded text-[10px] font-bold border border-emerald-700/50">
                                    {importFileSize}
                                  </span>
                                )}
                                {uploadFileType && (
                                  <span className="px-2 py-0.5 bg-indigo-900/50 text-indigo-300 rounded text-[10px] font-bold uppercase border border-indigo-700/50">
                                    {uploadFileType}
                                  </span>
                                )}
                                {parsedPreviewCount !== null && (
                                  <span className="px-2 py-0.5 bg-amber-900/50 text-amber-300 rounded text-[10px] font-bold border border-amber-700/50">
                                    {parsedPreviewCount} questions parsed
                                  </span>
                                )}
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-extrabold">
                                  ✓ Valid Structure
                                </span>
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-400">
                                Tap here or click button below to select from your phone, tablet, or PC.
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 pt-2 md:pt-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (jsonFileInputRef.current) {
                                jsonFileInputRef.current.value = '';
                                jsonFileInputRef.current.click();
                              }
                            }}
                            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md min-h-[44px]"
                          >
                            <Upload className="h-4 w-4" />
                            <span>{importFileName ? 'Choose Another File' : 'Browse Phone / PC Files'}</span>
                          </button>

                          {importFileName && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setImportFileName('');
                                setImportFileSize('');
                                setJsonInputText('');
                                setParsedPreviewCount(null);
                                if (jsonFileInputRef.current) {
                                  jsonFileInputRef.current.value = '';
                                }
                              }}
                              className="px-3.5 py-3 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                              title="Clear selected file"
                            >
                              <X className="h-4 w-4" /> Clear File
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Raw Text Editor (Paste or Preview) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300 flex items-center gap-2">
                          <FileCode className="h-4 w-4 text-emerald-400" />
                          <span>Direct Paste / Preview Editor (JSON or CSV Text)</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {jsonInputText ? `${jsonInputText.length} characters ready` : 'Empty'}
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        value={jsonInputText}
                        onChange={(e) => setJsonInputText(e.target.value)}
                        placeholder={`Paste JSON array or CSV text here directly:\n[\n  {\n    "questionText": "What is the capital of Andhra Pradesh?",\n    "options": { "A": "Amaravati", "B": "Visakhapatnam", "C": "Kurnool", "D": "Vijayawada" },\n    "correctOption": "A",\n    "explanation": "Amaravati is the capital."\n  }\n]`}
                        className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-emerald-300 focus:outline-none focus:border-indigo-500 shadow-inner"
                      />
                    </div>

                    {/* Submit Process Button */}
                    {/* Submit Process Button */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isUploadingContent}
                        className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl text-xs sm:text-sm font-black shadow-lg hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
                      >
                        {isUploadingContent ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Validating & Saving Questions...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" /> 
                            <span>Process & Import Questions</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Upload Completion Report */}
                    {jsonUploadReport && (
                      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 text-xs shadow-xl">
                        <div className="flex items-center justify-between font-bold border-b border-slate-800 pb-3">
                          <span className="text-white flex items-center gap-2 font-black text-sm">
                            <FileCheck className="h-4 w-4 text-emerald-400" /> 
                            <span>Upload Completion Summary</span>
                          </span>
                          <div className="flex items-center gap-2">
                            {detailedReport && (
                              <button
                                type="button"
                                onClick={() => setIsReportModalOpen(true)}
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <BarChart3 className="w-3.5 h-3.5" />
                                <span>Open Full Report Dialog</span>
                              </button>
                            )}
                            <button 
                              type="button"
                              onClick={() => setJsonUploadReport(null)}
                              className="text-slate-400 hover:text-white text-xs cursor-pointer px-2 py-1 bg-slate-900 rounded-lg"
                            >
                              ✕ Dismiss
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center py-1">
                          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                            <div className="text-slate-400 text-[10px] font-bold uppercase">Total Processed</div>
                            <div className="text-white font-black text-base mt-0.5">{jsonUploadReport.total}</div>
                          </div>
                          <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-900/50">
                            <div className="text-emerald-400 text-[10px] font-bold uppercase">Successfully Imported</div>
                            <div className="text-emerald-300 font-black text-base mt-0.5">{jsonUploadReport.successCount}</div>
                          </div>
                          <div className="bg-rose-950/60 p-3 rounded-xl border border-rose-900/50">
                            <div className="text-rose-400 text-[10px] font-bold uppercase">Failed / Skipped</div>
                            <div className="text-rose-300 font-black text-base mt-0.5">{jsonUploadReport.failedCount}</div>
                          </div>
                        </div>
                        {jsonUploadReport.errors.length > 0 && (
                          <div className="space-y-1.5 pt-2">
                            <div className="text-[11px] font-bold text-rose-400">Issues Encountered:</div>
                            <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px]">
                              {jsonUploadReport.errors.slice(0, 15).map((err, idx) => (
                                <div key={idx} className="bg-rose-950/50 border border-rose-900/50 text-rose-300 px-3 py-1.5 rounded-lg flex justify-between items-center">
                                  <span>Row #{err.index}</span>
                                  <span className="text-rose-200 font-sans font-medium">{err.reason}</span>
                                </div>
                              ))}
                              {jsonUploadReport.errors.length > 15 && (
                                <div className="text-center py-1 text-slate-400 text-[10px]">
                                  + {jsonUploadReport.errors.length - 15} more issues. Click "Open Full Report Dialog" above to view full list and download CSV.
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* MODE 2: SINGLE MCQ MANUAL ENTRY (FAST & COMFORTABLE WITH MATH PREVIEW) */}
              {uploadMode === 'single' && (
                <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5">
                  <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
                    <div className="h-10 w-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shrink-0">
                      <FilePlus className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-white">
                        Single MCQ Fast Studio Entry
                      </h4>
                      <p className="text-xs text-slate-400">
                        Add individual questions with real-time MathText & equation rendering preview.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleAddSingleQuestion} className="space-y-5">
                    {/* Target Hierarchy: Subject -> Unit -> Topic (Mandatory) */}
                    <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* 1. Subject */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">
                            1. Subject <span className="text-amber-400">*</span>
                          </label>
                          <select
                            value={newSubId}
                            onChange={(e) => {
                              setNewSubId(e.target.value);
                              setNewUnitId('');
                              setNewTopicId('');
                            }}
                            required
                            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold cursor-pointer focus:border-indigo-500 focus:outline-none"
                          >
                            <option value="">-- Select Subject * --</option>
                            {selectedAdminApp.syllabus.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* 2. Unit */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">
                            2. Unit <span className="text-amber-400">*</span>
                          </label>
                          <select
                            value={newUnitId}
                            onChange={(e) => {
                              setNewUnitId(e.target.value);
                              setNewTopicId('');
                            }}
                            required
                            disabled={!newSubId || !currentSubObj?.units || currentSubObj.units.length === 0}
                            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-medium disabled:opacity-40 cursor-pointer focus:border-indigo-500 focus:outline-none"
                          >
                            <option value="">
                              {!newSubId 
                                ? '-- Select Subject first --' 
                                : (!currentSubObj?.units || currentSubObj.units.length === 0)
                                ? '-- No Units in this Subject --'
                                : '-- Select Unit * --'
                              }
                            </option>
                            {currentSubObj?.units?.map((u) => (
                              <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* 3. Topic */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">
                            3. Topic <span className="text-amber-400">*</span>
                          </label>
                          <select
                            value={newTopicId}
                            onChange={(e) => setNewTopicId(e.target.value)}
                            required
                            disabled={!newUnitId || !currentUnitObj?.topics || currentUnitObj.topics.length === 0}
                            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-medium disabled:opacity-40 cursor-pointer focus:border-indigo-500 focus:outline-none"
                          >
                            <option value="">
                              {!newUnitId 
                                ? '-- Select Unit first --' 
                                : (!currentUnitObj?.topics || currentUnitObj.topics.length === 0)
                                ? '-- No Topics in this Unit --'
                                : '-- Select Topic * --'
                              }
                            </option>
                            {currentUnitObj?.topics?.map((t) => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* 4. Language */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">
                            4. Language <span className="text-amber-400">*</span>
                          </label>
                          <select
                            value={newQLanguage}
                            onChange={(e) => setNewQLanguage(e.target.value)}
                            required
                            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-bold cursor-pointer focus:border-indigo-500 focus:outline-none"
                          >
                            {LANGUAGES.map((lang) => (
                              <option key={lang.code} value={lang.code}>{lang.flag} {lang.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Hierarchy Live Indicator Breadcrumb */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-[11px] flex-wrap">
                        <span className="font-black text-indigo-400 uppercase tracking-wider">Target Placement:</span>
                        <span className={`px-2.5 py-0.5 rounded-lg font-bold border ${newSubId && currentSubObj ? 'bg-indigo-900/60 border-indigo-700/60 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                          Subject: {currentSubObj?.name || 'Required *'}
                        </span>
                        <span className="text-slate-500">➔</span>
                        <span className={`px-2.5 py-0.5 rounded-lg font-bold border ${newUnitId && currentUnitObj ? 'bg-amber-900/50 border-amber-700/60 text-amber-200' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                          Unit: {currentUnitObj ? currentUnitObj.name : 'Selection Required *'}
                        </span>
                        <span className="text-slate-500">➔</span>
                        <span className={`px-2.5 py-0.5 rounded-lg font-bold border ${newTopicId && currentTopicObj ? 'bg-emerald-900/50 border-emerald-700/60 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                          Topic: {currentTopicObj ? currentTopicObj.name : 'Selection Required *'}
                        </span>
                      </div>
                    </div>

                    {/* Question Text with Live Preview */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-300">
                        Question Text <span className="text-amber-400">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={singleQuestionText}
                        onChange={(e) => setSingleQuestionText(e.target.value)}
                        placeholder="Type question text here... (Math formulas like x^2 or equations supported)"
                        className="w-full text-xs bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-white focus:border-indigo-500 focus:outline-none"
                        required
                      />
                      {singleQuestionText && (
                        <div style={scaledTextStyle} className="p-3 bg-slate-950/80 rounded-xl border border-indigo-900/50 text-xs text-indigo-200">
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider block mb-1">Preview:</span>
                          <MathText text={singleQuestionText} />
                        </div>
                      )}
                    </div>

                    {/* 4 Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                        <div key={opt} className="space-y-1.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-black text-slate-300">Option {opt} *</label>
                            <label className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 cursor-pointer">
                              <input
                                type="radio"
                                name="correctOption"
                                value={opt}
                                checked={singleCorrectOption === opt}
                                onChange={() => setSingleCorrectOption(opt)}
                                className="accent-emerald-500 cursor-pointer"
                              />
                              <span>Correct Answer</span>
                            </label>
                          </div>
                          <input
                            type="text"
                            value={singleOptions[opt]}
                            onChange={(e) => setSingleOptions(prev => ({ ...prev, [opt]: e.target.value }))}
                            placeholder={`Enter Option ${opt}...`}
                            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                            required
                          />
                          {singleOptions[opt] && (
                            <div style={scaledTextStyle} className="text-[11px] text-slate-400 px-1 truncate">
                              <MathText text={singleOptions[opt]} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Explanation */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-300">
                        Explanation (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={singleExplanation}
                        onChange={(e) => setSingleExplanation(e.target.value)}
                        placeholder="Detailed explanation or references for this question..."
                        className="w-full text-xs bg-slate-950 border border-slate-800 rounded-2xl p-3 text-white focus:border-indigo-500 focus:outline-none"
                      />
                      {singleExplanation && (
                        <div style={scaledTextStyle} className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Explanation Preview:</span>
                          <MathText text={singleExplanation} />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Save className="h-4 w-4" /> Save MCQ to Database
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Manage Uploaded Files & Batches Section */}
              {(state.importBatches || []).filter(b => b.appId === selectedAdminApp.id).length > 0 && (
                <div className="space-y-3 bg-slate-900 p-5 rounded-3xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-indigo-400" />
                      <span>Uploaded Question Batches & Files</span>
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(state.importBatches || [])
                      .filter(b => b.appId === selectedAdminApp.id)
                      .map((batch) => {
                        const batchQuestions = state.questions.filter(q => q.importBatchId === batch.id);
                        const subjectsInBatch = batchQuestions.reduce((acc, q) => {
                          const sub = selectedAdminApp.syllabus.find(s => s.id === q.subjectId);
                          const subName = sub ? sub.name : 'Unknown Subject';
                          if (!acc[q.subjectId]) {
                            acc[q.subjectId] = {
                              id: q.subjectId,
                              name: subName,
                              count: 0
                            };
                          }
                          acc[q.subjectId].count++;
                          return acc;
                        }, {} as Record<string, { id: string, name: string, count: number }>);

                        const subjectsList = Object.values(subjectsInBatch);

                        return (
                          <div key={batch.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-xs flex flex-col justify-between gap-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center shrink-0">
                                  <FileSpreadsheet className="h-5 w-5" />
                                </div>
                                <div>
                                  <h5 className="text-xs sm:text-sm font-black text-white line-clamp-1">{batch.fileName}</h5>
                                  <p className="text-[10px] text-slate-400 font-bold">{batch.date} • {batch.count} MCQs</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleDeleteBatchQuestions(batch.id, batch.fileName)}
                                className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 rounded-xl transition-all cursor-pointer shrink-0"
                                title="Delete entire file and all its questions"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            {subjectsList.length > 0 && (
                              <div className="border-t border-slate-800/80 pt-2.5 space-y-1.5">
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                  Delete Subject-wise:
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {subjectsList.map((sub) => (
                                    <div 
                                      key={sub.id} 
                                      className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-900 border border-slate-800 hover:border-rose-800 rounded-lg text-[10px] font-bold text-slate-300 transition-all"
                                    >
                                      <span className="line-clamp-1 max-w-[120px]">{sub.name} ({sub.count})</span>
                                      <button
                                        onClick={() => handleDeleteBatchSubjectQuestions(batch.id, sub.id, sub.name)}
                                        className="p-0.5 text-rose-400 hover:text-rose-300 rounded transition-colors cursor-pointer flex items-center justify-center"
                                        title={`Delete ${sub.name} questions from this file`}
                                      >
                                        <X className="h-3 w-3 stroke-[3]" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Existing Questions and MCQ Deletion & Management */}
              <div className="space-y-4 border-t border-slate-800 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-black text-slate-100 uppercase tracking-wider">
                      MCQ Management & Deletion ({filteredQuestions.length} Total MCQs)
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Select a Subject and Topic to browse, edit, or delete questions.
                    </p>
                  </div>
                </div>

                {/* Subject & Topic Selectors for Deletion */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">1. Select Subject</label>
                    <select
                      value={deleteFilterSubjectId}
                      onChange={(e) => {
                        setDeleteFilterSubjectId(e.target.value);
                        setDeleteFilterTopicId(''); // reset topic when subject changes
                      }}
                      className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-bold min-h-[42px] cursor-pointer"
                    >
                      <option value="">-- Choose Subject --</option>
                      {selectedAdminApp.syllabus.map((sub) => (
                        <option key={sub.id} value={sub.id} className="bg-slate-900 text-white">
                          {sub.name} ({state.questions.filter(q => q.appId === selectedAdminApp.id && q.subjectId === sub.id).length} MCQs)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">2. Select Topic</label>
                    <select
                      value={deleteFilterTopicId}
                      onChange={(e) => setDeleteFilterTopicId(e.target.value)}
                      disabled={!deleteFilterSubjectId}
                      className="w-full text-xs bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-bold disabled:opacity-50 min-h-[42px] cursor-pointer"
                    >
                      <option value="">-- Choose Topic --</option>
                      {deleteTopicsList.map((topic) => (
                        <option key={topic.id} value={topic.id} className="bg-slate-900 text-white">
                          [{topic.unitName}] {topic.name} ({state.questions.filter(q => q.appId === selectedAdminApp.id && q.subjectId === deleteFilterSubjectId && q.topicId === topic.id).length} MCQs)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* MCQ display list & Bulk deletion option */}
                {deleteFilterSubjectId && deleteFilterTopicId ? (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-950/40 border border-indigo-800/60 p-4 rounded-2xl">
                      <div>
                        <h5 className="text-xs font-black text-indigo-200">
                          Topic: {deleteTopicsList.find(t => t.id === deleteFilterTopicId)?.name || 'Selected Topic'}
                        </h5>
                        <p className="text-[11px] text-slate-300 font-medium">
                          Found {deleteFilteredQuestions.length} MCQs strictly scoped to this topic.
                        </p>
                      </div>
                      {deleteFilteredQuestions.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const topicObj = deleteTopicsList.find(t => t.id === deleteFilterTopicId);
                            if (topicObj) {
                              handleDeleteTopicQuestions(deleteFilterSubjectId, deleteFilterTopicId, topicObj.name);
                            }
                          }}
                          className="px-4 py-2.5 bg-rose-600/90 hover:bg-rose-600 text-white border border-rose-500 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm min-h-[42px]"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete All {deleteFilteredQuestions.length} MCQs in Topic
                        </button>
                      )}
                    </div>

                    <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                      {deleteFilteredQuestions.map((q, idx) => (
                        <div key={q.id} className="p-4 sm:p-5 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start justify-between gap-4 hover:border-slate-300 transition-all">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-black text-slate-700">Q#{idx + 1}</span>
                              {q.subtopic ? (
                                <span className="px-2 py-0.5 rounded bg-indigo-50 text-[10px] font-bold text-indigo-700">Subtopic: {q.subtopic}</span>
                              ) : null}
                            </div>
                            <div style={scaledTextStyle} className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed break-words">
                              <MathText text={q.questionText} />
                            </div>
                            {q.options && (
                              <div style={scaledTextStyle} className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 mt-2 text-[11px] text-slate-700 font-medium">
                                {Object.entries(q.options).map(([key, val]) => (
                                  <div key={key} className={q.correctOption === key ? "text-emerald-700 font-extrabold bg-emerald-50/60 px-2 py-1 rounded-lg border border-emerald-200/60" : "px-2 py-1"}>
                                    <span className="uppercase font-bold">{key}.</span> <MathText text={val} />
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="text-[11px] bg-emerald-100/70 text-emerald-900 px-2.5 py-1 rounded-lg font-bold inline-block mt-2">
                              Correct Answer: {q.correctOption}
                            </div>
                            {q.explanation && (
                              <div style={scaledTextStyle} className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-2">
                                <span className="font-bold text-slate-800 block mb-0.5">Explanation:</span>
                                <MathText text={q.explanation} />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-start pt-2 sm:pt-0">
                            <button
                              type="button"
                              onClick={() => handleStartEditQuestion(q)}
                              className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer min-h-[40px]"
                              title="Edit this Question"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer min-h-[40px]"
                              title="Delete this Question"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                      {deleteFilteredQuestions.length === 0 && (
                        <div className="text-center py-10 bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs font-medium">
                          No questions exist for the selected topic yet. You can upload questions using the form above.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl text-slate-400 text-xs font-medium space-y-2">
                    <p className="font-bold text-slate-200">Select Subject & Topic Above</p>
                    <p className="text-slate-400 max-w-md mx-auto">
                      Please select a Subject first, and then choose a Topic to load, view, and manage/delete its MCQs.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SYLLABUS MANAGEMENT (Create / Modify / Delete Subject, Unit, Topic, Subtopic) */}
          {activeTab === 'syllabus' && (
            <div className="space-y-6">
              {/* Add Subject Box */}
              <div className="bg-white text-slate-900 p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <FolderPlus className="h-4 w-4 text-indigo-600" />
                  Create New Subject for <span className="text-indigo-600">{selectedAdminApp.name}</span>
                </h3>
                <form onSubmit={handleAddSubject} className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      placeholder="e.g. Indian Polity & Constitution"
                      className="flex-1 text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                    <select
                      value={newSubjectCategory}
                      onChange={(e) => setNewSubjectCategory(e.target.value as any)}
                      className="text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="prelims">🎯 Prelims Only</option>
                      <option value="mains">📖 Mains Only</option>
                      <option value="both">⭐ Both (Prelims & Mains)</option>
                    </select>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={newSubjectImageUrl}
                      onChange={(e) => setNewSubjectImageUrl(e.target.value)}
                      placeholder="Image URL (Unsplash/Premium)"
                      className="flex-1 text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      value={newSubjectColor}
                      onChange={(e) => setNewSubjectColor(e.target.value)}
                      placeholder="Tailwind Gradient (e.g. from-orange-500 to-amber-600)"
                      className="flex-1 text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                    <button type="submit" className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer min-h-[44px]">
                      <Plus className="h-4 w-4" /> Add Subject
                    </button>
                  </div>
                </form>
              </div>

              {/* Bulk Upload Syllabus (JSON / Excel / CSV) */}
              <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold shrink-0">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                        <span>Bulk Import Syllabus Structure</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-950 text-indigo-300 border border-indigo-800">
                          JSON / Excel / CSV
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Upload multi-tier Subjects, Units, Topics & Subtopics with instant schema validation and error reporting.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsSyllabusUploadExpanded(prev => !prev)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    {isSyllabusUploadExpanded ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>Hide Upload Box</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span>Open Bulk Upload</span>
                      </>
                    )}
                  </button>
                </div>

                {isSyllabusUploadExpanded && (
                  <form onSubmit={handleProcessSyllabusUpload} className="space-y-4 pt-2">
                    {/* Drag and Drop Zone */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingSyllabus(true); }}
                      onDragLeave={() => setIsDraggingSyllabus(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingSyllabus(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) processSyllabusFile(file);
                      }}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (!target.closest('button')) {
                          if (syllabusFileInputRef.current) {
                            syllabusFileInputRef.current.value = '';
                            syllabusFileInputRef.current.click();
                          }
                        }
                      }}
                      className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                        isDraggingSyllabus
                          ? 'border-indigo-400 bg-indigo-950/60 scale-[1.01]'
                          : syllabusFileName
                          ? 'border-emerald-600/70 bg-emerald-950/20'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="file"
                        ref={syllabusFileInputRef}
                        accept=".json,.csv,.xlsx,.xls,application/json,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                        onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) processSyllabusFile(file);
                        }}
                        className="hidden"
                      />

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                            syllabusFileName ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          }`}>
                            {syllabusFileName ? <FileCheck className="h-5 w-5" /> : <UploadCloud className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-black text-white">
                              {syllabusFileName ? `Selected: ${syllabusFileName}` : 'Drop Syllabus File Here or Browse'}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {syllabusFileSize ? `Size: ${syllabusFileSize}` : 'Supported: .json (nested array) or .xlsx / .csv (Subject, Unit, Topic, Subtopic)'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (syllabusFileInputRef.current) {
                                syllabusFileInputRef.current.value = '';
                                syllabusFileInputRef.current.click();
                              }
                            }}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer"
                          >
                            Browse Files
                          </button>
                          {syllabusFileName && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSyllabusFileName('');
                                setSyllabusFileSize('');
                                setSyllabusInputText('');
                                if (syllabusFileInputRef.current) syllabusFileInputRef.current.value = '';
                              }}
                              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Textarea for JSON/Data preview or paste */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300 flex items-center gap-2">
                          <FileCode className="h-4 w-4 text-emerald-400" />
                          <span>Direct Paste / Syllabus Preview</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {syllabusInputText ? `${syllabusInputText.length} characters ready` : 'Empty'}
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={syllabusInputText}
                        onChange={(e) => setSyllabusInputText(e.target.value)}
                        placeholder={`Paste Syllabus JSON structure or CSV table text:\n[\n  {\n    "name": "Indian History",\n    "category": "prelims",\n    "units": [\n      { "name": "Ancient India", "topics": [{ "name": "Indus Valley", "subtopics": ["Harappa"] }] }\n    ]\n  }\n]`}
                        className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-2xl p-3 text-emerald-300 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-end gap-3 pt-1">
                      <button
                        type="submit"
                        disabled={isUploadingSyllabus}
                        className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition-all flex items-center gap-2 cursor-pointer shadow-md"
                      >
                        {isUploadingSyllabus ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Validating & Importing Syllabus...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            <span>Import Syllabus Content</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Add Unit / Topic helper forms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white text-slate-900 p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <h4 className="text-xs font-black text-slate-900 flex items-center justify-between">
                    <span>Add Unit to Subject</span>
                    <span className="text-[10px] text-slate-500 font-normal">Optional image support</span>
                  </h4>
                  <div className="space-y-2">
                    <select
                      value={targetSubjectId}
                      onChange={(e) => setTargetSubjectId(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800"
                    >
                      {selectedAdminApp.syllabus.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newUnitName}
                      onChange={(e) => setNewUnitName(e.target.value)}
                      placeholder="e.g. Unit II: Central Government"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      value={newUnitImageUrl}
                      onChange={(e) => setNewUnitImageUrl(e.target.value)}
                      placeholder="Optional Unit Background Image URL (https://...)"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                    <button onClick={handleAddUnit} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold min-h-[42px] cursor-pointer">
                      Add Unit
                    </button>
                  </div>
                </div>

                <div className="bg-white text-slate-900 p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <h4 className="text-xs font-black text-slate-900 flex items-center justify-between">
                    <span>Add Topic to Unit</span>
                    <span className="text-[10px] text-slate-500 font-normal">Optional image support</span>
                  </h4>
                  <div className="space-y-2">
                    <select
                      value={targetSubjectId}
                      onChange={(e) => {
                        setTargetSubjectId(e.target.value);
                        const sObj = selectedAdminApp.syllabus.find(s => s.id === e.target.value);
                        if (sObj && sObj.units[0]) setTargetUnitId(sObj.units[0].id);
                      }}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800"
                    >
                      {selectedAdminApp.syllabus.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <select
                      value={targetUnitId}
                      onChange={(e) => setTargetUnitId(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800"
                    >
                      {selectedAdminApp.syllabus.find(s => s.id === targetSubjectId)?.units.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newTopicName}
                      onChange={(e) => setNewTopicName(e.target.value)}
                      placeholder="e.g. President & Prime Minister"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      value={newTopicImageUrl}
                      onChange={(e) => setNewTopicImageUrl(e.target.value)}
                      placeholder="Optional Topic Background Image URL (https://...)"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                    <button onClick={handleAddTopic} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold min-h-[42px] cursor-pointer">
                      Add Topic
                    </button>
                  </div>
                </div>
              </div>

              {/* Complete Syllabus Tree Structure View & Delete/Modify */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-xs font-black text-slate-100 uppercase tracking-wider">Current Syllabus Structure ({selectedAdminApp.name})</h4>
                  {selectedAdminApp.syllabus.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleClearAutoTopics}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Delete automatically created topics and subtopics"
                      >
                        🧹 Clear Auto Topics
                      </button>
                      <button
                        onClick={handleDeleteAllSubjects}
                        className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete All Subjects
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {selectedAdminApp.syllabus.length === 0 && (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2">
                      <div className="text-3xl">📚</div>
                      <h4 className="text-sm font-bold text-slate-800">No Subjects Configured for {selectedAdminApp.name}</h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Use the "Add New Subject" form above to start building the syllabus units for this app. You can also import syllabus JSON data below.
                      </p>
                    </div>
                  )}

                  {selectedAdminApp.syllabus.map((subj) => (
                    <div key={subj.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                      {/* Subject Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 font-bold">📚</span>
                          <h3 className="text-sm font-black text-slate-900">{subj.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            subj.category === 'mains' ? 'bg-blue-100 text-blue-700' :
                            subj.category === 'both' ? 'bg-purple-100 text-purple-700' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {subj.category === 'mains' ? '📖 Mains' : subj.category === 'both' ? '⭐ Both' : '🎯 Prelims'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {subj.imageUrl && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                              <img src={subj.imageUrl} alt="" className="h-4 w-4 rounded object-cover" referrerPolicy="no-referrer" />
                              <span>Image Set</span>
                            </div>
                          )}
                          <button onClick={() => handleUpdateSubject(subj.id, subj.name, subj.imageUrl, subj.color)} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold flex items-center gap-1">
                            <Edit2 className="w-3 h-3" /> Edit Subject
                          </button>
                          <button onClick={() => handleDeleteSubject(subj.id, subj.name)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg text-xs font-bold flex items-center gap-1">
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </div>

                      {/* Units */}
                      <div className="space-y-3 pl-4 border-l-2 border-indigo-100">
                        {subj.units.map((unit) => (
                          <div key={unit.id} className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200/60">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-extrabold text-slate-800">📌 {unit.name}</h4>
                                {unit.imageUrl && (
                                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold">
                                    <img src={unit.imageUrl} alt="" className="h-3.5 w-3.5 rounded object-cover" referrerPolicy="no-referrer" />
                                    <span>Image</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleUpdateUnit(subj.id, unit.id, unit.name, unit.imageUrl)} className="px-2 py-1 bg-slate-200 text-slate-800 hover:bg-slate-300 rounded-lg text-[11px] font-bold flex items-center gap-1">
                                  <Edit2 className="w-3 h-3" /> Edit Unit & Image
                                </button>
                                <button onClick={() => handleDeleteUnit(subj.id, unit.id, unit.name)} className="text-rose-500 hover:text-rose-700 text-[11px] font-bold">
                                  Delete
                                </button>
                              </div>
                            </div>

                            {/* Topics */}
                            <div className="space-y-2 pl-4 border-l-2 border-slate-200">
                              {unit.topics.length === 0 && (
                                <div className="p-3.5 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs flex items-center justify-between">
                                  <span>No topics yet. Add your topics manually above.</span>
                                  <button
                                    onClick={() => {
                                      setTargetSubjectId(subj.id);
                                      setTargetUnitId(unit.id);
                                    }}
                                    className="text-indigo-600 font-bold hover:underline cursor-pointer"
                                  >
                                    + Add Topic Here
                                  </button>
                                </div>
                              )}
                              {unit.topics.map((topic) => (
                                <div key={topic.id} className="bg-white rounded-lg p-3 space-y-2 border border-slate-200 shadow-2xs">
                                  <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-bold text-slate-900">🔹 {topic.name}</span>
                                      {(topic.hasTheory || topic.theoryContent) && (
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">
                                          📖 Theory
                                        </span>
                                      )}
                                      {topic.hasPractice === false && (
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-300">
                                          MCQs OFF
                                        </span>
                                      )}
                                      {topic.imageUrl && (
                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold">
                                          <img src={topic.imageUrl} alt="" className="h-3.5 w-3.5 rounded object-cover" referrerPolicy="no-referrer" />
                                          <span>Image</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <button 
                                        onClick={() => setAdminTheoryTarget({
                                          subjectName: subj.name,
                                          unitName: unit.name,
                                          topic: topic,
                                          subjectId: subj.id,
                                          unitId: unit.id
                                        })}
                                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                                        title="Manage Theory Content, Structured Tables & Practice Options"
                                      >
                                        <BookOpen className="w-3 h-3 text-amber-600" />
                                        <span>{topic.hasTheory || topic.theoryContent ? '📖 Edit Theory Notes' : '➕ Add Theory'}</span>
                                      </button>
                                      <button onClick={() => handleUpdateTopic(subj.id, unit.id, topic.id, topic.name, topic.imageUrl)} className="px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer">
                                        <Edit2 className="w-2.5 h-2.5" /> Edit
                                      </button>
                                      <button onClick={() => handleDeleteTopic(subj.id, unit.id, topic.id, topic.name)} className="text-rose-500 text-[10px] font-bold hover:underline cursor-pointer">
                                        Delete
                                      </button>
                                    </div>
                                  </div>

                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COUPON CODE MANAGEMENT */}
          {activeTab === 'coupons' && (() => {
            const filteredCoupons = state.coupons.filter(c => 
              !couponSearch || 
              c.code.toLowerCase().includes(couponSearch.toLowerCase()) || 
              c.type.toLowerCase().includes(couponSearch.toLowerCase())
            );

            return (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white text-slate-900 p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-50 rounded-2xl">
                        <Tag className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900">Coupon Generator</h3>
                        <p className="text-xs text-slate-500 font-medium">Create discount codes with smart targeting and usage limits.</p>
                      </div>
                    </div>
                    {editingCoupon && (
                      <button 
                        onClick={() => { setEditingCoupon(null); setCouponCode(''); setCouponValue(0); }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer"
                      >
                        <X className="w-4 h-4" /> Cancel Edit
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleAddCoupon} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Coupon Code *</label>
                            <input 
                              type="text" 
                              value={couponCode} 
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              placeholder="e.g. WELCOME50"
                              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                              required
                            />
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Discount Type</label>
                            <select value={couponType} onChange={(e) => setCouponType(e.target.value as any)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer">
                              <option value="percentage" className="text-slate-900 bg-white">Percentage (%)</option>
                              <option value="fixed" className="text-slate-900 bg-white">Fixed Amount (₹)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Discount Value *</label>
                            <input 
                              type="number" 
                              value={couponValue} 
                              onChange={(e) => setCouponValue(Number(e.target.value))}
                              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Min Purchase (₹)</label>
                            <input 
                              type="number" 
                              value={couponMinPurchase} 
                              onChange={(e) => setCouponMinPurchase(Number(e.target.value))}
                              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Total Limit</label>
                            <input 
                              type="number" 
                              value={couponMaxRedemptions} 
                              onChange={(e) => setCouponMaxRedemptions(Number(e.target.value))}
                              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Per User Limit</label>
                            <input 
                              type="number" 
                              value={couponPerUserLimit} 
                              onChange={(e) => setCouponPerUserLimit(Number(e.target.value))}
                              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <AppTargetingSelector 
                          apps={state.apps}
                          selectedIds={selectedTargetAppIds}
                          onToggle={toggleAppSelection}
                          onSelectAll={selectAllApps}
                          onClear={clearAppSelection}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Start Date</label>
                        <input type="datetime-local" value={couponStartDate} onChange={(e) => setCouponStartDate(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Expiry Date</label>
                        <input type="datetime-local" value={couponEndDate} onChange={(e) => setCouponEndDate(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Status</label>
                        <select value={couponStatus} onChange={(e) => setCouponStatus(e.target.value as any)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer">
                          <option value="active" className="text-slate-900 bg-white">Active</option>
                          <option value="scheduled" className="text-slate-900 bg-white">Scheduled</option>
                          <option value="disabled" className="text-slate-900 bg-white">Disabled</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button 
                        type="submit"
                        className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4" /> {editingCoupon ? 'Update Coupon' : 'Create Coupon Code'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest">Active Coupons ({filteredCoupons.length})</h4>
                    <div className="flex items-center gap-3 flex-1 max-w-sm">
                      <div className="relative w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input 
                          type="text" 
                          placeholder="Search coupon code or discount..." 
                          value={couponSearch} 
                          onChange={(e) => setCouponSearch(e.target.value)} 
                          className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs" 
                        />
                      </div>
                      {state.coupons.length > 0 && (
                        <button 
                          onClick={handleBulkDisableCoupons}
                          className="px-3 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-600/30 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                        >
                          <Zap className="w-3 h-3" /> Disable All
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCoupons.map(coupon => (
                      <div key={coupon.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-sm group">
                        <div className="flex items-center justify-between">
                          <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                            {coupon.type === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            coupon.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white'
                          }`}>{coupon.status}</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors">{coupon.code}</h4>
                          <p className="text-xs text-slate-300 font-bold uppercase tracking-tight mt-1">Valid until: {new Date(coupon.expiryDate).toLocaleDateString()}</p>
                        </div>
                        <div className="pt-3 border-t border-slate-800 space-y-2">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-400">REDEMPTIONS</span>
                            <span className="text-slate-200">{coupon.redemptionCount} / {coupon.maxTotalRedemptions}</span>
                          </div>
                          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(coupon.redemptionCount / coupon.maxTotalRedemptions) * 100}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button 
                            onClick={() => {
                              setEditingCoupon(coupon);
                              setCouponCode(coupon.code);
                              setCouponValue(coupon.discountValue);
                              setCouponType(coupon.type);
                              setSelectedTargetAppIds(coupon.appIds);
                            }}
                            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black rounded-xl transition-all cursor-pointer"
                          >
                            EDIT
                          </button>
                          <button onClick={() => handleDeleteCoupon(coupon.id, coupon.code)} className="p-2 bg-rose-900/20 hover:bg-rose-900/40 text-rose-400 rounded-xl transition-all cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {filteredCoupons.length === 0 && (
                      <div className="col-span-full p-12 text-center text-slate-400 text-xs italic bg-slate-900/30 rounded-3xl border border-dashed border-slate-800 font-bold">
                        {couponSearch ? 'No coupons matched your search.' : 'No coupon codes found.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 4: SUBSCRIPTION MANAGEMENT */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white text-slate-900 p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 rounded-2xl">
                      <CreditCard className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Subscription Plans</h3>
                      <p className="text-xs text-slate-500 font-medium">Configure independent pricing and benefits for each app.</p>
                    </div>
                  </div>
                  {editingSub && (
                    <button 
                      onClick={handleCancelEditSub}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black flex items-center gap-2"
                    >
                      <X className="w-4 h-4" /> Cancel Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveSubscription} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Plan Name *</label>
                        <input 
                          type="text" 
                          value={planName} 
                          onChange={(e) => setPlanName(e.target.value)}
                          placeholder="e.g. 1 Year Complete Pass"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Billing Cycle</label>
                          <select value={subBillingCycle} onChange={(e) => setSubBillingCycle(e.target.value as any)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none">
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="half-yearly">Half Yearly</option>
                            <option value="yearly">Yearly</option>
                            <option value="lifetime">Lifetime</option>
                            <option value="custom">Custom Days</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Duration (Days)</label>
                          <input 
                            type="number" 
                            value={subDurationDays} 
                            onChange={(e) => setSubDurationDays(Number(e.target.value))}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Price ({planSymbol}) *</label>
                          <input 
                            type="number" 
                            value={planPrice} 
                            onChange={(e) => setPlanPrice(Number(e.target.value))}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Trial Period (Days)</label>
                          <input 
                            type="number" 
                            value={subTrialDays} 
                            onChange={(e) => setSubTrialDays(Number(e.target.value))}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Plan Features</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={newFeature} 
                          onChange={(e) => setNewFeature(e.target.value)}
                          placeholder="e.g. 500+ Video Lessons"
                          className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button 
                          type="button" 
                          onClick={() => { if(newFeature) { setSubFeatures([...subFeatures, newFeature]); setNewFeature(''); } }}
                          className="px-4 bg-indigo-600 text-white rounded-xl text-xs font-black"
                        >
                          ADD
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {subFeatures.map((f, i) => (
                          <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold flex items-center gap-2">
                            {f}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => setSubFeatures(subFeatures.filter((_, idx) => idx !== i))} />
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Activation Date</label>
                      <input type="datetime-local" value={subStartDate} onChange={(e) => setSubStartDate(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Target App</label>
                      <select 
                        value={selectedAppId} 
                        onChange={(e) => setSelectedAppId(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none cursor-pointer"
                      >
                        {state.apps.map(app => <option key={app.id} value={app.id}>{app.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Plan Status</label>
                      <select value={subStatus} onChange={(e) => setSubStatus(e.target.value as any)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none">
                        <option value="active">Active</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="disabled">Disabled</option>
                        <option value="expired">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      type="submit"
                      className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" /> {editingSub ? 'Update Plan' : 'Save Plan'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest">Available Plans ({state.subscriptions.length})</h4>
                  {state.subscriptions.length > 0 && (
                    <button 
                      onClick={handleBulkDisablePlans}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-700 transition-all flex items-center gap-2"
                    >
                      <Layers className="w-3 h-3" /> Archive All Plans
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {state.subscriptions.map(sub => (
                    <div key={sub.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm group">
                      <div className="flex items-center justify-between">
                        <div className="p-2 bg-indigo-500/10 rounded-xl">
                          <CreditCard className="w-5 h-5 text-indigo-400" />
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          sub.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white'
                        }`}>{sub.status}</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-white">{sub.name}</h4>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-2xl font-black text-indigo-400">{sub.currencySymbol}{sub.price}</span>
                          <span className="text-xs text-slate-500 font-bold uppercase">/ {sub.billingCycle}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">Target App: {state.apps.find(a => a.id === sub.appId)?.name || sub.appId}</p>
                      </div>
                      <ul className="space-y-1.5 border-t border-slate-800 pt-4">
                        {sub.features.slice(0, 3).map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                            <div className="w-1 h-1 rounded-full bg-indigo-500" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center gap-2 pt-2">
                        <button onClick={() => handleEditSub(sub)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black rounded-xl transition-all">EDIT</button>
                        <button onClick={() => handleDeleteSub(sub.id, sub.name)} className="p-2 bg-rose-900/20 hover:bg-rose-900/40 text-rose-400 rounded-xl transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {state.subscriptions.length === 0 && (
                    <div className="col-span-full p-12 text-center text-slate-500 text-xs italic bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                      No subscription plans created yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: POSTER / BANNER MANAGEMENT */}
          {activeTab === 'posters' && (() => {
            const filteredPosters = (state.posters || []).filter(p => 
              !posterSearch || 
              p.title.toLowerCase().includes(posterSearch.toLowerCase()) || 
              (p.subtitle && p.subtitle.toLowerCase().includes(posterSearch.toLowerCase())) || 
              (p.badge && p.badge.toLowerCase().includes(posterSearch.toLowerCase())) || 
              (p.targetType && p.targetType.toLowerCase().includes(posterSearch.toLowerCase()))
            );

            return (
              <div className="space-y-6">
                <div className="bg-white text-slate-900 p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-50 rounded-2xl">
                        <ImageIcon className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900">Promotion Studio</h3>
                        <p className="text-xs text-slate-500 font-medium">Create and schedule banners, carousel items, and targeted exam promotions.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={handleSeedCuratedPosters}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border border-indigo-200 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Curated Templates
                      </button>
                      {editingPoster && (
                        <button 
                          type="button"
                          onClick={handleCancelEditPoster}
                          className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
                        >
                          <X className="w-4 h-4" /> Cancel Edit
                        </button>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleSavePoster} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Poster Title *</label>
                          <input 
                            type="text" 
                            value={posterTitle} 
                            onChange={(e) => setPosterTitle(e.target.value)}
                            placeholder="e.g. Grand Mock Test Series 2026"
                            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Subtitle / Key Highlight</label>
                          <input 
                            type="text" 
                            value={posterSubtitle} 
                            onChange={(e) => setPosterSubtitle(e.target.value)}
                            placeholder="e.g. Master Indian History & Polity with 5,000+ Topic MCQs"
                            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Position</label>
                            <select value={posterPosition} onChange={(e) => setPosterPosition(e.target.value as any)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer">
                              <option value="home-banner" className="text-slate-900 bg-white">Home Main Banner</option>
                              <option value="home-carousel" className="text-slate-900 bg-white">Home Carousel</option>
                              <option value="sidebar" className="text-slate-900 bg-white">Sidebar Widget</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Badge Text</label>
                            <input type="text" value={posterBadge} onChange={(e) => setPosterBadge(e.target.value)} placeholder="NEW / 50% OFF / BATCH" className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none" />
                          </div>
                        </div>

                        {/* Destination / Target Action */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Target Action</label>
                            <select 
                              value={posterTargetType || 'prelims'} 
                              onChange={(e) => setPosterTargetType(e.target.value as any)} 
                              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer"
                            >
                              <option value="prelims" className="text-slate-900 bg-white">🎯 Prelims Syllabus & Practice</option>
                              <option value="mains" className="text-slate-900 bg-white">📖 Mains Syllabus & Study</option>
                              <option value="current-affairs" className="text-slate-900 bg-white">⚡ Daily Current Affairs</option>
                              <option value="mock-tests" className="text-slate-900 bg-white">📝 Full-Length Mock Tests</option>
                              <option value="bookmarks" className="text-slate-900 bg-white">🔖 Bookmarks Collection</option>
                              <option value="subscription" className="text-slate-900 bg-white">⭐ Subscription & Pro Pass</option>
                              <option value="subject" className="text-slate-900 bg-white">📚 Specific Subject</option>
                              <option value="url" className="text-slate-900 bg-white">🔗 External Link (URL)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">CTA Button Text</label>
                            <input 
                              type="text" 
                              value={posterCtaText} 
                              onChange={(e) => setPosterCtaText(e.target.value)} 
                              placeholder="e.g. Start Practice" 
                              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none" 
                            />
                          </div>
                        </div>

                        {posterTargetType === 'subject' && (
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Target Subject</label>
                            <select 
                              value={posterTargetSubjectId} 
                              onChange={(e) => setPosterTargetSubjectId(e.target.value)} 
                              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer"
                            >
                              <option value="" className="text-slate-900 bg-white">-- Choose Subject --</option>
                              {(selectedAdminApp.syllabus || []).map(s => (
                                <option key={s.id} value={s.id} className="text-slate-900 bg-white">{s.name} ({s.category?.toUpperCase() || 'GENERAL'})</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {posterTargetType === 'url' && (
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Action URL</label>
                            <input 
                              type="url" 
                              value={posterActionUrl} 
                              onChange={(e) => setPosterActionUrl(e.target.value)} 
                              placeholder="https://example.com/notification" 
                              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none" 
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Image URL or Direct Upload *</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={posterImageUrl} 
                              onChange={(e) => setPosterImageUrl(e.target.value)}
                              placeholder="https://images.unsplash.com/..."
                              className="flex-1 p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                              required
                            />
                            <button 
                              type="button" 
                              onClick={() => bannerFileInputRef.current?.click()}
                              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl flex items-center gap-1.5 text-xs font-black transition-all cursor-pointer"
                              title="Upload image from computer"
                            >
                              <Upload className="w-4 h-4" /> Upload
                            </button>
                          </div>
                          <input type="file" ref={bannerFileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePosterImageUpload(file);
                          }} />
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Live Card Preview */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Live Home Screen Preview</label>
                          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border border-slate-200 shadow-lg bg-slate-950 p-5 text-white flex flex-col justify-between">
                            {posterImageUrl ? (
                              <div className="absolute inset-0 w-full h-full pointer-events-none">
                                <img src={posterImageUrl} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20" />
                              </div>
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-amber-950 pointer-events-none opacity-80" />
                            )}
                            
                            <div className="relative z-10 flex items-center justify-between">
                              <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                                {posterBadge || 'FEATURED'}
                              </span>
                              <span className="bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white/90">
                                Preview Card
                              </span>
                            </div>

                            <div className="relative z-10 space-y-1 my-auto">
                              <h4 className="text-base sm:text-lg font-black text-white leading-tight drop-shadow-md">
                                {posterTitle || 'Poster Title Display Here'}
                              </h4>
                              <p className="text-xs text-slate-100 font-semibold line-clamp-2 drop-shadow-xs">
                                {posterSubtitle || 'Master your competitive exam with daily practice and full syllabus coverage.'}
                              </p>
                            </div>

                            <div className="relative z-10 flex items-center justify-between pt-1">
                              <span className="text-[10px] font-black text-amber-400">
                                Target: {posterTargetType?.toUpperCase() || 'PRELIMS'}
                              </span>
                              <span className="px-3 py-1.5 bg-amber-400 text-slate-950 font-black rounded-xl text-[10px] shadow-md flex items-center gap-1">
                                {posterCtaText || 'Explore Now'} <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </div>

                        <AppTargetingSelector 
                          apps={state.apps}
                          selectedIds={selectedTargetAppIds}
                          onToggle={toggleAppSelection}
                          onSelectAll={selectAllApps}
                          onClear={clearAppSelection}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Start Date</label>
                        <input type="datetime-local" value={posterStartDate} onChange={(e) => setPosterStartDate(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">End Date</label>
                        <input type="datetime-local" value={posterEndDate} onChange={(e) => setPosterEndDate(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Status</label>
                        <select value={posterStatus} onChange={(e) => setPosterStatus(e.target.value as any)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer">
                          <option value="active" className="text-slate-900 bg-white">Active (Visible immediately)</option>
                          <option value="scheduled" className="text-slate-900 bg-white">Scheduled</option>
                          <option value="draft" className="text-slate-900 bg-white">Draft (Hidden)</option>
                          <option value="disabled" className="text-slate-900 bg-white">Disabled</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button 
                        type="submit"
                        className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        <Save className="h-4 w-4" /> {editingPoster ? 'Update Poster' : 'Publish Poster'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest">Active Promotions ({filteredPosters.length})</h4>
                      <span className="text-[10px] text-slate-300 font-bold bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                        {(filteredPosters || []).filter(p => p.status === 'active').length} Live
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
                      <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input 
                          type="text" 
                          placeholder="Search promotions..." 
                          value={posterSearch} 
                          onChange={(e) => setPosterSearch(e.target.value)} 
                          className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs" 
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={handleSeedCuratedPosters}
                        className="px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-600/30 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" /> Restore Curated
                      </button>
                      {state.posters.length > 0 && (
                        <button 
                          type="button"
                          onClick={handleBulkDeletePosters}
                          className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-600/30 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Purge All
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredPosters.map((poster, index) => (
                      <div key={poster.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden group flex flex-col justify-between">
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <img src={poster.imageUrl} alt={poster.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute top-3 left-3 flex gap-2">
                            <span className="px-2.5 py-1 bg-white text-slate-900 text-[9px] font-black rounded-lg shadow-sm">{poster.badge || 'PROMO'}</span>
                            <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg shadow-sm ${
                              poster.status === 'active' ? 'bg-emerald-500 text-white' : 
                              poster.status === 'scheduled' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-white'
                            }`}>{poster.status}</span>
                          </div>
                          <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-slate-200 text-[9px] font-black rounded-lg border border-white/10">
                              #{index + 1}
                            </span>
                            <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-amber-400 text-[9px] font-black rounded-lg border border-white/10 uppercase">
                              {poster.targetType || 'PRELIMS'}
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                        </div>
                        <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-white line-clamp-1">{poster.title}</h4>
                            {poster.subtitle && (
                              <p className="text-xs text-slate-300 font-medium line-clamp-2">{poster.subtitle}</p>
                            )}
                            <p className="text-xs text-slate-400 font-bold pt-1">
                              {poster.appIds?.includes('all') ? 'All Apps' : `${poster.appIds?.length || 0} Apps`} • {poster.position}
                            </p>
                          </div>

                          <div className="space-y-2 pt-3 border-t border-slate-800">
                            {/* Quick Toggle Active / Paused */}
                            <button
                              type="button"
                              onClick={async () => {
                                const updatedPosters = state.posters.map(p => 
                                  p.id === poster.id ? { ...p, status: (p.status === 'active' ? 'disabled' : 'active') as Poster['status'] } : p
                                );
                                await onSaveState({ ...state, posters: updatedPosters });
                              }}
                              className={`w-full py-1.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                poster.status === 'active'
                                  ? 'bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900/60 border border-emerald-500/30'
                                  : 'bg-amber-950/60 text-amber-400 hover:bg-amber-900/60 border border-amber-500/30'
                              }`}
                            >
                              {poster.status === 'active' ? '● Active (Click to Pause)' : '○ Paused (Click to Activate)'}
                            </button>

                            <div className="flex items-center gap-2">
                              {/* Reorder Buttons */}
                              <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => handleMovePoster(index, -1)}
                                  className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-all cursor-pointer"
                                  title="Move Earlier in Carousel Order"
                                >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={index === state.posters.length - 1}
                                  onClick={() => handleMovePoster(index, 1)}
                                  className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-all cursor-pointer"
                                  title="Move Later in Carousel Order"
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <button onClick={() => handleEditPoster(poster)} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black rounded-xl transition-all cursor-pointer">EDIT</button>
                              <button onClick={() => handleDeletePoster(poster.id, poster.title)} className="p-2 bg-rose-900/20 hover:bg-rose-900/40 text-rose-400 rounded-xl transition-all cursor-pointer" title="Delete Poster">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredPosters.length === 0 && (
                      <div className="col-span-full p-12 text-center text-slate-400 text-xs bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 space-y-3 font-bold">
                        <p>{posterSearch ? 'No promotions matched your search.' : 'No banners or promotional posters configured.'}</p>
                        {!posterSearch && (
                          <button
                            type="button"
                            onClick={handleSeedCuratedPosters}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4" /> Restore Curated Exam Banners
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 6: PUSH NOTIFICATIONS MANAGEMENT */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <form onSubmit={handleSendNotification} className="bg-white text-slate-900 p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-indigo-600" />
                  Send Push Notification to Students of <span className="text-indigo-600">{selectedAdminApp.name}</span>
                </h3>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Notification Title</label>
                  <input type="text" value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} placeholder="e.g. 🚨 New Mock Test Live Now!" className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500" />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Notification Message</label>
                  <textarea rows={3} value={notifMsg} onChange={(e) => setNotifMsg(e.target.value)} placeholder="Enter push notification message..." className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500" />
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer">
                    <Bell className="h-4 w-4" />
                    Broadcast Push Notification
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-100 uppercase tracking-wider">Broadcasted Notifications ({filteredNotifs.length})</h4>
                <div className="space-y-2">
                  {filteredNotifs.map((n) => (
                    <div key={n.id} className="p-4 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                          <span>{n.date}</span>
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-bold">Broadcasted</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900"><MathText text={n.title} /></h4>
                        <div className="text-xs text-slate-600"><MathText text={n.message} /></div>
                      </div>
                      <button onClick={() => handleDeleteNotification(n.id, n.title)} title="Delete Notification" className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {filteredNotifs.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-xs bg-slate-900/40 rounded-2xl border border-slate-800">No push notifications sent yet for {selectedAdminApp.name}.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: CURRENT AFFAIRS MANAGEMENT */}
          {activeTab === 'current-affairs' && (() => {
            const filteredCa = (state.currentAffairs || []).filter(item => 
              !caSearch || 
              item.title.toLowerCase().includes(caSearch.toLowerCase()) || 
              (item.summary && item.summary.toLowerCase().includes(caSearch.toLowerCase())) || 
              (item.category && item.category.toLowerCase().includes(caSearch.toLowerCase()))
            );

            return (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white text-slate-900 p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-50 rounded-2xl">
                        <Globe className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900">Current Affairs Studio</h3>
                        <p className="text-xs text-slate-500 font-medium">Manage news capsules and daily exam notes across your network.</p>
                      </div>
                    </div>
                    {editingCa && (
                      <button 
                        onClick={() => { setEditingCa(null); setCaTitle(''); setCaContent(''); setCaSummary(''); }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer"
                      >
                        <X className="w-4 h-4" /> Cancel Edit
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSaveCurrentAffairs} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Article Headline *</label>
                          <input 
                            type="text" 
                            value={caTitle} 
                            onChange={(e) => setCaTitle(e.target.value)}
                            placeholder="e.g. India's G20 Presidency Achievements"
                            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Language</label>
                            <select value={caLanguage} onChange={(e) => setCaLanguage(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer">
                              <option value="en" className="text-slate-900 bg-white">English</option>
                              <option value="hi" className="text-slate-900 bg-white">Hindi</option>
                              <option value="te" className="text-slate-900 bg-white">Telugu</option>
                              <option value="ur" className="text-slate-900 bg-white">Urdu</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Category</label>
                            <select value={caCategory} onChange={(e) => setCaCategory(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer">
                              <option value="National" className="text-slate-900 bg-white">National</option>
                              <option value="International" className="text-slate-900 bg-white">International</option>
                              <option value="State" className="text-slate-900 bg-white">State Specific</option>
                              <option value="Economy" className="text-slate-900 bg-white">Economy</option>
                              <option value="Science" className="text-slate-900 bg-white">Science & Tech</option>
                              <option value="Sports" className="text-slate-900 bg-white">Sports</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Short Summary</label>
                          <textarea 
                            rows={2} 
                            value={caSummary} 
                            onChange={(e) => setCaSummary(e.target.value)}
                            placeholder="Brief 1-2 sentence overview..."
                            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <AppTargetingSelector 
                          apps={state.apps}
                          selectedIds={selectedTargetAppIds}
                          onToggle={toggleAppSelection}
                          onSelectAll={selectAllApps}
                          onClear={clearAppSelection}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Detailed Content (Markdown Supported)</label>
                        <textarea 
                          rows={8} 
                          value={caContent} 
                          onChange={(e) => setCaContent(e.target.value)}
                          placeholder="Explain the event in detail..."
                          className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none leading-relaxed"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Activation Date</label>
                          <input type="datetime-local" value={caStartDate} onChange={(e) => setCaStartDate(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Expiry Date (Optional)</label>
                          <input type="datetime-local" value={caEndDate} onChange={(e) => setCaEndDate(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">Initial Status</label>
                          <select value={caStatus} onChange={(e) => setCaStatus(e.target.value as any)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none cursor-pointer">
                            <option value="draft" className="text-slate-900 bg-white">Draft</option>
                            <option value="scheduled" className="text-slate-900 bg-white">Scheduled</option>
                            <option value="published" className="text-slate-900 bg-white">Active / Published</option>
                            <option value="disabled" className="text-slate-900 bg-white">Disabled</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 gap-3">
                      <button 
                        type="button" 
                        onClick={() => {
                          const sample = JSON.stringify([{
                            title: "Sample News",
                            language: "en",
                            category: "National",
                            summary: "Short summary",
                            content: "Detailed content",
                            status: "scheduled",
                            startDate: new Date().toISOString()
                          }], null, 2);
                          setJsonInputText(sample);
                          setUploadMode('bulk');
                          setActiveTab('content');
                        }}
                        className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <FileJson className="w-4 h-4" /> Import via JSON
                      </button>
                      <button 
                        type="submit"
                        className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4" /> {editingCa ? 'Update News' : 'Publish News Article'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest">Recent Publications ({filteredCa.length})</h4>
                    <div className="relative flex-1 max-w-xs">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input 
                        type="text" 
                        placeholder="Search current affairs..." 
                        value={caSearch} 
                        onChange={(e) => setCaSearch(e.target.value)} 
                        className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {filteredCa.map(item => (
                      <div key={item.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              item.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                              item.status === 'scheduled' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {item.status}
                            </span>
                            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[9px] font-black uppercase">{item.category}</span>
                            <span className="text-xs text-slate-400 font-bold ml-2">Targeting {item.appIds?.length || 0} apps</span>
                          </div>
                          <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                          <p className="text-xs text-slate-300 font-medium line-clamp-1">{item.summary || item.content.slice(0, 100)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => handleEditCa(item)} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteCa(item.id, item.title)} className="p-2.5 bg-rose-900/20 hover:bg-rose-900/40 text-rose-400 rounded-xl transition-all cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {filteredCa.length === 0 && (
                      <div className="p-12 text-center text-slate-400 text-xs italic bg-slate-900/30 rounded-3xl border border-dashed border-slate-800 font-bold">
                        {caSearch ? 'No current affairs articles matched your search.' : 'No current affairs articles found.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB: MOCK TESTS MANAGER */}
          {activeTab === 'mock-tests' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <AdminMockTestManager
                apps={state.apps}
                questions={state.questions}
                currentAffairs={state.currentAffairs}
                adminEmail={adminEmail}
              />
            </div>
          )}


          {/* TAB 10: APPS MANAGEMENT & CONFIGURATION */}
          {activeTab === 'app-settings' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Dashboard Header & Add App Button */}
              <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-8 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-700/50">
                    All India Competitive Exams Apps Network
                  </span>
                  <h3 className="text-2xl font-black mt-2 tracking-tight">Apps Management Dashboard</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Manage active recruitment exams, central portals, state services, and police boards directly without mandatory regional steps.
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={handlePopulateAllIndiaExams}
                    className="px-5 py-3.5 bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:brightness-110 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap active:scale-95 border border-white/20"
                    title="Merge and activate all 25+ All India Competitive Exam portals (State PSCs, Police, Railways, SSC, Forest, Teaching, Endowments)"
                  >
                    <Globe className="w-4 h-4 text-amber-300" />
                    <span>Merge All India Exams Network</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAddAppModalOpen(true)}
                    className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add New Exam App</span>
                  </button>
                </div>
              </div>

              {/* Apps Registry List & Management Grid */}
              <div className="bg-white text-slate-900 p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900">Registered Exam Applications ({state.apps.length})</h4>
                      <p className="text-xs text-slate-500">Select an application to edit its configuration or toggle active status.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {state.apps.map(app => {
                    const isSelected = app.id === selectedAdminApp.id;
                    const isActive = app.isActive ?? true;
                    return (
                      <div 
                        key={app.id}
                        className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-4 ${
                          isSelected 
                            ? 'border-indigo-600 bg-indigo-50/40 shadow-md' 
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="text-sm font-black text-slate-900 line-clamp-1">{app.name}</h5>
                            <button
                              onClick={() => handleToggleAppActiveStatus(app.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                isActive 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}
                            >
                              {isActive ? 'Active' : 'Disabled'}
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-mono font-bold">
                              ID: {app.id}
                            </span>
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-[10px] font-bold">
                              {app.examCategory || 'State PSC'}
                            </span>
                            {app.jurisdiction && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-bold">
                                📍 {app.jurisdiction}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            Mediums: <strong className="text-slate-800">{(app.mediums || ['EM', 'TM']).join(', ')}</strong>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                          <button
                            onClick={() => setSelectedAppId(app.id)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isSelected ? 'Currently Configuring' : 'Configure App'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected App Configuration Form */}
              <div className="bg-white text-slate-900 p-8 rounded-3xl border border-slate-200 shadow-xl space-y-8">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 text-white">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Configure: {selectedAdminApp.name}</h3>
                    <p className="text-sm text-slate-500 font-medium">Update branding, exam categories, mediums, and package metadata for App ID: <span className="font-mono text-indigo-600 font-bold">{selectedAdminApp.id}</span></p>
                  </div>
                </div>

                <form onSubmit={handleUpdateAppConfig} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Basic Branding & Classification</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Application Name *</label>
                          <input 
                            type="text" 
                            value={configAppName} 
                            onChange={(e) => setConfigAppName(e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Exam Category</label>
                            <select
                              value={configAppCategory}
                              onChange={(e) => setConfigAppCategory(e.target.value)}
                              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none cursor-pointer"
                            >
                              <option value="State PSC">State Public Service Commission (Group 1, 2, 3, 4)</option>
                              <option value="State Police">State Police (SI, Constable, ASI)</option>
                              <option value="Forest Department">Forest Department (Beat Officer, Guard)</option>
                              <option value="Teaching & Education">Teaching & Education (DSC, TET, Lecturer)</option>
                              <option value="Central Recruitment">Central Government / UPSC</option>
                              <option value="Railway & SSC">Railway & Staff Selection Commission (SSC)</option>
                              <option value="Departmental & Others">Departmental & Other Exams</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Mediums / Languages</label>
                            <input 
                              type="text" 
                              value={configAppMediums} 
                              onChange={(e) => setConfigAppMediums(e.target.value)}
                              placeholder="EM, TM, HM, UM"
                              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Theme Color</label>
                            <select 
                              value={configAppTheme} 
                              onChange={(e) => setConfigAppTheme(e.target.value)}
                              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none cursor-pointer"
                            >
                              <option value="indigo">Indigo (Corporate)</option>
                              <option value="rose">Rose (Vibrant)</option>
                              <option value="emerald">Emerald (Success)</option>
                              <option value="amber">Amber (Alert)</option>
                              <option value="slate">Slate (Neutral)</option>
                              <option value="violet">Violet (Premium)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Accent Hex</label>
                            <div className="flex gap-2">
                              <input 
                                type="color" 
                                value={configAppAccent} 
                                onChange={(e) => setConfigAppAccent(e.target.value)}
                                className="h-12 w-12 p-1 bg-white border border-slate-200 rounded-xl cursor-pointer"
                              />
                              <input 
                                type="text" 
                                value={configAppAccent} 
                                onChange={(e) => setConfigAppAccent(e.target.value)}
                                className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold uppercase"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Technical Identifiers & Metadata</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Unique App ID (Canonical)</label>
                          <input 
                            type="text" 
                            disabled
                            value={selectedAdminApp.id} 
                            className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 font-mono cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Package ID (Android/App Store)</label>
                          <input 
                            type="text" 
                            value={configAppPackageId} 
                            onChange={(e) => setConfigAppPackageId(e.target.value)}
                            placeholder="com.exam.app"
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Jurisdiction Metadata (Optional)</label>
                        <input 
                          type="text" 
                          value={configAppJurisdiction} 
                          onChange={(e) => setConfigAppJurisdiction(e.target.value)}
                          placeholder="e.g. Andhra Pradesh, Central Government, Telangana"
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Visual Assets & Status</h4>
                      <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Primary Banner Image URL</label>
                        <input 
                          type="text" 
                          value={configAppBanner} 
                          onChange={(e) => setConfigAppBanner(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      
                      {configAppBanner && (
                        <div className="relative aspect-[21/9] rounded-3xl overflow-hidden border-4 border-white shadow-2xl group">
                          <img src={configAppBanner} alt="Banner Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex items-end p-6">
                            <div className="text-white">
                              <h5 className="text-lg font-black">{configAppName}</h5>
                              <p className="text-xs opacity-80 font-bold uppercase tracking-widest">{configAppCategory} • {configAppJurisdiction || 'All India'}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                        <div>
                          <h5 className="text-xs font-black text-slate-900 uppercase">Application Active Status</h5>
                          <p className="text-[11px] text-slate-500">Enable or disable this exam app in the student portal network.</p>
                        </div>
                        <input 
                          type="checkbox"
                          checked={configAppIsActive}
                          onChange={(e) => setConfigAppIsActive(e.target.checked)}
                          className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-end">
                      <button 
                        type="submit"
                        className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-2 cursor-pointer"
                      >
                        <Save className="w-5 h-5" />
                        Save Application Configuration
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Add New App Modal */}
              {isAddAppModalOpen && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white text-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
                  >
                    <div className="p-6 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-500 rounded-xl text-white">
                          <Plus className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-lg font-black">Add New Competitive Exam App</h4>
                          <p className="text-xs text-slate-300">Create or update an exam app without mandatory country/state dropdown steps.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsAddAppModalOpen(false)}
                        className="p-2 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleAddNewApp} className="p-8 space-y-6 overflow-y-auto">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Unique App ID *</label>
                          <input
                            type="text"
                            placeholder="e.g. tnpsc-group-1 or upsc-cse"
                            value={newAppId}
                            onChange={(e) => setNewAppId(e.target.value)}
                            className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                          />
                          <p className="text-[10px] text-slate-400 mt-1">Canonical ID used in routing and database.</p>
                        </div>

                        <div>
                          <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Application Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. TNPSC Group 1 Examination"
                            value={newAppName}
                            onChange={(e) => setNewAppName(e.target.value)}
                            className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Exam Category</label>
                          <select
                            value={newAppCategory}
                            onChange={(e) => setNewAppCategory(e.target.value)}
                            className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none cursor-pointer"
                          >
                            <option value="State PSC">State Public Service Commission</option>
                            <option value="State Police">State Police Recruitment</option>
                            <option value="Forest Department">Forest Department</option>
                            <option value="Teaching & Education">Teaching & Education (TET/DSC)</option>
                            <option value="Central Recruitment">Central Government / UPSC</option>
                            <option value="Railway & SSC">Railway & Staff Selection Commission</option>
                            <option value="Departmental & Others">Departmental & Other Exams</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Mediums / Languages</label>
                          <input
                            type="text"
                            value={newAppMediums}
                            onChange={(e) => setNewAppMediums(e.target.value)}
                            placeholder="EM, TM, HM, UM"
                            className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Package ID (Optional)</label>
                          <input
                            type="text"
                            value={newAppPackageId}
                            onChange={(e) => setNewAppPackageId(e.target.value)}
                            placeholder="com.tnpsc.group1"
                            className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Jurisdiction Metadata (Optional)</label>
                          <input
                            type="text"
                            value={newAppJurisdiction}
                            onChange={(e) => setNewAppJurisdiction(e.target.value)}
                            placeholder="e.g. Tamil Nadu, Central"
                            className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Banner Image URL</label>
                        <input
                          type="text"
                          value={newAppBanner}
                          onChange={(e) => setNewAppBanner(e.target.value)}
                          className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setIsAddAppModalOpen(false)}
                          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 cursor-pointer"
                        >
                          Save & Create App
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: REVENUE & SUBSCRIPTION ANALYTICS */}
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-700">
                      Global Financial & Subscription Dashboard
                    </span>
                    <h3 className="text-xl font-black mt-2">Country & App-wise Revenue Generation</h3>
                    <p className="text-xs text-slate-300">Track subscriber counts, plan purchases, and total earnings across all 28 Indian States & International Exam Portals.</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-right">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Total Paid Subscribers</p>
                    <p className="text-2xl font-black text-emerald-400">{(state.purchases || []).length} Aspirants</p>
                  </div>
                </div>

                {/* Currency Breakdown Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  {Object.entries(
                    (state.purchases || []).reduce((acc: Record<string, number>, p) => {
                      acc[p.currencySymbol] = (acc[p.currencySymbol] || 0) + p.amount;
                      return acc;
                    }, {})
                  ).map(([symbol, total]) => (
                    <div key={symbol} className="bg-white/5 backdrop-blur-xs p-4 rounded-2xl border border-white/10 space-y-1">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue ({symbol})</p>
                      <p className="text-xl font-black text-white">{symbol}{total.toLocaleString()}</p>
                    </div>
                  ))}
                  {(!state.purchases || state.purchases.length === 0) && (
                    <div className="bg-white/5 backdrop-blur-xs p-4 rounded-2xl border border-white/10 col-span-full text-center text-xs text-slate-400">
                      No purchase records yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Manual Subscription Grant Card */}
              {isAdmin && (
                <div className="bg-white text-slate-900 p-6 rounded-3xl border border-indigo-200 shadow-lg space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                      🎁
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">Allot Premium Subscription Manually</h4>
                      <p className="text-xs text-slate-500">Grant Elite access instantly by entering aspirant's Mobile Number or Gmail ID.</p>
                    </div>
                  </div>

                  {grantMsg && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2">
                      <span>✨</span> {grantMsg}
                    </div>
                  )}

                  <form onSubmit={handleManualGrantSubscription} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        User Mobile Number or Gmail ID *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 9876543210 or user@gmail.com"
                        value={grantUserIdentifier}
                        onChange={(e) => setGrantUserIdentifier(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Target Exam App
                      </label>
                      <select
                        value={grantTargetAppId}
                        onChange={(e) => setGrantTargetAppId(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                      >
                        {state.apps.map(app => (
                          <option key={app.id} value={app.id}>{app.name} ({app.countryName})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Subscription Plan
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={grantPlanId}
                          onChange={(e) => setGrantPlanId(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                        >
                          {(state.subscriptions || [])
                            .filter(s => s.appId === grantTargetAppId || s.appId === 'all')
                            .map(pkg => (
                              <option key={pkg.id} value={pkg.id}>{pkg.name} ({pkg.currencySymbol}{pkg.price})</option>
                            ))
                          }
                        </select>
                        <button
                          type="submit"
                          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 min-h-[44px]"
                        >
                          Allot Elite Plan
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* App-wise & Multi-Currency Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-100 uppercase tracking-wider">
                  App-wise Subscriptions & Multi-Currency Revenue Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(
                    (state.purchases || []).reduce((acc: Record<string, { appName: string; count: number; revByCurr: Record<string, number> }>, p) => {
                      const aId = p.appId || 'andhra-pradesh-appsc-group-2-en';
                      if (!acc[aId]) {
                        acc[aId] = { appName: p.appName || aId, count: 0, revByCurr: {} };
                      }
                      acc[aId].count += 1;
                      const sym = p.currencySymbol || '₹';
                      acc[aId].revByCurr[sym] = (acc[aId].revByCurr[sym] || 0) + p.amount;
                      return acc;
                    }, {})
                  ).map(([appId, data]) => (
                    <div key={appId} className="bg-white text-slate-900 p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-sm font-black text-slate-900">{data.appName}</h5>
                          <p className="text-[10px] font-mono font-bold text-slate-400">{appId}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-extrabold">
                          {data.count} Subscribers
                        </span>
                      </div>
                      <div className="space-y-1 border-t border-slate-100 pt-2 text-xs font-bold text-slate-700">
                        {Object.entries(data.revByCurr).map(([sym, amt]) => (
                          <div key={sym} className="flex justify-between">
                            <span className="text-slate-500">Revenue:</span>
                            <span className="text-emerald-700 font-black">{sym}{amt.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Transactions Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-100 uppercase tracking-wider">
                  Recent Subscription Transactions ({ (state.purchases || []).length })
                </h4>
                <div className="bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-black text-slate-700 uppercase">
                          <th className="p-3.5">Student Name</th>
                          <th className="p-3.5">Exam App & Country</th>
                          <th className="p-3.5">Plan Name</th>
                          <th className="p-3.5">Amount Paid</th>
                          <th className="p-3.5">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                        {(state.purchases || []).map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3.5 font-bold text-slate-900">{p.userName}</td>
                            <td className="p-3.5">
                              <p className="font-bold text-slate-900">{p.appName}</p>
                              <p className="text-[10px] text-slate-500">{p.countryName}</p>
                            </td>
                            <td className="p-3.5">
                              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-[10px] font-black">
                                {p.packageName}
                              </span>
                            </td>
                            <td className="p-3.5 font-black text-emerald-700">
                              {p.currencySymbol}{p.amount.toLocaleString()}
                            </td>
                            <td className="p-3.5 text-slate-500 text-[11px]">{p.date}</td>
                          </tr>
                        ))}
                        {(!state.purchases || state.purchases.length === 0) && (
                          <tr>
                            <td colSpan={5} className="text-center py-12 text-slate-400 text-xs">
                              No subscription purchases recorded yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: ADMIN-ONLY APP NETWORK SWITCHER & INDEPENDENT APPS MANAGEMENT */}
          {activeTab === 'app-network' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Architecture & Security Overview Header */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Admin-Only Privilege • Server Gated
                      </span>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                        {state.apps.length} Independent Apps Registered
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                      Exam Application Network & Context Control
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                      Every competitive examination operates as an independent application (e.g. APPSC Group-2 English, Telugu & Urdu Mediums, AP Police SI & Constable, AP DSC, AP TET, Central Exams).
                      Regular students have zero app-switching UI or external navigation controls. Only verified administrators may override live contexts.
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 text-left shrink-0 max-w-xs space-y-1.5">
                    <div className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Active Live Context
                    </div>
                    <h4 className="text-sm font-black text-white truncate">{activeApp.name}</h4>
                    <p className="text-[10px] font-mono text-slate-400 truncate">ID: {activeApp.id}</p>
                    <p className="text-[10px] text-slate-400">Package: <span className="text-indigo-300 font-mono">{activeApp.packageName || `com.aspirant.${activeApp.id.replace(/-/g, '.')}`}</span></p>
                  </div>
                </div>
              </div>

              {/* App Search & Filter Controls */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative flex-1 w-full sm:w-auto">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={appNetworkSearch}
                    onChange={(e) => setAppNetworkSearch(e.target.value)}
                    placeholder="Search apps by name, ID, medium (EM/TM/UM), or state..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/70 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="text-xs font-bold text-slate-400 shrink-0">
                  Showing {state.apps.filter(a => a.name.toLowerCase().includes(appNetworkSearch.toLowerCase()) || a.id.toLowerCase().includes(appNetworkSearch.toLowerCase())).length} of {state.apps.length} Independent Apps
                </div>
              </div>

              {/* Grid of Independent Applications */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {state.apps
                  .filter(a => 
                    a.name.toLowerCase().includes(appNetworkSearch.toLowerCase()) || 
                    a.id.toLowerCase().includes(appNetworkSearch.toLowerCase()) ||
                    (a.stateName && a.stateName.toLowerCase().includes(appNetworkSearch.toLowerCase()))
                  )
                  .map((app) => {
                    const isCurrentlyActive = app.id === activeApp.id;
                    const appQuestionsCount = state.questions.filter(q => q.appId === app.id).length;
                    const subjectCount = (app.syllabus || []).length;
                    const unitCount = (app.syllabus || []).reduce((sum, s) => sum + (s.units?.length || 0), 0);

                    return (
                      <div
                        key={app.id}
                        className={`bg-slate-900/90 rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between space-y-4 relative ${
                          isCurrentlyActive 
                            ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30' 
                            : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        {isCurrentlyActive && (
                          <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                            Live Active App
                          </div>
                        )}

                        <div className="space-y-3">
                          <div className="flex items-start gap-3.5">
                            <div 
                              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-lg shrink-0"
                              style={{ backgroundColor: app.accentColor || '#4f46e5' }}
                            >
                              {app.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-black text-white leading-snug truncate" title={app.name}>
                                {app.name}
                              </h4>
                              <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                                ID: <span className="text-indigo-400">{app.id}</span>
                              </p>
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-700">
                                  {app.stateName || 'India'}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 text-[10px] font-bold border border-indigo-800/50">
                                  Mediums: {app.mediums ? app.mediums.join(', ') : 'EM, TM, UM'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
                            <div>
                              <p className="text-[9px] uppercase font-black tracking-wider text-slate-500">Subjects</p>
                              <p className="text-xs font-black text-white mt-0.5">{subjectCount}</p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase font-black tracking-wider text-slate-500">Units</p>
                              <p className="text-xs font-black text-white mt-0.5">{unitCount}</p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase font-black tracking-wider text-slate-500">MCQs</p>
                              <p className="text-xs font-black text-amber-400 mt-0.5">{appQuestionsCount}</p>
                            </div>
                          </div>

                          <div className="space-y-1 text-[11px] text-slate-400">
                            <div className="flex justify-between font-mono text-[10px]">
                              <span>Android Package:</span>
                              <span className="text-slate-300 truncate max-w-[160px]">{app.packageName || `com.aspirant.${app.id.replace(/-/g, '.')}`}</span>
                            </div>
                            <div className="flex justify-between font-mono text-[10px]">
                              <span>Tenant ID:</span>
                              <span className="text-slate-300 truncate max-w-[160px]">{app.tenantId || `tenant_${app.id}`}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
                          {isCurrentlyActive ? (
                            <div className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black text-center flex items-center justify-center gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              Currently Live Active App
                            </div>
                          ) : (
                            <button
                              onClick={async () => {
                                await logAuditAction(
                                  'ADMIN_APP_SWITCH',
                                  app.id,
                                  'app',
                                  `Administrator switched live application context to ${app.name} (${app.id})`
                                );
                                setSelectedAppId(app.id);
                                onSelectApp?.(app.id);
                                setSuccessMsg(`Successfully switched active exam application to ${app.name}`);
                                setTimeout(() => setSuccessMsg(null), 4000);
                              }}
                              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                            >
                              <Globe className="w-4 h-4" />
                              Switch Active Live Exam Application
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Requirement 7: Institutional Android Dedicated Device / Kiosk Note */}
              <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Institutional Kiosk & Dedicated Device Architecture (Requirement 7)</h4>
                    <p className="text-xs text-slate-400">Strict Lock Task Mode specifications for exam labs and dedicated tablets</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 pt-2">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
                    <h5 className="font-bold text-amber-300">1. Android Lock Task Mode</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      For physical exam centres, devices provisioned via Android Enterprise Device Owner (EMM/DPC) pin the application window. Recent apps, home, and back keys are disabled at the OS kernel level.
                    </p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
                    <h5 className="font-bold text-amber-300">2. Emergency & Security Retained</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Emergency dialer (112), essential system services, and verified supervisor passcodes remain operational through dedicated device management policies without compromising examination integrity.
                    </p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
                    <h5 className="font-bold text-amber-300">3. Independent Package Isolation</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Each exam app produces independent APK/AAB outputs with separate package names, avoiding cross-tenant interference and preserving students&apos; individual mock test attempts and subscriptions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: ALL 22 OFFICIAL INDIAN LANGUAGES & LOCALIZATION MANAGEMENT */}
          {activeTab === 'translations' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Header Overview Banner */}
              <div className="bg-gradient-to-r from-orange-950 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-orange-800/40 relative overflow-hidden">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-400/30">
                        Eighth Schedule of the Constitution of India
                      </span>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        22 Languages + English Base
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                      Multilingual Localization Engine & Key Governance
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                      Comprehensive localization infrastructure supporting all 22 official constitutional languages.
                      Interface controls, navigation labels, and user messages are centrally keyed with automatic English fallback and RTL support.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 shrink-0">
                    <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 text-center">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Languages</p>
                      <p className="text-2xl font-black text-amber-400 mt-1">{LANGUAGES.length}</p>
                      <p className="text-[9px] text-slate-500 font-bold">Official + Base</p>
                    </div>
                    <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 text-center">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Core UI Coverage</p>
                      <p className="text-2xl font-black text-emerald-400 mt-1">100%</p>
                      <p className="text-[9px] text-slate-500 font-bold">Zero Missing Keys</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Zone Filter Chips & Search Bar */}
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {['All', 'South', 'North', 'East', 'West', 'North-East', 'National'].map((zone) => (
                      <button
                        key={zone}
                        onClick={() => setTranslationZone(zone)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          translationZone === zone
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        {zone} {zone !== 'All' && 'Zone'}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={translationSearch}
                      onChange={(e) => setTranslationSearch(e.target.value)}
                      placeholder="Search language or script..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Languages Grid with Status & Preview Trigger */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {LANGUAGES
                  .filter(l => {
                    if (translationZone !== 'All' && l.zone !== translationZone) return false;
                    if (!translationSearch) return true;
                    const q = translationSearch.toLowerCase();
                    return l.label.toLowerCase().includes(q) || l.nativeLabel.toLowerCase().includes(q) || l.script.toLowerCase().includes(q) || l.region.toLowerCase().includes(q);
                  })
                  .map((lang) => {
                    const currentStatus = languageStatusOverrides[lang.code] || lang.status;
                    const isSelectedForPreview = translationAdminLang === lang.code;

                    return (
                      <div
                        key={lang.code}
                        className={`p-4 rounded-2xl border transition-all duration-150 flex flex-col justify-between space-y-3 ${
                          isSelectedForPreview
                            ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30'
                            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{lang.flag}</span>
                              <span className="text-xs font-mono font-bold uppercase text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40">
                                {lang.code}
                              </span>
                            </div>
                            
                            {/* Status Selector */}
                            <select
                              value={currentStatus}
                              onChange={(e) => {
                                const newStatus = e.target.value as 'Published' | 'In Review' | 'Draft';
                                setLanguageStatusOverrides(prev => ({ ...prev, [lang.code]: newStatus }));
                                logAuditAction(
                                  'UPDATE_LANGUAGE_STATUS',
                                  lang.code,
                                  'app',
                                  `Administrator updated ${lang.label} status to ${newStatus}`
                                );
                              }}
                              className={`text-[10px] font-black px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${
                                currentStatus === 'Published' 
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' 
                                  : currentStatus === 'In Review'
                                  ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              <option value="Published" className="bg-slate-900 text-emerald-400">Published</option>
                              <option value="In Review" className="bg-slate-900 text-amber-400">In Review</option>
                              <option value="Draft" className="bg-slate-900 text-slate-400">Draft</option>
                            </select>
                          </div>

                          <div>
                            <h4 className="text-base font-black text-white">{lang.nativeLabel}</h4>
                            <p className="text-xs font-semibold text-slate-400">{lang.label}</p>
                          </div>

                          <div className="space-y-1 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Script:</span>
                              <span className="font-bold text-slate-300">{lang.script}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Region:</span>
                              <span className="font-medium text-slate-300 truncate max-w-[130px]">{lang.region}</span>
                            </div>
                            {lang.isRTL && (
                              <div className="flex justify-between text-indigo-400 font-bold">
                                <span>Text Direction:</span>
                                <span>Right-to-Left (RTL)</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => setTranslationAdminLang(lang.code)}
                          className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isSelectedForPreview
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                          }`}
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          {isSelectedForPreview ? 'Currently In Preview' : 'Inspect UI Translations'}
                        </button>
                      </div>
                    );
                  })}
              </div>

              {/* Active Language Live Dictionary & Key Inspector */}
              {(() => {
                const targetLangObj = LANGUAGES.find(l => l.code === translationAdminLang) || LANGUAGES[0];
                const transObj = getTranslation(translationAdminLang);
                const sampleEntries = Object.entries(transObj);

                return (
                  <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{targetLangObj.flag}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xl font-black text-white">{targetLangObj.nativeLabel} ({targetLangObj.label})</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-950 text-indigo-300 border border-indigo-800">
                              {targetLangObj.script}
                            </span>
                            {targetLangObj.isRTL && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-950 text-purple-300 border border-purple-800">
                                RTL Mode
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            Primary Regions: {targetLangObj.region} • Zone: {targetLangObj.zone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-black">
                          ✓ Key Coverage: 100% Complete
                        </span>
                      </div>
                    </div>

                    {/* Content & Accuracy Notice (Requirement 4 & 5) */}
                    <div className="bg-amber-950/40 border border-amber-800/60 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-200">
                      <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Exam Content & Official Questions Policy:</p>
                        <p className="text-amber-300/80 mt-0.5 leading-relaxed">
                          Application interface text (navigation, headers, settings, timer, scoring, buttons, and system alerts) is localized across all 22 official languages.
                          Official exam MCQs, statutory notifications, and syllabi are curated separately to guarantee strict academic accuracy without unreviewed automated translations.
                        </p>
                      </div>
                    </div>

                    {/* Localized Keys Table Preview */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center justify-between">
                        <span>Sample Localized UI Strings ({sampleEntries.length} Keys Registered)</span>
                        <span className="text-slate-500 font-mono text-[11px]">Universal English Fallback Active</span>
                      </h5>

                      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto max-h-96 custom-scrollbar">
                          <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-[11px] font-black uppercase text-slate-400">
                              <tr>
                                <th className="p-3 w-1/4">Key Identifier</th>
                                <th className="p-3 w-1/3">English (Base)</th>
                                <th className="p-3">Localized ({targetLangObj.label})</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                              {sampleEntries.map(([key, val]) => (
                                <tr key={key} className="hover:bg-slate-900/50">
                                  <td className="p-3 text-indigo-400 font-semibold">{key}</td>
                                  <td className="p-3 text-slate-300 font-sans">{TRANSLATIONS.en[key as keyof typeof TRANSLATIONS.en] || '—'}</td>
                                  <td className={`p-3 text-white font-sans font-bold ${targetLangObj.isRTL ? 'text-right' : ''}`}>
                                    {val}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

        </div>

        {/* EDIT MODAL */}
        {editingItem && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 capitalize flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">✏️</span>
                  <span>Edit {editingItem.type}: <span className="text-indigo-600">{editingItem.oldName || editingItem.name}</span></span>
                </h3>
                <button
                  onClick={() => setEditingItem(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    {editingItem.type === 'subject' ? 'Subject Name' : editingItem.type === 'unit' ? 'Unit Name' : editingItem.type === 'topic' ? 'Topic Name' : 'Subtopic Name'}
                  </label>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    autoFocus
                  />
                </div>

                {/* Background Image URL for ALL syllabus levels: Subject, Unit, Topic, Subtopic */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-700 uppercase flex items-center gap-1.5">
                      <span>🖼️ Background Image URL</span>
                      <span className="text-slate-400 font-medium lowercase">(optional)</span>
                    </label>
                    {editingItem.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setEditingItem({ ...editingItem, imageUrl: '' })}
                        className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={editingItem.imageUrl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/... or paste any image URL"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />

                  {/* Curated Presets for Quick Selection */}
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                      Or pick from curated presets:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                      {SYLLABUS_IMAGE_PRESETS.map((preset, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => setEditingItem({ ...editingItem, imageUrl: preset.url })}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                            editingItem.imageUrl === preset.url
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Card Preview */}
                  {editingItem.imageUrl && (
                    <div className="mt-2 space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Preview on Card:</span>
                      <div className="relative h-28 rounded-xl overflow-hidden border border-slate-300 bg-slate-950 shadow-inner">
                        <img
                          src={editingItem.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLElement).style.opacity = '0.3';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex items-end p-3">
                          <span className="text-xs font-black text-white drop-shadow-sm truncate">
                            {editingItem.name || 'Sample Title'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {editingItem.type === 'subject' && (
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">Color Gradient</label>
                    <input
                      type="text"
                      value={editingItem.color || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, color: e.target.value })}
                      placeholder="from-orange-500 to-amber-600"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={executeEdit}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-bold text-white shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-rose-200">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-black">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Confirm Deletion</h3>
                  <p className="text-xs text-slate-500">Are you sure you want to delete {deleteConfirm.title}?</p>
                </div>
              </div>
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-[11px] text-rose-800 font-medium">
                This action is permanent and cannot be undone.
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BULK ACTION CONFIRMATION MODAL */}
        {bulkActionConfirm && (
          <div className="fixed inset-0 z-100 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl space-y-6 border border-slate-200 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600" />
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center text-3xl shadow-inner">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{bulkActionConfirm.action}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed mt-2">{bulkActionConfirm.description}</p>
                </div>
              </div>

              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-[11px] text-rose-800 font-bold flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>CRITICAL: This is a destructive bulk operation. All selected records across the entire network will be modified.</span>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={async () => {
                    await bulkActionConfirm.onConfirm();
                    setBulkActionConfirm(null);
                    setTimeout(() => setSuccessMsg(null), 4000);
                  }}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black shadow-xl shadow-slate-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Proceed with Bulk Operation
                </button>
                <button
                  onClick={() => setBulkActionConfirm(null)}
                  className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-xs font-black transition-all cursor-pointer"
                >
                  Cancel & Go Back
                </button>
              </div>
            </motion.div>
          </div>
        )}
        </div>
      </main>
    </div>

    {/* File Upload Status Confirmation Modal */}
    {uploadStatusModal && (
      <FileUploadStatusModal
        isOpen={uploadStatusModal.isOpen}
        onClose={() => setUploadStatusModal(null)}
        status={uploadStatusModal.status}
        fileName={uploadStatusModal.fileName}
        fileType={uploadStatusModal.fileType}
        fileSize={uploadStatusModal.fileSize}
        title={uploadStatusModal.title}
        message={uploadStatusModal.message}
        details={uploadStatusModal.details}
        onViewReport={uploadStatusModal.onViewReport}
      />
    )}

    {/* File Deletion Confirmation Dialog */}
    {deleteFileTarget && (
      <FileDeleteConfirmModal
        isOpen={!!deleteFileTarget}
        onClose={() => setDeleteFileTarget(null)}
        fileName={deleteFileTarget.fileName}
        fileDetails={deleteFileTarget.fileDetails}
        fileType={deleteFileTarget.fileType}
        recordCount={deleteFileTarget.recordCount}
        title={deleteFileTarget.title}
        message={deleteFileTarget.message}
        onConfirmDelete={async () => {
          await deleteFileTarget.onConfirm();
          setDeleteFileTarget(null);
        }}
      />
    )}

      {/* TAB 13: SUPPORT & CONTACT DETAILS MANAGEMENT */}
      {activeTab === 'support-settings' && (
        <div className="p-6 sm:p-10 space-y-8 max-w-5xl mx-auto w-full animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black tracking-wider uppercase">
                <HelpCircle className="w-3.5 h-3.5" />
                Customer Support Center Management
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Support & Contact Details</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Manage official WhatsApp, Email, Telegram, and support center messages displayed across all apps.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsRestoreConfirmOpen(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black tracking-wider uppercase transition-colors cursor-pointer"
              >
                Restore Defaults
              </button>
              <button
                onClick={() => {
                  saveSupportConfig(supportForm);
                  setSuccessMsg('Support contact settings saved successfully across all apps!');
                  setTimeout(() => setSuccessMsg(null), 3000);
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-black tracking-wider uppercase shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WhatsApp Settings */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  WhatsApp Support
                </h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={supportForm.whatsappEnabled}
                    onChange={(e) => setSupportForm({ ...supportForm, whatsappEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Country Code</label>
                  <input 
                    type="text"
                    value={supportForm.whatsappCountryCode}
                    onChange={(e) => setSupportForm({ ...supportForm, whatsappCountryCode: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
                    placeholder="91"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input 
                    type="text"
                    value={supportForm.whatsappPhoneNumber}
                    onChange={(e) => setSupportForm({ ...supportForm, whatsappPhoneNumber: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none font-mono"
                    placeholder="9493512768"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Formatted link: <span className="font-mono text-emerald-700">https://wa.me/{supportForm.whatsappCountryCode}{supportForm.whatsappPhoneNumber}</span>
              </p>
            </div>

            {/* Email Settings */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                  Email Support
                </h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={supportForm.emailEnabled}
                    onChange={(e) => setSupportForm({ ...supportForm, emailEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Support Email Address</label>
                <input 
                  type="email"
                  value={supportForm.supportEmail}
                  onChange={(e) => setSupportForm({ ...supportForm, supportEmail: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none font-mono"
                  placeholder="Sobhadhanaraju1@gmail.com"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Mailto link: <span className="font-mono text-blue-700">mailto:{supportForm.supportEmail}</span>
              </p>
            </div>

            {/* Telegram Settings */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-sky-500 inline-block" />
                  Telegram Support
                </h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={supportForm.telegramEnabled}
                    onChange={(e) => setSupportForm({ ...supportForm, telegramEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
                </label>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Telegram Username</label>
                <input 
                  type="text"
                  value={supportForm.telegramUsername}
                  onChange={(e) => setSupportForm({ ...supportForm, telegramUsername: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none font-mono"
                  placeholder="DHANARAJU0"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Telegram link: <span className="font-mono text-sky-700">https://t.me/{supportForm.telegramUsername.replace(/^@/, '')}</span>
              </p>
            </div>

            {/* Display & Text Settings */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 pb-3 border-b border-slate-100">
                Support Center Banner & Text
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Support Page Title</label>
                  <input 
                    type="text"
                    value={supportForm.supportTitle}
                    onChange={(e) => setSupportForm({ ...supportForm, supportTitle: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Support Description</label>
                  <textarea 
                    rows={2}
                    value={supportForm.supportDescription}
                    onChange={(e) => setSupportForm({ ...supportForm, supportDescription: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Announcement Banner Text</label>
                  <input 
                    type="text"
                    value={supportForm.supportAnnouncement}
                    onChange={(e) => setSupportForm({ ...supportForm, supportAnnouncement: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Restore Defaults Confirmation Modal */}
          {isRestoreConfirmOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
              <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
                <h3 className="text-lg font-black text-slate-900">Restore Default Support Details?</h3>
                <p className="text-xs text-slate-600 font-medium">
                  This will reset WhatsApp number (9493512768), support email, and Telegram username to the official default values.
                </p>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setIsRestoreConfirmOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setSupportForm(DEFAULT_SUPPORT_CONFIG);
                      saveSupportConfig(DEFAULT_SUPPORT_CONFIG);
                      setIsRestoreConfirmOpen(false);
                      setSuccessMsg('Restored default support details successfully!');
                      setTimeout(() => setSuccessMsg(null), 3000);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-black cursor-pointer"
                  >
                    Confirm Restore
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    {/* Detailed Content Upload Report Modal */}
    {detailedReport && (
      <ContentUploadReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        report={detailedReport}
      />
    )}

    {/* Topic Theory & Practice Options Editor Modal */}
    {adminTheoryTarget && (
      <AdminTheoryEditorModal
        isOpen={!!adminTheoryTarget}
        onClose={() => setAdminTheoryTarget(null)}
        subjectName={adminTheoryTarget.subjectName}
        unitName={adminTheoryTarget.unitName}
        topic={adminTheoryTarget.topic}
        onSave={handleSaveTopicTheory}
      />
    )}

    <div className="px-4 sm:px-6 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-slate-300">Live Database Connected</span>
          {!isAdmin && (
            <>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-md text-[9px] font-black uppercase border border-amber-500/20">Staff Mode: Restricted</span>
            </>
          )}
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline">Active App: <strong className="text-white">{selectedAdminApp.name}</strong></span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              onSelectApp?.(selectedAppId);
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Globe className="h-3.5 w-3.5 text-emerald-400" />
            <span>Open Student Interface</span>
          </button>

          <button 
            onClick={onClose} 
            className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer"
          >
            Done & Return
          </button>
        </div>
      </div>
    </div>
  );
}
