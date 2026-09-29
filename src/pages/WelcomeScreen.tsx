import React from 'react';
import { Volume2, Sparkles, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { Avatar } from '../components/avatar/Avatar';
import { Button } from '../components/common/Button';
import { LanguageCode, ScreenId } from '../types';
import { TRANSLATIONS } from '../data/languages';
import { SpeechService } from '../services/speechService';

interface WelcomeScreenProps {
  language: LanguageCode;
  onNavigate: (screen: ScreenId) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  language,
  onNavigate,
}) => {
  const t = TRANSLATIONS[language];

  const handleSpeakWelcome = () => {
    SpeechService.speak(
      `नमस्ते! स्कूलसाथी में आपका स्वागत है। आपके बच्चे का स्कूल, आपकी भाषा, आपका साथी। शुरू करने के लिए नीचे दिए गए बटन को छुएं।`,
      language
    );
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-between items-center px-4 py-6 text-center max-w-md mx-auto">
      {/* Top Badge */}
      <div className="flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100/80 text-orange-800 text-xs font-bold border border-orange-200 shadow-xs mb-3">
          <Sparkles className="w-3.5 h-3.5 text-orange-600 animate-spin" />
          <span>Multilingual Voice AI</span>
        </div>

        {/* Brand Name & Tagline */}
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent">
          SchoolSathi
        </h1>

        <p className="mt-2 text-base sm:text-lg text-slate-600 font-medium max-w-xs leading-relaxed">
          {t.brandTagline}
        </p>
      </div>

      {/* Center: Large Animated Sathi Character */}
      <div className="my-6 relative flex flex-col items-center">
        <div className="relative group cursor-pointer" onClick={handleSpeakWelcome}>
          <Avatar state="happy" size="xl" showStateBadge={false} />
          {/* Subtle click prompt for audio */}
          <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-orange-700 text-xs font-bold shadow-xs border border-orange-200 hover:bg-orange-50 transition-colors">
            <Volume2 className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
            <span>Tap to hear Sathi speak</span>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified School Data
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-rose-500" /> 100% Free for Parents
          </span>
        </div>
      </div>

      {/* Bottom CTA Area */}
      <div className="w-full space-y-3">
        <Button
          variant="primary"
          size="xl"
          fullWidth
          icon={<ArrowRight className="w-6 h-6" />}
          iconPosition="right"
          onClick={() => onNavigate('language')}
        >
          {t.letsBegin}
        </Button>

        {/* Secondary small option: "Already registered? Login" */}
        <div className="pt-1">
          <p className="text-sm text-slate-500">
            {t.alreadyRegistered}{' '}
            <button
              onClick={() => onNavigate('login')}
              className="font-bold text-orange-600 hover:text-orange-700 underline cursor-pointer"
            >
              {t.login}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
