import {
  Student,
  Homework,
  Exam,
  Attendance,
  AcademicResult,
  ClassTimetable,
  Announcement,
  Holiday,
  School,
} from '../../types';

// ==============================================================
// 1. STANDARD REST API CONTRACT HEADERS
// ==============================================================

export interface StandardApiHeaders {
  /** Tenant School ID to guarantee multi-school tenancy isolation */
  'X-School-ID': string;
  /** Bearer JWT token or API Key */
  Authorization: string;
  /** Unique request trace ID for audit logging */
  'X-Correlation-ID'?: string;
  /** Client application version */
  'X-App-Version'?: string;
  /** ISO Language code preference for server localized errors */
  'Accept-Language'?: string;
}

// ==============================================================
// 2. STANDARD API RESPONSE ENVELOPE
// ==============================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    schoolId: string;
    timestamp: string;
    correlationId: string;
    source: 'school-erp' | 'rest-api' | 'cache' | 'mock';
    verified: boolean;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// ==============================================================
// 3. EXACT ENDPOINT DEFINITIONS
// ==============================================================

export const REST_API_ENDPOINTS = {
  // 1. GET /students/:studentId
  GET_STUDENT: (studentId: string) => `/students/${encodeURIComponent(studentId)}`,

  // 2. GET /students/:studentId/homework
  GET_STUDENT_HOMEWORK: (studentId: string) =>
    `/students/${encodeURIComponent(studentId)}/homework`,

  // 3. GET /students/:studentId/exams
  GET_STUDENT_EXAMS: (studentId: string) =>
    `/students/${encodeURIComponent(studentId)}/exams`,

  // 4. GET /students/:studentId/attendance
  GET_STUDENT_ATTENDANCE: (studentId: string) =>
    `/students/${encodeURIComponent(studentId)}/attendance`,

  // 5. GET /students/:studentId/progress
  GET_STUDENT_PROGRESS: (studentId: string) =>
    `/students/${encodeURIComponent(studentId)}/progress`,

  // 6. GET /students/:studentId/timetable
  GET_STUDENT_TIMETABLE: (studentId: string) =>
    `/students/${encodeURIComponent(studentId)}/timetable`,

  // 7. GET /students/:studentId/announcements
  GET_STUDENT_ANNOUNCEMENTS: (studentId: string) =>
    `/students/${encodeURIComponent(studentId)}/announcements`,

  // 8. GET /school/holidays
  GET_SCHOOL_HOLIDAYS: () => `/school/holidays`,

  // Tenancy Master: GET /school
  GET_SCHOOL_PROFILE: () => `/school`,
} as const;

// ==============================================================
// 4. QUERY PARAMETER CONTRACTS
// ==============================================================

export interface HomeworkQueryParams {
  status?: 'pending' | 'completed' | 'all';
  subject?: string;
  dueDate?: 'today' | 'tomorrow' | 'upcoming' | string;
}

export interface AttendanceQueryParams {
  month?: string; // YYYY-MM
  academicYear?: string;
  limitDays?: number;
}

export interface ExamsQueryParams {
  status?: 'upcoming' | 'past' | 'all';
  term?: string;
}

export interface AnnouncementsQueryParams {
  category?: 'urgent' | 'general' | 'event' | 'fee';
  limit?: number;
}

export interface HolidaysQueryParams {
  upcomingOnly?: boolean;
}

// ==============================================================
// 5. CONTRACT RESPONSE TYPES
// ==============================================================

export type StudentResponse = ApiResponse<Student>;
export type HomeworkListResponse = ApiResponse<Homework[]>;
export type ExamsListResponse = ApiResponse<Exam[]>;
export type AttendanceResponse = ApiResponse<Attendance>;
export type ProgressResponse = ApiResponse<AcademicResult>;
export type TimetableResponse = ApiResponse<ClassTimetable>;
export type AnnouncementsListResponse = ApiResponse<Announcement[]>;
export type HolidaysListResponse = ApiResponse<Holiday[]>;
export type SchoolProfileResponse = ApiResponse<School>;
