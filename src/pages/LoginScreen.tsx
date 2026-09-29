import React, { useState } from 'react';
import { ArrowLeft, Phone, ShieldCheck, CheckCircle2, Sparkles, KeyRound } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Avatar } from '../components/avatar/Avatar';
import { LanguageCode, ScreenId, Parent } from '../types';
import { AuthService } from '../services/authService';
import { SpeechService } from '../services/speechService';
import { MOCK_PARENTS } from '../data/mockData';

interface LoginScreenProps {
  language: LanguageCode;
  onNavigate: (screen: ScreenId) => void;
  onLoginSuccess: (parent: Parent) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  language,
  onNavigate,
  onLoginSuccess,
}) => {
  const [mobile, setMobile] = useState('9876543210');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState(['1', '2', '3', '4']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const res = await AuthService.requestOtp(mobile);
    setIsLoading(false);

    if (res.success) {
      setStep('otp');
      SpeechService.speak(`आपके मोबाइल पर 4 अंकों का सुरक्षा कोड भेजा गया है।`, language);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMsg('');
    setIsLoading(true);
    const enteredOtp = otp.join('');

    const res = await AuthService.verifyOtp(mobile, enteredOtp, undefined, language);
    setIsLoading(false);

    if (res.success && res.parent) {
      SpeechService.speak(`लॉगिन सफल रहा! नमस्ते ${res.parent.name.split(' ')[0]} जी।`, language);
      onLoginSuccess(res.parent);
      onNavigate('main-companion');
    } else {
      setErrorMsg(res.error || 'Invalid OTP code.');
    }
  };

  const quickLoginAs = (parent: Parent) => {
    setMobile(parent.mobile);
    setOtp(['1', '2', '3', '4']);
    setStep('otp');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => (step === 'otp' ? setStep('phone') : onNavigate('welcome'))}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-2 rounded-xl border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
          Parent Login
        </span>
      </div>

      {/* Screen Title */}
      <div className="text-center mb-5">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 mx-auto mb-2 shadow-xs">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {step === 'phone' ? 'Login to SchoolSathi' : 'Enter 4-Digit Code'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {step === 'phone'
            ? 'Access your linked children and school updates'
            : `Code sent to +91 ${mobile}`}
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center">
          {errorMsg}
        </div>
      )}

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="bg-white p-5 rounded-3xl shadow-sm border border-orange-100 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Mobile Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-sm">
                +91
              </div>
              <input
                type="tel"
                maxLength={10}
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit number"
                className="w-full pl-14 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-lg font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none tracking-wider"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              We verify your number via OTP to ensure child data privacy.
            </p>
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth disabled={isLoading}>
            {isLoading ? 'Sending SMS...' : 'Send OTP Code'}
          </Button>

          {/* Prototype Demo Fast Accounts */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Select Test Parent Account:
            </span>
            <div className="space-y-2">
              {MOCK_PARENTS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => quickLoginAs(p)}
                  className="w-full p-2.5 rounded-2xl border border-slate-200 hover:border-orange-300 bg-slate-50 hover:bg-orange-50/50 flex items-center justify-between text-left transition-all"
                >
                  <div>
                    <span className="text-xs font-extrabold text-slate-800 block">
                      {p.name} ({p.relationship || 'Parent'})
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Mobile: +91 {p.mobile} • {p.children.length} Children
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-orange-600 bg-white px-2 py-1 rounded-lg border border-slate-200">
                    Use
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              New to SchoolSathi?{' '}
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="font-bold text-orange-600 underline cursor-pointer"
              >
                Register here
              </button>
            </p>
          </div>
        </form>
      ) : (
        /* OTP Step */
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100 text-center space-y-4">
          <div className="flex justify-center gap-3 my-2">
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
                className="w-14 h-14 text-center text-2xl font-black bg-slate-50 border-2 border-orange-300 rounded-2xl focus:bg-white focus:border-orange-500 focus:outline-none shadow-xs"
              />
            ))}
          </div>

          <p className="text-xs text-slate-500">
            For prototype testing, default code is <span className="font-bold text-orange-700">1234</span>
          </p>

          <Button
            type="button"
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleVerifyOtp}
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify & Log In'}
          </Button>

          <button
            type="button"
            onClick={() => SpeechService.speak('सुरक्षा कोड 1 2 3 4 है।', language)}
            className="text-xs text-orange-600 font-bold underline"
          >
            Resend OTP code
          </button>
        </div>
      )}

      {/* Trust banner */}
      <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Strict data privacy: Only your verified children are shown</span>
      </div>
    </div>
  );
};
