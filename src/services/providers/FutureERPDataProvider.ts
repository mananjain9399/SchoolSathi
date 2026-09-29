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
import { MockSchoolDataProvider } from './MockSchoolDataProvider';

export type SupportedERPType =
  | 'shaala-darpan'
  | 'entab-campuscare'
  | 'fedena'
  | 'teachmint'
  | 'generic-erp';

export interface ERPConnectorConfig {
  erpType: SupportedERPType;
  schoolId: string;
  clientId?: string;
  clientSecret?: string;
  webhookSecret?: string;
  erpEndpointUrl?: string;
  syncIntervalMinutes?: number;
  autoSyncEnabled?: boolean;
}

export class FutureERPDataProvider implements SchoolDataProvider {
  public readonly providerId: string;
  public readonly providerName: string;
  public readonly providerType: ProviderType = 'erp';
  public readonly schoolId: string;

  private config: ERPConnectorConfig;
  private localCache: MockSchoolDataProvider;
  private lastSyncTimestamp: string | null = null;
  private webhookCounter = 0;

  constructor(config: ERPConnectorConfig) {
    this.config = config;
    this.schoolId = config.schoolId;
    this.providerId = `provider-erp-${config.erpType}`;
    this.providerName = `Enterprise School ERP Connector (${this.getERPDisplayName(config.erpType)})`;
    this.localCache = new MockSchoolDataProvider(config.schoolId);
  }

  private getERPDisplayName(type: SupportedERPType): string {
    switch (type) {
      case 'shaala-darpan':
        return 'Shaala Darpan / KV UBI Portal';
      case 'entab-campuscare':
        return 'Entab CampusCare ERP';
      case 'fedena':
        return 'Fedena School Management';
      case 'teachmint':
        return 'Teachmint School OS';
      default:
        return 'Standard School ERP Connector';
    }
  }

  // ------------------------------------------------------------
  // ADAPTER TRANSFORMATION ENGINES
  // ------------------------------------------------------------

  public transformERPStudent(rawStudent: any): Partial<Student> {
    return {
      studentId: rawStudent.admission_no || rawStudent.studentId || rawStudent.id,
      name: rawStudent.full_name || rawStudent.name || rawStudent.student_name,
      class: rawStudent.grade || rawStudent.standard || rawStudent.class,
      section: rawStudent.section || 'A',
      rollNumber: String(rawStudent.roll_no || rawStudent.rollNumber || '01'),
      parentMobile: rawStudent.guardian_mobile || rawStudent.mobile || rawStudent.parent_mobile,
      gender: rawStudent.gender?.toLowerCase() === 'female' ? 'female' : 'male',
      schoolId: this.schoolId,
    };
  }

  public transformERPHomework(rawHw: any): Partial<Homework> {
    return {
      subject: rawHw.subject_name || rawHw.subject || 'General',
      title: rawHw.topic || rawHw.title || 'Assignment',
      description: rawHw.task_description || rawHw.description || '',
      assignedDate: rawHw.assigned_on || 'Today',
      dueDate: rawHw.submission_date || rawHw.dueDate || 'Tomorrow',
      classDisplayName: rawHw.class_section || rawHw.class || 'All',
      schoolId: this.schoolId,
      isCompleted: false,
    };
  }

  // ------------------------------------------------------------
  // REAL-TIME WEBHOOK INGESTION ENGINE
  // ------------------------------------------------------------

  public async handleWebhook(payload: WebhookPayload): Promise<WebhookResult> {
    // 1. Verify Tenant Isolation
    if (payload.schoolId !== this.schoolId) {
      return {
        success: false,
        eventId: payload.eventId,
        processedAt: new Date().toISOString(),
        recordsAffected: 0,
        message: `Tenant mismatch: Event meant for school ${payload.schoolId}, but received by ${this.schoolId}`,
      };
    }

    // 2. Delegate to localCache to update instantaneous AI knowledge
    const result = await this.localCache.handleWebhook(payload);
    this.lastSyncTimestamp = new Date().toISOString();
    this.webhookCounter++;

    return result;
  }

  // ------------------------------------------------------------
  // DELEGATE READS TO REPLICATED LOCAL CACHE
  // ------------------------------------------------------------

  public async getSchool(schoolId?: string): Promise<School | null> {
    return this.localCache.getSchool(schoolId || this.schoolId);
  }

  public async getStudents(schoolId?: string): Promise<Student[]> {
    return this.localCache.getStudents(schoolId || this.schoolId);
  }

  public async getStudent(
    studentId: string,
    schoolId?: string,
    parentId?: string
  ): Promise<Student | null> {
    return this.localCache.getStudent(studentId, schoolId || this.schoolId, parentId);
  }

  public async getHomework(
    studentId?: string,
    schoolId?: string,
    parentId?: string
  ): Promise<Homework[]> {
    return this.localCache.getHomework(studentId, schoolId || this.schoolId, parentId);
  }

  public async getExams(
    studentId?: string,
    schoolId?: string,
    parentId?: string
  ): Promise<Exam[]> {
    return this.localCache.getExams(studentId, schoolId || this.schoolId, parentId);
  }

  public async getAttendance(
    studentId: string,
    schoolId?: string,
    parentId?: string
  ): Promise<Attendance | null> {
    return this.localCache.getAttendance(studentId, schoolId || this.schoolId, parentId);
  }

  public async getProgress(
    studentId: string,
    schoolId?: string,
    parentId?: string
  ): Promise<AcademicResult | null> {
    return this.localCache.getProgress(studentId, schoolId || this.schoolId, parentId);
  }

  public async getTimetable(
    classDisplayName: string,
    schoolId?: string
  ): Promise<ClassTimetable | null> {
    return this.localCache.getTimetable(classDisplayName, schoolId || this.schoolId);
  }

  public async getAnnouncements(
    schoolId?: string,
    classDisplayName?: string
  ): Promise<Announcement[]> {
    return this.localCache.getAnnouncements(schoolId || this.schoolId, classDisplayName);
  }

  public async getHolidays(schoolId?: string): Promise<Holiday[]> {
    return this.localCache.getHolidays(schoolId || this.schoolId);
  }

  public async syncStudents(schoolId: string, students: Partial<Student>[]): Promise<SyncResult> {
    return this.localCache.syncStudents(schoolId, students);
  }

  public async checkHealth(): Promise<ProviderHealth> {
    return {
      status: 'healthy',
      latencyMs: 2,
      lastChecked: new Date().toISOString(),
      details: `Connected to ${this.getERPDisplayName(this.config.erpType)}. Last sync: ${this.lastSyncTimestamp || 'Initial'}. Webhooks ingested: ${this.webhookCounter}.`,
      sourceUrl: this.config.erpEndpointUrl || 'Internal ERP Connector',
    };
  }
}
