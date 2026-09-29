import {
  Child,
  VerificationRequest,
  VerificationResponse,
  VerifiedStudentRecord,
  Homework,
  Attendance,
  Exam,
} from '../types';
import {
  MOCK_STUDENTS,
  VERIFIED_SCHOOL_REGISTRY,
  MOCK_HOMEWORK,
  MOCK_ATTENDANCE,
  MOCK_EXAMS,
} from '../data/mockData';
import { AuthService } from './authService';
import { SchoolDataService } from './schoolDataService';

const CHILDREN_STORE_KEY = 'schoolsathi_children_store';

function getChildrenStore(): Child[] {
  if (typeof window === 'undefined') return MOCK_STUDENTS;
  try {
    const data = localStorage.getItem(CHILDREN_STORE_KEY);
    if (!data) {
      localStorage.setItem(CHILDREN_STORE_KEY, JSON.stringify(MOCK_STUDENTS));
      return MOCK_STUDENTS;
    }
    return JSON.parse(data);
  } catch {
    return MOCK_STUDENTS;
  }
}

function saveChildrenStore(children: Child[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHILDREN_STORE_KEY, JSON.stringify(children));
  } catch (e) {
    console.error('Failed to save children store', e);
  }
}

export class StudentService {
  /**
   * Expose children store for data providers and services
   */
  public static getChildrenStore(): Child[] {
    return getChildrenStore();
  }

  /**
   * Prototype Student Verification Flow
   * Parent enters: School, Student ID, Child Name
   * The application checks mock official school records.
   * If matching -> "Your child has been verified."
   * If mismatch -> "Please check the details and try again."
   */
  public static verifyStudent(req: VerificationRequest): VerificationResponse {
    const { schoolId, studentId, childName } = req;

    const cleanInputId = studentId.trim().toUpperCase();
    const cleanInputName = childName.trim().toLowerCase();

    // 1. Look for matching record in verified school registry
    const matched = VERIFIED_SCHOOL_REGISTRY.find((rec) => {
      const matchSchool = !schoolId || rec.schoolId === schoolId;
      const matchId = rec.studentId.toUpperCase() === cleanInputId;
      
      // Match name (allowing either full name or first name match)
      const recName = rec.name.toLowerCase();
      const matchName =
        recName === cleanInputName ||
        recName.includes(cleanInputName) ||
        cleanInputName.includes(recName);

      return matchSchool && matchId && matchName;
    });

    if (matched) {
      // Find or create the Child entity
      const children = getChildrenStore();
      let existingChild = children.find(
        (c) =>
          c.studentId.toUpperCase() === cleanInputId &&
          (!schoolId || c.schoolId === schoolId)
      );

      let child: Child;

      if (!existingChild) {
        // Create new child from official record
        child = {
          id: `std-${Date.now().toString().slice(-4)}`,
          name: matched.name,
          fullName: matched.name,
          schoolId: matched.schoolId,
          schoolName: matched.schoolName,
          studentId: matched.studentId,
          admissionNumber: matched.studentId,
          class: matched.class,
          grade: matched.class,
          section: matched.section,
          rollNumber: matched.rollNumber,
          gender: matched.gender,
          avatarPreference: matched.avatarPreference,
          parentMobile: matched.parentMobile,
          dateOfBirth: matched.dateOfBirth,
          bloodGroup: matched.bloodGroup,
          classTeacherName: matched.classTeacherName,
          classTeacherPhone: matched.classTeacherPhone,
          attendancePercentage: matched.attendancePercentage,
          presentToday: matched.presentToday,
          busRoute: matched.busRoute,
        };
        children.push(child);
        saveChildrenStore(children);
      } else {
        child = existingChild;
      }

      return {
        success: true,
        message: 'Your child has been verified.',
        child,
        matchedRecord: matched,
      };
    }

    // Diagnostics for mismatch feedback
    const idExists = VERIFIED_SCHOOL_REGISTRY.find(
      (r) => r.studentId.toUpperCase() === cleanInputId
    );
    let mismatchReason: VerificationResponse['mismatchReason'] = 'id_not_found';
    if (idExists) {
      mismatchReason = 'name_mismatch';
    }

    return {
      success: false,
      message: 'Please check the details and try again.',
      mismatchReason,
    };
  }

