import {
  School,
  Student,
  Teacher,
  SchoolClass,
  Subject,
  Homework,
  Exam,
  Attendance,
  AcademicResult,
  Holiday,
  Announcement,
  ClassTimetable,
  CSVStudentRow,
  CSVImportValidation,
} from '../types';
import { AuthService } from './authService';
import { SchoolDataProvider } from './providers/SchoolDataProvider';
import { SchoolDataProviderManager } from './providers/SchoolDataProviderManager';

const DB_KEY = 'schoolsathi_authoritative_school_db_v2';

// ==============================================================
// 1. INITIAL DEMO SCHOOL MASTER DATA (SOURCE OF TRUTH)
// ==============================================================

export const DEMO_SCHOOL: School = {
  id: 'sch-demo',
  name: 'SchoolSathi Demo School',
  code: 'SSD-DELHI',
  city: 'New Delhi',
  state: 'Delhi',
  board: 'CBSE',
  verificationCode: 'SSD2026',
  phone: '+91 11 4567 8900',
  email: 'admin@schoolsathidemo.edu.in',
  principalName: 'Dr. Anand Swaroop Sharma',
  verified: true,
  academicYear: '2026-2027',
  logoUrl: '🏫',
};

export const INITIAL_CLASSES: SchoolClass[] = [
  {
    id: 'cls-3a',
    schoolId: 'sch-demo',
    grade: 'Class 3',
    section: 'A',
    displayName: '3-A',
    classTeacherId: 'tch-02',
    classTeacherName: 'Ms. Anjali Sen',
    roomNumber: 'Room 102',
    totalStudents: 32,
  },
  {
    id: 'cls-6b',
    schoolId: 'sch-demo',
    grade: 'Class 6',
    section: 'B',
    displayName: '6-B',
    classTeacherId: 'tch-01',
    classTeacherName: 'Mrs. Sunita Verma',
    roomNumber: 'Room 204',
    totalStudents: 38,
  },
  {
    id: 'cls-9c',
    schoolId: 'sch-demo',
    grade: 'Class 9',
    section: 'C',
    displayName: '9-C',
    classTeacherId: 'tch-03',
    classTeacherName: 'Mr. Deepak Chhabra',
    roomNumber: 'Room 306',
    totalStudents: 41,
  },
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'tch-01',
    schoolId: 'sch-demo',
    name: 'Mrs. Sunita Verma',
    email: 'sunita.verma@schoolsathidemo.edu.in',
    phone: '+91 98112 44321',
    subjectSpecialization: 'Mathematics',
    classesAssigned: ['6-B', '9-C'],
    isClassTeacherOf: '6-B',
    avatarEmoji: '👩‍🏫',
  },
  {
    id: 'tch-02',
    schoolId: 'sch-demo',
    name: 'Ms. Anjali Sen',
    email: 'anjali.sen@schoolsathidemo.edu.in',
    phone: '+91 98223 11980',
    subjectSpecialization: 'English & EVS',
    classesAssigned: ['3-A'],
    isClassTeacherOf: '3-A',
    avatarEmoji: '👩‍🏫',
  },
  {
    id: 'tch-03',
    schoolId: 'sch-demo',
    name: 'Mr. Deepak Chhabra',
    email: 'deepak.chhabra@schoolsathidemo.edu.in',
    phone: '+91 98711 00234',
    subjectSpecialization: 'Physics & Science',
    classesAssigned: ['6-B', '9-C'],
    isClassTeacherOf: '9-C',
    avatarEmoji: '👨‍🏫',
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub-m3', schoolId: 'sch-demo', name: 'Mathematics', code: 'MTH-03', classes: ['3-A'] },
  { id: 'sub-e3', schoolId: 'sch-demo', name: 'English', code: 'ENG-03', classes: ['3-A'] },
  { id: 'sub-v3', schoolId: 'sch-demo', name: 'Environmental Studies (EVS)', code: 'EVS-03', classes: ['3-A'] },
  { id: 'sub-h3', schoolId: 'sch-demo', name: 'Hindi', code: 'HIN-03', classes: ['3-A'] },
  
  { id: 'sub-m6', schoolId: 'sch-demo', name: 'Mathematics', code: 'MTH-06', classes: ['6-B'] },
  { id: 'sub-s6', schoolId: 'sch-demo', name: 'Science', code: 'SCI-06', classes: ['6-B'] },
  { id: 'sub-e6', schoolId: 'sch-demo', name: 'English', code: 'ENG-06', classes: ['6-B'] },
  { id: 'sub-h6', schoolId: 'sch-demo', name: 'Hindi', code: 'HIN-06', classes: ['6-B'] },
  { id: 'sub-ss6', schoolId: 'sch-demo', name: 'Social Science', code: 'SST-06', classes: ['6-B'] },

  { id: 'sub-p9', schoolId: 'sch-demo', name: 'Physics', code: 'PHY-09', classes: ['9-C'] },
  { id: 'sub-c9', schoolId: 'sch-demo', name: 'Chemistry', code: 'CHM-09', classes: ['9-C'] },
  { id: 'sub-m9', schoolId: 'sch-demo', name: 'Mathematics', code: 'MTH-09', classes: ['9-C'] },
  { id: 'sub-cs9', schoolId: 'sch-demo', name: 'Computer Science', code: 'CS-09', classes: ['9-C'] },
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-01',
    name: 'Rohan Sharma',
    fullName: 'Rohan Sharma',
    schoolId: 'sch-demo',
    schoolName: 'SchoolSathi Demo School',
    studentId: 'SSD-2026-6B01',
    admissionNumber: 'SSD-2026-6B01',
    class: 'Class 6',
    grade: 'Class 6',
    section: 'B',
    rollNumber: '14',
    gender: 'male',
    avatarPreference: 'owl-scholar',
    parentMobile: '9876543210',
    dateOfBirth: '14 August 2013',
    bloodGroup: 'B+',
    classTeacherName: 'Mrs. Sunita Verma',
    classTeacherPhone: '+91 98112 44321',
    attendancePercentage: 94,
    presentToday: true,
    busRoute: 'Bus #12 (Stop: Subroto Park)',
  },
  {
    id: 'std-02',
    name: 'Priya Sharma',
    fullName: 'Priya Sharma',
    schoolId: 'sch-demo',
    schoolName: 'SchoolSathi Demo School',
    studentId: 'SSD-2026-3A02',
    admissionNumber: 'SSD-2026-3A02',
    class: 'Class 3',
    grade: 'Class 3',
    section: 'A',
    rollNumber: '08',
    gender: 'female',
    avatarPreference: 'sprout-green',
    parentMobile: '9876543210',
    dateOfBirth: '22 October 2016',
    bloodGroup: 'O+',
    classTeacherName: 'Ms. Anjali Sen',
    classTeacherPhone: '+91 98223 11980',
    attendancePercentage: 98,
    presentToday: true,
    busRoute: 'Bus #12 (Stop: Subroto Park)',
  },
  {
    id: 'std-03',
    name: 'Aarav Sharma',
    fullName: 'Aarav Sharma',
    schoolId: 'sch-demo',
    schoolName: 'SchoolSathi Demo School',
    studentId: 'SSD-2026-9C03',
    admissionNumber: 'SSD-2026-9C03',
    class: 'Class 9',
    grade: 'Class 9',
    section: 'C',
    rollNumber: '22',
    gender: 'male',
    avatarPreference: 'rocket-blue',
    parentMobile: '9876543210',
    dateOfBirth: '05 March 2010',
    bloodGroup: 'A+',
    classTeacherName: 'Mr. Deepak Chhabra',
    classTeacherPhone: '+91 98711 00234',
    attendancePercentage: 86,
    presentToday: true,
    busRoute: 'Bus #07 (Stop: DLF Phase 1)',
  },
  {
    id: 'std-04',
    name: 'Kavya Patel',
    fullName: 'Kavya Patel',
    schoolId: 'sch-demo',
    schoolName: 'SchoolSathi Demo School',
    studentId: 'SSD-2026-3A04',
    admissionNumber: 'SSD-2026-3A04',
    class: 'Class 3',
    grade: 'Class 3',
    section: 'A',
    rollNumber: '11',
    gender: 'female',
    avatarPreference: 'lion-star',
    parentMobile: '9812345678',
    dateOfBirth: '18 December 2016',
    bloodGroup: 'A+',
    classTeacherName: 'Ms. Anjali Sen',
    classTeacherPhone: '+91 98223 11980',
    attendancePercentage: 96,
    presentToday: true,
    busRoute: 'Bus #04',
  },
];

