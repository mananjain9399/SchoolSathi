import {
  SchoolDataProvider,
  ProviderType,
  ProviderHealth,
  SyncResult,
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
  CSVImportValidation,
  CSVStudentRow,
} from '../../types';
import { MockSchoolDataProvider } from './MockSchoolDataProvider';

export interface CSVParseResult<T> {
  success: boolean;
  totalRows: number;
  validRows: T[];
  invalidRows: { rowNumber: number; rawText: string; errors: string[] }[];
}

export class CSVSchoolDataProvider implements SchoolDataProvider {
  public readonly providerId = 'provider-csv-fallback';
  public readonly providerName = 'CSV Import Fallback Provider';
  public readonly providerType: ProviderType = 'csv';
  public readonly schoolId: string;

  // We use tenant storage through an internal mock provider instance for fast, persistent access
  private backingStore: MockSchoolDataProvider;
  private lastImportTimestamp: string | null = null;
  private totalImportedCount = 0;

  constructor(schoolId: string = 'sch-demo') {
    this.schoolId = schoolId;
    this.backingStore = new MockSchoolDataProvider(schoolId);
  }

  // ------------------------------------------------------------
  // CSV PARSING & SCHEMA VALIDATION ENGINES
  // ------------------------------------------------------------

  public static parseStudentsCSV(csvText: string): CSVParseResult<CSVStudentRow> {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      return { success: false, totalRows: 0, validRows: [], invalidRows: [] };
    }

    const headers = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const expected = ['student_id', 'student_name', 'class', 'section', 'roll_number', 'parent_mobile'];
    
    // Check if key columns exist
    const idIdx = headers.indexOf('student_id');
    const nameIdx = headers.indexOf('student_name');
    const classIdx = headers.indexOf('class');
    const secIdx = headers.indexOf('section');
    const rollIdx = headers.indexOf('roll_number');
    const mobileIdx = headers.indexOf('parent_mobile');

    const validRows: CSVStudentRow[] = [];
    const invalidRows: { rowNumber: number; rawText: string; errors: string[] }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      const errors: string[] = [];

      const studentId = cols[idIdx] || '';
      const name = cols[nameIdx] || '';
      const cls = cols[classIdx] || '';
      const sec = cols[secIdx] || '';
      const roll = cols[rollIdx] || '';
      const mobile = cols[mobileIdx] || '';

      if (!studentId) errors.push('Missing student_id');
      if (!name || name.length < 2) errors.push('Missing or invalid student_name');
      if (!cls) errors.push('Missing class');
      if (!sec) errors.push('Missing section');
      if (!roll) errors.push('Missing roll_number');
      if (!mobile || !/^\d{10}$/.test(mobile.replace(/[^0-9]/g, ''))) {
        errors.push('Invalid 10-digit parent_mobile');
      }

      if (errors.length === 0) {
        validRows.push({
          student_id: studentId,
          student_name: name,
          class: cls,
          section: sec,
          roll_number: roll,
          parent_mobile: mobile,
        });
      } else {
        invalidRows.push({
          rowNumber: i + 1,
          rawText: line,
          errors,
        });
      }
    }

    return {
      success: validRows.length > 0,
      totalRows: lines.length - 1,
      validRows,
      invalidRows,
    };
  }

  public async importStudentsFromCSV(csvText: string, schoolId?: string): Promise<CSVImportValidation> {
    const targetSchool = schoolId || this.schoolId;
    const parsed = CSVSchoolDataProvider.parseStudentsCSV(csvText);

    if (parsed.validRows.length > 0) {
      const studentsToSync: Partial<Student>[] = parsed.validRows.map((r) => ({
        studentId: r.student_id,
        name: r.student_name,
        fullName: r.student_name,
        class: r.class.startsWith('Class ') ? r.class : `Class ${r.class}`,
        section: r.section.toUpperCase(),
        rollNumber: r.roll_number,
        parentMobile: r.parent_mobile,
        schoolId: targetSchool,
        avatarPreference: 'owl-scholar',
        gender: 'male',
      }));

      await this.backingStore.syncStudents(targetSchool, studentsToSync);
      this.lastImportTimestamp = new Date().toISOString();
      this.totalImportedCount += parsed.validRows.length;
    }

    return {
      totalRows: parsed.totalRows,
      validRows: parsed.validRows,
      invalidRows: parsed.invalidRows,
    };
  }

  // ------------------------------------------------------------
  // IMPLEMENTING SCHOOLDATAPROVIDER INTERFACE DELEGATION
  // ------------------------------------------------------------

  public async getSchool(schoolId?: string): Promise<School | null> {
    return this.backingStore.getSchool(schoolId);
  }

  public async getStudents(schoolId?: string): Promise<Student[]> {
    return this.backingStore.getStudents(schoolId);
  }

  public async getStudent(
    studentId: string,
    schoolId?: string,
    parentId?: string
  ): Promise<Student | null> {
    return this.backingStore.getStudent(studentId, schoolId, parentId);
  }

  public async getHomework(
    studentId?: string,
    schoolId?: string,
    parentId?: string
  ): Promise<Homework[]> {
    return this.backingStore.getHomework(studentId, schoolId, parentId);
  }

  public async getExams(
    studentId?: string,
    schoolId?: string,
    parentId?: string
  ): Promise<Exam[]> {
    return this.backingStore.getExams(studentId, schoolId, parentId);
  }

  public async getAttendance(
    studentId: string,
    schoolId?: string,
    parentId?: string
  ): Promise<Attendance | null> {
    return this.backingStore.getAttendance(studentId, schoolId, parentId);
  }

  public async getProgress(
    studentId: string,
    schoolId?: string,
    parentId?: string
  ): Promise<AcademicResult | null> {
    return this.backingStore.getProgress(studentId, schoolId, parentId);
  }

  public async getTimetable(
    classDisplayName: string,
    schoolId?: string
  ): Promise<ClassTimetable | null> {
    return this.backingStore.getTimetable(classDisplayName, schoolId);
  }

  public async getAnnouncements(
    schoolId?: string,
    classDisplayName?: string
  ): Promise<Announcement[]> {
    return this.backingStore.getAnnouncements(schoolId, classDisplayName);
  }

  public async getHolidays(schoolId?: string): Promise<Holiday[]> {
    return this.backingStore.getHolidays(schoolId);
  }

  public async syncStudents(schoolId: string, students: Partial<Student>[]): Promise<SyncResult> {
    return this.backingStore.syncStudents(schoolId, students);
  }

  public async checkHealth(): Promise<ProviderHealth> {
    return {
      status: 'healthy',
      latencyMs: 1,
      lastChecked: new Date().toISOString(),
      details: `CSV Provider active. Last imported: ${this.lastImportTimestamp || 'None'}. Total records: ${this.totalImportedCount}`,
    };
  }
}
