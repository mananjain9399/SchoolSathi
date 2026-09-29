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
import {
  DEMO_SCHOOL,
  INITIAL_CLASSES,
  INITIAL_TEACHERS,
  INITIAL_SUBJECTS,
  INITIAL_STUDENTS,
  INITIAL_HOMEWORK,
  INITIAL_EXAMS,
  INITIAL_ATTENDANCE,
  INITIAL_RESULTS,
  INITIAL_HOLIDAYS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_TIMETABLES,
} from '../schoolDataService';
import { MOCK_SCHOOLS } from '../../data/mockData';
import { AuthService } from '../authService';
import { StudentService } from '../studentService';

const MOCK_STORAGE_KEY_PREFIX = 'schoolsathi_tenant_db_';

interface TenantStore {
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

export class MockSchoolDataProvider implements SchoolDataProvider {
  public readonly providerId = 'provider-mock-demo';
  public readonly providerName = 'Demo Mock Data Provider (In-Memory / Local)';
  public readonly providerType: ProviderType = 'mock';
  public readonly schoolId: string;

  constructor(schoolId: string = 'sch-demo') {
    this.schoolId = schoolId;
  }

  // ------------------------------------------------------------
  // TENANT STORAGE MANAGEMENT (Multi-School Isolation)
  // ------------------------------------------------------------

  private getTenantKey(schoolId?: string): string {
    const targetSchool = schoolId || this.schoolId || 'sch-demo';
    return `${MOCK_STORAGE_KEY_PREFIX}${targetSchool}`;
  }

  private loadStore(schoolId?: string): TenantStore {
    const targetSchoolId = schoolId || this.schoolId || 'sch-demo';
    const key = this.getTenantKey(targetSchoolId);

    if (typeof window === 'undefined') {
      return this.createDefaultStore(targetSchoolId);
    }

    try {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn(`[MockProvider] Failed to read storage for tenant ${targetSchoolId}`, e);
    }

    const defaultStore = this.createDefaultStore(targetSchoolId);
    this.saveStore(defaultStore, targetSchoolId);
    return defaultStore;
  }

  private saveStore(store: TenantStore, schoolId?: string): void {
    if (typeof window === 'undefined') return;
    const key = this.getTenantKey(schoolId);
    try {
      localStorage.setItem(key, JSON.stringify(store));
    } catch (e) {
      console.error(`[MockProvider] Failed to save store for tenant key ${key}`, e);
    }
  }

  private createDefaultStore(schoolId: string): TenantStore {
    const matchedSchool = MOCK_SCHOOLS.find((s) => s.id === schoolId) || {
      ...DEMO_SCHOOL,
      id: schoolId,
    };

    // Filter students belonging to this school tenant
    const tenantStudents = INITIAL_STUDENTS.map((s) => ({
      ...s,
      schoolId,
      schoolName: matchedSchool.name,
    }));

    return {
      school: matchedSchool,
      classes: INITIAL_CLASSES.map((c) => ({ ...c, schoolId })),
      teachers: INITIAL_TEACHERS.map((t) => ({ ...t, schoolId })),
      subjects: INITIAL_SUBJECTS.map((sub) => ({ ...sub, schoolId })),
      students: tenantStudents,
      homework: INITIAL_HOMEWORK.map((h) => ({ ...h, schoolId })),
      exams: INITIAL_EXAMS.map((e) => ({ ...e, schoolId })),
      attendance: INITIAL_ATTENDANCE,
      results: INITIAL_RESULTS,
      holidays: INITIAL_HOLIDAYS.map((hol) => ({ ...hol, schoolId })),
      announcements: INITIAL_ANNOUNCEMENTS.map((a) => ({ ...a, schoolId })),
      timetables: INITIAL_TIMETABLES,
    };
  }

  // ------------------------------------------------------------
  // SECURITY & AUTHORIZATION CHECK
  // ------------------------------------------------------------

  private checkParentAuthorization(studentId: string, parentId?: string): boolean {
    if (!parentId) return true; // Internal or Admin context
    const currentParent = AuthService.getCurrentParent();
    if (!currentParent) return false;
    const allowed = new Set(currentParent.children || currentParent.childrenIds || []);
    return allowed.has(studentId);
  }

  // ------------------------------------------------------------
  // READ APIS
  // ------------------------------------------------------------

  public async getSchool(schoolId?: string): Promise<School | null> {
    const store = this.loadStore(schoolId);
    return store.school;
  }

  public async getStudents(schoolId?: string): Promise<Student[]> {
    const store = this.loadStore(schoolId);
    return store.students;
  }

