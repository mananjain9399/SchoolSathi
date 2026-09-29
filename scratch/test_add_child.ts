import { StudentService } from '../src/services/studentService';
import { AuthService } from '../src/services/authService';
import { AIAssistantService } from '../src/services/aiAssistantService';
import { SchoolDataService } from '../src/services/schoolDataService';

async function testAddChild() {
  console.log('=== TEST ADD CHILD FLOW ===');
  
  // 1. Create a fresh parent or use p-01
  const parent = AuthService.getCurrentParent();
  console.log('Parent before:', parent?.id, parent?.name, parent?.children);

  // 2. Add child Priya or Custom child
  const newChildData = {
    name: 'Priya Sharma',
    fullName: 'Priya Sharma',
    schoolId: 'sch-demo',
    schoolName: 'SchoolSathi Demo School',
    studentId: 'SSD-2026-3A02',
    class: 'Class 3',
    grade: 'Class 3',
    section: 'A',
    rollNumber: '02',
    gender: 'female' as const,
  };

  const addedChild = StudentService.addManualChild(parent!.id, newChildData);
  console.log('Added child:', addedChild.id, addedChild.name, addedChild.class, addedChild.section);

  // 3. Get updated children
  const updatedChildren = StudentService.getChildrenForParent(parent!.id);
  console.log('Updated children count:', updatedChildren.length);
  console.log('Children:', updatedChildren.map(c => ({ id: c.id, name: c.name, studentId: c.studentId })));

  // 4. Try retrieving homework for this added child from SchoolDataService
  console.log('\nTesting SchoolDataService.getHomework for added child:');
  const hw = await SchoolDataService.getHomework(addedChild.id);
  console.log('Homework found:', hw);

  // 5. Ask AIAssistantService for Priya's homework
  console.log('\nTesting AIAssistantService with query "What is Priya\'s homework?":');
  const response = await AIAssistantService.processVoiceQuery(
    "What is Priya's homework?",
    updatedChildren,
    'en',
    addedChild,
    { autoDetectLanguage: false }
  );
  console.log('AI Response:', response.spokenResponse);
}

testAddChild();
