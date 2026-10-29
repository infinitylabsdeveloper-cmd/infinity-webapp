import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  HelpCircle, 
  ShieldCheck, 
  ChevronRight, 
  ChevronDown,
  Copy, 
  Check,
  Clock,
  Sparkles,
  Search,
  Send,
  MessageSquare,
  CheckCircle2,
  PhoneCall,
  BookOpen,
  CreditCard,
  UserCheck,
  Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface SupportConfig {
  whatsappCountryCode: string;
  whatsappPhoneNumber: string;
  supportEmail: string;
  telegramUsername: string;
  supportTitle: string;
  supportDescription: string;
  supportAnnouncement: string;
  whatsappEnabled: boolean;
  emailEnabled: boolean;
  telegramEnabled: boolean;
  updatedAt?: number;
}

export const DEFAULT_SUPPORT_CONFIG: SupportConfig = {
  whatsappCountryCode: '91',
  whatsappPhoneNumber: '9493512768',
  supportEmail: 'Sobhadhanaraju1@gmail.com',
  telegramUsername: 'DHANARAJU0',
  supportTitle: 'Concierge Support & Help Center',
  supportDescription: 'We are dedicated to your exam success. Connect directly with our support team for assistance with your account, subscriptions, payments, or study content.',
  supportAnnouncement: 'Priority Aspirant Support • Prompt & Personal Assistance',
  whatsappEnabled: true,
  emailEnabled: true,
  telegramEnabled: true,
};

export const SUPPORT_CATEGORIES = [
  'Login & OTP Verification',
  'Subscription & Premium Access',
  'Payment & Billing Queries',
  'MCQ Content & Explanations',
  'Mock Tests & Analytics',
  'Account & Profile Settings',
  'Technical Assistance',
  'General Inquiry'
];

export const HELP_CENTER_FAQS = [
  {
    category: 'Account & Login',
    question: 'What should I do if I do not receive the mobile SMS OTP?',
    answer: 'Please ensure your 10-digit Indian mobile number is entered accurately and has active network coverage. If telecom DND filters delay the SMS, you can sign in instantly using Email & Password or Google Sign-In, or message us on WhatsApp for immediate account assistance.'
  },
  {
    category: 'Subscriptions & Payments',
    question: 'My payment was deducted, when will my Premium Plan activate?',
    answer: 'Premium plans activate automatically within seconds of Razorpay verification. If your bank or UPI app shows a debit but the plan is not yet reflected, please refresh the app once or share your Transaction / UTR ID with us on WhatsApp or Email for priority activation.'
  },
  {
    category: 'MCQ Practice & Syllabus',
    question: 'How do I report an error in a question or explanation?',
    answer: 'Select "MCQ Content & Explanations" above, mention the subject, topic, and question details in the message box, and click "Send Email" or "Chat on WhatsApp". Our academic panel reviews and updates flagged questions promptly.'
  },
  {
    category: 'Mock Tests & Analytics',
    question: 'How does the Mock Test scoring and negative marking work?',
    answer: 'Full-length and custom mock tests follow official competitive exam marking rules, calculating accuracy, speed, and negative deductions automatically. Topic-wise practice sets allow penalty-free learning with instant explanations.'
  },
  {
    category: 'Account & Login',
    question: 'Why are my registered email and mobile number read-only in Profile?',
    answer: 'To protect your subscription security and prevent unauthorized account takeovers, verified login identifiers are locked against accidental edits. Contact our support team if you need an official credential update.'
  },
  {
    category: 'Technical Assistance',
    question: 'Can I customize font sizes and themes for long reading sessions?',
    answer: 'Yes. Open Display & Typography from the navigation menu to adjust font families, reading text sizes, line spacing, and comfortable light themes tailored for extended exam preparation.'
  }
];

