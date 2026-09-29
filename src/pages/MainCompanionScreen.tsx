import React, { useState, useEffect } from 'react';
import {
  Globe,
  ChevronDown,
  Sparkles,
  Volume2,
  Users,
  Plus,
  MessageSquare,
  History,
  X,
  Check,
} from 'lucide-react';
import { Avatar } from '../components/avatar/Avatar';
import { CompanionSelector } from '../components/avatar/CompanionSelector';
import { VoiceInputBar } from '../components/voice/VoiceInputBar';
import { SpeechResponseCard } from '../components/voice/SpeechResponseCard';
import { VoiceSettingsModal } from '../components/voice/VoiceSettingsModal';
import { VoiceService } from '../services/voice/VoiceService';
import {
  Student,
  AvatarState,
  AvatarPersona,
  LanguageCode,
  VoiceQueryResult,
  ScreenId,
} from '../types';
import { TRANSLATIONS, SUPPORTED_LANGUAGES } from '../data/languages';
import { SpeechService } from '../services/speechService';
import { SpeechRecognitionError } from '../services/speech';
import { AIAssistantService, ConversationTurn, ProcessingStage } from '../services/aiAssistantService';

interface MainCompanionScreenProps {
  students: Student[];
  currentStudent: Student | null;
  selectedStudentId: string;
  onSelectStudent: (id: string) => void;
  language: LanguageCode;
  onOpenLanguageModal: () => void;
  onNavigate: (screen: ScreenId) => void;
  parentName?: string;
  voiceSpeed?: 'slow' | 'normal' | 'fast';
  onChangeVoiceSpeed?: (speed: 'slow' | 'normal' | 'fast') => void;
  autoDetectLanguage?: boolean;
  onToggleAutoDetectLanguage?: () => void;
  onLanguageChange?: (lang: LanguageCode) => void;
  avatarPersona?: AvatarPersona;
  onChangeAvatarPersona?: (persona: AvatarPersona) => void;
}