export const INITIAL_HOMEWORK: Homework[] = [
  {
    id: 'hw-601',
    schoolId: 'sch-demo',
    classDisplayName: '6-B',
    subject: 'Maths',
    title: 'Exercise 4.2',
    description: 'Exercise 4.2 — Q1 to Q5',
    assignedDate: 'Today',
    dueDate: 'Tomorrow',
    teacherName: 'Mrs. Sunita Verma',
    urgency: 'high',
    isCompleted: false,
  },
  {
    id: 'hw-602',
    schoolId: 'sch-demo',
    classDisplayName: '6-B',
    subject: 'Science',
    title: 'Chapter 7',
    description: 'Read Chapter 7',
    assignedDate: 'Today',
    dueDate: 'Tomorrow',
    teacherName: 'Mr. Deepak Chhabra',
    urgency: 'normal',
    isCompleted: false,
  },
  {
    id: 'hw-301',
    schoolId: 'sch-demo',
    classDisplayName: '3-A',
    subject: 'English',
    title: 'Poem Recitation: The Wind and The Sun',
    description: 'Practice reading first 8 lines out loud with proper gestures.',
    assignedDate: 'Today',
    dueDate: 'Tomorrow',
    teacherName: 'Ms. Anjali Sen',
    urgency: 'normal',
    isCompleted: true,
  },
  {
    id: 'hw-302',
    schoolId: 'sch-demo',
    classDisplayName: '3-A',
    subject: 'Environmental Studies (EVS)',
    title: 'Leaves Scrapbook',
    description: 'Paste 4 different leaves in scrapbook and write their tree names.',
    assignedDate: 'Yesterday',
    dueDate: 'Tomorrow',
    teacherName: 'Ms. Anjali Sen',
    urgency: 'medium',
    isCompleted: false,
  },
  {
    id: 'hw-901',
    schoolId: 'sch-demo',
    classDisplayName: '9-C',
    subject: 'Physics',
    title: 'Ohm’s Law Numerical Set 3',
    description: 'Complete numerical questions 5-12 from chapter Electricity.',
    assignedDate: 'Today',
    dueDate: 'Tomorrow',
    teacherName: 'Mr. Deepak Chhabra',
    urgency: 'high',
    isCompleted: false,
  },
];

