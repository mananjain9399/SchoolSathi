import { LanguageCode } from '../../types';

export interface LanguageDetectionResult {
  language: LanguageCode;
  confidence: number;
  detectedScript?: string;
  matchedKeywords?: string[];
  provider: string;
}

export interface ILanguageDetectionProvider {
  name: string;
  detectLanguage(
    text: string,
    fallback?: LanguageCode
  ): Promise<LanguageDetectionResult> | LanguageDetectionResult;
}

/**
 * Robust Local Heuristic Language Detection Provider
 * Supports 8 Indian priority languages:
 * 1. Hindi (hi)
 * 2. English (en)
 * 3. Marathi (mr)
 * 4. Punjabi (pa)
 * 5. Bengali (bn)
 * 6. Tamil (ta)
 * 7. Telugu (te)
 * 8. Gujarati (gu)
 * 
 * Uses Unicode script boundaries + lexical token markers for Romanized/Hinglish speech.
 */
export class HeuristicLanguageDetectionProvider implements ILanguageDetectionProvider {
  public name = 'HeuristicScriptAndLexicalDetector';

  // Specific lexical markers for Indian languages in Latin/Romanized script
  private static HINGLISH_KEYWORDS = [
    'kal', 'aaj', 'kya', 'hai', 'hain', 'karna', 'bachcho', 'bachche', 'chhutti',
    'chhuttiya', 'pariksha', 'hazari', 'upasthiti', 'kaise', 'kaisa', 'kaisi', 'batao', 'bataiye',
    'kaam', 'kitne', 'tarikh', 'samay', 'kiska', 'kaun', 'padhai', 'ank',
    'mera', 'meri', 'mere', 'dono', 'sab', 'sabhi', 'agle', 'agla', 'agli', 'din', 'kab',
    'ka', 'ki', 'ke', 'uske', 'iski', 'iske', 'baad', 'wala', 'wali', 'wale', 'hoga', 'hogi'
  ];

  private static MARATHI_KEYWORDS = [
    'ahe', 'aahe', 'kadhi', 'gruhpath', 'shalechi', 'shala', 'kasa', 'kashi',
    'sang', 'sanga', 'aajar', 'hajar', 'mulache', 'mulachya', 'suṭṭi', 'pariksha',
    'kitva', 'aamhi', 'tumhi', 'kay', 'udya', 'rohancha', 'rohanchi', 'rohanche',
    'rohanla', 'mulaga', 'mulgi'
  ];

  private static PUNJABI_KEYWORDS = [
    'kiddan', 'kadon', 'kithe', 'satsriakal', 'sat sri akal', 'bachian', 'kam',
    'daso', 'imtihaan', 'chhuttiya', 'hazaari', 'kive', 'sada', 'tuhada',
    'kallh', 'rohan da', 'rohan di', 'hovega'
  ];

  private static BENGALI_KEYWORDS = [
    'kobe', 'poriksha', 'chuti', 'kemon', 'bolun', 'asche', 'amar',
    'tomar', 'shona', 'shune', 'kothay', 'keno', 'achhe', 'agamikal',
    'rohaner', 'barir kaj', 'ki'
  ];

  private static TAMIL_KEYWORDS = [
    'eppothu', 'veettuppadam', 'thervu', 'yenna', 'solla', 'solli', 'vandha',
    'vidumurai', 'pasanga', 'palli', 'kaal', 'naalai', 'rohanin', 'rohanukku',
    'indru', 'enna'
  ];

  private static TELUGU_KEYWORDS = [
    'eppudu', 'entha', 'homewerk', 'pariksha', 'selavu', 'cheppandi', 'undi',
    'unnadu', 'vachada', 'pillalu', 'badhi', 'repu', 'rohan ki', 'nedu', 'emiti', 'enti'
  ];

