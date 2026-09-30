import React from 'react';
import { Sparkles, User, Settings, HelpCircle, PlusCircle } from 'lucide-react';
import { ScreenId, LanguageCode } from '../../types';
import { TRANSLATIONS } from '../../data/languages';

interface BottomNavProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  language: LanguageCode;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  language,
}) => {
  const t = TRANSLATIONS[language];

  const navItems: { id: ScreenId; label: string; icon: React.ReactNode; isPrimary?: boolean }[] = [
    {
      id: 'main-companion',
      label: 'SATHI',
      icon: <Sparkles className="w-5 h-5" />,
      isPrimary: true,
    },
    {
      id: 'child-profile',
      label: 'PROFILE',
      icon: <User className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'SETTINGS',
      icon: <Settings className="w-5 h-5" />,
    },
    {
      id: 'help',
      label: 'HELP',
      icon: <HelpCircle className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#181818]/95 backdrop-blur-md border-t border-[#303030] px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] max-w-lg mx-auto pointer-events-auto"
      aria-label="Main Navigation"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 transition-all duration-200 min-w-[64px] min-h-[52px] select-none active:scale-95 ${
                isActive
                  ? 'text-white'
                  : 'text-[#666666] hover:text-[#969696]'
              }`}
            >
              <div
                className={`relative p-1.5 transition-all ${
                  isActive
                    ? item.isPrimary
                      ? 'text-[#da291c] -translate-y-1'
                      : 'text-white -translate-y-0.5'
                    : 'text-[#666666]'
                }`}
              >
                {item.icon}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#da291c]" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-[0.65px] uppercase font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
