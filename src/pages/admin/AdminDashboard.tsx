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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none pb-12">
      {/* Top Admin Banner */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Institution Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-black text-xl shadow-md">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {DEMO_SCHOOL.name}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  Admin Portal
                </span>
              </div>
              <p className="text-xs text-slate-400">
                School Data Source of Truth • Academic Year {DEMO_SCHOOL.academicYear}
              </p>
            </div>
          </div>

          {/* Switch to Parent Voice App CTA */}
          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToParentApp}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Parent Voice App</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-1.5">
          <div className="px-3 py-1 text-[11px] font-black uppercase tracking-wider text-slate-500">
            Workflows
          </div>

          {[
            { id: 'teacher', label: 'Teacher Post (Homework)', icon: <BookOpen className="w-4 h-4" />, badge: 'Fast Post' },
            { id: 'students', label: 'Students Directory', icon: <Users className="w-4 h-4" />, count: students.length },
            { id: 'csv', label: 'CSV Student Import', icon: <FileSpreadsheet className="w-4 h-4" /> },
            { id: 'attendance', label: 'Daily Attendance', icon: <CheckCircle2 className="w-4 h-4" /> },
            { id: 'homework', label: 'All Homework Log', icon: <ClipboardList className="w-4 h-4" />, count: homeworkList.length },
            { id: 'exams', label: 'Exams & Results', icon: <GraduationCap className="w-4 h-4" />, count: examsList.length },
            { id: 'holidays', label: 'Holidays & Circulars', icon: <Calendar className="w-4 h-4" /> },
            { id: 'integrations', label: 'Data Sources & Webhooks', icon: <Server className="w-4 h-4" />, badge: 'Multi-Source' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all text-left cursor-pointer ${
                activeTab === item.id
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/40 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-orange-500 text-white">
                  {item.badge}
                </span>
              )}
              {item.count !== undefined && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  {item.count}
                </span>
              )}
            </button>
          ))}

          {/* Demo School Class Overview */}
          <div className="pt-4 border-t border-slate-800">
            <span className="px-3 text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-2">
              Demo School Classes
            </span>
            <div className="space-y-1.5">
              {classes.map((c) => (
                <div key={c.id} className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 text-xs">
                  <div className="flex justify-between font-bold text-slate-200">
                    <span>Class {c.displayName}</span>
                    <span className="text-orange-400">{c.totalStudents} Students</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    CT: {c.classTeacherName} ({c.roomNumber})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Dynamic Workflow Area */}
        <main className="flex-1 bg-slate-950 rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-xl overflow-hidden">
          {/* TAB 1: TEACHER WORKFLOW */}
          {activeTab === 'teacher' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block mb-1">
                  Teacher Rapid Workflow
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Publish Class Homework
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Once published, SchoolSathi AI voice assistant immediately speaks this homework to parents.
                </p>
              </div>

              <form onSubmit={handlePublishHomework} className="space-y-4 max-w-2xl">
                {/* Select Class & Subject Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      1. Class <span className="text-orange-500">*</span>
                    </label>
                    <select
                      value={teacherSelectedClass}
                      onChange={(e) => setTeacherSelectedClass(e.target.value)}
                      className="w-full py-2.5 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-orange-500"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.displayName}>
                          Class {c.displayName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      2. Subject <span className="text-orange-500">*</span>
                    </label>
                    <select
                      value={teacherSelectedSubject}
                      onChange={(e) => setTeacherSelectedSubject(e.target.value)}
                      className="w-full py-2.5 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-orange-500"
                    >
                      {['Mathematics', 'Science', 'English', 'Physics', 'Chemistry', 'Hindi', 'Social Science', 'EVS'].map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      3. Due Date <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={teacherDueDate}
                      onChange={(e) => setTeacherDueDate(e.target.value)}
                      placeholder="e.g. Tomorrow (Wednesday)"
                      className="w-full py-2.5 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Assignment Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Topic / Title
                  </label>
                  <input
                    type="text"
                    value={teacherTitle}
                    onChange={(e) => setTeacherTitle(e.target.value)}
                    placeholder="e.g. Exercise 4.2 — Questions 1 to 5"
                    className="w-full py-2.5 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Homework Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Homework Instructions for Students & Parents <span className="text-orange-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={teacherHomeworkText}
                    onChange={(e) => setTeacherHomeworkText(e.target.value)}
                    placeholder="e.g. Exercise 4.2 — Questions 1 to 5 from chapter Fractions in fair notebook."
                    className="w-full py-2.5 px-3 bg-slate-900 border border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isPublishing}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-orange-500/25 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isPublishing ? 'Publishing to SchoolSathi...' : 'Publish Homework'}</span>
                  </button>

                  <span className="text-xs text-slate-400">
                    Instantly notifies and speaks to parents of Class {teacherSelectedClass}.
                  </span>
                </div>
              </form>

              {/* Recent Published Homework for Selected Class */}
              <div className="pt-6 border-t border-slate-800">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                  Active Published Homework for Class {teacherSelectedClass}
                </h4>
                <div className="space-y-2">
                  {homeworkList
                    .filter((h) => h.classDisplayName === teacherSelectedClass)
                    .map((hw) => (
                      <div
                        key={hw.id}
                        className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                              {hw.subject}
                            </span>
                            <span className="text-sm font-bold text-white">{hw.title}</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{hw.description}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1.5">
                            <span>Due: {hw.dueDate}</span>
                            <span>Assigned by: {hw.teacherName}</span>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
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
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-white">Students Master Directory</h2>
                  <p className="text-xs text-slate-400">
                    Official source of truth records for SchoolSathi Demo School
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Student</span>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search student name, ID (e.g. SSD-2026), or class..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Students Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
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
                  <tbody className="divide-y divide-slate-850">
                    {filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-orange-400">{s.studentId}</td>
                        <td className="py-3 px-4 font-bold text-white">{s.name}</td>
                        <td className="py-3 px-4 text-slate-300">{s.class} - {s.section}</td>
                        <td className="py-3 px-4 text-slate-400">#{s.rollNumber}</td>
                        <td className="py-3 px-4 text-slate-300 font-mono">+91 {s.parentMobile}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-emerald-400">{s.attendancePercentage}%</span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.presentToday
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {s.presentToday ? 'Present Today' : 'Absent'}
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
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block mb-1">
                  Batch Enrollment
                </span>
                <h2 className="text-xl font-black text-white">Student CSV Upload & Validation</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Expected columns: <code className="bg-slate-800 px-1.5 py-0.5 rounded text-orange-300">student_id, student_name, class, section, roll_number, parent_mobile</code>
                </p>
              </div>

              {/* CSV Fast Test Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCsvInput(sampleValidCSV)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
                >
                  Load Valid Sample CSV
                </button>
                <button
                  onClick={() => setCsvInput(sampleInvalidCSV)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
                >
                  Load CSV with Errors (Test Validation)
                </button>
              </div>

              {/* CSV Input Area */}
              <div>
                <textarea
                  rows={6}
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-xs font-mono text-slate-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleValidateCSV}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Validate & Import CSV Records</span>
                </button>
              </div>

              {/* Validation Results Display */}
              {csvValidation && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      Validation Report ({csvValidation.totalRows} Total Rows Processed)
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      {csvValidation.validRows.length} Valid Records Ready
                    </span>
                  </div>

                  {/* Invalid Rows Warning */}
                  {csvValidation.invalidRows.length > 0 && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-rose-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Validation Errors Detected ({csvValidation.invalidRows.length} rows):</span>
                      </div>
                      {csvValidation.invalidRows.map((inv, idx) => (
                        <div key={idx} className="text-[11px] text-rose-300 pl-5">
                          Row {inv.rowNumber}: {inv.errors.join('; ')}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Valid Rows Preview */}
                  {csvValidation.validRows.length > 0 && (
                    <div className="overflow-x-auto text-[11px]">
                      <table className="w-full text-left">
                        <thead className="text-slate-400 border-b border-slate-800">
                          <tr>
                            <th className="py-1">Student ID</th>
                            <th className="py-1">Name</th>
                            <th className="py-1">Class/Sec</th>
                            <th className="py-1">Roll</th>
                            <th className="py-1">Parent Mobile</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {csvValidation.validRows.map((r, i) => (
                            <tr key={i}>
                              <td className="py-1 font-mono text-orange-400">{r.student_id}</td>
                              <td className="py-1 font-bold text-white">{r.student_name}</td>
                              <td className="py-1 text-slate-300">{r.class}-{r.section}</td>
                              <td className="py-1 text-slate-400">#{r.roll_number}</td>
                              <td className="py-1 font-mono text-slate-300">+91 {r.parent_mobile}</td>
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
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-white">Daily Attendance Register</h2>
                  <p className="text-xs text-slate-400">Mark daily attendance for class rosters</p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={attClass}
                    onChange={(e) => setAttClass(e.target.value)}
                    className="py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.displayName}>
                        Class {c.displayName}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleSaveAttendance}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    Save Register
                  </button>
                </div>
              </div>

              {/* Class Students Attendance List */}
              <div className="space-y-2">
                {students
                  .filter((s) => s.class.includes(attClass.split('-')[0]) || `${s.grade}-${s.section}` === attClass)
                  .map((s) => {
                    const currentStatus = attendanceMap[s.id] || (s.presentToday ? 'present' : 'absent');
                    return (
                      <div
                        key={s.id}
                        className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-slate-800 text-orange-400 font-bold text-xs flex items-center justify-center">
                            #{s.rollNumber}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-white block">{s.name}</span>
                            <span className="text-[10px] text-slate-400">ID: {s.studentId}</span>
                          </div>
                        </div>

                        {/* Status Toggle Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setAttendanceMap((prev) => ({ ...prev, [s.id]: 'present' }))}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              currentStatus === 'present'
                                ? 'bg-emerald-500 text-white shadow-xs'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => setAttendanceMap((prev) => ({ ...prev, [s.id]: 'absent' }))}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              currentStatus === 'absent'
                                ? 'bg-rose-500 text-white shadow-xs'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => setAttendanceMap((prev) => ({ ...prev, [s.id]: 'leave' }))}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              currentStatus === 'leave'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
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
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-xl font-black text-white">All Published Homework</h2>
                <p className="text-xs text-slate-400">Total assignments live in SchoolSathi</p>
              </div>

              <div className="space-y-2.5">
                {homeworkList.map((hw) => (
                  <div key={hw.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">
                          Class {hw.classDisplayName} • {hw.subject}
                        </span>
                        <span className="text-sm font-bold text-white">{hw.title}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{hw.description}</p>
                      <span className="text-[11px] text-slate-500 mt-1 block">Due: {hw.dueDate}</span>
                    </div>
                    <span className="text-xs text-emerald-400 font-bold">Active ✓</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: EXAMS & RESULTS */}
          {activeTab === 'exams' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-xl font-black text-white">Upcoming Exams</h2>
                <p className="text-xs text-slate-400">Official scheduled unit tests and exams</p>
              </div>

              <div className="space-y-2.5">
                {examsList.map((ex) => (
                  <div key={ex.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                          Class {ex.classDisplayName} • {ex.subject}
                        </span>
                        <span className="text-sm font-bold text-white">{ex.title}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Syllabus: {ex.syllabus}</p>
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Date: {ex.date} ({ex.time}) • Room: {ex.roomNumber}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-400">{ex.totalMarks} Marks</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: HOLIDAYS & NOTICES */}
          {activeTab === 'holidays' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-xl font-black text-white">School Holidays & Circulars</h2>
                <p className="text-xs text-slate-400">Official vacation dates and school circulars</p>
              </div>

              <div className="space-y-2.5">
                {holidaysList.map((hol) => (
                  <div key={hol.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{hol.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{hol.description}</p>
                      <span className="text-[11px] text-orange-400 mt-1 block">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 w-full max-w-md rounded-3xl p-6 border border-slate-700 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-3">Add Student to School Registry</h3>
            <form onSubmit={handleAddStudentSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Rahul Sen"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Class *</label>
                  <select
                    value={newStudentClass}
                    onChange={(e) => setNewStudentClass(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="6-B">6-B</option>
                    <option value="3-A">3-A</option>
                    <option value="9-C">9-C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={newStudentRoll}
                    onChange={(e) => setNewStudentRoll(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Student ID *</label>
                <input
                  type="text"
                  required
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  placeholder="e.g. SSD-2026-6B15"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-orange-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Parent Mobile (10-digits) *</label>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={newStudentMobile}
                  onChange={(e) => setNewStudentMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 9876543210"
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
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
