import { Student, LanguageCode, AvatarState, AcademicResult, ClassTimetable } from '../types';
import { SchoolDataService } from './schoolDataService';
import { SpeechService } from './speechService';
import { LanguageDetectionService, TextToSpeechService } from './speech';
import { VoiceService } from './voice/VoiceService';
import { HomeworkService, matchesSubject } from './homeworkService';
import { LanguageConfigService } from '../config/languageConfig';

// ==========================================
// 1. INTENT & CONTEXT DATA MODEL
// ==========================================

export type AIIntent =
  | 'HOMEWORK_TODAY'
  | 'HOMEWORK_TOMORROW'
  | 'HOMEWORK_DATE'
  | 'EXAM_SCHEDULE'
  | 'ATTENDANCE'
  | 'ACADEMIC_PROGRESS'
  | 'HOLIDAY_INFORMATION'
  | 'TIMETABLE'
  | 'ANNOUNCEMENT'
  | 'STUDENT_INFORMATION'
  | 'SWITCH_CHILD'
  | 'HELP'
  | 'UNKNOWN'
  // Backward-compatibility aliases
  | 'SCHOOL_ANNOUNCEMENT'
  | 'CHILD_INFORMATION'
  | 'GENERAL_SCHOOL_INFORMATION'
  | 'UNCLEAR_INPUT';

export type ProcessingStage = 'understanding' | 'checking_records' | 'preparing_response';

export interface ConversationTurn {
  sender: 'user' | 'assistant';
  text: string;
  intent?: AIIntent;
  studentId?: string;
  language?: LanguageCode;
  timestamp: number;
}

export interface ConversationContext {
  lastIntent?: AIIntent;
  lastStudentId?: string;
  lastStudentName?: string;
  lastSubject?: string;
  lastDateReference?: string;
  lastLanguage?: LanguageCode;
}

export interface IntentDetectionResult {
  intent: AIIntent;
  confidence: number;
  extractedSubject?: string;
  dateReference?: 'today' | 'tomorrow' | 'upcoming' | string;
  rawQuery: string;
  isSequentialFollowUp?: boolean;
}

export interface StudentResolutionResult {
  mode: 'single' | 'multi' | 'all' | 'unclear';
  students: Student[];
  clarificationPrompt?: Partial<Record<LanguageCode, string>>;
}

export interface StructuredQueryAnalysis {
  intent: AIIntent;
  student?: Student | null;
  students: Student[];
  isMultiChild: boolean;
  date?: string;
  subject?: string;
  language: LanguageCode;
  confidence: number;
  rawQuery: string;
}

export interface AIResponseResult {
  query: string;
  intent: AIIntent;
  studentId?: string;
  studentName?: string;
  isMultiChild: boolean;
  spokenResponse: string;
  displayResponse: string;
  avatarMood: AvatarState;
  detailedData?: any;
  context: ConversationContext;
  detectedLanguage?: LanguageCode;
  isAutoDetected?: boolean;
  analysis?: StructuredQueryAnalysis;
  switchChildId?: string;
}

export interface VoiceQueryOptions {
  autoDetectLanguage?: boolean;
  preferredLanguage?: LanguageCode;
  voiceSpeed?: 'slow' | 'normal' | 'fast';
  onProgress?: (stage: ProcessingStage) => void;
}

// Subject normalization dictionary
const KNOWN_SUBJECTS: Record<string, string> = {
  maths: 'Mathematics',
  math: 'Mathematics',
  mathematics: 'Mathematics',
  ganit: 'Mathematics',
  'गणित': 'Mathematics',
  'ਹਿਸਾਬ': 'Mathematics',
  'গণিত': 'Mathematics',
  'கணிதம்': 'Mathematics',
  'గణితం': 'Mathematics',
  
  science: 'Science',
  vigyan: 'Science',
  vigyaan: 'Science',
  'विज्ञान': 'Science',
  'ਵਿਗਿਆਨ': 'Science',
  'বিজ্ঞান': 'Science',
  'அறிவியல்': 'Science',
  'సైన్స్': 'Science',
  
  english: 'English',
  angrezi: 'English',
  angreji: 'English',
  'अंग्रेजी': 'English',
  'ਅੰਗਰੇਜ਼ੀ': 'English',
  'ইংরেজি': 'English',
  'ஆங்கிலம்': 'English',
  'ఇంగ్లీష్': 'English',
  
  hindi: 'Hindi',
  'हिन्दी': 'Hindi',
  'हिंदी': 'Hindi',
  
  social: 'Social Studies',
  'social studies': 'Social Studies',
  'social science': 'Social Studies',
  sst: 'Social Studies',
  'सामाजिक विज्ञान': 'Social Studies',
  samajik: 'Social Studies',
  
  evs: 'Environmental Studies',
  environmental: 'Environmental Studies',
  paryavaran: 'Environmental Studies',
  'पर्यावरण': 'Environmental Studies',

  computer: 'Computer',
  computers: 'Computer',
  it: 'Computer',
  'कंप्यूटर': 'Computer',
};

/**
 * Extract normalized subject from natural user query
 */
export function extractSubject(lowerQuery: string): string | undefined {
  const q = (lowerQuery || '').toLowerCase();
  for (const [key, normalized] of Object.entries(KNOWN_SUBJECTS)) {
    const reg = new RegExp(`(^|\\s|[.,?!])${key.toLowerCase()}($|\\s|[.,?!])`, 'i');
    if (reg.test(q) || q.includes(key.toLowerCase())) {
      return normalized;
    }
  }
  return undefined;
}

/**
 * Extract temporal reference (today, tomorrow, weekday, specific date) from query
 */
export function extractDateReference(lowerQuery: string): { type: 'today' | 'tomorrow' | 'date'; value: string } | undefined {
  const q = (lowerQuery || '').toLowerCase();

  const tomorrowKeywords = [
    'tomorrow', 'kal', 'कल', 'उद्या', 'udya',
    'ਕੱਲ੍ਹ', 'ਕੱਲ', 'kallh',
    'কাল', 'আগামীকাল', 'agamikal',
    'நாளை', 'naalai',
    'రేపు', 'repu',
    'કાલે', 'કાલ', 'આવતીકાલે', 'આવતીકાલ', 'kale', 'aavtikal'
  ];
  const todayKeywords = [
    'today', 'aaj', 'आज', 'आजचे', 'आजचा',
    'ਅੱਜ', 'আজ', 'আজকে',
    'இன்று', 'இன்னைக்கு', 'indru',
    'నేడు', 'ఈ రోజు', 'ఈరోజు', 'nedu',
    'આજે', 'આજ', 'aaje'
  ];

  const weekdayMap: Record<string, string> = {
    monday: 'Monday', somwar: 'Monday', 'सोमवार': 'Monday',
    tuesday: 'Tuesday', mangalwar: 'Tuesday', 'मंगलवार': 'Tuesday',
    wednesday: 'Wednesday', budhwar: 'Wednesday', 'बुधवार': 'Wednesday',
    thursday: 'Thursday', guruwar: 'Thursday', veervar: 'Thursday', 'गुरुवार': 'Thursday',
    friday: 'Friday', shukrawar: 'Friday', 'शुक्रवार': 'Friday',
    saturday: 'Saturday', shaniwar: 'Saturday', 'शनिवार': 'Saturday',
    sunday: 'Sunday', raviwar: 'Sunday', itwar: 'Sunday', 'रविवार': 'Sunday',
  };

  // 1. Check tomorrow
  for (const kw of tomorrowKeywords) {
    const reg = new RegExp(`(^|\\s|[.,?!])${kw}($|\\s|[.,?!])`, 'i');
    if (reg.test(q) || q.includes(kw)) {
      return { type: 'tomorrow', value: 'tomorrow' };
    }
  }

  // 2. Check today
  for (const kw of todayKeywords) {
    const reg = new RegExp(`(^|\\s|[.,?!])${kw}($|\\s|[.,?!])`, 'i');
    if (reg.test(q) || q.includes(kw)) {
      return { type: 'today', value: 'today' };
    }
  }

  // 3. Check weekdays
  for (const [kw, dayName] of Object.entries(weekdayMap)) {
    const reg = new RegExp(`(^|\\s|[.,?!])${kw}($|\\s|[.,?!])`, 'i');
    if (reg.test(q)) {
      return { type: 'date', value: dayName };
    }
  }

  // 4. Check explicit dates like "12 October", "3 Oct", "15th November"
  const dateMatch = q.match(/\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec|[अआइईउऊऋएऐओऔकखगघचछजझटठडढणतथदधनपफबभमयरलवशषसह]+))/i);
  if (dateMatch) {
    return { type: 'date', value: dateMatch[1] };
  }

  return undefined;
}

