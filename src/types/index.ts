export type LanguageCode =
  | 'hi'
  | 'en'
  | 'mr'
  | 'pa'
  | 'bn'
  | 'ta'
  | 'te'
  | 'gu';

export interface LanguageOption {
  code: LanguageCode;
  name: string; // Native name e.g. हिन्दी
  englishName: string; // English name e.g. Hindi
  greeting: string;
  sampleAudioText: string;
  scriptFont?: string;
}

export type AvatarState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'happy'
  | 'concerned'
  | 'celebrating'
  | 'error'
  | 'IDLE'
  | 'LISTENING'
  | 'THINKING'
  | 'SPEAKING'
  | 'HAPPY'
  | 'CONCERNED'
  | 'CELEBRATING'
  | 'ERROR';

export type AvatarPersona = 'neutral' | 'boy' | 'girl' | 'auto';

// ==========================================
// 1. SCHOOL & INSTITUTION DATA MODEL
// ==========================================

export interface School {
  id: string;
  name: string;
  code?: string; // e.g. "SCH-DEMO"
  city: string;
  state: string;
  board: 'CBSE' | 'ICSE' | 'State Board' | 'Kendriya Vidyalaya';
  verificationCode: string;
  phone: string;
  email?: string;
  principalName?: string;
  verified: boolean;
  logoUrl?: string;
  academicYear?: string;
}

// ==========================================
// 2. TEACHER & CLASSROOM ENTITIES
// ==========================================

export interface Teacher {
  id: string;
  schoolId: string;
  name: string;
  email: string;
  phone: string;
  subjectSpecialization: string;
  classesAssigned: string[]; // e.g. ["3-A", "6-B", "9-C"]
  isClassTeacherOf?: string; // e.g. "6-B"
  avatarEmoji?: string;
}

export interface SchoolClass {
  id: string;
  schoolId: string;
  grade: string; // e.g. "Class 6" or "6"
  section: string; // e.g. "B"
  displayName: string; // e.g. "6-B"
  classTeacherId?: string;
  classTeacherName?: string;
  roomNumber?: string;
  totalStudents: number;
}

export interface Subject {
  id: string;
  schoolId: string;
  name: string; // e.g. "Mathematics", "Science"
  code: string; // e.g. "MATH-06"
  classes: string[]; // e.g. ["3-A", "6-B", "9-C"]
}

// ==========================================
// 3. STUDENT & PARENT DATA MODEL
// ==========================================

export interface Student {
  id: string;
  name: string;
  schoolId: string;
  schoolName?: string;
  studentId: string; // Unique student admission ID e.g. "KV-2024-8841"
  class: string; // e.g. "Class 6" or "6-B"
  section: string; // e.g. "B"
  rollNumber: string;
  gender: 'male' | 'female' | 'other';
  avatarPreference: string;
  parentMobile?: string; // Linked parent mobile number for verification
  
  // Official school registry metadata
  fullName?: string;
  admissionNumber?: string;
  grade?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  classTeacherName?: string;
  classTeacherPhone?: string;
  attendancePercentage?: number;
  presentToday?: boolean;
  busRoute?: string;
  emergencyContact?: string;
}

// Child is an alias for Student
export type Child = Student;

export interface Parent {
  id: string;
  name: string;
  mobile: string;
  preferredLanguage: LanguageCode;
  children: string[]; // List of Student IDs strictly authorized for this parent
  relationship?: 'Mother' | 'Father' | 'Guardian';
  voiceSpeed?: 'slow' | 'normal' | 'fast';
  autoSpeak?: boolean;
  autoDetectLanguage?: boolean;
  avatarPersona?: AvatarPersona;
  fullName?: string;
  phoneNumber?: string;
  childrenIds?: string[];
}

export interface VerifiedStudentRecord {
  id?: string;
  studentId: string;
  schoolId: string;
  name: string;
  class: string;
  section: string;
  rollNumber: string;
  gender: 'male' | 'female' | 'other';
  avatarPreference: string;
  schoolName: string;
  dateOfBirth: string;
  bloodGroup: string;
  classTeacherName: string;
  classTeacherPhone: string;
  parentMobile: string;
  attendancePercentage: number;
  presentToday: boolean;
  busRoute?: string;
  emergencyContact?: string;
}

// ==========================================
// 4. ACADEMIC WORKFLOWS: HOMEWORK, EXAMS, TIMETABLE
// ==========================================

export interface Homework {
  id: string;
  schoolId?: string;
  studentId?: string; // Optional: individual student, or class-wide
  classDisplayName?: string; // e.g. "6-B"
  subject: string;
  title: string;
  description: string;
  assignedDate: string; // YYYY-MM-DD or readable
  dueDate: string; // YYYY-MM-DD or "Tomorrow"
  teacherId?: string;
  teacherName?: string;
  urgency: 'high' | 'medium' | 'normal';
  isCompleted?: boolean;
}