  /**
   * Securely retrieve only children linked to the specified parent.
   * Enforces data isolation between parent accounts.
   */
  public static getChildrenForParent(parentId: string): Child[] {
    const parent = AuthService.getCurrentParent();
    if (!parent || parent.id !== parentId) {
      // Fallback: search in parents store
      const parents = JSON.parse(localStorage.getItem('schoolsathi_parents_store') || '[]');
      const p = parents.find((item: any) => item.id === parentId);
      if (!p) return [];
      const allowedIds = new Set(p.children || p.childrenIds || []);
      const allChildren = getChildrenStore();
      return allChildren.filter((c) => allowedIds.has(c.id));
    }

    const allowedIds = new Set(parent.children || parent.childrenIds || []);
    const allChildren = getChildrenStore();
    return allChildren.filter((c) => allowedIds.has(c.id));
  }

  /**
   * Verify and link child to parent in one atomic operation
   */
  public static linkChildToParent(
    parentId: string,
    req: VerificationRequest
  ): VerificationResponse {
    const res = this.verifyStudent(req);
    if (res.success && res.child) {
      AuthService.linkChildToParent(parentId, res.child.id);
      SchoolDataService.registerStudent(res.child, res.child.schoolId);
    }
    return res;
  }

  /**
   * Add a custom child manually (with fallback mock registry)
   */
  public static addManualChild(
    parentId: string,
    childData: Partial<Child>
  ): Child {
    const children = getChildrenStore();
    const newId = `std-${Date.now().toString().slice(-4)}`;

    const newChild: Child = {
      id: newId,
      name: childData.name || childData.fullName || 'Student',
      fullName: childData.name || childData.fullName || 'Student',
      schoolId: childData.schoolId || 'sch-demo',
      schoolName: childData.schoolName || 'SchoolSathi Demo School',
      studentId: childData.studentId || childData.admissionNumber || `KV-${Date.now().toString().slice(-4)}`,
      admissionNumber: childData.studentId || childData.admissionNumber || `KV-${Date.now().toString().slice(-4)}`,
      class: childData.class || childData.grade || 'Class 6',
      grade: childData.class || childData.grade || 'Class 6',
      section: childData.section || 'A',
      rollNumber: childData.rollNumber || '15',
      gender: childData.gender || 'male',
      avatarPreference: childData.avatarPreference || 'owl-scholar',
      dateOfBirth: childData.dateOfBirth || '2014-01-01',
      bloodGroup: childData.bloodGroup || 'B+',
      classTeacherName: childData.classTeacherName || 'Mrs. Sunita Verma',
      classTeacherPhone: childData.classTeacherPhone || '+91 98112 44321',
      attendancePercentage: childData.attendancePercentage || 94,
      presentToday: true,
      busRoute: childData.busRoute || 'Bus #12',
    };

    children.push(newChild);
    saveChildrenStore(children);
    AuthService.linkChildToParent(parentId, newId);
    SchoolDataService.registerStudent(newChild, newChild.schoolId);
    return newChild;
  }

  /**
   * Multi-Child Summary Helper:
   * Aggregates homework across all children for a parent
   */
  public static getAllChildrenHomework(children: Child[]): {
    child: Child;
    homework: Homework[];
    pendingCount: number;
  }[] {
    return children.map((child) => {
      const hw = MOCK_HOMEWORK[child.id] || [];
      const pendingCount = hw.filter((h) => !h.isCompleted).length;
      return { child, homework: hw, pendingCount };
    });
  }

  /**
   * Multi-Child Summary Helper:
   * Aggregates attendance across all children
   */
  public static getAllChildrenAttendance(children: Child[]): {
    child: Child;
    attendance?: Attendance;
    percentage: number;
    isPresent: boolean;
  }[] {
    return children.map((child) => {
      const att = MOCK_ATTENDANCE[child.id];
      return {
        child,
        attendance: att,
        percentage: att?.overallPercentage ?? child.attendancePercentage ?? 90,
        isPresent: child.presentToday ?? true,
      };
    });
  }

  /**
   * Multi-Child Summary Helper:
   * Aggregates upcoming exams across all children
   */
  public static getAllChildrenExams(children: Child[]): {
    child: Child;
    exams: Exam[];
    nextExam?: Exam;
  }[] {
    return children.map((child) => {
      const exams = MOCK_EXAMS[child.id] || [];
      return {
        child,
        exams,
        nextExam: exams[0],
      };
    });
  }
}