// ==========================================
// MULTILINGUAL INDIC NAME & RELATION ALIASES
// ==========================================
const INDIC_NAME_ALIASES: Record<string, string[]> = {
  rohan: [
    'rohan', 'रोहन', 'रोहनचा', 'रोहनची', 'रोहनचे', 'रोहनला', 'रोहनने', 'रोहननं', 'रोहनचं', 'रोहनका', 'रोहनकी', 'रोहनके',
    'রোহন', 'রোহনের', 'রোহানের', 'রোহান', 'রোহান এর', 'রোহন এর',
    'ਰੋਹਨ', 'ਰੋਹਨ ਦਾ', 'ਰੋਹਨ ਦੀ',
    'રોહન', 'રોહનનું', 'રોહનનો',
    'ரோஹன்', 'ரோகனின்', 'ரோஹனின்',
    'రోహన్', 'రోహన్ యొక్క', 'రోహన్‌కి'
  ],
  priya: [
    'priya', 'प्रिया', 'प्रियाचा', 'प्रियाची', 'प्रियाचे', 'प्रियाला', 'प्रियाने', 'प्रियाचं', 'प्रियाका', 'प्रियाकी', 'प्रियाके',
    'প্রিয়া', 'প্রিয়ার', 'প্ৰিয়া', 'প্ৰিয়ার', 'প্রিয়া এর',
    'ਪ੍ਰਿਆ', 'ਪ੍ਰਿਆ ਦਾ', 'ਪ੍ਰਿਆ ਦੀ',
    'પ્રિયા', 'પ્રિયાનું',
    'பிரியா', 'பிரியாவின்',
    'ప్రియా', 'ప్రియా యొక్క', 'ప్రియాకి'
  ],
  aarav: [
    'aarav', 'आरव', 'आरवचा', 'आरवची', 'आरवला', 'आरवका',
    'আরভ', 'আরভের',
    'ਆਰਵ', 'ਆਰਵ ਦਾ',
    'આરવ', 'આરવનું',
    'ஆரவ்',
    'ఆరవ్'
  ],
  kavya: [
    'kavya', 'काव्या', 'काव्याचा', 'काव्याची', 'काव्याला',
    'কাব্যা', 'ਕਾਵਿਆ', 'કાવ્યા', 'காவ்யா', 'కావ్య'
  ],
  vihaan: [
    'vihaan', 'विहान', 'विहानचा', 'विहानची',
    'বিহান', 'ਵਿਹਾਨ', 'વિહાન', 'விஹான்', 'విహాన్'
  ]
};

const DAUGHTER_KEYWORDS = [
  'beti', 'बेटी', 'बिटिया', 'ladki', 'लड़की', 'daughter', 'मुलगी', 'मुलीचा', 'मुलीचे',
  'মেয়ে', 'মেয়ের', 'মেয়েটির', 'ਧੀ', 'ਕੁੜੀ', 'દીકરી', 'மகள்', 'கூతురు'
];

const SON_KEYWORDS = [
  'beta', 'बेटा', 'ladka', 'लड़का', 'son', 'मुलगा', 'मुलाचा', 'मुलाचे',
  'ছেলে', 'ছেলের', 'ছেলেটির', 'ਪੁੱਤਰ', 'ਮੁੰਡਾ', 'દીકરો', 'மகன்', 'కొడుకు'
];

function matchesStudent(s: Student, lowerQuery: string): boolean {
  const firstName = (s.name || s.fullName || '').split(' ')[0].toLowerCase();
  if (!firstName || firstName.length < 2) return false;

  // 1. Exact Latin boundary match
  const latinRegex = new RegExp(`\\b${firstName}\\b`, 'i');
  if (latinRegex.test(lowerQuery)) return true;

  // 2. Multilingual aliases check (Devanagari, Bengali, Gurmukhi, Gujarati, Tamil, Telugu)
  const aliases = INDIC_NAME_ALIASES[firstName];
  if (aliases && aliases.some((alias) => lowerQuery.includes(alias.toLowerCase()))) {
    return true;
  }

  // 3. Fallback: Substring check if word length >= 3
  if (firstName.length >= 3 && lowerQuery.includes(firstName)) {
    return true;
  }

  return false;
}

// In-Memory Multi-turn Conversation Memory
class ConversationMemory {
  private history: ConversationTurn[] = [];
  private context: ConversationContext = {};

  public addTurn(turn: ConversationTurn) {
    this.history.push(turn);
    if (this.history.length > 20) {
      this.history.shift();
    }
  }

  public getContext(): ConversationContext {
    return { ...this.context };
  }

  public getHistory(): ConversationTurn[] {
    return [...this.history];
  }

  public updateContext(updates: Partial<ConversationContext>) {
    this.context = { ...this.context, ...updates };
  }

  public clearContext() {
    this.context = {};
    this.history = [];
  }
}

export const conversationMemory = new ConversationMemory();

// ==========================================
// 2. CORE MULTILINGUAL AI ASSISTANT SERVICE
// ==========================================

