import {
  SchoolDataProvider,
  ProviderType,
  ProviderHealth,
  SyncResult,
  WebhookPayload,
  WebhookResult,
} from './SchoolDataProvider';
import {
  School,
  Student,
  Homework,
  Exam,
  Attendance,
  AcademicResult,
  Holiday,
  Announcement,
  ClassTimetable,
} from '../../types';
import { REST_API_ENDPOINTS, ApiResponse } from '../api/schoolApiContract';

export interface RestProviderConfig {
  baseUrl: string;
  apiKey?: string;
  authToken?: string;
  schoolId: string;
  timeoutMs?: number;
  fallbackToCache?: boolean;
}

export class RESTSchoolDataProvider implements SchoolDataProvider {
  public readonly providerId = 'provider-rest-api';
  public readonly providerName = 'Real School REST API Provider';
  public readonly providerType: ProviderType = 'rest';
  public readonly schoolId: string;

  private baseUrl: string;
  private apiKey?: string;
  private authToken?: string;
  private timeoutMs: number;
  private cache = new Map<string, { data: any; expiry: number }>();

  constructor(config: RestProviderConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.authToken = config.authToken;
    this.schoolId = config.schoolId;
    this.timeoutMs = config.timeoutMs || 5000;
  }

  // ------------------------------------------------------------
  // HTTP FETCH HELPER (Tenancy & Security Headers)
  // ------------------------------------------------------------

