import React, { useEffect } from 'react';
import { ArrowRight, Volume2, Sparkles, ShieldCheck, Heart, MessageSquare } from 'lucide-react';
import { Avatar } from '../components/avatar/Avatar';
import { Button } from '../components/common/Button';
import { LanguageCode, ScreenId, Student, AvatarPersona } from '../types';
import { TRANSLATIONS } from '../data/languages';
import { SpeechService } from '../services/speechService';

interface SchoolSathiIntroScreenProps {
  language: LanguageCode;
  onNavigate: (screen: ScreenId) => void;
  student?: Student | null;
  parentName?: string;
  avatarPersona?: AvatarPersona;
}

export const SchoolSathiIntroScreen: React.FC<SchoolSathiIntroScreenProps> = ({
  language,
  onNavigate,
  student,
  parentName = 'Parent',
  avatarPersona = 'auto',
}) => {
  const t = TRANSLATIONS[language];
  const childName = (student?.name || student?.fullName || 'Rohan').split(' ')[0];

  useEffect(() => {
    // Play warm welcome message on entry
    const introMsg =
      language === 'hi'
        ? `नमस्ते ${parentName}! मैं स्कूलसाथी हूँ। ${childName} के स्कूल की हर जरूरी जानकारी मैं आपको बोलकर बताऊंगा।`
        : `Hello ${parentName}! I am SchoolSathi. I will help you with all school updates for ${childName}.`;
    SpeechService.speak(introMsg, language);
  }, []);

  const handleStartSpeaking = () => {
    onNavigate('main-companion');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-5 text-center flex flex-col justify-between min-h-[85vh]">
      {/* Top Badge */}
      <div className="flex flex-col items-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-2xs mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Child Verified with School Records</span>
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {language === 'hi' ? 'मिलिए अपने स्कूलसाथी से!' : 'Meet your SchoolSathi!'}
        </h2>
        <p className="text-sm text-slate-600 font-medium mt-1">
          {language === 'hi'
            ? `${childName} के स्कूल की जानकारी अब आपकी भाषा में`
            : `Your voice companion for ${childName}'s school updates`}
        </p>
      </div>

      {/* Center: Friendly Interactive Avatar Character */}
      <div className="my-4 flex flex-col items-center">
        <div className="relative cursor-pointer" onClick={() => SpeechService.speak(`नमस्ते ${parentName}! मैं आपकी मदद के लिए तैयार हूँ। बस माइक का बटन दबाएं और पूछें!`, language)}>
          <Avatar
            state="happy"
            persona={avatarPersona}
            currentStudent={student}
            size="xl"
            showStateBadge={true}
          />
        </div>

        {/* What You Can Ask Examples */}
        <div className="w-full mt-4 bg-orange-50/70 border border-orange-200/80 rounded-2xl p-3.5 text-left">
          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-900 mb-2">
            <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
            <span>{language === 'hi' ? 'आप ऐसे सीधे बोलकर पूछ सकते हैं:' : 'You can naturally ask things like:'}</span>
          </div>

          <div className="space-y-1.5">
            {[
              language === 'hi' ? `"${childName} का कल का होमवर्क क्या है?"` : `"What is ${childName}'s homework for tomorrow?"`,
              language === 'hi' ? `"${childName} का एग्जाम कब है?"` : `"When is ${childName}'s next exam?"`,
              language === 'hi' ? `"${childName} की आज की अटेंडेंस बताओ"` : `"Check ${childName}'s attendance today"`,
            ].map((example, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-xl border border-orange-100 text-xs font-semibold text-slate-700 shadow-2xs"
              >
                <span className="text-orange-500">🎤</span>
                <span>{example}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA Button */}
      <div className="space-y-2 pt-2">
        <Button
          variant="primary"
          size="xl"
          fullWidth
          icon={<ArrowRight className="w-6 h-6" />}
          iconPosition="right"
          onClick={handleStartSpeaking}
        >
          {language === 'hi' ? 'साथी से बात करें' : 'Talk to SchoolSathi'}
        </Button>
        <p className="text-[11px] text-slate-400 font-medium">
          {language === 'hi'
            ? 'बिना किसी टाइपिंग के सीधे अपनी आवाज़ में पूछें'
            : 'Voice-first assistance • No complicated menus'}
        </p>
      </div>
    </div>
  );
};
