import { LanguageCode, VoiceSpeakOptions, VoiceOption, VoiceSettings } from '../../../types/index';
import { LanguageConfigService } from '../../../config/languageConfig';
import { IVoiceProvider } from './IVoiceProvider';

export class BrowserTTSProvider implements IVoiceProvider {
  public name = 'BrowserTTSProvider';
  private synth: SpeechSynthesis | null =
    typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private keepAliveTimer: any = null;

  public isSupported(): boolean {
    return !!this.synth;
  }

  public speak(text: string, options: VoiceSpeakOptions, settings: VoiceSettings): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        options.onEnd?.();
        resolve();
        return;
      }

      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      const targetLanguage = options.language || 'hi';
      const gender = options.gender || settings.gender || 'female';
      const speed = options.speed || settings.speed || 'normal';
      const style = options.style || settings.style || 'friendly';

      const voiceConfig = LanguageConfigService.getVoiceConfig(targetLanguage, gender);
      const fallbackConfig = LanguageConfigService.getFallbackVoiceConfig(targetLanguage, gender);

      // 1. Rate modulation based on speed and language baseline
      const rateMap = {
        slow: 0.78,
        normal: voiceConfig.rate || 0.98,
        fast: 1.24,
      };
      utterance.rate = options.rate !== undefined ? options.rate : (rateMap[speed] || 0.98);

      // 2. Pitch modulation based on gender, style, and baseline
      if (options.pitch !== undefined) {
        utterance.pitch = options.pitch;
      } else {
        const basePitch = voiceConfig.pitch || (gender === 'female' ? 1.18 : 0.92);
        if (gender === 'female') {
          utterance.pitch = style === 'friendly' ? basePitch : basePitch - 0.08;
        } else {
          utterance.pitch = style === 'friendly' ? basePitch : basePitch - 0.08;
        }
      }

      // 3. Voice matching with configured fallback architecture
      const voices = this.synth.getVoices();
      const matchResult = this.pickBestVoice(voices, targetLanguage, gender);
      if (matchResult.voice) {
        utterance.voice = matchResult.voice;
        utterance.lang =
          matchResult.voice.lang ||
          (matchResult.fallbackUsed ? fallbackConfig.langTag : voiceConfig.langTag);
      } else {
        utterance.lang = voiceConfig.langTag;
      }

      // Chromium keep-alive timer for longer utterances
      this.clearKeepAlive();
      this.keepAliveTimer = setInterval(() => {
        if (this.synth?.speaking && !this.synth.paused) {
          this.synth.pause();
          this.synth.resume();
        }
      }, 10000);

      utterance.onstart = () => {
        options.onStart?.();
      };

      utterance.onend = () => {
        this.clearKeepAlive();
        this.currentUtterance = null;
        options.onEnd?.();
        resolve();
      };

      utterance.onerror = (e) => {
        this.clearKeepAlive();
        this.currentUtterance = null;
        options.onError?.(e);
        resolve();
      };

      try {
        this.synth.speak(utterance);
      } catch (err) {
        this.clearKeepAlive();
        this.currentUtterance = null;
        options.onError?.(err);
        resolve();
      }
    });
  }

  public stop(): void {
    this.clearKeepAlive();
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // safe ignore
      }
    }
    this.currentUtterance = null;
  }

  public pause(): void {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  public resume(): void {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public getAvailableVoices(language?: LanguageCode): VoiceOption[] {
    const lang = language || 'hi';
    const langConfig = LanguageConfigService.getLanguageConfig(lang);
    const maleConfig = langConfig.maleVoice;
    const femaleConfig = langConfig.femaleVoice;

    const defaultFemale: VoiceOption = {
      id: `${lang}-browser-female`,
      name: `${langConfig.name} Female Voice (${femaleConfig.langTag})`,
      gender: 'female',
      language: lang,
      langTag: femaleConfig.langTag,
      isRealistic: false,
    };

    const defaultMale: VoiceOption = {
      id: `${lang}-browser-male`,
      name: `${langConfig.name} Male Voice (${maleConfig.langTag})`,
      gender: 'male',
      language: lang,
      langTag: maleConfig.langTag,
      isRealistic: false,
    };

    if (!this.synth) {
      return [defaultFemale, defaultMale];
    }

    const sysVoices = this.synth.getVoices();
    const langVoices = sysVoices.filter(
      (v) =>
        v.lang.startsWith(femaleConfig.langTag) ||
        v.lang.replace('_', '-').startsWith(femaleConfig.langTag)
    );

    if (langVoices.length === 0) {
      return [defaultFemale, defaultMale];
    }

    const options: VoiceOption[] = [];
    for (const v of langVoices) {
      const isMale = this.isMaleVoiceName(v.name);
      options.push({
        id: v.voiceURI || v.name,
        name: `${v.name} (${isMale ? 'Male' : 'Female'})`,
        gender: isMale ? 'male' : 'female',
        language: lang,
        langTag: v.lang,
        isRealistic: false,
      });
    }

    // Ensure both female and male are represented
    if (!options.some((o) => o.gender === 'female')) options.unshift(defaultFemale);
    if (!options.some((o) => o.gender === 'male')) options.push(defaultMale);

    return options;
  }

  private pickBestVoice(
    voices: SpeechSynthesisVoice[],
    targetLanguage: LanguageCode,
    targetGender: 'female' | 'male'
  ): { voice: SpeechSynthesisVoice | null; fallbackUsed: boolean } {
    if (!voices || voices.length === 0) return { voice: null, fallbackUsed: false };

    const voiceConfig = LanguageConfigService.getVoiceConfig(targetLanguage, targetGender);
    const fallbackConfig = LanguageConfigService.getFallbackVoiceConfig(targetLanguage, targetGender);

    // 1. Try preferred voice names for target language
    for (const prefName of voiceConfig.preferredVoiceNames) {
      const match = voices.find((v) => v.name.toLowerCase().includes(prefName.toLowerCase()));
      if (match) return { voice: match, fallbackUsed: false };
    }

    // 2. Try target language tag
    const langVoices = voices.filter(
      (v) =>
        v.lang.startsWith(voiceConfig.langTag) ||
        v.lang.replace('_', '-').startsWith(voiceConfig.langTag)
    );
    if (langVoices.length > 0) {
      const genderMatch = this.filterByGender(langVoices, targetGender);
      return { voice: genderMatch || langVoices[0], fallbackUsed: false };
    }

    // 3. Fallback voice configuration (e.g. Hindi or Indian English)
    for (const prefName of fallbackConfig.preferredVoiceNames) {
      const match = voices.find((v) => v.name.toLowerCase().includes(prefName.toLowerCase()));
      if (match) return { voice: match, fallbackUsed: true };
    }

    const fallbackLangVoices = voices.filter(
      (v) =>
        v.lang.startsWith(fallbackConfig.langTag) ||
        v.lang.replace('_', '-').startsWith(fallbackConfig.langTag)
    );
    if (fallbackLangVoices.length > 0) {
      const genderMatch = this.filterByGender(fallbackLangVoices, targetGender);
      return { voice: genderMatch || fallbackLangVoices[0], fallbackUsed: true };
    }

    // 4. Any Indian voice fallback
    const indianVoices = voices.filter((v) => v.lang.includes('IN') || v.lang.includes('hi'));
    if (indianVoices.length > 0) {
      const genderMatch = this.filterByGender(indianVoices, targetGender);
      return { voice: genderMatch || indianVoices[0], fallbackUsed: true };
    }

    return { voice: null, fallbackUsed: true };
  }

  private filterByGender(
    voices: SpeechSynthesisVoice[],
    targetGender: 'female' | 'male'
  ): SpeechSynthesisVoice | null {
    for (const v of voices) {
      const isMale = this.isMaleVoiceName(v.name);
      if (targetGender === 'male' && isMale) return v;
      if (targetGender === 'female' && !isMale) return v;
    }
    return null;
  }

  private isMaleVoiceName(name: string): boolean {
    const lower = name.toLowerCase();
    const maleKeywords = [
      'male',
      'madhur',
      'ravi',
      'prabhat',
      'hemant',
      'david',
      'mark',
      'george',
      'guy',
      'man',
      'kumar',
      'amit',
      'manohar',
      'niranjan',
      'gurpreet',
      'bashkar',
      'valluvar',
      'mohan',
    ];
    return maleKeywords.some((k) => lower.includes(k));
  }

  private clearKeepAlive(): void {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }
}