export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'ex-601',
    schoolId: 'sch-demo',
    classDisplayName: '6-B',
    subject: 'Science',
    title: 'Unit Test 2 — Living Organisms & Habitat',
    date: 'Friday, 3 October 2026',
    time: '09:00 AM – 10:30 AM',
    totalMarks: 40,
    syllabus: 'Chapters 6, 7 & 8 (Living organisms, Motion & Light reflection basics)',
    roomNumber: 'Room 204',
  },
  {
    id: 'ex-602',
    schoolId: 'sch-demo',
    classDisplayName: '6-B',
    subject: 'Mathematics',
    title: 'Mid-Term Exam — Arithmetic & Fractions',
    date: 'Wednesday, 8 October 2026',
    time: '08:30 AM – 11:30 AM',
    totalMarks: 80,
    syllabus: 'Chapters 1 to 5 (Integers, Fractions, Decimals, Data Handling)',
    roomNumber: 'Examination Hall A',
  },
  {
    id: 'ex-301',
    schoolId: 'sch-demo',
    classDisplayName: '3-A',
    subject: 'Mathematics',
    title: 'Monthly Maths Quiz & Tables Test',
    date: 'Thursday, 2 October 2026',
    time: '10:00 AM – 11:00 AM',
    totalMarks: 25,
    syllabus: 'Tables up to 12, Addition and Subtraction 3-digit word problems',
    roomNumber: 'Room 102',
  },
  {
    id: 'ex-901',
    schoolId: 'sch-demo',
    classDisplayName: '9-C',
    subject: 'Chemistry',
    title: 'Periodic Table & Chemical Reactions Test',
    date: 'Tuesday, 7 October 2026',
    time: '09:00 AM – 10:30 AM',
    totalMarks: 50,
    syllabus: 'Structure of the Atom, Valency, Chemical Equations balancing',
    roomNumber: 'Lab Block Room 12',
  },
];

export const INITIAL_ATTENDANCE: Record<string, Attendance> = {
  'std-01': {
    studentId: 'std-01',
    overallPercentage: 94,
    totalDays: 112,
    presentDays: 105,
    absentDays: 7,
    recentRecords: [
      { date: 'Today (Monday)', status: 'present' },
      { date: 'Yesterday (Sunday)', status: 'holiday', reason: 'Weekend' },
      { date: 'Saturday', status: 'present' },
      { date: 'Friday', status: 'present' },
      { date: 'Thursday', status: 'leave', reason: 'Viral fever application submitted' },
      { date: 'Wednesday', status: 'present' },
    ],
  },
  'std-02': {
    studentId: 'std-02',
    overallPercentage: 98,
    totalDays: 112,
    presentDays: 110,
    absentDays: 2,
    recentRecords: [
      { date: 'Today (Monday)', status: 'present' },
      { date: 'Yesterday (Sunday)', status: 'holiday', reason: 'Weekend' },
      { date: 'Saturday', status: 'present' },
      { date: 'Friday', status: 'present' },
      { date: 'Thursday', status: 'present' },
      { date: 'Wednesday', status: 'present' },
    ],
  },
  'std-03': {
    studentId: 'std-03',
    overallPercentage: 86,
    totalDays: 112,
    presentDays: 96,
    absentDays: 16,
    recentRecords: [
      { date: 'Today (Monday)', status: 'present' },
      { date: 'Friday', status: 'present' },
      { date: 'Thursday', status: 'absent', reason: 'Unexcused' },
      { date: 'Wednesday', status: 'present' },
    ],
  },
  'std-04': {
    studentId: 'std-04',
    overallPercentage: 96,
    totalDays: 112,
    presentDays: 108,
    absentDays: 4,
    recentRecords: [
      { date: 'Today (Monday)', status: 'present' },
      { date: 'Friday', status: 'present' },
      { date: 'Thursday', status: 'present' },
    ],
  },
};

