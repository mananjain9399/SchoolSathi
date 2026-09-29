import { LanguageCode, VoiceGender } from '../types';

export interface SpeechRecognitionConfig {
  recognitionLang: string; // BCP-47 tag, e.g. 'hi-IN', 'mr-IN', 'gu-IN'
  fallbackRecognitionLang: string; // e.g. 'hi-IN' or 'en-IN'
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

export interface VoiceProfileConfig {
  gender: VoiceGender;
  langTag: string; // BCP-47 tag e.g. 'hi-IN', 'mr-IN'
  preferredVoiceNames: string[]; // Browser speech synthesis voice names
  cloudVoiceCode: string; // High-quality cloud neural voice code
  pitch: number; // Pitch baseline
  rate: number; // Rate baseline
}

export interface FallbackVoiceConfig {
  fallbackLanguage: LanguageCode;
  fallbackLangTag: string;
  maleVoice: VoiceProfileConfig;
  femaleVoice: VoiceProfileConfig;
}

export interface LanguageHomeworkTemplates {
  singleTomorrow: (studentName: string, subject: string, description: string) => string;
  singleToday: (studentName: string, subject: string, description: string) => string;
  multiTomorrow: (studentName: string, summary: string) => string;
  multiToday: (studentName: string, summary: string) => string;
  noHomework: (studentName: string) => string;
  onDate: (dateLabel: string, studentName: string, subject: string, description: string) => string;
}

export interface LanguageTemplates {
  homework: LanguageHomeworkTemplates;
  unknown: string;
  help: string;
  dataError: string;
  notFound: string;
  clarificationPrompt: (names: string[]) => string;
  switchChild: (studentName: string) => string;
  examSchedule: (
    studentName: string,
    subject: string,
    date: string,
    time: string,
    title?: string,
    syllabus?: string
  ) => string;
  nextExam: (
    studentName: string,
    prevSubject: string,
    nextSubject: string,
    date: string,
    time?: string
  ) => string;
  attendance: (studentName: string, isPresent: boolean, percentage: number) => string;
  progress: (studentName: string, grade: string, overall: string, remark?: string) => string;
  timetable: (studentName: string, scheduleSummary: string) => string;
  studentInfo: (
    studentName: string,
    className: string,
    section: string,
    rollNo: string,
    schoolName?: string,
    studentId?: string
  ) => string;
  holiday: (holidayTitle: string, startDate: string, daysCount: number) => string;
  announcement: (title: string, message: string) => string;
  schoolInfo: (schoolName: string, city: string, timings?: string, phone?: string) => string;
}

export interface LanguageKeywords {
  homework: string[];
  tomorrow: string[];
  today: string[];
  exams: string[];
  attendance: string[];
  progress: string[];
  holidays: string[];
  timetable: string[];
  announcements: string[];
  help: string[];
}

export interface LanguageConfig {
  code: LanguageCode;
  name: string; // Native name e.g. 'हिन्दी'
  englishName: string; // English name e.g. 'Hindi'
  displayName: string; // 'हिन्दी (Hindi)'
  greeting: string;
  sampleAudioText: string;
  homeworkQueryExample: string;

