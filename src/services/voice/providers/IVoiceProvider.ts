import { LanguageCode, VoiceSpeakOptions, VoiceOption, VoiceSettings } from '../../../types/index';

export interface IVoiceProvider {
  name: string;
  isSupported(): boolean;
  speak(text: string, options: VoiceSpeakOptions, settings: VoiceSettings): Promise<void>;
  stop(): void;
  pause?(): void;
  resume?(): void;
  getAvailableVoices(language?: LanguageCode): VoiceOption[];
}
