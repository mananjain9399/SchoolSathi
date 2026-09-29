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
} from '../../types';

// ==============================================================
// 1. DATA PROVIDER TYPES & METADATA
// ==============================================================

export type ProviderType = 'mock' | 'rest' | 'csv' | 'erp';

export interface ProviderHealth {
  status: 'healthy' | 'degraded' | 'offline';
  latencyMs: number;
  lastChecked: string;
  details?: string;
  sourceUrl?: string;
}

// ==============================================================
// 2. WEBHOOK EVENT CONTRACTS
// ==============================================================

export type WebhookEventType =
  | 'homework.updated'
  | 'exam.created'
  | 'attendance.updated'
  | 'announcement.created'
  | 'student.updated'
  | 'holiday.updated'
  | 'result.published';

export interface WebhookPayload<T = any> {
  eventId: string;
  eventType: WebhookEventType;
  schoolId: string;
  timestamp: string; // ISO 8601
  signature: string; // HMAC SHA-256
  data: T;
  sourceSystem?: string; // e.g. "ShaalaDarpan", "Entab", "Fedena"
}

export interface WebhookResult {
  success: boolean;
  eventId: string;
  processedAt: string;
  recordsAffected: number;
  message: string;
}

// ==============================================================
// 3. ADMIN SYNC CONTRACTS
// ==============================================================

export interface SyncResult {
  success: boolean;
  schoolId: string;
  entityType: string;
  recordsProcessed: number;
  errors?: string[];
  timestamp: string;
}

// ==============================================================
// 4. CORE SCHOOL DATA PROVIDER ABSTRACTION INTERFACE
// ==============================================================

export interface SchoolDataProvider {
  readonly providerId: string;
  readonly providerName: string;
  readonly providerType: ProviderType;
  readonly schoolId?: string; // Tenant School ID

  // ------------------------------------------------------------
  // READ CONTRACT: Consumed uniformly by AI Assistant & Parent App
  // ------------------------------------------------------------

  getSchool(schoolId?: string): Promise<School | null>;
  getStudents(schoolId?: string): Promise<Student[]>;
  getStudent(studentId: string, schoolId?: string, parentId?: string): Promise<Student | null>;
  getClasses?(schoolId?: string): Promise<SchoolClass[]>;
  getTeachers?(schoolId?: string): Promise<Teacher[]>;
  getSubjects?(classDisplayName?: string, schoolId?: string): Promise<Subject[]>;

  getHomework(studentId?: string, schoolId?: string, parentId?: string): Promise<Homework[]>;
  getExams(studentId?: string, schoolId?: string, parentId?: string): Promise<Exam[]>;
  getAttendance(studentId: string, schoolId?: string, parentId?: string): Promise<Attendance | null>;
  getProgress(studentId: string, schoolId?: string, parentId?: string): Promise<AcademicResult | null>;
  getTimetable(classDisplayName: string, schoolId?: string): Promise<ClassTimetable | null>;
  getAnnouncements(schoolId?: string, classDisplayName?: string): Promise<Announcement[]>;
  getHolidays(schoolId?: string): Promise<Holiday[]>;

  // ------------------------------------------------------------
  // WRITE & SYNC CONTRACT: Consumed by Admin & External Systems
  // ------------------------------------------------------------

  registerStudent?(student: Student, schoolId?: string): Promise<Student>;
  syncStudents?(schoolId: string, students: Partial<Student>[]): Promise<SyncResult>;
  syncHomework?(schoolId: string, homework: Partial<Homework>[]): Promise<SyncResult>;
  syncExams?(schoolId: string, exams: Partial<Exam>[]): Promise<SyncResult>;
  syncAttendance?(
    schoolId: string,
    records: { studentId: string; date: string; status: 'present' | 'absent' | 'leave'; reason?: string }[]
  ): Promise<SyncResult>;
  syncResults?(schoolId: string, results: Partial<AcademicResult>[]): Promise<SyncResult>;
  syncAnnouncements?(schoolId: string, announcements: Partial<Announcement>[]): Promise<SyncResult>;
  syncHolidays?(schoolId: string, holidays: Partial<Holiday>[]): Promise<SyncResult>;

  // ------------------------------------------------------------
  // WEBHOOK CONTRACT: Ingests real-time events from school ERPs
  // ------------------------------------------------------------

  handleWebhook?(payload: WebhookPayload): Promise<WebhookResult>;

  // ------------------------------------------------------------
  // HEALTH & DIAGNOSTICS CONTRACT
  // ------------------------------------------------------------

  checkHealth(): Promise<ProviderHealth>;
}
