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
      <div className="text-center mb-6">
        <h2 className="text-[24px] font-semibold text-[#1d1d1f] tracking-tight">{t.help}</h2>
        <p className="text-[14px] text-[#7a7a7a] mt-1">Everything you need to know about using Sathi</p>
      </div>

      {/* 1. Large Audio Help Banner */}
      <div className="bg-[#fafafc] border border-[#e0e0e0] rounded-[24px] p-6 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7a7a7a] block mb-1">
            Audio Guide
          </span>
          <h3 className="text-[18px] font-semibold text-[#1d1d1f]">आवाज़ में सहायता सुनें</h3>
          <p className="text-[13px] text-[#7a7a7a] mt-1 max-w-[220px]">
            Tap to hear how to use SchoolSathi in your mother tongue
          </p>
        </div>

        <button
          onClick={handleAudioHelp}
          className="w-14 h-14 rounded-full bg-white text-[#0066cc] border border-[#e0e0e0] flex items-center justify-center shadow-sm active:scale-95 transition-transform flex-shrink-0 cursor-pointer"
          title="Play audio help"
        >
          <Volume2 className="w-6 h-6 animate-pulse" />
        </button>
      </div>

      {/* 2. Emergency School Helpline */}
      <div className="bg-white rounded-[24px] p-5 border border-[#e0e0e0] shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#ff3b30]/10 text-[#ff3b30] flex items-center justify-center">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-[#ff3b30] uppercase tracking-wider block mb-0.5">
              Direct Helpline
            </span>
            <h4 className="text-[14px] font-semibold text-[#1d1d1f]">
              School Front Desk Call
            </h4>
            <span className="text-[12px] text-[#7a7a7a] font-medium mt-0.5 block">
              +91 11 2569 1234 (8 AM - 3 PM)
            </span>
          </div>
        </div>

        <a
          href="tel:+911125691234"
          className="px-4 py-2 bg-[#ff3b30] hover:bg-[#ff3b30]/90 text-white rounded-full text-[13px] font-semibold active:scale-95 transition-all shadow-sm"
        >
          Call School
        </a>
      </div>

      {/* 3. How to Talk to Sathi Guide */}
      <div className="bg-white rounded-[24px] p-6 border border-[#e0e0e0] shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-[#0066cc]" />
          <h4 className="text-[14px] font-semibold uppercase tracking-wider text-[#1d1d1f]">
            How to Speak to SchoolSathi
          </h4>
        </div>

        <p className="text-[13px] text-[#7a7a7a]">
          Tap any phrase below to hear how naturally you can speak:
        </p>

        <div className="space-y-2">
          {sampleVoiceQuestions.map((q, idx) => (
            <div
              key={idx}
              onClick={() => handlePromptSpeak(q.text)}
              className="p-4 rounded-[14px] bg-[#fafafc] hover:bg-[#f0f0f0] border border-[#e0e0e0] flex items-center justify-between cursor-pointer active:scale-98 transition-all"
            >
              <div>
                <span className="text-[11px] font-semibold text-[#7a7a7a] uppercase block mb-1">
                  {q.label}
                </span>
                <span className="text-[14px] font-semibold text-[#1d1d1f]">
                  "{q.text}"
                </span>
              </div>
              <Volume2 className="w-5 h-5 text-[#0066cc]" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. FAQs Accordion */}
      <div className="bg-white rounded-[24px] p-6 border border-[#e0e0e0] shadow-sm space-y-3">
        <h4 className="text-[14px] font-semibold uppercase tracking-wider text-[#1d1d1f] mb-3 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#0066cc]" /> Frequently Asked Questions
        </h4>

        {faqs.map((faq, index) => {
          const isOpen = openFaqIndex === index;
          return (
            <div
              key={index}
              className="border-b border-[#e0e0e0] last:border-b-0 py-3"
            >
              <button
                onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                className="w-full text-left flex items-center justify-between text-[14px] font-semibold text-[#1d1d1f] py-1"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#7a7a7a] transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <p className="text-[13px] text-[#7a7a7a] mt-2 leading-relaxed bg-[#fafafc] p-3 rounded-[10px] border border-[#e0e0e0] animate-in fade-in duration-150">
                  {faq.a}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Back to Companion Button */}
      <div className="pt-2">
        <button
          onClick={() => onNavigate('main-companion')}
          className="w-full h-[50px] rounded-full bg-[#f0f0f0] hover:bg-[#e0e0e0] text-[#1d1d1f] text-[15px] font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-[#0066cc]" />
          <span>Talk to Sathi Now</span>
        </button>
      </div>
    </div>
  );
};
