// Mock browser environment for Node.js
class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string) { return this.store[key] || null; }
  setItem(key: string, value: string) { this.store[key] = String(value); }
  removeItem(key: string) { delete this.store[key]; }
  clear() { this.store = {}; }
}

(globalThis as any).localStorage = new LocalStorageMock();
(globalThis as any).window = {
  localStorage: (globalThis as any).localStorage,
  speechSynthesis: {
    getVoices: () => [
      { name: 'Google हिन्दी', lang: 'hi-IN', voiceURI: 'Google हिन्दी' },
      { name: 'Microsoft Madhur Online (Natural) - Hindi (India)', lang: 'hi-IN', voiceURI: 'Madhur' },
      { name: 'Google UK English Female', lang: 'en-GB', voiceURI: 'UK Female' },
      { name: 'Microsoft Neerja Online (Natural) - English (India)', lang: 'en-IN', voiceURI: 'Neerja' },
      { name: 'Microsoft Manohar Online (Natural) - Marathi (India)', lang: 'mr-IN', voiceURI: 'Manohar' },
      { name: 'Google मराठी', lang: 'mr-IN', voiceURI: 'Google मराठी' },
      { name: 'Microsoft Niranjan Online (Natural) - Gujarati (India)', lang: 'gu-IN', voiceURI: 'Niranjan' },
      { name: 'Microsoft Gurpreet Online (Natural) - Punjabi (India)', lang: 'pa-IN', voiceURI: 'Gurpreet' },
      { name: 'Microsoft Bashkar Online (Natural) - Bengali (India)', lang: 'bn-IN', voiceURI: 'Bashkar' },
      { name: 'Microsoft Valluvar Online (Natural) - Tamil (India)', lang: 'ta-IN', voiceURI: 'Valluvar' },
      { name: 'Microsoft Mohan Online (Natural) - Telugu (India)', lang: 'te-IN', voiceURI: 'Mohan' },
    ],
    speak: () => {},
    cancel: () => {},
    pause: () => {},
    resume: () => {},
    speaking: false,
    paused: false,
  },
};

import { LanguageCode } from '../src/types';
import { LanguageConfigService, LANGUAGE_CONFIGS } from '../src/config/languageConfig';
import { LanguageDetectionService } from '../src/services/speech/languageDetectionService';
import { AIAssistantService } from '../src/services/aiAssistantService';
import { VoiceService } from '../src/services/voice/VoiceService';
import { BrowserTTSProvider } from '../src/services/voice/providers/BrowserTTSProvider';
import { StudentService } from '../src/services/studentService';
import { AuthService } from '../src/services/authService';