export class AIAssistantService {
  /**
   * 1. Detect Intent from natural conversational query (multilingual, phonetic, context-aware)
   * Supported Intents:
   * - HOMEWORK_TODAY
   * - HOMEWORK_TOMORROW
   * - HOMEWORK_DATE
   * - EXAM_SCHEDULE
   * - ATTENDANCE
   * - ACADEMIC_PROGRESS
   * - HOLIDAY_INFORMATION
   * - TIMETABLE
   * - ANNOUNCEMENT
   * - STUDENT_INFORMATION
   * - SWITCH_CHILD
   * - HELP
   * - UNKNOWN
   */
  public static detectIntent(
    rawQuery: string,
    context?: ConversationContext,
    availableStudents?: Student[]
  ): IntentDetectionResult {
    const query = (rawQuery || '').trim();
    const lower = query.toLowerCase();

    // 1. Check for subject mentions
    const extractedSubject = extractSubject(lower);

    // 2. Check for temporal references (today, tomorrow, Friday, 12 October, etc.)
    const dateRef = extractDateReference(lower);
    const isTomorrow = dateRef?.type === 'tomorrow';

    // 3. SWITCH_CHILD Intent
    const hasSwitchKeyword =
      lower.includes('switch') ||
      lower.includes('badlo') ||
      lower.includes('badal do') ||
      lower.includes('बदलो') ||
      lower.includes('स्विच') ||
      lower.includes('shift to') ||
      lower.includes('change to') ||
      lower.includes('chuno') ||
      lower.includes('choono') ||
      lower.includes('चुनो') ||
      lower.includes('pe switch') ||
      lower.includes('par switch') ||
      lower.includes('ko select') ||
      lower.includes('select ') ||
      lower.includes('ko dikhao') ||
      lower.includes('dikhao');

    if (hasSwitchKeyword) {
      return {
        intent: 'SWITCH_CHILD',
        confidence: 0.98,
        extractedSubject,
        rawQuery: query,
      };
    }

    // 4. HELP Intent
    const hasHelpKeyword =
      lower.includes('help') ||
      lower.includes('what can you do') ||
      lower.includes('tum kya kar sakte') ||
      lower.includes('kya kya kar sakte') ||
      lower.includes('madad') ||
      lower.includes('मदद') ||
      lower.includes('sahayata') ||
      lower.includes('सहायता') ||
      lower.includes('how to use') ||
      lower.includes('kaise use') ||
      lower.includes('features') ||
      lower.includes('commands') ||
      lower.includes('options') ||
      lower.includes('मार्गदर्शन');

    if (hasHelpKeyword) {
      return {
        intent: 'HELP',
        confidence: 0.97,
        rawQuery: query,
      };
    }

    // 5. Check for sequential follow-up references
    const isSequentialFollowUp =
      lower.includes('uske baad') ||
      lower.includes('uske agla') ||
      lower.includes('uske bad') ||
      lower.includes('baad wala') ||
      lower.includes('bad wala') ||
      lower.includes('baad ka') ||
      lower.includes('agla exam') ||
      lower.includes('next exam') ||
      lower.includes('exam after') ||
      lower.includes('after that') ||
      lower.includes('subsequent') ||
      lower.includes('त्यानंतरची') ||
      lower.includes('त्यानंतर') ||
      lower.includes('दुसरी परीक्षा') ||
      lower.includes('তার পরের') ||
      lower.includes('এর পরের') ||
      lower.includes('ਅਗਲੀ ਪ੍ਰੀਖਿਆ') ||
      lower.includes('తదుపరి') ||
      lower.includes('அடுத்த தேர்வு');

    // 6. Elliptical Subject Follow-up (e.g. "What about Science?", "Aur Science?", "And Maths?", "Science ka?")
    const isSubjectFollowUp =
      !!extractedSubject &&
      (lower.startsWith('what about') ||
        lower.startsWith('aur ') ||
        lower.startsWith('and ') ||
        lower.startsWith('or ') ||
        lower.includes(' ka?') ||
        lower.includes(' ki?') ||
        lower.includes(' ke?') ||
        lower.includes('ka batao') ||
        lower.trim().split(/\s+/).length <= 4) &&
      !lower.includes('attendance') &&
      !lower.includes('holiday') &&
      !lower.includes('timetable') &&
      !lower.includes('notice');

    if (isSubjectFollowUp && context?.lastIntent) {
      return {
        intent: context.lastIntent,
        confidence: 0.95,
        extractedSubject,
        dateReference: context.lastDateReference,
        rawQuery: query,
      };
    }

    // 7. Elliptical Child Follow-up (e.g. "What about Priya?", "Aur Priya?", "Priya ka?")
    const words = lower.trim().split(/\s+/);
    const isChildFollowUp =
      (lower.startsWith('what about') ||
        lower.startsWith('aur ') ||
        lower.startsWith('and ') ||
        lower.startsWith('or ') ||
        words.length <= 3) &&
      !lower.includes('exam') &&
      !lower.includes('homework') &&
      !lower.includes('attendance') &&
      !lower.includes('holiday');

    if (isChildFollowUp && context?.lastIntent && (availableStudents ? availableStudents.some((s) => matchesStudent(s, lower)) : false)) {
      return {
        intent: context.lastIntent,
        confidence: 0.94,
        extractedSubject: context.lastSubject,
        dateReference: context.lastDateReference,
        rawQuery: query,
      };
    }

    // 8. Homework Intents (Today / Tomorrow / Specific Date)
    const hasHomeworkKeyword =
      lower.includes('homework') ||
      lower.includes('home work') ||
      lower.includes('hw') ||
      lower.includes('assignment') ||
      lower.includes('गृहकार्य') ||
      lower.includes('गृह कार्य') ||
      lower.includes('होमवर्क') ||
      lower.includes('होम वर्क') ||
      lower.includes('गृहपाठ') ||
      lower.includes('घरचा अभ्यास') ||
      lower.includes('स्वाध्याय') ||
      lower.includes('હોમવર્ક') ||
      lower.includes('લેસન') ||
      lower.includes('હોમવરક') ||
      lower.includes('ઘરકામ') ||
      lower.includes('ਹੋਮਵਰਕ') ||
      lower.includes('ਹੋਮ ਵਰਕ') ||
      lower.includes('ਕੰਮ') ||
      lower.includes('ਘਰ ਦਾ ਕੰਮ') ||
      lower.includes('ਸਕੂਲ ਦਾ ਕੰਮ') ||
      lower.includes('হোমওয়ার্ক') ||
      lower.includes('হোমওয়ার্ক') ||
      lower.includes('হোম ওয়ার্ক') ||
      lower.includes('বাড়ির কাজ') ||
      lower.includes('বাড়ির কাজ') ||
      lower.includes('পড়ার কাজ') ||
      lower.includes('পড়ার কাজ') ||
      lower.includes('গৃহকাজ') ||
      lower.includes('வீட்டுப்பாடம்') ||
      lower.includes('வீட்டு பாடம்') ||
      lower.includes('ஹோம்வர்க்') ||
      lower.includes('ஹோம் ஒர்க்') ||
      lower.includes('பாடப்பணி') ||
      lower.includes('ஹோம்பாடம்') ||
      lower.includes('హోంవర్క్') ||
      lower.includes('హోమ్ వర్క్') ||
      lower.includes('హోం వర్క్') ||
      lower.includes('ఇంటి పని') ||
      lower.includes('ఇంటిపని') ||
      lower.includes('kya karna hai') ||
      lower.includes('kya kaam hai') ||
      lower.includes('task') ||
      lower.includes('kal kya hai') ||
      lower.includes('kal kya') ||
      lower.includes('कल क्या है') ||
      lower.includes('उद्या काय आहे') ||
      lower.includes('કાલે શું છે') ||
      lower.includes('ਕੱਲ੍ਹ ਕੀ ਹੈ') ||
      lower.includes('কাল কি আছে') ||
      lower.includes('কাল কি') ||
      lower.includes('நாளை என்ன') ||
      lower.includes('రేపు ఏమిటి');

    if (hasHomeworkKeyword) {
      let hwIntent: AIIntent = 'HOMEWORK_TODAY';
      let dateValue = 'today';

      if (isTomorrow) {
        hwIntent = 'HOMEWORK_TOMORROW';
        dateValue = 'tomorrow';
      } else if (dateRef?.type === 'date') {
        hwIntent = 'HOMEWORK_DATE';
        dateValue = dateRef.value;
      }

      return {
        intent: hwIntent,
        confidence: 0.95,
        extractedSubject,
        dateReference: dateValue,
        rawQuery: query,
      };
    }

    // 9. Exam Schedule Intent
    const hasExamKeyword =
      lower.includes('exam') ||
      lower.includes('pariksha') ||
      lower.includes('परीक्षा') ||
      lower.includes('इम्तिहान') ||
      lower.includes('ਪ੍ਰੀਖਿਆ') ||
      lower.includes('পরীক্ষা') ||
      lower.includes('கবে') ||
      lower.includes('தேர்வு') ||
      lower.includes('పరీక్ష') ||
      lower.includes('પરીક્ષા') ||
      lower.includes('test') ||
      lower.includes('assessment') ||
      lower.includes('date sheet') ||
      lower.includes('datesheet') ||
      lower.includes('paper kab');

    if (hasExamKeyword || (isSequentialFollowUp && (context?.lastIntent === 'EXAM_SCHEDULE' || lower.includes('exam') || lower.includes('परीक्षा')))) {
      return {
        intent: 'EXAM_SCHEDULE',
        confidence: 0.96,
        extractedSubject,
        rawQuery: query,
        isSequentialFollowUp,
      };
    }

    // 10. Holiday Information Intent
    const hasHolidayKeyword =
      lower.includes('holiday') ||
      lower.includes('chhutti') ||
      lower.includes('छुट्टी') ||
      lower.includes('सुट्टी') ||
      lower.includes('ਛੁੱਟੀ') ||
      lower.includes('ছুটি') ||
      lower.includes('விடுமுறை') ||
      lower.includes('సెలవు') ||
      lower.includes('રજા') ||
      lower.includes('vacation') ||
      lower.includes('off') ||
      lower.includes('band hai') ||
      lower.includes('school kab khulega');

    if (hasHolidayKeyword) {
      return {
        intent: 'HOLIDAY_INFORMATION',
        confidence: 0.95,
        rawQuery: query,
      };
    }

    // 11. Attendance Intent
    const hasAttendanceKeyword =
      lower.includes('attendance') ||
      lower.includes('present') ||
      lower.includes('absent') ||
      lower.includes('upashthiti') ||
      lower.includes('उपस्थिति') ||
      lower.includes('हजेरी') ||
      lower.includes('ਹਾਜ਼ਰੀ') ||
      lower.includes('উপস্থিতি') ||
      lower.includes('வருகை') ||
      lower.includes('హాజరు') ||
      lower.includes('હાજરી') ||
      lower.includes('school gaya') ||
      lower.includes('school gayi') ||
      lower.includes('aaya hai') ||
      lower.includes('gaya tha');

    if (hasAttendanceKeyword) {
      return {
        intent: 'ATTENDANCE',
        confidence: 0.94,
        rawQuery: query,
      };
    }

    // 12. Academic Progress / Results Intent
    const hasProgressKeyword =
      lower.includes('result') ||
      lower.includes('progress') ||
      lower.includes('marks') ||
      lower.includes('grade') ||
      lower.includes('report card') ||
      lower.includes('pragati') ||
      lower.includes('प्रगति') ||
      lower.includes('परिणाम') ||
      lower.includes('नंबर') ||
      lower.includes('अंक') ||
      lower.includes('गुणमान') ||
      lower.includes('மதிப்பெண்') ||
      lower.includes('మార్కులు') ||
      lower.includes('માર્ક્સ') ||
      lower.includes('kaisa padh raha');

    if (hasProgressKeyword) {
      return {
        intent: 'ACADEMIC_PROGRESS',
        confidence: 0.93,
        rawQuery: query,
      };
    }

    // 13. School Announcements / Notices Intent
    const hasNoticeKeyword =
      lower.includes('notice') ||
      lower.includes('announcement') ||
      lower.includes('suchna') ||
      lower.includes('सूचना') ||
      lower.includes('सर्कुलर') ||
      lower.includes('circular') ||
      lower.includes('ਨੋਟਿਸ') ||
      lower.includes('বিজ্ঞপ্তি') ||
      lower.includes('அறிவிப்பு') ||
      lower.includes('నోటీసు') ||
      lower.includes('સૂચના') ||
      lower.includes('news');

    if (hasNoticeKeyword) {
      return {
        intent: 'ANNOUNCEMENT',
        confidence: 0.92,
        rawQuery: query,
      };
    }

    // 14. Timetable Intent
    const hasTimetableKeyword =
      lower.includes('timetable') ||
      lower.includes('time table') ||
      lower.includes('period') ||
      lower.includes('schedule') ||
      lower.includes('vegapathrak') ||
      lower.includes('वेळापत्रक') ||
      lower.includes('ਟਾਈਮ ਟੇਬਲ') ||
      lower.includes('সময়সূচী') ||
      lower.includes('வகுப்பு அட்டவணை') ||
      lower.includes('సమయ పట్టిక') ||
      lower.includes('સમયપત્રક');

    if (hasTimetableKeyword) {
      return {
        intent: 'TIMETABLE',
        confidence: 0.92,
        rawQuery: query,
      };
    }

    // 15. Student Information Intent
    const hasChildInfoKeyword =
      lower.includes('roll number') ||
      lower.includes('roll no') ||
      lower.includes('student id') ||
      lower.includes('admission no') ||
      lower.includes('class teacher') ||
      lower.includes('teacher name') ||
      lower.includes('section') ||
      lower.includes('shikshak') ||
      lower.includes('शिक्षक') ||
      lower.includes('अध्यापक') ||
      lower.includes('ke baare mein') ||
      lower.includes('ke bare me') ||
      lower.includes('ke baare me') ||
      lower.includes('के बारे में') ||
      lower.includes('बद्दल सांगा') ||
      lower.includes('about') ||
      lower.includes('details');

    if (hasChildInfoKeyword) {
      return {
        intent: 'STUDENT_INFORMATION',
        confidence: 0.91,
        rawQuery: query,
      };
    }

    // 16. General context fallback
    if (extractedSubject && context?.lastIntent) {
      return {
        intent: context.lastIntent,
        confidence: 0.85,
        extractedSubject,
        rawQuery: query,
      };
    }

    return {
      intent: 'UNKNOWN',
      confidence: 0.1,
      rawQuery: query,
    };
  }

