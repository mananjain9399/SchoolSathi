import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Play,
  Square,
  Sparkles,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  LanguageCode,
  VoiceGender,
  VoiceSpeed,
  VoiceStyle,
  VoiceProviderType,
  VoiceSettings,
} from '../../types';
import { VoiceService } from '../../services/voice/VoiceService';

interface VoiceSettingsCardProps {
  language?: LanguageCode;
  className?: string;
  showTitle?: boolean;
  onSettingsChanged?: (settings: VoiceSettings) => void;
}

export const VoiceSettingsCard: React.FC<VoiceSettingsCardProps> = ({
  language = 'hi',
  className = '',
  showTitle = true,
  onSettingsChanged,
}) => {
  const [settings, setSettings] = useState<VoiceSettings>(() => VoiceService.getSettings());
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewLang, setPreviewLang] = useState<LanguageCode>(language);

  useEffect(() => {
    setPreviewLang(language);
  }, [language]);

  useEffect(() => {
    const unsubscribe = VoiceService.subscribe((newSettings) => {
      setSettings(newSettings);
      onSettingsChanged?.(newSettings);
    });
    return unsubscribe;
  }, [onSettingsChanged]);

  const handleGenderChange = (gender: VoiceGender) => {
    VoiceService.setGender(gender);
    setSettings((prev) => ({ ...prev, gender }));
  };

  const handleSpeedChange = (speed: VoiceSpeed) => {
    VoiceService.setSpeed(speed);
    setSettings((prev) => ({ ...prev, speed }));
  };

  const handleStyleChange = (style: VoiceStyle) => {
    VoiceService.setStyle(style);
    setSettings((prev) => ({ ...prev, style }));
  };

  const handleProviderChange = (provider: VoiceProviderType) => {
    VoiceService.setProvider(provider);
    setSettings((prev) => ({ ...prev, provider }));
  };

  const handlePreview = async () => {
    if (isPlayingPreview) {
      VoiceService.stop();
      setIsPlayingPreview(false);
      return;
    }

    setIsPlayingPreview(true);
    try {
      await VoiceService.preview(undefined, settings, previewLang);
    } finally {
      setIsPlayingPreview(false);
    }
  };

  const handleStop = () => {
    VoiceService.stop();
    setIsPlayingPreview(false);
  };

  return (
    <div
      className={`bg-white rounded-3xl p-5 border border-orange-100 shadow-sm space-y-4 ${className}`}
      id="voice-settings-card"
    >
      {/* Header */}
      {showTitle && (
        <div className="flex items-center justify-between border-b border-orange-100/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Voice Settings
              </h3>
              <p className="text-[11px] text-slate-500">
                Customize SchoolSathi's speech voice & style
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Preview Lang:
            </span>
            <button
              onClick={() => setPreviewLang('hi')}
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                previewLang === 'hi' ? 'bg-orange-500 text-white' : 'text-slate-600'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setPreviewLang('en')}
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                previewLang === 'en' ? 'bg-orange-500 text-white' : 'text-slate-600'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      )}

      {/* 1. Voice (Gender): Female / Male */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <span>Voice</span>
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Female Option */}
          <label
            onClick={() => handleGenderChange('female')}
            className={`flex items-center gap-2.5 p-3 rounded-2xl border-2 transition-all cursor-pointer ${
              settings.gender === 'female'
                ? 'border-orange-500 bg-orange-50/70 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
            id="voice-gender-female"
          >
            <input
              type="radio"
              name="voiceGender"
              value="female"
              checked={settings.gender === 'female'}
              onChange={() => handleGenderChange('female')}
              className="accent-orange-500 w-4 h-4 cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-xs font-black text-slate-900 block">
                Female (महिला)
              </span>
              <span className="text-[10px] text-slate-500">
                Warm & encouraging
              </span>
            </div>
            <span className="text-base">👩</span>
          </label>

          {/* Male Option */}
          <label
            onClick={() => handleGenderChange('male')}
            className={`flex items-center gap-2.5 p-3 rounded-2xl border-2 transition-all cursor-pointer ${
              settings.gender === 'male'
                ? 'border-orange-500 bg-orange-50/70 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
            id="voice-gender-male"
          >
            <input
              type="radio"
              name="voiceGender"
              value="male"
              checked={settings.gender === 'male'}
              onChange={() => handleGenderChange('male')}
              className="accent-orange-500 w-4 h-4 cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-xs font-black text-slate-900 block">
                Male (पुरुष)
              </span>
              <span className="text-[10px] text-slate-500">
                Gentle & clear
              </span>
            </div>
            <span className="text-base">👨</span>
          </label>
        </div>
      </div>

      {/* 2. Speed: Slow / Normal / Fast */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <span>Speed</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {/* Slow */}
          <label
            onClick={() => handleSpeedChange('slow')}
            className={`flex items-center gap-2 p-2.5 rounded-2xl border-2 transition-all cursor-pointer ${
              settings.speed === 'slow'
                ? 'border-orange-500 bg-orange-50/70 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
            id="voice-speed-slow"
          >
            <input
              type="radio"
              name="voiceSpeed"
              value="slow"
              checked={settings.speed === 'slow'}
              onChange={() => handleSpeedChange('slow')}
              className="accent-orange-500 w-3.5 h-3.5 cursor-pointer"
            />
            <div>
              <span className="text-xs font-black text-slate-900 block">
                Slow
              </span>
              <span className="text-[10px] text-slate-500 block">
                0.8x
              </span>
            </div>
          </label>

          {/* Normal */}
          <label
            onClick={() => handleSpeedChange('normal')}
            className={`flex items-center gap-2 p-2.5 rounded-2xl border-2 transition-all cursor-pointer ${
              settings.speed === 'normal'
                ? 'border-orange-500 bg-orange-50/70 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
            id="voice-speed-normal"
          >
            <input
              type="radio"
              name="voiceSpeed"
              value="normal"
              checked={settings.speed === 'normal'}
              onChange={() => handleSpeedChange('normal')}
              className="accent-orange-500 w-3.5 h-3.5 cursor-pointer"
            />
            <div>
              <span className="text-xs font-black text-slate-900 block">
                Normal
              </span>
              <span className="text-[10px] text-slate-500 block">
                1.0x
              </span>
            </div>
          </label>

          {/* Fast */}
          <label
            onClick={() => handleSpeedChange('fast')}
            className={`flex items-center gap-2 p-2.5 rounded-2xl border-2 transition-all cursor-pointer ${
              settings.speed === 'fast'
                ? 'border-orange-500 bg-orange-50/70 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
            id="voice-speed-fast"
          >
            <input
              type="radio"
              name="voiceSpeed"
              value="fast"
              checked={settings.speed === 'fast'}
              onChange={() => handleSpeedChange('fast')}
              className="accent-orange-500 w-3.5 h-3.5 cursor-pointer"
            />
            <div>
              <span className="text-xs font-black text-slate-900 block">
                Fast
              </span>
              <span className="text-[10px] text-slate-500 block">
                1.25x
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* 3. Style: Friendly / Calm */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <span>Style</span>
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Friendly */}
          <label
            onClick={() => handleStyleChange('friendly')}
            className={`flex items-center gap-2.5 p-3 rounded-2xl border-2 transition-all cursor-pointer ${
              settings.style === 'friendly'
                ? 'border-orange-500 bg-orange-50/70 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
            id="voice-style-friendly"
          >
            <input
              type="radio"
              name="voiceStyle"
              value="friendly"
              checked={settings.style === 'friendly'}
              onChange={() => handleStyleChange('friendly')}
              className="accent-orange-500 w-4 h-4 cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-xs font-black text-slate-900 block">
                Friendly (मित्रवत)
              </span>
              <span className="text-[10px] text-slate-500">
                Warm & cheerful
              </span>
            </div>
            <span className="text-base">😊</span>
          </label>

          {/* Calm */}
          <label
            onClick={() => handleStyleChange('calm')}
            className={`flex items-center gap-2.5 p-3 rounded-2xl border-2 transition-all cursor-pointer ${
              settings.style === 'calm'
                ? 'border-orange-500 bg-orange-50/70 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
            id="voice-style-calm"
          >
            <input
              type="radio"
              name="voiceStyle"
              value="calm"
              checked={settings.style === 'calm'}
              onChange={() => handleStyleChange('calm')}
              className="accent-orange-500 w-4 h-4 cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-xs font-black text-slate-900 block">
                Calm (शांत)
              </span>
              <span className="text-[10px] text-slate-500">
                Relaxed & gentle
              </span>
            </div>
            <span className="text-base">🧘</span>
          </label>
        </div>
      </div>

      {/* 4. Provider: Realistic Neural vs Browser */}
      <div className="space-y-1.5 pt-1 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-600">
            Audio Provider Engine
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {settings.provider === 'realistic' ? '✨ Realistic Neural' : '🌐 Browser Native'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleProviderChange('realistic')}
            className={`py-1.5 px-2.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
              settings.provider === 'realistic'
                ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            Realistic Neural (Server)
          </button>
          <button
            type="button"
            onClick={() => handleProviderChange('browser')}
            className={`py-1.5 px-2.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
              settings.provider === 'browser'
                ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            Browser TTS Fallback
          </button>
        </div>
      </div>

      {/* 5. Preview Voice Button */}
      <div className="pt-2 border-t border-orange-100/80 flex items-center gap-2">
        <button
          onClick={handlePreview}
          className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer ${
            isPlayingPreview
              ? 'bg-emerald-600 text-white shadow-emerald-500/30 animate-pulse'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25'
          }`}
          id="preview-voice-button"
        >
          {isPlayingPreview ? (
            <>
              <Square className="w-4 h-4 fill-white animate-spin" />
              <span>Speaking Preview... (Tap to Stop)</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>▶ Preview Voice</span>
            </>
          )}
        </button>

        {isPlayingPreview && (
          <button
            onClick={handleStop}
            className="py-3 px-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
            id="stop-speaking-button"
            title="Stop speaking"
          >
            <Square className="w-4 h-4 fill-rose-600 text-rose-600" />
          </button>
        )}
      </div>
    </div>
  );
};
