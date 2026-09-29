import { LanguageCode, VoiceSpeakOptions, VoiceOption, VoiceSettings } from '../../../types/index';
import { LanguageConfigService } from '../../../config/languageConfig';
import { SPEECH_LANG_TAGS } from '../../speechService';
import { IVoiceProvider } from './IVoiceProvider';
import { BrowserTTSProvider } from './BrowserTTSProvider';

export class RealisticTTSProvider implements IVoiceProvider {
  public name = 'RealisticTTSProvider';
  private fallbackProvider = new BrowserTTSProvider();
  private currentAudio: HTMLAudioElement | null = null;
  private currentBlobUrl: string | null = null;
  private isPlaying = false;

  public isSupported(): boolean {
    return true;
  }

  public async speak(
    text: string,
    options: VoiceSpeakOptions,
    settings: VoiceSettings
  ): Promise<void> {
    this.stop();

    const language = options.language || 'hi';
    const gender = options.gender || settings.gender || 'female';
    const speed = options.speed || settings.speed || 'normal';
    const style = options.style || settings.style || 'friendly';
    const voiceConfig = LanguageConfigService.getVoiceConfig(language, gender);

    // Speed mapping for audio element playback rate
    const speedRateMap = {
      slow: 0.8,
      normal: 1.0,
      fast: 1.25,
    };
    const targetPlaybackRate = speedRateMap[speed] || 1.0;

    try {
      // 1. Request secure server-side TTS endpoint
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language,
          gender,
          speed,
          style,
          cloudVoiceCode: voiceConfig.cloudVoiceCode,
        }),
      });

      if (!response.ok) {
        // Fall back gracefully to browser TTS
        return this.fallbackProvider.speak(text, options, settings);
      }

      const contentType = response.headers.get('content-type') || '';

      // Check if server returned raw audio stream/blob
      if (
        contentType.includes('audio/') ||
        contentType.includes('application/octet-stream')
      ) {
        const blob = await response.blob();
        return this.playAudioBlob(blob, targetPlaybackRate, options);
      }

      // Check if server returned JSON payload
      if (contentType.includes('application/json')) {
        const json = await response.json();

        if (json.audioBase64) {
          return this.playBase64Audio(
            json.audioBase64,
            json.mimeType || 'audio/mp3',
            targetPlaybackRate,
            options
          );
        }

        if (json.audioUrl) {
          return this.playAudioUrl(json.audioUrl, targetPlaybackRate, options);
        }

        // Server signaled fallback or no cloud key configured
        return this.fallbackProvider.speak(text, options, settings);
      }

      // Unknown response format -> fallback to browser
      return this.fallbackProvider.speak(text, options, settings);
    } catch {
      // Offline, network error, or server unavailable -> seamless browser fallback
      return this.fallbackProvider.speak(text, options, settings);
    }
  }

  public stop(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.src = '';
      } catch {
        // ignore
      }
      this.currentAudio = null;
    }
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
    this.isPlaying = false;
    this.fallbackProvider.stop();
  }

  public pause(): void {
    if (this.currentAudio && this.isPlaying) {
      this.currentAudio.pause();
    } else {
      this.fallbackProvider.pause();
    }
  }

  public resume(): void {
    if (this.currentAudio && !this.isPlaying) {
      this.currentAudio.play().catch(() => {});
    } else {
      this.fallbackProvider.resume();
    }
  }

  public getAvailableVoices(language?: LanguageCode): VoiceOption[] {
    const lang = language || 'hi';
    const langConfig = LanguageConfigService.getLanguageConfig(lang);
    const maleConfig = langConfig.maleVoice;
    const femaleConfig = langConfig.femaleVoice;

    const realisticFemale: VoiceOption = {
      id: `${lang}-realistic-female`,
      name: `Sathi Realistic Female (${langConfig.name} - ${femaleConfig.cloudVoiceCode})`,
      gender: 'female',
      language: lang,
      langTag: femaleConfig.langTag,
      isRealistic: true,
    };

    const realisticMale: VoiceOption = {
      id: `${lang}-realistic-male`,
      name: `Sathi Realistic Male (${langConfig.name} - ${maleConfig.cloudVoiceCode})`,
      gender: 'male',
      language: lang,
      langTag: maleConfig.langTag,
      isRealistic: true,
    };

    const browserVoices = this.fallbackProvider.getAvailableVoices(language);
    return [realisticFemale, realisticMale, ...browserVoices];
  }

  private playAudioBlob(
    blob: Blob,
    playbackRate: number,
    options: VoiceSpeakOptions
  ): Promise<void> {
    return new Promise((resolve) => {
      this.currentBlobUrl = URL.createObjectURL(blob);
      const audio = new Audio(this.currentBlobUrl);
      this.currentAudio = audio;
      audio.playbackRate = playbackRate;

      audio.onplay = () => {
        this.isPlaying = true;
        options.onStart?.();
      };

      audio.onended = () => {
        this.stop();
        options.onEnd?.();
        resolve();
      };

      audio.onerror = (e) => {
        this.stop();
        options.onError?.(e);
        resolve();
      };

      audio.play().catch((err) => {
        this.stop();
        options.onError?.(err);
        resolve();
      });
    });
  }

  private playBase64Audio(
    base64Data: string,
    mimeType: string,
    playbackRate: number,
    options: VoiceSpeakOptions
  ): Promise<void> {
    return new Promise((resolve) => {
      const src = `data:${mimeType};base64,${base64Data}`;
      const audio = new Audio(src);
      this.currentAudio = audio;
      audio.playbackRate = playbackRate;

      audio.onplay = () => {
        this.isPlaying = true;
        options.onStart?.();
      };

      audio.onended = () => {
        this.stop();
        options.onEnd?.();
        resolve();
      };

      audio.onerror = (e) => {
        this.stop();
        options.onError?.(e);
        resolve();
      };

      audio.play().catch((err) => {
        this.stop();
        options.onError?.(err);
        resolve();
      });
    });
  }

  private playAudioUrl(
    url: string,
    playbackRate: number,
    options: VoiceSpeakOptions
  ): Promise<void> {
    return new Promise((resolve) => {
      const audio = new Audio(url);
      this.currentAudio = audio;
      audio.playbackRate = playbackRate;

      audio.onplay = () => {
        this.isPlaying = true;
        options.onStart?.();
      };

      audio.onended = () => {
        this.stop();
        options.onEnd?.();
        resolve();
      };

      audio.onerror = (e) => {
        this.stop();
        options.onError?.(e);
        resolve();
      };

      audio.play().catch((err) => {
        this.stop();
        options.onError?.(err);
        resolve();
      });
    });
  }
}
