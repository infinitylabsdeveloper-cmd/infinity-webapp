import React from 'react';

interface ApEmblemProps {
  className?: string;
  size?: number;
}

export default function ApEmblem({ className = '', size = 96 }: ApEmblemProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
    >
      <defs>
        {/* Outer Circular Gradient */}
        <linearGradient id="apGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="50%" stopColor="#065f46" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>

        <linearGradient id="apGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>

        <linearGradient id="potGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>

      {/* Outer Golden Border with Ray Beads */}
      <circle cx="80" cy="80" r="76" fill="url(#apGoldGrad)" />
      <circle cx="80" cy="80" r="72" fill="#065f46" />

      {/* Decorative Beaded Ring */}
      {Array.from({ length: 36 }).map((_, i) => {
        const angle = (i * 10 * Math.PI) / 180;
        const x = 80 + 73.5 * Math.cos(angle);
        const y = 80 + 73.5 * Math.sin(angle);
        return <circle key={i} cx={x} cy={y} r="1.6" fill="#FEF08A" />;
      })}

      {/* White Ring for Official Text */}
      <circle cx="80" cy="80" r="67" fill="#FFFFFF" stroke="#065f46" strokeWidth="2" />

      {/* Circular Text Path for GOVERNMENT OF ANDHRA PRADESH */}
      <path
        id="topTextCurve"
        d="M 24,80 A 56,56 0 1,1 136,80"
        fill="none"
      />
      <text fill="#065f46" fontSize="8.2" fontWeight="900" letterSpacing="0.08em">
        <textPath href="#topTextCurve" startOffset="50%" textAnchor="middle">
          GOVERNMENT OF ANDHRA PRADESH
        </textPath>
      </text>

      {/* Circular Text Path for Andhra Pradesh in Telugu at bottom */}
      <path
        id="bottomTextCurve"
        d="M 136,80 A 56,56 0 0,1 24,80"
        fill="none"
      />
      <text fill="#065f46" fontSize="7.2" fontWeight="900" letterSpacing="0.06em">
        <textPath href="#bottomTextCurve" startOffset="50%" textAnchor="middle">
          ఆంధ్రప్రదేశ్ ప్రభుత్వం
        </textPath>
      </text>

      {/* Inner Green Ring */}
      <circle cx="80" cy="80" r="44" fill="#FFFFFF" stroke="#065f46" strokeWidth="2.5" />
      <circle cx="80" cy="80" r="40" fill="#F0FDF4" stroke="#EAB308" strokeWidth="1.5" />

      {/* Decorative Traditional Sunrays / Floral Petals */}
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 15 * Math.PI) / 180;
        const x1 = 80 + 34 * Math.cos(angle);
        const y1 = 80 + 34 * Math.sin(angle);
        const x2 = 80 + 39 * Math.cos(angle);
        const y2 = 80 + 39 * Math.sin(angle);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#047857"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        );
      })}

      {/* Sacred Purna Kumbham (Kalash / పూర్ణకుంభం) */}
      <g transform="translate(80, 81) scale(0.65)">
        {/* Mango Leaves & Foliage (ఆకులు) */}
        <path
          d="M 0,-34 C -12,-30 -22,-18 -20,-8 C -14,-14 0,-14 0,-14 C 0,-14 14,-14 20,-8 C 22,-18 12,-30 0,-34 Z"
          fill="#15803D"
        />
        <path
          d="M -18,-18 C -30,-12 -34,-2 -26,8 C -22,-2 -10,-8 -10,-8 Z"
          fill="#16A34A"
        />
        <path
          d="M 18,-18 C 30,-12 34,-2 26,8 C 22,-2 10,-8 10,-8 Z"
          fill="#16A34A"
        />

        {/* Sacred Coconut with Tilak (కొబ్బరికాయ) */}
        <ellipse cx="0" cy="-14" rx="10" ry="12" fill="#78350F" />
        <ellipse cx="0" cy="-14" rx="8" ry="10" fill="#92400E" />
        <circle cx="0" cy="-16" r="2.5" fill="#DC2626" />

        {/* Kalash Body (పూర్ణ కుంభం కుండ) */}
        <path
          d="M -18,-6 C -14,-2 -8,0 0,0 C 8,0 14,-2 18,-6 L 20,4 C 28,14 24,28 14,32 C 8,34 -8,34 -14,32 C -24,28 -28,14 -20,4 Z"
          fill="url(#potGrad)"
          stroke="#78350F"
          strokeWidth="1.5"
        />

        {/* Kalash Neck Ring */}
        <rect x="-18" y="-7" width="36" height="4" rx="2" fill="#CA8A04" stroke="#78350F" strokeWidth="1" />

        {/* Decorative Swastik / Sacred Motif on Pot */}
        <path
          d="M 0,10 L 0,24 M -7,17 L 7,17 M -7,10 L -7,17 M 7,17 L 7,24 M 0,10 L 7,10 M 0,24 L -7,24"
          stroke="#DC2626"
          strokeWidth="1.8"
          strokeLinecap="square"
        />

        {/* Kalash Pedestal Base */}
        <path
          d="M -16,33 L 16,33 L 18,37 L -18,37 Z"
          fill="#B45309"
          stroke="#78350F"
          strokeWidth="1"
        />
      </g>

      {/* Satyameva Jayate (సత్యమేవ జయతే) Motto Banner at Bottom */}
      <g transform="translate(80, 137)">
        <path
          d="M -36,-7 L 36,-7 L 42,4 L -42,4 Z"
          fill="#FEF08A"
          stroke="#B45309"
          strokeWidth="1"
        />
        <text
          x="0"
          y="0"
          textAnchor="middle"
          fill="#065f46"
          fontSize="6.8"
          fontWeight="900"
          fontFamily="serif"
        >
          సత్యమేవ జయతే
        </text>
      </g>
    </svg>
  );
}
