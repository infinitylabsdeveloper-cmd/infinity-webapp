import React from 'react';
import ApEmblem from './ApEmblem';

interface LoginHeaderVisualProps {
  language: 'en' | 'te';
  onToggleLanguage: () => void;
}

export default function LoginHeaderVisual({ language, onToggleLanguage }: LoginHeaderVisualProps) {
  return (
    <div className="relative w-full overflow-hidden select-none">
      {/* Background Scenic Landscape SVG (Dhyana Buddha, Temple, Krishna River & Sky) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <svg
          viewBox="0 0 420 320"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
        >
          <defs>
            {/* Morning Sky Gradient */}
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.8" />
              <stop offset="35%" stopColor="#BAE6FD" stopOpacity="0.6" />
              <stop offset="70%" stopColor="#E0F2FE" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0.5" />
            </linearGradient>

            {/* Krishna River Blue-Cyan Gradient */}
            <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#0369A1" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0F766E" stopOpacity="0.9" />
            </linearGradient>

            {/* Distant Hills Gradient */}
            <linearGradient id="hillsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.9" />
            </linearGradient>

            {/* Temple Stone Gradient */}
            <linearGradient id="templeStoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#D97706" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#92400E" stopOpacity="1" />
            </linearGradient>

            {/* Buddha Statue Bronze/Stone Gradient */}
            <linearGradient id="buddhaStone" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>

          {/* Sky background */}
          <rect width="420" height="320" fill="url(#skyGrad)" />

          {/* Soft Fluffy Clouds */}
          <ellipse cx="60" cy="50" rx="70" ry="22" fill="#FFFFFF" fillOpacity="0.4" />
          <ellipse cx="360" cy="65" rx="80" ry="25" fill="#FFFFFF" fillOpacity="0.4" />
          <ellipse cx="200" cy="40" rx="90" ry="20" fill="#FFFFFF" fillOpacity="0.3" />

          {/* Distant Hills of Andhra Pradesh */}
          <path
            d="M -20,180 Q 80,120 180,170 T 360,140 Q 400,150 440,180 L 440,240 L -20,240 Z"
            fill="url(#hillsGrad)"
            fillOpacity="0.45"
          />

          {/* Krishna River Waters */}
          <rect x="0" y="190" width="420" height="130" fill="url(#waterGrad)" />
          {/* Gentle water ripples */}
          <path d="M 0,205 Q 100,200 200,205 T 420,205" stroke="#BAE6FD" strokeWidth="1" strokeOpacity="0.5" fill="none" />
          <path d="M 0,225 Q 120,220 240,225 T 420,225" stroke="#BAE6FD" strokeWidth="1.2" strokeOpacity="0.4" fill="none" />
          <path d="M 0,250 Q 80,245 180,250 T 420,250" stroke="#7DD3FC" strokeWidth="1" strokeOpacity="0.3" fill="none" />

          {/* LEFT: Dravidian Stone Temple Gopuram (Lepakshi / Amaravati Heritage) */}
          <g transform="translate(10, 100) scale(0.65)">
            {/* Temple Tiered Pyramid Base */}
            <path d="M 20,150 L 100,150 L 90,110 L 30,110 Z" fill="url(#templeStoneGrad)" />
            <path d="M 28,110 L 92,110 L 85,80 L 35,80 Z" fill="url(#templeStoneGrad)" />
            <path d="M 34,80 L 86,80 L 80,55 L 40,55 Z" fill="url(#templeStoneGrad)" />
            <path d="M 38,55 L 82,55 L 75,35 L 45,35 Z" fill="url(#templeStoneGrad)" />
            <path d="M 43,35 L 77,35 L 68,20 L 52,20 Z" fill="url(#templeStoneGrad)" />
            {/* Kalasam finial at gopuram top */}
            <path d="M 58,20 L 60,6 L 62,20 Z" fill="#FDE047" stroke="#B45309" strokeWidth="1" />
            <circle cx="60" cy="5" r="3" fill="#F59E0B" />

            {/* Architectural details / niches */}
            <rect x="52" y="120" width="16" height="30" rx="8" fill="#78350F" />
            <rect x="54" y="90" width="12" height="15" rx="4" fill="#78350F" />
            <rect x="56" y="65" width="8" height="10" rx="3" fill="#78350F" />

            {/* Temple pillars and stone carvings shadow */}
            <line x1="32" y1="110" x2="32" y2="150" stroke="#78350F" strokeWidth="1.5" />
            <line x1="88" y1="110" x2="88" y2="150" stroke="#78350F" strokeWidth="1.5" />
            <line x1="42" y1="110" x2="42" y2="150" stroke="#B45309" strokeWidth="1" />
            <line x1="78" y1="110" x2="78" y2="150" stroke="#B45309" strokeWidth="1" />
          </g>

          {/* RIGHT: Dhyana Buddha of Amaravati Seated on Lotus Pedestal */}
          <g transform="translate(325, 105) scale(0.68)">
            {/* Lotus Pedestal Base */}
            <path
              d="M 10,135 C 25,120 40,120 55,135 C 70,120 85,120 100,135 L 95,145 L 15,145 Z"
              fill="#E2E8F0"
              stroke="#94A3B8"
              strokeWidth="1.5"
            />
            {/* Seated Folded Robe Legs (Padmasana) */}
            <path
              d="M 12,125 C 20,105 40,108 55,108 C 70,108 90,105 98,125 C 95,135 15,135 12,125 Z"
              fill="url(#buddhaStone)"
            />
            {/* Torso & Robe (Sanghati) */}
            <path
              d="M 32,58 C 26,72 25,100 25,115 L 85,115 C 85,100 84,72 78,58 Z"
              fill="url(#buddhaStone)"
            />
            {/* Meditating Hands in Lap (Dhyana Mudra) */}
            <ellipse cx="55" cy="112" rx="14" ry="7" fill="#64748B" />

            {/* Shoulders & Head */}
            <ellipse cx="55" cy="42" rx="13" ry="16" fill="url(#buddhaStone)" />
            {/* Ushnisha (Wisdom bump atop head) */}
            <circle cx="55" cy="24" r="5.5" fill="#334155" />
            {/* Elongated serene ears */}
            <path d="M 40,40 Q 38,47 40,54" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 70,40 Q 72,47 70,54" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Halo behind Buddha head */}
            <circle cx="55" cy="40" r="22" stroke="#FEF08A" strokeWidth="2.5" strokeOpacity="0.6" fill="none" />
          </g>
        </svg>
      </div>

      {/* Top Status & Language Bar */}
      <div className="relative z-10 px-4 pt-3 flex items-start justify-between">
        {/* Top Left Slogan with Tricolor Ribbon */}
        <div className="space-y-0 text-left">
          <p className="font-serif italic text-slate-800 text-xs sm:text-[13px] font-bold leading-tight drop-shadow-xs">
            Dream
          </p>
          <p className="font-serif italic text-slate-800 text-xs sm:text-[13px] font-bold leading-tight drop-shadow-xs">
            Prepare
          </p>
          <p className="font-serif italic text-slate-800 text-xs sm:text-[13px] font-bold leading-tight drop-shadow-xs">
            Achieve
          </p>
          <p className="font-serif italic text-slate-800 text-xs sm:text-[13px] font-bold leading-tight drop-shadow-xs">
            Serve
          </p>
          <p className="font-serif italic text-slate-900 text-xs sm:text-[13px] font-black leading-tight drop-shadow-xs">
            Andhra Pradesh
          </p>

          {/* Indian Tricolor Swoop / Ribbon */}
          <div className="pt-1 flex items-center">
            <svg width="68" height="9" viewBox="0 0 68 9" fill="none" className="drop-shadow-xs">
              <path d="M 0,2 Q 34,7 68,1" stroke="#FF9933" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 0,4.5 Q 34,9.5 68,3.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 0,7 Q 34,12 68,6" stroke="#138808" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Top Right: Language Switcher Pill [ A బ English ▾ ] */}
        <button
          type="button"
          onClick={onToggleLanguage}
          className="bg-white/85 hover:bg-white backdrop-blur-md border border-slate-200/90 rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-bold text-slate-800 shadow-xs cursor-pointer transition-all active:scale-95"
          title="Switch Language"
        >
          <span className="px-1 py-0.2 rounded bg-indigo-50 text-indigo-900 text-[11px] font-black">A</span>
          <span className="px-1 py-0.2 rounded bg-emerald-50 text-emerald-900 text-[11px] font-black">బ</span>
          <span className="text-xs font-bold text-slate-800 ml-0.5">
            {language === 'te' ? 'తెలుగు' : 'English'}
          </span>
          <svg className="w-3.5 h-3.5 text-slate-500 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Center AP Emblem & APPSC GROUP-2 Branding */}
      <div className="relative z-10 flex flex-col items-center text-center mt-1 pb-4 px-4">
        {/* AP Official Emblem */}
        <div className="transform hover:scale-105 transition-transform duration-300 drop-shadow-lg">
          <ApEmblem size={86} />
        </div>

        {/* Big Bold Title: APPSC in Navy, GROUP-2 in Emerald Green */}
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#0f294a] drop-shadow-xs">
            APPSC
          </span>
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#047857] drop-shadow-xs">
            GROUP-2
          </span>
        </div>

        {/* Subtitle Slogan */}
        <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5 tracking-wide">
          {language === 'te' 
            ? 'ఉజ్వల భవిష్యత్తుకు మీ మార్గదర్శి'
            : 'Your Gateway to a Better Tomorrow'}
        </p>
      </div>
    </div>
  );
}
