const fs = require('fs');
let code = fs.readFileSync('src/services/aiAssistantService.ts', 'utf8');

// Normalize line endings to \n temporarily for clean replacement
const isCRLF = code.includes('\r\n');
code = code.replace(/\r\n/g, '\n');

const markerBefore = "    // 5. Check for sequential follow-up references\n    const isSequentialFollowUp =";
const markerAfter = "    if (hasHomeworkKeyword) {";

const idxStart = code.indexOf(markerBefore);
const idxEnd = code.indexOf(markerAfter);

if (idxStart === -1 || idxEnd === -1) {
  console.error("Markers not found! idxStart:", idxStart, "idxEnd:", idxEnd);
  process.exit(1);
}

const cleanBlock = `    // 5. Check for sequential follow-up references
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
        lower.trim().split(/\\s+/).length <= 4) &&
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
    const words = lower.trim().split(/\\s+/);
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

`;

code = code.slice(0, idxStart) + cleanBlock + code.slice(idxEnd);
if (isCRLF) {
  code = code.replace(/\n/g, '\r\n');
}

fs.writeFileSync('src/services/aiAssistantService.ts', code, 'utf8');
console.log('Successfully repaired and updated aiAssistantService.ts!');
