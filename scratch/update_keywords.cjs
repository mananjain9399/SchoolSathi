const fs = require('fs');
let code = fs.readFileSync('src/services/aiAssistantService.ts', 'utf8');

const target = '    // 8. Homework Intents (Today / Tomorrow / Specific Date)\n    const hasHomeworkKeyword =';
const startIdx = code.indexOf(target);
if (startIdx === -1) {
  console.error('Target not found');
  process.exit(1);
}

const endIdx = code.indexOf('if (hasHomeworkKeyword) {', startIdx);
if (endIdx === -1) {
  console.error('End target not found');
  process.exit(1);
}

const replacement = `    // 8. Homework Intents (Today / Tomorrow / Specific Date)
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

code = code.slice(0, startIdx) + replacement + code.slice(endIdx);
fs.writeFileSync('src/services/aiAssistantService.ts', code, 'utf8');
console.log('Successfully updated hasHomeworkKeyword in src/services/aiAssistantService.ts');
