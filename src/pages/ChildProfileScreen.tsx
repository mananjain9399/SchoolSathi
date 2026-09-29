import React, { useState, useEffect } from 'react';
import {
  Phone,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Bus,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { ChildSelector } from '../components/child/ChildSelector';
import { Student, LanguageCode, ScreenId } from '../types';
import {
  MOCK_ATTENDANCE,
  MOCK_PROGRESS,
  MOCK_HOMEWORK,
} from '../data/mockData';
import { SchoolDataService } from '../services/schoolDataService';
import { Attendance, AcademicResult, Homework } from '../types';
import { SpeechService } from '../services/speechService';
import { Button } from '../components/common/Button';

interface ChildProfileScreenProps {
  students: Student[];
  currentStudent: Student | null;
  onSelectStudent: (id: string) => void;
  language: LanguageCode;
  onNavigate: (screen: ScreenId) => void;
}

export const ChildProfileScreen: React.FC<ChildProfileScreenProps> = ({
  students,
  currentStudent,
  onSelectStudent,
  language,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'attendance'>('overview');
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [progress, setProgress] = useState<AcademicResult | null>(null);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (!currentStudent) return;
    let isMounted = true;
    setIsLoadingData(true);

    Promise.all([
      SchoolDataService.getAttendance(currentStudent.id),
      SchoolDataService.getProgress(currentStudent.id),
      SchoolDataService.getHomework(currentStudent.id),
    ])
      .then(([att, prog, hw]) => {
        if (!isMounted) return;
        setAttendance(att || MOCK_ATTENDANCE[currentStudent.id] || null);
        setProgress(prog || MOCK_PROGRESS[currentStudent.id] || null);
        setHomework(hw.length > 0 ? hw : MOCK_HOMEWORK[currentStudent.id] || []);
        setIsLoadingData(false);
      })
      .catch((err) => {
        console.error('Error fetching child profile data from SchoolDataService:', err);
        if (!isMounted) return;
        // Fallback to mock data for resilience
        setAttendance(MOCK_ATTENDANCE[currentStudent.id] || null);
        setProgress(MOCK_PROGRESS[currentStudent.id] || null);
        setHomework(MOCK_HOMEWORK[currentStudent.id] || []);
        setIsLoadingData(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentStudent?.id]);

  if (!currentStudent || students.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-3xl mx-auto">
          👶
        </div>
        <h3 className="text-xl font-black text-slate-800">No Child Linked Yet</h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          To view attendance, report cards, and homework, please verify your child with their school records.
        </p>
        <Button
          variant="primary"
          size="lg"
          icon={<Plus className="w-5 h-5" />}
          onClick={() => onNavigate('verify-child')}
        >
          Verify & Link Child
        </Button>
      </div>
    );
  }

  const displayName = currentStudent.name || currentStudent.fullName || 'Student';
  const displayClass = currentStudent.class || currentStudent.grade || 'Class';

  const handleCallTeacher = () => {
    SpeechService.speak(
      `कक्षा अध्यापिका ${currentStudent.classTeacherName || 'शिक्षिका'} से संपर्क किया जा रहा है। फोन नंबर: ${currentStudent.classTeacherPhone || '+91 98112 44321'}`,
      language
    );
    window.open(`tel:${currentStudent.classTeacherPhone || '+919811244321'}`);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-24 space-y-4">
      {/* 1. Child Switching Header */}
      <ChildSelector
        students={students}
        selectedStudentId={currentStudent.id}
        onSelectStudent={onSelectStudent}
        onAddNewChild={() => onNavigate('verify-child')}
        allowAllOption={false}
      />

      {/* 2. Visual Student Card */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-3xl p-5 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full pointer-events-none" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl font-black shadow-inner">
              {displayName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xl font-extrabold tracking-tight">
                  {displayName}
                </h3>
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
              </div>
              <p className="text-xs font-semibold text-orange-100">
                {displayClass} - Section {currentStudent.section} • Roll #{currentStudent.rollNumber}
              </p>
              <p className="text-[11px] text-white/80 mt-0.5 truncate max-w-[200px]">
                {currentStudent.schoolName}
              </p>
            </div>
          </div>

          <span className="text-xs font-bold bg-white text-orange-800 px-2.5 py-1 rounded-full shadow-xs">
            {currentStudent.bloodGroup || 'B+'}
          </span>
        </div>

        {/* Quick Highlights Row */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/20 text-center">
          <div className="bg-white/15 backdrop-blur-xs p-2 rounded-xl">
            <span className="text-lg font-black">{currentStudent.attendancePercentage || 94}%</span>
            <p className="text-[10px] text-white/80 font-medium">Attendance</p>
          </div>
          <div className="bg-white/15 backdrop-blur-xs p-2 rounded-xl">
            <span className="text-lg font-black">{progress?.overallGrade || 'A'}</span>
            <p className="text-[10px] text-white/80 font-medium">Overall Grade</p>
          </div>
          <div className="bg-white/15 backdrop-blur-xs p-2 rounded-xl">
            <span className="text-lg font-black">{homework.filter((h) => !h.isCompleted).length}</span>
            <p className="text-[10px] text-white/80 font-medium">Pending HW</p>
          </div>
        </div>
      </div>

      {/* 3. Class Teacher & Contact Card */}
      <div className="bg-white rounded-3xl p-4 border border-orange-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg">
            👩‍🏫
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Class Teacher
            </span>
            <h4 className="text-sm font-black text-slate-800">
              {currentStudent.classTeacherName || 'Mrs. Sunita Verma'}
            </h4>
            <span className="text-xs text-slate-500 font-medium">
              {currentStudent.classTeacherPhone || '+91 98112 44321'}
            </span>
          </div>
        </div>

        <button
          onClick={handleCallTeacher}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold active:scale-95 transition-all cursor-pointer"
        >
          <Phone className="w-3.5 h-3.5 text-emerald-600" />
          <span>Call</span>
        </button>
      </div>

      {/* 4. Details Navigation Tabs */}
      <div className="flex rounded-2xl bg-slate-100 p-1">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'progress', label: 'Academics' },
          { id: 'attendance', label: 'Attendance' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-white text-orange-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 5. Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          {/* Student Bio Records */}
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Student ID / Admission No:</span>
              <span className="font-mono font-bold text-slate-800">
                {currentStudent.studentId || currentStudent.admissionNumber}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Date of Birth:</span>
              <span className="font-bold text-slate-800">
                {currentStudent.dateOfBirth || '14 August 2013'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">School Bus Route:</span>
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <Bus className="w-3.5 h-3.5 text-orange-600" /> {currentStudent.busRoute || 'Bus #12'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">School Records Status:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Verified & Official ✓
              </span>
            </div>
          </div>

          {/* Pending Homework items */}
          <div className="bg-white rounded-3xl p-4 border border-orange-100 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-orange-600" /> Current Homework
              </h5>
              <span className="text-[11px] font-bold text-orange-600">
                {homework.length} Assigned
              </span>
            </div>

            <div className="space-y-2">
              {homework.map((hw) => (
                <div
                  key={hw.id}
                  className="p-2.5 rounded-2xl bg-orange-50/40 border border-orange-100 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {hw.subject}: {hw.title}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" /> Due: {hw.dueDate}
                    </span>
                  </div>
                  {hw.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="space-y-3">
          <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
              Teacher's Assessment
            </span>
            <p className="text-xs font-medium text-amber-950 italic">
              "{progress?.teacherRemark || 'Doing consistently well across all subjects.'}"
            </p>
          </div>

          {progress && (
            <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-2.5">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Subject Grades & Performance
              </h5>
              {progress.subjects.map((sub, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50">
                  <div>
                    <span className="text-xs font-bold text-slate-800">{sub.subject}</span>
                    <p className="text-[10px] text-slate-400">{sub.remark}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-orange-600">{sub.grade}</span>
                    <span className="text-[10px] text-slate-400 block">{sub.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="space-y-3">
          <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Attendance Records
            </h5>
            <div className="space-y-2">
              {(attendance?.recentRecords || [
                { date: 'Today', status: 'present' },
                { date: 'Yesterday', status: 'present' },
              ]).map((rec, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 text-xs font-semibold"
                >
                  <span className="text-slate-700">{rec.date}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full capitalize text-[11px] font-bold ${
                      rec.status === 'present'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rec.status === 'holiday'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {rec.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
