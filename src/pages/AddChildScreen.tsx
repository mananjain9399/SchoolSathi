import React, { useState } from 'react';
import { ArrowLeft, User, GraduationCap, Hash, Calendar, Plus, Check, AlertCircle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Student, School, LanguageCode, ScreenId } from '../types';
import { TRANSLATIONS } from '../data/languages';
import { SpeechService } from '../services/speechService';

interface AddChildScreenProps {
  language: LanguageCode;
  selectedSchool?: School;
  onNavigate: (screen: ScreenId) => void;
  onSaveChild: (child: Partial<Student>) => void;
  existingChildrenCount?: number;
}

export const AddChildScreen: React.FC<AddChildScreenProps> = ({
  language,
  selectedSchool,
  onNavigate,
  onSaveChild,
  existingChildrenCount = 1,
}) => {
  const t = TRANSLATIONS[language];

  // 6 Required Fields: Name, School, Class, Section, Student ID, Gender
  const [fullName, setFullName] = useState(existingChildrenCount === 0 ? 'Rohan Sharma' : '');
  const [schoolName, setSchoolName] = useState(
    selectedSchool?.name || 'Kendriya Vidyalaya No. 1, Delhi Cantt'
  );
  const [grade, setGrade] = useState('Class 6');
  const [section, setSection] = useState('B');
  const [admissionNumber, setAdmissionNumber] = useState(
    existingChildrenCount === 0 ? 'KV-2024-8841' : `STU-${Date.now().toString().slice(-4)}`
  );
  const [gender, setGender] = useState<'male' | 'female'>('male');

  // Optional Fields
  const [rollNumber, setRollNumber] = useState('14');
  const [dateOfBirth, setDateOfBirth] = useState('2013-08-14');

  // State Management: Loading, Error, Success
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const grades = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Class 11', 'Class 12',
  ];

  const sections = ['A', 'B', 'C', 'D'];

  const validate = (): boolean => {
    if (!fullName.trim()) {
      setValidationError('Please enter your child\'s full name.');
      return false;
    }
    if (!schoolName.trim()) {
      setValidationError('Please enter the school name.');
      return false;
    }
    if (!grade.trim()) {
      setValidationError('Please select the child\'s class.');
      return false;
    }
    if (!section.trim()) {
      setValidationError('Please select the section.');
      return false;
    }
    if (!admissionNumber.trim()) {
      setValidationError('Please enter Student ID / Admission number.');
      return false;
    }
    if (!gender) {
      setValidationError('Please select child\'s gender.');
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setValidationError(null);

    try {
      const newStudent: Partial<Student> = {
        name: fullName.trim(),
        fullName: fullName.trim(),
        class: grade,
        grade,
        section,
        studentId: admissionNumber.trim(),
        admissionNumber: admissionNumber.trim(),
        gender,
        rollNumber: rollNumber.trim() || '1',
        dateOfBirth,
        schoolName: schoolName.trim(),
        attendancePercentage: 95,
        presentToday: true,
        classTeacherName: 'Mrs. Sunita Verma',
        classTeacherPhone: '+91 98112 44321',
      };

      onSaveChild(newStudent);
      setSuccessMessage(`${fullName.trim()} has been added successfully!`);

      const spokenText =
        language === 'hi'
          ? `${fullName} का विवरण सफलतापूर्वक जुड़ गया।`
          : `${fullName} has been added.`;
      SpeechService.speak(spokenText, language);

      // Immediately navigate to main companion screen
      setTimeout(() => {
        onNavigate('main-companion');
      }, 500);
    } catch (err) {
      console.error('Failed to save child:', err);
      setValidationError('Failed to save child details. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleAddAnother = () => {
    if (!validate()) return;

    const tempStudent: Partial<Student> = {
      name: fullName.trim(),
      fullName: fullName.trim(),
      class: grade,
      grade,
      section,
      studentId: admissionNumber.trim(),
      admissionNumber: admissionNumber.trim(),
      gender,
      rollNumber: rollNumber.trim() || '1',
      dateOfBirth,
      schoolName: schoolName.trim(),
      attendancePercentage: 95,
      presentToday: true,
    };

    onSaveChild(tempStudent);

    // Reset form for next child
    setFullName('');
    setAdmissionNumber(`STU-${Date.now().toString().slice(-4)}`);
    setRollNumber('');
    setGender('female');
    setSuccessMessage(`${tempStudent.fullName} added. You can now add the next child.`);

    const spokenText =
      language === 'hi'
        ? 'बच्चा सहेजा गया। अब दूसरे बच्चे का नाम लिखें।'
        : 'Child saved. Please enter details for the next child.';
    SpeechService.speak(spokenText, language);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onNavigate('main-companion')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-2 rounded-xl border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
          Add Child
        </span>
      </div>

      {/* Screen Title */}
      <div className="text-center mb-5">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {t.addChildTitle}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {t.addChildSub}
        </p>
      </div>

      {/* Validation / Error Banner */}
      {validationError && (
        <div className="mb-4 p-3.5 bg-rose-50 border-2 border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-800 text-xs font-bold animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Success Banner */}
      {successMessage && (
        <div className="mb-4 p-3.5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-800 text-xs font-bold animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-5 rounded-3xl shadow-sm border border-orange-100">
        {/* 1. Child Full Name */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">
            {t.childNameLabel} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-5 h-5" />
            </div>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder={t.childNamePlaceholder || 'e.g. Rohan / Priya Sharma'}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* 2. Gender Selection (Boy / Girl) */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">
            Gender <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setGender('male')}
              className={`py-3 px-4 rounded-2xl border-2 flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                gender === 'male'
                  ? 'border-orange-500 bg-orange-50 text-orange-950 font-extrabold shadow-xs'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
              }`}
            >
              <span className="text-lg">👦</span>
              <span>Boy ({language === 'hi' ? 'लड़का' : 'Male'})</span>
              {gender === 'male' && <Check className="w-4 h-4 text-orange-600 ml-1" />}
            </button>

            <button
              type="button"
              onClick={() => setGender('female')}
              className={`py-3 px-4 rounded-2xl border-2 flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                gender === 'female'
                  ? 'border-orange-500 bg-orange-50 text-orange-950 font-extrabold shadow-xs'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
              }`}
            >
              <span className="text-lg">👧</span>
              <span>Girl ({language === 'hi' ? 'लड़की' : 'Female'})</span>
              {gender === 'female' && <Check className="w-4 h-4 text-orange-600 ml-1" />}
            </button>
          </div>
        </div>

        {/* 3. School Name */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">
            {t.schoolLabel} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <span className="text-base">🏫</span>
            </div>
            <input
              type="text"
              required
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="e.g. Kendriya Vidyalaya No. 1"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        {/* 4 & 5. Class and Section row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              {t.gradeLabel} <span className="text-rose-500">*</span>
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full py-3 px-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none"
            >
              {grades.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              {t.sectionLabel} <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-1">
              {sections.map((sec) => (
                <button
                  type="button"
                  key={sec}
                  onClick={() => setSection(sec)}
                  className={`py-2.5 rounded-xl border-2 text-xs font-black transition-all ${
                    section === sec
                      ? 'border-orange-500 bg-orange-500 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 6. Student ID / Admission Number */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">
            {t.studentIdLabel} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Hash className="w-5 h-5" />
            </div>
            <input
              type="text"
              required
              value={admissionNumber}
              onChange={(e) => setAdmissionNumber(e.target.value)}
              placeholder={t.studentIdPlaceholder || 'e.g. STU001 or KV-8841'}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Student ID from school records, fee receipt, or ID card.
          </p>
        </div>

        {/* Optional Row: Roll Number & Date of Birth */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              {t.rollNumberLabel}
            </label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="e.g. 14"
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              {t.dobLabel}
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
            />
          </div>
        </div>

        {/* CTAs */}
        <div className="pt-2 space-y-2.5">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving Child...' : t.saveChild}
          </Button>

          {/* "+ Add another child" button */}
          <button
            type="button"
            onClick={handleAddAnother}
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-orange-300 hover:border-orange-500 bg-orange-50/40 hover:bg-orange-50 text-orange-800 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4 text-orange-600" />
            <span>{t.addAnotherChild}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