  public async registerStudent(student: Student, schoolId?: string): Promise<Student> {
    const targetSchoolId = schoolId || student.schoolId || this.schoolId;
    const store = this.loadStore(targetSchoolId);
    const existingIndex = store.students.findIndex(
      (s) => s.id === student.id || s.studentId === student.studentId
    );
    if (existingIndex >= 0) {
      store.students[existingIndex] = { ...store.students[existingIndex], ...student };
    } else {
      store.students.push(student);
    }
    this.saveStore(store, targetSchoolId);
    return student;
  }

  public async getStudent(
    studentId: string,
    schoolId?: string,
    parentId?: string
  ): Promise<Student | null> {
    if (!this.checkParentAuthorization(studentId, parentId)) {
      console.warn(`[Security] Unauthorized access to student ${studentId} by parent ${parentId}`);
      return null;
    }
    const store = this.loadStore(schoolId);
    let student =
      store.students.find(
        (s) => (s.id === studentId || s.studentId === studentId) &&
               (!schoolId || s.schoolId === schoolId)
      ) || null;

    if (!student) {
      // Look in StudentService children store (instant sync for newly added children!)
      try {
        const allChildren = StudentService.getChildrenStore();
        const matched = allChildren.find(
          (c: any) => c.id === studentId || c.studentId === studentId
        );
        if (matched) {
          student = {
            id: matched.id,
            name: matched.name,
            fullName: matched.fullName || matched.name,
            schoolId: matched.schoolId || 'sch-demo',
            schoolName: matched.schoolName || 'SchoolSathi Demo School',
            studentId: matched.studentId,
            admissionNumber: matched.admissionNumber || matched.studentId,
            class: matched.class,
            grade: matched.grade || matched.class,
            section: matched.section,
            rollNumber: matched.rollNumber,
            gender: matched.gender,
            avatarPreference: matched.avatarPreference,
            attendancePercentage: matched.attendancePercentage || 94,
            presentToday: matched.presentToday ?? true,
            dateOfBirth: matched.dateOfBirth,
            bloodGroup: matched.bloodGroup,
            classTeacherName: matched.classTeacherName,
            classTeacherPhone: matched.classTeacherPhone,
            busRoute: matched.busRoute,
          };
          store.students.push(student);
          this.saveStore(store, schoolId);
        }
      } catch {
        // ignore in SSR or test
      }
    }

    return student;
  }

  public async getClasses(schoolId?: string): Promise<SchoolClass[]> {
    return this.loadStore(schoolId).classes;
  }

  public async getTeachers(schoolId?: string): Promise<Teacher[]> {
    return this.loadStore(schoolId).teachers;
  }

  public async getSubjects(classDisplayName?: string, schoolId?: string): Promise<Subject[]> {
    const store = this.loadStore(schoolId);
    if (!classDisplayName) return store.subjects;
    return store.subjects.filter((s) => s.classes.includes(classDisplayName));
  }

  public async getHomework(
    studentId?: string,
    schoolId?: string,
    parentId?: string
  ): Promise<Homework[]> {
    const store = this.loadStore(schoolId);
    if (!studentId) return store.homework;

    const student = await this.getStudent(studentId, schoolId, parentId);
    if (!student) return [];

    const rawClass = (student.class || student.grade || '').replace('Class ', '').trim();
    const classDisplay = student.section
      ? `${rawClass}-${student.section}`
      : rawClass;

    return store.homework.filter(
      (h) =>
        h.studentId === student.id ||
        h.studentId === student.studentId ||
        h.classDisplayName === classDisplay ||
        h.classDisplayName === `Class ${classDisplay}` ||
        h.classDisplayName === `${student.class}-${student.section}` ||
        h.classDisplayName === `${student.grade}-${student.section}`
    );
  }

  public async getExams(
    studentId?: string,
    schoolId?: string,
    parentId?: string
  ): Promise<Exam[]> {
    const store = this.loadStore(schoolId);
    if (!studentId) return store.exams;

    const student = await this.getStudent(studentId, schoolId, parentId);
    if (!student) return [];

    const classDisplay = student.section
      ? `${student.class.replace('Class ', '')}-${student.section}`
      : student.class;

    return store.exams.filter(
      (e) =>
        e.studentId === student.id ||
        e.classDisplayName === classDisplay ||
        e.classDisplayName === `${student.grade || student.class}-${student.section}`
    );
  }

  public async getAttendance(
    studentId: string,
    schoolId?: string,
    parentId?: string
  ): Promise<Attendance | null> {
    if (!this.checkParentAuthorization(studentId, parentId)) return null;
    const store = this.loadStore(schoolId);
    return store.attendance[studentId] || null;
  }

