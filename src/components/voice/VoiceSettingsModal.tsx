import React from 'react';
import { X } from 'lucide-react';
import { LanguageCode } from '../../types';
import { VoiceSettingsCard } from './VoiceSettingsCard';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: LanguageCode;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  language = 'hi',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-orange-100 animate-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer z-10"
          aria-label="Close Voice Settings"
          id="close-voice-settings-modal"
        >
          <X className="w-4 h-4" />
        </button>

        <VoiceSettingsCard
          language={language}
          showTitle={true}
          className="border-none shadow-none p-0"
        />

        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
