import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  School as SchoolIcon,
  User,
  Hash,
  Sparkles,
  Info,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Avatar } from '../components/avatar/Avatar';
import { LanguageCode, ScreenId, School, Child } from '../types';
import { MOCK_SCHOOLS, VERIFIED_SCHOOL_REGISTRY } from '../data/mockData';
import { StudentService } from '../services/studentService';
import { SpeechService } from '../services/speechService';
import confetti from 'canvas-confetti';

interface ChildVerificationScreenProps {
  language: LanguageCode;
  selectedSchool?: School;
  currentParentId: string;
  onNavigate: (screen: ScreenId) => void;
  onVerificationSuccess: (child: Child) => void;
}

export const ChildVerificationScreen: React.FC<ChildVerificationScreenProps> = ({
  language,
  selectedSchool,
  currentParentId,
  onNavigate,
  onVerificationSuccess,
}) => {
  const [schoolId, setSchoolId] = useState(selectedSchool?.id || 'sch-01');
  const [studentId, setStudentId] = useState('KV-2024-8841');
  const [childName, setChildName] = useState('Rohan Sharma');

  const [status, setStatus] = useState<'idle' | 'verifying' | 'matched' | 'mismatch'>('idle');
  const [verifiedChild, setVerifiedChild] = useState<Child | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatus('verifying');
    setErrorMessage('');

    SpeechService.speak('स्कूल रिकॉर्ड से जानकारी मिलाई जा रही है...', language);

    setTimeout(() => {
      const response = StudentService.linkChildToParent(currentParentId, {
        schoolId,
        studentId,
        childName,
      });

      if (response.success && response.child) {
        setStatus('matched');
        setVerifiedChild(response.child);

        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}

        SpeechService.speak(
          'बधाई हो! आपका बच्चा सफलतापूर्वक सत्यापित हो गया है।',
          language
        );
      } else {
        setStatus('mismatch');
        setErrorMessage(response.message || 'Please check the details and try again.');
        SpeechService.speak(
          'विवरण मेल नहीं खाया। कृपया विवरण जांचें और पुनः प्रयास करें।',
          language
        );
      }
    }, 1000);
  };

  const handleProceedToCompanion = () => {
    if (verifiedChild) {
      onVerificationSuccess(verifiedChild);
    }
    onNavigate('intro');
  };

  // Helper presets to quickly test matching and mismatching
  const loadPreset = (type: 'match' | 'mismatch') => {
    if (type === 'match') {
      const sample = VERIFIED_SCHOOL_REGISTRY[0]; // Rohan Sharma
      setSchoolId(sample.schoolId);
      setStudentId(sample.studentId);
      setChildName(sample.name);
      setStatus('idle');
    } else {
      setSchoolId('sch-01');
      setStudentId('INVALID-ID-9999');
      setChildName('Unknown Student');
      setStatus('idle');
    }
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
          Student Verification
        </span>
      </div>

      {/* Screen Title */}
      <div className="text-center mb-5">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Verify Child with School
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Link verified school records directly to your parent account
        </p>
      </div>

      {/* Status: Matched */}
      {status === 'matched' && verifiedChild ? (
        <div className="bg-white rounded-3xl p-5 shadow-lg border-2 border-emerald-300 text-center space-y-4 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified & Linked
            </span>
            <h3 className="text-xl font-black text-slate-900">
              Your child has been verified.
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Official school records have been linked to your account.
            </p>
          </div>

          {/* Child Details Card */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-semibold">Child Name:</span>
              <span className="font-extrabold text-slate-900 text-sm">{verifiedChild.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-semibold">Class & Section:</span>
              <span className="font-bold text-slate-900">{verifiedChild.class} - Section {verifiedChild.section}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-semibold">Student ID:</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-emerald-200">
                {verifiedChild.studentId}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-semibold">School:</span>
              <span className="font-bold text-slate-800 text-right truncate max-w-[200px]">
                {verifiedChild.schoolName}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="success"
              size="lg"
              fullWidth
              icon={<Sparkles className="w-5 h-5" />}
              onClick={handleProceedToCompanion}
            >
              Continue to Sathi Companion
            </Button>
          </div>
        </div>
      ) : (
        /* Verification Form */
        <form onSubmit={handleVerify} className="bg-white p-5 rounded-3xl shadow-sm border border-orange-100 space-y-4">
          {/* Mismatch Alert Banner */}
          {status === 'mismatch' && (
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 space-y-1 animate-in shake duration-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <h4 className="text-sm font-extrabold">
                  Please check the details and try again.
                </h4>
              </div>
              <p className="text-xs text-rose-700 pl-7">
                No matching student was found for this Student ID and Name at the selected school. Please verify the ID from your fee receipt.
              </p>
            </div>
          )}

          {/* School Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <SchoolIcon className="w-3.5 h-3.5 text-orange-600" />
              <span>School</span> <span className="text-rose-500">*</span>
            </label>
            <select
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              className="w-full py-3 px-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none"
            >
              {MOCK_SCHOOLS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.city})
                </option>
              ))}
            </select>
          </div>

          {/* Student ID */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-orange-600" />
              <span>Student ID / Admission Number</span> <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g. KV-2024-8841"
              className="w-full py-3 px-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Found on report card, ID card, or school fee slip.
            </p>
          </div>

          {/* Child Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-orange-600" />
              <span>Child Full Name</span> <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="e.g. Rohan Sharma"
              className="w-full py-3 px-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Verification CTA */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={status === 'verifying'}
            >
              {status === 'verifying' ? 'Checking School Records...' : 'Verify Child'}
            </Button>
          </div>

          {/* Quick Prototype Testing Presets */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Prototype Test Presets:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => loadPreset('match')}
                className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-bold text-center"
              >
                Load Matching Record
              </button>
              <button
                type="button"
                onClick={() => loadPreset('mismatch')}
                className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-[11px] font-bold text-center"
              >
                Load Mismatch Record
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Sathi Avatar State Indicator */}
      <div className="mt-5 flex justify-center">
        <Avatar
          state={status === 'matched' ? 'celebrating' : status === 'mismatch' ? 'concerned' : 'idle'}
          size="sm"
        />
      </div>
    </div>
  );
};
