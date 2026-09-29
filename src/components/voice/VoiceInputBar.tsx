import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  X,
  Send,
  MessageSquareQuote,
  RotateCw,
  AlertTriangle,
  VolumeX,
} from 'lucide-react';
import { LanguageCode } from '../../types';
import { TRANSLATIONS } from '../../data/languages';
import { SpeechService } from '../../services/speechService';
import { SpeechRecognitionError } from '../../services/speech';

interface VoiceInputBarProps {
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onCancelListening?: () => void;
  language: LanguageCode;
  onVoiceQuery: (queryText: string) => void;
  activeChildName?: string;
  onMicrophoneError?: (error: SpeechRecognitionError) => void;
}

export const VoiceInputBar: React.FC<VoiceInputBarProps> = ({
  isListening,
  onStartListening,
  onStopListening,
  onCancelListening,
  language,
  onVoiceQuery,
  activeChildName = 'Rohan',
  onMicrophoneError,
}) => {
  const t = TRANSLATIONS[language];
  const [showSimModal, setShowSimModal] = useState(false);
  const [customText, setCustomText] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<SpeechRecognitionError | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize and manage SpeechRecognition lifecycle
  useEffect(() => {
    if (isListening) {
      setLiveTranscript('');
      setVoiceError(null);

      // Stop any current text-to-speech audio before listening
      SpeechService.stop();

      const rec = SpeechService.voiceInput(
        language,
        (transcript: string, isFinal: boolean) => {
          setLiveTranscript(transcript);
          if (isFinal && transcript.trim()) {
            const finalQuery = transcript.trim();
            setLiveTranscript('');
            if (recognitionRef.current) {
              recognitionRef.current.stop();
            }
            onStopListening();
            onVoiceQuery(finalQuery);
          }
        },
        (error: SpeechRecognitionError) => {
          if (error.code === 'ABORTED') {
            onStopListening();
            return;
          }
          setVoiceError(error);
          onStopListening();
          onMicrophoneError?.(error);
        },
        () => {
          // onStart callback
        },
        () => {
          // onEnd callback - safety fallback ensuring listening state resets
          if (isListening) {
            onStopListening();
          }
        }
      );

      recognitionRef.current = rec;
      rec.start();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.cancel();
      }
    };
  }, [isListening, language]);

  const handleStart = () => {
    setVoiceError(null);
    setLiveTranscript('');
    onStartListening();
  };

  const handleStop = () => {
    if (liveTranscript.trim()) {
      const q = liveTranscript.trim();
      setLiveTranscript('');
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      onStopListening();
      onVoiceQuery(q);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      onStopListening();
    }
  };

  const handleCancel = () => {
    if (recognitionRef.current) {
      recognitionRef.current.cancel();
    }
    setLiveTranscript('');
    setVoiceError(null);
    if (onCancelListening) {
      onCancelListening();
    } else {
      onStopListening();
    }
  };

  const handleRetry = () => {
    setVoiceError(null);
    setLiveTranscript('');
    onStartListening();
  };

  const getErrorMessage = (err: SpeechRecognitionError): string => {
    if (err.code === 'PERMISSION_DENIED') {
      return language === 'hi'
        ? 'स्कूलसाथी से बात करने के लिए माइक्रोफ़ोन की अनुमति आवश्यक है। (Microphone access is required to talk to SchoolSathi.)'
        : 'Microphone access is required to talk to SchoolSathi.';
    }
    if (err.code === 'NO_SPEECH') {
      return language === 'hi'
        ? "मैंने कुछ नहीं सुना। कृपया दोबारा बोलें। (I didn't hear anything. Please try again.)"
        : "I didn't hear anything. Please try again.";
    }
    return language === 'hi'
      ? "मैं समझ नहीं सका। कृपया दोबारा प्रयास करें। (I couldn't understand that. Please try again.)"
      : "I couldn't understand that. Please try again.";
  };

  // Sample voice prompts including verified test queries
  const sampleVoicePrompts: { text: string; label: string; badge: string }[] = [
    {
      text: 'Kal Rohan ka homework kya hai?',
      label: 'कल रोहन का होमवर्क (Single Child)',
      badge: 'HOMEWORK_TOMORROW',
    },
    {
      text: 'Rohan ka exam kab hai?',
      label: 'रोहन का एग्जाम कब है? (Exam Schedule)',
      badge: 'EXAM_SCHEDULE',
    },
    {
      text: 'Mere bachchon ka homework kya hai?',
      label: 'मेरे बच्चों का होमवर्क क्या है? (All Children)',
      badge: 'MULTI_CHILD',
    },
    {
      text: 'Uske baad wala exam?',
      label: 'उसके बाद वाला एग्जाम? (Sequential Follow-up)',
      badge: 'CONTEXT_FOLLOWUP',
    },
    {
      text: 'Meri beti Priya ka homework kya hai?',
      label: 'मेरी बेटी प्रिया का होमवर्क (Gender Resolution)',
      badge: 'RELATIONSHIP_RESOLUTION',
    },
    {
      text: 'Mere dono bachchon ka kal kya hai?',
      label: 'मेरे दोनों बच्चों का कल क्या है? (Multi-Child)',
      badge: 'MULTI_CHILD',
    },
    {
      text: 'Rohan ki attendance kaisi hai?',
      label: 'रोहन की उपस्थिति कैसी है?',
      badge: 'ATTENDANCE',
    },
    {
      text: 'School ki chhutti kab hai?',
      label: 'स्कूल की छुट्टी कब है?',
      badge: 'HOLIDAY',
    },
    {
      text: "Tomorrow's homework?",
      label: "Tomorrow's homework? (Active Child / English)",
      badge: 'ACTIVE_CHILD_HW',
    },
    {
      text: 'उद्या रोहनचा गृहपाठ काय आहे?',
      label: 'उद्या रोहनचा गृहपाठ? (मराठी - Marathi)',
      badge: 'MARATHI_VOICE',
    },
  ];

  const handlePromptSelect = (promptText: string) => {
    setShowSimModal(false);
    setVoiceError(null);
    onVoiceQuery(promptText);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    const text = customText.trim();
    setCustomText('');
    setShowSimModal(false);
    setVoiceError(null);
    onVoiceQuery(text);
  };

  // Diagnostic simulator triggers for testing edge cases
  const triggerSimulation = (
    mode: 'permission_denied' | 'no_speech' | 'failure',
    label: string
  ) => {
    setShowSimModal(false);
    if (mode === 'permission_denied') {
      const err: SpeechRecognitionError = {
        code: 'PERMISSION_DENIED',
        message: 'Microphone access is required to talk to SchoolSathi.',
      };
      setVoiceError(err);
      onMicrophoneError?.(err);
    } else if (mode === 'no_speech') {
      const err: SpeechRecognitionError = {
        code: 'NO_SPEECH',
        message: "I didn't hear anything. Please try again.",
      };
      setVoiceError(err);
      onMicrophoneError?.(err);
    } else {
      const err: SpeechRecognitionError = {
        code: 'RECOGNITION_FAILED',
        message: "I couldn't understand that. Please try again.",
      };
      setVoiceError(err);
      onMicrophoneError?.(err);
    }
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Microphone Interaction Area */}
      <div className="relative flex flex-col items-center">
        {/* Animated Ripple concentric rings when listening */}
        {isListening && (
          <>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-emerald-400/25 animate-ping pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full border-2 border-emerald-400/40 animate-pulse pointer-events-none" />
          </>
        )}

        {/* Action button row with Cancel button when listening */}
        <div className="flex items-center gap-4">
          {/* Main Voice Microphone Button */}
          <button
            onClick={isListening ? handleStop : handleStart}
            className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl active:scale-95 focus:outline-none focus:ring-8 ${
              isListening
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-emerald-500/40 ring-emerald-200 animate-pulse'
                : 'bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 text-white shadow-orange-500/40 ring-orange-100 hover:scale-105'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Tap to speak to SchoolSathi'}
            id="mic-button"
          >
            {isListening ? (
              <MicOff className="w-10 h-10 sm:w-12 sm:h-12 animate-bounce" />
            ) : (
              <Mic className="w-10 h-10 sm:w-12 sm:h-12" />
            )}
            <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase mt-1 opacity-90">
              {isListening ? 'Stop' : 'Speak'}
            </span>
          </button>
        </div>

        {/* Cancel Button visible during listening */}
        {isListening && (
          <div className="mt-2.5 flex items-center justify-center">
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-300 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
              title="Cancel listening"
              id="cancel-voice-button"
            >
              <X className="w-3.5 h-3.5 text-rose-500" />
              <span>{language === 'hi' ? 'रद्द करें (Cancel)' : 'Cancel'}</span>
            </button>
          </div>
        )}

        {/* State Label & Live Transcript Display */}
        <div className="mt-3 text-center max-w-sm px-2">
          {liveTranscript ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-300 shadow-sm animate-pulse max-w-sm">
              <span className="text-base">🎙️</span>
              <span className="text-xs sm:text-sm font-extrabold text-amber-950 italic">
                "{liveTranscript}"
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white shadow-sm border border-orange-200">
              {isListening ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-sm font-bold text-emerald-700 animate-pulse">
                    {language === 'hi' ? 'सुन रहा हूँ... (Listening...)' : 'Listening...'}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-base">🎤</span>
                  <span className="text-base font-extrabold text-orange-950">
                    {t.tapToSpeak}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Quick Voice Demo Helper Modal Trigger */}
          <div className="mt-2 flex items-center justify-center gap-2">
            <button
              onClick={() => setShowSimModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 hover:text-orange-900 bg-orange-100/70 hover:bg-orange-100 px-3.5 py-1.5 rounded-full border border-orange-200 shadow-xs cursor-pointer transition-all active:scale-95"
              id="open-voice-prompts-button"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Natural Spoken Questions & Tests</span>
            </button>
          </div>
        </div>

        {/* Error Notification Card with Retry & Cancel */}
        {voiceError && !isListening && (
          <div
            id="voice-error-card"
            className="mt-3 w-full max-w-md p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col gap-2.5"
          >
            <div className="flex items-start gap-2.5">
              {voiceError.code === 'PERMISSION_DENIED' ? (
                <MicOff className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              ) : voiceError.code === 'NO_SPEECH' ? (
                <VolumeX className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-bold leading-snug">
                  {getErrorMessage(voiceError)}
                </p>
              </div>
              <button
                onClick={() => setVoiceError(null)}
                className="w-6 h-6 rounded-full hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Close error"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-rose-100/80">
              <button
                onClick={handleRetry}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black shadow-xs active:scale-95 transition-all cursor-pointer"
                id="voice-retry-button"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'पुनः प्रयास (Retry)' : 'Retry'}</span>
              </button>
              <button
                onClick={() => setVoiceError(null)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold active:scale-95 transition-all cursor-pointer"
                id="voice-dismiss-button"
              >
                {language === 'hi' ? 'रद्द करें (Cancel)' : 'Cancel'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Voice Simulator & Natural Language Questions Modal */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-orange-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800">
                    Voice Testing & Natural Questions
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Test speech queries or simulate error edge cases:
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSimModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Diagnostic Edge Case Testing Buttons */}
            <div className="my-2.5 p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block mb-1.5">
                Diagnostics: Test Error & Timeout Flows
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => triggerSimulation('permission_denied', 'Permission Denied')}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 cursor-pointer transition-colors"
                  id="test-permission-denial-btn"
                >
                  🚫 Test Permission Denied
                </button>
                <button
                  onClick={() => triggerSimulation('no_speech', 'No Speech Timeout')}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 cursor-pointer transition-colors"
                  id="test-no-speech-btn"
                >
                  ⏳ Test No-Speech Timeout
                </button>
                <button
                  onClick={() => triggerSimulation('failure', 'Recognition Failed')}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 cursor-pointer transition-colors"
                  id="test-rec-failure-btn"
                >
                  ⚠️ Test Recognition Error
                </button>
              </div>
            </div>

            {/* Natural Language Typing Box */}
            <form onSubmit={handleCustomSubmit} className="my-2 flex gap-2">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder='Type any question (e.g. "Kal Rohan ka homework kya hai?")'
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                disabled={!customText.trim()}
                className="px-4 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-xs"
              >
                <span>Ask</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* List of Natural Spoken Sample Prompts */}
            <div className="space-y-2 overflow-y-auto pr-1 flex-1">
              {sampleVoicePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptSelect(p.text)}
                  className="w-full text-left p-3 rounded-2xl border border-orange-100 bg-orange-50/30 hover:bg-orange-100/70 hover:border-orange-300 transition-all flex items-center justify-between group active:scale-98 cursor-pointer"
                >
                  <div className="flex items-start gap-2.5 pr-2">
                    <MessageSquareQuote className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-sm font-bold text-slate-900 group-hover:text-orange-950 block">
                        "{p.text}"
                      </span>
                      <span className="text-[11px] font-semibold text-orange-700">
                        {p.label}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-xl bg-white text-orange-600 border border-orange-200 shadow-2xs shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    {p.badge}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 text-center">
              <button
                onClick={() => setShowSimModal(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
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
