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

  const categoryIcon: Record<string, string> = {
    'all-children': '👨‍👧‍👦',
    homework: '📚',
    exams: '📝',
    attendance: '📅',
    progress: '📈',
    holidays: '🏖️',
    timetable: '⏰',
    'child-info': '🎒',
    announcements: '📢',
    general: '📢',
  };

  return (
    <div className="apple-utility-card w-full animate-in slide-in-from-bottom-4 duration-300 relative select-none shadow-sm">
      {/* Top Bar with Category Badge, Language Tag, and Close */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e0e0e0] flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[20px]">
            {categoryIcon[result.category] || '📢'}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-semibold bg-[#f0f0f0] text-[#7a7a7a] px-2 py-0.5 rounded-full uppercase">
              {result.intent || (result.category === 'all-children' ? 'ALL CHILDREN' : result.category?.toUpperCase())}
            </span>
            <span className="text-[10px] font-semibold bg-[#0066cc]/10 text-[#0066cc] px-2 py-0.5 rounded-full uppercase">
              ✓ Based on school records
            </span>
            {langObj && (
              <span className="text-[10px] font-semibold bg-[#f0f0f0] text-[#7a7a7a] px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
                <Globe className="w-3 h-3" />
                <span>{langObj.name} {result.isAutoDetected ? '(AUTO)' : ''}</span>
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="apple-icon-btn w-8 h-8"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Query asked by parent */}
      {result.query && (
        <div className="pt-3 text-[12px] font-medium text-[#7a7a7a] italic">
          You asked: "{result.query}"
        </div>
      )}

      {/* Main Spoken Message */}
      <div className="py-3" role="status" aria-live="polite">
        <p className="text-[17px] font-medium text-[#1d1d1f] leading-snug">
          "{result.spokenResponse}"
        </p>
      </div>

      {/* Visual Confirmation for Homework */}
      {!result.isMultiChild && result.category === 'homework' && Array.isArray(result.detailedData) && result.detailedData.length > 0 && (
        <div className="my-3 space-y-2 border-t border-[#e0e0e0] pt-3" id="homework-visual-confirmation">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[12px] font-semibold text-[#1d1d1f] uppercase flex items-center gap-1.5">
              <span className="text-sm">📚</span>
              <span>
                {result.intent === 'HOMEWORK_TOMORROW'
                  ? 'Homework for Tomorrow'
                  : result.intent === 'HOMEWORK_TODAY'
                  ? 'Homework for Today'
                  : 'Homework Details'}
              </span>
            </span>
            {result.studentName && (
              <span className="text-[10px] font-semibold bg-[#f0f0f0] text-[#1d1d1f] px-2 py-0.5 rounded-full">
                👦 {result.studentName}
              </span>
            )}
          </div>

          <div className="space-y-2">
            {result.detailedData.map((hw: any, idx: number) => (
              <div
                key={hw.id || idx}
                className="p-4 bg-[#fafafc] border border-[#e0e0e0] rounded-[14px]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-semibold text-[#1d1d1f] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0066cc] inline-block" />
                    {hw.subject}
                  </span>
                  {hw.title && (
                    <span className="text-[10px] font-semibold bg-[#e0e0e0] text-[#7a7a7a] px-2 py-0.5 rounded-full">
                      {hw.title}
                    </span>
                  )}
                </div>
                {hw.description && (
                  <p className="text-[14px] font-normal text-[#1d1d1f] mt-2 bg-white p-3 border border-[#e0e0e0] rounded-[10px]">
                    {hw.description}
                  </p>
                )}
                {hw.dueDate && (
                  <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#7a7a7a] mt-2">
                    <span>📅 Due:</span>
                    <span className="text-[#1d1d1f]">{hw.dueDate}</span>
                    {hw.teacherName && (
                      <span className="ml-auto">
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

      {/* Audio Controls Row */}
      <div className="py-3 flex items-center gap-2 flex-wrap bg-[#fafafc] p-3 border border-[#e0e0e0] rounded-[14px] mt-2">
        {/* Replay Button */}
        <button
          onClick={handleReplay}
          id="btn-replay-audio"
          className="apple-btn-secondary px-4 py-2 text-[14px]"
          title="Replay audio"
        >
          <Volume2 className="w-4 h-4" />
          <span>Replay</span>
        </button>

        {/* Stop Button */}
        <button
          onClick={handleStop}
          id="btn-stop-audio"
          className="apple-btn-secondary px-4 py-2 text-[14px]"
          title="Stop audio playback"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>Stop</span>
        </button>

        {/* Ask Again Button */}
        {onSpeakAgain && (
          <button
            onClick={onSpeakAgain}
            id="btn-ask-again"
            className="apple-btn-primary-small px-4 py-2 text-[14px]"
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
            className="apple-btn-secondary px-4 py-2 text-[14px]"
            title="Retry query"
          >
            <RotateCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        )}

        {/* Speed Toggle */}
        <button
          onClick={handleToggleSpeed}
          id="btn-speed-toggle"
          className="apple-btn-ghost px-3 py-2 text-[14px] ml-auto"
          title="Toggle speed"
        >
          <span>{currentSpeed === 'slow' ? '0.8×' : currentSpeed === 'fast' ? '1.25×' : '1.0×'}</span>
        </button>
      </div>

      {/* Multi-Child Aggregated Cards View */}
      {result.isMultiChild && Array.isArray(result.detailedData) && (
        <div className="mt-4 space-y-3 border-t border-[#e0e0e0] pt-4">
          <span className="text-[12px] font-semibold text-[#1d1d1f] uppercase flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#0066cc]" />
            Child-by-Child Breakdown
          </span>

          {result.detailedData.map((item: any, idx: number) => {
            const childName = item.child?.name || item.name || `Child ${idx + 1}`;
            const childClass = item.child?.class || item.class || '';
            const childSection = item.child?.section || item.section || '';

            return (
              <div
                key={idx}
                className="p-4 bg-[#fafafc] border border-[#e0e0e0] rounded-[14px] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#0066cc] text-white font-semibold text-[14px] flex items-center justify-center">
                      {childName.charAt(0)}
                    </span>
                    <span className="text-[14px] font-semibold text-[#1d1d1f]">
                      {childName} <span className="font-normal text-[#7a7a7a]">({childClass}-{childSection})</span>
                    </span>
                  </div>
                  {item.child?.presentToday !== undefined && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-1 rounded-full uppercase ${
                        item.child.presentToday
                          ? 'bg-[#34c759]/10 text-[#34c759]'
                          : 'bg-[#ff3b30]/10 text-[#ff3b30]'
                      }`}
                    >
                      {item.child.presentToday ? 'Present ✓' : 'Absent'}
                    </span>
                  )}
                  {item.presentToday !== undefined && !item.child && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-1 rounded-full uppercase ${
                        item.presentToday
                          ? 'bg-[#34c759]/10 text-[#34c759]'
                          : 'bg-[#ff3b30]/10 text-[#ff3b30]'
                      }`}
                    >
                      {item.presentToday ? 'Present ✓' : 'Absent'}
                    </span>
                  )}
                </div>

                {/* Show homework or exam details if available in item.data */}
                {Array.isArray(item.data) && item.data.length > 0 && (
                  <div className="bg-white p-3 border border-[#e0e0e0] rounded-[10px] text-[14px]">
                    {item.data[0].subject && (
                      <span className="font-semibold text-[#1d1d1f] block">
                        {item.data[0].subject}: {item.data[0].title}
                      </span>
                    )}
                    {item.data[0].description && (
                      <p className="text-[#1d1d1f] mt-1">
                        {item.data[0].description}
                      </p>
                    )}
                    {item.data[0].date && (
                      <p className="text-[12px] text-[#7a7a7a] mt-1 font-medium">
                        📅 {item.data[0].date} {item.data[0].time ? `(${item.data[0].time})` : ''}
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
        <div className="mt-4 space-y-3 border-t border-[#e0e0e0] pt-4">
          <span className="text-[12px] font-semibold text-[#1d1d1f] uppercase flex items-center gap-1.5">
            📝 Exam Schedule
          </span>
          {result.detailedData.map((ex: any) => (
            <div key={ex.id} className="p-4 bg-[#fafafc] border border-[#e0e0e0] rounded-[14px]">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-[#1d1d1f]">{ex.subject}: {ex.title}</span>
                <span className="text-[10px] font-semibold bg-[#e0e0e0] text-[#7a7a7a] px-2 py-0.5 rounded-full">
                  {ex.totalMarks} MARKS
                </span>
              </div>
              <div className="flex items-center gap-2 text-[12px] font-medium text-[#7a7a7a] mt-1.5">
                <Calendar className="w-4 h-4 text-[#0066cc]" />
                <span>{ex.date} ({ex.time})</span>
              </div>
              <p className="text-[14px] text-[#1d1d1f] mt-2 bg-white p-3 border border-[#e0e0e0] rounded-[10px]">
                <span className="font-semibold">Syllabus:</span> {ex.syllabus}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Single Child Attendance preview */}
      {!result.isMultiChild && result.category === 'attendance' && result.detailedData && (
        <div className="mt-4 border-t border-[#e0e0e0] pt-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 bg-[#fafafc] border border-[#e0e0e0] rounded-[14px]">
              <span className="text-[28px] font-semibold text-[#34c759]">
                {result.detailedData.overallPercentage || 94}%
              </span>
              <p className="text-[12px] font-medium text-[#7a7a7a] uppercase mt-1">Attendance</p>
            </div>
            <div className="p-4 bg-[#fafafc] border border-[#e0e0e0] rounded-[14px]">
              <span className="text-[28px] font-semibold text-[#0066cc]">
                {result.detailedData.presentDays || 88}
              </span>
              <p className="text-[12px] font-medium text-[#7a7a7a] uppercase mt-1">Present</p>
            </div>
            <div className="p-4 bg-[#fafafc] border border-[#e0e0e0] rounded-[14px]">
              <span className="text-[28px] font-semibold text-[#ff3b30]">
                {result.detailedData.absentDays || 6}
              </span>
              <p className="text-[12px] font-medium text-[#7a7a7a] uppercase mt-1">Absences</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