export function getStoredSupportConfig(): SupportConfig {
  try {
    const saved = localStorage.getItem('app_support_config_v2');
    if (saved) {
      return { ...DEFAULT_SUPPORT_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {}
  return DEFAULT_SUPPORT_CONFIG;
}

export function saveSupportConfig(config: SupportConfig) {
  try {
    const updated = { ...config, updatedAt: Date.now() };
    localStorage.setItem('app_support_config_v2', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('support_config_updated', { detail: updated }));
  } catch (e) {}
}

/* Official WhatsApp Brand Icon */
export function WhatsAppBrandIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.031 2C6.508 2 2.023 6.485 2.023 12.008c0 1.766.461 3.49 1.337 5.012L2 22l5.122-1.343a9.967 9.967 0 0 0 4.909 1.293h.004c5.522 0 10.007-4.485 10.007-10.008C22.042 6.485 17.554 2 12.031 2zm5.828 14.132c-.246.693-1.432 1.326-1.996 1.411-.513.077-1.163.11-1.878-.117-.434-.138-.99-.322-1.703-.63-2.996-1.293-4.952-4.312-5.102-4.512-.15-.2-1.218-1.621-1.218-3.092 0-1.471.771-2.194 1.045-2.493.274-.3.598-.375.797-.375.199 0 .399.002.573.01.184.009.43-.07.673.514.249.599.847 2.069.921 2.219.075.15.125.324.025.524-.1.2-.15.324-.299.499-.15.175-.315.39-.449.524-.15.15-.305.312-.131.611.174.3.774 1.277 1.662 2.068 1.142 1.018 2.104 1.333 2.403 1.483.299.15.473.125.648-.075.174-.2.747-.873.946-1.172.2-.3.399-.25.673-.15.274.1 1.744.823 2.043.972.299.15.498.225.573.35.075.125.075.723-.171 1.416z" />
    </svg>
  );
}

/* Official Telegram Brand Icon */
export function TelegramBrandIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

interface SupportCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName?: string;
  initialTab?: 'contact' | 'faq' | 'inquiry';
}

