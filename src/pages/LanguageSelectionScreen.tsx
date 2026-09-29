import React, { useState } from 'react';
import { Check, Volume2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';
import { LanguageCode, ScreenId } from '../types';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '../data/languages';
import { SpeechService } from '../services/speechService';

interface LanguageSelectionScreenProps {
  currentLanguage: LanguageCode;
  onSelectLanguage: (code: LanguageCode) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({
  currentLanguage,
  onSelectLanguage,
  onNavigate,
}) => {
  const [selected, setSelected] = useState<LanguageCode>(currentLanguage);
  const t = TRANSLATIONS[selected];

  const handlePreviewAudio = (code: LanguageCode, e: React.MouseEvent) => {
    e.stopPropagation();
    const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
    if (lang) {
      SpeechService.speak(lang.sampleAudioText, code);
    }
  };

  const handleCardClick = (code: LanguageCode) => {
    setSelected(code);
    const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
    if (lang) {
      SpeechService.speak(lang.greeting, code);
    }
  };

  const handleConfirm = () => {
    onSelectLanguage(selected);
    onNavigate('register');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onNavigate('welcome')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-2 rounded-xl border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
          Step 1 of 5
        </span>
      </div>

      {/* Screen Title & Subtitle */}
      <div className="text-center mb-5">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {t.selectLanguageTitle}
        </h2>
        <p className="text-sm text-slate-600 mt-1 font-medium">
          {t.selectLanguageSub}
        </p>
      </div>

      {/* 8 Indian Languages Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = selected === lang.code;
          return (
            <div
              key={lang.code}
              onClick={() => handleCardClick(lang.code)}
              className={`relative p-4 rounded-3xl border-3 cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[105px] select-none active:scale-95 ${
                isSelected
                  ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg shadow-orange-500/15 ring-2 ring-orange-200'
                  : 'border-slate-200 hover:border-orange-300 bg-white hover:bg-orange-50/30 shadow-xs'
              }`}
            >
              {/* Native Script Title */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">
                    {lang.name}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {lang.englishName}
                  </span>
                </div>

                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : (
                  <button
                    onClick={(e) => handlePreviewAudio(lang.code, e)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-orange-600 hover:bg-orange-100 transition-colors"
                    title={`Listen sample in ${lang.englishName}`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Sample audio cue */}
              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
                <span className="text-xs text-orange-700 font-bold truncate">
                  "{lang.greeting}"
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation CTA */}
      <div className="space-y-3">
        <Button
          variant="primary"
          size="xl"
          fullWidth
          icon={<ArrowRight className="w-6 h-6" />}
          iconPosition="right"
          onClick={handleConfirm}
        >
          {t.confirmLanguage}
        </Button>

        <p className="text-center text-xs text-slate-400">
          💡 You can change this language anytime from Settings.
        </p>
      </div>
    </div>
  );
};
