import React, { useState } from 'react';
import { ArrowLeft, Shield, Phone, User, CheckCircle2, Volume2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { LanguageCode, ScreenId } from '../types';
import { TRANSLATIONS } from '../data/languages';
import { SpeechService } from '../services/speechService';
import { AuthService } from '../services/authService';

interface ParentRegistrationScreenProps {
  language: LanguageCode;
  onNavigate: (screen: ScreenId) => void;
  onSaveParentDetails?: (name: string, phone: string, relation: string) => void;
}

export const ParentRegistrationScreen: React.FC<ParentRegistrationScreenProps> = ({
  language,
  onNavigate,
  onSaveParentDetails,
}) => {
  const t = TRANSLATIONS[language];
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [fullName, setFullName] = useState('Rajesh Sharma');
  const [relationship, setRelationship] = useState<'Mother' | 'Father' | 'Guardian'>('Father');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otp, setOtp] = useState(['5', '6', '7', '8']);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length >= 10) {
      setStep('otp');
      SpeechService.speak('आपके फोन पर 4 अंकों का सुरक्षा कोड भेजा गया है।', language);
    }
  };

  const handleVerifyOtp = async () => {
    const res = await AuthService.verifyOtp(phoneNumber, otp.join(''), fullName, language);
    if (res.parent) {
      AuthService.updateParentProfile(res.parent.id, { relationship });
      if (onSaveParentDetails) {
        onSaveParentDetails(fullName, phoneNumber, relationship);
      }
    }
    SpeechService.speak('सत्यापन सफल रहा! अब अपने बच्चे का स्कूल चुनें।', language);
    onNavigate('select-school');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => (step === 'otp' ? setStep('form') : onNavigate('language'))}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-2 rounded-xl border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
          Step 2 of 5
        </span>
      </div>

      {/* Screen Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {t.parentRegistrationTitle}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {t.parentRegistrationSub}
        </p>
      </div>

      {step === 'form' ? (
        <form onSubmit={handleSendOtp} className="space-y-4 bg-white p-5 rounded-3xl shadow-sm border border-orange-100">
          {/* Mobile Number Field */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              {t.mobileNumberLabel} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                <span>+91</span>
              </div>
              <input
                type="tel"
                maxLength={10}
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder={t.mobilePlaceholder}
                className="w-full pl-14 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-lg font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none transition-colors tracking-wider"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              We will send a one-time verification SMS to this number.
            </p>
          </div>

          {/* Parent Full Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              {t.parentNameLabel} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t.parentNamePlaceholder}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Relation to Child */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {t.relationshipLabel}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: t.father, val: 'Father', icon: '👨' },
                { label: t.mother, val: 'Mother', icon: '👩' },
                { label: t.guardian, val: 'Guardian', icon: '🤝' },
              ].map((r) => (
                <button
                  type="button"
                  key={r.val}
                  onClick={() => setRelationship(r.val as any)}
                  className={`py-3 px-2 rounded-2xl border-2 font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-95 ${
                    relationship === r.val
                      ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">{r.icon}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <Button type="submit" variant="primary" size="lg" fullWidth>
              {t.sendOtp}
            </Button>
          </div>
        </form>
      ) : (
        /* OTP Step */
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              {t.enterOtp}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Code sent to <span className="font-bold text-slate-800">+91 {phoneNumber}</span>
            </p>
          </div>

          {/* 4 digit OTP Boxes */}
          <div className="flex justify-center gap-3 my-4">
            {otp.map((digit, i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => {
                  const newOtp = [...otp];
                  newOtp[i] = e.target.value;
                  setOtp(newOtp);
                }}
                className="w-14 h-14 text-center text-2xl font-black bg-slate-50 border-2 border-orange-300 rounded-2xl focus:bg-white focus:border-orange-600 focus:outline-none shadow-xs"
              />
            ))}
          </div>

          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleVerifyOtp}
          >
            {t.verifyAndContinue}
          </Button>

          <p className="text-xs text-slate-400">
            Didn't receive code?{' '}
            <button
              type="button"
              onClick={() => SpeechService.speak('नया कोड भेजा गया है: 5 6 7 8', language)}
              className="text-orange-600 font-bold underline cursor-pointer"
            >
              Resend SMS
            </button>
          </p>
        </div>
      )}

      {/* Trust & Privacy assurance */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
        <Shield className="w-4 h-4 text-emerald-600" />
        <span>Your data is strictly confidential and school verified</span>
      </div>
    </div>
  );
};
