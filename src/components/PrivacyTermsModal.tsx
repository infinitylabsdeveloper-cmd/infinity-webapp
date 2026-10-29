import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, FileText, CheckCircle2, Mail } from 'lucide-react';
import { getStoredSupportConfig, SupportConfig, WhatsAppBrandIcon, TelegramBrandIcon } from './SupportCenterModal';

interface PrivacyTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyTermsModal: React.FC<PrivacyTermsModalProps> = ({ isOpen, onClose }) => {
  const [supportConfig, setSupportConfig] = useState<SupportConfig>(getStoredSupportConfig);

  useEffect(() => {
    const handleUpdate = () => setSupportConfig(getStoredSupportConfig());
    window.addEventListener('support_config_updated', handleUpdate);
    return () => window.removeEventListener('support_config_updated', handleUpdate);
  }, []);

  if (!isOpen) return null;

  const cleanCountry = (supportConfig.whatsappCountryCode || '91').replace(/\D/g, '') || '91';
  const cleanPhone = (supportConfig.whatsappPhoneNumber || '9493512768').replace(/\D/g, '');
  const waFull = `${cleanCountry}${cleanPhone}`;
  const formattedWa = `+${cleanCountry} ${cleanPhone}`;
  const cleanTg = (supportConfig.telegramUsername || 'DHANARAJU0').replace(/^@/, '').trim();
  const supportEmail = supportConfig.supportEmail || 'Sobhadhanaraju1@gmail.com';

  return (
    <div className="fixed inset-0 z-50 bg-[#2A2118]/35 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#FFFDF9] rounded-3xl max-w-2xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-[#E6D4B5] overflow-hidden overscroll-contain animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E6D4B5] flex items-center justify-between bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E4] to-[#F3E5CA]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#B8860B] to-[#9A6B13] text-white flex items-center justify-center font-bold shadow-2xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#2C2013] font-serif">Privacy Policy & Terms of Service</h2>
              <p className="text-xs text-[#6E5A48] font-medium">Google Play Store & Apple App Store Compliant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-[#FFFDF9] hover:bg-[#F5E9D3] border border-[#DFC9A3] flex items-center justify-center text-[#63513D] cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#4A3A28] leading-relaxed bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F7F0E4]">
          <section className="bg-[#FDF8EC] p-4 rounded-2xl border border-[#E5CE9C] flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#B8860B] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-[#2C2013] text-sm">Play Store & Gateway Verified Policy</h3>
              <p className="text-xs text-[#594324] mt-0.5">
                This document meets all requirements specified by Google Play Console, Apple App Store, and Razorpay compliance guidelines for educational and testing apps.
              </p>
            </div>
          </section>

          <div>
            <h3 className="font-bold text-[#2C2013] text-base mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#B8860B]" /> 1. Information Collection and Use
            </h3>
            <p>
              Our examination preparation platform collects minimal user data necessary for personalized exam practice, test history tracking, and bookmark synchronization.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-[#5C4A38]">
              <li>Local Device Storage: Practice test scores, bookmarks, and UI preferences are stored securely on your device.</li>
              <li>Cloud Firestore Database: Synced study progress and current affairs updates are safely stored in Firebase Firestore.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-[#2C2013] text-base mb-2">2. Data Security & Storage</h3>
            <p>
              We implement industry-standard encryption protocols via Google Cloud, Firebase, and Razorpay PCI-DSS Level 1 gateways. No personal financial credentials or passwords are ever exposed or transferred to external third parties.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-[#2C2013] text-base mb-2">3. User Data Rights & Account Deletion</h3>
            <p>
              Users retain full control over their study data. You may reset your test history or clear local device caches at any time within the application settings, or request account deletion via our support channels below.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-[#2C2013] text-base mb-2">4. Official Contact & Customer Support</h3>
            <div className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#E6D5B8] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <a
                href={`mailto:${supportEmail}`}
                className="p-3 rounded-xl bg-[#FAF6EE] hover:bg-[#FDF6E7] border border-[#E6D5B8] flex items-center gap-2 font-bold text-[#2C2013]"
              >
                <Mail className="w-4 h-4 text-[#B8860B] shrink-0" />
                <span className="truncate">{supportEmail}</span>
              </a>
              <a
                href={`https://wa.me/${waFull}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-[#FAF6EE] hover:bg-[#F3FAF6] border border-[#E6D5B8] flex items-center gap-2 font-bold text-[#2C2013]"
              >
                <WhatsAppBrandIcon className="w-4 h-4 text-[#15803D] shrink-0" />
                <span className="truncate">{formattedWa}</span>
              </a>
              <a
                href={`https://t.me/${cleanTg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-[#FAF6EE] hover:bg-[#F2F8FD] border border-[#E6D5B8] flex items-center gap-2 font-bold text-[#2C2013]"
              >
                <TelegramBrandIcon className="w-4 h-4 text-[#0369A1] shrink-0" />
                <span className="truncate">@{cleanTg}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E6D4B5] bg-[#FAF4E8] flex items-center justify-between">
          <span className="text-xs text-[#6E5A48] font-medium">Effective Date: September 2026</span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-[#B8860B] to-[#9A6B13] hover:opacity-95 active:scale-95 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
          >
            I Accept & Close
          </button>
        </div>

      </div>
    </div>
  );
};