export const INITIAL_RESULTS: Record<string, AcademicResult> = {
  'std-01': {
    id: 'res-01',
    studentId: 'std-01',
    studentName: 'Rohan Sharma',
    classDisplayName: '6-B',
    term: 'Term 1 Mid-Term Evaluation',
    overallGrade: 'A',
    overallPercentage: 88,
    rankInClass: 5,
    publishedDate: '15 September 2026',
    teacherRemark:
      'Rohan is a well-disciplined student. He participates eagerly in class discussions and completes assignments on time.',
    subjects: [
      { subject: 'Mathematics', score: 92, maxMarks: 100, grade: 'A+', remark: 'Excellent problem solving ability.', trend: 'improving' },
      { subject: 'Science', score: 87, maxMarks: 100, grade: 'A', remark: 'Good curiosity and laboratory activity.', trend: 'steady' },
      { subject: 'English', score: 84, maxMarks: 100, grade: 'A', remark: 'Grammar is very good, practice reading out loud.', trend: 'steady' },
      { subject: 'Hindi', score: 89, maxMarks: 100, grade: 'A', remark: 'Handwriting is neat and vocabulary is rich.', trend: 'improving' },
    ],
  },
  'std-02': {
    id: 'res-02',
    studentId: 'std-02',
    studentName: 'Priya Sharma',
    classDisplayName: '3-A',
    term: 'Term 1 Evaluation',
    overallGrade: 'A+',
    overallPercentage: 95,
    rankInClass: 2,
    publishedDate: '15 September 2026',
    teacherRemark:
      'Priya is a cheerful child who brings joy to the whole classroom. Awarded "Star Student of the Month" for September!',
    subjects: [
      { subject: 'English', score: 96, maxMarks: 100, grade: 'A+', remark: 'Fluent reading and enthusiastic story recitation.', trend: 'improving' },
      { subject: 'Mathematics', score: 94, maxMarks: 100, grade: 'A+', remark: 'Quick mental calculations and clear concepts.', trend: 'steady' },
      { subject: 'EVS', score: 95, maxMarks: 100, grade: 'A+', remark: 'Loves nature projects and asks thoughtful questions.', trend: 'improving' },
    ],
  },
  'std-03': {
    id: 'res-03',
    studentId: 'std-03',
    studentName: 'Aarav Sharma',
    classDisplayName: '9-C',
    term: 'Term 1 Mid-Term Evaluation',
    overallGrade: 'B+',
    overallPercentage: 81,
    rankInClass: 14,
    publishedDate: '15 September 2026',
    teacherRemark:
      'Aarav is bright and capable. Regular attendance and a bit more focus on Chemistry will boost his overall performance.',
    subjects: [
      { subject: 'Physics', score: 86, maxMarks: 100, grade: 'A', remark: 'Shows genuine interest in experiments.', trend: 'improving' },
      { subject: 'Chemistry', score: 72, maxMarks: 100, grade: 'B', remark: 'Needs regular revision of formula balancing.', trend: 'needs_attention' },
      { subject: 'Mathematics', score: 82, maxMarks: 100, grade: 'B+', remark: 'Consistent practice will push score into 90s.', trend: 'steady' },
    ],
  },
};

export const INITIAL_HOLIDAYS: Holiday[] = [
  {
    id: 'hol-01',
    schoolId: 'sch-demo',
    title: 'Gandhi Jayanti',
    startDate: '2 October 2026',
    endDate: '2 October 2026',
    daysCount: 1,
    description: 'National holiday in honor of Mahatma Gandhi birthday.',
    isUpcoming: true,
  },
  {
    id: 'hol-02',
    schoolId: 'sch-demo',
    title: 'Dussehra / Vijayadashami Break',
    startDate: '19 October 2026',
    endDate: '21 October 2026',
    daysCount: 3,
    description: 'Festive autumn school break celebrating Vijayadashami.',
    isUpcoming: true,
  },
  {
    id: 'hol-03',
    schoolId: 'sch-demo',
    title: 'Diwali Vacation',
    startDate: '8 November 2026',
    endDate: '13 November 2026',
    daysCount: 6,
    description: 'Festival of Lights vacation for all students and staff.',
    isUpcoming: true,
  },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-01',
    schoolId: 'sch-demo',
    title: 'Parent-Teacher Meeting (PTM) this Saturday',
    content:
      'PTM will be held on Saturday, 4th October from 8:30 AM to 12:30 PM. Parents can discuss Term-1 progress cards.',
    date: 'Yesterday',
    category: 'urgent',
    isImportant: true,
    targetClasses: ['All'],
  },
  {
    id: 'ann-02',
    schoolId: 'sch-demo',
    title: 'Winter Uniform Transition Notice',
    content:
      'Students may start wearing navy blue winter blazers and sweaters starting from 15th October.',
    date: '3 days ago',
    category: 'general',
    isImportant: false,
    targetClasses: ['All'],
  },
];

