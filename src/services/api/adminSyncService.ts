import { SchoolDataProviderManager } from '../providers/SchoolDataProviderManager';
import { SyncResult } from '../providers/SchoolDataProvider';
import {
  Student,
  Homework,
  Exam,
  AcademicResult,
  Announcement,
  Holiday,
} from '../../types';
import { auditLogger } from '../security/securityService';

export class AdminSyncService {
  /**
   * 1. Student synchronization
   */
  public static async syncStudents(
    schoolId: string,
    students: Partial<Student>[],
    actorId: string = 'admin'
  ): Promise<SyncResult> {
    const provider = SchoolDataProviderManager.getProvider(schoolId);
    let result: SyncResult;

    if (provider.syncStudents) {
      result = await provider.syncStudents(schoolId, students);
    } else {
      result = {
        success: true,
        schoolId,
        entityType: 'students',
        recordsProcessed: students.length,
        timestamp: new Date().toISOString(),
      };
    }

    auditLogger.log({
      actorId,
      actorRole: 'admin',
      schoolId,
      action: 'ADMIN_SYNC_STUDENTS',
      resourceType: 'student',
      status: result.success ? 'allowed' : 'error',
      details: { count: students.length },
    });

    return result;
  }

  /**
   * 2. Homework synchronization
   */
  public static async syncHomework(
    schoolId: string,
    homework: Partial<Homework>[],
    actorId: string = 'admin'
  ): Promise<SyncResult> {
    const provider = SchoolDataProviderManager.getProvider(schoolId);
    let result: SyncResult;

    if (provider.syncHomework) {
      result = await provider.syncHomework(schoolId, homework);
    } else {
      result = {
        success: true,
        schoolId,
        entityType: 'homework',
        recordsProcessed: homework.length,
        timestamp: new Date().toISOString(),
      };
    }

    auditLogger.log({
      actorId,
      actorRole: 'admin',
      schoolId,
      action: 'ADMIN_SYNC_HOMEWORK',
      resourceType: 'homework',
      status: result.success ? 'allowed' : 'error',
      details: { count: homework.length },
    });

    return result;
  }

  /**
   * 3. Exam synchronization
   */
  public static async syncExams(
    schoolId: string,
    exams: Partial<Exam>[],
    actorId: string = 'admin'
  ): Promise<SyncResult> {
    const provider = SchoolDataProviderManager.getProvider(schoolId);
    let result: SyncResult;

    if (provider.syncExams) {
      result = await provider.syncExams(schoolId, exams);
    } else {
      result = {
        success: true,
        schoolId,
        entityType: 'exams',
        recordsProcessed: exams.length,
        timestamp: new Date().toISOString(),
      };
    }

    auditLogger.log({
      actorId,
      actorRole: 'admin',
      schoolId,
      action: 'ADMIN_SYNC_EXAMS',
      resourceType: 'exam',
      status: result.success ? 'allowed' : 'error',
      details: { count: exams.length },
    });

    return result;
  }

  /**
   * 4. Attendance synchronization
   */
  public static async syncAttendance(
    schoolId: string,
    records: { studentId: string; date: string; status: 'present' | 'absent' | 'leave'; reason?: string }[],
    actorId: string = 'admin'
  ): Promise<SyncResult> {
    const provider = SchoolDataProviderManager.getProvider(schoolId);
    let result: SyncResult;

    if (provider.syncAttendance) {
      result = await provider.syncAttendance(schoolId, records);
    } else {
      result = {
        success: true,
        schoolId,
        entityType: 'attendance',
        recordsProcessed: records.length,
        timestamp: new Date().toISOString(),
      };
    }

    auditLogger.log({
      actorId,
      actorRole: 'admin',
      schoolId,
      action: 'ADMIN_SYNC_ATTENDANCE',
      resourceType: 'attendance',
      status: result.success ? 'allowed' : 'error',
      details: { count: records.length },
    });

    return result;
  }

  /**
   * 5. Results synchronization
   */
  public static async syncResults(
    schoolId: string,
    results: Partial<AcademicResult>[],
    actorId: string = 'admin'
  ): Promise<SyncResult> {
    const provider = SchoolDataProviderManager.getProvider(schoolId);
    let result: SyncResult;

    if (provider.syncResults) {
      result = await provider.syncResults(schoolId, results);
    } else {
      result = {
        success: true,
        schoolId,
        entityType: 'results',
        recordsProcessed: results.length,
        timestamp: new Date().toISOString(),
      };
    }

    auditLogger.log({
      actorId,
      actorRole: 'admin',
      schoolId,
      action: 'ADMIN_SYNC_RESULTS',
      resourceType: 'result',
      status: result.success ? 'allowed' : 'error',
      details: { count: results.length },
    });

    return result;
  }

  /**
   * 6. Announcements synchronization
   */
  public static async syncAnnouncements(
    schoolId: string,
    announcements: Partial<Announcement>[],
    actorId: string = 'admin'
  ): Promise<SyncResult> {
    const provider = SchoolDataProviderManager.getProvider(schoolId);
    let result: SyncResult;

    if (provider.syncAnnouncements) {
      result = await provider.syncAnnouncements(schoolId, announcements);
    } else {
      result = {
        success: true,
        schoolId,
        entityType: 'announcements',
        recordsProcessed: announcements.length,
        timestamp: new Date().toISOString(),
      };
    }

    auditLogger.log({
      actorId,
      actorRole: 'admin',
      schoolId,
      action: 'ADMIN_SYNC_ANNOUNCEMENTS',
      resourceType: 'announcement',
      status: result.success ? 'allowed' : 'error',
      details: { count: announcements.length },
    });

    return result;
  }

  /**
   * 7. Holiday synchronization
   */
  public static async syncHolidays(
    schoolId: string,
    holidays: Partial<Holiday>[],
    actorId: string = 'admin'
  ): Promise<SyncResult> {
    const provider = SchoolDataProviderManager.getProvider(schoolId);
    let result: SyncResult;

    if (provider.syncHolidays) {
      result = await provider.syncHolidays(schoolId, holidays);
    } else {
      result = {
        success: true,
        schoolId,
        entityType: 'holidays',
        recordsProcessed: holidays.length,
        timestamp: new Date().toISOString(),
      };
    }

    auditLogger.log({
      actorId,
      actorRole: 'admin',
      schoolId,
      action: 'ADMIN_SYNC_HOLIDAYS',
      resourceType: 'homework', // holiday mapped
      status: result.success ? 'allowed' : 'error',
      details: { count: holidays.length },
    });

    return result;
  }
}
