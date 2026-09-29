import { Homework, Student } from '../types';
import { SchoolDataService } from './schoolDataService';
import { StudentService } from './studentService';

export interface HomeworkItem {
  subject: string;
  description: string;
  title?: string;
  dueDate?: string;
  assignedDate?: string;
  isCompleted?: boolean;
}

export interface HomeworkServiceResponse {
  success: boolean;
  studentId: string;
  studentName: string;
  homework: HomeworkItem[];
  rawHomework: Homework[];
  error?: string;
}

/**
 * Flexible Indian curriculum subject matcher (Maths, Mathematics, Ganit, EVS, etc.)
 */
export function matchesSubject(subjectInRecord: string, queriedSubject?: string): boolean {
  if (!queriedSubject) return true;
  const s1 = (subjectInRecord || '').trim().toLowerCase();
  const s2 = (queriedSubject || '').trim().toLowerCase();
  if (s1 === s2 || s1.includes(s2) || s2.includes(s1)) return true;

  // Mathematics / Maths / Ganit
  const isMath1 =
    s1.includes('math') ||
    s1.includes('गणित') ||
    s1.includes('ਹਿਸਾਬ') ||
    s1.includes('গণিত') ||
    s1.includes('கணிதம்') ||
    s1.includes('గణితం');
  const isMath2 =
    s2.includes('math') ||
    s2.includes('गणित') ||
    s2.includes('ਹਿਸਾਬ') ||
    s2.includes('গণিত') ||
    s2.includes('கணிதம்') ||
    s2.includes('గణితం');
  if (isMath1 && isMath2) return true;

  // Science / Vigyan
  const isSci1 =
    s1.includes('scien') ||
    s1.includes('विज्ञान') ||
    s1.includes('ਵਿਗਿਆਨ') ||
    s1.includes('বিজ্ঞান') ||
    s1.includes('அறிவியல்') ||
    s1.includes('సైన్స్');
  const isSci2 =
    s2.includes('scien') ||
    s2.includes('विज्ञान') ||
    s2.includes('ਵਿਗਿਆਨ') ||
    s2.includes('বিজ্ঞান') ||
    s2.includes('அறிவியல்') ||
    s2.includes('సైన్స్');
  if (isSci1 && isSci2) return true;

  // English / Angrezi
  const isEng1 = s1.includes('eng') || s1.includes('अंग्रेजी') || s1.includes('ইংরেজি');
  const isEng2 = s2.includes('eng') || s2.includes('अंग्रेजी') || s2.includes('ইংরেজি');
  if (isEng1 && isEng2) return true;

  // Hindi
  const isHin1 = s1.includes('hind') || s1.includes('हिंदी') || s1.includes('हिन्दी');
  const isHin2 = s2.includes('hind') || s2.includes('हिंदी') || s2.includes('हिन्दी');
  if (isHin1 && isHin2) return true;

  // EVS / Environmental Studies
  const isEvs1 = s1.includes('evs') || s1.includes('environ');
  const isEvs2 = s2.includes('evs') || s2.includes('environ');
  if (isEvs1 && isEvs2) return true;

  return false;
}

export class HomeworkService {
  /**
   * Reusable homework fetcher matching the authoritative specification:
   * getHomework(studentId, date, subject?)
   */
  public static async getHomework(
    studentId: string,
    date?: string,
    subject?: string
  ): Promise<HomeworkServiceResponse> {
    try {
      if (!studentId) {
        return {
          success: false,
          studentId: '',
          studentName: '',
          homework: [],
          rawHomework: [],
          error: "I couldn't access the school records right now. Please try again.",
        };
      }

      // 1. Resolve student entity from StudentService or SchoolDataService
      let student = await SchoolDataService.getStudent(studentId);
      if (!student) {
        const localStudents = StudentService.getChildrenStore();
        student =
          localStudents.find((s: Student) => s.id === studentId || s.studentId === studentId) || null;
      }

      const studentName = student
        ? (student.name || student.fullName || '').split(' ')[0]
        : 'Student';
      const cleanStudentId = student ? student.studentId || student.id : studentId;

      // 2. Fetch homework for student from authoritative provider
      const rawHomework = await SchoolDataService.getHomework(studentId);

      // 3. Filter by subject if specified
      let filtered = rawHomework;
      if (subject) {
        filtered = filtered.filter((h) => matchesSubject(h.subject, subject));
      }

      // 4. Filter by date if specified (e.g. today vs tomorrow vs specific day/date)
      if (date) {
        const d = date.toLowerCase();
        if (d.includes('tomorrow') || d.includes('kal') || d.includes('कल') || d.includes('उद्या')) {
          filtered = filtered.filter((h) => !h.isCompleted);
        } else if (d.includes('today') || d.includes('aaj') || d.includes('आज')) {
          filtered = filtered.filter((h) => !h.isCompleted);
        } else {
          filtered = filtered.filter((h) => {
            const due = (h.dueDate || '').toLowerCase();
            const assigned = (h.assignedDate || '').toLowerCase();
            return due.includes(d) || assigned.includes(d);
          });
        }
      }

      // Format clean items
      const homeworkItems: HomeworkItem[] = filtered.map((h) => {
        let desc = h.description;
        if (h.title && !desc.includes(h.title)) {
          desc = `${h.title} - ${desc}`;
        }
        return {
          subject: h.subject,
          description: desc,
          title: h.title,
          dueDate: h.dueDate,
          assignedDate: h.assignedDate,
          isCompleted: h.isCompleted,
        };
      });

      return {
        success: true,
        studentId: cleanStudentId,
        studentName,
        homework: homeworkItems,
        rawHomework: filtered,
      };
    } catch (err) {
      console.error('HomeworkService.getHomework error:', err);
      return {
        success: false,
        studentId,
        studentName: 'Student',
        homework: [],
        rawHomework: [],
        error: "I couldn't access the school records right now. Please try again.",
      };
    }
  }
}
