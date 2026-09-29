import { AIAssistantService } from '../src/services/aiAssistantService';
import { StudentService } from '../src/services/studentService';
import { AuthService } from '../src/services/authService';
import { MOCK_PARENTS } from '../src/data/mockData';

async function test() {
  const parent = AuthService.getCurrentParent() || MOCK_PARENTS[0];
  console.log('Current parent:', parent?.name, parent?.id, parent?.children);
  const students = StudentService.getChildrenForParent(parent?.id || 'p-01');
  console.log('Students for parent:', students.map(s => ({ id: s.id, name: s.name, class: s.class, sec: s.section })));
  const activeStudent = students[0];

  const queries = [
    "What's today's homework?",
    "What is tomorrow's homework?",
    "Kal ka homework kya hai?",
    "Kal Rohan ka homework kya hai?",
    "Rohan ka maths homework kya hai?",
    "Homework batao",
    "What's his homework?",
    "What is her homework?"
  ];

  for (const q of queries) {
    console.log('\n=======================================');
    console.log('QUERY:', q);
    try {
      const res = await AIAssistantService.processVoiceQuery(
        q,
        students,
        'en',
        activeStudent,
        { autoDetectLanguage: true }
      );
      console.log('Intent:', res.intent);
      console.log('Student:', res.studentName);
      console.log('Spoken:', res.spokenResponse);
      console.log('DetailedData:', res.detailedData);
    } catch (e) {
      console.error('ERROR in processVoiceQuery:', e);
    }
  }
}
test();
