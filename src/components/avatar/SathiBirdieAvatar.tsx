import React from 'react';
import { AvatarState } from '../../types';

interface SathiBirdieAvatarProps {
  state: AvatarState;
  phonemeIndex: number;
}

export const SathiBirdieAvatar: React.FC<SathiBirdieAvatarProps> = ({ state, phonemeIndex }) => {
  const normState = (state || 'idle').toLowerCase() as string;

  return (
    <svg
      viewBox="0 0 200 200"
      className="w-full h-full drop-shadow-xl overflow-visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="birdieBodyGrad" x1="20" y1="20" x2="180" y2="190" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FB923C" />
          <stop offset="0.6" stopColor="#F97316" />
          <stop offset="1" stopColor="#EA580C" />
        </linearGradient>

        <linearGradient id="birdieBellyGrad" x1="60" y1="90" x2="140" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFBEB" />
          <stop offset="1" stopColor="#FEF3C7" />
        </linearGradient>

        <linearGradient id="birdieCapGrad" x1="60" y1="10" x2="140" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#312E81" />
          <stop offset="1" stopColor="#1E1B4B" />
        </linearGradient>
      </defs>

      {/* Sathi's Cute Round Ears / Head Tufts */}
      <path
        d="M 52 48 C 42 20, 68 25, 78 44 Z"
        fill="#EA580C"
        className={normState === 'listening' ? 'animate-bounce' : ''}
      />
      <path
        d="M 148 48 C 158 20, 132 25, 122 44 Z"
        fill="#EA580C"
        className={normState === 'listening' ? 'animate-bounce delay-75' : ''}
      />

      {/* Wings reacting to emotional states */}
      {normState === 'celebrating' ? (
        // Raised joyful celebration wings
        <>
          <path
            d="M 38 105 C 10 75, 10 50, 25 55 C 38 60, 48 85, 42 115 Z"
            fill="#EA580C"
            className="animate-bounce"
          />
          <path
            d="M 162 105 C 190 75, 190 50, 175 55 C 162 60, 152 85, 158 115 Z"
            fill="#EA580C"
            className="animate-bounce"
          />
        </>
      ) : normState === 'thinking' ? (
        // Thoughtful wing touching chin
        <>
          <path d="M 38 115 C 20 120, 22 150, 36 155 C 44 145, 46 128, 40 115 Z" fill="#EA580C" />
          <path
            d="M 162 120 C 145 135, 120 145, 115 138 C 112 130, 135 110, 160 115 Z"
            fill="#EA580C"
            className="animate-pulse"
          />
        </>
      ) : normState === 'listening' ? (
        // Attentive perked forward wings
        <>
          <path d="M 38 105 C 22 108, 18 135, 34 145 C 42 138, 44 120, 38 105 Z" fill="#EA580C" />
          <path d="M 162 105 C 178 108, 182 135, 166 145 C 158 138, 156 120, 162 105 Z" fill="#EA580C" />
        </>
      ) : normState === 'error' ? (
        // Apologetic drooping wings
        <>
          <path d="M 38 115 C 15 125, 20 160, 32 165 C 40 152, 44 130, 38 115 Z" fill="#C2410C" />
          <path d="M 162 115 C 185 125, 180 160, 168 165 C 160 152, 156 130, 162 115 Z" fill="#C2410C" />
        </>
      ) : (
        // Resting natural wings
        <>
          <path d="M 38 105 C 20 115, 20 145, 36 152 C 44 145, 46 125, 40 105 Z" fill="#EA580C" />
          <path d="M 162 105 C 180 115, 180 145, 164 152 C 156 145, 154 125, 160 105 Z" fill="#EA580C" />
        </>
      )}

      {/* Main Sathi Body */}
      <rect
        x="36"
        y="38"
        width="128"
        height="134"
        rx="64"
        fill="url(#birdieBodyGrad)"
        stroke="#EA580C"
        strokeWidth="3"
      />

      {/* Warm Cream Belly */}
      <ellipse cx="100" cy="128" rx="46" ry="40" fill="url(#birdieBellyGrad)" />

      {/* Belly Feathers */}
      <path d="M 90 118 Q 100 125 110 118" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 85 130 Q 100 138 115 130" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 92 142 Q 100 148 108 142" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" />

      {/* Rosy Cheeks */}
      <ellipse
        cx="64"
        cy="104"
        rx="9"
        ry="6"
        fill={normState === 'happy' || normState === 'celebrating' ? '#FB7185' : '#FCA5A5'}
        opacity="0.8"
      />
      <ellipse
        cx="136"
        cy="104"
        rx="9"
        ry="6"
        fill={normState === 'happy' || normState === 'celebrating' ? '#FB7185' : '#FCA5A5'}
        opacity="0.8"
      />

      {/* Scholar Glasses Frame */}
      <circle cx="74" cy="85" r="22" stroke="#475569" strokeWidth="3.5" fill="#FFFFFF" fillOpacity="0.85" />
      <circle cx="126" cy="85" r="22" stroke="#475569" strokeWidth="3.5" fill="#FFFFFF" fillOpacity="0.85" />
      <path d="M 96 85 Q 100 81 104 85" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />

      {/* Eyes & Eyebrows based on State */}
      {normState === 'happy' || normState === 'celebrating' ? (
        // Joyful smiling curved eyes ^_^
        <>
          <path d="M 62 87 Q 74 74 86 87" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M 114 87 Q 126 74 138 87" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" fill="none" />
        </>
      ) : normState === 'concerned' ? (
        // Empathetic, supportive concerned angled brows & eyes
        <>
          <path d="M 63 68 L 84 73" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          <path d="M 137 68 L 116 73" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="74" cy="86" rx="9" ry="11" fill="#1E293B" />
          <ellipse cx="126" cy="86" rx="9" ry="11" fill="#1E293B" />
          <circle cx="76" cy="82" r="3.5" fill="#FFFFFF" />
          <circle cx="128" cy="82" r="3.5" fill="#FFFFFF" />
        </>
      ) : normState === 'error' ? (
        // Apologetic / confused eyes with slight swirl
        <>
          <path d="M 64 68 Q 74 74 84 70" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 116 70 Q 126 74 136 68" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="74" cy="85" r="9" fill="#1E293B" />
          <circle cx="126" cy="85" r="9" fill="#1E293B" />
          <path d="M 72 83 Q 76 87 74 89" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 124 83 Q 128 87 126 89" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" fill="none" />
        </>
      ) : normState === 'thinking' ? (
        // Looking up thoughtfully
        <>
          <path d="M 64 69 Q 74 65 84 71" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 116 71 Q 126 65 136 69" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="78" cy="80" r="9" fill="#1E293B" />
          <circle cx="130" cy="80" r="9" fill="#1E293B" />
          <circle cx="80" cy="77" r="3" fill="#FFFFFF" />
          <circle cx="132" cy="77" r="3" fill="#FFFFFF" />
        </>
      ) : normState === 'listening' ? (
        // Wide alert sparkling attentive eyes
        <>
          <path d="M 62 67 Q 74 63 86 67" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 114 67 Q 126 63 138 67" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="74" cy="85" r="11" fill="#1E293B" />
          <circle cx="126" cy="85" r="11" fill="#1E293B" />
          <circle cx="77" cy="81" r="4.5" fill="#FFFFFF" />
          <circle cx="129" cy="81" r="4.5" fill="#FFFFFF" />
          <circle cx="71" cy="89" r="2" fill="#FFFFFF" />
          <circle cx="123" cy="89" r="2" fill="#FFFFFF" />
        </>
      ) : (
        // Relaxed natural eyes
        <>
          <path d="M 64 70 Q 74 67 84 70" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
          <path d="M 116 70 Q 126 67 136 70" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
          <circle cx="74" cy="85" r="10" fill="#1E293B" />
          <circle cx="126" cy="85" r="10" fill="#1E293B" />
          <circle cx="76" cy="82" r="4" fill="#FFFFFF" />
          <circle cx="128" cy="82" r="4" fill="#FFFFFF" />
        </>
      )}

      {/* Cute Golden Beak (Upper) */}
      <polygon
        points="94,92 106,92 100,105"
        fill="#F59E0B"
        stroke="#D97706"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Dynamic Lip-Sync Mouth Animation */}
      {normState === 'speaking' ? (
        // Believable multi-phoneme mouth motion
        phonemeIndex === 1 ? (
          // Open Vowel 'Ah'
          <g>
            <ellipse cx="100" cy="116" rx="9" ry="8" fill="#881337" />
            <ellipse cx="100" cy="118" rx="6" ry="3" fill="#FB7185" />
            <path d="M 94 112 Q 100 114 106 112" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        ) : phonemeIndex === 2 ? (
          // Round 'Oh'
          <g>
            <circle cx="100" cy="115" r="6" fill="#881337" />
            <circle cx="100" cy="116" r="3" fill="#FB7185" />
          </g>
        ) : phonemeIndex === 3 ? (
          // Wide 'Ee'
          <g>
            <ellipse cx="100" cy="114" rx="10" ry="5" fill="#881337" />
            <path d="M 92 113 Q 100 115 108 113" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </g>
        ) : (
          // Semi-open resting syllable
          <g>
            <ellipse cx="100" cy="113" rx="7" ry="4" fill="#881337" />
            <path d="M 94 115 Q 100 118 106 115" stroke="#F43F5E" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )
      ) : normState === 'happy' || normState === 'celebrating' ? (
        // Big open joyful smile
        <path
          d="M 91 109 Q 100 121 109 109"
          fill="#881337"
          stroke="#D97706"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : normState === 'concerned' ? (
        // Small gentle inverted curve
        <path d="M 94 114 Q 100 110 106 114" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
      ) : normState === 'error' ? (
        // Wavy puzzled mouth
        <path d="M 93 113 Q 97 110 100 113 Q 104 116 107 113" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />
      ) : (
        // Gentle resting content smile
        <path d="M 94 110 Q 100 116 106 110" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
      )}

      {/* Feet */}
      <path d="M 75 168 Q 75 180 68 184 M 75 168 Q 80 182 80 185 M 75 168 Q 85 180 88 184" stroke="#D97706" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 125 168 Q 115 180 112 184 M 125 168 Q 120 182 120 185 M 125 168 Q 132 180 135 184" stroke="#D97706" strokeWidth="3.5" strokeLinecap="round" />

      {/* Scholar Cap for Celebrating or Learning State */}
      {(normState === 'celebrating' || normState === 'happy') && (
        <g className="animate-bounce">
          <polygon points="100,10 145,24 100,36 55,24" fill="url(#birdieCapGrad)" />
          <rect x="76" y="27" width="48" height="12" rx="4" fill="#1E1B4B" />
          <circle cx="100" cy="23" r="3" fill="#F59E0B" />
          <path d="M 100 23 C 120 28, 138 35, 140 46" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="140" cy="48" r="3.5" fill="#F59E0B" />
        </g>
      )}

      {/* Celebratory Stars */}
      {normState === 'celebrating' && (
        <>
          <text x="24" y="40" fontSize="18" fill="#F59E0B" className="animate-spin">⭐</text>
          <text x="156" y="38" fontSize="20" fill="#F59E0B" className="animate-bounce">✨</text>
          <text x="165" y="90" fontSize="16" fill="#10B981">🎉</text>
        </>
      )}

      {/* Error Question/Exclamation Mark */}
      {normState === 'error' && (
        <g className="animate-bounce">
          <circle cx="152" cy="48" r="14" fill="#FEE2E2" stroke="#EF4444" strokeWidth="2" />
          <text x="147" y="55" fontSize="18" fontWeight="bold" fill="#DC2626">?</text>
        </g>
      )}
    </svg>
  );
};
