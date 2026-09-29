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
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-orange-100/80 px-4 py-2.5 transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('main-companion')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <span className="text-xl">🦉</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                SchoolSathi
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 uppercase tracking-wider">
                AI Voice
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold active:scale-95 transition-all"
            aria-label="Listen to audio guidance for this screen"
          >
            <Volume2 className="w-4 h-4 text-amber-600 animate-pulse" />
            <span className="hidden md:inline">Audio Guide</span>
          </button>

          {/* Language Switcher Badge (Hidden on Main Companion to keep hero screen clutter-free) */}
          {currentScreen !== 'main-companion' && (
            <button
              onClick={onOpenLanguageModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-950 border border-orange-200 text-xs font-bold active:scale-95 transition-all shadow-xs"
              aria-label="Change language"
            >
              <Globe className="w-4 h-4 text-orange-600" />
              <span className="font-extrabold text-orange-700">{currentLangObj.name}</span>
            </button>
          )}

          {/* School Admin Portal Shortcut */}
          <button
            onClick={() => onNavigate('admin')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold active:scale-95 transition-all shadow-xs cursor-pointer"
            title="Open School Admin & Teacher Portal"
          >
            <span>🏫</span>
            <span className="hidden sm:inline">School Admin</span>
          </button>

          {/* Screen Switcher Quick Menu */}
          <div className="relative group">
            <button
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              title="Quick navigate all screens"
            >
              <Navigation className="w-4 h-4 text-slate-600" />
              <span className="hidden lg:inline text-slate-700">Screens</span>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-1.5 w-64 py-2 bg-white rounded-2xl shadow-2xl border border-slate-200 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
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
                    className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center gap-2 transition-colors ${
                      currentScreen === s.id
                        ? 'bg-orange-50 text-orange-700 font-bold border-l-4 border-orange-500'
                        : 'text-slate-700 hover:bg-slate-50'
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
