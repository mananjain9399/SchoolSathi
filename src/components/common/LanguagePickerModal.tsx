import React from 'react';
import { Check, Volume2, X } from 'lucide-react';
import { LanguageCode } from '../../types';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '../../data/languages';
import { SpeechService } from '../../services/speechService';

interface LanguagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: LanguageCode;
  onSelectLanguage: (code: LanguageCode) => void;
}

export const LanguagePickerModal: React.FC<LanguagePickerModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onSelectLanguage,
}) => {
  if (!isOpen) return null;

  const handlePlaySample = (code: LanguageCode, e: React.MouseEvent) => {
    e.stopPropagation();
    const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
    if (lang) {
      SpeechService.speak(lang.sampleAudioText, code);
    }
  };

  const handleSelect = (code: LanguageCode) => {
    onSelectLanguage(code);
    const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
    if (lang) {
      SpeechService.speak(lang.greeting, code);
    }
    onClose();
  };

  const t = TRANSLATIONS[currentLanguage];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-orange-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-extrabold text-slate-800">
              {t.selectLanguageTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose your comfortable language
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Grid */}
        <div className="grid grid-cols-2 gap-3 py-4 overflow-y-auto">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLanguage;
            return (
              <div
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-150 flex flex-col justify-between min-h-[92px] active:scale-95 ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/80 shadow-md shadow-orange-500/10'
                    : 'border-slate-200 hover:border-orange-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-lg font-bold text-slate-900">
                    {lang.name}
                  </span>
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <button
                      onClick={(e) => handlePlaySample(lang.code, e)}
                      title={`Listen ${lang.englishName}`}
                      className="p-1 rounded-full text-slate-400 hover:text-orange-600 hover:bg-orange-100/50"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                  <span>{lang.englishName}</span>
                  <span className="text-[10px] text-orange-600 font-semibold">
                    {lang.greeting.slice(0, 10)}...
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>🔊 Tap speaker to hear sample voice</span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-orange-600 hover:bg-orange-50 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
