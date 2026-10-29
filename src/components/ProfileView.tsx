import React, { useState, useRef } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Award, 
  BookOpen, 
  CheckCircle, 
  CreditCard, 
  Calendar, 
  Camera, 
  Upload, 
  Check, 
  Phone, 
  Hash, 
  ShieldCheck, 
  Gem,
  LogOut,
  Image as ImageIcon,
  History,
  ArrowUpCircle,
  ArrowDownCircle,
  XCircle,
  RefreshCw,
  ChevronRight,
  Receipt,
  FileText,
  HelpCircle,
  Sparkles,
  Copy
} from 'lucide-react';
import { AppConfig, SubscriptionPackage, SubscriptionHistoryItem, PaymentHistoryItem } from '../types';
import { getStoredSupportConfig, SupportConfig, WhatsAppBrandIcon, TelegramBrandIcon } from './SupportCenterModal';

interface ProfileViewProps {
  activeApp: AppConfig;
  subscriptions: SubscriptionPackage[];
  subscriptionHistory: SubscriptionHistoryItem[];
  paymentHistory: PaymentHistoryItem[];
  onOpenCheckout?: (pack: SubscriptionPackage) => void;
  onLogout?: () => void;
  onOpenLegal?: (type: 'privacy' | 'terms') => void;
  onOpenSettings?: () => void;
  onOpenSupport?: () => void;
}

