import React from 'react';
import {
  Globe,
  Volume2,
  Users,
  Shield,
  LogOut,
  ChevronRight,
  Plus,
  User,
  Trash2,
  KeyRound,
} from 'lucide-react';
import { LanguageCode, ScreenId, Student, Parent, AvatarPersona } from '../types';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '../data/languages';
import { SpeechService } from '../services/speechService';
import { MOCK_PARENTS } from '../data/mockData';
import { Avatar } from '../components/avatar/Avatar';
import { VoiceSettingsCard } from '../components/voice/VoiceSettingsCard';

interface SettingsScreenProps {
  language: LanguageCode;
  onOpenLanguageModal: () => void;
  onSelectLanguage?: (code: LanguageCode) => void;
  voiceSpeed: 'slow' | 'normal' | 'fast';
  onChangeVoiceSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
  students: Student[];
  onNavigate: (screen: ScreenId) => void;
  parent: Parent;
  onLogout: () => void;
  onUnlinkChild?: (childId: string) => void;
  onSwitchAccount?: (parent: Parent) => void;
  autoDetectLanguage?: boolean;
  onToggleAutoDetectLanguage?: () => void;
  avatarPersona?: AvatarPersona;
  onChangeAvatarPersona?: (persona: AvatarPersona) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  language,
  onOpenLanguageModal,
  onSelectLanguage,
  voiceSpeed,
  onChangeVoiceSpeed,
  autoSpeak,
  onToggleAutoSpeak,
  students,
  onNavigate,
  parent,
  onLogout,
  onUnlinkChild,
  onSwitchAccount,
  autoDetectLanguage = true,
  onToggleAutoDetectLanguage,
  avatarPersona = 'auto',
  onChangeAvatarPersona,
}) => {
  const t = TRANSLATIONS[language];
  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const handleTestVoice = () => {
    const rate = voiceSpeed === 'slow' ? 0.75 : 0.95;
    SpeechService.speak(
      `नमस्ते! आवाज़ की गति ${voiceSpeed === 'slow' ? 'धीमी और स्पष्ट' : 'सामान्य'} पर सेट है।`,
      language,
      rate
    );
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-24 space-y-4">
      {/* Title */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-black text-slate-900">{t.settings}</h2>
        <p className="text-xs text-slate-500 mt-0.5">Customize your SchoolSathi experience</p>
      </div>

      {/* 1. Parent Profile Card */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-5 text-white shadow-md shadow-orange-500/20 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl text-white">
              {parent.name.charAt(0)}
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/80 block">
                Parent Account ({parent.relationship || 'Father'})
              </span>
              <h3 className="text-lg font-black">{parent.name}</h3>
              <p className="text-xs text-white/90 font-medium">
                📱 +91 {parent.mobile}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-2.5 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-xs">
              {students.length} {students.length === 1 ? 'Child' : 'Children'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Language Settings Card */}
      <div className="bg-white rounded-3xl p-4 border border-orange-100 shadow-sm space-y-3">
        <div
          onClick={onOpenLanguageModal}
          className="flex items-center justify-between cursor-pointer hover:bg-orange-50/50 p-1.5 -m-1.5 rounded-2xl transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Preferred Language
              </span>
              <h4 className="text-sm font-black text-slate-900">
                {currentLang.name} ({currentLang.englishName})
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-1 text-orange-600 font-bold text-xs bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200">
            <span>Change</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Quick Language Selector Grid */}
        <div className="pt-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Select Language
          </label>
          <div className="grid grid-cols-4 gap-2">
            {SUPPORTED_LANGUAGES.map((l) => {
              const isSelected = l.code === language;
              return (
                <button
                  key={l.code}
                  id={`settings-lang-btn-${l.code}`}
                  onClick={() => {
                    if (onSelectLanguage) {
                      onSelectLanguage(l.code);
                      SpeechService.speak(l.greeting, l.code);
                    } else {
                      onOpenLanguageModal();
                    }
                  }}
                  className={`py-2 px-1 rounded-xl text-center transition-all border ${
                    isSelected
                      ? 'bg-orange-500 text-white border-orange-600 shadow-sm font-black'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 font-bold'
                  }`}
                >
                  <div className="text-[13px] leading-tight">{l.name}</div>
                  <div
                    className={`text-[10px] mt-0.5 truncate ${
                      isSelected ? 'text-white/90' : 'text-slate-400'
                    }`}
                  >
                    {l.englishName}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Auto Language Detection Toggle */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="pr-2">
            <span className="text-xs font-bold text-slate-800 block">
              Automatic Language Detection
            </span>
            <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
              Automatically reply in whichever language you speak (Hindi, English, Marathi, Punjabi, Bengali, Tamil, Telugu, Gujarati)
            </span>
          </div>

          {onToggleAutoDetectLanguage && (
            <button
              onClick={onToggleAutoDetectLanguage}
              className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                autoDetectLanguage ? 'bg-orange-500' : 'bg-slate-300'
              }`}
              title="Toggle automatic language detection"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  autoDetectLanguage ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* 3. Upgraded Voice Settings: Gender, Speed, Style, Preview */}
      <VoiceSettingsCard
        language={language}
        onSettingsChanged={(newSettings) => {
          onChangeVoiceSpeed(newSettings.speed);
        }}
      />

      {/* Auto Speak Answers Toggle */}
      <div className="bg-white rounded-3xl p-4 border border-orange-100 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-800 block">Auto Speak Answers</span>
          <span className="text-[11px] text-slate-500">Read every response out loud automatically</span>
        </div>

        <button
          onClick={onToggleAutoSpeak}
          className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
            autoSpeak ? 'bg-orange-500' : 'bg-slate-300'
          }`}
          aria-label="Toggle Auto Speak"
        >
          <div
            className={`w-5 h-5 rounded-full bg-white transition-transform ${
              autoSpeak ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* 3.5. AI Companion Avatar Persona Settings Card */}
      <div className="bg-white rounded-3xl p-4 border border-orange-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-lg">
              ✨
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                AI Companion Avatar (साथी अवतार)
              </h4>
              <p className="text-[11px] text-slate-500">
                {language === 'hi'
                  ? 'अपने परिवार के लिए मनपसंद साथी चुनें'
                  : 'Personalize the companion for your child'}
              </p>
            </div>
          </div>
        </div>

        {/* Live Preview & Persona Selector */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-orange-50/50 p-3 rounded-2xl border border-orange-100/80">
          <div className="shrink-0 flex flex-col items-center">
            <Avatar
              state="happy"
              persona={avatarPersona}
              currentStudent={students[0] || null}
              size="sm"
              showStateBadge={false}
            />
            <span className="text-[11px] font-bold text-orange-950 mt-1 capitalize">
              {avatarPersona === 'auto'
                ? `✨ Auto (${students[0]?.gender === 'female' ? 'Ananya' : 'Veer'})`
                : avatarPersona === 'boy'
                ? '👦 Veer'
                : avatarPersona === 'girl'
                ? '👧 Ananya'
                : '🦉 Sathi'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 w-full">
            {[
              { id: 'auto', label: '✨ Auto', sub: 'Matches child' },
              { id: 'neutral', label: '🦉 Sathi', sub: 'Family Birdie' },
              { id: 'boy', label: '👦 Veer', sub: 'Boy Companion' },
              { id: 'girl', label: '👧 Ananya', sub: 'Girl Companion' },
            ].map((p) => {
              const isSelected = avatarPersona === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onChangeAvatarPersona?.(p.id as AvatarPersona)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-orange-500 bg-orange-500 text-white shadow-xs font-bold'
                      : 'border-slate-200 bg-white hover:border-orange-200 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold leading-tight">{p.label}</div>
                  <div
                    className={`text-[10px] ${
                      isSelected ? 'text-orange-100' : 'text-slate-400'
                    }`}
                  >
                    {p.sub}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Manage Linked Children */}
      <div className="bg-white rounded-3xl p-4 border border-orange-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-600" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Linked Children ({students.length})
            </h4>
          </div>

          <button
            onClick={() => onNavigate('verify-child')}
            className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-2.5 py-1 rounded-xl border border-orange-200 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Verify & Link Child</span>
          </button>
        </div>

        {students.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-50 text-center text-xs text-slate-500">
            No children currently linked. Click 'Verify & Link Child' above.
          </div>
        ) : (
          <div className="space-y-2">
            {students.map((child) => (
              <div
                key={child.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-bold text-xs">
                    {(child.name || child.fullName || 'C').charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {child.name || child.fullName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {child.class || child.grade} - Section {child.section} (ID: {child.studentId})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                  {onUnlinkChild && (
                    <button
                      onClick={() => onUnlinkChild(child.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Unlink child"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Access Control Test: Switch Parent Account */}
      {onSwitchAccount && (
        <div className="bg-white rounded-3xl p-4 border border-orange-100 shadow-sm space-y-2.5">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-orange-600" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Prototype Account Switching (Data Isolation Test)
            </h4>
          </div>
          <p className="text-[11px] text-slate-500">
            Switch accounts to verify student data privacy between parents:
          </p>

          <div className="grid grid-cols-2 gap-2">
            {MOCK_PARENTS.map((p) => {
              const isCurrent = p.id === parent.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSwitchAccount(p)}
                  className={`p-2.5 rounded-2xl border text-left text-xs font-bold transition-all ${
                    isCurrent
                      ? 'border-orange-500 bg-orange-50 text-orange-950 ring-1 ring-orange-300'
                      : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-700'
                  }`}
                >
                  <span className="block truncate">{p.name}</span>
                  <span className="text-[10px] font-medium text-slate-500">
                    {p.children.length} Children {isCurrent ? '• Active' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Security Note */}
      <div className="p-3.5 rounded-3xl bg-slate-100 border border-slate-200 flex items-center gap-3">
        <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <p className="text-[11px] text-slate-600 leading-snug">
          Connected to official school ERP records. Data is isolated per authenticated parent mobile number.
        </p>
      </div>

      {/* 7. Logout Button */}
      <div className="pt-2">
        <button
          onClick={onLogout}
          className="w-full py-3.5 rounded-2xl border-2 border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-700 text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer shadow-xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout (Clear Session)</span>
        </button>
      </div>
    </div>
  );
};
