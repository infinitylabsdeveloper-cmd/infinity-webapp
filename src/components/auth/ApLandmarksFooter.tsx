import React from 'react';

interface ApLandmarksFooterProps {
  variant: 'login' | 'otp';
  language?: 'en' | 'te';
}

export default function ApLandmarksFooter({ variant, language = 'en' }: ApLandmarksFooterProps) {
  if (variant === 'login') {
    return (
      <div className="relative w-full overflow-hidden select-none bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#065f46] pt-5 pb-5 px-6 rounded-t-3xl shadow-inner mt-4">
        {/* Subtle mountain topography line art */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="w-full h-full">
            <path
              d="M 0,60 L 0,40 Q 60,10 120,35 T 240,20 T 360,35 L 400,25 L 400,60 Z"
              fill="#FFFFFF"
            />
            <path
              d="M 0,60 L 0,48 Q 80,25 160,42 T 320,30 L 400,45 L 400,60 Z"
              fill="#FDE047"
            />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-1">
          <p className="text-white text-xs sm:text-sm font-serif italic tracking-wide drop-shadow-xs">
            {language === 'te' ? 'మెరుగైన ఆంధ్రప్రదేశ్ కోసం' : 'For a Better Andhra Pradesh'}
          </p>

          {/* Indian Tricolor Ribbon Wave */}
          <div className="flex items-center justify-center pt-0.5">
            <svg width="74" height="8" viewBox="0 0 74 8" fill="none" className="drop-shadow-xs">
              <path d="M 0,1.5 Q 37,6.5 74,1" stroke="#FF9933" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M 0,3.8 Q 37,8.8 74,3.3" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M 0,6 Q 37,11 74,5.5" stroke="#138808" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // OTP Verification Screen Bottom Variant
  return (
    <div className="relative w-full overflow-hidden select-none bg-gradient-to-b from-transparent to-slate-100/70 pt-4 pb-4 px-4 mt-3">
      {/* Slogan with Tricolor */}
      <div className="flex flex-col items-end pr-3 pb-2 relative z-10">
        <p className="font-serif italic text-slate-800 text-xs sm:text-[13px] font-bold tracking-tight">
          ,Same People
        </p>
        <p className="font-serif italic text-slate-800 text-xs sm:text-[13px] font-bold tracking-tight -mt-0.5">
          Bigger Possibilities'
        </p>

        {/* Indian Tricolor Swoop */}
        <div className="pt-0.5">
          <svg width="60" height="7" viewBox="0 0 60 7" fill="none">
            <path d="M 0,1 Q 30,5 60,1" stroke="#FF9933" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 0,3.2 Q 30,7.2 60,3.2" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 0,5.4 Q 30,9.4 60,5.4" stroke="#138808" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Iconic Architectural Sketches of Andhra Pradesh */}
      <div className="w-full h-16 opacity-75">
        <svg
          viewBox="0 0 420 80"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full text-slate-500"
          fill="none"
          stroke="currentColor"
        >
          {/* Subtle Background Hills */}
          <path
            d="M 0,75 Q 80,45 160,65 T 320,50 Q 370,55 420,70"
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />

          {/* Left: Historic Temple Gopuram Outline */}
          <g transform="translate(15, 20) scale(0.45)" strokeWidth="1.5">
            <rect x="20" y="80" width="60" height="30" />
            <rect x="25" y="55" width="50" height="25" />
            <rect x="30" y="35" width="40" height="20" />
            <rect x="35" y="20" width="30" height="15" />
            <path d="M 45,20 L 50,5 L 55,20 Z" />
            <line x1="50" y1="80" x2="50" y2="110" />
          </g>

          {/* Center-Left: Buddhist Amaravati Maha Stupa */}
          <g transform="translate(90, 25) scale(0.42)" strokeWidth="1.5">
            {/* Drum Base */}
            <rect x="10" y="70" width="90" height="25" rx="3" />
            {/* Hemispherical Anda (Dome) */}
            <path d="M 15,70 A 40,40 0 0,1 95,70 Z" />
            {/* Harmika & Chatra (Umbrella spire) */}
            <rect x="47" y="22" width="16" height="8" />
            <line x1="55" y1="5" x2="55" y2="22" strokeWidth="2" />
            <circle cx="55" cy="5" r="2.5" />
            <line x1="42" y1="12" x2="68" y2="12" />
            <line x1="46" y1="8" x2="64" y2="8" />
          </g>

          {/* Center-Right: Iconic Kanaka Durga / Krishna River Cable Bridge (Prakasam Barrage & Kanaka Durga Flyover) */}
          <g transform="translate(200, 15) scale(0.55)" strokeWidth="1.5">
            {/* Bridge Pylon / Tower */}
            <path d="M 60,95 L 75,10 L 90,95" strokeWidth="2.5" />
            {/* Cable Stays radiating */}
            <line x1="75" y1="20" x2="20" y2="95" strokeWidth="1" />
            <line x1="75" y1="35" x2="35" y2="95" strokeWidth="1" />
            <line x1="75" y1="50" x2="50" y2="95" strokeWidth="1" />

            <line x1="75" y1="20" x2="130" y2="95" strokeWidth="1" />
            <line x1="75" y1="35" x2="115" y2="95" strokeWidth="1" />
            <line x1="75" y1="50" x2="100" y2="95" strokeWidth="1" />

            {/* Bridge Roadway */}
            <line x1="0" y1="95" x2="150" y2="95" strokeWidth="3" />
            <line x1="0" y1="99" x2="150" y2="99" strokeWidth="1" />
          </g>

          {/* Right: Modern Amaravati Secretariat Tower & Trees */}
          <g transform="translate(325, 25) scale(0.4)" strokeWidth="1.5">
            <rect x="20" y="30" width="35" height="75" />
            <rect x="55" y="45" width="25" height="60" />
            <line x1="37" y1="10" x2="37" y2="30" strokeWidth="2" />
            {/* Windows */}
            <line x1="26" y1="42" x2="48" y2="42" />
            <line x1="26" y1="55" x2="48" y2="55" />
            <line x1="26" y1="68" x2="48" y2="68" />
            <line x1="26" y1="82" x2="48" y2="82" />
          </g>

          {/* Ground water line */}
          <line x1="0" y1="78" x2="420" y2="78" strokeWidth="1.2" />
        </svg>
      </div>
    </div>
  );
}