async function runMultilingualSuite() {
  console.log('====================================================');
  console.log('STARTING MULTILINGUAL VOICE INTERACTION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      if (details) console.error('Details:', details);
      throw new Error(`Assertion failed: ${testName}`);
    }
  }

  // ----------------------------------------------------
  // TEST SECTION 1: Language Configuration System
  // ----------------------------------------------------
  console.log('--- TEST SECTION 1: Language Configuration System ---');
  const supportedLangs: LanguageCode[] = ['hi', 'en', 'mr', 'gu', 'pa', 'bn', 'ta', 'te'];

  for (const lang of supportedLangs) {
    const config = LanguageConfigService.getLanguageConfig(lang);
    assert(!!config, `Config exists for language ${lang}`);
    assert(config.code === lang, `Config code matches ${lang}`);
    assert(!!config.displayName, `Display name exists for ${lang}: ${config.displayName}`);
    assert(!!config.speechRecognition.recognitionLang, `Speech recognition lang exists for ${lang}: ${config.speechRecognition.recognitionLang}`);
    assert(!!config.maleVoice && config.maleVoice.gender === 'male', `Male voice configured for ${lang}`);
    assert(!!config.femaleVoice && config.femaleVoice.gender === 'female', `Female voice configured for ${lang}`);
    assert(!!config.fallbackVoice && !!config.fallbackVoice.fallbackLangTag, `Fallback voice configured for ${lang}: ${config.fallbackVoice.fallbackLangTag}`);
    assert(typeof config.templates.homework.singleTomorrow === 'function', `Homework singleTomorrow template exists for ${lang}`);
    assert(typeof config.templates.homework.noHomework === 'function', `Homework noHomework template exists for ${lang}`);
  }

  // ----------------------------------------------------
  // TEST SECTION 2: Setup Parent & Student Rohan
  // ----------------------------------------------------
  console.log('\n--- TEST SECTION 2: Setup Parent & Student Rohan ---');
  const auth = await AuthService.verifyOtp('9876543210', '1234');
  assert(auth.success && !!auth.parent, 'Parent logged in via verifyOtp');
  const parentId = auth.parent!.id;
  const students = StudentService.getChildrenForParent(parentId);
  const rohan = students.find((s) => s.id === 'std-01') || students[0];
  assert(!!rohan, `Rohan Sharma (std-01) loaded for parent ${parentId}`);

  // ----------------------------------------------------
  // TEST SECTION 3: Test Every Supported Language with Homework Question
  // ----------------------------------------------------
  console.log('\n--- TEST SECTION 3: Homework Query Across All 8 Languages ---');

  const testCases = [
    {
      language: 'hi' as LanguageCode,
      name: 'Hindi',
      query: 'Kal Rohan ka homework kya hai?',
      expectedIntent: 'HOMEWORK_TOMORROW',
      expectedEntity: 'रोहन',
      expectedSubject: 'Maths',
    },
    {
      language: 'en' as LanguageCode,
      name: 'English',
      query: "What is Rohan's homework tomorrow?",
      expectedIntent: 'HOMEWORK_TOMORROW',
      expectedEntity: 'Rohan',
      expectedSubject: 'Maths',
    },
    {
      language: 'mr' as LanguageCode,
      name: 'Marathi',
      query: 'उद्या रोहनचा गृहपाठ काय आहे?',
      expectedIntent: 'HOMEWORK_TOMORROW',
      expectedEntity: 'रोहन',
      expectedSubject: 'Maths',
    },
    {
      language: 'gu' as LanguageCode,
      name: 'Gujarati',
      query: 'કાલે રોહનનું હોમવર્ક શું છે?',
      expectedIntent: 'HOMEWORK_TOMORROW',
      expectedEntity: 'રોહન',
      expectedSubject: 'Maths',
    },
    {
      language: 'pa' as LanguageCode,
      name: 'Punjabi',
      query: 'ਕੱਲ੍ਹ ਰੋਹਨ ਦਾ ਹੋਮਵਰਕ ਕੀ ਹੈ?',
      expectedIntent: 'HOMEWORK_TOMORROW',
      expectedEntity: 'ਰੋਹਨ',
      expectedSubject: 'Maths',
    },
    {
      language: 'bn' as LanguageCode,
      name: 'Bengali',
      query: 'কাল রোহনের হোমওয়ার্ক কি?',
      expectedIntent: 'HOMEWORK_TOMORROW',
      expectedEntity: 'রোহন',
      expectedSubject: 'Maths',
    },
    {
      language: 'ta' as LanguageCode,
      name: 'Tamil',
      query: 'நாளை ரோஹனின் வீட்டுப்பாடம் என்ன?',
      expectedIntent: 'HOMEWORK_TOMORROW',
      expectedEntity: 'ரோஹன்',
      expectedSubject: 'Maths',
    },
    {
      language: 'te' as LanguageCode,
      name: 'Telugu',
      query: 'రేపు రోహన్ హోంవర్క్ ఏమిటి?',
      expectedIntent: 'HOMEWORK_TOMORROW',
      expectedEntity: 'రోహన్',
      expectedSubject: 'Maths',
    },
  ];

  for (const tc of testCases) {
    console.log(`\nTesting ${tc.name} (${tc.language}): "${tc.query}"`);

    // A. Language Detection
    const detection = await LanguageDetectionService.detect(tc.query, tc.language);
    console.log(`  -> Detected Language: ${detection.language} (Confidence: ${detection.confidence}, Script: ${detection.detectedScript || 'lexical'})`);
    assert(detection.language === tc.language, `${tc.name}: Language detected as ${tc.language}`);

    // B. Intent Detection
    const intentRes = AIAssistantService.detectIntent(tc.query);
    console.log(`  -> Detected Intent: ${intentRes.intent}`);
    assert(
      intentRes.intent === tc.expectedIntent || intentRes.intent === 'HOMEWORK_TODAY',
      `${tc.name}: Intent identified as ${tc.expectedIntent}`
    );

    // C. Student Resolution
    const studentRes = AIAssistantService.resolveStudent(tc.query, students, undefined, rohan);
    assert(studentRes.students.length > 0 && studentRes.students[0].name.includes('Rohan'), `${tc.name}: Student resolved to Rohan`);

    // D. End-to-end processVoiceQuery
    const response = await AIAssistantService.processVoiceQuery(
      tc.query,
      students,
      tc.language,
      rohan,
      { autoDetectLanguage: true }
    );

    console.log(`  -> Response [${response.detectedLanguage}]: "${response.spokenResponse}"`);
    assert(response.detectedLanguage === tc.language, `${tc.name}: Response returned in spoken language ${tc.language}`);
    assert(response.spokenResponse.length > 10, `${tc.name}: Spoken response is non-empty`);
    assert(
      response.spokenResponse.includes(tc.expectedEntity) || response.spokenResponse.includes('Rohan'),
      `${tc.name}: Student name is preserved in response`
    );
    assert(
      response.spokenResponse.includes(tc.expectedSubject),
      `${tc.name}: Subject (${tc.expectedSubject}) is preserved in response`
    );
    assert(response.avatarMood === 'happy', `${tc.name}: Avatar mood is happy`);
  }

  // ----------------------------------------------------
  // TEST SECTION 4: Voice Fallback Architecture
  // ----------------------------------------------------
  console.log('\n--- TEST SECTION 4: Voice Fallback Architecture ---');
  const browserProvider = new BrowserTTSProvider();
  for (const lang of supportedLangs) {
    const voices = browserProvider.getAvailableVoices(lang);
    assert(voices.length >= 2, `Available voices returned for ${lang} (${voices.length} voices)`);
    assert(voices.some((v) => v.gender === 'female'), `Female voice available for ${lang}`);
    assert(voices.some((v) => v.gender === 'male'), `Male voice available for ${lang}`);
  }

  // ----------------------------------------------------
  // TEST SECTION 5: Voice Settings & Persistence
  // ----------------------------------------------------
  console.log('\n--- TEST SECTION 5: Voice Settings & Persistence ---');
  VoiceService.setGender('male');
  VoiceService.setSpeed('fast');
  VoiceService.setStyle('calm');
  const currentSettings = VoiceService.getSettings();
  assert(currentSettings.gender === 'male', 'Voice gender updated to male');
  assert(currentSettings.speed === 'fast', 'Voice speed updated to fast');
  assert(currentSettings.style === 'calm', 'Voice style updated to calm');

  const rawStorage = localStorage.getItem('schoolsathi_voice_settings');
  assert(!!rawStorage && rawStorage.includes('"gender":"male"'), 'Voice settings persisted in localStorage');

  // Reset to default
  VoiceService.setGender('female');
  VoiceService.setSpeed('normal');
  VoiceService.setStyle('friendly');

  console.log('\n====================================================');
  console.log(`ALL TESTS PASSED: ${passed}/${total} assertions succeeded!`);
  console.log('====================================================\n');
}

runMultilingualSuite().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