export default function SupportCenterModal({
  isOpen,
  onClose,
  appName = 'Exam Preparation Portal',
  initialTab = 'contact'
}: SupportCenterModalProps) {
  const [config, setConfig] = useState<SupportConfig>(getStoredSupportConfig);
  const [activeTab, setActiveTab] = useState<'contact' | 'faq' | 'inquiry'>(initialTab);
  const [selectedCategory, setSelectedCategory] = useState<string>(SUPPORT_CATEGORIES[0]);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [faqSearch, setFaqSearch] = useState<string>('');
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [inquirySubmitted, setInquirySubmitted] = useState<boolean>(false);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setConfig(customEvent.detail);
      }
    };
    window.addEventListener('support_config_updated', handleUpdate);
    return () => {
      window.removeEventListener('support_config_updated', handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setConfig(getStoredSupportConfig());
      setActiveTab(initialTab);
      setInquirySubmitted(false);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const cleanCountry = (config.whatsappCountryCode || '91').replace(/\D/g, '') || '91';
  const cleanPhone = (config.whatsappPhoneNumber || '9493512768').replace(/\D/g, '');
  const waNumber = `${cleanCountry}${cleanPhone}`;
  const formattedPhoneDisplay = `+${cleanCountry} ${cleanPhone}`;

  const waText = encodeURIComponent(
    `Hello Support Team,\n\nApp: ${appName}\nTopic: ${selectedCategory}\n\n${customMessage.trim() ? customMessage.trim() : 'I would like assistance regarding the app.'}`
  );
  const waLink = `https://wa.me/${waNumber}?text=${waText}`;

  const emailSubject = encodeURIComponent(`Support Request: ${selectedCategory} — ${appName}`);
  const emailBody = encodeURIComponent(
    `Hello Support Team,\n\nApp Name: ${appName}\nCategory: ${selectedCategory}\n\nInquiry Details:\n${customMessage.trim() ? customMessage.trim() : 'Please share details of your question or issue here...'}\n\n---\nSent via ${appName} Support Center`
  );
  const emailLink = `mailto:${config.supportEmail}?subject=${emailSubject}&body=${emailBody}`;

  const cleanTelegram = (config.telegramUsername || 'DHANARAJU0').replace(/^@/, '').trim();
  const telegramLink = `https://t.me/${cleanTelegram}`;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2200);
  };

  const filteredFaqs = HELP_CENTER_FAQS.filter(
    item =>
      !faqSearch.trim() ||
      item.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      item.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#2A2118]/35 backdrop-blur-md overflow-y-auto font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative w-full max-w-4xl bg-[#FFFDF9] border border-[#E6D4B5] rounded-[2rem] shadow-[0_25px_70px_-15px_rgba(140,105,45,0.22)] overflow-hidden my-6 flex flex-col max-h-[92vh]"
      >
        {/* ================================================================= */}
        {/* LUXURIOUS IVORY & CHAMPAGNE GOLD HEADER                           */}
        {/* ================================================================= */}
        <div className="relative bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E4] to-[#F3E5CA] px-6 sm:px-9 pt-6 sm:pt-8 pb-5 border-b border-[#E6D4B5] overflow-hidden shrink-0">
          {/* Delicate warm champagne decorative highlights */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#E8C988]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 left-1/4 w-56 h-56 rounded-full bg-[#F5E1B5]/30 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-[#8A641B]">
                <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
                <span>{appName}</span>
                <span aria-hidden="true">·</span>
                <span>Official Trust & Help Center</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#2C2013] font-serif">
                {config.supportTitle || 'Concierge Support & Help Center'}
              </h2>

              <p className="text-xs sm:text-sm text-[#63513D] font-medium max-w-2xl leading-relaxed">
                {config.supportDescription}
              </p>
            </div>

            <button 
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-[#FFFDF9]/90 hover:bg-[#F5E9D3] text-[#63513D] hover:text-[#2C2013] transition-all cursor-pointer border border-[#DFC9A3] shadow-2xs shrink-0"
              aria-label="Close Support Center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subtle Champagne Gold Announcement & Navigation Bar */}
          <div className="relative z-10 mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#E6D4B5]/70">
            {config.supportAnnouncement ? (
              <div className="flex items-center gap-2 text-xs font-bold text-[#7A5612]">
                <ShieldCheck className="w-4 h-4 text-[#B8860B] shrink-0" />
                <span>{config.supportAnnouncement}</span>
              </div>
            ) : <div />}

            {/* Segmented View Switcher (Light Ivory & Gold) */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#F4E9D5] border border-[#E2CCA4] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('contact')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'contact'
                    ? 'bg-[#FFFDF9] text-[#2C2013] shadow-2xs border border-[#DFC89E]'
                    : 'text-[#6E583F] hover:text-[#2C2013]'
                }`}
              >
                Contact Us
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('faq')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'faq'
                    ? 'bg-[#FFFDF9] text-[#2C2013] shadow-2xs border border-[#DFC89E]'
                    : 'text-[#6E583F] hover:text-[#2C2013]'
                }`}
              >
                Help & FAQs
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('inquiry')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'inquiry'
                    ? 'bg-[#FFFDF9] text-[#2C2013] shadow-2xs border border-[#DFC89E]'
                    : 'text-[#6E583F] hover:text-[#2C2013]'
                }`}
              >
                Write to Us
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* SCROLLABLE BODY (WARM PEARL IVORY & CREAM)                        */}
        {/* ================================================================= */}
        <div className="p-6 sm:p-9 space-y-7 overflow-y-auto custom-scrollbar bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F7F0E4] flex-1">
          
          {activeTab === 'contact' && (
            <div className="space-y-7 animate-in fade-in duration-200">
              {/* 1. MODERN LUXURY CONTACT CARDS */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#7A5A1E]">
                    Direct Official Support Channels
                  </h3>
                  <span className="text-xs text-[#7D6B57] font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#B8860B]" />
                    <span>Typical response within 15–60 minutes</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Card 1: WhatsApp Support */}
                  {config.whatsappEnabled && (
                    <div className="group bg-[#FFFFFF] rounded-2xl p-6 border border-[#E6D5B8] hover:border-[#C59B27] shadow-[0_8px_28px_-8px_rgba(166,124,46,0.12)] hover:shadow-[0_14px_34px_-8px_rgba(166,124,46,0.20)] flex flex-col justify-between space-y-5 transition-all duration-200">
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-[#F3FAF6] border border-[#C6E7D4] text-[#15803D] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                            <WhatsAppBrandIcon className="w-6 h-6" />
                          </div>
                          <span className="text-[11px] font-bold text-[#15803D] tracking-wide">
                            Instant Chat
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-black text-[#2C2013]">WhatsApp Support</h4>
                          <p className="text-xs text-[#6E5A48] font-medium mt-0.5">
                            Fastest assistance for OTP, login & payment queries
                          </p>
                        </div>

                        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#FAF6EE] border border-[#E6D5B8] text-xs font-bold text-[#3A2B1C] font-mono">
                          <span className="truncate">{formattedPhoneDisplay}</span>
                          <button 
                            type="button"
                            onClick={() => handleCopy(formattedPhoneDisplay, 'whatsapp')}
                            className="text-[#8C6D32] hover:text-[#15803D] transition-colors cursor-pointer ml-2 shrink-0"
                            title="Copy WhatsApp number"
                          >
                            {copiedField === 'whatsapp' ? (
                              <Check className="w-4 h-4 text-[#15803D]" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <a 
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#1E8E52] to-[#157A43] hover:from-[#197B46] hover:to-[#116838] text-white text-xs font-extrabold tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <WhatsAppBrandIcon className="w-4 h-4" />
                        <span>Chat on WhatsApp</span>
                      </a>
                    </div>
                  )}

                  {/* Card 2: Email Support */}
                  {config.emailEnabled && (
                    <div className="group bg-[#FFFFFF] rounded-2xl p-6 border border-[#E6D5B8] hover:border-[#C59B27] shadow-[0_8px_28px_-8px_rgba(166,124,46,0.12)] hover:shadow-[0_14px_34px_-8px_rgba(166,124,46,0.20)] flex flex-col justify-between space-y-5 transition-all duration-200">
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-[#FDF6E7] border border-[#E5CA8F] text-[#9A6B13] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                            <Mail className="w-6 h-6" />
                          </div>
                          <span className="text-[11px] font-bold text-[#9A6B13] tracking-wide">
                            Official Desk
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-black text-[#2C2013]">Email Support</h4>
                          <p className="text-xs text-[#6E5A48] font-medium mt-0.5">
                            Detailed help for account, syllabus & billing receipts
                          </p>
                        </div>

                        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#FAF6EE] border border-[#E6D5B8] text-xs font-bold text-[#3A2B1C] font-mono">
                          <span className="truncate" title={config.supportEmail}>{config.supportEmail}</span>
                          <button 
                            type="button"
                            onClick={() => handleCopy(config.supportEmail, 'email')}
                            className="text-[#8C6D32] hover:text-[#9A6B13] transition-colors cursor-pointer ml-2 shrink-0"
                            title="Copy email address"
                          >
                            {copiedField === 'email' ? (
                              <Check className="w-4 h-4 text-[#15803D]" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <a 
                        href={emailLink}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#B8860B] via-[#C99722] to-[#A37408] hover:from-[#A37408] hover:to-[#8F6405] text-white text-xs font-extrabold tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Send Email</span>
                      </a>
                    </div>
                  )}

                  {/* Card 3: Telegram Support */}
                  {config.telegramEnabled && (
                    <div className="group bg-[#FFFFFF] rounded-2xl p-6 border border-[#E6D5B8] hover:border-[#C59B27] shadow-[0_8px_28px_-8px_rgba(166,124,46,0.12)] hover:shadow-[0_14px_34px_-8px_rgba(166,124,46,0.20)] flex flex-col justify-between space-y-5 transition-all duration-200">
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-[#F2F8FD] border border-[#C5E0F5] text-[#0369A1] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                            <TelegramBrandIcon className="w-6 h-6" />
                          </div>
                          <span className="text-[11px] font-bold text-[#0369A1] tracking-wide">
                            Direct Channel
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-black text-[#2C2013]">Telegram Support</h4>
                          <p className="text-xs text-[#6E5A48] font-medium mt-0.5">
                            Connect on Telegram for study updates & quick help
                          </p>
                        </div>

                        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#FAF6EE] border border-[#E6D5B8] text-xs font-bold text-[#3A2B1C] font-mono">
                          <span className="truncate">@{cleanTelegram}</span>
                          <button 
                            type="button"
                            onClick={() => handleCopy(`@${cleanTelegram}`, 'telegram')}
                            className="text-[#8C6D32] hover:text-[#0369A1] transition-colors cursor-pointer ml-2 shrink-0"
                            title="Copy Telegram username"
                          >
                            {copiedField === 'telegram' ? (
                              <Check className="w-4 h-4 text-[#15803D]" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <a 
                        href={telegramLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] hover:from-[#0369A1] hover:to-[#075985] text-white text-xs font-extrabold tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <TelegramBrandIcon className="w-4 h-4" />
                        <span>Open Telegram</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. PERSONALIZED TOPIC & QUICK MESSAGE COMPOSER */}
              <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E6D5B8] shadow-[0_6px_24px_-8px_rgba(166,124,46,0.10)] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EFE3CE] pb-3.5">
                  <div>
                    <h4 className="text-sm font-black text-[#2C2013] flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-[#B8860B]" />
                      <span>Customize Your Support Inquiry</span>
                    </h4>
                    <p className="text-xs text-[#6E5A48] font-medium mt-0.5">
                      Select a topic and optionally describe your issue to pre-fill your WhatsApp or Email message
                    </p>
                  </div>
                </div>

                {/* Topic Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SUPPORT_CATEGORIES.map(cat => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all border cursor-pointer truncate ${
                          isSelected
                            ? 'bg-[#FDF4E1] text-[#6B480A] border-[#C99A2E] shadow-2xs ring-1 ring-[#DFC075]'
                            : 'bg-[#FAF6EE]/70 text-[#5C4A38] border-[#E6D5B8] hover:border-[#C99A2E]/60 hover:bg-[#FAF3E4]'
                        }`}
                        title={cat}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>

                {/* Optional Message Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#4A3A28] block">
                    Additional Details (Optional — automatically included when you click WhatsApp or Email above)
                  </label>
                  <textarea
                    rows={2}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Mention your registered mobile number, email, transaction ID, or question topic..."
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF6EE]/80 border border-[#DFC9A3] text-xs font-semibold text-[#2C2013] placeholder:text-[#96836E] focus:outline-none focus:bg-white focus:border-[#B8860B] focus:ring-2 focus:ring-[#EED9A8] resize-none transition-all"
                  />
                </div>
              </div>

              {/* 3. TRUST & SECURITY ASSURANCE FOOTER BANNER */}
              <div className="bg-[#FDF8EC] border border-[#E5CE9C] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#F5E6C4] border border-[#DEC082] text-[#8C6214] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs text-[#594324] space-y-1">
                  <span className="font-black text-[#2C2013] block">
                    Official Aspirant Protection & Privacy Guarantee
                  </span>
                  <p className="font-medium leading-relaxed">
                    When reaching out to support, please share your registered mobile number or email address for swift verification. Our team will never ask for your account password, UPI PIN, or confidential OTP codes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#8C6D32] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="Search common questions (e.g., OTP, payment, mock test, font size)..."
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#FFFFFF] border border-[#E2CDA6] text-xs sm:text-sm font-semibold text-[#2C2013] placeholder:text-[#948069] focus:outline-none focus:border-[#B8860B] focus:ring-2 focus:ring-[#EFE0BC] shadow-2xs"
                />
              </div>

              {/* Accordion List */}
              <div className="space-y-3">
                {filteredFaqs.map((faq, idx) => {
                  const isOpenFaq = openFaqIdx === idx;
                  return (
                    <div
                      key={idx}
                      className="bg-[#FFFFFF] rounded-2xl border border-[#E6D5B8] overflow-hidden transition-all shadow-2xs"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIdx(isOpenFaq ? null : idx)}
                        className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-[#FAF6EE]/60 transition-colors cursor-pointer"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9A6B13] block">
                            {faq.category}
                          </span>
                          <h4 className="text-xs sm:text-sm font-black text-[#2C2013]">
                            {faq.question}
                          </h4>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-[#8C6D32] shrink-0 transition-transform duration-200 ${
                            isOpenFaq ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpenFaq && (
                        <div className="px-5 pb-4 pt-1 text-xs text-[#594736] font-medium leading-relaxed border-t border-[#F2E8D5] bg-[#FFFDF9]">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Still Need Help Card */}
              <div className="bg-[#FDF8EC] border border-[#E5CE9C] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-black text-[#2C2013]">Still have a question?</h4>
                  <p className="text-xs text-[#6E5A48] font-medium">
                    Connect directly with our support team on WhatsApp or Email.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('contact')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#9E7006] text-white text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-xs shrink-0"
                >
                  View Contact Options
                </button>
              </div>
            </div>
          )}

          {activeTab === 'inquiry' && (
            <div className="bg-[#FFFFFF] rounded-2xl p-6 sm:p-8 border border-[#E6D5B8] shadow-2xs space-y-5 animate-in fade-in duration-200">
              <div className="border-b border-[#EFE3CE] pb-4">
                <h3 className="text-base sm:text-lg font-black text-[#2C2013]">
                  Submit a Support Request or Feedback
                </h3>
                <p className="text-xs text-[#6E5A48] font-medium mt-1">
                  Choose a category, describe your request or question error, and send it directly to our official team.
                </p>
              </div>

              {inquirySubmitted ? (
                <div className="p-6 rounded-2xl bg-[#F4FBF7] border border-[#C3E6D1] text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E3F6EB] text-[#15803D] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-black text-[#1E3A2B]">
                      Your Support Inquiry is Ready!
                    </h4>
                    <p className="text-xs text-[#3B5E4B] font-medium max-w-md mx-auto">
                      Your message has been logged. Choose your preferred channel below to send it immediately to our team:
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    {config.whatsappEnabled && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 rounded-xl bg-[#168045] hover:bg-[#126B39] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2"
                      >
                        <WhatsAppBrandIcon className="w-4 h-4" />
                        <span>Send via WhatsApp</span>
                      </a>
                    )}
                    {config.emailEnabled && (
                      <a
                        href={emailLink}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#9A6B13] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Send via Email</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setInquirySubmitted(false)}
                      className="px-4 py-2.5 rounded-xl bg-[#FAF6EE] border border-[#E6D5B8] text-[#4A3A28] text-xs font-bold cursor-pointer"
                    >
                      Edit Message
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[#4A3A28] block mb-2">
                      Select Inquiry Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {SUPPORT_CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold text-left border cursor-pointer truncate ${
                            selectedCategory === cat
                              ? 'bg-[#FDF4E1] text-[#6B480A] border-[#C99A2E]'
                              : 'bg-[#FAF6EE] text-[#5C4A38] border-[#E6D5B8] hover:bg-[#F5EBD6]'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#4A3A28] block mb-2">
                      Message / Issue Description
                    </label>
                    <textarea
                      rows={4}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Please describe the question, payment reference, or feedback in detail..."
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF6EE]/80 border border-[#DFC9A3] text-xs font-semibold text-[#2C2013] placeholder:text-[#96836E] focus:outline-none focus:bg-white focus:border-[#B8860B] resize-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    {config.whatsappEnabled && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-3 rounded-xl bg-[#168045] hover:bg-[#126B39] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-xs"
                      >
                        <WhatsAppBrandIcon className="w-4 h-4" />
                        <span>Chat on WhatsApp</span>
                      </a>
                    )}
                    {config.emailEnabled && (
                      <a
                        href={emailLink}
                        className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#B8860B] via-[#C99722] to-[#A37408] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-xs"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Send Email</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* ================================================================= */}
        {/* WARM IVORY & CHAMPAGNE GOLD MODAL FOOTER                          */}
        {/* ================================================================= */}
        <div className="px-6 sm:px-9 py-4 bg-[#FAF4E8] border-t border-[#E6D4B5] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#6E5A48] font-semibold">
            <span>Verified Support Desk</span>
            <span aria-hidden="true">·</span>
            <span>{config.supportEmail}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#EFE3CE] hover:bg-[#E5D3B5] text-[#2C2013] border border-[#D8C098] text-xs font-extrabold tracking-wider uppercase transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
