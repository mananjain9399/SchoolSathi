import React, { useState } from 'react';
import {
  HelpCircle,
  Volume2,
  PhoneCall,
  Mic,
  MessageCircle,
  ChevronDown,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { LanguageCode, ScreenId } from '../types';
import { TRANSLATIONS } from '../data/languages';
import { SpeechService } from '../services/speechService';

interface HelpScreenProps {
  language: LanguageCode;
  onNavigate: (screen: ScreenId) => void;
}

export const HelpScreen: React.FC<HelpScreenProps> = ({
  language,
  onNavigate,
}) => {
  const t = TRANSLATIONS[language];
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleAudioHelp = () => {
    SpeechService.speak(
      `स्कूलसाथी का उपयोग करना बहुत आसान है। मुख्य स्क्रीन पर बड़ा माइक बटन दबाएं और अपने बच्चे के गृहकार्य, परीक्षा, छुट्टी या उपस्थिति के बारे में पूछें। आप अपनी भाषा में कभी भी बोल सकते हैं।`,
      language
    );
  };

  const handlePromptSpeak = (text: string) => {
    SpeechService.speak(text, language);
  };

  const faqs = [
    {
      q: 'क्या मुझे टाइप करना पड़ेगा?',
      a: 'बिल्कुल नहीं! स्कूलसाथी खासतौर पर उन माता-पिता के लिए बना है जो लिखना या टाइप नहीं करना चाहते। बस माइक बटन दबाएं और बोलें।',
    },
    {
      q: 'क्या यह मेरी मातृभाषा समझता है?',
      a: 'हाँ! स्कूलसाथी हिन्दी, अंग्रेजी, मराठी, पंजाबी, बांग्ला, तमिल, तेलुगु और गुजराती भाषा में बात करता है।',
    },
    {
      q: 'यदि मेरे दो या तीन बच्चे हैं तो?',
      a: 'आप जितने चाहें उतने बच्चे जोड़ सकते हैं। मुख्य स्क्रीन पर सबसे ऊपर बच्चे का नाम छूकर आप आसानी से बदल सकते हैं।',
    },
    {
      q: 'क्या यह जानकारी स्कूल से सीधे आती है?',
      a: 'हाँ, स्कूलसाथी केवल आपके बच्चे के स्कूल के आधिकारिक रिकॉर्ड्स से सत्यापित जानकारी ही बताता है।',
    },
  ];

  const sampleVoiceQuestions = [
    { text: 'रोहन का आज का होमवर्क क्या है?', label: 'Homework Status' },
    { text: 'अगली परीक्षा की तारीख कब है?', label: 'Exam Schedule' },
    { text: 'क्या कल स्कूल की छुट्टी है?', label: 'Holiday Check' },
    { text: 'आज की उपस्थिति दर्ज हुई क्या?', label: 'Attendance' },
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-24 space-y-4">
      {/* Title */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-black text-slate-900">{t.help}</h2>
        <p className="text-xs text-slate-500 mt-0.5">Everything you need to know about using Sathi</p>
      </div>

      {/* 1. Large Audio Help Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-5 text-white shadow-lg shadow-orange-500/20 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-100 block">
            Audio Guide
          </span>
          <h3 className="text-lg font-black mt-0.5">आवाज़ में सहायता सुनें</h3>
          <p className="text-xs text-white/90 mt-1 max-w-[220px]">
            Tap to hear how to use SchoolSathi in your mother tongue
          </p>
        </div>

        <button
          onClick={handleAudioHelp}
          className="w-14 h-14 rounded-2xl bg-white text-orange-600 flex items-center justify-center shadow-md active:scale-95 transition-transform flex-shrink-0 cursor-pointer"
          title="Play audio help"
        >
          <Volume2 className="w-7 h-7 animate-pulse" />
        </button>
      </div>

      {/* 2. Emergency School Helpline */}
      <div className="bg-white rounded-3xl p-4 border border-rose-100 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">
              Direct Helpline
            </span>
            <h4 className="text-xs sm:text-sm font-black text-slate-800">
              School Front Desk Call
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">
              +91 11 2569 1234 (8 AM - 3 PM)
            </span>
          </div>
        </div>

        <a
          href="tel:+911125691234"
          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold shadow-xs active:scale-95 transition-all"
        >
          Call School
        </a>
      </div>

      {/* 3. How to Talk to Sathi Guide */}
      <div className="bg-white rounded-3xl p-4 border border-orange-100 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-orange-600" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
            How to Speak to SchoolSathi
          </h4>
        </div>

        <p className="text-xs text-slate-500">
          Tap any phrase below to hear how naturally you can speak:
        </p>

        <div className="space-y-2">
          {sampleVoiceQuestions.map((q, idx) => (
            <div
              key={idx}
              onClick={() => handlePromptSpeak(q.text)}
              className="p-3 rounded-2xl bg-orange-50/50 hover:bg-orange-100/70 border border-orange-100 flex items-center justify-between cursor-pointer active:scale-98 transition-all"
            >
              <div>
                <span className="text-[10px] font-bold text-orange-800 uppercase block">
                  {q.label}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  "{q.text}"
                </span>
              </div>
              <Volume2 className="w-4 h-4 text-orange-600" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. FAQs Accordion */}
      <div className="bg-white rounded-3xl p-4 border border-orange-100 shadow-sm space-y-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-orange-600" /> Frequently Asked Questions
        </h4>

        {faqs.map((faq, index) => {
          const isOpen = openFaqIndex === index;
          return (
            <div
              key={index}
              className="border-b border-slate-100 last:border-b-0 py-2"
            >
              <button
                onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                className="w-full text-left flex items-center justify-between text-xs font-bold text-slate-800 py-1"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 animate-in fade-in duration-150">
                  {faq.a}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Back to Companion Button */}
      <div className="pt-1">
        <button
          onClick={() => onNavigate('main-companion')}
          className="w-full py-3 rounded-2xl bg-orange-100 hover:bg-orange-200 text-orange-900 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Talk to Sathi Now</span>
        </button>
      </div>
    </div>
  );
};