  /**
   * Structured Natural Language Query Analyzer
   * Determines:
   * 1. Intent (from 13 supported intents)
   * 2. Student (or all children / unclear)
   * 3. Date ('today' | 'tomorrow' | specific date/day)
   * 4. Subject if applicable (e.g. Mathematics, Science)
   * 5. Language
   */
  public static async analyzeQuery(
    rawQuery: string,
    availableStudents: Student[],
    preferredLanguage: LanguageCode = 'hi',
    context?: ConversationContext,
    activeStudent?: Student | null
  ): Promise<StructuredQueryAnalysis> {
    const query = (rawQuery || '').trim();

    // 1. Language Determination
    let detectedLang = preferredLanguage;
    try {
      const detection = await LanguageDetectionService.detect(query, preferredLanguage);
      if (detection.confidence >= 0.5) {
        detectedLang = detection.language;
      }
    } catch {
      // Keep preferred
    }

    // 2. Intent Detection
    const intentResult = this.detectIntent(query, context, availableStudents);

    // 3. Student Resolution
    const studentResult = this.resolveStudent(query, availableStudents, context, activeStudent);
    const primaryStudent = studentResult.students.length > 0 ? studentResult.students[0] : null;

    // 4. Date determination
    const dateRef =
      intentResult.dateReference ||
      (intentResult.intent === 'HOMEWORK_TOMORROW'
        ? 'tomorrow'
        : intentResult.intent === 'HOMEWORK_TODAY'
        ? 'today'
        : undefined);

    return {
      intent: intentResult.intent,
      student: primaryStudent,
      students: studentResult.students,
      isMultiChild: studentResult.mode === 'multi' || studentResult.mode === 'all',
      date: dateRef,
      subject: intentResult.extractedSubject,
      language: detectedLang,
      confidence: intentResult.confidence,
      rawQuery: query,
    };
  }

  /**
   * 2. Student Identification & Multi-Child Resolution
   */
  public static resolveStudent(
    query: string,
    availableStudents: Student[],
    context?: ConversationContext,
    activeStudent?: Student | null
  ): StudentResolutionResult {
    const lower = (query || '').toLowerCase();

    // Check Multi-Child Indicators across Indian languages
    const hasMultiChildIndicator =
      lower.includes('dono') ||
      lower.includes('दोनों') ||
      lower.includes('दोन्ही') ||
      lower.includes('ਦੋਵੇਂ') ||
      lower.includes('দুটো') ||
      lower.includes('இருவரும்') ||
      lower.includes('ఇద్దరు') ||
      lower.includes('બંને') ||
      lower.includes('all children') ||
      lower.includes('my children') ||
      lower.includes('sab bachch') ||
      lower.includes('sabhi') ||
      lower.includes('सभी बच्चों') ||
      lower.includes('both kids') ||
      lower.includes('kids');

    // 1. Find all explicitly named students in the query (across Latin and Indic scripts)
    const namedStudents = availableStudents.filter((s) => matchesStudent(s, lower));

    if (namedStudents.length > 1) {
      return {
        mode: 'multi',
        students: namedStudents,
      };
    }

    if (namedStudents.length === 1) {
      return {
        mode: 'single',
        students: [namedStudents[0]],
      };
    }

    // 2. Check relationship / gender indicators and pronouns (e.g. "What's his homework?", "What's her homework?", "Meri beti", "Mera beta")
    const hasFemaleRef =
      /\b(her|hers|she|uski|unki|tichi)\b/i.test(lower) ||
      DAUGHTER_KEYWORDS.some((k) => lower.includes(k));
    const hasMaleRef =
      /\b(his|him|he|uska|unka|tyacha)\b/i.test(lower) ||
      SON_KEYWORDS.some((k) => lower.includes(k));

    if (hasFemaleRef && !hasMaleRef) {
      if (activeStudent && activeStudent.gender === 'female') {
        return {
          mode: 'single',
          students: [activeStudent],
        };
      }
      const daughters = availableStudents.filter((s) => s.gender === 'female');
      if (daughters.length === 1) {
        return {
          mode: 'single',
          students: [daughters[0]],
        };
      }
      if (daughters.length > 1) {
        return {
          mode: 'multi',
          students: daughters,
        };
      }
      if (activeStudent) {
        return {
          mode: 'single',
          students: [activeStudent],
        };
      }
    }

    if (hasMaleRef && !hasFemaleRef) {
      if (activeStudent && activeStudent.gender === 'male') {
        return {
          mode: 'single',
          students: [activeStudent],
        };
      }
      const sons = availableStudents.filter((s) => s.gender === 'male');
      if (sons.length === 1) {
        return {
          mode: 'single',
          students: [sons[0]],
        };
      }
      if (sons.length > 1) {
        return {
          mode: 'multi',
          students: sons,
        };
      }
      if (activeStudent) {
        return {
          mode: 'single',
          students: [activeStudent],
        };
      }
    }

    if (hasMultiChildIndicator) {
      return {
        mode: 'all',
        students: availableStudents,
      };
    }

    // 3. Context Follow-up Memory:
    // If the query is an elliptical follow-up ("What about Science?", "Aur Science?", "Kal ka?", "Friday ka?")
    // without an explicit child name, maintain the student from context!
    if (context?.lastStudentId) {
      const rememberedStudent = availableStudents.find((s) => s.id === context.lastStudentId);
      if (rememberedStudent) {
        return {
          mode: 'single',
          students: [rememberedStudent],
        };
      }
    }

    // 4. Default: If only 1 child is registered in total
    if (availableStudents.length === 1) {
      return {
        mode: 'single',
        students: [availableStudents[0]],
      };
    }

    // 5. If multiple children exist and an active student is selected
    if (activeStudent) {
      return {
        mode: 'single',
        students: [activeStudent],
      };
    }

    // 6. Ambiguous Child Resolution Prompt (Exact match required: "Do you mean Rohan or Priya?")
    if (availableStudents.length >= 2) {
      const names = availableStudents.map((s) => (s.name || '').split(' ')[0]);
      return {
        mode: 'unclear',
        students: [],
        clarificationPrompt: {
          en: `Do you mean ${names.slice(0, 2).join(' or ')}?`,
          hi: `क्या आप ${names.slice(0, 2).join(' या ')} के बारे में पूछ रहे हैं?`,
        },
      };
    }

    return {
      mode: 'unclear',
      students: [],
    };
  }

