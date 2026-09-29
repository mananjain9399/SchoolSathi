import { LanguageCode } from '../../types';
import { SPEECH_LANG_TAGS } from '../speechService';
import { LanguageConfigService } from '../../config/languageConfig';

export type SpeechRecognitionErrorCode =
  | 'PERMISSION_DENIED'
  | 'NO_SPEECH'
  | 'RECOGNITION_FAILED'
  | 'NOT_SUPPORTED'
  | 'ABORTED';

export interface SpeechRecognitionError {
  code: SpeechRecognitionErrorCode;
  rawError?: any;
  message: string;
  localizedMessage?: Partial<Record<LanguageCode, string>>;
}

export interface SpeechRecognitionOptions {
  language: LanguageCode;
  onInterimResult?: (transcript: string) => void;
  onFinalResult?: (transcript: string) => void;
  onError?: (error: SpeechRecognitionError) => void;
  onStart?: () => void;
  onEnd?: () => void;
  noSpeechTimeoutMs?: number;
}

export interface ISpeechRecognitionProvider {
  name: string;
  isSupported(): boolean;
  start(options: SpeechRecognitionOptions): Promise<void> | void;
  stop(): Promise<void> | void;
  abort(): Promise<void> | void;
  isCurrentlyListening?(): boolean;
}

/**
 * Standard Web Speech API Recognition Provider (Client Browser)
 * Built with zero-leak lifecycle management, no-speech timeout,
 * and robust permission & error handling.
 */
export class WebSpeechRecognitionProvider implements ISpeechRecognitionProvider {
  public name = 'WebSpeechRecognitionProvider';
  private recognition: any = null;
  private isListening = false;
  private isStarting = false;
  private currentSessionId = 0;
  private noSpeechTimer: any = null;
  private silenceTimer: any = null;
  private hasReceivedSpeech = false;
  private lastTranscript = '';

