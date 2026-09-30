import React, { useState, useEffect } from 'react';
import {
  School,
  Users,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Plus,
  Send,
  Bell,
  Clock,
  ArrowLeft,
  FileSpreadsheet,
  Check,
  Search,
  Sparkles,
  ClipboardList,
  GraduationCap,
  Server,
} from 'lucide-react';
import {
  Student,
  SchoolClass,
  Teacher,
  Homework,
  Exam,
  Holiday,
  Announcement,
  CSVImportValidation,
  ScreenId,
} from '../../types';
import { SchoolDataService, DEMO_SCHOOL } from '../../services/schoolDataService';
import { Button } from '../../components/common/Button';
import { DataSourcesTab } from './DataSourcesTab';

interface AdminDashboardProps {
  onNavigateToParentApp: () => void;
  onNavigate: (screen: ScreenId) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateToParentApp,
}) => {
  const [activeTab, setActiveTab] = useState<
    'teacher' | 'students' | 'csv' | 'attendance' | 'homework' | 'exams' | 'holidays' | 'integrations'
  >('teacher');

  // Authoritative School Data State
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [examsList, setExamsList] = useState<Exam[]>([]);
  const [holidaysList, setHolidaysList] = useState<Holiday[]>([]);
  const [announcementsList, setAnnouncementsList] = useState<Announcement[]>([]);

  // Feedback Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // -------------------------------------------------------------
  // TEACHER WORKFLOW STATE
  // Class → Subject → Date → Homework Description
  // -------------------------------------------------------------
  const [teacherSelectedClass, setTeacherSelectedClass] = useState('6-B');
  const [teacherSelectedSubject, setTeacherSelectedSubject] = useState('Mathematics');
  const [teacherDueDate, setTeacherDueDate] = useState('Tomorrow (Wednesday)');
  const [teacherHomeworkText, setTeacherHomeworkText] = useState('Exercise 4.2 — Questions 1 to 5');
  const [teacherTitle, setTeacherTitle] = useState('Fractions Practice');
  const [isPublishing, setIsPublishing] = useState(false);

  // -------------------------------------------------------------
  // CSV IMPORT STATE
  // -------------------------------------------------------------
  const sampleValidCSV = `student_id,student_name,class,section,roll_number,parent_mobile
SSD-2026-6B05,Meera Nambiar,6,B,05,9876543210
SSD-2026-6B06,Kabir Singh,6,B,06,9811223344
SSD-2026-3A07,Tanvi Joshi,3,A,07,9871122334
SSD-2026-9C08,Arjun Rampal,9,C,08,9899001122`;

  const sampleInvalidCSV = `student_id,student_name,class,section,roll_number,parent_mobile
SSD-2026-6B09,Rhea Sen,6,B,09,9876543210
,Missing ID Student,6,B,10,9876543210
SSD-2026-3A11,Invalid Phone Student,3,A,11,12345
SSD-2026-9C12,,9,C,12,9871122334`;

  const [csvInput, setCsvInput] = useState(sampleValidCSV);
  const [csvValidation, setCsvValidation] = useState<CSVImportValidation | null>(null);

  // -------------------------------------------------------------
  // ATTENDANCE WORKFLOW STATE
  // -------------------------------------------------------------
  const [attClass, setAttClass] = useState('6-B');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'present' | 'absent' | 'leave'>>({});

  // -------------------------------------------------------------
  // STUDENT MANAGEMENT STATE
  // -------------------------------------------------------------
  const [studentSearch, setStudentSearch] = useState('');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('6-B');
  const [newStudentId, setNewStudentId] = useState('');
  const [newStudentRoll, setNewStudentRoll] = useState('');
  const [newStudentMobile, setNewStudentMobile] = useState('');

  // Load all authoritative school data
  const loadSchoolData = async () => {
    const cls = await SchoolDataService.getClasses();
    const tchs = await SchoolDataService.getTeachers();
    const stds = await SchoolDataService.getAllStudents();
    const hws = await SchoolDataService.getHomework();
    const exs = await SchoolDataService.getExams();
    const hols = await SchoolDataService.getHolidays();
    const anns = await SchoolDataService.getAnnouncements();

    setClasses(cls);
    setTeachers(tchs);
    setStudents(stds);
    setHomeworkList(hws);
    setExamsList(exs);
    setHolidaysList(hols);
    setAnnouncementsList(anns);

    // Initial attendance state for selected class
    const initialAtt: Record<string, 'present' | 'absent' | 'leave'> = {};
    stds.forEach((s) => {
      initialAtt[s.id] = s.presentToday ? 'present' : 'absent';
    });
    setAttendanceMap(initialAtt);
  };

  useEffect(() => {
    loadSchoolData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // =============================================================
  // 1. TEACHER WORKFLOW: PUBLISH HOMEWORK
  // =============================================================
  const handlePublishHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherHomeworkText.trim()) return;

    setIsPublishing(true);
    setTimeout(() => {
      const teacher = teachers.find((t) => t.classesAssigned.includes(teacherSelectedClass));
      const newHw = SchoolDataService.publishHomework({
        classDisplayName: teacherSelectedClass,
        subject: teacherSelectedSubject,
        title: teacherTitle || `${teacherSelectedSubject} Assignment`,
        description: teacherHomeworkText,
        dueDate: teacherDueDate,
        teacherName: teacher?.name || 'Class Teacher',
        urgency: 'high',
      });

      setHomeworkList((prev) => [newHw, ...prev]);
      setIsPublishing(false);
      showToast(`✓ Published! ${teacherSelectedClass} ${teacherSelectedSubject} homework is now live for parents on SchoolSathi.`);
      setTeacherHomeworkText('');
    }, 400);
  };

  // =============================================================
  // 2. CSV VALIDATION & IMPORT
  // =============================================================
  const handleValidateCSV = () => {
    const result = SchoolDataService.importStudentsFromCSV(csvInput);
    setCsvValidation(result);
    if (result.invalidRows.length === 0 && result.importedCount > 0) {
      showToast(`✓ CSV Verified & Imported ${result.importedCount} students successfully.`);
      loadSchoolData();
    }
  };

  // =============================================================
  // 3. ATTENDANCE SAVE
  // =============================================================
  const handleSaveAttendance = () => {
    Object.entries(attendanceMap).forEach(([studentId, status]) => {
      SchoolDataService.recordAttendance(studentId, status, 'Today');
    });
    showToast(`✓ Attendance Register saved for Class ${attClass}. Student statuses updated.`);
    loadSchoolData();
  };

  // =============================================================
  // 4. ADD MANUAL STUDENT
  // =============================================================
  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parts = newStudentClass.split('-');
    const clsGrade = parts[0] ? `Class ${parts[0]}` : 'Class 6';
    const section = parts[1] || 'B';

    const created = SchoolDataService.addStudent({
      name: newStudentName,
      studentId: newStudentId || `SSD-2026-${Date.now().toString().slice(-4)}`,
      class: clsGrade,
      section,
      rollNumber: newStudentRoll || '15',
      parentMobile: newStudentMobile || '9876543210',
      gender: 'male',
      avatarPreference: 'owl-scholar',
    });

    setStudents((prev) => [...prev, created]);
    setShowAddStudentModal(false);
    setNewStudentName('');
    setNewStudentId('');
    setNewStudentRoll('');
    setNewStudentMobile('');
    showToast(`✓ Student ${created.name} (${created.studentId}) added to official records.`);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.studentId.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.class.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex flex-col select-none pb-12">
      {/* Top Admin Banner */}
      <header className="apple-global-nav sticky top-0 z-40 h-[52px] border-b border-[#e0e0e0]">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3 px-4">
          {/* Institution Info */}
          <div className="flex items-center gap-3">
            <img src="/src/assets/logo.png" alt="Logo" className="w-8 h-8 rounded-full object-cover" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[17px] font-semibold text-white tracking-tight">
                  {DEMO_SCHOOL.name}
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-medium bg-[#0066cc]/20 text-[#0066cc] rounded-full uppercase tracking-wider">
                  Admin Portal
                </span>
              </div>
            </div>
          </div>

          {/* Switch to Parent Voice App CTA */}
          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToParentApp}
              className="apple-btn-secondary h-[32px] px-4 text-[12px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Parent App</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#34c759] text-white text-[12px] font-medium tracking-[0.5px] px-5 py-2.5 rounded-full shadow-md flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-1.5">
          <div className="px-3 py-1 text-[12px] font-semibold text-[#7a7a7a] uppercase mb-2">
            Workflows
          </div>

          {[
            { id: 'teacher', label: 'Teacher Post', icon: <BookOpen className="w-4 h-4" />, badge: 'Fast Post' },
            { id: 'students', label: 'Students Directory', icon: <Users className="w-4 h-4" />, count: students.length },
            { id: 'csv', label: 'CSV Student Import', icon: <FileSpreadsheet className="w-4 h-4" /> },
            { id: 'attendance', label: 'Daily Attendance', icon: <CheckCircle2 className="w-4 h-4" /> },
            { id: 'homework', label: 'Homework Log', icon: <ClipboardList className="w-4 h-4" />, count: homeworkList.length },
            { id: 'exams', label: 'Exams & Results', icon: <GraduationCap className="w-4 h-4" />, count: examsList.length },
            { id: 'holidays', label: 'Holidays & Circulars', icon: <Calendar className="w-4 h-4" /> },
            { id: 'integrations', label: 'Data Sources', icon: <Server className="w-4 h-4" />, badge: 'Multi-Source' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 text-[14px] font-medium transition-colors text-left cursor-pointer rounded-xl ${
                activeTab === item.id
                  ? 'bg-[#0066cc]/10 text-[#0066cc]'
                  : 'text-[#1d1d1f] hover:bg-[#f0f0f0]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-medium bg-[#0066cc]/10 text-[#0066cc] px-2 py-0.5 rounded-full uppercase">
                  {item.badge}
                </span>
              )}
              {item.count !== undefined && (
                <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full bg-[#f0f0f0] text-[#7a7a7a]">
                  {item.count}
                </span>
              )}
            </button>
          ))}

          {/* Demo School Class Overview */}
          <div className="pt-4 border-t border-[#e0e0e0] mt-4">
            <span className="px-3 text-[12px] font-semibold text-[#7a7a7a] uppercase block mb-3">
              Demo Classes
            </span>
            <div className="space-y-2">
              {classes.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-white border border-[#e0e0e0] text-[14px]">
                  <div className="flex justify-between font-semibold text-[#1d1d1f]">
                    <span>Class {c.displayName}</span>
                    <span className="text-[#0066cc]">{c.totalStudents} Students</span>
                  </div>
                  <span className="text-[12px] text-[#7a7a7a] block mt-0.5 font-medium">
                    CT: {c.classTeacherName} ({c.roomNumber})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Dynamic Workflow Area */}
        <main className="flex-1 bg-white rounded-[18px] p-6 sm:p-8 shadow-sm border border-[#e0e0e0] overflow-hidden">
          {/* TAB 1: TEACHER WORKFLOW */}
          {activeTab === 'teacher' && (
            <div className="space-y-6">
              <div className="border-b border-[#e0e0e0] pb-4">
                <span className="text-[12px] font-semibold text-[#0066cc] uppercase block mb-1">
                  Teacher Rapid Workflow
                </span>
                <h2 className="text-[24px] font-semibold text-[#1d1d1f]">
                  Publish Class Homework
                </h2>
                <p className="text-[14px] text-[#7a7a7a] mt-1">
                  Once published, SchoolSathi AI voice assistant immediately speaks this homework to parents.
                </p>
              </div>

              <form onSubmit={handlePublishHomework} className="space-y-4 max-w-2xl">
                {/* Select Class & Subject Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1.5">
                      1. Class <span className="text-[#0066cc]">*</span>
                    </label>
                    <select
                      value={teacherSelectedClass}
                      onChange={(e) => setTeacherSelectedClass(e.target.value)}
                      className="apple-search-input"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.displayName}>
                          Class {c.displayName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1.5">
                      2. Subject <span className="text-[#0066cc]">*</span>
                    </label>
                    <select
                      value={teacherSelectedSubject}
                      onChange={(e) => setTeacherSelectedSubject(e.target.value)}
                      className="apple-search-input"
                    >
                      {['Mathematics', 'Science', 'English', 'Physics', 'Chemistry', 'Hindi', 'Social Science', 'EVS'].map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1.5">
                      3. Due Date <span className="text-[#0066cc]">*</span>
                    </label>
                    <input
                      type="text"
                      value={teacherDueDate}
                      onChange={(e) => setTeacherDueDate(e.target.value)}
                      placeholder="e.g. Tomorrow (Wednesday)"
                      className="apple-search-input"
                    />
                  </div>
                </div>

                {/* Assignment Title */}
                <div>
                  <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1.5">
                    Topic / Title
                  </label>
                  <input
                    type="text"
                    value={teacherTitle}
                    onChange={(e) => setTeacherTitle(e.target.value)}
                    placeholder="e.g. Exercise 4.2 — Questions 1 to 5"
                    className="apple-search-input"
                  />
                </div>

                {/* Homework Description */}
                <div>
                  <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1.5">
                    Homework Instructions for Students & Parents <span className="text-[#0066cc]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={teacherHomeworkText}
                    onChange={(e) => setTeacherHomeworkText(e.target.value)}
                    placeholder="e.g. Exercise 4.2 — Questions 1 to 5 from chapter Fractions in fair notebook."
                    className="w-full bg-white text-[#1d1d1f] border border-[#e0e0e0] rounded-[18px] p-4 text-[17px] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <button
                    type="submit"
                    disabled={isPublishing}
                    className="apple-btn-primary w-full sm:w-auto"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isPublishing ? 'Publishing...' : 'Publish Homework'}</span>
                  </button>

                  <span className="text-[12px] text-[#7a7a7a]">
                    Instantly notifies and speaks to parents of Class {teacherSelectedClass}.
                  </span>
                </div>
              </form>

              {/* Recent Published Homework for Selected Class */}
              <div className="pt-8 mt-6 border-t border-[#e0e0e0]">
                <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#7a7a7a] mb-4">
                  Active Published Homework for Class {teacherSelectedClass}
                </h4>
                <div className="space-y-3">
                  {homeworkList
                    .filter((h) => h.classDisplayName === teacherSelectedClass)
                    .map((hw) => (
                      <div
                        key={hw.id}
                        className="p-4 rounded-[14px] bg-[#fafafc] border border-[#e0e0e0] flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#0066cc]/10 text-[#0066cc]">
                              {hw.subject}
                            </span>
                            <span className="text-[14px] font-semibold text-[#1d1d1f]">{hw.title}</span>
                          </div>
                          <p className="text-[14px] text-[#1d1d1f] mt-2 bg-white p-3 rounded-[10px] border border-[#e0e0e0]">{hw.description}</p>
                          <div className="flex items-center gap-3 text-[12px] text-[#7a7a7a] mt-2 font-medium">
                            <span>Due: {hw.dueDate}</span>
                            <span>Assigned by: {hw.teacherName}</span>
                          </div>
                        </div>

                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#34c759]/10 text-[#34c759] whitespace-nowrap self-start">
                          ✓ Live on Sathi
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENTS DIRECTORY */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#e0e0e0] pb-4">
                <div>
                  <h2 className="text-[24px] font-semibold text-[#1d1d1f]">Students Master Directory</h2>
                  <p className="text-[14px] text-[#7a7a7a] mt-1">
                    Official source of truth records for SchoolSathi Demo School
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="apple-btn-primary h-[36px] text-[14px] px-4"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Student</span>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-[#7a7a7a]" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search student name, ID (e.g. SSD-2026), or class..."
                  className="apple-search-input pl-10"
                />
              </div>

              {/* Students Table */}
              <div className="overflow-x-auto rounded-[14px] border border-[#e0e0e0]">
                <table className="w-full text-left text-[14px]">
                  <thead className="bg-[#f0f0f0] text-[#7a7a7a] font-semibold uppercase tracking-wider text-[12px] border-b border-[#e0e0e0]">
                    <tr>
                      <th className="py-3 px-4">Student ID</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4">Roll</th>
                      <th className="py-3 px-4">Parent Mobile</th>
                      <th className="py-3 px-4">Attendance</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e0e0e0]">
                    {filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-[#fafafc] transition-colors bg-white">
                        <td className="py-3 px-4 font-mono font-medium text-[#0066cc]">{s.studentId}</td>
                        <td className="py-3 px-4 font-semibold text-[#1d1d1f]">{s.name}</td>
                        <td className="py-3 px-4 text-[#7a7a7a]">{s.class} - {s.section}</td>
                        <td className="py-3 px-4 text-[#7a7a7a]">#{s.rollNumber}</td>
                        <td className="py-3 px-4 text-[#7a7a7a] font-mono">+91 {s.parentMobile}</td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-[#34c759]">{s.attendancePercentage}%</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              s.presentToday
                                ? 'bg-[#34c759]/10 text-[#34c759]'
                                : 'bg-[#ff3b30]/10 text-[#ff3b30]'
                            }`}
                          >
                            {s.presentToday ? 'Present' : 'Absent'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CSV IMPORT */}
          {activeTab === 'csv' && (
            <div className="space-y-5">
              <div className="border-b border-[#e0e0e0] pb-4">
                <span className="text-[12px] font-semibold text-[#0066cc] uppercase block mb-1">
                  Batch Enrollment
                </span>
                <h2 className="text-[24px] font-semibold text-[#1d1d1f]">Student CSV Upload & Validation</h2>
                <p className="text-[14px] text-[#7a7a7a] mt-1">
                  Expected columns: <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded text-[#1d1d1f]">student_id, student_name, class, section, roll_number, parent_mobile</code>
                </p>
              </div>

              {/* CSV Fast Test Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCsvInput(sampleValidCSV)}
                  className="apple-btn-secondary h-[32px] px-3 text-[12px]"
                >
                  Load Valid Sample CSV
                </button>
                <button
                  onClick={() => setCsvInput(sampleInvalidCSV)}
                  className="apple-btn-secondary h-[32px] px-3 text-[12px]"
                >
                  Load CSV with Errors (Test)
                </button>
              </div>

              {/* CSV Input Area */}
              <div>
                <textarea
                  rows={6}
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  className="w-full bg-white text-[#1d1d1f] border border-[#e0e0e0] rounded-[18px] p-4 text-[14px] font-mono focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleValidateCSV}
                  className="apple-btn-primary h-[40px] px-5 text-[14px]"
                >
                  <Upload className="w-4 h-4" />
                  <span>Validate & Import CSV</span>
                </button>
              </div>

              {/* Validation Results Display */}
              {csvValidation && (
                <div className="p-5 rounded-[18px] bg-[#fafafc] border border-[#e0e0e0] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#e0e0e0] pb-3">
                    <span className="text-[14px] font-semibold text-[#1d1d1f]">
                      Validation Report ({csvValidation.totalRows} Total Rows)
                    </span>
                    <span className="text-[14px] font-semibold text-[#34c759]">
                      {csvValidation.validRows.length} Valid Records Ready
                    </span>
                  </div>

                  {/* Invalid Rows Warning */}
                  {csvValidation.invalidRows.length > 0 && (
                    <div className="p-4 rounded-[14px] bg-[#ff3b30]/5 border border-[#ff3b30]/20 space-y-2 text-[14px]">
                      <div className="flex items-center gap-1.5 font-semibold text-[#ff3b30]">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Validation Errors Detected ({csvValidation.invalidRows.length} rows):</span>
                      </div>
                      {csvValidation.invalidRows.map((inv, idx) => (
                        <div key={idx} className="text-[12px] text-[#ff3b30]/80 pl-6">
                          Row {inv.rowNumber}: {inv.errors.join('; ')}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Valid Rows Preview */}
                  {csvValidation.validRows.length > 0 && (
                    <div className="overflow-x-auto text-[12px] bg-white rounded-[10px] border border-[#e0e0e0]">
                      <table className="w-full text-left">
                        <thead className="bg-[#f0f0f0] text-[#7a7a7a] font-semibold border-b border-[#e0e0e0]">
                          <tr>
                            <th className="py-2 px-3">Student ID</th>
                            <th className="py-2 px-3">Name</th>
                            <th className="py-2 px-3">Class/Sec</th>
                            <th className="py-2 px-3">Roll</th>
                            <th className="py-2 px-3">Parent Mobile</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e0e0e0]">
                          {csvValidation.validRows.map((r, i) => (
                            <tr key={i}>
                              <td className="py-2 px-3 font-mono text-[#0066cc]">{r.student_id}</td>
                              <td className="py-2 px-3 font-semibold text-[#1d1d1f]">{r.student_name}</td>
                              <td className="py-2 px-3 text-[#7a7a7a]">{r.class}-{r.section}</td>
                              <td className="py-2 px-3 text-[#7a7a7a]">#{r.roll_number}</td>
                              <td className="py-2 px-3 font-mono text-[#7a7a7a]">+91 {r.parent_mobile}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ATTENDANCE REGISTER */}
          {activeTab === 'attendance' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#e0e0e0] pb-4">
                <div>
                  <h2 className="text-[24px] font-semibold text-[#1d1d1f]">Daily Attendance Register</h2>
                  <p className="text-[14px] text-[#7a7a7a] mt-1">Mark daily attendance for class rosters</p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={attClass}
                    onChange={(e) => setAttClass(e.target.value)}
                    className="apple-search-input"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.displayName}>
                        Class {c.displayName}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleSaveAttendance}
                    className="apple-btn-primary px-5 h-[40px] text-[14px]"
                  >
                    Save Register
                  </button>
                </div>
              </div>

              {/* Class Students Attendance List */}
              <div className="space-y-3">
                {students
                  .filter((s) => s.class.includes(attClass.split('-')[0]) || `${s.grade}-${s.section}` === attClass)
                  .map((s) => {
                    const currentStatus = attendanceMap[s.id] || (s.presentToday ? 'present' : 'absent');
                    return (
                      <div
                        key={s.id}
                        className="p-4 rounded-[14px] bg-[#fafafc] border border-[#e0e0e0] flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-full bg-[#f0f0f0] text-[#7a7a7a] font-semibold text-[14px] flex items-center justify-center border border-[#e0e0e0]">
                            #{s.rollNumber}
                          </span>
                          <div>
                            <span className="text-[16px] font-semibold text-[#1d1d1f] block">{s.name}</span>
                            <span className="text-[12px] text-[#7a7a7a] font-mono">ID: {s.studentId}</span>
                          </div>
                        </div>

                        {/* Status Toggle Buttons */}
                        <div className="flex items-center gap-2 p-1 bg-[#f0f0f0] rounded-[10px]">
                          <button
                            type="button"
                            onClick={() => setAttendanceMap((prev) => ({ ...prev, [s.id]: 'present' }))}
                            className={`px-4 py-1.5 rounded-[8px] text-[12px] font-semibold transition-all ${
                              currentStatus === 'present'
                                ? 'bg-white text-[#34c759] shadow-sm'
                                : 'text-[#7a7a7a] hover:text-[#1d1d1f]'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => setAttendanceMap((prev) => ({ ...prev, [s.id]: 'absent' }))}
                            className={`px-4 py-1.5 rounded-[8px] text-[12px] font-semibold transition-all ${
                              currentStatus === 'absent'
                                ? 'bg-white text-[#ff3b30] shadow-sm'
                                : 'text-[#7a7a7a] hover:text-[#1d1d1f]'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => setAttendanceMap((prev) => ({ ...prev, [s.id]: 'leave' }))}
                            className={`px-4 py-1.5 rounded-[8px] text-[12px] font-semibold transition-all ${
                              currentStatus === 'leave'
                                ? 'bg-white text-[#ff9500] shadow-sm'
                                : 'text-[#7a7a7a] hover:text-[#1d1d1f]'
                            }`}
                          >
                            Leave
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 5: ALL HOMEWORK LOG */}
          {activeTab === 'homework' && (
            <div className="space-y-4">
              <div className="border-b border-[#e0e0e0] pb-3">
                <h2 className="text-[24px] font-semibold text-[#1d1d1f]">All Published Homework</h2>
                <p className="text-[14px] text-[#7a7a7a] mt-1">Total assignments live in SchoolSathi</p>
              </div>

              <div className="space-y-3">
                {homeworkList.map((hw) => (
                  <div key={hw.id} className="p-4 rounded-[14px] bg-[#fafafc] border border-[#e0e0e0] flex flex-col sm:flex-row justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#0066cc]/10 text-[#0066cc] uppercase">
                          Class {hw.classDisplayName} • {hw.subject}
                        </span>
                        <span className="text-[14px] font-semibold text-[#1d1d1f]">{hw.title}</span>
                      </div>
                      <p className="text-[14px] text-[#1d1d1f] mt-2 bg-white p-3 rounded-[10px] border border-[#e0e0e0]">{hw.description}</p>
                      <span className="text-[12px] text-[#7a7a7a] font-medium mt-2 block">Due: {hw.dueDate}</span>
                    </div>
                    <span className="text-[12px] text-[#34c759] font-semibold whitespace-nowrap self-start">Active ✓</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: EXAMS & RESULTS */}
          {activeTab === 'exams' && (
            <div className="space-y-4">
              <div className="border-b border-[#e0e0e0] pb-3">
                <h2 className="text-[24px] font-semibold text-[#1d1d1f]">Upcoming Exams</h2>
                <p className="text-[14px] text-[#7a7a7a] mt-1">Official scheduled unit tests and exams</p>
              </div>

              <div className="space-y-3">
                {examsList.map((ex) => (
                  <div key={ex.id} className="p-4 rounded-[14px] bg-[#fafafc] border border-[#e0e0e0] flex flex-col sm:flex-row justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ff9500]/10 text-[#ff9500] uppercase">
                          Class {ex.classDisplayName} • {ex.subject}
                        </span>
                        <span className="text-[14px] font-semibold text-[#1d1d1f]">{ex.title}</span>
                      </div>
                      <p className="text-[14px] text-[#1d1d1f] mt-2 bg-white p-3 rounded-[10px] border border-[#e0e0e0]">
                        <span className="font-medium text-[#7a7a7a]">Syllabus:</span> {ex.syllabus}
                      </p>
                      <span className="text-[12px] text-[#7a7a7a] font-medium mt-2 block">
                        Date: {ex.date} ({ex.time}) • Room: {ex.roomNumber}
                      </span>
                    </div>
                    <span className="text-[12px] font-semibold bg-[#e0e0e0] text-[#7a7a7a] px-2 py-1 rounded-full self-start whitespace-nowrap">
                      {ex.totalMarks} Marks
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: HOLIDAYS & NOTICES */}
          {activeTab === 'holidays' && (
            <div className="space-y-4">
              <div className="border-b border-[#e0e0e0] pb-3">
                <h2 className="text-[24px] font-semibold text-[#1d1d1f]">School Holidays & Circulars</h2>
                <p className="text-[14px] text-[#7a7a7a] mt-1">Official vacation dates and school circulars</p>
              </div>

              <div className="space-y-3">
                {holidaysList.map((hol) => (
                  <div key={hol.id} className="p-4 rounded-[14px] bg-[#fafafc] border border-[#e0e0e0] flex flex-col justify-between">
                    <div>
                      <h4 className="text-[16px] font-semibold text-[#1d1d1f]">{hol.title}</h4>
                      <p className="text-[14px] text-[#7a7a7a] mt-1">{hol.description}</p>
                      <span className="text-[12px] font-medium text-[#0066cc] mt-2 block">
                        Dates: {hol.startDate} to {hol.endDate} ({hol.daysCount} days)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: DATA SOURCES & MULTI-TENANCY INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <DataSourcesTab />
          )}
        </main>
      </div>

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-[24px] p-8 shadow-xl relative animate-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={() => setShowAddStudentModal(false)}
              className="absolute top-6 right-6 text-[#7a7a7a] hover:text-[#1d1d1f]"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-[20px] font-semibold text-[#1d1d1f] mb-6">Add Student to School Registry</h3>
            <form onSubmit={handleAddStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1.5">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Rahul Sen"
                  className="apple-search-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1.5">Class *</label>
                  <select
                    value={newStudentClass}
                    onChange={(e) => setNewStudentClass(e.target.value)}
                    className="apple-search-input"
                  >
                    <option value="6-B">6-B</option>
                    <option value="3-A">3-A</option>
                    <option value="9-C">9-C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1.5">Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={newStudentRoll}
                    onChange={(e) => setNewStudentRoll(e.target.value)}
                    placeholder="e.g. 15"
                    className="apple-search-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1.5">Student ID *</label>
                <input
                  type="text"
                  required
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  placeholder="e.g. SSD-2026-6B15"
                  className="apple-search-input font-mono"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#1d1d1f] mb-1.5">Parent Mobile (10-digits) *</label>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={newStudentMobile}
                  onChange={(e) => setNewStudentMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 9876543210"
                  className="apple-search-input font-mono"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#e0e0e0] mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="apple-btn-secondary px-5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="apple-btn-primary px-5"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