export const INITIAL_TIMETABLES: Record<string, ClassTimetable> = {
  '6-B': {
    schoolId: 'sch-demo',
    classDisplayName: '6-B',
    schedule: [
      {
        dayOfWeek: 'Monday',
        periods: [
          { periodNumber: 1, startTime: '08:30 AM', endTime: '09:15 AM', subject: 'Mathematics', teacherName: 'Mrs. Sunita Verma', room: '204' },
          { periodNumber: 2, startTime: '09:15 AM', endTime: '10:00 AM', subject: 'Science', teacherName: 'Mr. Deepak Chhabra', room: 'Lab 2' },
          { periodNumber: 3, startTime: '10:15 AM', endTime: '11:00 AM', subject: 'English', teacherName: 'Mrs. Kavita Roy', room: '204' },
          { periodNumber: 4, startTime: '11:00 AM', endTime: '11:45 AM', subject: 'Social Science', teacherName: 'Mr. R. K. Singh', room: '204' },
        ],
      },
      {
        dayOfWeek: 'Tuesday',
        periods: [
          { periodNumber: 1, startTime: '08:30 AM', endTime: '09:15 AM', subject: 'Science', teacherName: 'Mr. Deepak Chhabra', room: 'Lab 2' },
          { periodNumber: 2, startTime: '09:15 AM', endTime: '10:00 AM', subject: 'Mathematics', teacherName: 'Mrs. Sunita Verma', room: '204' },
          { periodNumber: 3, startTime: '10:15 AM', endTime: '11:00 AM', subject: 'Hindi', teacherName: 'Mrs. Manju Gupta', room: '204' },
        ],
      },
    ],
  },
  '3-A': {
    schoolId: 'sch-demo',
    classDisplayName: '3-A',
    schedule: [
      {
        dayOfWeek: 'Monday',
        periods: [
          { periodNumber: 1, startTime: '08:45 AM', endTime: '09:30 AM', subject: 'English', teacherName: 'Ms. Anjali Sen', room: '102' },
          { periodNumber: 2, startTime: '09:30 AM', endTime: '10:15 AM', subject: 'Mathematics', teacherName: 'Mrs. Ritu Rastogi', room: '102' },
          { periodNumber: 3, startTime: '10:30 AM', endTime: '11:15 AM', subject: 'EVS', teacherName: 'Ms. Anjali Sen', room: '102' },
        ],
      },
    ],
  },
};

// ==============================================================
// 2. AUTHORITATIVE DATABASE STORE (LOCAL STORAGE WRAPPER)
// ==============================================================

interface AuthoritativeStore {
  school: School;
  classes: SchoolClass[];
  teachers: Teacher[];
  subjects: Subject[];
  students: Student[];
  homework: Homework[];
  exams: Exam[];
  attendance: Record<string, Attendance>;
  results: Record<string, AcademicResult>;
  holidays: Holiday[];
  announcements: Announcement[];
  timetables: Record<string, ClassTimetable>;
}

function getStore(): AuthoritativeStore {
  if (typeof window === 'undefined') {
    return {
      school: DEMO_SCHOOL,
      classes: INITIAL_CLASSES,
      teachers: INITIAL_TEACHERS,
      subjects: INITIAL_SUBJECTS,
      students: INITIAL_STUDENTS,
      homework: INITIAL_HOMEWORK,
      exams: INITIAL_EXAMS,
      attendance: INITIAL_ATTENDANCE,
      results: INITIAL_RESULTS,
      holidays: INITIAL_HOLIDAYS,
      announcements: INITIAL_ANNOUNCEMENTS,
      timetables: INITIAL_TIMETABLES,
    };
  }

  try {
    const data = localStorage.getItem(DB_KEY);
    if (!data) {
      const initial: AuthoritativeStore = {
        school: DEMO_SCHOOL,
        classes: INITIAL_CLASSES,
        teachers: INITIAL_TEACHERS,
        subjects: INITIAL_SUBJECTS,
        students: INITIAL_STUDENTS,
        homework: INITIAL_HOMEWORK,
        exams: INITIAL_EXAMS,
        attendance: INITIAL_ATTENDANCE,
        results: INITIAL_RESULTS,
        holidays: INITIAL_HOLIDAYS,
        announcements: INITIAL_ANNOUNCEMENTS,
        timetables: INITIAL_TIMETABLES,
      };
      localStorage.setItem(DB_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(data);
    if (parsed && Array.isArray(parsed.homework)) {
      const hasMaths = parsed.homework.some((h: any) => h.id === 'hw-601' && h.description && h.description.includes('Q1 to Q5'));
      const hasSci = parsed.homework.some((h: any) => h.id === 'hw-602' && h.dueDate === 'Tomorrow');
      if (!hasMaths || !hasSci) {
        parsed.homework = INITIAL_HOMEWORK;
        localStorage.setItem(DB_KEY, JSON.stringify(parsed));
      }
    }
    return parsed;
  } catch {
    return {
      school: DEMO_SCHOOL,
      classes: INITIAL_CLASSES,
      teachers: INITIAL_TEACHERS,
      subjects: INITIAL_SUBJECTS,
      students: INITIAL_STUDENTS,
      homework: INITIAL_HOMEWORK,
      exams: INITIAL_EXAMS,
      attendance: INITIAL_ATTENDANCE,
      results: INITIAL_RESULTS,
      holidays: INITIAL_HOLIDAYS,
      announcements: INITIAL_ANNOUNCEMENTS,
      timetables: INITIAL_TIMETABLES,
    };
  }
}

function saveStore(store: AuthoritativeStore): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save authoritative school store', e);
  }
}