  speechRecognition: SpeechRecognitionConfig;
  maleVoice: VoiceProfileConfig;
  femaleVoice: VoiceProfileConfig;
  fallbackVoice: FallbackVoiceConfig;
  keywords: LanguageKeywords;
  templates: LanguageTemplates;
}

// ==========================================
// CENTRAL CONFIGURATIONS FOR 8 INITIAL LANGUAGES
// ==========================================

export const LANGUAGE_CONFIGS: Record<LanguageCode, LanguageConfig> = {
  // 1. HINDI (hi)
  hi: {
    code: 'hi',
    name: 'हिन्दी',
    englishName: 'Hindi',
    displayName: 'हिन्दी (Hindi)',
    greeting: 'नमस्ते! मैं स्कूलसाथी हूँ।',
    sampleAudioText: 'नमस्ते! मैं स्कूलसाथी हूँ। आपके बच्चे की पढ़ाई में आपका सच्चा साथी।',
    homeworkQueryExample: 'कल रोहन का होमवर्क क्या है?',
    speechRecognition: {
      recognitionLang: 'hi-IN',
      fallbackRecognitionLang: 'en-IN',
      continuous: false,
      interimResults: true,
      maxAlternatives: 1,
    },
    maleVoice: {
      gender: 'male',
      langTag: 'hi-IN',
      preferredVoiceNames: [
        'hi-IN-Standard-B',
        'Google हिन्दी',
        'Microsoft Madhur Online (Natural) - Hindi (India)',
        'Microsoft Madhur',
        'Ravi',
        'Hemant',
        'Hindi Male',
      ],
      cloudVoiceCode: 'hi-IN-Neural2-B',
      pitch: 0.92,
      rate: 0.98,
    },
    femaleVoice: {
      gender: 'female',
      langTag: 'hi-IN',
      preferredVoiceNames: [
        'hi-IN-Standard-A',
        'Google हिन्दी',
        'Microsoft Swara Online (Natural) - Hindi (India)',
        'Microsoft Swara',
        'Kalpana',
        'Hindi Female',
      ],
      cloudVoiceCode: 'hi-IN-Neural2-A',
      pitch: 1.18,
      rate: 0.98,
    },
    fallbackVoice: {
      fallbackLanguage: 'en',
      fallbackLangTag: 'en-IN',
      maleVoice: {
        gender: 'male',
        langTag: 'en-IN',
        preferredVoiceNames: ['Microsoft Prabhat', 'Ravi', 'David', 'English India Male'],
        cloudVoiceCode: 'en-IN-Neural2-B',
        pitch: 0.92,
        rate: 0.98,
      },
      femaleVoice: {
        gender: 'female',
        langTag: 'en-IN',
        preferredVoiceNames: ['Microsoft Neerja', 'Heera', 'Zira', 'English India Female'],
        cloudVoiceCode: 'en-IN-Neural2-A',
        pitch: 1.15,
        rate: 0.98,
      },
    },
    keywords: {
      homework: [
        'homework',
        'home work',
        'hw',
        'गृहकार्य',
        'गृह कार्य',
        'काम',
        'असाइनमेंट',
        'kya karna hai',
        'kya kaam hai',
      ],
      tomorrow: ['kal', 'कल', 'कल का', 'आने वाला कल'],
      today: ['aaj', 'आज', 'आज का'],
      exams: ['exam', 'exams', 'pariksha', 'परीक्षा', 'इम्तिहान', 'datesheet', 'test'],
      attendance: ['attendance', 'upasthiti', 'उपस्थिति', 'hazari', 'हाज़िरी', 'present', 'absent'],
      progress: ['progress', 'pragati', 'प्रगति', 'marks', 'ank', 'अंक', 'result', 'grade'],
      holidays: ['holiday', 'holidays', 'chhutti', 'chhuttiya', 'छुट्टी', 'छुट्टियां'],
      timetable: ['timetable', 'time table', 'samaysarni', 'समय सारणी', 'schedule'],
      announcements: ['notice', 'circular', 'suchna', 'सूचना', 'announcement'],
      help: ['help', 'madad', 'मदद', 'sahayata', 'सहायता', 'guide'],
    },
    templates: {
      homework: {
        singleTomorrow: (name, sub, desc) => `Kal ${name} ka ${sub} homework hai: ${desc}.`,
        singleToday: (name, sub, desc) => `Aaj ${name} ka ${sub} homework hai: ${desc}.`,
        multiTomorrow: (name, summary) => `Kal ${name} ka homework hai: ${summary}.`,
        multiToday: (name, summary) => `Aaj ${name} ka homework hai: ${summary}.`,
        noHomework: (name) => `${name} ke liye koi homework record nahi hai.`,
        onDate: (dateLabel, name, sub, desc) =>
          `${dateLabel} ko ${name} ka ${sub} homework hai: ${desc}.`,
      },
      unknown:
        'क्षमा करें, मुझे यह समझ नहीं आया। आप मुझसे गृहकार्य, परीक्षा, उपस्थिति, प्रगति या छुट्टियों के बारे में पूछ सकते हैं।',
      help: 'मैं आपके बच्चे के गृहकार्य, आगामी परीक्षाओं, आज की उपस्थिति, प्रगति रिपोर्ट, स्कूल की छुट्टियों और समय सारणी की जानकारी दे सकता हूँ। आप आसानी से बोलकर पूछ सकते हैं!',
      dataError: 'मैं अभी स्कूल रिकॉर्ड्स एक्सेस नहीं कर सका। कृपया दोबारा प्रयास करें।',
      notFound: 'मुझे आपके स्कूल से अभी यह जानकारी नहीं मिली है।',
      clarificationPrompt: (names) => `क्या आप ${names.join(' या ')} के बारे में पूछ रहे हैं?`,
      switchChild: (name) => `${name} पर स्विच कर दिया गया है।`,
      examSchedule: (name, sub, date, time, title, syllabus) =>
        `${name} का ${sub} exam ${date} (${time}) को है। ${title ? title + '।' : ''}${syllabus ? ' Syllabus: ' + syllabus + '।' : ''}`,
      nextExam: (name, prevSub, nextSub, date) =>
        `${prevSub} के बाद ${name} का अगला exam ${nextSub} का है, ${date} को।`,
      attendance: (name, isPres, pct) =>
        `${name} आज ${isPres ? 'उपस्थित' : 'अनुपस्थित'} है। कुल उपस्थिति ${pct}% है।`,
      progress: (name, grade, overall, remark) =>
        `${name} की शैक्षणिक प्रगति Grade ${grade} और ${overall} है।${remark ? ` शिक्षक की टिप्पणी: "${remark}"।` : ''}`,
      timetable: (name, summary) => `${name} का आज का टाइम-टेबल: ${summary}।`,
      studentInfo: (name, cls, sec, rollNo, schoolName) =>
        `${name}, ${cls} - सेक्शन ${sec} में है। रोल नंबर ${rollNo} है।${schoolName ? ` स्कूल: ${schoolName}।` : ''}`,
      holiday: (title, startDate, daysCount) =>
        `स्कूल में अगली छुट्टी ${title} की है, ${startDate} से (${daysCount} दिन)।`,
      announcement: (title, message) => `स्कूल का ताज़ा नोटिस: ${title}। ${message}`,
      schoolInfo: (schoolName, city, timings, phone) =>
        `${schoolName}, ${city} में स्थित है।${timings ? ` समय: ${timings}।` : ''}${phone ? ` हेल्पलाइन: ${phone}।` : ''}`,
    },
  },

  // 2. ENGLISH (en)
  en: {
    code: 'en',
    name: 'English',
    englishName: 'English',
    displayName: 'English',
    greeting: 'Namaste! I am SchoolSathi.',
    sampleAudioText:
      'Hello! I am SchoolSathi. Your friendly companion for your child’s school updates.',
    homeworkQueryExample: "What is Rohan's homework tomorrow?",
    speechRecognition: {
      recognitionLang: 'en-IN',
      fallbackRecognitionLang: 'en-US',
      continuous: false,
      interimResults: true,
      maxAlternatives: 1,
    },
    maleVoice: {
      gender: 'male',
      langTag: 'en-IN',
      preferredVoiceNames: [
        'en-IN-Standard-B',
        'Google UK English Male',
        'Microsoft Prabhat Online (Natural) - English (India)',
        'Microsoft Prabhat',
        'Ravi',
        'David',
        'George',
      ],
      cloudVoiceCode: 'en-IN-Neural2-B',
      pitch: 0.92,
      rate: 0.98,
    },
    femaleVoice: {
      gender: 'female',
      langTag: 'en-IN',
      preferredVoiceNames: [
        'en-IN-Standard-A',
        'Google UK English Female',
        'Microsoft Neerja Online (Natural) - English (India)',
        'Microsoft Neerja',
        'Heera',
        'Zira',
        'Samantha',
      ],
      cloudVoiceCode: 'en-IN-Neural2-A',
      pitch: 1.15,
      rate: 0.98,
    },
    fallbackVoice: {
      fallbackLanguage: 'en',
      fallbackLangTag: 'en-US',
      maleVoice: {
        gender: 'male',
        langTag: 'en-US',
        preferredVoiceNames: ['Google US English', 'Microsoft David', 'Alex'],
        cloudVoiceCode: 'en-US-Neural2-D',
        pitch: 0.92,
        rate: 0.98,
      },
      femaleVoice: {
        gender: 'female',
        langTag: 'en-US',
        preferredVoiceNames: ['Google US English', 'Microsoft Zira', 'Victoria'],
        cloudVoiceCode: 'en-US-Neural2-F',
        pitch: 1.15,
        rate: 0.98,
      },
    },
    keywords: {
      homework: ['homework', 'home work', 'hw', 'assignment', 'task', 'project', 'exercises'],
      tomorrow: ['tomorrow', 'next day'],
      today: ['today'],
      exams: ['exam', 'exams', 'test', 'assessment', 'datesheet', 'date sheet', 'schedule'],
      attendance: ['attendance', 'present', 'absent', 'presence'],
      progress: ['progress', 'marks', 'grades', 'score', 'report card', 'percentage'],
      holidays: ['holiday', 'holidays', 'vacation', 'break', 'off day', 'closed'],
      timetable: ['timetable', 'time table', 'schedule', 'periods', 'routine'],
      announcements: ['notice', 'circular', 'announcement', 'notification'],
      help: ['help', 'assist', 'what can you do', 'features', 'how to use'],
    },
    templates: {
      homework: {
        singleTomorrow: (name, sub, desc) => `Tomorrow ${name} has ${sub} homework: ${desc}.`,
        singleToday: (name, sub, desc) => `Today ${name} has ${sub} homework: ${desc}.`,
        multiTomorrow: (name, summary) => `Tomorrow ${name} has homework in ${summary}.`,
        multiToday: (name, summary) => `Today ${name} has homework in ${summary}.`,
        noHomework: (name) => `There is no homework recorded for ${name}.`,
        onDate: (dateLabel, name, sub, desc) =>
          `On ${dateLabel}, ${name} has ${sub} homework: ${desc}.`,
      },
      unknown:
        "Sorry, I didn't understand that. You can ask me about homework, exams, attendance, progress, or school holidays.",
      help: "I can help you check homework, upcoming exams, today's attendance, report card marks, school holidays, timetables, and announcements. Just ask naturally!",
      dataError: "I couldn't access the school records right now. Please try again.",
      notFound: "I don't have that information from the school yet.",
      clarificationPrompt: (names) => `Do you mean ${names.join(' or ')}?`,
      switchChild: (name) => `Switched to ${name}. How can I help with ${name}'s school updates?`,
      examSchedule: (name, sub, date, time, title, syllabus) =>
        `${name}'s ${sub} exam is on ${date} (${time}). ${title ? title + '. ' : ''}${syllabus ? 'Syllabus: ' + syllabus + '.' : ''}`,
      nextExam: (name, prevSub, nextSub, date, time) =>
        `After ${prevSub}, ${name}'s next exam is ${nextSub} on ${date}${time ? ` (${time})` : ''}.`,
      attendance: (name, isPres, pct) =>
        `${name} is ${isPres ? 'present' : 'absent'} today. Overall attendance is ${pct}%.`,
      progress: (name, grade, overall, remark) =>
        `${name}'s academic progress is Grade ${grade} with ${overall}.${remark ? ` Teacher's remark: "${remark}".` : ''}`,
      timetable: (name, summary) => `${name}'s schedule for today: ${summary}.`,
      studentInfo: (name, cls, sec, rollNo, schoolName) =>
        `${name} is in ${cls} - Section ${sec}, Roll Number ${rollNo}.${schoolName ? ` School: ${schoolName}.` : ''}`,
      holiday: (title, startDate, daysCount) =>
        `Next school holiday is for ${title} on ${startDate} (${daysCount} days).`,
      announcement: (title, message) => `Latest school notice: ${title}. ${message}`,
      schoolInfo: (schoolName, city, timings, phone) =>
        `${schoolName} is located in ${city}.${timings ? ` School timings are ${timings}.` : ''}${phone ? ` Helpline: ${phone}.` : ''}`,
    },
  },

  // 3. MARATHI (mr)
  mr: {
    code: 'mr',
    name: 'मराठी',
    englishName: 'Marathi',
    displayName: 'मराठी (Marathi)',
    greeting: 'नमस्कार! मी स्कूलसाथी आहे.',
    sampleAudioText:
      'नमस्कार! मी स्कूलसाथी आहे. आपल्या मुलाच्या शाळेची सर्व माहिती येथे मिळेल.',
    homeworkQueryExample: 'उद्या रोहनचा गृहपाठ काय आहे?',
    speechRecognition: {
      recognitionLang: 'mr-IN',
      fallbackRecognitionLang: 'hi-IN',
      continuous: false,
      interimResults: true,
      maxAlternatives: 1,
    },
    maleVoice: {
      gender: 'male',
      langTag: 'mr-IN',
      preferredVoiceNames: [
        'mr-IN-Standard-B',
        'Microsoft Manohar Online (Natural) - Marathi (India)',
        'Microsoft Manohar',
        'Google मराठी',
        'mr-IN-Wavenet-B',
      ],
      cloudVoiceCode: 'mr-IN-Wavenet-B',
      pitch: 0.9,
      rate: 0.98,
    },
    femaleVoice: {
      gender: 'female',
      langTag: 'mr-IN',
      preferredVoiceNames: [
        'mr-IN-Standard-A',
        'Microsoft Aarohi Online (Natural) - Marathi (India)',
        'Microsoft Aarohi',
        'Google मराठी',
        'mr-IN-Wavenet-A',
      ],
      cloudVoiceCode: 'mr-IN-Wavenet-A',
      pitch: 1.16,
      rate: 0.98,
    },
    fallbackVoice: {
      fallbackLanguage: 'hi',
      fallbackLangTag: 'hi-IN',
      maleVoice: {
        gender: 'male',
        langTag: 'hi-IN',
        preferredVoiceNames: ['Microsoft Madhur', 'Google हिन्दी', 'Ravi'],
        cloudVoiceCode: 'hi-IN-Neural2-B',
        pitch: 0.9,
        rate: 0.98,
      },
      femaleVoice: {
        gender: 'female',
        langTag: 'hi-IN',
        preferredVoiceNames: ['Microsoft Swara', 'Google हिन्दी', 'Kalpana'],
        cloudVoiceCode: 'hi-IN-Neural2-A',
        pitch: 1.16,
        rate: 0.98,
      },
    },
    keywords: {
      homework: [
        'गृहपाठ',
        'अभ्यास',
        'घरचा अभ्यास',
        'homework',
        'home work',
        'hw',
        'काय करायचे आहे',
        'काय काम आहे',
      ],
      tomorrow: ['उद्या', 'udya', 'उद्याचा', 'उद्याची', 'उद्याचे', 'उद्या काय आहे'],
      today: ['आज', 'aaj', 'आजचा', 'आजची', 'आजचे'],
      exams: ['परीक्षा', 'pariksha', 'इम्तिहान', 'चाचणी', 'पेपर कधी'],
      attendance: ['हजेरी', 'उपस्थिती', 'hajar', 'हजर', 'गैरहजर'],
      progress: ['प्रगती', 'गुण', 'गुणांकन', 'निकाल', 'टक्केवारी'],
      holidays: ['सुट्टी', 'सुट्ट्या', 'sutti', 'शाळा कधी सुरू'],
      timetable: ['वेळापत्रक', 'तासिका', 'वेळ'],
      announcements: ['सूचना', 'परिपत्रक', 'नोटीस'],
      help: ['मदत', 'मदत करा', 'कसे वापरावे', 'मार्गदर्शन'],
    },
    templates: {
      homework: {
        singleTomorrow: (name, sub, desc) =>
          `उद्या ${name} ला ${sub} चा गृहपाठ आहे: ${desc}.`,
        singleToday: (name, sub, desc) =>
          `आज ${name} ला ${sub} चा गृहपाठ आहे: ${desc}.`,
        multiTomorrow: (name, summary) =>
          `उद्या ${name} ला गृहपाठ आहे: ${summary}.`,
        multiToday: (name, summary) =>
          `आज ${name} ला गृहपाठ आहे: ${summary}.`,
        noHomework: (name) => `${name} साठी कोणताही गृहपाठ नोंदवलेला नाही.`,
        onDate: (dateLabel, name, sub, desc) =>
          `${dateLabel} रोजी ${name} ला ${sub} चा गृहपाठ आहे: ${desc}.`,
      },
      unknown:
        'क्षमस्व, मला ते समजले नाही. आपण मला गृहपाठ, परीक्षा, हजेरी, प्रगती किंवा सुट्ट्यांबद्दल विचारू शकता.',
      help: 'मी आपल्या पाल्याचा गृहपाठ, परीक्षांचे वेळापत्रक, आजची हजेरी, निकाल आणि शाळेच्या सुट्ट्यांची माहिती देऊ शकतो. सहजपणे बोलून विचारा!',
      dataError: 'शाळेचे रेकॉर्ड्स मिळवण्यात अडचण येत आहे. कृपया पुन्हा प्रयत्न करा.',
      notFound: 'शाळेकडून अद्याप ही माहिती उपलब्ध झालेली नाही.',
      clarificationPrompt: (names) => `आपण ${names.join(' की ')} बद्दल विचारत आहात?`,
      switchChild: (name) => `${name} वर स्विच केले आहे.`,
      examSchedule: (name, sub, date, time, title, syllabus) =>
        `${name} ची ${sub} ची परीक्षा ${date} रोजी (${time}) आहे.${title ? ' ' + title + '.' : ''}${syllabus ? ' अभ्यासक्रम: ' + syllabus + '.' : ''}`,
      nextExam: (name, prevSub, nextSub, date) =>
        `${prevSub} नंतर ${name} ची पुढची परीक्षा ${nextSub} ची ${date} रोजी आहे.`,
      attendance: (name, isPres, pct) =>
        `${name} आज ${isPres ? 'हजर' : 'गैरहजर'} आहे. एकूण हजेरी ${pct}% आहे.`,
      progress: (name, grade, overall, remark) =>
        `${name} ची शैक्षणिक प्रगती ग्रेड ${grade} आणि ${overall} आहे.${remark ? ` शिक्षकांचा अभिप्राय: "${remark}".` : ''}`,
      timetable: (name, summary) => `${name} चे आजचे वेळापत्रक: ${summary}.`,
      studentInfo: (name, cls, sec, rollNo, schoolName) =>
        `${name}, ${cls} - तुकडी ${sec} मध्ये आहे. हजेरी क्रमांक ${rollNo} आहे.${schoolName ? ` शाळा: ${schoolName}.` : ''}`,
      holiday: (title, startDate, daysCount) =>
        `शाळेची पुढची सुट्टी ${title} साठी ${startDate} पासून (${daysCount} दिवस) आहे.`,
      announcement: (title, message) => `शाळेची ताजी सूचना: ${title}. ${message}`,
      schoolInfo: (schoolName, city, timings, phone) =>
        `${schoolName}, ${city} येथे आहे.${timings ? ` वेळ: ${timings}.` : ''}${phone ? ` संपर्क: ${phone}.` : ''}`,
    },
  },

  // 4. GUJARATI (gu)
  gu: {
    code: 'gu',
    name: 'ગુજરાતી',
    englishName: 'Gujarati',
    displayName: 'ગુજરાતી (Gujarati)',
    greeting: 'નમસ્તે! હું સ્કૂલસાથી છું.',
    sampleAudioText:
      'નમસ્તે! હું સ્કૂલસાથી છું. તમારા બાળકના શાળાના સમાચાર માટે સાચો સાથી.',
    homeworkQueryExample: 'કાલે રોહનનું હોમવર્ક શું છે?',
    speechRecognition: {
      recognitionLang: 'gu-IN',
      fallbackRecognitionLang: 'hi-IN',
      continuous: false,
      interimResults: true,
      maxAlternatives: 1,
    },
    maleVoice: {
      gender: 'male',
      langTag: 'gu-IN',
      preferredVoiceNames: [
        'gu-IN-Standard-B',
        'Microsoft Niranjan Online (Natural) - Gujarati (India)',
        'Microsoft Niranjan',
        'Google ગુજરાતી',
        'gu-IN-Wavenet-B',
      ],
      cloudVoiceCode: 'gu-IN-Wavenet-B',
      pitch: 0.9,
      rate: 0.98,
    },
    femaleVoice: {
      gender: 'female',
      langTag: 'gu-IN',
      preferredVoiceNames: [
        'gu-IN-Standard-A',
        'Microsoft Dhwani Online (Natural) - Gujarati (India)',
        'Microsoft Dhwani',
        'Google ગુજરાતી',
        'gu-IN-Wavenet-A',
      ],
      cloudVoiceCode: 'gu-IN-Wavenet-A',
      pitch: 1.16,
      rate: 0.98,
    },
    fallbackVoice: {
      fallbackLanguage: 'hi',
      fallbackLangTag: 'hi-IN',
      maleVoice: {
        gender: 'male',
        langTag: 'hi-IN',
        preferredVoiceNames: ['Microsoft Madhur', 'Google हिन्दी', 'Ravi'],
        cloudVoiceCode: 'hi-IN-Neural2-B',
        pitch: 0.9,
        rate: 0.98,
      },
      femaleVoice: {
        gender: 'female',
        langTag: 'hi-IN',
        preferredVoiceNames: ['Microsoft Swara', 'Google हिन्दी', 'Kalpana'],
        cloudVoiceCode: 'hi-IN-Neural2-A',
        pitch: 1.16,
        rate: 0.98,
      },
    },
    keywords: {
      homework: [
        'હોમવર્ક',
        'લેસન',
        'ગૃહકાર્ય',
        'homework',
        'home work',
        'hw',
        'શું કામ છે',
        'કામ',
      ],
      tomorrow: ['કાલે', 'કાલ', 'આવતીકાલે', 'આવતીકાલ', 'kale', 'aavtikal'],
      today: ['આજે', 'આજ', 'aaje'],
      exams: ['પરીક્ષા', 'ટેસ્ટ', 'પેપર ક્યારે', 'pariksha'],
      attendance: ['હાજરી', 'ઉપસ્થિતિ', 'હાજર', 'ગેરહાજર'],
      progress: ['પ્રગતિ', 'ગુણ', 'રિઝલ્ટ', 'માર્ક્સ'],
      holidays: ['રજા', 'રજાઓ', 'વેકેશન', 'શાળા ક્યારે ખુલશે'],
      timetable: ['ટાઈમટેબલ', 'સમયપત્રક', 'સમય'],
      announcements: ['સૂચના', 'પરિપત્ર', 'નોટિસ'],
      help: ['મદદ', 'સહાય', 'કેવી રીતે વાપરવું'],
    },
    templates: {
      homework: {
        singleTomorrow: (name, sub, desc) =>
          `કાલે ${name} નું ${sub} નું હોમવર્ક છે: ${desc}.`,
        singleToday: (name, sub, desc) =>
          `આજે ${name} નું ${sub} નું હોમવર્ક છે: ${desc}.`,
        multiTomorrow: (name, summary) =>
          `કાલે ${name} નું હોમવર્ક છે: ${summary}.`,
        multiToday: (name, summary) =>
          `આજે ${name} નું હોમવર્ક છે: ${summary}.`,
        noHomework: (name) => `${name} માટે કોઈ હોમવર્ક નોંધાયેલું નથી.`,
        onDate: (dateLabel, name, sub, desc) =>
          `${dateLabel} ના રોજ ${name} નું ${sub} નું હોમવર્ક છે: ${desc}.`,
      },
      unknown:
        'માફ કરશો, હું તે સમજી શક્યો નથી. તમે મને હોમવર્ક, પરીક્ષા, હાજરી, પ્રગતિ કે રજાઓ વિશે પૂછી શકો છો.',
      help: 'હું આપને બાળકના લેસન, આવનારી પરીક્ષાઓ, આજની હાજરી, પ્રગતિ પત્રક અને શાળાની રજાઓની માહિતી આપી શકું છું. બોલીને પૂછો!',
      dataError: 'શાળાના રેકોર્ડ મેળવવામાં મુશ્કેલી થઈ રહી છે. કૃપા કરીને ફરી પ્રયાસ કરો.',
      notFound: 'શાળા તરફથી હજી આ માહિતી મળી નથી.',
      clarificationPrompt: (names) => `શું તમે ${names.join(' કે ')} વિશે પૂછી રહ્યા છો?`,
      switchChild: (name) => `${name} પર સ્વિચ કર્યું છે.`,
      examSchedule: (name, sub, date, time, title, syllabus) =>
        `${name} ની ${sub} ની પરીક્ષા ${date} ના રોજ (${time}) છે.${title ? ' ' + title + '.' : ''}${syllabus ? ' અભ્યાસક્રમ: ' + syllabus + '.' : ''}`,
      nextExam: (name, prevSub, nextSub, date) =>
        `${prevSub} પછી ${name} ની આગામી પરીક્ષા ${nextSub} ની ${date} ના રોજ છે.`,
      attendance: (name, isPres, pct) =>
        `${name} આજે ${isPres ? 'હાજર' : 'ગેરહાજર'} છે. કુલ હાજરી ${pct}% છે.`,
      progress: (name, grade, overall, remark) =>
        `${name} ની શૈક્ષણિક પ્રગતિ ગ્રેડ ${grade} અને ${overall} છે.${remark ? ` શિક્ષકની નોંધ: "${remark}".` : ''}`,
      timetable: (name, summary) => `${name} નું આજનું ટાઈમટેબલ: ${summary}.`,
      studentInfo: (name, cls, sec, rollNo, schoolName) =>
        `${name}, ${cls} - વર્ગ ${sec} માં છે. રોલ નંબર ${rollNo} છે.${schoolName ? ` શાળા: ${schoolName}.` : ''}`,
      holiday: (title, startDate, daysCount) =>
        `શાળામાં આગામી રજા ${title} ની ${startDate} થી (${daysCount} દિવસ) છે.`,
      announcement: (title, message) => `શાળાની તાજી નોટિસ: ${title}. ${message}`,
      schoolInfo: (schoolName, city, timings, phone) =>
        `${schoolName}, ${city} માં આવેલી છે.${timings ? ` સમય: ${timings}.` : ''}${phone ? ` હેલ્પલાઇન: ${phone}.` : ''}`,
    },
  },

  // 5. PUNJABI (pa)
  pa: {
    code: 'pa',
    name: 'ਪੰਜਾਬੀ',
    englishName: 'Punjabi',
    displayName: 'ਪੰਜਾਬੀ (Punjabi)',
    greeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਸਕੂਲਸਾਥੀ ਹਾਂ।',
    sampleAudioText:
      'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਸਕੂਲਸਾਥੀ ਹਾਂ। ਤੁਹਾਡੇ ਬੱਚੇ ਦੀ ਸਕੂਲ ਦੀ ਹਰ ਖ਼ਬਰ ਲਈ ਤੁਹਾਡਾ ਸਾਥੀ।',
    homeworkQueryExample: 'ਕੱਲ੍ਹ ਰੋਹਨ ਦਾ ਹੋਮਵਰਕ ਕੀ ਹੈ?',
    speechRecognition: {
      recognitionLang: 'pa-IN',
      fallbackRecognitionLang: 'hi-IN',
      continuous: false,
      interimResults: true,
      maxAlternatives: 1,
    },
    maleVoice: {
      gender: 'male',
      langTag: 'pa-IN',
      preferredVoiceNames: [
        'pa-IN-Standard-B',
        'Microsoft Gurpreet Online (Natural) - Punjabi (India)',
        'Microsoft Gurpreet',
        'Google ਪੰਜਾਬੀ',
        'pa-IN-Wavenet-B',
      ],
      cloudVoiceCode: 'pa-IN-Wavenet-B',
      pitch: 0.9,
      rate: 0.98,
    },
    femaleVoice: {
      gender: 'female',
      langTag: 'pa-IN',
      preferredVoiceNames: [
        'pa-IN-Standard-A',
        'Microsoft Harleen Online (Natural) - Punjabi (India)',
        'Microsoft Harleen',
        'Google ਪੰਜਾਬੀ',
        'pa-IN-Wavenet-A',
      ],
      cloudVoiceCode: 'pa-IN-Wavenet-A',
      pitch: 1.16,
      rate: 0.98,
    },
    fallbackVoice: {
      fallbackLanguage: 'hi',
      fallbackLangTag: 'hi-IN',
      maleVoice: {
        gender: 'male',
        langTag: 'hi-IN',
        preferredVoiceNames: ['Microsoft Madhur', 'Google हिन्दी', 'Ravi'],
        cloudVoiceCode: 'hi-IN-Neural2-B',
        pitch: 0.9,
        rate: 0.98,
      },
      femaleVoice: {
        gender: 'female',
        langTag: 'hi-IN',
        preferredVoiceNames: ['Microsoft Swara', 'Google हिन्दी', 'Kalpana'],
        cloudVoiceCode: 'hi-IN-Neural2-A',
        pitch: 1.16,
        rate: 0.98,
      },
    },
    keywords: {
      homework: [
        'ਹੋਮਵਰਕ',
        'ਕੰਮ',
        'ਸਕੂਲ ਦਾ ਕੰਮ',
        'homework',
        'home work',
        'hw',
        'ਕੀ ਕੰਮ ਹੈ',
      ],
      tomorrow: ['ਕੱਲ੍ਹ', 'ਕੱਲ', 'ਭਲਕੇ', 'kallh', 'kal'],
      today: ['ਅੱਜ', 'aaj'],
      exams: ['ਪ੍ਰੀਖਿਆ', 'ਇਮਤਿਹਾਨ', 'ਟੈਸਟ', 'pariksha'],
      attendance: ['ਹਾਜ਼ਰੀ', 'ਉਪਸਥਿਤੀ', 'ਹਾਜ਼ਰ', 'ਗ਼ੈਰ-ਹਾਜ਼ਰ'],
      progress: ['ਤਰੱਕੀ', 'ਨੰਬਰ', 'ਨਤੀਜਾ', 'ਗਰੇਡ'],
      holidays: ['ਛੁੱਟੀ', 'ਛੁੱਟੀਆਂ', 'ਸਕੂਲ ਕਦੋਂ ਖੁੱਲ੍ਹੇਗਾ'],
      timetable: ['ਸਮਾਂ ਸਾਰਣੀ', 'ਟਾਈਮਟੇਬਲ', 'ਸਮਾਂ'],
      announcements: ['ਸੂਚਨਾ', 'ਨੋਟਿਸ'],
      help: ['ਮਦਦ', 'ਸਹਾਇਤਾ'],
    },
    templates: {
      homework: {
        singleTomorrow: (name, sub, desc) =>
          `ਕੱਲ੍ਹ ${name} ਦਾ ${sub} ਦਾ ਹੋਮਵਰਕ ਹੈ: ${desc}।`,
        singleToday: (name, sub, desc) =>
          `ਅੱਜ ${name} ਦਾ ${sub} ਦਾ ਹੋਮਵਰਕ ਹੈ: ${desc}।`,
        multiTomorrow: (name, summary) =>
          `ਕੱਲ੍ਹ ${name} ਦਾ ਹੋਮਵਰਕ ਹੈ: ${summary}।`,
        multiToday: (name, summary) =>
          `ਅੱਜ ${name} ਦਾ ਹੋਮਵਰਕ ਹੈ: ${summary}।`,
        noHomework: (name) => `${name} ਲਈ ਕੋਈ ਹੋਮਵਰਕ ਦਰਜ ਨਹੀਂ ਹੈ।`,
        onDate: (dateLabel, name, sub, desc) =>
          `${dateLabel} ਨੂੰ ${name} ਦਾ ${sub} ਦਾ ਹੋਮਵਰਕ ਹੈ: ${desc}।`,
      },
      unknown:
        'ਮਾਫ਼ ਕਰਨਾ, ਮੈਨੂੰ ਇਹ ਸਮਝ ਨਹੀਂ ਆਇਆ। ਤੁਸੀਂ ਹੋਮਵਰਕ, ਪ੍ਰੀਖਿਆਵਾਂ, ਹਾਜ਼ਰੀ ਜਾਂ ਛੁੱਟੀਆਂ ਬਾਰੇ ਪੁੱਛ ਸਕਦੇ ਹੋ।',
      help: 'ਮੈਂ ਤੁਹਾਡੇ ਬੱਚੇ ਦੇ ਹੋਮਵਰਕ, ਪ੍ਰੀਖਿਆਵਾਂ, ਅੱਜ ਦੀ ਹਾਜ਼ਰੀ, ਰਿਪੋਰਟ ਕਾਰਡ ਅਤੇ ਸਕੂਲ ਦੀਆਂ ਛੁੱਟੀਆਂ ਬਾਰੇ ਦੱਸ ਸਕਦਾ ਹਾਂ। ਬੋਲ ਕੇ ਪੁੱਛੋ!',
      dataError: 'ਸਕੂਲ ਰਿਕਾਰਡ ਹਾਸਲ ਕਰਨ ਵਿੱਚ ਮੁਸ਼ਕਲ ਆਈ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
      notFound: 'ਸਕੂਲ ਵੱਲੋਂ ਅਜੇ ਇਹ ਜਾਣਕਾਰੀ ਉਪਲਬਧ ਨਹੀਂ ਹੋਈ।',
      clarificationPrompt: (names) => `ਕੀ ਤੁਸੀਂ ${names.join(' ਜਾਂ ')} ਬਾਰੇ ਪੁੱਛ ਰਹੇ ਹੋ?`,
      switchChild: (name) => `${name} 'ਤੇ ਸਵਿੱਚ ਕਰ ਦਿੱਤਾ ਗਿਆ ਹੈ।`,
      examSchedule: (name, sub, date, time, title, syllabus) =>
        `${name} ਦੀ ${sub} ਦੀ ਪ੍ਰੀਖਿਆ ${date} ਨੂੰ (${time}) ਹੈ।${title ? ' ' + title + '।' : ''}${syllabus ? ' ਸਿਲੇਬਸ: ' + syllabus + '।' : ''}`,
      nextExam: (name, prevSub, nextSub, date) =>
        `${prevSub} ਤੋਂ ਬਾਅਦ ${name} ਦੀ ਅਗਲੀ ਪ੍ਰੀਖਿਆ ${nextSub} ਦੀ ${date} ਨੂੰ ਹੈ।`,
      attendance: (name, isPres, pct) =>
        `${name} ਅੱਜ ${isPres ? 'ਹਾਜ਼ਰ' : 'ਗ਼ੈਰ-ਹਾਜ਼ਰ'} ਹੈ। ਕੁੱਲ ਹਾਜ਼ਰੀ ${pct}% ਹੈ।`,
      progress: (name, grade, overall, remark) =>
        `${name} ਦੀ ਅਕਾਦਮਿਕ ਪ੍ਰਗਤੀ ਗ੍ਰੇਡ ${grade} ਅਤੇ ${overall} ਹੈ।${remark ? ` ਅਧਿਆਪਕ ਦੀ ਟਿੱਪਣੀ: "${remark}"।` : ''}`,
      timetable: (name, summary) => `${name} ਦਾ ਅੱਜ ਦਾ ਸਮਾਂ-ਸਾਰਣੀ: ${summary}।`,
      studentInfo: (name, cls, sec, rollNo, schoolName) =>
        `${name}, ${cls} - ਸੈਕਸ਼ਨ ${sec} ਵਿੱਚ ਹੈ। ਰੋਲ ਨੰਬਰ ${rollNo} ਹੈ।${schoolName ? ` ਸਕੂਲ: ${schoolName}।` : ''}`,
      holiday: (title, startDate, daysCount) =>
        `ਸਕੂਲ ਵਿੱਚ ਅਗਲੀ ਛੁੱਟੀ ${title} ਦੀ ${startDate} ਤੋਂ (${daysCount} ਦਿਨ) ਹੈ।`,
      announcement: (title, message) => `ਸਕੂਲ ਦਾ ਤਾਜ਼ਾ ਨੋਟਿਸ: ${title}। ${message}`,
      schoolInfo: (schoolName, city, timings, phone) =>
        `${schoolName}, ${city} ਵਿੱਚ ਸਥਿਤ ਹੈ।${timings ? ` ਸਮਾਂ: ${timings}।` : ''}${phone ? ` ਹੈਲਪਲਾਈਨ: ${phone}।` : ''}`,
    },
  },

  // 6. BENGALI (bn)
  bn: {
    code: 'bn',
    name: 'বাংলা',
    englishName: 'Bengali',
    displayName: 'বাংলা (Bengali)',
    greeting: 'নমস্কার! আমি স্কুলসাথী।',
    sampleAudioText:
      'নমস্কার! আমি স্কুলসাথী। আপনার সন্তানের স্কুলের সমস্ত খবরের বিশ্বস্ত সঙ্গী।',
    homeworkQueryExample: 'কাল রোহনের হোমওয়ার্ক কি?',
    speechRecognition: {
      recognitionLang: 'bn-IN',
      fallbackRecognitionLang: 'en-IN',
      continuous: false,
      interimResults: true,
      maxAlternatives: 1,
    },
    maleVoice: {
      gender: 'male',
      langTag: 'bn-IN',
      preferredVoiceNames: [
        'bn-IN-Standard-B',
        'Microsoft Bashkar Online (Natural) - Bengali (India)',
        'Microsoft Bashkar',
        'Google বাংলা',
        'bn-IN-Wavenet-B',
      ],
      cloudVoiceCode: 'bn-IN-Wavenet-B',
      pitch: 0.9,
      rate: 0.98,
    },
    femaleVoice: {
      gender: 'female',
      langTag: 'bn-IN',
      preferredVoiceNames: [
        'bn-IN-Standard-A',
        'Microsoft Tanishaa Online (Natural) - Bengali (India)',
        'Microsoft Tanishaa',
        'Google বাংলা',
        'bn-IN-Wavenet-A',
      ],
      cloudVoiceCode: 'bn-IN-Wavenet-A',
      pitch: 1.16,
      rate: 0.98,
    },
    fallbackVoice: {
      fallbackLanguage: 'en',
      fallbackLangTag: 'en-IN',
      maleVoice: {
        gender: 'male',
        langTag: 'en-IN',
        preferredVoiceNames: ['Microsoft Prabhat', 'Ravi', 'David'],
        cloudVoiceCode: 'en-IN-Neural2-B',
        pitch: 0.92,
        rate: 0.98,
      },
      femaleVoice: {
        gender: 'female',
        langTag: 'en-IN',
        preferredVoiceNames: ['Microsoft Neerja', 'Heera', 'Zira'],
        cloudVoiceCode: 'en-IN-Neural2-A',
        pitch: 1.15,
        rate: 0.98,
      },
    },
    keywords: {
      homework: [
        'হোমওয়ার্ক',
        'বাড়ির কাজ',
        'পড়ার কাজ',
        'homework',
        'home work',
        'hw',
        'কি কাজ আছে',
      ],
      tomorrow: ['কাল', 'আগামীকাল', 'kal', 'agamikal'],
      today: ['আজ', 'আজকে', 'aaj'],
      exams: ['পরীক্ষা', 'টেস্ট', 'poriksha', 'পরীক্ষা কবে'],
      attendance: ['উপস্থিতি', 'হাজিরা', 'উপস্থিত', 'অনুপস্থিত'],
      progress: ['অগ্রগতি', 'নম্বর', 'ফলাফল', 'মার্কস'],
      holidays: ['ছুটি', 'ছুটি কবে', 'chuti'],
      timetable: ['রুটিন', 'সময়সূচী', 'সময়'],
      announcements: ['বিজ্ঞপ্তি', 'নোটিশ'],
      help: ['সাহায্য', 'কীভাবে ব্যবহার করব'],
    },
    templates: {
      homework: {
        singleTomorrow: (name, sub, desc) =>
          `কাল ${name} এর ${sub} এর হোমওয়ার্ক আছে: ${desc}।`,
        singleToday: (name, sub, desc) =>
          `আজ ${name} এর ${sub} এর হোমওয়ার্ক আছে: ${desc}।`,
        multiTomorrow: (name, summary) =>
          `কাল ${name} এর হোমওয়ার্ক আছে: ${summary}।`,
        multiToday: (name, summary) =>
          `আজ ${name} এর হোমওয়ার্ক আছে: ${summary}।`,
        noHomework: (name) => `${name} এর জন্য কোনো হোমওয়ার্ক রেকর্ড নেই।`,
        onDate: (dateLabel, name, sub, desc) =>
          `${dateLabel} তারিখে ${name} এর ${sub} এর হোমওয়ার্ক আছে: ${desc}।`,
      },
      unknown:
        'দুঃখিত, আমি বুঝতে পারিনি। আপনি আমাকে হোমওয়ার্ক, পরীক্ষা, উপস্থিতি বা ছুটির বিষয়ে জিজ্ঞাসা করতে পারেন।',
      help: 'আমি আপনার সন্তানের হোমওয়ার্ক, পরীক্ষার সময়সূচী, আজকের উপস্থিতি, রিপোর্ট কার্ড এবং স্কুলের ছুটির তথ্য দিতে পারি। কথা বলে জিজ্ঞাসা করুন!',
      dataError: 'স্কুল রেকর্ড অ্যাক্সেস করতে সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
      notFound: 'স্কুল থেকে এখনও এই তথ্য পাওয়া যায়নি।',
      clarificationPrompt: (names) => `আপনি কি ${names.join(' না ')} সম্পর্কে জানতে চাইছেন?`,
      switchChild: (name) => `${name} এ স্যুইচ করা হয়েছে।`,
      examSchedule: (name, sub, date, time, title, syllabus) =>
        `${name} এর ${sub} পরীক্ষা ${date} তারিখে (${time})।${title ? ' ' + title + '।' : ''}${syllabus ? ' সিলেবাস: ' + syllabus + '।' : ''}`,
      nextExam: (name, prevSub, nextSub, date) =>
        `${prevSub} এর পরে ${name} এর পরবর্তী পরীক্ষা ${nextSub} এর ${date} তারিখে।`,
      attendance: (name, isPres, pct) =>
        `${name} আজ ${isPres ? 'উপস্থিত' : 'অনুপস্থিত'} আছে। মোট উপস্থিতি ${pct}%।`,
      progress: (name, grade, overall, remark) =>
        `${name} এর একাডেমিক অগ্রগতি গ্রেড ${grade} এবং ${overall}।${remark ? ` শিক্ষকের মন্তব্য: "${remark}"।` : ''}`,
      timetable: (name, summary) => `${name} এর আজকের রুটিন: ${summary}।`,
      studentInfo: (name, cls, sec, rollNo, schoolName) =>
        `${name}, ${cls} - সেকশন ${sec} এ আছে। রোল নম্বর ${rollNo}।${schoolName ? ` স্কুল: ${schoolName}।` : ''}`,
      holiday: (title, startDate, daysCount) =>
        `স্কুলে পরবর্তী ছুটি ${title} এর জন্য ${startDate} থেকে (${daysCount} দিন)।`,
      announcement: (title, message) => `স্কুলের সাম্প্রতিক নোটিশ: ${title}। ${message}`,
      schoolInfo: (schoolName, city, timings, phone) =>
        `${schoolName}, ${city} তে অবস্থিত।${timings ? ` সময়: ${timings}।` : ''}${phone ? ` হেল্পলাইন: ${phone}।` : ''}`,
    },
  },

  // 7. TAMIL (ta)
  ta: {
    code: 'ta',
    name: 'தமிழ்',
    englishName: 'Tamil',
    displayName: 'தமிழ் (Tamil)',
    greeting: 'வணக்கம்! நான் ஸ்கூல்சாதி.',
    sampleAudioText:
      'வணக்கம்! நான் ஸ்கூல்சாதி. உங்கள் குழந்தையின் பள்ளி விவரங்களுக்கு உங்கள் தோழன்.',
    homeworkQueryExample: 'நாளை ரோஹனின் வீட்டுப்பாடம் என்ன?',
    speechRecognition: {
      recognitionLang: 'ta-IN',
      fallbackRecognitionLang: 'en-IN',
      continuous: false,
      interimResults: true,
      maxAlternatives: 1,
    },
    maleVoice: {
      gender: 'male',
      langTag: 'ta-IN',
      preferredVoiceNames: [
        'ta-IN-Standard-B',
        'Microsoft Valluvar Online (Natural) - Tamil (India)',
        'Microsoft Valluvar',
        'Google தமிழ்',
        'ta-IN-Wavenet-B',
      ],
      cloudVoiceCode: 'ta-IN-Wavenet-B',
      pitch: 0.9,
      rate: 0.98,
    },
    femaleVoice: {
      gender: 'female',
      langTag: 'ta-IN',
      preferredVoiceNames: [
        'ta-IN-Standard-A',
        'Microsoft Pallavi Online (Natural) - Tamil (India)',
        'Microsoft Pallavi',
        'Google தமிழ்',
        'ta-IN-Wavenet-A',
      ],
      cloudVoiceCode: 'ta-IN-Wavenet-A',
      pitch: 1.16,
      rate: 0.98,
    },
    fallbackVoice: {
      fallbackLanguage: 'en',
      fallbackLangTag: 'en-IN',
      maleVoice: {
        gender: 'male',
        langTag: 'en-IN',
        preferredVoiceNames: ['Microsoft Prabhat', 'Ravi', 'David'],
        cloudVoiceCode: 'en-IN-Neural2-B',
        pitch: 0.92,
        rate: 0.98,
      },
      femaleVoice: {
        gender: 'female',
        langTag: 'en-IN',
        preferredVoiceNames: ['Microsoft Neerja', 'Heera', 'Zira'],
        cloudVoiceCode: 'en-IN-Neural2-A',
        pitch: 1.15,
        rate: 0.98,
      },
    },
    keywords: {
      homework: [
        'வீட்டுப்பாடம்',
        'ஹோம்வர்க்',
        'பாடப்பணி',
        'homework',
        'home work',
        'hw',
        'என்ன பாடம்',
      ],
      tomorrow: ['நாளை', 'naalai'],
      today: ['இன்று', 'இன்னைக்கு', 'indru'],
      exams: ['தேர்வு', 'பரீட்சை', 'தேர்வுகள்', 'thervu'],
      attendance: ['வருகை', 'வந்தாரா', 'வருகைப்பதிவு'],
      progress: ['முன்னேற்றம்', 'மதிப்பெண்', 'கிரேடு'],
      holidays: ['விடுமுறை', 'லீவு', 'vidumurai'],
      timetable: ['கால அட்டவணை', 'வகுப்பு அட்டவணை', 'நேரம்'],
      announcements: ['அறிவிப்பு', 'சுற்றறிக்கை'],
      help: ['உதவி', 'எப்படி பயன்படுத்துவது'],
    },
    templates: {
      homework: {
        singleTomorrow: (name, sub, desc) =>
          `நாளை ${name} க்கு ${sub} வீட்டுப்பாடம் உள்ளது: ${desc}.`,
        singleToday: (name, sub, desc) =>
          `இன்று ${name} க்கு ${sub} வீட்டுப்பாடம் உள்ளது: ${desc}.`,
        multiTomorrow: (name, summary) =>
          `நாளை ${name} க்கு வீட்டுப்பாடம் உள்ளது: ${summary}.`,
        multiToday: (name, summary) =>
          `இன்று ${name} க்கு வீட்டுப்பாடம் உள்ளது: ${summary}.`,
        noHomework: (name) => `${name} க்கு வீட்டுப்பாடம் ஏதும் பதிவு செய்யப்படவில்லை.`,
        onDate: (dateLabel, name, sub, desc) =>
          `${dateLabel} அன்று ${name} க்கு ${sub} வீட்டுப்பாடம் உள்ளது: ${desc}.`,
      },
      unknown:
        'மன்னிக்கவும், எனக்குப் புரியவில்லை. வீட்டுப்பாடம், தேர்வுகள், வருகை அல்லது விடுமுறை பற்றி என்னிடம் கேட்கலாம்.',
      help: 'உங்கள் குழந்தையின் வீட்டுப்பாடம், வரவிருக்கும் தேர்வுகள், இன்றைய வருகை, மதிப்பெண்கள் மற்றும் பள்ளி விடுமுறை விவரங்களை நான் கூறுவேன். பேசி கேளுங்கள்!',
      dataError: 'பள்ளித் தகவல்களைப் பெறுவதில் சிக்கல் ஏற்பட்டுள்ளது. மீண்டும் முயற்சிக்கவும்.',
      notFound: 'பள்ளியிலிருந்து இந்தத் தகவல் இன்னும் கிடைக்கவில்லை.',
      clarificationPrompt: (names) => `நீங்கள் ${names.join(' அல்லது ')} பற்றி கேட்கிறீர்களா?`,
      switchChild: (name) => `${name} கணக்கிற்கு மாற்றப்பட்டது.`,
      examSchedule: (name, sub, date, time, title, syllabus) =>
        `${name} இன் ${sub} தேர்வு ${date} அன்று (${time}) நடைபெறும்.${title ? ' ' + title + '.' : ''}${syllabus ? ' பாடத்திட்டம்: ' + syllabus + '.' : ''}`,
      nextExam: (name, prevSub, nextSub, date) =>
        `${prevSub} க்குப் பிறகு ${name} இன் அடுத்த தேர்வு ${nextSub} ${date} அன்று நடைபெறும்.`,
      attendance: (name, isPres, pct) =>
        `${name} இன்று ${isPres ? 'பள்ளிக்கு வந்துள்ளார்' : 'வரவில்லை'}. மொத்த வருகை ${pct}%.`,
      progress: (name, grade, overall, remark) =>
        `${name} இன் கல்வி முன்னேற்றம் கிரேடு ${grade} மற்றும் ${overall}.${remark ? ` ஆசிரியரின் குறிப்பு: "${remark}".` : ''}`,
      timetable: (name, summary) => `${name} இன் இன்றைய கால அட்டவணை: ${summary}.`,
      studentInfo: (name, cls, sec, rollNo, schoolName) =>
        `${name}, வகுப்பு ${cls} - பிரிவு ${sec} இல் உள்ளார். ரோல் எண் ${rollNo}.${schoolName ? ` பள்ளி: ${schoolName}.` : ''}`,
      holiday: (title, startDate, daysCount) =>
        `பள்ளியின் அடுத்த விடுமுறை ${title} க்காக ${startDate} முதல் (${daysCount} நாட்கள்) இருக்கும்.`,
      announcement: (title, message) => `பள்ளியின் சமீபத்திய அறிவிப்பு: ${title}. ${message}`,
      schoolInfo: (schoolName, city, timings, phone) =>
        `${schoolName}, ${city} இல் அமைந்துள்ளது.${timings ? ` நேரம்: ${timings}.` : ''}${phone ? ` உதவி எண்: ${phone}.` : ''}`,
    },
  },

  // 8. TELUGU (te)
  te: {
    code: 'te',
    name: 'తెలుగు',
    englishName: 'Telugu',
    displayName: 'తెలుగు (Telugu)',
    greeting: 'నమస్కారం! నేను స్కూల్సాథిని.',
    sampleAudioText:
      'నమస్కారం! నేను స్కూల్సాథిని. మీ పిల్లల పాఠశాల సమాచారానికి మీ నేస్తం.',
    homeworkQueryExample: 'రేపు రోహన్ హోంవర్క్ ఏమిటి?',
    speechRecognition: {
      recognitionLang: 'te-IN',
      fallbackRecognitionLang: 'en-IN',
      continuous: false,
      interimResults: true,
      maxAlternatives: 1,
    },
    maleVoice: {
      gender: 'male',
      langTag: 'te-IN',
      preferredVoiceNames: [
        'te-IN-Standard-B',
        'Microsoft Mohan Online (Natural) - Telugu (India)',
        'Microsoft Mohan',
        'Google తెలుగు',
        'te-IN-Wavenet-B',
      ],
      cloudVoiceCode: 'te-IN-Wavenet-B',
      pitch: 0.9,
      rate: 0.98,
    },
    femaleVoice: {
      gender: 'female',
      langTag: 'te-IN',
      preferredVoiceNames: [
        'te-IN-Standard-A',
        'Microsoft Shruti Online (Natural) - Telugu (India)',
        'Microsoft Shruti',
        'Google తెలుగు',
        'te-IN-Wavenet-A',
      ],
      cloudVoiceCode: 'te-IN-Wavenet-A',
      pitch: 1.16,
      rate: 0.98,
    },
    fallbackVoice: {
      fallbackLanguage: 'en',
      fallbackLangTag: 'en-IN',
      maleVoice: {
        gender: 'male',
        langTag: 'en-IN',
        preferredVoiceNames: ['Microsoft Prabhat', 'Ravi', 'David'],
        cloudVoiceCode: 'en-IN-Neural2-B',
        pitch: 0.92,
        rate: 0.98,
      },
      femaleVoice: {
        gender: 'female',
        langTag: 'en-IN',
        preferredVoiceNames: ['Microsoft Neerja', 'Heera', 'Zira'],
        cloudVoiceCode: 'en-IN-Neural2-A',
        pitch: 1.15,
        rate: 0.98,
      },
    },
    keywords: {
      homework: [
        'హోంవర్క్',
        'ఇంటి పని',
        'హోం వర్క్',
        'homework',
        'home work',
        'hw',
        'ఏం పని ఉంది',
      ],
      tomorrow: ['రేపు', 'repu'],
      today: ['నేడు', 'ఈ రోజు', 'ఈరోజు', 'nedu'],
      exams: ['పరీక్ష', 'పరీక్షలు', 'టెస్ట్', 'pariksha'],
      attendance: ['హాజరు', 'హాజరయ్యారా', 'హాజరు పట్టిక'],
      progress: ['పురోగతి', 'మార్కులు', 'ఫలితాలు'],
      holidays: ['సెలవు', 'సెలవులు', 'selavu'],
      timetable: ['టైంటేబుల్', 'సమయ పట్టిక', 'సమయం'],
      announcements: ['ప్రకటన', 'నోటీస్'],
      help: ['సహాయం', 'ఎలా ఉపయోగించాలి'],
    },
    templates: {
      homework: {
        singleTomorrow: (name, sub, desc) =>
          `రేపు ${name} కి ${sub} హోంవర్క్ ఉంది: ${desc}.`,
        singleToday: (name, sub, desc) =>
          `నేడు ${name} కి ${sub} హోంవర్క్ ఉంది: ${desc}.`,
        multiTomorrow: (name, summary) =>
          `రేపు ${name} కి హోంవర్క్ ఉంది: ${summary}.`,
        multiToday: (name, summary) =>
          `నేడు ${name} కి హోంవర్క్ ఉంది: ${summary}.`,
        noHomework: (name) => `${name} కి ఎలాంటి హోంవర్క్ రికార్డు లేదు.`,
        onDate: (dateLabel, name, sub, desc) =>
          `${dateLabel} న ${name} కి ${sub} హోంవర్క్ ఉంది: ${desc}.`,
      },
      unknown:
        'క్షమించండి, నాకు అర్థం కాలేదు. మీరు నన్ను హోంవర్క్, పరీక్షలు, హాజరు లేదా సెలవుల గురించి అడగవచ్చు.',
      help: 'నేను మీ పిల్లల హోంవర్క్, రాబోయే పరీక్షలు, నేటి హాజరు, మార్కులు మరియు పాఠశాల సెలవుల వివరాలను తెలియజేయగలను. సహజంగా మాట్లాడి అడగండి!',
      dataError: 'పాఠశాల రికార్డులను పొందడంలో సమస్య ఉంది. దయచేసి మళ్ళీ ప్రయత్నించండి.',
      notFound: 'పాఠశాల నుండి ఈ సమాచారం ఇంకా అందలేదు.',
      clarificationPrompt: (names) => `మీరు ${names.join(' లేదా ')} గురించి అడుగుతున్నారా?`,
      switchChild: (name) => `${name} కి మార్చబడింది.`,
      examSchedule: (name, sub, date, time, title, syllabus) =>
        `${name} యొక్క ${sub} పరీక్ష ${date} న (${time}) జరుగుతుంది.${title ? ' ' + title + '.' : ''}${syllabus ? ' సిలబస్: ' + syllabus + '.' : ''}`,
      nextExam: (name, prevSub, nextSub, date) =>
        `${prevSub} తర్వాత ${name} తదుపరి పరీక్ష ${nextSub} ${date} న జరుగుతుంది.`,
      attendance: (name, isPres, pct) =>
        `${name} నేడు ${isPres ? 'హాజరయ్యారు' : 'హాజరుకాలేదు'}. మొత్తం హాజరు ${pct}%.`,
      progress: (name, grade, overall, remark) =>
        `${name} విద్యా పురోగతి గ్రేడ్ ${grade} మరియు ${overall}.${remark ? ` ఉపాధ్యాయుల వ్యాఖ్య: "${remark}".` : ''}`,
      timetable: (name, summary) => `${name} యొక్క నేటి టైంటేబుల్: ${summary}.`,
      studentInfo: (name, cls, sec, rollNo, schoolName) =>
        `${name}, తరగతి ${cls} - విభాగం ${sec} లో ఉన్నారు. రోల్ నంబర్ ${rollNo}.${schoolName ? ` పాఠశాల: ${schoolName}.` : ''}`,
      holiday: (title, startDate, daysCount) =>
        `పాఠశాల తదుపరి సెలవు ${title} కొరకు ${startDate} నుండి (${daysCount} రోజులు).`,
      announcement: (title, message) => `పాఠశాల తాజా నోటీస్: ${title}. ${message}`,
      schoolInfo: (schoolName, city, timings, phone) =>
        `${schoolName}, ${city} లో ఉంది.${timings ? ` సమయం: ${timings}.` : ''}${phone ? ` హెల్ప్‌లైన్: ${phone}.` : ''}`,
    },
  },
};

// ==========================================
// REUSABLE LANGUAGE CONFIG SERVICE
// ==========================================

export class LanguageConfigService {
  public static getLanguageConfig(code?: LanguageCode): LanguageConfig {
    if (!code || !LANGUAGE_CONFIGS[code]) {
      return LANGUAGE_CONFIGS.hi;
    }
    return LANGUAGE_CONFIGS[code];
  }

  public static getAllLanguageConfigs(): LanguageConfig[] {
    return Object.values(LANGUAGE_CONFIGS);
  }

  public static getSpeechRecognitionConfig(code?: LanguageCode): SpeechRecognitionConfig {
    return this.getLanguageConfig(code).speechRecognition;
  }

  public static getVoiceConfig(code: LanguageCode | undefined, gender: VoiceGender): VoiceProfileConfig {
    const config = this.getLanguageConfig(code);
    return gender === 'male' ? config.maleVoice : config.femaleVoice;
  }

  public static getFallbackVoiceConfig(code: LanguageCode | undefined, gender: VoiceGender): VoiceProfileConfig {
    const config = this.getLanguageConfig(code);
    return gender === 'male'
      ? config.fallbackVoice.maleVoice
      : config.fallbackVoice.femaleVoice;
  }

  public static getTemplates(code?: LanguageCode): LanguageTemplates {
    return this.getLanguageConfig(code).templates;
  }

  public static getKeywords(code?: LanguageCode): LanguageKeywords {
    return this.getLanguageConfig(code).keywords;
  }
}
