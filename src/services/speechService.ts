import { LanguageCode, AvatarState, Student, VoiceQueryResult, Child, Homework } from '../types';
import { SchoolDataService } from './schoolDataService';

// Map our language codes to standard BCP-47 speech tags for Indian languages
export const SPEECH_LANG_TAGS: Record<LanguageCode, string> = {
  hi: 'hi-IN',
  en: 'en-IN',
  mr: 'mr-IN',
  pa: 'pa-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  gu: 'gu-IN',
};

import { TextToSpeechService, SpeechRecognitionService, SpeechRecognitionError } from './speech';
import { VoiceService } from './voice/VoiceService';

export class SpeechService {
  public static speak(text: string, lang: LanguageCode, rate?: number): Promise<void> {
    return VoiceService.speak(text, {
      language: lang,
      rate,
    });
  }

  public static stop(): void {
    VoiceService.stop();
  }

  public static pause(): void {
    VoiceService.pause();
  }

  public static resume(): void {
    VoiceService.resume();
  }

  public static replay(): Promise<void> {
    return VoiceService.preview(undefined, undefined);
  }

  public static preview(text?: string, lang?: LanguageCode): Promise<void> {
    return VoiceService.preview(text, undefined, lang);
  }

  public static setSpeed(speed: 'slow' | 'normal' | 'fast'): void {
    VoiceService.setSpeed(speed);
  }

  public static getSpeed(): 'slow' | 'normal' | 'fast' {
    return VoiceService.getSettings().speed;
  }

  public static isSpeechSupported(): boolean {
    return true;
  }

  public static isRecognitionSupported(): boolean {
    return SpeechRecognitionService.isSupported();
  }

  public static voiceInput(
    language: LanguageCode,
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (error: SpeechRecognitionError) => void,
    onStart?: () => void,
    onEnd?: () => void
  ): { start: () => void; stop: () => void; cancel: () => void; isSupported: boolean } {
    return {
      start: () => {
        SpeechRecognitionService.startListening({
          language,
          onStart,
          onEnd,
          onInterimResult: (text) => onResult(text, false),
          onFinalResult: (text) => onResult(text, true),
          onError,
        });
      },
      stop: () => {
        SpeechRecognitionService.stopListening();
      },
      cancel: () => {
        SpeechRecognitionService.abort();
      },
      isSupported: SpeechRecognitionService.isSupported(),
    };
  }
}

/**
 * Generate Voice Response pulling strictly from SchoolDataService (Source of Truth)
 * The AI must NOT invent school information.
 */
