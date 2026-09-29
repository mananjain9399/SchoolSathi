import { LanguageCode } from '../../types';
import { SPEECH_LANG_TAGS } from '../speechService';

export interface TextToSpeechOptions {
  language: LanguageCode;
  speed?: 'slow' | 'normal';
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

export interface ITextToSpeechProvider {
  name: string;
  isSupported(): boolean;
  speak(text: string, options: TextToSpeechOptions): Promise<void>;
  stop(): void;
  pause?(): void;
  resume?(): void;
}

/**
 * Standard Web Speech Synthesis Provider (Client Browser)
 */
export class WebTextToSpeechProvider implements ITextToSpeechProvider {
  public name = 'WebTextToSpeechProvider';
  private synth: SpeechSynthesis | null =
    typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;

  public isSupported(): boolean {
    return !!this.synth;
  }

  public speak(text: string, options: TextToSpeechOptions): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        if (options.onEnd) options.onEnd();
        resolve();
        return;
      }

      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      const targetLang = SPEECH_LANG_TAGS[options.language] || 'hi-IN';
      utterance.lang = targetLang;

      // Rate speed: Slow = 0.8x for elders & clarity, Normal = 1.0x
      const defaultRate = options.speed === 'slow' ? 0.8 : 1.0;
      utterance.rate = options.rate !== undefined ? options.rate : defaultRate;
      utterance.pitch = options.pitch !== undefined ? options.pitch : 1.05;

      // Voice selection preference for Indian regional accents
      const voices = this.synth.getVoices();
      const matchedVoice = voices.find(
        (v) => v.lang.startsWith(targetLang) || v.lang.replace('_', '-').startsWith(targetLang)
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => {
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        if (options.onEnd) options.onEnd();
        resolve();
      };

      utterance.onerror = (e) => {
        if (options.onError) options.onError(e);
        resolve();
      };

      this.synth.speak(utterance);
    });
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public pause(): void {
    if (this.synth) {
      this.synth.pause();
    }
  }

  public resume(): void {
    if (this.synth) {
      this.synth.resume();
    }
  }
}

/**
 * Cloud Text-to-Speech Provider Stub (ElevenLabs / Google Cloud / Azure Neural)
 */
export class CloudTextToSpeechProvider implements ITextToSpeechProvider {
  public name = 'CloudTextToSpeechProvider';
  private fallbackProvider = new WebTextToSpeechProvider();

  public isSupported(): boolean {
    return true;
  }

  public async speak(text: string, options: TextToSpeechOptions): Promise<void> {
    // If no external cloud TTS key is supplied in environment, gracefully fall back to WebSpeech
    return this.fallbackProvider.speak(text, options);
  }

  public stop(): void {
    this.fallbackProvider.stop();
  }
}

/**
 * Text-to-Speech Service singleton with replaceable provider abstraction and state caching
 */
export class TextToSpeechService {
  private static provider: ITextToSpeechProvider = new WebTextToSpeechProvider();
  private static currentSpeed: 'slow' | 'normal' = 'normal';
  private static lastSpokenText = '';
  private static lastSpokenOptions: TextToSpeechOptions = { language: 'hi', speed: 'normal' };
  private static speaking = false;

  public static setProvider(newProvider: ITextToSpeechProvider): void {
    if (this.provider) {
      this.provider.stop();
    }
    this.provider = newProvider;
  }

  public static getProviderName(): string {
    return this.provider.name;
  }

  public static isSupported(): boolean {
    return this.provider.isSupported();
  }

  public static setSpeed(speed: 'slow' | 'normal'): void {
    this.currentSpeed = speed;
  }

  public static getSpeed(): 'slow' | 'normal' {
    return this.currentSpeed;
  }

  public static isSpeaking(): boolean {
    return this.speaking;
  }

  public static async speak(text: string, options: TextToSpeechOptions): Promise<void> {
    this.lastSpokenText = text;
    this.lastSpokenOptions = {
      ...options,
      speed: options.speed || this.currentSpeed,
    };

    this.speaking = true;

    const wrappedOptions: TextToSpeechOptions = {
      ...this.lastSpokenOptions,
      onStart: () => {
        this.speaking = true;
        if (options.onStart) options.onStart();
      },
      onEnd: () => {
        this.speaking = false;
        if (options.onEnd) options.onEnd();
      },
      onError: (e) => {
        this.speaking = false;
        if (options.onError) options.onError(e);
      },
    };

    await this.provider.speak(text, wrappedOptions);
  }

  public static stop(): void {
    this.speaking = false;
    this.provider.stop();
  }

  public static async replay(): Promise<void> {
    if (!this.lastSpokenText) return;
    await this.speak(this.lastSpokenText, this.lastSpokenOptions);
  }
}