  private async fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    const correlationId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-School-ID': this.schoolId,
      'X-Correlation-ID': correlationId,
      ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
      ...(this.apiKey ? { 'X-API-Key': this.apiKey } : {}),
      ...(options.headers as Record<string, string> || {}),
    };

    const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) return null;
        if (response.status === 403 || response.status === 401) {
          console.error(`[RESTProvider] Unauthorized access to ${endpoint} for school ${this.schoolId}`);
          return null;
        }
        throw new Error(`HTTP Error ${response.status} from ${endpoint}`);
      }

      const json: ApiResponse<T> = await response.json();
      const payload = json.data !== undefined ? json.data : (json as unknown as T);

      // Cache for 60 seconds
      this.cache.set(cacheKey, { data: payload, expiry: Date.now() + 60000 });
      return payload;
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn(`[RESTProvider] Failed to fetch ${url} (falling back if available):`, err.message);

      // Return stale cache if available
      if (cached) {
        return cached.data;
      }
      return null;
    }
  }

  // ------------------------------------------------------------
  // READ IMPLEMENTATIONS (API CONTRACT ENDPOINTS)
  // ------------------------------------------------------------

  // GET /school
  public async getSchool(schoolId?: string): Promise<School | null> {
    const targetSchool = schoolId || this.schoolId;
    return this.fetchApi<School>(REST_API_ENDPOINTS.GET_SCHOOL_PROFILE());
  }

  // GET /students/:studentId
  public async getStudent(
    studentId: string,
    schoolId?: string,
    parentId?: string
  ): Promise<Student | null> {
    const endpoint = REST_API_ENDPOINTS.GET_STUDENT(studentId);
    return this.fetchApi<Student>(endpoint);
  }

  // GET /students
  public async getStudents(schoolId?: string): Promise<Student[]> {
    const list = await this.fetchApi<Student[]>('/students');
    return list || [];
  }

  // GET /students/:studentId/homework
  public async getHomework(
    studentId?: string,
    schoolId?: string,
    parentId?: string
  ): Promise<Homework[]> {
    if (!studentId) {
      const list = await this.fetchApi<Homework[]>('/homework');
      return list || [];
    }
    const endpoint = REST_API_ENDPOINTS.GET_STUDENT_HOMEWORK(studentId);
    const list = await this.fetchApi<Homework[]>(endpoint);
    return list || [];
  }

  // GET /students/:studentId/exams
  public async getExams(
    studentId?: string,
    schoolId?: string,
    parentId?: string
  ): Promise<Exam[]> {
    if (!studentId) {
      const list = await this.fetchApi<Exam[]>('/exams');
      return list || [];
    }
    const endpoint = REST_API_ENDPOINTS.GET_STUDENT_EXAMS(studentId);
    const list = await this.fetchApi<Exam[]>(endpoint);
    return list || [];
  }

  // GET /students/:studentId/attendance
  public async getAttendance(
    studentId: string,
    schoolId?: string,
    parentId?: string
  ): Promise<Attendance | null> {
    const endpoint = REST_API_ENDPOINTS.GET_STUDENT_ATTENDANCE(studentId);
    return this.fetchApi<Attendance>(endpoint);
  }

  // GET /students/:studentId/progress
  public async getProgress(
    studentId: string,
    schoolId?: string,
    parentId?: string
  ): Promise<AcademicResult | null> {
    const endpoint = REST_API_ENDPOINTS.GET_STUDENT_PROGRESS(studentId);
    return this.fetchApi<AcademicResult>(endpoint);
  }

  // GET /students/:studentId/timetable
  public async getTimetable(
    classDisplayName: string,
    schoolId?: string
  ): Promise<ClassTimetable | null> {
    const endpoint = `/timetable?class=${encodeURIComponent(classDisplayName)}`;
    return this.fetchApi<ClassTimetable>(endpoint);
  }

  // GET /students/:studentId/announcements
  public async getAnnouncements(
    schoolId?: string,
    classDisplayName?: string
  ): Promise<Announcement[]> {
    const endpoint = classDisplayName
      ? `/announcements?class=${encodeURIComponent(classDisplayName)}`
      : '/announcements';
    const list = await this.fetchApi<Announcement[]>(endpoint);
    return list || [];
  }

  // GET /school/holidays
  public async getHolidays(schoolId?: string): Promise<Holiday[]> {
    const list = await this.fetchApi<Holiday[]>(REST_API_ENDPOINTS.GET_SCHOOL_HOLIDAYS());
    return list || [];
  }

  // ------------------------------------------------------------
  // ADMIN SYNC POSTS
  // ------------------------------------------------------------

  public async syncStudents(schoolId: string, students: Partial<Student>[]): Promise<SyncResult> {
    const res = await this.fetchApi<SyncResult>('/admin/sync/students', {
      method: 'POST',
      body: JSON.stringify({ schoolId, students }),
    });
    return res || {
      success: false,
      schoolId,
      entityType: 'students',
      recordsProcessed: 0,
      timestamp: new Date().toISOString(),
    };
  }

  public async syncHomework(schoolId: string, homework: Partial<Homework>[]): Promise<SyncResult> {
    const res = await this.fetchApi<SyncResult>('/admin/sync/homework', {
      method: 'POST',
      body: JSON.stringify({ schoolId, homework }),
    });
    return res || {
      success: false,
      schoolId,
      entityType: 'homework',
      recordsProcessed: 0,
      timestamp: new Date().toISOString(),
    };
  }

  public async syncExams(schoolId: string, exams: Partial<Exam>[]): Promise<SyncResult> {
    const res = await this.fetchApi<SyncResult>('/admin/sync/exams', {
      method: 'POST',
      body: JSON.stringify({ schoolId, exams }),
    });
    return res || {
      success: false,
      schoolId,
      entityType: 'exams',
      recordsProcessed: 0,
      timestamp: new Date().toISOString(),
    };
  }

  public async syncAttendance(
    schoolId: string,
    records: { studentId: string; date: string; status: 'present' | 'absent' | 'leave'; reason?: string }[]
  ): Promise<SyncResult> {
    const res = await this.fetchApi<SyncResult>('/admin/sync/attendance', {
      method: 'POST',
      body: JSON.stringify({ schoolId, records }),
    });
    return res || {
      success: false,
      schoolId,
      entityType: 'attendance',
      recordsProcessed: 0,
      timestamp: new Date().toISOString(),
    };
  }

  public async syncResults(schoolId: string, results: Partial<AcademicResult>[]): Promise<SyncResult> {
    const res = await this.fetchApi<SyncResult>('/admin/sync/results', {
      method: 'POST',
      body: JSON.stringify({ schoolId, results }),
    });
    return res || {
      success: false,
      schoolId,
      entityType: 'results',
      recordsProcessed: 0,
      timestamp: new Date().toISOString(),
    };
  }

  public async syncAnnouncements(schoolId: string, announcements: Partial<Announcement>[]): Promise<SyncResult> {
    const res = await this.fetchApi<SyncResult>('/admin/sync/announcements', {
      method: 'POST',
      body: JSON.stringify({ schoolId, announcements }),
    });
    return res || {
      success: false,
      schoolId,
      entityType: 'announcements',
      recordsProcessed: 0,
      timestamp: new Date().toISOString(),
    };
  }

  public async syncHolidays(schoolId: string, holidays: Partial<Holiday>[]): Promise<SyncResult> {
    const res = await this.fetchApi<SyncResult>('/admin/sync/holidays', {
      method: 'POST',
      body: JSON.stringify({ schoolId, holidays }),
    });
    return res || {
      success: false,
      schoolId,
      entityType: 'holidays',
      recordsProcessed: 0,
      timestamp: new Date().toISOString(),
    };
  }

  // ------------------------------------------------------------
  // WEBHOOK DISPATCH
  // ------------------------------------------------------------

  public async handleWebhook(payload: WebhookPayload): Promise<WebhookResult> {
    const res = await this.fetchApi<WebhookResult>('/webhooks/ingest', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res || {
      success: false,
      eventId: payload.eventId,
      processedAt: new Date().toISOString(),
      recordsAffected: 0,
      message: 'Failed to deliver webhook to upstream endpoint',
    };
  }

  // ------------------------------------------------------------
  // HEALTH CHECK
  // ------------------------------------------------------------

  public async checkHealth(): Promise<ProviderHealth> {
    const start = Date.now();
    try {
      const res = await fetch(`${this.baseUrl}/health`, {
        headers: { 'X-School-ID': this.schoolId },
        signal: AbortSignal.timeout(2000),
      });
      const latencyMs = Date.now() - start;
      return {
        status: res.ok ? 'healthy' : 'degraded',
        latencyMs,
        lastChecked: new Date().toISOString(),
        sourceUrl: this.baseUrl,
        details: res.ok ? 'Live REST API endpoint connected' : `HTTP status ${res.status}`,
      };
    } catch (e: any) {
      return {
        status: 'offline',
        latencyMs: Date.now() - start,
        lastChecked: new Date().toISOString(),
        sourceUrl: this.baseUrl,
        details: `Endpoint unreachable: ${e.message}`,
      };
    }
  }
}
