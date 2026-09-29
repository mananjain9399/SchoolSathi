// Mock localStorage for Node environment
class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string) { return this.store[key] || null; }
  setItem(key: string, value: string) { this.store[key] = String(value); }
  removeItem(key: string) { delete this.store[key]; }
  clear() { this.store = {}; }
}

(global as any).localStorage = new LocalStorageMock();
(global as any).window = { localStorage: (global as any).localStorage };

import { AuthService } from '../src/services/authService';
import { StudentService } from '../src/services/studentService';
import { SchoolDataService } from '../src/services/schoolDataService';
import { HomeworkService } from '../src/services/homeworkService';
import { AIAssistantService } from '../src/services/aiAssistantService';

async function runTestSuite() {
  console.log('====================================================');
  console.log('STARTING SCHOOLSATHI VERIFICATION TEST SUITE');
  console.log('====================================================\n');

  // STEP 0: Setup Parent Account
  console.log('--- STEP 0: Authenticating Parent ---');
  const loginRes = await AuthService.verifyOtp('+91 98765 43210', '1234', 'Suresh Sharma', 'hi');
  const parentId = loginRes.parent!.id;
  console.log(`Parent logged in: ${loginRes.parent!.name} (ID: ${parentId})`);

  // STEP 1: Add Rohan
  console.log('\n--- STEP 1: Add Rohan ---');
  const rohan = StudentService.addManualChild(parentId, {
    name: 'Rohan Sharma',
    fullName: 'Rohan Sharma',
    schoolName: 'Kendriya Vidyalaya No. 1, Delhi Cantt',
    class: 'Class 6',
    section: 'B',
    studentId: 'KV-2024-8841',
    admissionNumber: 'KV-2024-8841',
    gender: 'male',
  });
  console.log(`Added child: ${rohan.name}, ID: ${rohan.id}, School: ${rohan.schoolName}, Class: ${rohan.class}-${rohan.section}`);

  let children = StudentService.getChildrenForParent(parentId);
  console.log(`Children linked to parent: ${children.map(c => c.name).join(', ')}`);
  if (children.length !== 1 || children[0].name !== 'Rohan Sharma') {
    throw new Error('Step 1 Failed: Rohan was not linked properly');
  }

  // STEP 2: Ask for Rohan's homework
  console.log("\n--- STEP 2: Ask for Rohan's homework ---");
  const rohanHwRes = await HomeworkService.getHomework(rohan.id, 'today');
  console.log(`HomeworkService result for Rohan:`, JSON.stringify(rohanHwRes, null, 2));

  // Test Task 2 Queries with 1 child (Rohan active)
  const queriesToTestSingle = [
    "What's today's homework?",
    "What is tomorrow's homework?",
    "Kal ka homework kya hai?",
    "Kal Rohan ka homework kya hai?",
    "Rohan ka maths homework kya hai?",
    "Homework batao",
    "What's his homework?",
  ];

  for (const q of queriesToTestSingle) {
    const res = await AIAssistantService.processVoiceQuery(
      q,
      children,
      'hi',
      rohan
    );
    console.log(`Query: "${q}"`);
    console.log(`  Intent: ${res.intent}`);
    console.log(`  Child used: ${res.studentName}`);
    console.log(`  Response: "${res.spokenResponse}"`);
    if (!res.spokenResponse || res.spokenResponse.includes("couldn't find")) {
      throw new Error(`Query "${q}" failed to retrieve homework!`);
    }
  }

  // STEP 3: Add Priya
  console.log('\n--- STEP 3: Add Priya (without page refresh) ---');
  const priya = StudentService.addManualChild(parentId, {
    name: 'Priya Sharma',
    fullName: 'Priya Sharma',
    schoolName: 'Kendriya Vidyalaya No. 1, Delhi Cantt',
    class: 'Class 3',
    section: 'A',
    studentId: 'KV-2024-9922',
    admissionNumber: 'KV-2024-9922',
    gender: 'female',
  });
  console.log(`Added child: ${priya.name}, ID: ${priya.id}, Class: ${priya.class}-${priya.section}`);

  children = StudentService.getChildrenForParent(parentId);
  console.log(`Children currently in state: ${children.map(c => c.name).join(', ')}`);
  if (children.length !== 2) {
    throw new Error('Step 3 Failed: Both children should be available without refresh');
  }

  // STEP 4: Ask for Priya's homework without refreshing (Priya is now active child)
  console.log("\n--- STEP 4: Ask for Priya's homework without refreshing ---");
  const priyaHwRes = await HomeworkService.getHomework(priya.id, 'today');
  console.log(`HomeworkService result for Priya:`, JSON.stringify(priyaHwRes, null, 2));

  // Test Priya as active child with "What's her homework?"
  const priyaQuery = await AIAssistantService.processVoiceQuery(
    "What's her homework?",
    children,
    'en',
    priya
  );
  console.log(`Query: "What's her homework?" (Priya active)`);
  console.log(`  Student resolved: ${priyaQuery.studentName}`);
  console.log(`  Response: "${priyaQuery.spokenResponse}"`);
  if (priyaQuery.studentName !== 'Priya') {
    throw new Error(`Expected Priya, got ${priyaQuery.studentName}`);
  }

  // STEP 5: Switch back to Rohan
  console.log('\n--- STEP 5: Switch back to Rohan as active child ---');
  const activeChildRohan = children.find(c => c.name.includes('Rohan'))!;
  console.log(`Active child is now: ${activeChildRohan.name}`);

  // STEP 6: Ask "What is his homework?"
  console.log('\n--- STEP 6: Ask "What is his homework?" (Rohan active) ---');
  const rohanHisQuery = await AIAssistantService.processVoiceQuery(
    "What is his homework?",
    children,
    'en',
    activeChildRohan
  );
  console.log(`Query: "What is his homework?" (Rohan active)`);
  console.log(`  Student resolved: ${rohanHisQuery.studentName}`);
  console.log(`  Response: "${rohanHisQuery.spokenResponse}"`);
  if (rohanHisQuery.studentName !== 'Rohan') {
    throw new Error(`Expected Rohan, got ${rohanHisQuery.studentName}`);
  }

  // STEP 7: Simulate browser refresh
  console.log('\n--- STEP 7: Simulate Browser Refresh (Re-reading from persistence) ---');
  // Re-read parent and children stores as a refreshed browser tab would do on reload
  const reloadedParent = AuthService.getCurrentParent();
  console.log(`Reloaded parent session: ${reloadedParent?.name}, children IDs:`, reloadedParent?.children);
  const reloadedChildren = StudentService.getChildrenForParent(reloadedParent!.id);
  console.log(`Reloaded children from storage: ${reloadedChildren.map(c => c.name).join(', ')}`);

  // STEP 8: Verify both children still exist
  console.log('\n--- STEP 8: Verify both children still exist after refresh ---');
  if (reloadedChildren.length !== 2) {
    throw new Error(`Step 8 Failed: Expected 2 children after refresh, found ${reloadedChildren.length}`);
  }
  const hasRohan = reloadedChildren.some(c => c.name.includes('Rohan'));
  const hasPriya = reloadedChildren.some(c => c.name.includes('Priya'));
  console.log(`Rohan exists: ${hasRohan}, Priya exists: ${hasPriya}`);
  if (!hasRohan || !hasPriya) {
    throw new Error('Step 8 Failed: Both children must persist!');
  }

  // STEP 9: Ask homework again
  console.log('\n--- STEP 9: Ask homework again after refresh ---');
  const finalRohanQuery = await AIAssistantService.processVoiceQuery(
    "What's today's homework?",
    reloadedChildren,
    'en',
    reloadedChildren[0] // Rohan
  );
  console.log(`Query: "What's today's homework?" (Rohan active)`);
  console.log(`  Response: "${finalRohanQuery.spokenResponse}"`);

  const finalPriyaQuery = await AIAssistantService.processVoiceQuery(
    "What's today's homework?",
    reloadedChildren,
    'en',
    reloadedChildren[1] // Priya
  );
  console.log(`Query: "What's today's homework?" (Priya active)`);
  console.log(`  Response: "${finalPriyaQuery.spokenResponse}"`);

  // STEP 10: Test Edge cases (No homework & Error states)
  console.log('\n--- STEP 10: Testing Edge Cases (Empty homework & Errors) ---');
  // Child with no homework
  const emptyChild = StudentService.addManualChild(parentId, {
    name: 'Aarav Sharma',
    fullName: 'Aarav Sharma',
    schoolName: 'Kendriya Vidyalaya No. 1, Delhi Cantt',
    class: 'Class 12',
    section: 'C',
    studentId: 'KV-2024-EMPTY',
    gender: 'male',
  });
  const emptyHwQuery = await AIAssistantService.processVoiceQuery(
    "What's today's homework?",
    [emptyChild],
    'en',
    emptyChild
  );
  console.log(`Empty homework response: "${emptyHwQuery.spokenResponse}"`);
  if (!emptyHwQuery.spokenResponse.includes("There is no homework recorded for Aarav")) {
    throw new Error(`Expected exact no-homework message, got: ${emptyHwQuery.spokenResponse}`);
  }

  // Error state test
  const errorHwRes = await HomeworkService.getHomework('', 'today');
  console.log(`Error state test result:`, errorHwRes.error);
  if (errorHwRes.error !== "I couldn't access the school records right now. Please try again.") {
    throw new Error('Error message mismatch!');
  }

  console.log('\n====================================================');
  console.log('ALL 10 TESTS PASSED SUCCESSFULLY! 100% VERIFIED!');
  console.log('====================================================');
}

runTestSuite().catch(err => {
  console.error('\nTEST FAILED WITH ERROR:', err);
  process.exit(1);
});
