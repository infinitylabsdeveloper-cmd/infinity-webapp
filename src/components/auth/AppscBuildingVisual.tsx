import React from 'react';

interface AppscBuildingVisualProps {
  language: 'en' | 'te';
  onBack: () => void;
  onToggleLanguage: () => void;
}

export default function AppscBuildingVisual({
  language,
  onBack,
  onToggleLanguage,
}: AppscBuildingVisualProps) {
  return (
    <div className="relative w-full overflow-hidden select-none bg-gradient-to-b from-sky-100 via-sky-50 to-white">
      {/* Top Action Bar: Back Arrow & Language Pill */}
      <div className="px-4 pt-3 flex items-center justify-between relative z-20">
        <button
          type="button"
          onClick={onBack}
          className="p-2 -ml-1 text-slate-800 hover:text-slate-950 hover:bg-white/60 rounded-full transition-all cursor-pointer"
          title="Back to login"
        >
          <svg className="w-6 h-6 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onToggleLanguage}
          className="bg-white/90 hover:bg-white border border-slate-200/90 rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-bold text-slate-800 shadow-xs cursor-pointer transition-all active:scale-95"
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

      {/* Main Title & Slogan */}
      <div className="text-center px-4 pt-1 pb-2 relative z-10">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#0f294a]">
            APPSC
          </span>
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#047857]">
            GROUP-2
          </span>
        </div>
        <p className="text-xs font-medium text-slate-600 tracking-wider mt-0.5">
          {language === 'te'
            ? 'సన్నద్ధం | సాధన | పురోగతి | విజయం'
            : 'Prepare | Practice | Progress | Succeed'}
        </p>
      </div>

      {/* APPSC Commission Head Office Building Graphic */}
      <div className="relative w-full h-44 sm:h-48 mt-1 overflow-hidden">
        <svg
          viewBox="0 0 440 220"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="bldgSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>

            <linearGradient id="facadeWall" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="50%" stopColor="#EDE9FE" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#F1F5F9" />
            </linearGradient>

            <linearGradient id="sandstone" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FEF3C7" />
              <stop offset="100%" stopColor="#FDE68A" />
            </linearGradient>

            <linearGradient id="lionGold" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="50%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
          </defs>

          {/* Sky background */}
          <rect width="440" height="220" fill="url(#bldgSky)" />

          {/* Background Trees on sides */}
          <g fill="#15803D" opacity="0.85">
            <ellipse cx="25" cy="145" rx="35" ry="50" />
            <ellipse cx="60" cy="155" rx="30" ry="40" />
            <ellipse cx="380" cy="155" rx="30" ry="40" />
            <ellipse cx="415" cy="145" rx="35" ry="50" />
          </g>

          {/* Foreground Lush Trees */}
          <g fill="#16A34A">
            <circle cx="15" cy="165" r="25" />
            <circle cx="45" cy="170" r="22" />
            <circle cx="395" cy="170" r="22" />
            <circle cx="425" cy="165" r="25" />
          </g>

          {/* Main Neoclassical Building Structure */}
          {/* Wings */}
          <rect x="50" y="80" width="130" height="110" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" />
          <rect x="260" y="80" width="130" height="110" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" />

          {/* Windows on left wing */}
          {Array.from({ length: 4 }).map((_, r) =>
            Array.from({ length: 3 }).map((_, c) => (
              <rect
                key={`lw-${r}-${c}`}
                x={65 + c * 38}
                y={95 + r * 22}
                width="24"
                height="15"
                rx="2"
                fill="#3B82F6"
                fillOpacity="0.4"
                stroke="#64748B"
                strokeWidth="1"
              />
            ))
          )}

          {/* Windows on right wing */}
          {Array.from({ length: 4 }).map((_, r) =>
            Array.from({ length: 3 }).map((_, c) => (
              <rect
                key={`rw-${r}-${c}`}
                x={275 + c * 38}
                y={95 + r * 22}
                width="24"
                height="15"
                rx="2"
                fill="#3B82F6"
                fillOpacity="0.4"
                stroke="#64748B"
                strokeWidth="1"
              />
            ))
          )}

          {/* Central Grand Portico / Entrance */}
          <rect x="155" y="60" width="130" height="130" fill="url(#sandstone)" stroke="#CBD5E1" strokeWidth="2" />

          {/* Classical Pillars */}
          <line x1="172" y1="110" x2="172" y2="190" stroke="#78350F" strokeWidth="6" strokeLinecap="square" />
          <line x1="202" y1="110" x2="202" y2="190" stroke="#78350F" strokeWidth="6" strokeLinecap="square" />
          <line x1="238" y1="110" x2="238" y2="190" stroke="#78350F" strokeWidth="6" strokeLinecap="square" />
          <line x1="268" y1="110" x2="268" y2="190" stroke="#78350F" strokeWidth="6" strokeLinecap="square" />

          {/* Pillar Pedestals and Caps */}
          <rect x="165" y="105" width="14" height="6" fill="#B45309" />
          <rect x="195" y="105" width="14" height="6" fill="#B45309" />
          <rect x="231" y="105" width="14" height="6" fill="#B45309" />
          <rect x="261" y="105" width="14" height="6" fill="#B45309" />

          {/* Entrance Doorway Arch */}
          <path d="M 205,190 L 205,145 Q 220,135 235,145 L 235,190 Z" fill="#1E293B" />
          <circle cx="220" cy="142" r="3" fill="#FDE047" />

          {/* OFFICIAL COMMISSION SIGNBOARD */}
          <g transform="translate(162, 112)">
            <rect x="0" y="0" width="116" height="34" rx="4" fill="#0F172A" stroke="#E2E8F0" strokeWidth="1" />
            <text x="58" y="10" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontWeight="900" letterSpacing="0.05em">
              ANDHRA PRADESH
            </text>
            <text x="58" y="19" textAnchor="middle" fill="#FFFFFF" fontSize="5.5" fontWeight="800" letterSpacing="0.08em">
              PUBLIC SERVICE COMMISSION
            </text>
            <text x="58" y="28" textAnchor="middle" fill="#FDE047" fontSize="5" fontWeight="700">
              ఆంధ్రప్రదేశ్ పబ్లిక్ సర్వీస్ కమిషన్
            </text>
          </g>

          {/* Upper Entablature & Pediment */}
          <rect x="150" y="52" width="140" height="12" rx="2" fill="#D97706" />

          {/* ASHOKA LION CAPITAL (National Emblem of India) atop the building */}
          <g transform="translate(220, 32) scale(0.65)">
            {/* Circular Abacus Base */}
            <rect x="-24" y="18" width="48" height="6" rx="2" fill="url(#lionGold)" />
            {/* Ashoka Chakra on Abacus */}
            <circle cx="0" cy="21" r="3.5" fill="#1E3A8A" />
            <circle cx="0" cy="21" r="2.5" fill="#FFFFFF" />

            {/* Pedestal bell shaped lotus */}
            <path d="M -16,24 C -20,30 20,30 16,24 Z" fill="#B45309" />

            {/* Left Lion Head & Mane */}
            <path d="M -16,16 C -24,12 -22,0 -12,2 C -10,8 -12,14 -16,16 Z" fill="url(#lionGold)" />
            <circle cx="-16" cy="6" r="1.5" fill="#1E293B" />

            {/* Right Lion Head & Mane */}
            <path d="M 16,16 C 24,12 22,0 12,2 C 10,8 12,14 16,16 Z" fill="url(#lionGold)" />
            <circle cx="16" cy="6" r="1.5" fill="#1E293B" />

            {/* Center Front-Facing Lion */}
            <path d="M -10,18 C -14,6 -10,-8 0,-8 C 10,-8 14,6 10,18 Z" fill="url(#lionGold)" />
            {/* Lion Mane Textures */}
            <path d="M -8,4 Q -12,8 -6,12" stroke="#78350F" strokeWidth="1.2" fill="none" />
            <path d="M 8,4 Q 12,8 6,12" stroke="#78350F" strokeWidth="1.2" fill="none" />
            {/* Lion Eyes & Muzzle */}
            <ellipse cx="-4" cy="-1" rx="1.5" ry="1.2" fill="#1E293B" />
            <ellipse cx="4" cy="-1" rx="1.5" ry="1.2" fill="#1E293B" />
            <path d="M -3,5 L 3,5 L 0,8 Z" fill="#78350F" />
          </g>

          {/* Foreground Paved Plaza / Walkway */}
          <path d="M 0,190 L 440,190 L 440,220 L 0,220 Z" fill="#E2E8F0" />
          <line x1="0" y1="190" x2="440" y2="190" stroke="#94A3B8" strokeWidth="2" />
          {Array.from({ length: 9 }).map((_, i) => (
            <line
              key={`paving-${i}`}
              x1={i * 55}
              y1="190"
              x2={i * 55 - 20}
              y2="220"
              stroke="#CBD5E1"
              strokeWidth="1.2"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