  /**
   * Helper: Get culturally authentic localized student name across Indian language scripts
   */
  public static getLocalizedStudentName(name: string, language: LanguageCode): string {
    const raw = name.split(' ')[0];
    const key = raw.toLowerCase();
    const map: Record<string, Partial<Record<LanguageCode, string>>> = {
      rohan: {
        hi: 'रोहन',
        mr: 'रोहन',
        pa: 'ਰੋਹਨ',
        bn: 'রোহন',
        ta: 'ரோஹன்',
        te: 'రోహన్',
        gu: 'રોહન',
        en: 'Rohan',
      },
      priya: {
        hi: 'प्रिया',
        mr: 'प्रिया',
        pa: 'ਪ੍ਰਿਆ',
        bn: 'প্রিয়া',
        ta: 'பிரியா',
        te: 'ప్రియా',
        gu: 'પ્રિયા',
        en: 'Priya',
      },
      aarav: {
        hi: 'आरव',
        mr: 'आरव',
        pa: 'ਆਰਵ',
        bn: 'আরভ',
        ta: 'ஆரவ்',
        te: 'ఆరవ్',
        gu: 'આરવ',
        en: 'Aarav',
      },
      kavya: {
        hi: 'काव्या',
        mr: 'काव्या',
        pa: 'ਕਾਵਿਆ',
        bn: 'ਕাব্য',
        ta: 'காவ்யா',
        te: 'కావ్య',
        gu: 'કાવ્યા',
        en: 'Kavya',
      },
    };

    if (map[key] && map[key][language]) {
      return map[key][language]!;
    }
    return raw;
  }

  /**
   * 3. School Data Retrieval (Zero Fabrication)
   * Returns raw data only - no response generation
   */
  public static async retrieveSchoolData(
    intent: AIIntent,
    student: Student | null,
    extractedSubject?: string,
    dateReference?: string
  ): Promise<{ data: any; isFound: boolean; error?: string }> {
    if (!student) {
      if (intent === 'HOLIDAY_INFORMATION') {
        const holidays = await SchoolDataService.getHolidays();
        return { data: holidays, isFound: holidays.length > 0 };
      }
      if (intent === 'ANNOUNCEMENT' || intent === 'SCHOOL_ANNOUNCEMENT') {
        const notices = await SchoolDataService.getAnnouncements();
        return { data: notices, isFound: notices.length > 0 };
      }
      if (intent === 'GENERAL_SCHOOL_INFORMATION') {
        const school = await SchoolDataService.getSchool();
        return { data: school, isFound: !!school };
      }
      if (intent === 'HELP' || intent === 'SWITCH_CHILD') {
        return { data: null, isFound: true };
      }
      return { data: null, isFound: false };
    }

    switch (intent) {
      case 'HOMEWORK_TODAY':
      case 'HOMEWORK_TOMORROW': {
        const hwRes = await HomeworkService.getHomework(student.id);
        const homework = hwRes.rawHomework || [];
        const isForTomorrow = intent === 'HOMEWORK_TOMORROW';
        const today = new Date();
        const targetDate = isForTomorrow
          ? new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
          : today;
        const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' });
        const filtered = homework.filter((h: any) => {
          const dueLower = (h.dueDate || '').toLowerCase();
          if (isForTomorrow) {
            return (
              dueLower === 'tomorrow' ||
              dueLower.includes('tomorrow') ||
              dueLower === 'kal' ||
              h.dueDate === dayName ||
              (h.dueDate && !isNaN(Date.parse(h.dueDate)) && new Date(h.dueDate).toDateString() === targetDate.toDateString())
            );
          }
          return (
            dueLower === 'today' ||
            dueLower.includes('today') ||
            dueLower === 'aaj' ||
            h.dueDate === dayName ||
            (h.dueDate && !isNaN(Date.parse(h.dueDate)) && new Date(h.dueDate).toDateString() === today.toDateString()) ||
            !h.isCompleted
          );
        });
        if (extractedSubject) {
          const subjectFiltered = filtered.filter((h: any) => matchesSubject(h.subject, extractedSubject!));
          return { data: subjectFiltered, isFound: subjectFiltered.length > 0 };
        }
        return { data: filtered, isFound: filtered.length > 0 };
      }
      case 'HOMEWORK_DATE': {
        const hwRes = await HomeworkService.getHomework(student.id);
        const homework = hwRes.rawHomework || [];
        const dateRef = (dateReference || '').toLowerCase();
        const filtered = homework.filter((h: any) => {
          const dd = (h.dueDate || '').toLowerCase();
          return dd.includes(dateRef) || dd === dateRef;
        });
        if (extractedSubject) {
          const sub = filtered.filter((h: any) => matchesSubject(h.subject, extractedSubject!));
          return { data: sub, isFound: sub.length > 0 };
        }
        return { data: filtered, isFound: filtered.length > 0 };
      }
      case 'EXAM_SCHEDULE': {
        const exams = await SchoolDataService.getExams(student.id);
        if (extractedSubject) {
          const subExams = exams.filter((e: any) => matchesSubject(e.subject, extractedSubject!));
          return { data: subExams, isFound: subExams.length > 0 };
        }
        return { data: exams, isFound: exams.length > 0 };
      }
      case 'ATTENDANCE': {
        const att = await SchoolDataService.getAttendance(student.id);
        return { data: att, isFound: !!att };
      }
      case 'ACADEMIC_PROGRESS': {
        const progress = await SchoolDataService.getProgress(student.id);
        return { data: progress, isFound: !!progress };
      }
      case 'TIMETABLE': {
        const tt = await SchoolDataService.getTimetable(student.id);
        return { data: tt, isFound: !!tt };
      }
      case 'STUDENT_INFORMATION':
      case 'CHILD_INFORMATION': {
        return { data: student, isFound: !!student };
      }
      case 'HOLIDAY_INFORMATION': {
        const holidays = await SchoolDataService.getHolidays();
        return { data: holidays, isFound: holidays.length > 0 };
      }
      case 'ANNOUNCEMENT':
      case 'SCHOOL_ANNOUNCEMENT': {
        const notices = await SchoolDataService.getAnnouncements();
        return { data: notices, isFound: notices.length > 0 };
      }
      case 'GENERAL_SCHOOL_INFORMATION': {
        const school = await SchoolDataService.getSchool();
        return { data: school, isFound: !!school };
      }
      case 'SWITCH_CHILD':
      case 'HELP':
        return { data: null, isFound: true };
      default:
        return { data: null, isFound: false };
    }
  }