  private static GUJARATI_KEYWORDS = [
    'kyare', 'lesan', 'chhe', 'kevi', 'rajao', 'raja', 'aavshe', 'maro',
    'mari', 'tamaro', 'balak', 'shala', 'kale', 'kaal', 'rohanno', 'rohannu',
    'rohanne', 'shu', 'su'
  ];

  private static ENGLISH_KEYWORDS = [
    'what', 'when', 'where', 'how', 'why', 'who', 'homework', 'exam', 'exams',
    'holiday', 'holidays', 'tomorrow', 'today', 'attendance', 'marks', 'grade',
    'progress', 'report', 'card', 'timetable', 'schedule', 'teacher', 'school',
    'notice', 'circular', 'period', 'both', 'all', 'children', 'kids', 'present',
    'absent', 'bus', 'test', 'result', 'syllabus'
  ];

  public detectLanguage(text: string, fallback: LanguageCode = 'hi'): LanguageDetectionResult {
    const raw = (text || '').trim();
    if (!raw) {
      return {
        language: fallback,
        confidence: 0.1,
        provider: this.name,
      };
    }

    // 1. Unicode Script Range Check
    // Gurmukhi (Punjabi): \u0A00-\u0A7F
    if (/[\u0A00-\u0A7F]/.test(raw)) {
      return {
        language: 'pa',
        confidence: 0.98,
        detectedScript: 'Gurmukhi',
        provider: this.name,
      };
    }

    // Bengali / Assamese: \u0980-\u09FF
    if (/[\u0980-\u09FF]/.test(raw)) {
      return {
        language: 'bn',
        confidence: 0.98,
        detectedScript: 'Bengali',
        provider: this.name,
      };
    }

    // Tamil: \u0B80-\u0BFF
    if (/[\u0B80-\u0BFF]/.test(raw)) {
      return {
        language: 'ta',
        confidence: 0.98,
        detectedScript: 'Tamil',
        provider: this.name,
      };
    }

    // Telugu: \u0C00-\u0C7F
    if (/[\u0C00-\u0C7F]/.test(raw)) {
      return {
        language: 'te',
        confidence: 0.98,
        detectedScript: 'Telugu',
        provider: this.name,
      };
    }

    // Gujarati: \u0A80-\u0AFF
    if (/[\u0A80-\u0AFF]/.test(raw)) {
      return {
        language: 'gu',
        confidence: 0.98,
        detectedScript: 'Gujarati',
        provider: this.name,
      };
    }

    // Devanagari Script (Hindi vs Marathi): \u0900-\u097F
    if (/[\u0900-\u097F]/.test(raw)) {
      const marathiDevanagariMarkers = [
        'आहे', 'कधी', 'गृहपाठ', 'मुलाच्या', 'मुलाचा', 'मुलाचे', 'हजर', 'नाही', 'काय', 'शाळेत',
        'शाळा', 'परीक्षेची', 'आम्हाला', 'कसा', 'कशी', 'सांगा', 'झाला', 'झाली',
        'उद्या', 'रोहनचा', 'रोहनची', 'रोहनचे', 'रोहनला', 'अभ्यास', 'सुट्टी', 'वेळापत्रक'
      ];
      const hasMarathiMarker = marathiDevanagariMarkers.some((m) => raw.includes(m));
      if (hasMarathiMarker) {
        return {
          language: 'mr',
          confidence: 0.95,
          detectedScript: 'Devanagari (Marathi)',
          provider: this.name,
        };
      }
      return {
        language: 'hi',
        confidence: 0.95,
        detectedScript: 'Devanagari (Hindi)',
        provider: this.name,
      };
    }

    // 2. Latin / Romanized Indian Language (Hinglish/English/etc.) Check
    const lower = raw.toLowerCase();
    const words = lower.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

    let hiScore = 0;
    let enScore = 0;
    let mrScore = 0;
    let paScore = 0;
    let bnScore = 0;
    let taScore = 0;
    let teScore = 0;
    let guScore = 0;

    const matchedWords: string[] = [];

    for (const w of words) {
      if (HeuristicLanguageDetectionProvider.ENGLISH_KEYWORDS.includes(w)) {
        enScore += 1.5;
        matchedWords.push(`en:${w}`);
      }
      if (HeuristicLanguageDetectionProvider.HINGLISH_KEYWORDS.includes(w)) {
        hiScore += 2;
        matchedWords.push(`hi:${w}`);
      }
      if (HeuristicLanguageDetectionProvider.MARATHI_KEYWORDS.includes(w)) {
        mrScore += 2.5;
        matchedWords.push(`mr:${w}`);
      }
      if (HeuristicLanguageDetectionProvider.PUNJABI_KEYWORDS.includes(w)) {
        paScore += 2.5;
        matchedWords.push(`pa:${w}`);
      }
      if (HeuristicLanguageDetectionProvider.BENGALI_KEYWORDS.includes(w)) {
        bnScore += 2.5;
        matchedWords.push(`bn:${w}`);
      }
      if (HeuristicLanguageDetectionProvider.TAMIL_KEYWORDS.includes(w)) {
        taScore += 2.5;
        matchedWords.push(`ta:${w}`);
      }
      if (HeuristicLanguageDetectionProvider.TELUGU_KEYWORDS.includes(w)) {
        teScore += 2.5;
        matchedWords.push(`te:${w}`);
      }
      if (HeuristicLanguageDetectionProvider.GUJARATI_KEYWORDS.includes(w)) {
        guScore += 2.5;
        matchedWords.push(`gu:${w}`);
      }
    }

    const scores: { lang: LanguageCode; score: number }[] = [
      { lang: 'hi', score: hiScore },
      { lang: 'en', score: enScore },
      { lang: 'mr', score: mrScore },
      { lang: 'pa', score: paScore },
      { lang: 'bn', score: bnScore },
      { lang: 'ta', score: taScore },
      { lang: 'te', score: teScore },
      { lang: 'gu', score: guScore },
    ];

    scores.sort((a, b) => b.score - a.score);
    const top = scores[0];

    if (top.score > 0) {
      return {
        language: top.lang,
        confidence: Math.min(0.95, 0.5 + top.score * 0.1),
        detectedScript: 'Latin/Transliterated',
        matchedKeywords: matchedWords,
        provider: this.name,
      };
    }

    // Default fallback
    return {
      language: fallback,
      confidence: 0.4,
      detectedScript: 'Unknown',
      provider: this.name,
    };
  }
}