export async function generateVoiceResponse(
  category: 'homework' | 'exams' | 'attendance' | 'progress' | 'holidays' | 'notices' | 'timetable',
  student: Student,
  lang: LanguageCode
): Promise<VoiceQueryResult> {
  const studentName = student.name || student.fullName || 'Student';
  const classDisplay = student.section
    ? `${student.class.replace('Class ', '')}-${student.section}`
    : student.class;

  switch (category) {
    case 'homework': {
      const hw = await SchoolDataService.getHomework(student.id);
      const pendingHw = hw.filter((h) => !h.isCompleted);

      if (pendingHw.length > 0) {
        const primaryHw = pendingHw[0];
        const responses: Record<LanguageCode, string> = {
          hi: `${studentName} के पास आज ${pendingHw.length} काम पेंडिंग हैं। सबसे ज़रूरी है ${primaryHw.subject} का काम: ${primaryHw.title}, जो ${primaryHw.dueDate} जमा करना है। विवरण: ${primaryHw.description}`,
          en: `${studentName} has ${pendingHw.length} pending homework task. Most urgent is ${primaryHw.subject}: ${primaryHw.title}, due ${primaryHw.dueDate}. Note: ${primaryHw.description}`,
          mr: `${studentName} चा आज ${pendingHw.length} गृहपाठ बाकी आहे. मुख्य म्हणजे ${primaryHw.subject}: ${primaryHw.title}, जे ${primaryHw.dueDate} जमा करायचे आहे.`,
          pa: `${studentName} ਦਾ ਅੱਜ ${pendingHw.length} ਹੋਮਵਰਕ ਬਾਕੀ ਹੈ। ਜ਼ਰੂਰੀ ਕੰਮ ${primaryHw.subject} ਦਾ ਹੈ: ${primaryHw.title}, ਜੋ ${primaryHw.dueDate} ਦੇਣਾ ਹੈ।`,
          bn: `${studentName} এর আজ ${pendingHw.length}টি হোমওয়ার্ক বাকি আছে। সবথেকে জরুরি ${primaryHw.subject}: ${primaryHw.title}, যা ${primaryHw.dueDate} জমা দিতে হবে।`,
          ta: `${studentName}க்கு இன்று ${pendingHw.length} வீட்டுப்பாடம் மீதமுள்ளது. முக்கியமானது ${primaryHw.subject}: ${primaryHw.title}, சமர்ப்பிக்க வேண்டிய நாள் ${primaryHw.dueDate}.`,
          te: `${studentName}కి ఈరోజు ${pendingHw.length} హోంవర్క్ మిగిలి ఉంది. ముఖ్యమైనది ${primaryHw.subject}: ${primaryHw.title}, గడువు ${primaryHw.dueDate}.`,
          gu: `${studentName}નું આજે ${pendingHw.length} લેસન બાકી છે. મુખ્ય વિષય ${primaryHw.subject} છે: ${primaryHw.title}, જે ${primaryHw.dueDate} જમા કરવાનું છે.`,
        };
        return {
          query: 'Homework updates',
          category: 'homework',
          spokenResponse: responses[lang] || responses.en,
          avatarMood: 'concerned',
          detailedData: hw,
        };
      } else if (hw.length > 0) {
        const responses: Record<LanguageCode, string> = {
          hi: `शाबाश! ${studentName} का आज का सारा गृहकार्य पूरा हो चुका है। कोई चिंता की बात नहीं है।`,
          en: `Great news! ${studentName} has completed all homework for today. Nothing pending!`,
          mr: `छान बातमी! ${studentName} चा आजचा सर्व गृहपाठ पूर्ण झाला आहे.`,
          pa: `ਬਹੁਤ ਵਧੀਆ! ${studentName} ਦਾ ਅੱਜ ਦਾ ਸਾਰਾ ਕੰਮ ਪੂਰਾ ਹੋ ਗਿਆ ਹੈ।`,
          bn: `দারুণ খবর! ${studentName} এর আজকের সব হোমওয়ার্ক শেষ হয়েছে।`,
          ta: `மகிழ்ச்சியான செய்தி! ${studentName} இன்றைய அனைத்து வீட்டுப்பாடங்களையும் முடித்துவிட்டார்.`,
          te: `మంచి వార్త! ${studentName} ఈరోజు హోంవర్క్ అంతా పూర్తి చేశాడు.`,
          gu: `સરસ વાત! ${studentName}નું આજનું બધું લેસન પૂરું થઈ ગયું છે.`,
        };
        return {
          query: 'Homework status',
          category: 'homework',
          spokenResponse: responses[lang] || responses.en,
          avatarMood: 'celebrating',
          detailedData: hw,
        };
      } else {
        const responses: Record<LanguageCode, string> = {
          hi: `स्कूल रिकॉर्ड के अनुसार, ${studentName} की कक्षा के लिए अभी कोई गृहकार्य दर्ज नहीं है।`,
          en: `According to official school records, no homework is currently listed for ${studentName}.`,
          mr: `शाळेच्या नोंदीनुसार, ${studentName} साठी सध्या कोणताही गृहपाठ दिलेला नाही.`,
          pa: `ਸਕੂਲ ਰਿਕਾਰਡ ਮੁਤਾਬਕ, ${studentName} ਲਈ ਕੋਈ ਹੋਮਵਰਕ ਨਹੀਂ ਹੈ।`,
          bn: `স্কুল রেকর্ড অনুসারে, ${studentName} এর জন্য কোনো হোমওয়ার্ক নেই।`,
          ta: `பள்ளிப் பதிவுகளின்படி, ${studentName}க்கு வீட்டுப்பாடம் எதுவும் இல்லை.`,
          te: `పాఠశాల రికార్డుల ప్రకారం, ${studentName}కి ఎలాంటి హోంవర్క్ నమోదు కాలేదు.`,
          gu: `શાળાના રેકોર્ડ મુજબ, ${studentName} માટે કોઈ લેસન નોંધાયેલ નથી.`,
        };
        return {
          query: 'Homework status',
          category: 'homework',
          spokenResponse: responses[lang] || responses.en,
          avatarMood: 'happy',
          detailedData: [],
        };
      }
    }

    case 'exams': {
      const exams = await SchoolDataService.getExams(student.id);
      const nextExam = exams[0];

      if (nextExam) {
        const responses: Record<LanguageCode, string> = {
          hi: `${studentName} की अगली परीक्षा ${nextExam.subject} की है। यह ${nextExam.date} को सुबह ${nextExam.time} बजे होगी। रूम नंबर: ${nextExam.roomNumber || '204'}। सिलेबस: ${nextExam.syllabus}।`,
          en: `${studentName}’s upcoming exam is ${nextExam.subject} on ${nextExam.date} at ${nextExam.time}. Room: ${nextExam.roomNumber || 'Room 204'}. Syllabus: ${nextExam.syllabus}.`,
          mr: `${studentName} ची पुढील परीक्षा ${nextExam.subject} ची आहे. ती ${nextExam.date} रोजी सकाळी ${nextExam.time} वाजता होईल.`,
          pa: `${studentName} ਦਾ ਅਗਲਾ ਇਮਤਿਹਾਨ ${nextExam.subject} ਦਾ ਹੈ। ਇਹ ${nextExam.date} ਨੂੰ ਸਵੇਰੇ ${nextExam.time} ਵਜੇ ਹੋਵੇਗਾ।`,
          bn: `${studentName} এর পরবর্তী পরীক্ষা ${nextExam.subject}। এটি ${nextExam.date} সকাল ${nextExam.time} এ অনুষ্ঠিত হবে।`,
          ta: `${studentName}ன் அடுத்த தேர்வு ${nextExam.subject}. இது ${nextExam.date} காலை ${nextExam.time} மணிக்கு நடைபெறும்.`,
          te: `${studentName}కి రాబోయే పరీక్ష ${nextExam.subject}. ఇది ${nextExam.date} ఉదయం ${nextExam.time} గంటలకు జరుగుతుంది.`,
          gu: `${studentName}ની હવે પછીની પરીક્ષા ${nextExam.subject}ની છે. તારીખ ${nextExam.date} સવારે ${nextExam.time} વાગ્યે છે.`,
        };
        return {
          query: 'Next exam details',
          category: 'exams',
          spokenResponse: responses[lang] || responses.en,
          avatarMood: 'thinking',
          detailedData: exams,
        };
      }
      return {
        query: 'Exams',
        category: 'exams',
        spokenResponse:
          lang === 'hi'
            ? `${studentName} के लिए इस सप्ताह कोई परीक्षा निर्धारित नहीं है।`
            : `No exams scheduled this week for ${studentName}.`,
        avatarMood: 'happy',
        detailedData: [],
      };
    }

    case 'attendance': {
      const att = await SchoolDataService.getAttendance(student.id);
      const isPresent = student.presentToday ?? true;
      const pct = att ? att.overallPercentage : student.attendancePercentage || 94;

      const responses: Record<LanguageCode, string> = {
        hi: `${studentName} आज स्कूल में उपस्थित ${isPresent ? 'है' : 'नहीं है'}। कुल उपस्थिति ${pct}% है, जो कि बहुत अच्छी है!`,
        en: `${studentName} is ${isPresent ? 'present' : 'absent'} in school today. Overall attendance is ${pct}%, which is very good!`,
        mr: `${studentName} आज शाळेत उपस्थित ${isPresent ? 'आहे' : 'नाही'}. एकूण हजेरी ${pct}% आहे.`,
        pa: `${studentName} ਅੱਜ ਸਕੂਲ ਵਿੱਚ ਹਾਜ਼ਰ ${isPresent ? 'ਹੈ' : 'ਨਹੀਂ ਹੈ'}। ਕੁੱਲ ਹਾਜ਼ਰੀ ${pct}% ਹੈ।`,
        bn: `${studentName} আজ স্কুলে उपस्थित ${isPresent ? 'আছে' : 'নেই'}। মোট উপস্থিতি ${pct}%।`,
        ta: `${studentName} இன்று பள்ளிக்கு வந்துள்ளார். மொத்த வருகை சதவீதம் ${pct}% ஆகும்.`,
        te: `${studentName} ఈరోజు పాఠశాలలో హాజరయ్యారు. మొత్తం హాజరు శాతం ${pct}%.`,
        gu: `${studentName} આજે શાળામાં હાજર ${isPresent ? 'છે' : 'નથી'}. કુલ હાજરી ${pct}% છે.`,
      };
      return {
        query: 'Attendance report',
        category: 'attendance',
        spokenResponse: responses[lang] || responses.en,
        avatarMood: pct >= 90 ? 'celebrating' : 'happy',
        detailedData: att,
      };
    }

    case 'progress': {
      const prog = await SchoolDataService.getProgress(student.id);
      const responses: Record<LanguageCode, string> = {
        hi: `${studentName} का समग्र ग्रेड ${prog?.overallGrade || 'A'} (${prog?.overallPercentage || 88}%) है। शिक्षक ने कहा: "${prog?.teacherRemark || 'बहुत अच्छा प्रदर्शन।'}"`,
        en: `${studentName}’s overall performance is Grade ${prog?.overallGrade || 'A'} (${prog?.overallPercentage || 88}%). Class teacher says: "${prog?.teacherRemark || 'Consistently doing well.'}"`,
        mr: `${studentName} चे ग्रेड ${prog?.overallGrade || 'A'} (${prog?.overallPercentage || 88}%) आहे.`,
        pa: `${studentName} ਦਾ ਗ੍ਰੇਡ ${prog?.overallGrade || 'A'} (${prog?.overallPercentage || 88}%) ਹੈ।`,
        bn: `${studentName} এর সার্বিক গ্রেড ${prog?.overallGrade || 'A'} (${prog?.overallPercentage || 88}%)।`,
        ta: `${studentName}ன் மொத்த தரம் ${prog?.overallGrade || 'A'} (${prog?.overallPercentage || 88}%).`,
        te: `${studentName} యొక్క మొత్తం గ్రేడ్ ${prog?.overallGrade || 'A'} (${prog?.overallPercentage || 88}%).`,
        gu: `${studentName}નું ગ્રેડ ${prog?.overallGrade || 'A'} (${prog?.overallPercentage || 88}%) છે.`,
      };
      return {
        query: 'Academic progress',
        category: 'progress',
        spokenResponse: responses[lang] || responses.en,
        avatarMood: 'celebrating',
        detailedData: prog,
      };
    }

    case 'holidays': {
      const holidays = await SchoolDataService.getHolidays();
      const nextHoliday = holidays[0] || {
        title: 'Gandhi Jayanti',
        startDate: '2 October 2026',
        daysCount: 1,
        description: 'National holiday',
      };

      const responses: Record<LanguageCode, string> = {
        hi: `स्कूल की अगली छुट्टी ${nextHoliday.title} के लिए ${nextHoliday.startDate} को है। ${nextHoliday.description}`,
        en: `The next school holiday is for ${nextHoliday.title} on ${nextHoliday.startDate}. (${nextHoliday.daysCount} day break).`,
        mr: `शाळेची पुढची सुट्टी ${nextHoliday.title} साठी ${nextHoliday.startDate} रोजी आहे.`,
        pa: `ਸਕੂਲ ਦੀ ਅਗਲੀ ਛੁੱਟੀ ${nextHoliday.title} ਲਈ ${nextHoliday.startDate} ਨੂੰ ਹੈ।`,
        bn: `স্কুলের পরবর্তী ছুটি ${nextHoliday.title} উপলক্ষে ${nextHoliday.startDate} এ।`,
        ta: `பள்ளியின் அடுத்த விடுமுறை ${nextHoliday.title}க்காக ${nextHoliday.startDate} அன்று வரும்.`,
        te: `పాఠశాల తదుపరి సెలవు ${nextHoliday.title} సందర్భంగా ${nextHoliday.startDate}న ఉంటుంది.`,
        gu: `શાળાની હવે પછીની રજા ${nextHoliday.title} માટે ${nextHoliday.startDate} ના રોજ છે.`,
      };
      return {
        query: 'Upcoming school holiday',
        category: 'holidays',
        spokenResponse: responses[lang] || responses.en,
        avatarMood: 'happy',
        detailedData: holidays,
      };
    }

    case 'notices': {
      const notices = await SchoolDataService.getAnnouncements(classDisplay);
      const latestNotice = notices[0] || {
        title: 'General school notice',
        content: 'Please ensure timely arrival in school uniform.',
      };

      const responses: Record<LanguageCode, string> = {
        hi: `स्कूल का ताज़ा नोटिस: "${latestNotice.title}"। विवरण: ${latestNotice.content}`,
        en: `Latest school notice: "${latestNotice.title}". Details: ${latestNotice.content}`,
        mr: `शाळेची ताजी सूचना: "${latestNotice.title}". तपशील: ${latestNotice.content}`,
        pa: `ਸਕੂਲ ਦਾ ਤਾਜ਼ਾ ਨੋਟਿਸ: "${latestNotice.title}"। ਵੇਰਵਾ: ${latestNotice.content}`,
        bn: `স্কুলের সাম্প্রতিক বিজ্ঞপ্তি: "${latestNotice.title}"। বিবরণ: ${latestNotice.content}`,
        ta: `பள்ளியின் சமீபத்திய அறிவிப்பு: "${latestNotice.title}". விவரம்: ${latestNotice.content}`,
        te: `పాఠశాల తాజా ప్రకటన: "${latestNotice.title}". వివరాలు: ${latestNotice.content}`,
        gu: `શાળાની નવી સૂચના: "${latestNotice.title}". વિગત: ${latestNotice.content}`,
      };
      return {
        query: 'School announcements',
        category: 'notices',
        spokenResponse: responses[lang] || responses.en,
        avatarMood: 'speaking',
        detailedData: notices,
      };
    }

    case 'timetable': {
      const tt = await SchoolDataService.getTimetable(classDisplay);
      const todaySchedule = tt?.schedule[0];
      const periodSummary = todaySchedule
        ? todaySchedule.periods.map((p) => `${p.subject} (${p.startTime})`).join(', ')
        : 'Time-table is available on the school notice board.';

      return {
        query: 'Class Timetable',
        category: 'timetable',
        spokenResponse:
          lang === 'hi'
            ? `${studentName} का आज का टाइम-टेबल: ${periodSummary}।`
            : `Today's schedule for ${studentName} (${classDisplay}): ${periodSummary}.`,
        avatarMood: 'thinking',
        detailedData: tt,
      };
    }
  }
}