  public isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    );
  }

  public isCurrentlyListening(): boolean {
    return this.isListening || this.isStarting;
  }

  private cleanupCurrentSession(): void {
    if (this.noSpeechTimer) {
      clearTimeout(this.noSpeechTimer);
      this.noSpeechTimer = null;
    }
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    if (this.recognition) {
      try {
        // Detach handlers to prevent zombie events
        this.recognition.onstart = null;
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.abort();
      } catch {
        // Safe ignore
      }
      this.recognition = null;
    }

    this.isListening = false;
    this.isStarting = false;
  }

  public start(options: SpeechRecognitionOptions): void {
    // 1. Terminate and cleanup any active sessions first
    this.cleanupCurrentSession();

    // 2. Increment session ID so any asynchronous trailing events are ignored
    const sessionId = ++this.currentSessionId;

    if (!this.isSupported()) {
      if (options.onError) {
        options.onError({
          code: 'NOT_SUPPORTED',
          message: 'Speech recognition is not supported in this browser.',
          localizedMessage: {
            en: 'Speech recognition is not supported in this browser.',
            hi: 'इस ब्राउज़र में स्पीच रिकॉग्निशन समर्थित नहीं है।',
          },
        });
      }
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    let rec: any;
    try {
      rec = new SpeechRecognition();
      this.recognition = rec;
    } catch (e: any) {
      this.cleanupCurrentSession();
      if (options.onError) {
        options.onError({
          code: 'RECOGNITION_FAILED',
          rawError: e,
          message: "I couldn't understand that. Please try again.",
          localizedMessage: {
            en: "I couldn't understand that. Please try again.",
            hi: 'मैं समझ नहीं सका। कृपया दोबारा प्रयास करें।',
          },
        });
      }
      return;
    }

    this.isStarting = true;
    this.hasReceivedSpeech = false;
    this.lastTranscript = '';
    const speechConfig = LanguageConfigService.getSpeechRecognitionConfig(options.language);
    rec.continuous = speechConfig.continuous;
    rec.interimResults = speechConfig.interimResults;
    rec.maxAlternatives = speechConfig.maxAlternatives;
    rec.lang = speechConfig.recognitionLang || SPEECH_LANG_TAGS[options.language] || 'hi-IN';

    // 3. No-speech timeout: if user taps microphone and says nothing within 7 seconds
    const timeoutMs = options.noSpeechTimeoutMs || 7000;
    this.noSpeechTimer = setTimeout(() => {
      if (sessionId !== this.currentSessionId) return;
      if (!this.hasReceivedSpeech) {
        this.cleanupCurrentSession();
        if (options.onError) {
          options.onError({
            code: 'NO_SPEECH',
            message: "I didn't hear anything. Please try again.",
            localizedMessage: {
              en: "I didn't hear anything. Please try again.",
              hi: 'मैंने कुछ नहीं सुना। कृपया दोबारा बोलें।',
            },
          });
        }
        if (options.onEnd) options.onEnd();
      }
    }, timeoutMs);

    rec.onstart = () => {
      if (sessionId !== this.currentSessionId) return;
      this.isStarting = false;
      this.isListening = true;
      if (options.onStart) options.onStart();
    };

    rec.onresult = (event: any) => {
      if (sessionId !== this.currentSessionId) return;
      this.hasReceivedSpeech = true;
      if (this.noSpeechTimer) {
        clearTimeout(this.noSpeechTimer);
        this.noSpeechTimer = null;
      }

      let interim = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        const text = item[0]?.transcript || '';
        if (item.isFinal) {
          finalTranscript += text;
        } else {
          interim += text;
        }
      }

      const activeText = (finalTranscript || interim).trim();
      if (activeText) {
        this.lastTranscript = activeText;
      }

      if (interim && options.onInterimResult) {
        options.onInterimResult(interim.trim());
      }

      if (finalTranscript) {
        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = null;
        }
        this.cleanupCurrentSession();
        if (options.onFinalResult) {
          options.onFinalResult(finalTranscript.trim());
        }
        if (options.onEnd) options.onEnd();
      } else if (interim) {
        // If user pauses after speaking, auto-commit after 1.8 seconds of silence
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
        this.silenceTimer = setTimeout(() => {
          if (sessionId !== this.currentSessionId) return;
          if (this.lastTranscript) {
            const committedText = this.lastTranscript;
            this.cleanupCurrentSession();
            if (options.onFinalResult) {
              options.onFinalResult(committedText);
            }
            if (options.onEnd) options.onEnd();
          }
        }, 1800);
      }
    };

    rec.onerror = (event: any) => {
      if (sessionId !== this.currentSessionId) return;
      const err = event.error;
      this.cleanupCurrentSession();

      if (err === 'not-allowed' || err === 'service-not-allowed') {
        if (options.onError) {
          options.onError({
            code: 'PERMISSION_DENIED',
            rawError: err,
            message: 'Microphone access is required to talk to SchoolSathi.',
            localizedMessage: {
              en: 'Microphone access is required to talk to SchoolSathi.',
              hi: 'स्कूलसाथी से बात करने के लिए माइक्रोफ़ोन की अनुमति आवश्यक है।',
            },
          });
        }
      } else if (err === 'no-speech') {
        if (options.onError) {
          options.onError({
            code: 'NO_SPEECH',
            rawError: err,
            message: "I didn't hear anything. Please try again.",
            localizedMessage: {
              en: "I didn't hear anything. Please try again.",
              hi: 'मैंने कुछ नहीं सुना। कृपया दोबारा बोलें।',
            },
          });
        }
      } else if (err === 'aborted') {
        if (options.onError) {
          options.onError({
            code: 'ABORTED',
            rawError: err,
            message: 'Listening cancelled.',
            localizedMessage: {
              en: 'Listening cancelled.',
              hi: 'सुनना रद्द कर दिया गया।',
            },
          });
        }
      } else {
        if (options.onError) {
          options.onError({
            code: 'RECOGNITION_FAILED',
            rawError: err,
            message: "I couldn't understand that. Please try again.",
            localizedMessage: {
              en: "I couldn't understand that. Please try again.",
              hi: 'मैं समझ नहीं सका। कृपया दोबारा प्रयास करें।',
            },
          });
        }
      }

      if (options.onEnd) options.onEnd();
    };

    rec.onend = () => {
      if (sessionId !== this.currentSessionId) return;
      const hadSpeech = this.hasReceivedSpeech;
      const lastText = this.lastTranscript;
      this.cleanupCurrentSession();

      if (hadSpeech && lastText) {
        if (options.onFinalResult) options.onFinalResult(lastText);
      } else if (!hadSpeech) {
        if (options.onError) {
          options.onError({
            code: 'NO_SPEECH',
            message: "I didn't hear anything. Please try again.",
            localizedMessage: {
              en: "I didn't hear anything. Please try again.",
              hi: 'मैंने कुछ नहीं सुना। कृपया दोबारा बोलें।',
            },
          });
        }
      }
      if (options.onEnd) options.onEnd();
    };

    try {
      rec.start();
    } catch (e: any) {
      this.cleanupCurrentSession();
      if (options.onError) {
        const isPerm = e?.name === 'NotAllowedError' || e?.message?.includes('not-allowed');
        options.onError({
          code: isPerm ? 'PERMISSION_DENIED' : 'RECOGNITION_FAILED',
          rawError: e,
          message: isPerm
            ? 'Microphone access is required to talk to SchoolSathi.'
            : "I couldn't understand that. Please try again.",
          localizedMessage: isPerm
            ? {
                en: 'Microphone access is required to talk to SchoolSathi.',
                hi: 'स्कूलसाथी से बात करने के लिए माइक्रोफ़ोन की अनुमति आवश्यक है।',
              }
            : {
                en: "I couldn't understand that. Please try again.",
                hi: 'मैं समझ नहीं सका। कृपया दोबारा प्रयास करें।',
              },
        });
      }
      if (options.onEnd) options.onEnd();
    }
  }

  public stop(): void {
    if (this.hasReceivedSpeech && this.lastTranscript && this.recognition) {
      // If speech was in flight, let it complete
      try {
        this.recognition.stop();
      } catch {
        this.cleanupCurrentSession();
      }
    } else {
      this.cleanupCurrentSession();
    }
  }

  public abort(): void {
    this.cleanupCurrentSession();
  }
}