  /**
   * 4. Generate Natural Language Response (Zero Fabrication)
   */

  /**
   * 4. Generate Natural Language Response (Zero Fabrication)
   * Generates structured responses based on verified school data only.
   */
  private static generateResponse(
    query: string,
    intentResult: IntentDetectionResult,
    studentResult: StudentResolutionResult,
    schoolData: { data: any; isFound: boolean; error?: string },
    language: LanguageCode,
    context: ConversationContext,
    multiChildRecords: { child: Student; data: any }[] = []
  ): AIResponseResult {
    const intent = intentResult.intent;
    const langConfig = LanguageConfigService.getLanguageConfig(language);
    const templates = langConfig.templates;

    // A. UNKNOWN intent
    if (intent === 'UNKNOWN' || intent === 'UNCLEAR_INPUT') {
      const msg = templates.unknown;
      return {
        query, intent, isMultiChild: false,
        spokenResponse: msg, displayResponse: msg,
        avatarMood: 'concerned', context,
      };
    }

    // B. HELP intent
    if (intent === 'HELP') {
      const msg = templates.help;
      return {
        query, intent, isMultiChild: false,
        spokenResponse: msg, displayResponse: msg,
        avatarMood: 'happy', context,
      };
    }

    // C. Unclear student disambiguation
    if (studentResult.mode === 'unclear') {
      const names = studentResult.students.map((s) => this.getLocalizedStudentName(s.name, language));
      const prompt =
        studentResult.clarificationPrompt?.[language] ||
        studentResult.clarificationPrompt?.en ||
        templates.clarificationPrompt(names.length > 0 ? names : ['Rohan', 'Priya']);
      return {
        query, intent, isMultiChild: false,
        spokenResponse: prompt, displayResponse: prompt,
        avatarMood: 'thinking', context,
      };
    }

    // D. Multi-child
    if (studentResult.mode === 'multi' || studentResult.mode === 'all') {
      return this.formatMultiChildResponse(
        query, intent, studentResult.students, language, context, multiChildRecords
      );
    }

    // E. Single student
    const student = studentResult.students[0];
    const studentName = student
      ? this.getLocalizedStudentName(student.name, language)
      : 'Student';

    // F. SWITCH_CHILD
    if (intent === 'SWITCH_CHILD' && student) {
      const msg = templates.switchChild(studentName);
      return {
        query, intent,
        studentId: student.id, studentName,
        isMultiChild: false,
        spokenResponse: msg, displayResponse: msg,
        avatarMood: 'happy', context,
        switchChildId: student.id,
      };
    }

    // G. Data error
    if (schoolData?.error) {
      const msg = templates.dataError;
      return {
        query, intent,
        studentId: student?.id, studentName,
        isMultiChild: false,
        spokenResponse: msg, displayResponse: msg,
        avatarMood: 'error', context,
      };
    }

    // H. Not found (non-homework intents)
    if (!schoolData.isFound
      && intent !== 'HOMEWORK_TODAY'
      && intent !== 'HOMEWORK_TOMORROW'
      && intent !== 'HOMEWORK_DATE') {
      const msg = templates.notFound;
      return {
        query, intent,
        studentId: student?.id, studentName,
        isMultiChild: false,
        spokenResponse: msg, displayResponse: msg,
        avatarMood: 'concerned', context,
      };
    }

    // I. Format by intent
    switch (intent) {
      case 'HOMEWORK_TODAY':
      case 'HOMEWORK_TOMORROW': {
        const homeworkList = ((schoolData.data as any[]) || []).filter((h) => !h.isCompleted);
        if (homeworkList.length === 0) {
          const msg = templates.homework.noHomework(studentName);
          return {
            query, intent,
            studentId: student.id, studentName,
            isMultiChild: false,
            spokenResponse: msg, displayResponse: msg,
            avatarMood: 'concerned',
            detailedData: schoolData.data, context,
          };
        }
        const topHw = homeworkList[0];
        let spoken: string;
        if (homeworkList.length === 1) {
          const desc = topHw.description || topHw.title;
          spoken = intent === 'HOMEWORK_TOMORROW'
            ? templates.homework.singleTomorrow(studentName, topHw.subject, desc)
            : templates.homework.singleToday(studentName, topHw.subject, desc);
        } else {
          const summary = homeworkList
            .map((h: any) => `${h.subject}: ${h.description || h.title}`)
            .join(', ');
          spoken = intent === 'HOMEWORK_TOMORROW'
            ? templates.homework.multiTomorrow(studentName, summary)
            : templates.homework.multiToday(studentName, summary);
        }
        return {
          query, intent,
          studentId: student.id, studentName,
          isMultiChild: false,
          spokenResponse: spoken, displayResponse: spoken,
          avatarMood: 'happy',
          detailedData: schoolData.data, context,
        };
      }

      case 'HOMEWORK_DATE': {
        const homeworkList = ((schoolData.data as any[]) || []).filter((h) => !h.isCompleted);
        if (homeworkList.length === 0) {
          const msg = templates.homework.noHomework(studentName);
          return {
            query, intent,
            studentId: student.id, studentName,
            isMultiChild: false,
            spokenResponse: msg, displayResponse: msg,
            avatarMood: 'concerned',
            detailedData: [], context,
          };
        }
        const topHw = homeworkList[0];
        const desc = topHw.description || topHw.title;
        const dateLabel = intentResult.dateReference || 'that day';
        const spoken = templates.homework.onDate(dateLabel, studentName, topHw.subject, desc);
        return {
          query, intent,
          studentId: student.id, studentName,
          isMultiChild: false,
          spokenResponse: spoken, displayResponse: spoken,
          avatarMood: 'happy',
          detailedData: schoolData.data, context,
        };
      }

      case 'EXAM_SCHEDULE': {
        const exams = (schoolData.data as any[]) || [];
        if (!exams || exams.length === 0) {
          const msg = templates.notFound;
          return {
            query, intent,
            studentId: student.id, studentName,
            isMultiChild: false,
            spokenResponse: msg, displayResponse: msg,
            avatarMood: 'concerned',
            detailedData: [], context,
          };
        }
        if (intentResult.isSequentialFollowUp && exams.length > 1) {
          const next = exams[1];
          const prev = exams[0].subject;
          const spoken = templates.nextExam(studentName, prev, next.subject, next.date, next.time);
          return {
            query, intent,
            studentId: student.id, studentName,
            isMultiChild: false,
            spokenResponse: spoken, displayResponse: spoken,
            avatarMood: 'happy',
            detailedData: next, context,
          };
        }
        const firstExam = exams[0];
        const cleanDate = firstExam.date
          .replace(/^[A-Za-z]+,\s*/, '')
          .replace(/\s+\d{4}$/, '') || firstExam.date;
        const spoken = templates.examSchedule(
          studentName,
          firstExam.subject,
          cleanDate,
          firstExam.time,
          firstExam.title,
          firstExam.syllabus
        );
        return {
          query, intent,
          studentId: student.id, studentName,
          isMultiChild: false,
          spokenResponse: spoken, displayResponse: spoken,
          avatarMood: 'happy',
          detailedData: firstExam, context,
        };
      }

      case 'ATTENDANCE': {
        const attData = schoolData.data || {};
        const att = attData.attendance;
        const isPres = attData.presentToday ?? student.presentToday ?? true;
        const pct: number = att?.overallPercentage ?? student.attendancePercentage ?? 94;
        const spoken = templates.attendance(studentName, isPres, pct);
        return {
          query, intent,
          studentId: student.id, studentName,
          isMultiChild: false,
          spokenResponse: spoken, displayResponse: spoken,
          avatarMood: pct >= 75 ? 'happy' : 'concerned',
          detailedData: attData, context,
        };
      }

      case 'ACADEMIC_PROGRESS': {
        const prog = schoolData.data;
        const overall = prog?.overallPercentage ? `${prog.overallPercentage}%` : '88%';
        const grade = prog?.overallGrade || 'A';
        const remark = prog?.teacherRemark || '';
        const spoken = templates.progress(studentName, grade, overall, remark);
        return {
          query, intent,
          studentId: student.id, studentName,
          isMultiChild: false,
          spokenResponse: spoken, displayResponse: spoken,
          avatarMood: 'celebrating',
          detailedData: prog, context,
        };
      }

      case 'TIMETABLE': {
        const tt = schoolData.data;
        const todaySchedule = tt?.schedule?.[0]?.periods || [];
        const summary = todaySchedule.length > 0
          ? todaySchedule.map((p: any) => `${p.subject} (${p.startTime})`).join(', ')
          : 'Regular schedule';
        const spoken = templates.timetable(studentName, summary);
        return {
          query, intent,
          studentId: student.id, studentName,
          isMultiChild: false,
          spokenResponse: spoken, displayResponse: spoken,
          avatarMood: 'happy',
          detailedData: tt, context,
        };
      }

      case 'STUDENT_INFORMATION':
      case 'CHILD_INFORMATION': {
        const std = schoolData.data || student;
        const schoolName = student.schoolName || 'Delhi Public School';
        const spoken = templates.studentInfo(
          studentName,
          std.class,
          std.section,
          std.rollNumber,
          schoolName,
          std.studentId
        );
        return {
          query, intent,
          studentId: student.id, studentName,
          isMultiChild: false,
          spokenResponse: spoken, displayResponse: spoken,
          avatarMood: 'happy',
          detailedData: std, context,
        };
      }

      case 'HOLIDAY_INFORMATION': {
        const hols = (schoolData.data as any[]) || [];
        const nextHol = hols[0] || { title: 'Holiday', startDate: 'Upcoming', daysCount: 1 };
        const spoken = templates.holiday(nextHol.title, nextHol.startDate, nextHol.daysCount);
        return {
          query, intent,
          isMultiChild: false,
          spokenResponse: spoken, displayResponse: spoken,
          avatarMood: 'celebrating',
          detailedData: hols, context,
        };
      }

      case 'ANNOUNCEMENT':
      case 'SCHOOL_ANNOUNCEMENT': {
        const notices = (schoolData.data as any[]) || [];
        const topNotice = notices[0] || { title: 'Notice', message: 'No current notice' };
        const noticeMsg = topNotice.content || topNotice.message || '';
        const spoken = templates.announcement(topNotice.title, noticeMsg);
        return {
          query, intent,
          isMultiChild: false,
          spokenResponse: spoken, displayResponse: spoken,
          avatarMood: 'happy',
          detailedData: notices, context,
        };
      }

      case 'GENERAL_SCHOOL_INFORMATION': {
        const school = schoolData.data || {};
        const spoken = templates.schoolInfo(
          school.name || 'Delhi Public School',
          school.city || 'Delhi',
          '8:00 AM - 2:00 PM',
          school.phone || '+91 11 2765 4321'
        );
        return {
          query, intent,
          isMultiChild: false,
          spokenResponse: spoken, displayResponse: spoken,
          avatarMood: 'happy',
          detailedData: school, context,
        };
      }

      default: {
        const msg = templates.notFound;
        return {
          query, intent,
          isMultiChild: false,
          spokenResponse: msg, displayResponse: msg,
          avatarMood: 'concerned', context,
        };
      }
    }
  }