// ==============================================================
// 3. API-READY SERVICE INTERFACE (SOURCE OF TRUTH)
// ==============================================================

export class SchoolDataService {
  // ------------------------------------------------------------
  // SECURITY CHECK: Verify parent authorization for student
  // ------------------------------------------------------------
  private static checkParentAuthorization(studentId: string, parentId?: string): boolean {
    if (!parentId) return true; // Internal or Admin request
    const parent = AuthService.getCurrentParent();
    if (!parent) return false;
    const allowed = new Set(parent.children || parent.childrenIds || []);
    return allowed.has(studentId);
  }

  // ------------------------------------------------------------
  // PROVIDER RESOLUTION: Delegates to active SchoolDataProvider
  // (Mock, REST API, CSV Fallback, or Enterprise ERP Connector)
  // ------------------------------------------------------------

  public static getProvider(schoolId?: string): SchoolDataProvider {
    return SchoolDataProviderManager.getProvider(schoolId || 'sch-demo');
  }

  // ------------------------------------------------------------
  // READ APIS (Consumed by Voice AI & Parent UI)
  // ------------------------------------------------------------

  public static async getSchool(schoolId?: string): Promise<School> {
    const s = await this.getProvider(schoolId).getSchool(schoolId);
    return s || getStore().school;
  }

  public static async getClasses(schoolId?: string): Promise<SchoolClass[]> {
    const prov = this.getProvider(schoolId);
    if (prov.getClasses) {
      const cls = await prov.getClasses(schoolId);
      if (cls && cls.length > 0) return cls;
    }
    return getStore().classes;
  }

  public static async getTeachers(schoolId?: string): Promise<Teacher[]> {
    const prov = this.getProvider(schoolId);
    if (prov.getTeachers) {
      const t = await prov.getTeachers(schoolId);
      if (t && t.length > 0) return t;
    }
    return getStore().teachers;
  }

  public static async getSubjects(classDisplayName?: string, schoolId?: string): Promise<Subject[]> {
    const prov = this.getProvider(schoolId);
    if (prov.getSubjects) {
      const subs = await prov.getSubjects(classDisplayName, schoolId);
      if (subs && subs.length > 0) return subs;
    }
    const subjects = getStore().subjects;
    if (!classDisplayName) return subjects;
    return subjects.filter((s) => s.classes.includes(classDisplayName));
  }

  public static async getStudent(
    studentId: string,
    parentId?: string,
    schoolId?: string
  ): Promise<Student | null> {
    return this.getProvider(schoolId).getStudent(studentId, schoolId, parentId);
  }

  public static async registerStudent(student: Student, schoolId?: string): Promise<Student> {
    const prov = this.getProvider(schoolId);
    if (prov.registerStudent) {
      await prov.registerStudent(student, schoolId);
    }
    const store = getStore();
    const idx = store.students.findIndex(
      (s) => s.id === student.id || s.studentId === student.studentId
    );
    if (idx >= 0) {
      store.students[idx] = { ...store.students[idx], ...student };
    } else {
      store.students.push(student);
    }
    saveStore(store);
    return student;
  }

  public static async getAllStudents(schoolId?: string): Promise<Student[]> {
    return this.getProvider(schoolId).getStudents(schoolId);
  }

  public static async getHomework(
    studentId?: string,
    parentId?: string,
    schoolId?: string
  ): Promise<Homework[]> {
    return this.getProvider(schoolId).getHomework(studentId, schoolId, parentId);
  }

  public static async getExams(
    studentId?: string,
    parentId?: string,
    schoolId?: string
  ): Promise<Exam[]> {
    return this.getProvider(schoolId).getExams(studentId, schoolId, parentId);
  }

  public static async getAttendance(
    studentId: string,
    parentId?: string,
    schoolId?: string
  ): Promise<Attendance | null> {
    return this.getProvider(schoolId).getAttendance(studentId, schoolId, parentId);
  }

