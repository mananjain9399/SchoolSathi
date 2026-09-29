import {
  LanguageCode,
  VoiceGender,
  VoiceSpeed,
  VoiceStyle,
  VoiceProviderType,
  VoiceSettings,
  VoiceOption,
  VoiceSpeakOptions,
} from '../../types/index';
import { IVoiceProvider } from './providers/IVoiceProvider';
import { BrowserTTSProvider } from './providers/BrowserTTSProvider';
import { RealisticTTSProvider } from './providers/RealisticTTSProvider';

const STORAGE_KEY = 'schoolsathi_voice_settings';

const DEFAULT_SETTINGS: VoiceSettings = {
  gender: 'female',
  speed: 'normal',
  style: 'friendly',
  provider: 'realistic',
};

type VoiceListener = (settings: VoiceSettings) => void;

export class VoiceService {
  private static browserProvider: IVoiceProvider = new BrowserTTSProvider();
  private static realisticProvider: IVoiceProvider = new RealisticTTSProvider();
  private static customProvider: IVoiceProvider | null = null;
  private static settings: VoiceSettings = VoiceService.loadSettings();
  private static speaking = false;
  private static listeners: Set<VoiceListener> = new Set();

  private static loadSettings(): VoiceSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          gender: parsed.gender === 'male' ? 'male' : 'female',
          speed: ['slow', 'normal', 'fast'].includes(parsed.speed) ? parsed.speed : 'normal',
          style: parsed.style === 'calm' ? 'calm' : 'friendly',
          provider: parsed.provider === 'browser' ? 'browser' : 'realistic',
        };
      }
    } catch {
      // safe fallback
    }
    return DEFAULT_SETTINGS;
  }

  private static saveSettings(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // safe fallback
    }
    this.notifyListeners();
  }

  private static notifyListeners(): void {
    this.listeners.forEach((l) => {
      try {
        l({ ...this.settings });
      } catch {
        // ignore
      }
    });
  }

  public static subscribe(listener: VoiceListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public static getActiveProvider(): IVoiceProvider {
    if (this.customProvider) return this.customProvider;
    if (this.settings.provider === 'browser') return this.browserProvider;
    return this.realisticProvider;
  }

  public static setCustomProvider(provider: IVoiceProvider): void {
    if (this.speaking) {
      this.stop();
    }
    this.customProvider = provider;
  }

  public static getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  public static updateSettings(partial: Partial<VoiceSettings>): void {
    this.settings = {
      ...this.settings,
      ...partial,
    };
    this.saveSettings();
  }

  public static setGender(gender: VoiceGender): void {
    this.updateSettings({ gender });
  }

  public static setSpeed(speed: VoiceSpeed): void {
    this.updateSettings({ speed });
  }

  public static setStyle(style: VoiceStyle): void {
    this.updateSettings({ style });
  }

  public static setProvider(provider: VoiceProviderType): void {
    this.updateSettings({ provider });
  }

  public static isSpeaking(): boolean {
    return this.speaking;
  }

  /**
   * Speak speech with preemption:
   * When a new question or speech starts, stop the previous speech first!
   */
  public static async speak(text: string, options?: VoiceSpeakOptions): Promise<void> {
    // Crucial requirement: Stop previous speech first!
    this.stop();

    if (!text || !text.trim()) return;

    this.speaking = true;
    const provider = this.getActiveProvider();

    const mergedOptions: VoiceSpeakOptions = {
      ...options,
      gender: options?.gender || this.settings.gender,
      speed: options?.speed || this.settings.speed,
      style: options?.style || this.settings.style,
      onStart: () => {
        this.speaking = true;
        options?.onStart?.();
      },
      onEnd: () => {
        this.speaking = false;
        options?.onEnd?.();
      },
      onError: (err) => {
        this.speaking = false;
        options?.onError?.(err);
      },
    };

    try {
      await provider.speak(text, mergedOptions, this.settings);
    } finally {
      this.speaking = false;
    }
  }

  public static stop(): void {
    this.speaking = false;
    if (this.customProvider) {
      try { this.customProvider.stop(); } catch {}
    }
    try { this.realisticProvider.stop(); } catch {}
    try { this.browserProvider.stop(); } catch {}
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
  }

  public static pause(): void {
    const provider = this.getActiveProvider();
    provider.pause?.();
  }

  public static resume(): void {
    const provider = this.getActiveProvider();
    provider.resume?.();
  }

  /**
   * Natural voice preview for the chosen voice configuration
   */
  public static async preview(
    customText?: string,
    overrideSettings?: Partial<VoiceSettings>,
    language?: LanguageCode
  ): Promise<void> {
    const activeLang = language || 'hi';
    const effectiveSettings: VoiceSettings = {
      ...this.settings,
      ...overrideSettings,
    };

    const previewTexts: Record<LanguageCode, string> = {
      hi: effectiveSettings.gender === 'female'
        ? 'नमस्ते! मैं आपका स्कूलसाथी हूँ। मैं आपकी सहायता के लिए तैयार हूँ।'
        : 'नमस्ते! मैं आपका स्कूलसाथी हूँ। बच्चों के स्कूल अपडेट्स के लिए मैं यहाँ हूँ।',
      en: effectiveSettings.gender === 'female'
        ? 'Hello! I am your SchoolSathi companion. How can I help you with school updates today?'
        : "Hello! I am your SchoolSathi assistant. How can I help with your child's school records today?",
      mr: 'नमस्कार! मी तुमचा शाळासोबती आहे. मुलांच्या शाळेच्या माहितीसाठी मी सदैव तयार आहे.',
      pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਸਕੂਲਸਾਥੀ ਹਾਂ। ਬੱਚਿਆਂ ਦੀ ਸਕੂਲੀ ਜਾਣਕਾਰੀ ਲਈ ਮੈਂ ਇੱਥੇ ਹਾਂ।',
      bn: 'নমস্কার! আমি আপনার স্কুলসাথী। স্কুলের যাবতীয় তথ্যের জন্য আমি প্রস্তুত।',
      ta: 'வணக்கம்! நான் உங்கள் பள்ளித்தோழன். பள்ளி விவரங்களை அறிய நான் தயார்.',
      te: 'నమస్కారం! నేను మీ స్కూల్‌సాథిని. పాఠశాల సమాచారం కోసం నేను సిద్ధంగా ఉన్నాను.',
      gu: 'નમસ્તે! હું તમારો શાળાસાથી છું. શાળાની માહિતી માટે હું તમારી સાથે છું.',
    };

    const textToSpeak = customText || previewTexts[activeLang] || previewTexts.hi;

    const provider =
      effectiveSettings.provider === 'browser'
        ? this.browserProvider
        : this.realisticProvider;

    this.stop();
    this.speaking = true;

    try {
      await provider.speak(
        textToSpeak,
        {
          language: activeLang,
          gender: effectiveSettings.gender,
          speed: effectiveSettings.speed,
          style: effectiveSettings.style,
          onStart: () => { this.speaking = true; },
          onEnd: () => { this.speaking = false; },
          onError: () => { this.speaking = false; },
        },
        effectiveSettings
      );
    } finally {
      this.speaking = false;
    }
  }

  public static getAvailableVoices(language?: LanguageCode): VoiceOption[] {
    const provider = this.getActiveProvider();
    return provider.getAvailableVoices(language);
  }
}