export const MainCompanionScreen: React.FC<MainCompanionScreenProps> = ({
  students,
  currentStudent,
  selectedStudentId,
  onSelectStudent,
  language,
  onOpenLanguageModal,
  onNavigate,
  parentName = 'Parent',
  voiceSpeed = 'normal',
  onChangeVoiceSpeed,
  autoDetectLanguage = true,
  onToggleAutoDetectLanguage,
  onLanguageChange,
  avatarPersona = 'auto',
  onChangeAvatarPersona,
}) => {
  const t = TRANSLATIONS[language];
  const isAllMode = selectedStudentId === 'all' || !currentStudent;
  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  // Avatar state & persona
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [companionPersona, setCompanionPersona] = useState<AvatarPersona>(avatarPersona || 'auto');

  useEffect(() => {
    if (avatarPersona) {
      setCompanionPersona(avatarPersona);
    }
  }, [avatarPersona]);

  const [isListening, setIsListening] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string>('');
  const [voiceResult, setVoiceResult] = useState<VoiceQueryResult | null>(null);
  const [showChildDropdown, setShowChildDropdown] = useState(false);
  const [showRecentHistory, setShowRecentHistory] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [showVoiceSettingsModal, setShowVoiceSettingsModal] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState(() => VoiceService.getSettings());

  useEffect(() => {
    return VoiceService.subscribe((newSettings) => {
      setVoiceSettings(newSettings);
      if (onChangeVoiceSpeed) {
        onChangeVoiceSpeed(newSettings.speed);
      }
    });
  }, [onChangeVoiceSpeed]);

  // Update history on mount or turn completion
  const refreshHistory = () => {
    setConversationHistory(AIAssistantService.getConversationHistory());
  };

  useEffect(() => {
    refreshHistory();
  }, []);

  // Reset speech and avatar state when student switches
  useEffect(() => {
    setVoiceResult(null);
    setAvatarState('happy');
    const timer = setTimeout(() => setAvatarState('idle'), 1500);
    return () => clearTimeout(timer);
  }, [selectedStudentId]);

  // Handle listening trigger
  const handleStartListening = () => {
    SpeechService.stop();
    setIsListening(true);
    setAvatarState('listening');
  };

  const handleStopListening = () => {
    setIsListening(false);
    setAvatarState((prev) => (prev === 'listening' ? 'idle' : prev));
  };

  const handleCancelListening = () => {
    SpeechService.stop();
    setIsListening(false);
    setAvatarState('idle');
    setLoadingStage(null);
  };

  const handleMicrophoneError = (error: SpeechRecognitionError) => {
    setIsListening(false);
    setAvatarState('concerned');
    setLoadingStage(null);
  };

  /**
   * Unified Voice AI Assistant Pipeline:
   * Speech-to-text → Intent detection → Student identification → School data retrieval → Spoken response → Avatar animation
   * STATES: IDLE → LISTENING → THINKING → SPEAKING → HAPPY → IDLE
   */
  const handleProcessVoiceQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    SpeechService.stop();
    setIsListening(false);
    setAvatarState('thinking');
    setLastQuery(queryText);
    setLoadingStage('Understanding...');

    try {
      const response = await AIAssistantService.processVoiceQuery(
        queryText,
        students,
        language,
        isAllMode ? null : currentStudent,
        {
          autoDetectLanguage,
          voiceSpeed,
          preferredLanguage: language,
          onProgress: (stage: ProcessingStage) => {
            if (stage === 'understanding') {
              setLoadingStage('Understanding...');
            } else if (stage === 'checking_records') {
              setLoadingStage('Checking school records...');
            } else if (stage === 'preparing_response') {
              setLoadingStage('Preparing response...');
            } else {
              setLoadingStage(null);
            }
          },
        }
      );

      if (response.switchChildId) {
        onSelectStudent(response.switchChildId);
      }

      const categoryMap: Record<string, any> = {
        HOMEWORK_TODAY: 'homework',
        HOMEWORK_TOMORROW: 'homework',
        EXAM_SCHEDULE: 'exams',
        ATTENDANCE: 'attendance',
        ACADEMIC_PROGRESS: 'progress',
        HOLIDAY_INFORMATION: 'holidays',
        SCHOOL_ANNOUNCEMENT: 'announcements',
        TIMETABLE: 'timetable',
        CHILD_INFORMATION: 'child-info',
        GENERAL_SCHOOL_INFORMATION: 'general',
        UNCLEAR_INPUT: 'general',
      };

      const result: VoiceQueryResult = {
        query: response.query,
        category: response.isMultiChild
          ? 'all-children'
          : (categoryMap[response.intent] || 'general'),
        spokenResponse: response.spokenResponse,
        avatarMood: response.avatarMood,
        detailedData: response.detailedData,
        isMultiChild: response.isMultiChild,
        intent: response.intent,
        studentName: response.studentName,
        detectedLanguage: response.detectedLanguage,
        isAutoDetected: response.isAutoDetected,
      };

      setVoiceResult(result);
      setLoadingStage(null);

      // SPEAKING state while TTS plays
      setAvatarState('speaking');
      refreshHistory();

      const speechLang = response.detectedLanguage || language;
      await AIAssistantService.speakResponse(response.spokenResponse, speechLang, voiceSpeed);

      // After speech: HAPPY briefly, then final resting mood
      const finalMood = response.avatarMood;
      setAvatarState('happy');
      const moodTimer = setTimeout(() => {
        setAvatarState(finalMood === 'happy' || finalMood === 'celebrating' ? 'idle' : finalMood);
        // If concerned/error, auto-recover to idle after 3s
        if (finalMood === 'concerned' || finalMood === 'error') {
          setTimeout(() => setAvatarState('idle'), 3000);
        }
      }, 1500);
      return () => clearTimeout(moodTimer);
    } catch (err) {
      setLoadingStage(null);
      console.error('AI voice query processing error:', err);
      // ERROR state briefly, then IDLE
      setAvatarState('error');
      const errorMsg =
        language === 'hi'
          ? 'मैं अभी स्कूल रिकॉर्ड्स एक्सेस नहीं कर सका। कृपया दोबारा प्रयास करें।'
          : "I couldn't access the school records right now. Please try again.";
      setVoiceResult({
        query: queryText,
        category: 'general',
        spokenResponse: errorMsg,
        avatarMood: 'error',
        isMultiChild: false,
        intent: 'UNCLEAR_INPUT',
      });
      try {
        await AIAssistantService.speakResponse(errorMsg, language, voiceSpeed);
      } catch (speechErr) {
        console.error('Failed to speak error message:', speechErr);
      }
      // Auto-recover from error to idle
      setTimeout(() => setAvatarState('idle'), 2500);
    }
  };

  const studentFirstName = (currentStudent?.name || currentStudent?.fullName || '').split(' ')[0] || 'Rohan';

  // Quick Action Buttons requested: 📚 Homework, 📝 Exams, 📊 Progress, 📅 Holidays, 🏫 Announcements
  const quickActions = [
    {
      id: 'homework',
      label: language === 'hi' ? 'होमवर्क' : 'Homework',
      icon: '📚',
      query: isAllMode
        ? 'Mere dono bachchon ka kal ka homework batao.'
        : `${studentFirstName} ka kal kya hai?`,
    },
    {
      id: 'exams',
      label: language === 'hi' ? 'परीक्षा' : 'Exams',
      icon: '📝',
      query: isAllMode
        ? 'Mere bachchon ke exams kab hain?'
        : `${studentFirstName} ka exam kab hai?`,
    },
    {
      id: 'progress',
      label: language === 'hi' ? 'प्रगति' : 'Progress',
      icon: '📊',
      query: isAllMode
        ? 'Sabhi bachchon ki progress batao.'
        : `${studentFirstName} ke marks aur progress report batao.`,
    },
    {
      id: 'holidays',
      label: language === 'hi' ? 'छुट्टियां' : 'Holidays',
      icon: '📅',
      query: 'School me agli chhutti kab hai?',
    },
    {
      id: 'announcements',
      label: language === 'hi' ? 'सूचनाएं' : 'Announcements',
      icon: '🏫',
      query: 'School se koi naya announcement ya notice aaya hai?',
    },
  ];

  return (
    <div className="min-h-[82vh] flex flex-col justify-between items-center px-4 py-2 max-w-lg mx-auto pb-24 relative select-none">
      {/* ======================================================== */}
      {/* 1. MINIMAL HEADER: Small Current Child + Small Language  */}
      {/* ======================================================== */}
      <div className="w-full flex items-center justify-between gap-2 pt-1 pb-2">
        {/* Small Current Child Indicator / Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowChildDropdown(!showChildDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100/80 border border-orange-200/80 text-xs font-bold text-slate-800 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Switch Child"
          >
            <span className="text-sm">{isAllMode ? '👨‍👧‍👦' : '👦'}</span>
            <span className="truncate max-w-[120px] sm:max-w-[150px]">
              {isAllMode
                ? language === 'hi'
                  ? `दोनों बच्चे (${students.length})`
                  : `All Children (${students.length})`
                : `${studentFirstName} (${currentStudent?.class || ''}-${currentStudent?.section || ''})`}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Child Dropdown Menu */}
          {showChildDropdown && (
            <div className="absolute left-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-orange-200 p-2 z-30 animate-in fade-in zoom-in-95 duration-150">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                Select Child:
              </span>

              {/* All Children Mode */}
              {students.length > 1 && (
                <button
                  onClick={() => {
                    onSelectStudent('all');
                    setShowChildDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-colors ${
                    isAllMode ? 'bg-orange-100 text-orange-950' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>👨‍👧‍👦</span>
                    <span>{language === 'hi' ? 'दोनों बच्चे (सभी)' : 'All Children (Together)'}</span>
                  </div>
                  {isAllMode && <Check className="w-3.5 h-3.5 text-orange-600" />}
                </button>
              )}

              {/* Individual Children */}
              {students.map((std) => {
                const isSelected = selectedStudentId === std.id;
                return (
                  <button
                    key={std.id}
                    onClick={() => {
                      onSelectStudent(std.id);
                      setShowChildDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-colors ${
                      isSelected ? 'bg-orange-100 text-orange-950' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{std.gender === 'female' ? '👧' : '👦'}</span>
                      <span className="truncate">{std.name} ({std.class}-{std.section})</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-orange-600" />}
                  </button>
                );
              })}

              <div className="border-t border-slate-100 mt-1 pt-1 space-y-1">
                <button
                  onClick={() => {
                    setShowChildDropdown(false);
                    onNavigate('add-child');
                  }}
                  className="w-full flex items-center gap-1.5 p-2 rounded-xl text-xs font-bold text-orange-600 hover:bg-orange-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? '+ नया बच्चा जोड़ें (Add Child)' : '+ Add Child Details'}</span>
                </button>
                <button
                  onClick={() => {
                    setShowChildDropdown(false);
                    onNavigate('verify-child');
                  }}
                  className="w-full flex items-center gap-1.5 p-1.5 rounded-xl text-[11px] font-medium text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  <span>🔍 {language === 'hi' ? 'स्कूल आईडी से ढूंढें' : 'Verify with School ID'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Voice Settings Pill Button */}
          <button
            onClick={() => setShowVoiceSettingsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-orange-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Voice Settings"
            id="open-voice-settings-btn"
          >
            <Volume2 className="w-3.5 h-3.5 text-orange-600" />
            <span className="capitalize">{voiceSettings.gender === 'female' ? '👩 Female' : '👨 Male'}</span>
          </button>

          {/* Small Language Pill Indicator */}
          <button
            onClick={onOpenLanguageModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-orange-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Change Language"
          >
            <Globe className="w-3.5 h-3.5 text-orange-600" />
            <span>{currentLangObj.name}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. CENTER: Animated SchoolSathi Companion (Hero Element) */}
      {/* ======================================================== */}
      <div className="w-full flex flex-col items-center justify-center my-auto py-2">
        <div
          className="relative cursor-pointer transition-transform hover:scale-102 active:scale-98 flex flex-col items-center"
          onClick={() => {
            const prompt =
              language === 'hi'
                ? `नमस्ते ${parentName}! मैं आपका स्कूलसाथी हूँ। ${isAllMode ? 'बच्चों' : studentFirstName} के बारे में कुछ भी पूछिए!`
                : `Hello ${parentName}! I am your SchoolSathi. Ask me anything about ${isAllMode ? 'your children' : studentFirstName}!`;
            setAvatarState('speaking');
            SpeechService.speak(prompt, language).then(() => {
              setAvatarState('happy');
              setTimeout(() => setAvatarState('idle'), 1500);
            });
          }}
        >
          <Avatar
            state={avatarState}
            persona={companionPersona}
            currentStudent={currentStudent}
            isMultiChild={isAllMode}
            size="xl"
            showStateBadge={true}
          />

          {/* Compact Persona Selector beneath character */}
          <CompanionSelector
            currentPersona={companionPersona}
            onSelectPersona={(p) => {
              setCompanionPersona(p);
              onChangeAvatarPersona?.(p);
            }}
            currentStudent={currentStudent}
            className="mt-2"
          />
        </div>

        {/* Warm Spoken Guidance Subtitle */}
        <div className="text-center mt-3 max-w-xs">
          <p className="text-sm font-bold text-slate-700">
            {isAllMode
              ? language === 'hi'
                ? `पूछिए अपने दोनों बच्चों के बारे में`
                : `Ask about both children's schedule`
              : language === 'hi'
              ? `पूछिए ${studentFirstName} के होमवर्क या एग्जाम के बारे में`
              : `Ask anything about ${studentFirstName}'s school updates`}
          </p>
        </div>

        {/* Dynamic Loading Stage Indicator */}
        {loadingStage && (
          <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold animate-pulse my-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-600 animate-spin" />
            <span>{loadingStage}</span>
          </div>
        )}

        {/* Result Card: Spoken Output with "Based on school records" badge */}
        {voiceResult && (
          <div className="w-full mt-4 animate-in slide-in-from-bottom-3 duration-200">
            <SpeechResponseCard
              result={voiceResult}
              language={language}
              onClose={() => {
                SpeechService.stop();
                setVoiceResult(null);
                setAvatarState('idle');
              }}
              onSpeakAgain={handleStartListening}
              onRetry={lastQuery ? () => handleProcessVoiceQuery(lastQuery) : undefined}
              onReplayAudio={() => {
                SpeechService.stop();
                setAvatarState('speaking');
                const lang = voiceResult.detectedLanguage || language;
                SpeechService.speak(voiceResult.spokenResponse, lang).then(() => {
                  setAvatarState('happy');
                  setTimeout(() => setAvatarState('idle'), 1500);
                });
              }}
              onStopAudio={() => {
                SpeechService.stop();
                setAvatarState('idle');
              }}
              voiceSpeed={voiceSpeed}
              onChangeVoiceSpeed={onChangeVoiceSpeed}
            />
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. BELOW: Large Voice Microphone Button (Primary Action)  */}
      {/* ======================================================== */}
      <div className="w-full my-3">
        <VoiceInputBar
          isListening={isListening}
          onStartListening={handleStartListening}
          onStopListening={handleStopListening}
          onCancelListening={handleCancelListening}
          language={language}
          onVoiceQuery={handleProcessVoiceQuery}
          activeChildName={studentFirstName}
          onMicrophoneError={handleMicrophoneError}
        />
      </div>

      {/* ======================================================== */}
      {/* 4. QUICK ACTIONS: 📚 Homework, 📝 Exams, 📊 Progress,    */}
      {/*    📅 Holidays, 🏫 Announcements (Never replacing voice)  */}
      {/* ======================================================== */}
      <div className="w-full mt-1">
        <div className="flex flex-wrap gap-1.5 justify-center">
          {quickActions.map((qa) => (
            <button
              key={qa.id}
              onClick={() => handleProcessVoiceQuery(qa.query)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-orange-50 border border-orange-200/80 text-xs font-bold text-slate-700 shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-sm">{qa.icon}</span>
              <span>{qa.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. OPTIONAL: Recent Conversation Drawer / Modal          */}
      {/* ======================================================== */}
      {conversationHistory.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowRecentHistory(true)}
            className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-orange-600 bg-slate-100/80 hover:bg-orange-50 px-3 py-1 rounded-full border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-orange-500" />
            <span>
              {language === 'hi' ? 'हाल की बातचीत' : 'Recent conversation'} ({Math.floor(conversationHistory.length / 2)})
            </span>
          </button>
        </div>
      )}

      {/* Recent Conversation Drawer */}
      {showRecentHistory && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-orange-100 animate-in slide-in-from-bottom duration-300 max-h-[75vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-orange-600" />
                <h4 className="text-sm font-black text-slate-800">
                  {language === 'hi' ? 'हाल की बातचीत' : 'Recent Conversation'}
                </h4>
              </div>
              <button
                onClick={() => setShowRecentHistory(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto py-3 pr-1 flex-1 text-xs">
              {conversationHistory.map((turn, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    turn.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      turn.sender === 'user'
                        ? 'bg-orange-500 text-white rounded-br-xs font-semibold'
                        : 'bg-orange-50 text-slate-800 rounded-bl-xs border border-orange-200 font-bold'
                    }`}
                  >
                    {turn.sender === 'assistant' && (
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded-md inline-block mb-1">
                        ✓ Based on school records
                      </span>
                    )}
                    <p className="leading-snug">"{turn.text}"</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                onClick={() => setShowRecentHistory(false)}
                className="w-full py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
