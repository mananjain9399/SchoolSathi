import React from 'react';
import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';
import { LanguagePickerModal } from '../components/common/LanguagePickerModal';
import { LanguageCode, ScreenId } from '../types';

interface AppLayoutProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  language: LanguageCode;
  onSelectLanguage: (code: LanguageCode) => void;
  isLangModalOpen: boolean;
  onOpenLangModal: () => void;
  onCloseLangModal: () => void;
  parentName?: string;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentScreen,
  onNavigate,
  language,
  onSelectLanguage,
  isLangModalOpen,
  onOpenLangModal,
  onCloseLangModal,
  parentName,
  children,
}) => {
  // Screens where Bottom Navigation is visible
  const showBottomNav = [
    'main-companion',
    'child-profile',
    'settings',
    'help',
  ].includes(currentScreen);

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex flex-col font-sans relative selection:bg-[#0066cc]/20">
      {/* Top Header */}
      <Header
        currentLanguage={language}
        onOpenLanguageModal={onOpenLangModal}
        currentScreen={currentScreen}
        onNavigate={onNavigate}
        parentName={parentName}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-lg mx-auto">
        {children}
      </main>

      {/* Bottom Mobile Navigation */}
      {showBottomNav && (
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={onNavigate}
          language={language}
        />
      )}

      {/* Language Picker Modal */}
      <LanguagePickerModal
        isOpen={isLangModalOpen}
        onClose={onCloseLangModal}
        currentLanguage={language}
        onSelectLanguage={onSelectLanguage}
      />
    </div>
  );
};