  public static async getProgress(
    studentId: string,
    parentId?: string,
    schoolId?: string
  ): Promise<AcademicResult | null> {
    return this.getProvider(schoolId).getProgress(studentId, schoolId, parentId);
  }

  public static async getHolidays(schoolId?: string): Promise<Holiday[]> {
    return this.getProvider(schoolId).getHolidays(schoolId);
  }

  public static async getAnnouncements(
    classDisplayName?: string,
    schoolId?: string
  ): Promise<Announcement[]> {
    return this.getProvider(schoolId).getAnnouncements(schoolId, classDisplayName);
  }

  public static async getTimetable(
    classDisplayName: string,
    schoolId?: string
  ): Promise<ClassTimetable | null> {
    return this.getProvider(schoolId).getTimetable(classDisplayName, schoolId);
  }

  // ------------------------------------------------------------
  // ADMIN & TEACHER MUTATION APIS (Source of Truth Updates)
  // ------------------------------------------------------------

  /**
   * Teacher Workflow: Publish Homework
   * Class → Subject → Date → Description
   * Instantly available to SchoolSathi parent voice queries
   */
  public static publishHomework(data: {
    classDisplayName: string;
    subject: string;
    title: string;
    description: string;
    dueDate: string;
    teacherName?: string;
    urgency?: 'high' | 'medium' | 'normal';
  }): Homework {
    const store = getStore();
    const newHw: Homework = {
      id: `hw-${Date.now().toString().slice(-4)}`,
      schoolId: 'sch-demo',
      classDisplayName: data.classDisplayName,
      subject: data.subject,
      title: data.title || `${data.subject} Assignment`,
      description: data.description,
      assignedDate: 'Today',
      dueDate: data.dueDate || 'Tomorrow',
      teacherName: data.teacherName || 'Teacher',
      urgency: data.urgency || 'high',
      isCompleted: false,
    };

    store.homework.unshift(newHw);
    saveStore(store);
    return newHw;
  }

  /**
   * Admin: Add an Exam
   */
  public static addExam(data: Omit<Exam, 'id' | 'schoolId'>): Exam {
    const store = getStore();
    const newExam: Exam = {
      id: `ex-${Date.now().toString().slice(-4)}`,
      schoolId: 'sch-demo',
      ...data,
    };

    store.exams.push(newExam);
    saveStore(store);
    return newExam;
  }

  /**
   * Admin: Add a Holiday
   */
  public static addHoliday(data: Omit<Holiday, 'id' | 'schoolId'>): Holiday {
    const store = getStore();
    const newHol: Holiday = {
      id: `hol-${Date.now().toString().slice(-4)}`,
      schoolId: 'sch-demo',
      ...data,
    };

    store.holidays.push(newHol);
    saveStore(store);
    return newHol;
  }

  /**
   * Admin: Publish Announcement
   */
  public static publishAnnouncement(data: Omit<Announcement, 'id' | 'schoolId'>): Announcement {
    const store = getStore();
    const newAnn: Announcement = {
      id: `ann-${Date.now().toString().slice(-4)}`,
      schoolId: 'sch-demo',
      ...data,
    };

    store.announcements.unshift(newAnn);
    saveStore(store);
    return newAnn;
  }

  /**
   * Admin & Teacher: Record daily attendance for a class
   */
  public static recordAttendance(
    studentId: string,
    status: 'present' | 'absent' | 'leave',
    dateLabel = 'Today'
  ): void {
    const store = getStore();
    if (!store.attendance[studentId]) {
      store.attendance[studentId] = {
        studentId,
        overallPercentage: 90,
        totalDays: 100,
        presentDays: 90,
        absentDays: 10,
        recentRecords: [],
      };
    }

    const att = store.attendance[studentId];
    att.recentRecords.unshift({ date: dateLabel, status });
    if (status === 'present') {
      att.presentDays += 1;
    } else if (status === 'absent') {
      att.absentDays += 1;
    }
    att.totalDays += 1;
    att.overallPercentage = Math.round((att.presentDays / att.totalDays) * 100);

    // Also update student presentToday status
    const student = store.students.find((s) => s.id === studentId);
    if (student) {
      student.presentToday = status === 'present';
      student.attendancePercentage = att.overallPercentage;
    }

    saveStore(store);
  }

  /**
   * Admin: Update Student Academic Result
   */
  public static updateAcademicResult(result: AcademicResult): void {
    const store = getStore();
    store.results[result.studentId] = result;
    saveStore(store);
  }

  /**
   * Admin: Add new student
   */
  public static addStudent(studentData: Omit<Student, 'id' | 'schoolId'>): Student {
    const store = getStore();
    const newId = `std-${Date.now().toString().slice(-4)}`;
    const student: Student = {
      id: newId,
      schoolId: 'sch-demo',
      schoolName: 'SchoolSathi Demo School',
      ...studentData,
      fullName: studentData.name,
      admissionNumber: studentData.studentId,
      attendancePercentage: studentData.attendancePercentage || 92,
      presentToday: true,
    };

    store.students.push(student);
    saveStore(store);
    return student;
  }

