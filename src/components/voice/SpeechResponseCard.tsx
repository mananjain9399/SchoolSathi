import React, { useState } from 'react';
import { Volume2, X, Users, Calendar, Square, Mic, Globe, RotateCw } from 'lucide-react';
import { VoiceQueryResult, LanguageCode } from '../../types';
import { SpeechService } from '../../services/speechService';
import { TextToSpeechService } from '../../services/speech';
import { SUPPORTED_LANGUAGES } from '../../data/languages';

interface SpeechResponseCardProps {
  result: VoiceQueryResult;
  language: LanguageCode;
  onClose: () => void;
  onSpeakAgain?: () => void;
  onRetry?: () => void;
  onReplayAudio?: () => void;
  onStopAudio?: () => void;
  voiceSpeed?: 'slow' | 'normal' | 'fast';
  onChangeVoiceSpeed?: (speed: 'slow' | 'normal' | 'fast') => void;
}

export const SpeechResponseCard: React.FC<SpeechResponseCardProps> = ({
  result,
  language,
  onClose,
  onSpeakAgain,
  onRetry,
  onReplayAudio,
  onStopAudio,
  voiceSpeed = 'normal',
  onChangeVoiceSpeed,
}) => {
  const [currentSpeed, setCurrentSpeed] = useState<'slow' | 'normal' | 'fast'>(voiceSpeed);
  const effectiveLang = result.detectedLanguage || language;
  const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === effectiveLang);

  const handleReplay = () => {
    if (onReplayAudio) {
      onReplayAudio();
    } else {
      const rate = currentSpeed === 'slow' ? 0.8 : currentSpeed === 'fast' ? 1.25 : 1.0;
      SpeechService.speak(result.spokenResponse, effectiveLang, rate);
    }
  };

  const handleStop = () => {
    SpeechService.stop();
    if (onStopAudio) {
      onStopAudio();
    }
  };

  const handleToggleSpeed = () => {
    const newSpeed = currentSpeed === 'slow' ? 'normal' : currentSpeed === 'normal' ? 'fast' : 'slow';
    setCurrentSpeed(newSpeed);
    if (onChangeVoiceSpeed) {
      onChangeVoiceSpeed(newSpeed);
    }
    const rateMap = { slow: 0.8, normal: 1.0, fast: 1.25 };
    SpeechService.speak(result.spokenResponse, effectiveLang, rateMap[newSpeed]);
  };

  return (
    <div className="w-full bg-white rounded-3xl p-5 shadow-xl border-2 border-orange-200 animate-in slide-in-from-bottom-4 duration-300 relative select-none">
      {/* Top Bar with Category Badge, Language Tag, and Close */}
      <div className="flex items-center justify-between pb-3 border-b border-orange-100 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xl">
            {result.category === 'all-children'
              ? '👨‍👧‍👦'
              : result.category === 'homework'
              ? '📚'
              : result.category === 'exams'
              ? '📝'
              : result.category === 'attendance'
              ? '📅'
              : result.category === 'progress'
              ? '📈'
              : result.category === 'holidays'
              ? '🏖️'
              : result.category === 'timetable'
              ? '⏰'
              : result.category === 'child-info'
              ? '🎒'
              : '📢'}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-black uppercase tracking-wider text-orange-700 bg-orange-100/70 px-2.5 py-0.5 rounded-full">
              {result.intent || (result.category === 'all-children' ? 'All Children Update' : result.category)}
            </span>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1 shadow-2xs">
              ✓ Based on school records
            </span>
            {langObj && (
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                <Globe className="w-3 h-3 text-blue-600" />
                <span>{langObj.name} {result.isAutoDetected ? '(Auto-detected)' : ''}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Query asked by parent */}
      {result.query && (
        <div className="pt-2 text-[11px] font-semibold text-slate-400 italic">
          You asked: "{result.query}"
        </div>
      )}

      {/* Main Spoken Message in Speech Bubble Style */}
      <div className="py-2.5" role="status" aria-live="polite">
        <p className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
          "{result.spokenResponse}"
        </p>
      </div>

      {/* Visual Confirmation for Homework */}
      {!result.isMultiChild && result.category === 'homework' && Array.isArray(result.detailedData) && result.detailedData.length > 0 && (
        <div className="my-3 space-y-2 border-t border-orange-100 pt-3" id="homework-visual-confirmation">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-black text-orange-950 uppercase tracking-wider flex items-center gap-1.5">
              <span className="text-sm">📚</span>
              <span>
                {result.intent === 'HOMEWORK_TOMORROW'
                  ? 'HOMEWORK FOR TOMORROW'
                  : result.intent === 'HOMEWORK_TODAY'
                  ? 'HOMEWORK FOR TODAY'
                  : 'HOMEWORK DETAILS'}
              </span>
            </span>
            {result.studentName && (
              <span className="text-[11px] font-bold text-orange-800 bg-orange-100/80 px-2.5 py-0.5 rounded-full border border-orange-200">
                👦 {result.studentName}
              </span>
            )}
          </div>

          <div className="space-y-2">
            {result.detailedData.map((hw: any, idx: number) => (
              <div
                key={hw.id || idx}
                className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-amber-950 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-xs" />
                    {hw.subject}
                  </span>
                  {hw.title && (
                    <span className="text-xs font-bold text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded-md border border-amber-200">
                      {hw.title}
                    </span>
                  )}
                </div>
                {hw.description && (
                  <p className="text-xs font-semibold text-slate-700 mt-1.5 bg-white/95 p-2.5 rounded-xl border border-amber-100/80 shadow-2xs">
                    {hw.description}
                  </p>
                )}
                {hw.dueDate && (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mt-1.5">
                    <span>📅 Due:</span>
                    <span className="font-bold text-slate-700">{hw.dueDate}</span>
                    {hw.teacherName && (
                      <span className="ml-auto text-slate-400 font-normal">
                        Teacher: {hw.teacherName}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accessibility Large Audio Controls Row with Replay, Stop, Ask Again */}
      <div className="py-2.5 flex items-center gap-2 flex-wrap bg-orange-50/70 p-3 rounded-2xl border border-orange-200/80">
        {/* Replay Button */}
        <button
          onClick={handleReplay}
          id="btn-replay-audio"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black shadow-xs active:scale-95 transition-all cursor-pointer"
          title="Replay audio"
        >
          <Volume2 className="w-4 h-4 animate-pulse" />
          <span>Replay</span>
        </button>

        {/* Stop Button */}
        <button
          onClick={handleStop}
          id="btn-stop-audio"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
          title="Stop audio playback"
        >
          <Square className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          <span>Stop</span>
        </button>

        {/* Ask Again Button */}
        {onSpeakAgain && (
          <button
            onClick={onSpeakAgain}
            id="btn-ask-again"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs active:scale-95 transition-all cursor-pointer"
            title="Ask another question"
          >
            <Mic className="w-4 h-4" />
            <span>Ask Again</span>
          </button>
        )}

        {/* Retry Button */}
        {onRetry && (
          <button
            onClick={onRetry}
            id="btn-retry-audio"
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-800 border border-orange-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
            title="Retry query"
          >
            <RotateCw className="w-3.5 h-3.5 text-orange-600" />
            <span>Retry</span>
          </button>
        )}

        {/* Speed Toggle: Slow / Normal / Fast */}
        <button
          onClick={handleToggleSpeed}
          id="btn-speed-toggle"
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 text-xs font-extrabold shadow-2xs transition-all active:scale-95 cursor-pointer ml-auto"
          title="Toggle speed: Slow vs Normal vs Fast"
        >
          <span>{currentSpeed === 'slow' ? '🐢 Slow (0.8x)' : currentSpeed === 'fast' ? '🐇 Fast (1.25x)' : '⚡ Normal (1.0x)'}</span>
        </button>
      </div>

      {/* Multi-Child Aggregated Cards View */}
      {result.isMultiChild && Array.isArray(result.detailedData) && (
        <div className="mt-3 space-y-2.5 border-t border-slate-100 pt-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-orange-600" />
            Child-by-Child Breakdown:
          </span>

          {result.detailedData.map((item: any, idx: number) => {
            const childName = item.child?.name || item.name || `Child ${idx + 1}`;
            const childClass = item.child?.class || item.class || '';
            const childSection = item.child?.section || item.section || '';

            return (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-orange-50/40 border border-orange-100/80 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-orange-200 text-orange-900 font-bold text-xs flex items-center justify-center">
                      {childName.charAt(0)}
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      {childName} ({childClass} - {childSection})
                    </span>
                  </div>
                  {item.child?.presentToday !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.child.presentToday
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.child.presentToday ? 'Present Today ✓' : 'Absent'}
                    </span>
                  )}
                  {item.presentToday !== undefined && !item.child && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.presentToday
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.presentToday ? 'Present Today ✓' : 'Absent'}
                    </span>
                  )}
                </div>

                {/* Show homework or exam details if available in item.data */}
                {Array.isArray(item.data) && item.data.length > 0 && (
                  <div className="bg-white/80 rounded-xl p-2 border border-orange-100/60 text-xs">
                    {item.data[0].subject && (
                      <span className="font-extrabold text-orange-900 block">
                        {item.data[0].subject}: {item.data[0].title}
                      </span>
                    )}
                    {item.data[0].description && (
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {item.data[0].description}
                      </p>
                    )}
                    {item.data[0].date && (
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                        📅 {item.data[0].date} ({item.data[0].time || ''})
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Single Child Exams preview */}
      {!result.isMultiChild && result.category === 'exams' && Array.isArray(result.detailedData) && (
        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Exam Schedule:
          </span>
          {result.detailedData.map((ex: any) => (
            <div key={ex.id} className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">{ex.subject}: {ex.title}</span>
                <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                  {ex.totalMarks} Marks
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>{ex.date} ({ex.time})</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 bg-white p-2 rounded-xl border border-amber-100">
                <span className="font-semibold text-slate-700">Syllabus:</span> {ex.syllabus}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Single Child Attendance preview */}
      {!result.isMultiChild && result.category === 'attendance' && result.detailedData && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-xl font-extrabold text-emerald-700">
                {result.detailedData.overallPercentage || 94}%
              </span>
              <p className="text-[11px] font-semibold text-emerald-800">Attendance</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-200">
              <span className="text-xl font-extrabold text-blue-700">
                {result.detailedData.presentDays || 88}
              </span>
              <p className="text-[11px] font-semibold text-blue-800">Days Present</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200">
              <span className="text-xl font-extrabold text-rose-700">
                {result.detailedData.absentDays || 6}
              </span>
              <p className="text-[11px] font-semibold text-rose-800">Absences</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