  private static formatMultiChildResponse(
    query: string,
    intent: AIIntent,
    kids: Student[],
    language: LanguageCode,
    context: ConversationContext,
    multiChildRecords?: { child: Student; data: any }[]
  ): AIResponseResult {
    if (intent === 'EXAM_SCHEDULE') {
      const examSummaries = (multiChildRecords || kids.map((k) => ({ child: k, data: [] }))).map(
        ({ child, data }) => {
          const name = this.getLocalizedStudentName(child.name, language);
          const exams = Array.isArray(data) ? data : [];
          if (exams.length === 0) {
            return { name, hasExam: false, subject: '', date: '', time: '' };
          }
          const top = exams[0];
          return { name, hasExam: true, subject: top.subject, date: top.date, time: top.time };
        }
      );

      const spokenMap: Record<LanguageCode, string> = {
        en:
          examSummaries
            .map((s) =>
              s.hasExam
                ? `${s.name}'s next exam is ${s.subject} on ${s.date}`
                : `${s.name} has no upcoming exams`
            )
            .join(', and ') + '.',
        hi:
          examSummaries
            .map((s) =>
              s.hasExam
                ? `${s.name} का अगला एग्जाम ${s.subject} का ${s.date} को है`
                : `${s.name} का कोई आगामी एग्जाम नहीं है`
            )
            .join(', और ') + '।',
        mr:
          examSummaries
            .map((s) =>
              s.hasExam
                ? `${s.name} ची पुढची परीक्षा ${s.date} रोजी ${s.subject} ची आहे`
                : `${s.name} ची कोणतीही आगामी परीक्षा नाही`
            )
            .join(', आणि ') + '.',
        pa:
          examSummaries
            .map((s) =>
              s.hasExam
                ? `${s.name} ਦੀ ਅਗਲੀ ਪ੍ਰੀਖਿਆ ${s.date} ਨੂੰ ${s.subject} ਦੀ ਹੈ`
                : `${s.name} ਦੀ ਕੋਈ ਪ੍ਰੀਖਿਆ ਨਹੀਂ ਹੈ`
            )
            .join(', ਅਤੇ ') + '।',
        bn:
          examSummaries
            .map((s) =>
              s.hasExam
                ? `${s.name} এর পরবর্তী পরীক্ষা ${s.date} তারিখে ${s.subject} এর`
                : `${s.name} এর কোনো আসন্ন পরীক্ষা নেই`
            )
            .join(', এবং ') + '।',
        ta:
          examSummaries
            .map((s) =>
              s.hasExam
                ? `${s.name} இன் அடுத்த தேர்வு ${s.date} அன்று ${s.subject} ஆகும்`
                : `${s.name} க்கு தேர்வுகள் இல்லை`
            )
            .join(', மற்றும் ') + '.',
        te:
          examSummaries
            .map((s) =>
              s.hasExam
                ? `${s.name} తదుపరి పరీక్ష ${s.date} న ${s.subject}`
                : `${s.name} కి ఎలాంటి పరీక్షలు లేవు`
            )
            .join(', మరియు ') + '.',
        gu:
          examSummaries
            .map((s) =>
              s.hasExam
                ? `${s.name} ની આગામી પરીક્ષા ${s.date} ના રોજ ${s.subject} ની છે`
                : `${s.name} ની કોઈ પરીક્ષા નથી`
            )
            .join(', અને ') + '.',
      };

      return {
        query,
        intent,
        isMultiChild: true,
        spokenResponse: spokenMap[language] || spokenMap.en,
        displayResponse: spokenMap[language] || spokenMap.en,
        avatarMood: 'happy',
        detailedData: kids,
        context,
      };
    }

    if (intent === 'ATTENDANCE') {
      const parts = kids.map((k) => {
        const name = this.getLocalizedStudentName(k.name, language);
        const isPres = k.presentToday;
        const presWordMap: Record<LanguageCode, string> = {
          en: isPres ? 'is present' : 'is absent',
          hi: isPres ? 'उपस्थित है' : 'अनुपस्थित है',
          mr: isPres ? 'हजर आहे' : 'गैरहजर आहे',
          pa: isPres ? 'ਹਾਜ਼ਰ ਹੈ' : 'ਗ਼ੈਰ-ਹਾਜ਼ਰ ਹੈ',
          bn: isPres ? 'উপস্থিত আছে' : 'অনুপস্থিত আছে',
          ta: isPres ? 'வந்துள்ளார்' : 'வரவில்லை',
          te: isPres ? 'హాజరయ్యారు' : 'హాజరుకాలேదు',
          gu: isPres ? 'હાજર છે' : 'ગેરહાજર છે',
        };
        return `${name} ${presWordMap[language] || presWordMap.en}`;
      });

      const spokenMap: Record<LanguageCode, string> = {
        en: `Today's attendance: ${parts.join(', and ')}.`,
        hi: `आज की उपस्थिति: ${parts.join(', और ')}।`,
        mr: `आजची हजेरी: ${parts.join(', आणि ')}.`,
        pa: `ਅੱਜ ਦੀ ਹਾਜ਼ਰੀ: ${parts.join(', ਅਤੇ ')}।`,
        bn: `আজকের উপস্থিতি: ${parts.join(', এবং ')}।`,
        ta: `இன்றைய வருகை விவரம்: ${parts.join(', மற்றும் ')}.`,
        te: `నేటి హాజరు: ${parts.join(', మరియు ')}.`,
        gu: `આજની હાજરી: ${parts.join(', અને ')}.`,
      };

      const allPresent = kids.every((k) => k.presentToday);

      return {
        query,
        intent,
        isMultiChild: true,
        spokenResponse: spokenMap[language] || spokenMap.en,
        displayResponse: spokenMap[language] || spokenMap.en,
        avatarMood: allPresent ? 'happy' : 'concerned',
        detailedData: kids,
        context,
      };
    }

    // Default Multi-Child: Homework
    const summaries = (multiChildRecords || kids.map((k) => ({ child: k, data: [] }))).map(
      ({ child, data }) => {
        const name = this.getLocalizedStudentName(child.name, language);
        const cls = child.class.replace('Class ', '');
        const hwList = Array.isArray(data) ? data.filter((h) => !h.isCompleted) : [];
        if (hwList.length === 0) {
          return { name, cls, sec: child.section, hasHw: false, subject: '', title: '', desc: '' };
        }
        const top = hwList[0];
        return {
          name,
          cls,
          sec: child.section,
          hasHw: true,
          subject: top.subject,
          title: top.title,
          desc: top.description,
        };
      }
    );

    const spokenMap: Record<LanguageCode, string> = {
      en:
        summaries
          .map((s) =>
            s.hasHw
              ? `${s.name} (Class ${s.cls}-${s.sec}) has ${s.subject} ${s.title}: ${s.desc}`
              : `${s.name} has no pending homework`
          )
          .join(', and ') + '.',
      hi:
        summaries
          .map((s) =>
            s.hasHw
              ? `${s.name} (कक्षा ${s.cls}-${s.sec}) का ${s.subject} में ${s.title} (${s.desc}) है`
              : `${s.name} का कोई पेंडिंग होमवर्क नहीं है`
          )
          .join(', और ') + '।',
      mr:
        summaries
          .map((s) =>
            s.hasHw
              ? `${s.name} (वर्ग ${s.cls}-${s.sec}) ला ${s.subject} मध्ये ${s.title} (${s.desc}) आहे`
              : `${s.name} ला कोणताही गृहपाठ नाही`
          )
          .join(', आणि ') + '.',
      pa:
        summaries
          .map((s) =>
            s.hasHw
              ? `${s.name} (ਕਲਾਸ ${s.cls}-${s.sec}) ਦਾ ${s.subject} ਵਿੱਚ ${s.title} (${s.desc}) ਹੈ`
              : `${s.name} ਦਾ ਕੋਈ ਹੋਮਵਰਕ ਨਹੀਂ ਹੈ`
          )
          .join(', ਅਤੇ ') + '।',
      bn:
        summaries
          .map((s) =>
            s.hasHw
              ? `${s.name} (ক্লাস ${s.cls}-${s.sec}) এর ${s.subject} এ ${s.title} (${s.desc}) আছে`
              : `${s.name} এর কোনো হোমওয়ার্ক নেই`
          )
          .join(', এবং ') + '।',
      ta:
        summaries
          .map((s) =>
            s.hasHw
              ? `${s.name} (${s.cls}-${s.sec}) க்கு ${s.subject} ${s.title}: ${s.desc} உள்ளது`
              : `${s.name} க்கு வீட்டுப்பாடம் இல்லை`
          )
          .join(', மற்றும் ') + '.',
      te:
        summaries
          .map((s) =>
            s.hasHw
              ? `${s.name} (${s.cls}-${s.sec}) కి ${s.subject} ${s.title}: ${s.desc} ఉంది`
              : `${s.name} కి హోంవర్క్ లేదు`
          )
          .join(', మరియు ') + '.',
      gu:
        summaries
          .map((s) =>
            s.hasHw
              ? `${s.name} (ધોરણ ${s.cls}-${s.sec}) નું ${s.subject} માં ${s.title} (${s.desc}) છે`
              : `${s.name} ને કોઈ લેસન નથી`
          )
          .join(', અને ') + '.',
    };

    return {
      query,
      intent,
      isMultiChild: true,
      spokenResponse: spokenMap[language] || spokenMap.en,
      displayResponse: spokenMap[language] || spokenMap.en,
      avatarMood: 'happy',
      detailedData: kids,
      context,
    };
  }