  /**
   * Admin: Update student
   */
  public static updateStudent(studentId: string, updates: Partial<Student>): Student {
    const store = getStore();
    const idx = store.students.findIndex((s) => s.id === studentId);
    if (idx === -1) throw new Error('Student not found');

    const updated = { ...store.students[idx], ...updates };
    store.students[idx] = updated;
    saveStore(store);
    return updated;
  }

  /**
   * Admin: Delete student
   */
  public static deleteStudent(studentId: string): void {
    const store = getStore();
    store.students = store.students.filter((s) => s.id !== studentId);
    saveStore(store);
  }

  /**
   * Admin: Prototype CSV Import with Column Validation
   * Expected columns:
   * student_id, student_name, class, section, roll_number, parent_mobile
   */
  public static importStudentsFromCSV(csvText: string): CSVImportValidation & { importedCount: number } {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) {
      return {
        totalRows: 0,
        validRows: [],
        invalidRows: [
          {
            rowNumber: 1,
            rawText: csvText,
            errors: ['CSV file is empty or missing data rows.'],
          },
        ],
        importedCount: 0,
      };
    }

    // Parse header
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const expectedHeaders = ['student_id', 'student_name', 'class', 'section', 'roll_number', 'parent_mobile'];
    
    // Check if required headers exist
    const missingHeaders = expectedHeaders.filter((h) => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return {
        totalRows: lines.length - 1,
        validRows: [],
        invalidRows: [
          {
            rowNumber: 1,
            rawText: lines[0],
            errors: [`Missing required column headers: ${missingHeaders.join(', ')}`],
          },
        ],
        importedCount: 0,
      };
    }

    const headerIndices: Record<string, number> = {};
    headers.forEach((h, idx) => {
      headerIndices[h] = idx;
    });

    const validRows: CSVStudentRow[] = [];
    const invalidRows: CSVImportValidation['invalidRows'] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      const rowErrors: string[] = [];

      const student_id = cols[headerIndices['student_id']] || '';
      const student_name = cols[headerIndices['student_name']] || '';
      const cls = cols[headerIndices['class']] || '';
      const section = cols[headerIndices['section']] || '';
      const roll_number = cols[headerIndices['roll_number']] || '';
      const parent_mobile = cols[headerIndices['parent_mobile']] || '';

      if (!student_id) rowErrors.push('student_id is required');
      if (!student_name) rowErrors.push('student_name is required');
      if (!cls) rowErrors.push('class is required');
      if (!section) rowErrors.push('section is required');
      if (!roll_number) rowErrors.push('roll_number is required');
      
      const cleanPhone = parent_mobile.replace(/\D/g, '');
      if (!parent_mobile) {
        rowErrors.push('parent_mobile is required');
      } else if (cleanPhone.length < 10) {
        rowErrors.push('parent_mobile must be a valid 10-digit phone number');
      }

      if (rowErrors.length > 0) {
        invalidRows.push({
          rowNumber: i + 1,
          rawText: line,
          errors: rowErrors,
        });
      } else {
        validRows.push({
          student_id,
          student_name,
          class: cls,
          section,
          roll_number,
          parent_mobile: cleanPhone,
        });
      }
    }

    // Insert valid rows into authoritative store
    const store = getStore();
    let importedCount = 0;

    for (const row of validRows) {
      // Check if student with student_id already exists
      const existingIdx = store.students.findIndex(
        (s) => s.studentId.toUpperCase() === row.student_id.toUpperCase()
      );

      const studentRecord: Student = {
        id: existingIdx !== -1 ? store.students[existingIdx].id : `std-${Date.now().toString().slice(-4)}-${importedCount}`,
        name: row.student_name,
        fullName: row.student_name,
        schoolId: 'sch-demo',
        schoolName: 'SchoolSathi Demo School',
        studentId: row.student_id,
        admissionNumber: row.student_id,
        class: row.class.startsWith('Class') ? row.class : `Class ${row.class}`,
        grade: row.class.startsWith('Class') ? row.class : `Class ${row.class}`,
        section: row.section.toUpperCase(),
        rollNumber: row.roll_number,
        parentMobile: row.parent_mobile,
        gender: 'male',
        avatarPreference: 'owl-scholar',
        attendancePercentage: 95,
        presentToday: true,
      };

      if (existingIdx !== -1) {
        store.students[existingIdx] = { ...store.students[existingIdx], ...studentRecord };
      } else {
        store.students.push(studentRecord);
      }
      importedCount++;
    }

    saveStore(store);

    return {
      totalRows: lines.length - 1,
      validRows,
      invalidRows,
      importedCount,
    };
  }

  /**
   * Reset school DB back to initial demo seeds
   */
  public static resetToDemoSeeds(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(DB_KEY);
  }
}
