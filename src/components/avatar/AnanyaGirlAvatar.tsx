import React from 'react';
import { AvatarState } from '../../types';

interface AnanyaGirlAvatarProps {
  state: AvatarState;
  phonemeIndex: number;
}

export const AnanyaGirlAvatar: React.FC<AnanyaGirlAvatarProps> = ({ state, phonemeIndex }) => {
  const normState = (state || 'idle').toLowerCase() as string;

  return (
    <svg
      viewBox="0 0 200 200"
      className="w-full h-full drop-shadow-xl overflow-visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Skin Tone Gradient */}
        <linearGradient id="ananyaSkinGrad" x1="60" y1="40" x2="140" y2="160" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF1E6" />
          <stop offset="0.7" stopColor="#FED7AA" />
          <stop offset="1" stopColor="#FDBA74" />
        </linearGradient>

        {/* Uniform Sweater Gradient (School Maroon / Crimson) */}
        <linearGradient id="ananyaSweaterGrad" x1="40" y1="130" x2="160" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#991B1B" />
          <stop offset="0.6" stopColor="#B91C1C" />
          <stop offset="1" stopColor="#7F1D1D" />
        </linearGradient>

        {/* Hair Gradient */}
        <linearGradient id="ananyaHairGrad" x1="50" y1="20" x2="150" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#334155" />
          <stop offset="0.4" stopColor="#1E293B" />
          <stop offset="1" stopColor="#0F172A" />
        </linearGradient>

        {/* Cap Gradient for Celebration */}
        <linearGradient id="ananyaCapGrad" x1="60" y1="10" x2="140" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#312E81" />
          <stop offset="1" stopColor="#1E1B4B" />
        </linearGradient>
      </defs>

      {/* Hair Behind Shoulders / Back Ponytail Bun */}
      <circle cx="50" cy="95" r="18" fill="url(#ananyaHairGrad)" />
      <circle cx="150" cy="95" r="18" fill="url(#ananyaHairGrad)" />

      {/* Red Hair Ribbon Ties */}
      <circle cx="50" cy="80" r="7" fill="#EF4444" />
      <circle cx="150" cy="80" r="7" fill="#EF4444" />

      {/* Body / School Uniform Sweater & Shoulders */}
      <path
        d="M 40 160 C 40 140, 65 132, 100 132 C 135 132, 160 140, 160 160 L 164 200 L 36 200 Z"
        fill="url(#ananyaSweaterGrad)"
      />

      {/* School Shirt White Peter Pan / Rounded Collar */}
      <path d="M 80 132 C 86 148, 98 148, 100 148 C 102 148, 114 148, 120 132 Z" fill="#FFFFFF" />
      <path d="M 72 132 C 72 144, 88 148, 98 148 L 94 132 Z" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
      <path d="M 128 132 C 128 144, 112 148, 102 148 L 106 132 Z" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />

      {/* School Ribbon Tie (Navy Blue) */}
      <polygon points="97,146 103,146 105,174 100,180 95,174" fill="#1E3A8A" />

      {/* School Crest Badge on Left Chest */}
      <circle cx="140" cy="162" r="10" fill="#F59E0B" />
      <circle cx="140" cy="162" r="8" fill="#991B1B" />
      <text x="136" y="166" fontSize="9" fill="#FBBF24" fontWeight="bold">★</text>

      {/* Arms & Hands reacting to states */}
      {normState === 'celebrating' ? (
        // Raised arms cheering in victory
        <>
          <path d="M 42 145 C 24 110, 18 80, 32 75 C 42 72, 50 95, 52 135 Z" fill="url(#ananyaSweaterGrad)" className="animate-bounce" />
          <path d="M 158 145 C 176 110, 182 80, 168 75 C 158 72, 150 95, 148 135 Z" fill="url(#ananyaSweaterGrad)" className="animate-bounce" />
          <circle cx="30" cy="72" r="9" fill="url(#ananyaSkinGrad)" />
          <circle cx="170" cy="72" r="9" fill="url(#ananyaSkinGrad)" />
        </>
      ) : normState === 'thinking' ? (
        // Hand to cheek thoughtfully
        <>
          <path d="M 42 145 C 32 155, 34 185, 48 190 Z" fill="url(#ananyaSweaterGrad)" />
          <path d="M 158 145 C 145 140, 128 128, 120 125 Z" fill="url(#ananyaSweaterGrad)" />
          <ellipse cx="118" cy="122" rx="8" ry="7" fill="url(#ananyaSkinGrad)" stroke="#FDBA74" strokeWidth="1" className="animate-pulse" />
        </>
      ) : normState === 'error' ? (
        // Shrugging apologetically
        <>
          <path d="M 42 145 C 28 138, 24 165, 36 175 Z" fill="url(#ananyaSweaterGrad)" />
          <path d="M 158 145 C 172 138, 176 165, 164 175 Z" fill="url(#ananyaSweaterGrad)" />
          <circle cx="34" cy="172" r="8" fill="url(#ananyaSkinGrad)" />
          <circle cx="166" cy="172" r="8" fill="url(#ananyaSkinGrad)" />
        </>
      ) : (
        // Gentle resting posture
        <>
          <path d="M 40 148 C 30 165, 34 190, 48 195 Z" fill="url(#ananyaSweaterGrad)" />
          <path d="M 160 148 C 170 165, 166 190, 152 195 Z" fill="url(#ananyaSweaterGrad)" />
        </>
      )}

      {/* Neck */}
      <rect x="88" y="112" width="24" height="24" rx="6" fill="#FED7AA" />

      {/* Ears */}
      <circle cx="50" cy="92" r="12" fill="#FED7AA" stroke="#FDBA74" strokeWidth="1.5" />
      <circle cx="50" cy="96" r="2.5" fill="#EF4444" /> {/* Cute small earring */}
      <circle cx="150" cy="92" r="12" fill="#FED7AA" stroke="#FDBA74" strokeWidth="1.5" />
      <circle cx="150" cy="96" r="2.5" fill="#EF4444" />

      {/* Main Face Shape */}
      <ellipse cx="100" cy="88" rx="46" ry="45" fill="url(#ananyaSkinGrad)" stroke="#FDBA74" strokeWidth="2" />

      {/* Hair (Front bangs & side locks) */}
      <path
        d="M 52 82 C 48 42, 75 24, 100 24 C 128 24, 152 42, 148 82 C 144 58, 132 45, 100 46 C 74 47, 58 60, 52 82 Z"
        fill="url(#ananyaHairGrad)"
      />
      {/* Soft fringe */}
      <path d="M 64 46 Q 82 56 100 48 Q 118 56 136 46" fill="url(#ananyaHairGrad)" />

      {/* Red Hairclips */}
      <rect x="58" y="44" width="12" height="4" rx="2" fill="#EF4444" transform="rotate(-15 58 44)" />
      <rect x="130" y="42" width="12" height="4" rx="2" fill="#EF4444" transform="rotate(15 130 42)" />

      {/* Rosy Blushing Cheeks */}
      <ellipse
        cx="68"
        cy="98"
        rx="9"
        ry="6"
        fill={normState === 'happy' || normState === 'celebrating' ? '#FB7185' : '#FCA5A5'}
        opacity="0.8"
      />
      <ellipse
        cx="132"
        cy="98"
        rx="9"
        ry="6"
        fill={normState === 'happy' || normState === 'celebrating' ? '#FB7185' : '#FCA5A5'}
        opacity="0.8"
      />

      {/* Cute Little Nose */}
      <path d="M 98 88 Q 100 92 102 90" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Eyes & Eyebrows based on State */}
      {normState === 'happy' || normState === 'celebrating' ? (
        // Joyful smiling curved eyes with cute lashes ^_^
        <>
          <path d="M 68 82 Q 78 72 88 82" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M 112 82 Q 122 72 132 82" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M 87 77 L 90 74" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
          <path d="M 131 77 L 134 74" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
          <path d="M 68 70 Q 78 66 88 70" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 112 70 Q 122 66 132 70" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : normState === 'concerned' ? (
        // Caring, gentle concerned expression
        <>
          <path d="M 68 70 L 86 74" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 132 70 L 114 74" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="78" cy="84" rx="8" ry="10" fill="#1E293B" />
          <ellipse cx="122" cy="84" rx="8" ry="10" fill="#1E293B" />
          <circle cx="80" cy="80" r="3.2" fill="#FFFFFF" />
          <circle cx="124" cy="80" r="3.2" fill="#FFFFFF" />
        </>
      ) : normState === 'error' ? (
        // Confused / apologetic look
        <>
          <path d="M 68 69 Q 78 74 88 71" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 112 71 Q 122 74 132 69" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="78" cy="84" r="8" fill="#1E293B" />
          <circle cx="122" cy="84" r="8" fill="#1E293B" />
          <circle cx="80" cy="81" r="2.5" fill="#FFFFFF" />
          <circle cx="124" cy="81" r="2.5" fill="#FFFFFF" />
          {/* Apologetic sweatdrop */}
          <path d="M 144 65 C 146 62, 148 64, 148 67 C 148 70, 144 72, 142 69 Z" fill="#38BDF8" className="animate-bounce" />
        </>
      ) : normState === 'thinking' ? (
        // Thinking / looking up
        <>
          <path d="M 68 69 Q 78 65 88 70" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 112 71 Q 122 66 132 69" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="81" cy="80" r="8" fill="#1E293B" />
          <circle cx="125" cy="80" r="8" fill="#1E293B" />
          <circle cx="83" cy="77" r="3" fill="#FFFFFF" />
          <circle cx="127" cy="77" r="3" fill="#FFFFFF" />
        </>
      ) : normState === 'listening' ? (
        // Wide alert sparkling attentive eyes
        <>
          <path d="M 67 67 Q 78 64 89 67" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 111 67 Q 122 64 133 67" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="78" cy="83" r="10" fill="#1E293B" />
          <circle cx="122" cy="83" r="10" fill="#1E293B" />
          <circle cx="80" cy="80" r="4.2" fill="#FFFFFF" />
          <circle cx="124" cy="80" r="4.2" fill="#FFFFFF" />
          <circle cx="76" cy="86" r="1.8" fill="#FFFFFF" />
          <circle cx="120" cy="86" r="1.8" fill="#FFFFFF" />
        </>
      ) : (
        // Calm friendly normal eyes with pretty lashes
        <>
          <path d="M 68 70 Q 78 67 88 70" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 112 70 Q 122 67 132 70" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="78" cy="83" r="9" fill="#1E293B" />
          <circle cx="122" cy="83" r="9" fill="#1E293B" />
          <circle cx="80" cy="80" r="3.8" fill="#FFFFFF" />
          <circle cx="124" cy="80" r="3.8" fill="#FFFFFF" />
        </>
      )}

      {/* Dynamic Lip-Sync Mouth Animation */}
      {normState === 'speaking' ? (
        phonemeIndex === 1 ? (
          // Open Vowel 'Ah'
          <g>
            <ellipse cx="100" cy="107" rx="8" ry="7" fill="#881337" />
            <ellipse cx="100" cy="109" rx="5" ry="3" fill="#FB7185" />
            <path d="M 94 104 Q 100 106 106 104" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        ) : phonemeIndex === 2 ? (
          // Round 'Oh'
          <g>
            <circle cx="100" cy="106" r="5" fill="#881337" />
            <circle cx="100" cy="107" r="2.5" fill="#FB7185" />
          </g>
        ) : phonemeIndex === 3 ? (
          // Wide 'Ee'
          <g>
            <ellipse cx="100" cy="106" rx="9" ry="4" fill="#881337" />
            <path d="M 93 105 Q 100 107 107 105" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        ) : (
          // Semi-open resting syllable
          <g>
            <ellipse cx="100" cy="105" rx="6" ry="3.5" fill="#881337" />
            <path d="M 95 106 Q 100 109 105 106" stroke="#F43F5E" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )
      ) : normState === 'happy' || normState === 'celebrating' ? (
        // Broad happy smile with teeth
        <g>
          <path d="M 90 102 Q 100 115 110 102 Z" fill="#881337" stroke="#EA580C" strokeWidth="1.5" />
          <path d="M 92 102 Q 100 105 108 102" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </g>
      ) : normState === 'concerned' ? (
        // Gentle caring inverted curve
        <path d="M 94 108 Q 100 103 106 108" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
      ) : normState === 'error' ? (
        // Apologetic small wavy mouth
        <path d="M 94 107 Q 97 104 100 107 Q 103 110 106 107" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />
      ) : (
        // Polite content smile
        <path d="M 93 103 Q 100 110 107 103" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
      )}

      {/* Graduation Cap when Celebrating */}
      {(normState === 'celebrating' || normState === 'happy') && (
        <g className="animate-bounce">
          <polygon points="100,6 145,20 100,32 55,20" fill="url(#ananyaCapGrad)" />
          <rect x="76" y="23" width="48" height="11" rx="4" fill="#1E1B4B" />
          <circle cx="100" cy="19" r="3" fill="#F59E0B" />
          <path d="M 100 19 C 120 24, 138 31, 140 42" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="140" cy="44" r="3.5" fill="#F59E0B" />
        </g>
      )}

      {/* Celebration Sparkles */}
      {normState === 'celebrating' && (
        <>
          <text x="24" y="38" fontSize="18" fill="#F59E0B" className="animate-spin">⭐</text>
          <text x="156" y="36" fontSize="20" fill="#F59E0B" className="animate-bounce">✨</text>
          <text x="165" y="88" fontSize="16" fill="#10B981">🎉</text>
        </>
      )}

      {/* Error Question/Warning Badge */}
      {normState === 'error' && (
        <g className="animate-bounce">
          <circle cx="156" cy="46" r="14" fill="#FEE2E2" stroke="#EF4444" strokeWidth="2" />
          <text x="151" y="53" fontSize="18" fontWeight="bold" fill="#DC2626">?</text>
        </g>
      )}
    </svg>
  );
};
