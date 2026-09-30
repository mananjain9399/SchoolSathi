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
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-[#0066cc]/20 animate-ping pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full border-2 border-[#0066cc]/30 animate-pulse pointer-events-none" />
          </>
        )}

        {/* Action button row */}
        <div className="flex items-center gap-4">
          {/* Main Voice Microphone Button */}
          <button
            onClick={isListening ? handleStop : handleStart}
            className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center transition-transform duration-300 cursor-pointer active:scale-95 focus:outline-none shadow-lg ${
              isListening
                ? 'bg-[#0066cc] text-white animate-pulse'
                : 'bg-white text-[#0066cc] border border-[#e0e0e0] hover:bg-[#f5f5f7]'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Tap to speak to SchoolSathi'}
            id="mic-button"
          >
            {isListening ? (
              <MicOff className="w-10 h-10 sm:w-12 sm:h-12 animate-bounce" />
            ) : (
              <Mic className="w-10 h-10 sm:w-12 sm:h-12" />
            )}
            <span className="text-[12px] font-medium mt-1">
              {isListening ? 'Stop' : 'Speak'}
            </span>
          </button>
        </div>

        {/* Cancel Button visible during listening */}
        {isListening && (
          <div className="mt-4 flex items-center justify-center">
            <button
              onClick={handleCancel}
              className="apple-btn-secondary text-[14px] px-4 py-2"
              title="Cancel listening"
              id="cancel-voice-button"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}

        {/* State Label & Live Transcript Display */}
        <div className="mt-4 text-center max-w-sm px-2">
          {liveTranscript ? (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#0066cc]/40 rounded-full shadow-sm animate-pulse max-w-sm">
              <span className="text-base">🎙️</span>
              <span className="text-[14px] font-medium text-[#1d1d1f] italic">
                "{liveTranscript}"
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f5f5f7] border border-[#e0e0e0] rounded-full">
              {isListening ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0066cc] animate-ping" />
                  <span className="text-[14px] font-medium text-[#0066cc] animate-pulse">
                    Listening...
                  </span>
                </>
              ) : (
                <>
                  <span className="text-base">🎤</span>
                  <span className="text-[14px] font-medium text-[#7a7a7a]">
                    {t.tapToSpeak}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Quick Voice Demo Helper Modal Trigger */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => setShowSimModal(true)}
              className="apple-btn-ghost text-[#7a7a7a]"
              id="open-voice-prompts-button"
            >
              <Sparkles className="w-4 h-4" />
              <span>Voice Tests</span>
            </button>
          </div>
        </div>

        {/* Error Notification Card with Retry & Cancel */}
        {voiceError && !isListening && (
          <div
            id="voice-error-card"
            className="mt-4 w-full max-w-md p-5 bg-[#fafafc] border border-[#e0e0e0] text-[#1d1d1f] animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col gap-3 rounded-[18px] shadow-sm"
          >
            <div className="flex items-start gap-3">
              {voiceError.code === 'PERMISSION_DENIED' ? (
                <MicOff className="w-5 h-5 text-[#ff3b30] shrink-0 mt-0.5" />
              ) : voiceError.code === 'NO_SPEECH' ? (
                <VolumeX className="w-5 h-5 text-[#7a7a7a] shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-[#ff9500] shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-[14px] font-medium leading-snug text-[#1d1d1f]">
                  {getErrorMessage(voiceError)}
                </p>
              </div>
              <button
                onClick={() => setVoiceError(null)}
                className="w-6 h-6 hover:bg-[#f0f0f0] rounded-full text-[#7a7a7a] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Close error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 pt-3 mt-1 border-t border-[#e0e0e0]">
              <button
                onClick={handleRetry}
                className="apple-btn-primary-small"
                id="voice-retry-button"
              >
                <RotateCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
              <button
                onClick={() => setVoiceError(null)}
                className="apple-btn-ghost text-[#1d1d1f]"
                id="voice-dismiss-button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Voice Simulator & Natural Language Questions Modal */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="apple-glass-panel w-full max-w-lg p-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-[#e0e0e0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#0066cc]">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-[17px] font-semibold text-[#1d1d1f]">
                    Voice Testing
                  </h4>
                  <p className="text-[12px] text-[#7a7a7a]">
                    Test speech queries or simulate errors
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSimModal(false)}
                className="apple-icon-btn w-8 h-8"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Diagnostic Edge Case Testing Buttons */}
            <div className="my-4 p-4 bg-[#fafafc] border border-[#e0e0e0] rounded-[11px]">
              <span className="text-[12px] font-semibold text-[#7a7a7a] block mb-2 uppercase">
                Diagnostics
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => triggerSimulation('permission_denied', 'Permission Denied')}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-[#ff3b30]/10 hover:bg-[#ff3b30]/20 text-[#ff3b30] cursor-pointer transition-colors border border-[#ff3b30]/20"
                  id="test-permission-denial-btn"
                >
                  🚫 Permission Denied
                </button>
                <button
                  onClick={() => triggerSimulation('no_speech', 'No Speech Timeout')}
                  className="px-3 py-1.5 text-[11px] font-bold tracking-[0.65px] uppercase bg-[#303030] hover:bg-[#181818] text-[#969696] cursor-pointer transition-colors border border-[#303030]"
                  style={{ borderRadius: 0 }}
                  id="test-no-speech-btn"
                >
                  ⏳ NO SPEECH
                </button>
                <button
                  onClick={() => triggerSimulation('failure', 'Recognition Failed')}
                  className="px-3 py-1.5 text-[11px] font-bold tracking-[0.65px] uppercase bg-[#303030] hover:bg-[#181818] text-[#969696] cursor-pointer transition-colors border border-[#303030]"
                  style={{ borderRadius: 0 }}
                  id="test-rec-failure-btn"
                >
                  ⚠️ REC FAILURE
                </button>
              </div>
            </div>

            {/* Natural Language Typing Box */}
            <form onSubmit={handleCustomSubmit} className="my-2 flex gap-2">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder='Type any question...'
                className="apple-search-input flex-1"
              />
              <button
                type="submit"
                disabled={!customText.trim()}
                className="apple-btn-primary disabled:opacity-40 rounded-full w-[44px] h-[44px] p-0 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* List of Natural Spoken Sample Prompts */}
            <div className="space-y-1.5 overflow-y-auto pr-1 flex-1 mt-2">
              {sampleVoicePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptSelect(p.text)}
                  className="w-full text-left p-3 rounded-[11px] bg-[#fafafc] hover:bg-[#f0f0f0] border border-[#e0e0e0] transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-start gap-2.5 pr-2">
                    <MessageSquareQuote className="w-4 h-4 text-[#0066cc] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[14px] font-medium text-[#1d1d1f] block">
                        "{p.text}"
                      </span>
                      <span className="text-[12px] text-[#7a7a7a]">
                        {p.label}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold bg-[#e0e0e0] text-[#7a7a7a] px-2 py-0.5 rounded-full uppercase shrink-0">
                    {p.badge}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[#e0e0e0] text-center">
              <button
                onClick={() => setShowSimModal(false)}
                className="apple-btn-secondary w-full"
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