export interface Exam {
  id: string;
  schoolId?: string;
  studentId?: string; // Optional: individual or class-wide
  classDisplayName?: string; // e.g. "6-B"
  subject: string;
  title: string; // e.g. "Unit Test 2 — Living Organisms"
  date: string;
  time: string;
  totalMarks: number;
  syllabus: string;
  roomNumber?: string;
}

export interface TimetablePeriod {
  periodNumber: number;
  startTime: string; // e.g. "08:30 AM"
  endTime: string; // e.g. "09:15 AM"
  subject: string;
  teacherName: string;
  room: string;
}

export interface TimetableDay {
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periods: TimetablePeriod[];
}

export interface ClassTimetable {
  schoolId: string;
  classDisplayName: string; // e.g. "6-B"
  schedule: TimetableDay[];
}

// ==========================================
// 5. ATTENDANCE & ACADEMIC RESULTS
// ==========================================

export interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'leave' | 'holiday';
  reason?: string;
}

export interface Attendance {
  studentId: string;
  overallPercentage: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  recentRecords: AttendanceRecord[];
}

export interface SubjectResult {
  subject: string;
  score: number;
  maxMarks?: number;
  grade: string;
  remark: string;
  trend: 'improving' | 'steady' | 'needs_attention';
}

export interface AcademicResult {
  id?: string;
  studentId: string;
  studentName?: string;
  classDisplayName?: string;
  term?: string; // e.g. "Term 1 Mid-Term"
  overallGrade: string;
  overallPercentage: number;
  rankInClass?: number;
  subjects: SubjectResult[];
  teacherRemark: string;
  publishedDate?: string;
}

// Backward compatibility alias for AcademicProgress
export type AcademicProgress = AcademicResult;

// ==========================================
// 6. HOLIDAYS & ANNOUNCEMENTS
// ==========================================

export interface Holiday {
  id: string;
  schoolId?: string;
  title: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  description: string;
  isUpcoming: boolean;
}

export interface Announcement {
  id: string;
  schoolId: string;
  title: string;
  content: string;
  date: string;
  category: 'urgent' | 'general' | 'event' | 'fee';
  isImportant: boolean;
  targetClasses?: string[]; // e.g. ["All", "6-B"]
}

// ==========================================
// 7. CSV IMPORT DATA MODELS
// ==========================================

export interface CSVStudentRow {
  student_id: string;
  student_name: string;
  class: string;
  section: string;
  roll_number: string;
  parent_mobile: string;
}

export interface CSVImportValidation {
  totalRows: number;
  validRows: CSVStudentRow[];
  invalidRows: {
    rowNumber: number;
    rawText: string;
    errors: string[];
  }[];
}

// ==========================================
// 8. VERIFICATION & NAVIGATION TYPES
// ==========================================

export interface VerificationRequest {
  schoolId: string;
  studentId: string;
  childName: string;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  child?: Student;
  matchedRecord?: VerifiedStudentRecord;
  mismatchReason?: 'school_not_found' | 'id_not_found' | 'name_mismatch' | 'already_linked';
}

export type ScreenId =
  | 'welcome'
  | 'login'
  | 'register'
  | 'language'
  | 'add-child'
  | 'select-school'
  | 'verify-child'
  | 'intro'
  | 'main-companion'
  | 'child-profile'
  | 'settings'
  | 'help'
  | 'admin';

export interface VoiceQueryResult {
  query: string;
  category:
    | 'homework'
    | 'exams'
    | 'attendance'
    | 'progress'
    | 'holidays'
    | 'announcements'
    | 'notices'
    | 'all-children'
    | 'timetable'
    | 'child-info'
    | 'general';
  spokenResponse: string;
  avatarMood: AvatarState;
  detailedData?: any;
  isMultiChild?: boolean;
  intent?: string;
  studentName?: string;
  detectedLanguage?: LanguageCode;
  isAutoDetected?: boolean;
}


export type VoiceGender = 'female' | 'male';
export type VoiceSpeed = 'slow' | 'normal' | 'fast';
export type VoiceStyle = 'friendly' | 'calm';
export type VoiceProviderType = 'realistic' | 'browser';

export interface VoiceSettings {
  gender: VoiceGender;
  speed: VoiceSpeed;
  style: VoiceStyle;
  provider: VoiceProviderType;
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: VoiceGender;
  language: LanguageCode;
  langTag: string;
  isRealistic?: boolean;
}

export interface VoiceSpeakOptions {
  language?: LanguageCode;
  gender?: VoiceGender;
  speed?: VoiceSpeed;
  style?: VoiceStyle;
  pitch?: number;
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}