export default function ProfileView({ 
  activeApp, 
  subscriptions, 
  subscriptionHistory,
  paymentHistory,
  onOpenCheckout, 
  onLogout,
  onOpenLegal,
  onOpenSettings,
  onOpenSupport
}: ProfileViewProps) {
  // Derive active subscription status from subscriptionHistory, paymentHistory, and localStorage
  const storedActiveSub = (() => {
    try {
      const raw = localStorage.getItem('aspirant_active_subscription');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const latestActiveSubItem = (subscriptionHistory || []).find((item) => item.status === 'active');
  const isPremium = Boolean(latestActiveSubItem || (storedActiveSub && storedActiveSub.status === 'active') || (paymentHistory && paymentHistory.some(p => p.status === 'success')));
  const currentPlan = latestActiveSubItem?.planName || storedActiveSub?.planName || 'Standard Plan';
  const activeExpiryLabel = latestActiveSubItem?.expiryDate || storedActiveSub?.expiryDate || (isPremium ? 'Active' : 'No active subscription');

  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string>('https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=1200&q=80');
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'payments' | 'support'>('details');
  const [supportConfig, setSupportConfig] = useState<SupportConfig>(getStoredSupportConfig);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handleUpdate = () => setSupportConfig(getStoredSupportConfig());
    window.addEventListener('support_config_updated', handleUpdate);
    return () => window.removeEventListener('support_config_updated', handleUpdate);
  }, []);

  const cleanCountry = (supportConfig.whatsappCountryCode || '91').replace(/\D/g, '') || '91';
  const cleanPhone = (supportConfig.whatsappPhoneNumber || '9493512768').replace(/\D/g, '');
  const waFull = `${cleanCountry}${cleanPhone}`;
  const formattedWa = `+${cleanCountry} ${cleanPhone}`;
  const cleanTg = (supportConfig.telegramUsername || 'DHANARAJU0').replace(/^@/, '').trim();
  const supportEmail = supportConfig.supportEmail || 'Sobhadhanaraju1@gmail.com';

  const handleCopyContact = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Real Logged-in User Data from Storage or Session
  const authUser = (() => {
    try {
      const raw = localStorage.getItem('aspirant_auth_user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  })();

  const userData = {
    fullName: authUser?.displayName || authUser?.name || 'Registered Aspirant',
    username: authUser?.email ? `@${authUser.email.split('@')[0]}` : '@aspirant',
    mobile: authUser?.phoneNumber || authUser?.mobile || '',
    email: authUser?.email || '',
    dateJoined: authUser?.createdAt || 'Active Aspirant',
    userId: authUser?.uid ? `ASP-${String(authUser.uid).slice(0, 8).toUpperCase()}` : 'ASP-MEMBER',
    membershipExpiry: activeExpiryLabel,
    isVerified: !!authUser
  };

  const displaySubHistory = subscriptionHistory || [];
  const displayPayHistory = paymentHistory || [];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'profile') setProfilePic(reader.result as string);
        else setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const maskMobile = (mobile: string) => {
    return mobile.substring(0, 2) + "******" + mobile.substring(mobile.length - 2);
  };

  const getHistoryIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'upgrade': return <ArrowUpCircle className="h-4 w-4 text-indigo-500" />;
      case 'downgrade': return <ArrowDownCircle className="h-4 w-4 text-amber-500" />;
      case 'renewal': return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'cancellation': return <XCircle className="h-4 w-4 text-rose-500" />;
      default: return <History className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="w-full max-w-6xl xl:max-w-7xl mx-auto space-y-6 pb-20 font-sans">
      
      {/* 1. Profile Banner & Avatar Section */}
      <div className="relative bg-white rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-xl">
        {/* Cover Banner */}
        <div className="h-48 sm:h-64 w-full relative bg-slate-900 group">
          <img 
            src={coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
          <button 
            onClick={() => coverInputRef.current?.click()}
            className="absolute top-4 right-4 p-2.5 bg-white/10 backdrop-blur-md rounded-xl text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
          <input type="file" ref={coverInputRef} onChange={(e) => handleImageUpload(e, 'cover')} accept="image/*" className="hidden" />
        </div>

        {/* Profile Content Overlap */}
        <div className="px-6 sm:px-10 pb-10 -mt-16 sm:-mt-20 relative z-10 flex flex-col sm:flex-row items-end sm:items-center gap-6">
          <div className="relative group mx-auto sm:mx-0">
            <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-[2.5rem] bg-gradient-to-tr from-orange-500 to-amber-400 text-white text-4xl font-black flex items-center justify-center shadow-2xl overflow-hidden border-4 border-white rotate-3 group-hover:rotate-0 transition-transform duration-500">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <span>SR</span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 p-2 bg-indigo-600 rounded-xl text-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input type="file" ref={fileInputRef} onChange={(e) => handleImageUpload(e, 'profile')} accept="image/*" className="hidden" />
          </div>

          <div className="flex-1 text-center sm:text-left pt-4">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
                {userData.fullName}
                {userData.isVerified && (
                  <ShieldCheck className="h-6 w-6 text-indigo-600 fill-indigo-100" />
                )}
              </h2>
              {isPremium ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                  <Gem className="h-3 w-3" /> Elite Premium
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
                  Standard Member
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-slate-500 tracking-wide">{userData.username}</p>
            <p className="text-xs font-black text-indigo-600 mt-1 uppercase tracking-widest bg-indigo-50 inline-block px-3 py-1 rounded-lg">
              Goal: {activeApp.name}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onLogout}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 transition-all shadow-sm cursor-pointer"
              title="Logout Session"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Navigation Tabs */}
      <div className="flex items-center p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm w-full sm:w-fit overflow-x-auto no-scrollbar flex-nowrap sm:flex-wrap gap-1">
        {[
          { id: 'details', label: 'Overview', icon: User },
          { id: 'history', label: 'Subscription History', icon: History },
          { id: 'payments', label: 'Payment History', icon: Receipt },
          { id: 'support', label: 'Help & Support', icon: HelpCircle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === tab.id 
                ? 'bg-[#2C2013] text-[#FFFDF9] shadow-md' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'details' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* 2. Detailed Profile Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact & Identity Information */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <User className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Account Details</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Mobile Number (Verified)</p>
                      <p className="text-sm font-bold text-slate-800">{maskMobile(userData.mobile) || 'Not Linked'}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-black text-[10px] border border-emerald-200">Secure</span>
                </div>

                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Email Address (Verified)</p>
                      <p className="text-sm font-bold text-slate-800">{userData.email || 'Not Linked'}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-black text-[10px] border border-emerald-200">Secure</span>
                </div>

                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <Hash className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">User Identification ID</p>
                      <p className="text-sm font-bold text-slate-800">{userData.userId}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Membership & Journey Information */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <Award className="h-4 w-4 text-orange-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Subscription Status</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-orange-600 transition-colors">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Date Joined Portal</p>
                      <p className="text-sm font-bold text-slate-800">{userData.dateJoined}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Membership Status</p>
                      <p className="text-sm font-black text-orange-700">{isPremium ? 'Active (Premium Elite)' : 'Inactive'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-orange-600 transition-colors">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Membership Expiry</p>
                      <p className="text-sm font-bold text-slate-800">{isPremium ? userData.membershipExpiry : 'N/A'}</p>
                    </div>
                  </div>
                  {isPremium && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg uppercase">Valid</span>}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Luxurious Ivory & Champagne Gold Customer Support & Help Center Card */}
          <div className="bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E4] to-[#F3E5CA] rounded-[2rem] p-6 sm:p-8 border border-[#E6D4B5] shadow-[0_14px_40px_-12px_rgba(166,124,46,0.16)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6D4B5] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-[#8A641B]">
                  <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
                  <span>Concierge Help & Customer Support</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#2C2013] font-serif">
                  Need Assistance with Your Account or Subscription?
                </h3>
                <p className="text-xs text-[#63513D] font-medium">
                  Connect directly with our official support desk via Email, WhatsApp, or Telegram.
                </p>
              </div>
              {onOpenSupport && (
                <button
                  type="button"
                  onClick={onOpenSupport}
                  className="px-5 py-2.5 rounded-xl bg-[#FFFDF9] hover:bg-[#F5E9D3] text-[#2C2013] border border-[#D8C098] text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
                >
                  Open Full Help Center
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Email Card */}
              <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E6D5B8] hover:border-[#C59B27] shadow-2xs flex flex-col justify-between space-y-4 transition-all">
                <div className="space-y-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#FDF6E7] border border-[#E5CA8F] text-[#9A6B13] flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#2C2013]">Email Support</h4>
                    <p className="text-[11px] text-[#6E5A48] font-medium">Official account & billing desk</p>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF6EE] border border-[#E6D5B8] text-xs font-bold text-[#2C2013] font-mono">
                    <span className="truncate" title={supportEmail}>{supportEmail}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyContact(supportEmail, 'email')}
                      className="text-[#8C6D32] hover:text-[#9A6B13] cursor-pointer ml-1 shrink-0"
                    >
                      {copiedKey === 'email' ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <a
                  href={`mailto:${supportEmail}?subject=${encodeURIComponent(`Account Support — ${activeApp.name}`)}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#B8860B] via-[#C99722] to-[#A37408] text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Email</span>
                </a>
              </div>

              {/* WhatsApp Card */}
              <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E6D5B8] hover:border-[#C59B27] shadow-2xs flex flex-col justify-between space-y-4 transition-all">
                <div className="space-y-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#F3FAF6] border border-[#C6E7D4] text-[#15803D] flex items-center justify-center">
                    <WhatsAppBrandIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#2C2013]">WhatsApp Support</h4>
                    <p className="text-[11px] text-[#6E5A48] font-medium">Fast direct chat assistance</p>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF6EE] border border-[#E6D5B8] text-xs font-bold text-[#2C2013] font-mono">
                    <span className="truncate">{formattedWa}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyContact(formattedWa, 'wa')}
                      className="text-[#8C6D32] hover:text-[#15803D] cursor-pointer ml-1 shrink-0"
                    >
                      {copiedKey === 'wa' ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${waFull}?text=${encodeURIComponent(`Hello Support Team, I need help with my ${activeApp.name} account (${userData.userId}).`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#1E8E52] to-[#157A43] text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xs"
                >
                  <WhatsAppBrandIcon className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>

              {/* Telegram Card */}
              <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E6D5B8] hover:border-[#C59B27] shadow-2xs flex flex-col justify-between space-y-4 transition-all">
                <div className="space-y-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#F2F8FD] border border-[#C5E0F5] text-[#0369A1] flex items-center justify-center">
                    <TelegramBrandIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#2C2013]">Telegram Support</h4>
                    <p className="text-[11px] text-[#6E5A48] font-medium">Direct messenger support</p>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF6EE] border border-[#E6D5B8] text-xs font-bold text-[#2C2013] font-mono">
                    <span className="truncate">@{cleanTg}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyContact(`@${cleanTg}`, 'tg')}
                      className="text-[#8C6D32] hover:text-[#0369A1] cursor-pointer ml-1 shrink-0"
                    >
                      {copiedKey === 'tg' ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <a
                  href={`https://t.me/${cleanTg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xs"
                >
                  <TelegramBrandIcon className="w-3.5 h-3.5" />
                  <span>Open Telegram</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'support' && (
        <div className="bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E4] to-[#F3E5CA] rounded-[2.5rem] p-6 sm:p-10 border border-[#E6D4B5] shadow-xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6D4B5] pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-[#8A641B]">
                <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
                <span>Official Aspirant Concierge</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#2C2013] font-serif">
                Customer Support & Help Center
              </h3>
              <p className="text-xs sm:text-sm text-[#63513D] font-medium">
                {supportConfig.supportDescription}
              </p>
            </div>
            {onOpenSupport && (
              <button
                type="button"
                onClick={onOpenSupport}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#9A6B13] text-white text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-xs shrink-0"
              >
                Open Interactive Help Center
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E6D5B8] shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FDF6E7] border border-[#E5CA8F] text-[#9A6B13] flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#2C2013]">Email Support</h4>
                  <p className="text-xs text-[#6E5A48] font-medium mt-0.5">Send detailed account or billing queries</p>
                </div>
                <p className="px-3.5 py-2.5 rounded-xl bg-[#FAF6EE] border border-[#E6D5B8] text-xs font-bold text-[#2C2013] font-mono truncate">
                  {supportEmail}
                </p>
              </div>
              <a
                href={`mailto:${supportEmail}?subject=${encodeURIComponent(`Support Request — ${activeApp.name}`)}`}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#B8860B] via-[#C99722] to-[#A37408] text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Send Email</span>
              </a>
            </div>

            <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E6D5B8] shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F3FAF6] border border-[#C6E7D4] text-[#15803D] flex items-center justify-center">
                  <WhatsAppBrandIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#2C2013]">WhatsApp Support</h4>
                  <p className="text-xs text-[#6E5A48] font-medium mt-0.5">Instant chat for OTP, login & payment help</p>
                </div>
                <p className="px-3.5 py-2.5 rounded-xl bg-[#FAF6EE] border border-[#E6D5B8] text-xs font-bold text-[#2C2013] font-mono">
                  {formattedWa}
                </p>
              </div>
              <a
                href={`https://wa.me/${waFull}?text=${encodeURIComponent(`Hello Support Team, I need assistance with ${activeApp.name}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#1E8E52] to-[#157A43] text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <WhatsAppBrandIcon className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E6D5B8] shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F2F8FD] border border-[#C5E0F5] text-[#0369A1] flex items-center justify-center">
                  <TelegramBrandIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[#2C2013]">Telegram Support</h4>
                  <p className="text-xs text-[#6E5A48] font-medium mt-0.5">Connect on Telegram for direct assistance</p>
                </div>
                <p className="px-3.5 py-2.5 rounded-xl bg-[#FAF6EE] border border-[#E6D5B8] text-xs font-bold text-[#2C2013] font-mono">
                  @{cleanTg}
                </p>
              </div>
              <a
                href={`https://t.me/${cleanTg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <TelegramBrandIcon className="w-4 h-4" />
                <span>Open Telegram</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                <History className="h-5 w-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Subscription Journey History</h3>
            </div>
          </div>

          <div className="space-y-4">
            {displaySubHistory.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-3xl border border-slate-100 group hover:border-indigo-100 transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                    {getHistoryIcon(item.type)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{item.planName}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      {item.type} • {item.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    item.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {item.status}
                  </span>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">Expires: {item.expiryDate}</p>
                </div>
              </div>
            ))}
            {displaySubHistory.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No subscription history available.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                <Receipt className="h-5 w-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Payment & Billing Records</h3>
            </div>
          </div>

          <div className="space-y-3">
            {displayPayHistory.map((pay) => (
              <div key={pay.id} className="flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-200 hover:border-emerald-200 hover:shadow-lg transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{pay.method}</p>
                    <h4 className="text-sm font-black text-slate-900">{pay.date}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">{pay.currencySymbol}{pay.amount}</p>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      pay.status === 'success' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {pay.status}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
            {displayPayHistory.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No payment records available.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

