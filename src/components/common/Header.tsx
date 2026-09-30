import React from 'react';
import { Volume2, Globe, Navigation, User } from 'lucide-react';
import { LanguageCode, ScreenId } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../data/languages';
import { SpeechService } from '../../services/speechService';

interface HeaderProps {
  currentLanguage: LanguageCode;
  onOpenLanguageModal: () => void;
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  parentName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onOpenLanguageModal,
  currentScreen,
  onNavigate,
  parentName,
}) => {
  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const handleAudioGuide = () => {
    const guideTexts: Record<ScreenId, string> = {
      welcome: 'SchoolSathi में आपका स्वागत है। शुरू करने के लिए नीचे दिए गए बटन पर टैप करें।',
      login: 'यहाँ अपना मोबाइल नंबर डालकर 4 अंकों के कोड से लॉगिन करें।',
      register: 'यहाँ अपना मोबाइल नंबर और नाम भरें, ताकि स्कूल से आपका संपर्क हो सके।',
      language: 'अपनी मनपसंद भाषा चुनें जिसमें आप स्कूल साथी से बात करना चाहते हैं।',
      'add-child': 'अपने बच्चे का नाम, कक्षा और स्कूल आईडी दर्ज करें।',
      'select-school': 'यहाँ अपने बच्चे के स्कूल का नाम खोजें या सूची से चुनें।',
      'verify-child': 'स्कूल रिकॉर्ड्स से मिलान करने के लिए स्कूल, विद्यार्थी आईडी और नाम दर्ज करें।',
      intro: 'मिलिए अपने स्कूलसाथी से! यह आपका आवाज़ आधारित साथी है।',
      'main-companion':
        'यह आपका मुख्य साथी स्क्रीन है। बड़ा माइक बटन दबाकर कुछ भी पूछें, या नीचे दिए गए कार्ड्स पर टैप करें।',
      'child-profile': 'यहाँ आपके बच्चे का संपूर्ण प्रोफाइल, उपस्थिति और शिक्षक का संपर्क है।',
      settings: 'यहाँ से आप भाषा बदल सकते हैं, आवाज़ की गति चुन सकते हैं या खाता बदल सकते हैं।',
      help: 'यहाँ मदद और अक्सर पूछे जाने वाले सवाल उपलब्ध हैं।',
      admin: 'स्कूल एडमिन पोर्टल में आपका स्वागत है। यहाँ से आप होमवर्क, परीक्षा और उपस्थिति प्रबंधित कर सकते हैं।',
    };
    SpeechService.speak(guideTexts[currentScreen] || 'SchoolSathi', currentLanguage);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#e0e0e0] px-4 py-3 transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('main-companion')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img src="/src/assets/logo.png" alt="SchoolSathi Logo" className="w-9 h-9 object-contain group-hover:scale-105 transition-transform" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[20px] font-semibold tracking-tight text-[#1d1d1f]">
                SchoolSathi
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#f0f0f0] text-[#7a7a7a] uppercase tracking-wider">
                AI Voice
              </span>
            </div>
            <p className="text-[11px] text-[#7a7a7a] font-medium hidden sm:block mt-0.5">
              {parentName ? `Logged in: ${parentName}` : "Your child's school. Your language."}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Audio Page Help Button */}
          <button
            onClick={handleAudioGuide}
            title="Listen in your language"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#fafafc] hover:bg-[#f0f0f0] text-[#1d1d1f] border border-[#e0e0e0] text-[12px] font-semibold active:scale-95 transition-all"
            aria-label="Listen to audio guidance for this screen"
          >
            <Volume2 className="w-4 h-4 text-[#0066cc] animate-pulse" />
            <span className="hidden md:inline">Audio Guide</span>
          </button>

          {/* Language Switcher Badge (Hidden on Main Companion to keep hero screen clutter-free) */}
          {currentScreen !== 'main-companion' && (
            <button
              onClick={onOpenLanguageModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#fafafc] hover:bg-[#f0f0f0] text-[#1d1d1f] border border-[#e0e0e0] text-[12px] font-semibold active:scale-95 transition-all"
              aria-label="Change language"
            >
              <Globe className="w-4 h-4 text-[#ff3b30]" />
              <span className="font-semibold">{currentLangObj.name}</span>
            </button>
          )}

          {/* School Admin Portal Shortcut */}
          <button
            onClick={() => onNavigate('admin')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#1d1d1f] hover:bg-black text-white text-[12px] font-semibold active:scale-95 transition-all cursor-pointer"
            title="Open School Admin & Teacher Portal"
          >
            <span>🏫</span>
            <span className="hidden sm:inline">School Admin</span>
          </button>

          {/* Screen Switcher Quick Menu */}
          <div className="relative group">
            <button
              className="flex items-center gap-1 px-2.5 py-2 rounded-full bg-[#fafafc] hover:bg-[#f0f0f0] text-[#1d1d1f] border border-[#e0e0e0] text-[12px] font-semibold transition-colors"
              title="Quick navigate all screens"
            >
              <Navigation className="w-4 h-4 text-[#7a7a7a]" />
              <span className="hidden lg:inline text-[#1d1d1f]">Screens</span>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-64 py-2 bg-white rounded-[14px] shadow-lg border border-[#e0e0e0] hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 text-[11px] font-semibold text-[#7a7a7a] uppercase tracking-wider border-b border-[#e0e0e0] mb-1">
                SchoolSathi Navigation
              </div>
              <div className="max-h-80 overflow-y-auto py-1">
                {[
                  { id: 'welcome', label: '1. Welcome Screen', icon: '✨' },
                  { id: 'login', label: '2. Parent Login (Mobile / OTP)', icon: '🔑' },
                  { id: 'register', label: '3. Parent Registration', icon: '📱' },
                  { id: 'language', label: '4. Language Selection', icon: '🗣️' },
                  { id: 'select-school', label: '5. School Selection', icon: '🏫' },
                  { id: 'add-child', label: '6. Add Child Form', icon: '👶' },
                  { id: 'verify-child', label: '7. Child Verification', icon: '🛡️' },
                  { id: 'main-companion', label: '8. Main AI Companion', icon: '🦉' },
                  { id: 'child-profile', label: '9. Child Profile', icon: '🎒' },
                  { id: 'settings', label: '10. Settings & Account', icon: '⚙️' },
                  { id: 'help', label: '11. Help & Voice Guide', icon: '❓' },
                  { id: 'admin', label: '12. School Admin Portal (/admin)', icon: '🏫' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onNavigate(s.id as ScreenId)}
                    className={`w-full text-left px-4 py-2.5 text-[13px] font-medium flex items-center gap-3 transition-colors ${
                      currentScreen === s.id
                        ? 'bg-[#0066cc]/10 text-[#0066cc]'
                        : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'
                    }`}
                  >
                    <span>{s.icon}</span>
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