  public async getProgress(
    studentId: string,
    schoolId?: string,
    parentId?: string
  ): Promise<AcademicResult | null> {
    if (!this.checkParentAuthorization(studentId, parentId)) return null;
    const store = this.loadStore(schoolId);
    return store.results[studentId] || null;
  }

  public async getTimetable(
    classDisplayName: string,
    schoolId?: string
  ): Promise<ClassTimetable | null> {
    const store = this.loadStore(schoolId);
    return store.timetables[classDisplayName] || null;
  }

  public async getAnnouncements(
    schoolId?: string,
    classDisplayName?: string
  ): Promise<Announcement[]> {
    const store = this.loadStore(schoolId);
    if (!classDisplayName) return store.announcements;
    return store.announcements.filter(
      (a) =>
        !a.targetClasses ||
        a.targetClasses.includes('All') ||
        a.targetClasses.includes(classDisplayName)
    );
  }

  public async getHolidays(schoolId?: string): Promise<Holiday[]> {
    const store = this.loadStore(schoolId);
    return store.holidays;
  }

  // ------------------------------------------------------------
  // SYNC OPERATIONS (Used by Admin Portal)
  // ------------------------------------------------------------

  public async syncStudents(schoolId: string, students: Partial<Student>[]): Promise<SyncResult> {
    const store = this.loadStore(schoolId);
    const existingMap = new Map(store.students.map((s) => [s.studentId, s]));

    for (const row of students) {
      if (!row.studentId) continue;
      const existing = existingMap.get(row.studentId);
      if (existing) {
        Object.assign(existing, row, { schoolId });
      } else {
        const newStudent: Student = {
          id: row.id || `std-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          studentId: row.studentId,
          name: row.name || 'Unnamed Student',
          schoolId,
          class: row.class || 'Class 1',
          section: row.section || 'A',
          rollNumber: row.rollNumber || '01',
          gender: row.gender || 'male',
          avatarPreference: row.avatarPreference || 'owl-scholar',
          ...row,
        };
        store.students.push(newStudent);
      }
    }

    this.saveStore(store, schoolId);
    return {
      success: true,
      schoolId,
      entityType: 'students',
      recordsProcessed: students.length,
      timestamp: new Date().toISOString(),
    };
  }

  public async syncHomework(schoolId: string, homework: Partial<Homework>[]): Promise<SyncResult> {
    const store = this.loadStore(schoolId);
    for (const h of homework) {
      const newHw: Homework = {
        id: h.id || `hw-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        schoolId,
        subject: h.subject || 'General',
        title: h.title || 'Untitled Homework',
        description: h.description || '',
        assignedDate: h.assignedDate || 'Today',
        dueDate: h.dueDate || 'Tomorrow',
        urgency: h.urgency || 'normal',
        isCompleted: h.isCompleted ?? false,
        classDisplayName: h.classDisplayName || 'All',
        ...h,
      };
      store.homework.unshift(newHw);
    }
    this.saveStore(store, schoolId);
    return {
      success: true,
      schoolId,
      entityType: 'homework',
      recordsProcessed: homework.length,
      timestamp: new Date().toISOString(),
    };
  }

  public async syncExams(schoolId: string, exams: Partial<Exam>[]): Promise<SyncResult> {
    const store = this.loadStore(schoolId);
    for (const ex of exams) {
      const newExam: Exam = {
        id: ex.id || `ex-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        schoolId,
        subject: ex.subject || 'General',
        title: ex.title || 'Exam',
        date: ex.date || 'TBD',
        time: ex.time || '09:00 AM',
        totalMarks: ex.totalMarks || 100,
        syllabus: ex.syllabus || '',
        classDisplayName: ex.classDisplayName || 'All',
        ...ex,
      };
      store.exams.unshift(newExam);
    }
    this.saveStore(store, schoolId);
    return {
      success: true,
      schoolId,
      entityType: 'exams',
      recordsProcessed: exams.length,
      timestamp: new Date().toISOString(),
    };
  }

  public async syncAttendance(
    schoolId: string,
    records: { studentId: string; date: string; status: 'present' | 'absent' | 'leave'; reason?: string }[]
  ): Promise<SyncResult> {
    const store = this.loadStore(schoolId);
    for (const r of records) {
      if (!store.attendance[r.studentId]) {
        store.attendance[r.studentId] = {
          studentId: r.studentId,
          overallPercentage: r.status === 'present' ? 100 : 0,
          totalDays: 1,
          presentDays: r.status === 'present' ? 1 : 0,
          absentDays: r.status === 'absent' ? 1 : 0,
          recentRecords: [],
        };
      }
      const att = store.attendance[r.studentId];
      att.recentRecords.unshift({ date: r.date, status: r.status, reason: r.reason });
      if (r.status === 'present') att.presentDays += 1;
      else if (r.status === 'absent') att.absentDays += 1;
      att.totalDays += 1;
      att.overallPercentage = Math.round((att.presentDays / att.totalDays) * 100);
    }
    this.saveStore(store, schoolId);
    return {
      success: true,
      schoolId,
      entityType: 'attendance',
      recordsProcessed: records.length,
      timestamp: new Date().toISOString(),
    };
  }

  public async syncResults(schoolId: string, results: Partial<AcademicResult>[]): Promise<SyncResult> {
    const store = this.loadStore(schoolId);
    for (const r of results) {
      if (!r.studentId) continue;
      store.results[r.studentId] = {
        studentId: r.studentId,
        studentName: r.studentName || 'Student',
        overallGrade: r.overallGrade || 'A',
        overallPercentage: r.overallPercentage || 85,
        teacherRemark: r.teacherRemark || 'Good progress',
        subjects: r.subjects || [],
        ...r,
      };
    }
    this.saveStore(store, schoolId);
    return {
      success: true,
      schoolId,
      entityType: 'results',
      recordsProcessed: results.length,
      timestamp: new Date().toISOString(),
    };
  }

  public async syncAnnouncements(schoolId: string, announcements: Partial<Announcement>[]): Promise<SyncResult> {
    const store = this.loadStore(schoolId);
    for (const a of announcements) {
      const newAnn: Announcement = {
        id: a.id || `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        schoolId,
        title: a.title || 'Announcement',
        content: a.content || '',
        date: a.date || 'Today',
        category: a.category || 'general',
        isImportant: a.isImportant ?? false,
        ...a,
      };
      store.announcements.unshift(newAnn);
    }
    this.saveStore(store, schoolId);
    return {
      success: true,
      schoolId,
      entityType: 'announcements',
      recordsProcessed: announcements.length,
      timestamp: new Date().toISOString(),
    };
  }

  public async syncHolidays(schoolId: string, holidays: Partial<Holiday>[]): Promise<SyncResult> {
    const store = this.loadStore(schoolId);
    for (const h of holidays) {
      const newHol: Holiday = {
        id: h.id || `hol-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        schoolId,
        title: h.title || 'School Holiday',
        startDate: h.startDate || 'TBD',
        endDate: h.endDate || 'TBD',
        daysCount: h.daysCount || 1,
        description: h.description || '',
        isUpcoming: h.isUpcoming ?? true,
        ...h,
      };
      store.holidays.push(newHol);
    }
    this.saveStore(store, schoolId);
    return {
      success: true,
      schoolId,
      entityType: 'holidays',
      recordsProcessed: holidays.length,
      timestamp: new Date().toISOString(),
    };
  }

  // ------------------------------------------------------------
  // WEBHOOK HANDLER
  // ------------------------------------------------------------

  public async handleWebhook(payload: WebhookPayload): Promise<WebhookResult> {
    const { eventType, schoolId, data } = payload;
    let affected = 0;

    switch (eventType) {
      case 'homework.updated':
        if (data) {
          await this.syncHomework(schoolId, Array.isArray(data) ? data : [data]);
          affected = Array.isArray(data) ? data.length : 1;
        }
        break;
      case 'exam.created':
        if (data) {
          await this.syncExams(schoolId, Array.isArray(data) ? data : [data]);
          affected = Array.isArray(data) ? data.length : 1;
        }
        break;
      case 'attendance.updated':
        if (data) {
          await this.syncAttendance(schoolId, Array.isArray(data) ? data : [data]);
          affected = Array.isArray(data) ? data.length : 1;
        }
        break;
      case 'announcement.created':
        if (data) {
          await this.syncAnnouncements(schoolId, Array.isArray(data) ? data : [data]);
          affected = Array.isArray(data) ? data.length : 1;
        }
        break;
      case 'student.updated':
        if (data) {
          await this.syncStudents(schoolId, Array.isArray(data) ? data : [data]);
          affected = Array.isArray(data) ? data.length : 1;
        }
        break;
    }

    return {
      success: true,
      eventId: payload.eventId,
      processedAt: new Date().toISOString(),
      recordsAffected: affected,
      message: `Webhook ${eventType} processed for school ${schoolId}`,
    };
  }

  // ------------------------------------------------------------
  // HEALTH CHECK
  // ------------------------------------------------------------

  public async checkHealth(): Promise<ProviderHealth> {
    return {
      status: 'healthy',
      latencyMs: 1,
      lastChecked: new Date().toISOString(),
      details: 'Mock data provider operational with multi-tenant local persistence.',
    };
  }
}
