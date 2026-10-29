import React, { useState, useEffect } from 'react';
import { AppConfig } from '../types';
import { ArrowLeft, Shield, FileText, Scale, Mail, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { getStoredSupportConfig, SupportConfig, WhatsAppBrandIcon, TelegramBrandIcon } from './SupportCenterModal';

interface LegalViewProps {
  activeApp: AppConfig;
  onBack: () => void;
  type: 'privacy' | 'terms';
}

export default function LegalView({ activeApp, onBack, type }: LegalViewProps) {
  const [supportConfig, setSupportConfig] = useState<SupportConfig>(getStoredSupportConfig);

  useEffect(() => {
    const handleUpdate = () => setSupportConfig(getStoredSupportConfig());
    window.addEventListener('support_config_updated', handleUpdate);
    return () => window.removeEventListener('support_config_updated', handleUpdate);
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const appName = activeApp.name;
  const email = supportConfig.supportEmail || 'Sobhadhanaraju1@gmail.com';
  const cleanCountry = (supportConfig.whatsappCountryCode || '91').replace(/\D/g, '') || '91';
  const cleanPhone = (supportConfig.whatsappPhoneNumber || '9493512768').replace(/\D/g, '');
  const waNumber = `${cleanCountry}${cleanPhone}`;
  const formattedWa = `+${cleanCountry} ${cleanPhone}`;
  const cleanTg = (supportConfig.telegramUsername || 'DHANARAJU0').replace(/^@/, '').trim();

  const renderLuxuryContactSection = () => (
    <div className="bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E4] to-[#F5E9CE] p-6 sm:p-8 rounded-3xl border border-[#E6D4B5] shadow-sm space-y-5">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-[#8A641B]">
          <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
          <span>Official Support & Grievance Desk</span>
        </div>
        <h4 className="text-lg font-black text-[#2C2013] font-serif">
          Have questions about our policies or your account?
        </h4>
        <p className="text-xs text-[#63513D] font-medium">
          Reach out directly to our support team via Email, WhatsApp, or Telegram.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#E6D5B8] flex flex-col justify-between space-y-3 shadow-2xs">
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9A6B13] block">Email Support</span>
            <p className="text-xs font-bold text-[#2C2013] font-mono truncate" title={email}>{email}</p>
          </div>
          <a
            href={`mailto:${email}?subject=${encodeURIComponent(`Policy / Account Inquiry — ${appName}`)}`}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#9A6B13] text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Send Email</span>
          </a>
        </div>

        <div className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#E6D5B8] flex flex-col justify-between space-y-3 shadow-2xs">
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#15803D] block">WhatsApp Support</span>
            <p className="text-xs font-bold text-[#2C2013] font-mono">{formattedWa}</p>
          </div>
          <a
            href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hello Support Team, I have a query regarding ${appName}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#1E8E52] to-[#157A43] text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <WhatsAppBrandIcon className="w-3.5 h-3.5" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        <div className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#E6D5B8] flex flex-col justify-between space-y-3 shadow-2xs">
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0369A1] block">Telegram Support</span>
            <p className="text-xs font-bold text-[#2C2013] font-mono">@{cleanTg}</p>
          </div>
          <a
            href={`https://t.me/${cleanTg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <TelegramBrandIcon className="w-3.5 h-3.5" />
            <span>Open Telegram</span>
          </a>
        </div>
      </div>
    </div>
  );

  const renderPrivacyPolicy = () => (
    <div className="space-y-8 text-slate-700 leading-relaxed">
      <section>
        <h2 className="text-2xl font-black text-slate-900 mb-4">Privacy Policy for {appName}</h2>
        <p className="font-bold text-indigo-600 mb-6">Effective Date: {currentDate}</p>
        <p>
          We (“we”, “us”, or “our”) operate the {appName} mobile application and related services. 
          This Privacy Policy explains how we collect, use, store, and protect your information when you use our app. 
          By using the app, you agree to the terms of this Privacy Policy.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 border-l-4 border-indigo-500 pl-4">1. Information We Collect</h3>
        <p>We may collect the following information:</p>
        <ul className="list-disc pl-6 space-y-2 font-medium">
          <li>Name.</li>
          <li>Email address.</li>
          <li>Mobile number.</li>
          <li>User ID.</li>
          <li>Profile picture.</li>
          <li>Device information.</li>
          <li>App usage data.</li>
          <li>Login history.</li>
          <li>Subscription and payment-related information.</li>
          <li>Content you save in the app, such as bookmarks, notes, or progress.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 border-l-4 border-indigo-500 pl-4">2. How We Use Information</h3>
        <p>We use your information to:</p>
        <ul className="list-disc pl-6 space-y-2 font-medium">
          <li>Create and manage your account.</li>
          <li>Provide app features and learning content.</li>
          <li>Save your progress and preferences.</li>
          <li>Process subscriptions and payments.</li>
          <li>Send notifications and important updates.</li>
          <li>Improve app performance and user experience.</li>
          <li>Prevent misuse, fraud, and unauthorized access.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 border-l-4 border-indigo-500 pl-4">3. Data Sharing</h3>
        <p>
          We do not sell your personal information. We may share limited data only with trusted service providers 
          that help us operate the app, such as payment processors, analytics services, cloud storage providers, 
          and notification services, when needed to deliver our services.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 border-l-4 border-indigo-500 pl-4">4. Data Security</h3>
        <p>
          We use reasonable administrative and technical safeguards to protect your data from unauthorized access, 
          alteration, loss, or misuse. However, no online system is completely secure, and we cannot guarantee 
          absolute security.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 border-l-4 border-indigo-500 pl-4">5. Data Retention and Deletion</h3>
        <p>
          We keep personal data only as long as necessary for account management, legal compliance, security, 
          and service delivery. You may request deletion of your account and associated data by contacting us at the email below.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 border-l-4 border-indigo-500 pl-4">6. Children’s Privacy</h3>
        <p>
          Our app is not intended for children under the age required by applicable law without parental consent. 
          If we learn that we have collected personal data from a child without proper consent, we will take steps to delete it.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 border-l-4 border-indigo-500 pl-4">7. Your Rights</h3>
        <p>Depending on your location, you may have the right to:</p>
        <ul className="list-disc pl-6 space-y-2 font-medium">
          <li>Access your data.</li>
          <li>Correct your data.</li>
          <li>Delete your data.</li>
          <li>Withdraw consent.</li>
          <li>Object to certain processing activities.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 border-l-4 border-[#B8860B] pl-4">8. Contact Us</h3>
        {renderLuxuryContactSection()}
      </section>
    </div>
  );

  const renderTerms = () => (
    <div className="space-y-8 text-slate-700 leading-relaxed">
      <section>
        <h2 className="text-2xl font-black text-slate-900 mb-4">Terms and Conditions for {appName}</h2>
        <p className="font-bold text-indigo-600 mb-6">Effective Date: {currentDate}</p>
        <p>
          These Terms and Conditions govern your use of {appName}. By downloading, installing, or using the app, 
          you agree to follow these Terms. If you do not agree, please do not use the app.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 border-l-4 border-amber-500 pl-4">1. Use of the App</h3>
        <p>
          You agree to use the app only for lawful purposes and in a way that does not harm the app, its users, 
          or our services. You must not misuse the app, attempt unauthorized access, or interfere with its normal operation.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 border-l-4 border-amber-500 pl-4">2. Accounts</h3>
        <p>
          You are responsible for maintaining the confidentiality of your login details and for all activity 
          under your account. You must provide accurate information and keep it updated.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 border-l-4 border-amber-500 pl-4">3. Subscription and Payments</h3>
        <p>
          Some features may require a paid subscription. Prices, billing cycles, renewal rules, and refund terms 
          may change from time to time. Payments are processed through third-party payment providers, and their 
          terms may also apply.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 border-l-4 border-amber-500 pl-4">4. Content and Intellectual Property</h3>
        <p>
          All app content, including questions, explanations, designs, logos, and branding, belongs to us or 
          our licensors unless stated otherwise. You may not copy, reproduce, distribute, or modify our content without permission.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 border-l-4 border-amber-500 pl-4">5. User Conduct</h3>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-2 font-medium">
          <li>Upload harmful or illegal content.</li>
          <li>Abuse, hack, or disrupt the app.</li>
          <li>Share login access with others if your plan is limited to one device.</li>
          <li>Use the app in a way that violates laws or these Terms.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 border-l-4 border-amber-500 pl-4">6. Termination</h3>
        <p>
          We may suspend or terminate your access if we believe you have violated these Terms, misused the app, 
          or created risk for other users or our systems.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 border-l-4 border-[#B8860B] pl-4">7. Contact Information</h3>
        {renderLuxuryContactSection()}
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-2">
            {type === 'privacy' ? (
              <Shield className="h-5 w-5 text-indigo-600" />
            ) : (
              <Scale className="h-5 w-5 text-amber-600" />
            )}
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              {type === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
            </h1>
          </div>
          
          <div className="w-9"></div> {/* Spacer */}
        </div>
      </div>

      {/* Main Content Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto px-6 py-10"
      >
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-200 shadow-xl overflow-hidden relative">
          {/* Subtle watermark or icon background */}
          <div className="absolute top-10 right-10 opacity-[0.03] rotate-12 scale-150 pointer-events-none">
             {type === 'privacy' ? (
              <Shield className="h-64 w-64" />
            ) : (
              <FileText className="h-64 w-64" />
            )}
          </div>

          <div className="relative z-10">
            {type === 'privacy' ? renderPrivacyPolicy() : renderTerms()}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest space-y-2">
          <p>© {new Date().getFullYear()} {appName}. All Rights Reserved.</p>
          <p>Compliance ID: EM-LEGAL-2024-V1</p>
        </div>
      </motion.div>
    </div>
  );
}