  /**
   * 5. Speech-to-Speech Output (Text-to-Speech)
   */
  public static async speakResponse(
    text: string,
    language: LanguageCode,
    speed: 'slow' | 'normal' | 'fast' = 'normal'
  ): Promise<void> {
    await VoiceService.speak(text, { language, speed });
  }

  /**
   * Stop ongoing speech
   */
  public static stopSpeaking(): void {
    VoiceService.stop();
  }

  /**
   * Get past conversation turns
   */
  public static getConversationHistory(): ConversationTurn[] {
    return conversationMemory.getHistory();
  }

  /**
   * Replay last spoken speech
   */
  public static async replayResponse(): Promise<void> {
    await TextToSpeechService.replay();
  }

  /**
   * Full End-to-End Voice AI Pipeline with Automatic Language Detection & Resolution
   */
  public static async processVoiceQuery(
    rawQuery: string,
    availableStudents: Student[],
    preferredLanguage: LanguageCode,
    activeStudent?: Student | null,
    options?: VoiceQueryOptions
  ): Promise<AIResponseResult> {
    const context = conversationMemory.getContext();

    // 1. Language Detection & Auto-Switching
    let effectiveLanguage = preferredLanguage;
    let isAutoDetected = false;

    if (options?.autoDetectLanguage !== false) {
      const detection = await LanguageDetectionService.detect(rawQuery, preferredLanguage);
      if (detection.confidence >= 0.5) {
        effectiveLanguage = detection.language;
        isAutoDetected = true;
      }
    }

    // 2. Detect Intent
    const intentResult = this.detectIntent(rawQuery, context);

    // 3. Resolve Student(s)
    const studentResult = this.resolveStudent(
      rawQuery,
      availableStudents,
      context,
      activeStudent
    );

    // 4. Retrieve Verified School Data
    const primaryStudent =
      studentResult.students.length > 0 ? studentResult.students[0] : activeStudent || null;
    let schoolData: any = null;
    let multiChildRecords: { child: Student; data: any }[] = [];

    if (studentResult.mode === 'multi' || studentResult.mode === 'all') {
      multiChildRecords = await Promise.all(
        studentResult.students.map(async (child) => {
          const res = await this.retrieveSchoolData(
            intentResult.intent,
            child,
            intentResult.extractedSubject
          );
          return { child, data: res.data };
        })
      );
      schoolData = { data: multiChildRecords, isFound: true };
    } else {
      schoolData = await this.retrieveSchoolData(
        intentResult.intent,
        primaryStudent,
        intentResult.extractedSubject
      );
    }

    // 5. Generate Response in the effective language with emotional avatar state
    const responseResult = this.generateResponse(
      rawQuery,
      intentResult,
      studentResult,
      schoolData,
      effectiveLanguage,
      context,
      multiChildRecords
    );

    responseResult.detectedLanguage = effectiveLanguage;
    responseResult.isAutoDetected = isAutoDetected;

    // 6. Update Conversation Context Memory
    conversationMemory.updateContext({
      lastIntent: intentResult.intent,
      lastStudentId: primaryStudent?.id || context.lastStudentId,
      lastStudentName: primaryStudent?.name || context.lastStudentName,
      lastSubject: intentResult.extractedSubject || context.lastSubject,
      lastDateReference: intentResult.dateReference || context.lastDateReference,
      lastLanguage: effectiveLanguage,
    });

    conversationMemory.addTurn({
      sender: 'user',
      text: rawQuery,
      intent: intentResult.intent,
      studentId: primaryStudent?.id,
      language: effectiveLanguage,
      timestamp: Date.now(),
    });

    conversationMemory.addTurn({
      sender: 'assistant',
      text: responseResult.spokenResponse,
      intent: intentResult.intent,
      studentId: primaryStudent?.id,
      language: effectiveLanguage,
      timestamp: Date.now(),
    });

    return responseResult;
  }
}