/**
 * Cloud Language Detection Provider Stub (ready for Google Cloud / Azure / OpenAI detection)
 */
export class CloudLanguageDetectionProvider implements ILanguageDetectionProvider {
  public name = 'CloudLanguageDetectionProvider';
  private fallbackProvider = new HeuristicLanguageDetectionProvider();

  public async detectLanguage(text: string, fallback: LanguageCode = 'hi'): Promise<LanguageDetectionResult> {
    const apiKey = (import.meta as any).env?.VITE_AI_API_KEY;
    if (!apiKey) {
      // Gracefully fall back to local heuristic provider
      return this.fallbackProvider.detectLanguage(text, fallback);
    }

    try {
      // Stub for external cloud detection API call
      return this.fallbackProvider.detectLanguage(text, fallback);
    } catch {
      return this.fallbackProvider.detectLanguage(text, fallback);
    }
  }
}

/**
 * Singleton Language Detection Service with replaceable provider abstraction
 */
export class LanguageDetectionService {
  private static provider: ILanguageDetectionProvider = new HeuristicLanguageDetectionProvider();

  public static setProvider(newProvider: ILanguageDetectionProvider): void {
    this.provider = newProvider;
  }

  public static getProviderName(): string {
    return this.provider.name;
  }

  public static async detect(text: string, fallback: LanguageCode = 'hi'): Promise<LanguageDetectionResult> {
    return Promise.resolve(this.provider.detectLanguage(text, fallback));
  }
}