/**
 * Simulated Speech Recognition Provider (supports automated tests, simulators, and headless browsers)
 */
export class SimulatedSpeechRecognitionProvider implements ISpeechRecognitionProvider {
  public name = 'SimulatedSpeechRecognitionProvider';
  private timer: any = null;
  private isListening = false;
  private simulationMode: 'normal' | 'permission_denied' | 'no_speech' | 'failure' = 'normal';
  private simulatedTranscript = '';

  public isSupported(): boolean {
    return true;
  }

  public isCurrentlyListening(): boolean {
    return this.isListening;
  }

  public setSimulationMode(
    mode: 'normal' | 'permission_denied' | 'no_speech' | 'failure',
    transcript?: string
  ): void {
    this.simulationMode = mode;
    if (transcript) this.simulatedTranscript = transcript;
  }

  public start(options: SpeechRecognitionOptions): void {
    this.stop();
    this.isListening = true;
    if (options.onStart) options.onStart();

    if (this.simulationMode === 'permission_denied') {
      this.timer = setTimeout(() => {
        this.isListening = false;
        options.onError?.({
          code: 'PERMISSION_DENIED',
          message: 'Microphone access is required to talk to SchoolSathi.',
          localizedMessage: {
            en: 'Microphone access is required to talk to SchoolSathi.',
            hi: 'स्कूलसाथी से बात करने के लिए माइक्रोफ़ोन की अनुमति आवश्यक है।',
          },
        });
        options.onEnd?.();
      }, 500);
      return;
    }

    if (this.simulationMode === 'no_speech') {
      this.timer = setTimeout(() => {
        this.isListening = false;
        options.onError?.({
          code: 'NO_SPEECH',
          message: "I didn't hear anything. Please try again.",
          localizedMessage: {
            en: "I didn't hear anything. Please try again.",
            hi: 'मैंने कुछ नहीं सुना। कृपया दोबारा बोलें।',
          },
        });
        options.onEnd?.();
      }, 1500);
      return;
    }

    if (this.simulationMode === 'failure') {
      this.timer = setTimeout(() => {
        this.isListening = false;
        options.onError?.({
          code: 'RECOGNITION_FAILED',
          message: "I couldn't understand that. Please try again.",
          localizedMessage: {
            en: "I couldn't understand that. Please try again.",
            hi: 'मैं समझ नहीं सका। कृपया दोबारा प्रयास करें।',
          },
        });
        options.onEnd?.();
      }, 800);
      return;
    }

    // Normal mode: simulate interim then final
    const textToSay =
      this.simulatedTranscript ||
      (options.language === 'en'
        ? "Kal Rohan ka homework kya hai?"
        : 'Kal Rohan ka homework kya hai?');

    this.timer = setTimeout(() => {
      if (options.onInterimResult) {
        options.onInterimResult(textToSay.split(' ').slice(0, 2).join(' '));
      }

      this.timer = setTimeout(() => {
        this.isListening = false;
        if (options.onFinalResult) {
          options.onFinalResult(textToSay);
        }
        if (options.onEnd) options.onEnd();
      }, 800);
    }, 600);
  }

  public stop(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.isListening = false;
  }

  public abort(): void {
    this.stop();
  }
}

/**
 * Speech Recognition Service singleton
 */
export class SpeechRecognitionService {
  private static provider: ISpeechRecognitionProvider = new WebSpeechRecognitionProvider();
  private static simulatedProvider: SimulatedSpeechRecognitionProvider = new SimulatedSpeechRecognitionProvider();

  public static setProvider(newProvider: ISpeechRecognitionProvider): void {
    if (this.provider) {
      this.provider.abort();
    }
    this.provider = newProvider;
  }

  public static getProvider(): ISpeechRecognitionProvider {
    return this.provider;
  }

  public static getProviderName(): string {
    return this.provider.name;
  }

  public static isSupported(): boolean {
    return this.provider.isSupported();
  }

  public static isCurrentlyListening(): boolean {
    return this.provider.isCurrentlyListening ? this.provider.isCurrentlyListening() : false;
  }

  public static startListening(options: SpeechRecognitionOptions): void {
    this.provider.start(options);
  }

  public static stopListening(): void {
    this.provider.stop();
  }

  public static abort(): void {
    this.provider.abort();
  }

  /**
   * Helper to trigger a simulated speech prompt or error for testing in headless or mic-less environments
   */
  public static triggerSimulatedSpeech(
    transcript: string,
    options: SpeechRecognitionOptions,
    mode: 'normal' | 'permission_denied' | 'no_speech' | 'failure' = 'normal'
  ): void {
    this.simulatedProvider.setSimulationMode(mode, transcript);
    this.simulatedProvider.start(options);
  }
}