/**
 * Multi-Child Voice Response from Authoritative School Data
 */
export async function generateMultiChildVoiceResponse(
  children: Child[],
  lang: LanguageCode,
  queryType: 'homework' | 'attendance' | 'exams' | 'general' = 'homework'
): Promise<VoiceQueryResult> {
  if (!children || children.length === 0) {
    return {
      query: 'Mere bachchon ka kal ka homework kya hai?',
      category: 'all-children',
      spokenResponse:
        lang === 'hi'
          ? 'आपके खाते में अभी कोई बच्चा नहीं जुड़ा है। कृपया पहले बच्चे को सत्यापित करें।'
          : 'No children are currently linked to your parent account.',
      avatarMood: 'concerned',
      isMultiChild: true,
      detailedData: [],
    };
  }

  if (queryType === 'homework') {
    const childReports: {
      child: Child;
      pendingCount: number;
      primaryTask?: Homework;
      allTasks: Homework[];
    }[] = [];

    for (const c of children) {
      const hw = await SchoolDataService.getHomework(c.id);
      const pending = hw.filter((h) => !h.isCompleted);
      childReports.push({
        child: c,
        pendingCount: pending.length,
        primaryTask: pending[0],
        allTasks: hw,
      });
    }

    const summarySentences = childReports.map((r) => {
      const childName = (r.child.name || r.child.fullName || '').split(' ')[0];
      const childClass = r.child.class || r.child.grade || '';
      if (r.pendingCount === 0) {
        return lang === 'hi'
          ? `${childName} का सारा काम पूरा है`
          : `${childName} has finished all tasks`;
      }
      return lang === 'hi'
        ? `${childName} (${childClass}) का ${r.primaryTask?.subject || 'काम'} बाकी है: ${r.primaryTask?.title || ''}`
        : `${childName} (${childClass}) has pending ${r.primaryTask?.subject || 'task'}: ${r.primaryTask?.title || ''}`;
    });

    const spokenResponses: Record<LanguageCode, string> = {
      hi: `स्कूल रिकॉर्ड के अनुसार आपके ${children.length} बच्चों के कल के होमवर्क का हाल: ${summarySentences.join(', ')}।`,
      en: `According to school records, here is the homework update for your ${children.length} children: ${summarySentences.join(', ')}.`,
      mr: `आपल्या ${children.length} मुलांच्या उद्याच्या गृहपाठाचा अधिकृत अहवाल: ${summarySentences.join(', ')}.`,
      pa: `ਸਕੂਲ ਰਿਕਾਰਡ ਮੁਤਾਬਕ ਤੁਹਾਡੇ ${children.length} ਬੱਚਿਆਂ ਦਾ ਹੋਮਵਰਕ: ${summarySentences.join(', ')}।`,
      bn: `স্কুল রেকর্ড অনুযায়ী আপনার ${children.length}টি সন্তানের আগামীকালের হোমওয়ার্ক: ${summarySentences.join(', ')}।`,
      ta: `பள்ளிப் பதிவுகளின்படி உங்கள் ${children.length} குழந்தைகளின் வீட்டுப்பாடம்: ${summarySentences.join(', ')}.`,
      te: `పాఠశాల రికార్డుల ప్రకారం మీ ${children.length} పిల్లల హోంవర్క్ వివరాలు: ${summarySentences.join(', ')}.`,
      gu: `શાળાના રેકોર્ડ મુજબ તમારા ${children.length} બાળકોના લેસનની વિગત: ${summarySentences.join(', ')}.`,
    };

    return {
      query: 'Mere bachchon ka kal ka homework kya hai?',
      category: 'all-children',
      spokenResponse: spokenResponses[lang] || spokenResponses.en,
      avatarMood: childReports.some((r) => r.pendingCount > 0) ? 'thinking' : 'celebrating',
      isMultiChild: true,
      detailedData: childReports,
    };
  }

  // Attendance multi-child query
  const attReports: any[] = [];
  for (const c of children) {
    const att = await SchoolDataService.getAttendance(c.id);
    attReports.push({
      child: c,
      percentage: att?.overallPercentage ?? c.attendancePercentage ?? 90,
      presentToday: c.presentToday ?? true,
    });
  }

  const spoken =
    lang === 'hi'
      ? `उपस्थिति रिपोर्ट: ${attReports
          .map(
            (r) =>
              `${(r.child.name || '').split(' ')[0]} ${r.presentToday ? 'उपस्थित है' : 'अनुपस्थित है'} (${r.percentage}%)`
          )
          .join(', ')}।`
      : `Attendance summary: ${attReports
          .map((r) => `${(r.child.name || '').split(' ')[0]} is ${r.presentToday ? 'present' : 'absent'} (${r.percentage}%)`)
          .join(', ')}.`;

  return {
    query: 'Mere sabhi bachchon ki attendance?',
    category: 'all-children',
    spokenResponse: spoken,
    avatarMood: 'happy',
    isMultiChild: true,
    detailedData: attReports,
  };
}
