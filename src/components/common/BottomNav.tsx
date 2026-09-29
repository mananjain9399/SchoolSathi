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
      label: 'Sathi',
      icon: <Sparkles className="w-6 h-6" />,
      isPrimary: true,
    },
    {
      id: 'child-profile',
      label: t.childProfile.split(' ')[0] || 'Profile',
      icon: <User className="w-6 h-6" />,
    },
    {
      id: 'settings',
      label: t.settings,
      icon: <Settings className="w-6 h-6" />,
    },
    {
      id: 'help',
      label: t.help.split(' ')[0] || 'Help',
      icon: <HelpCircle className="w-6 h-6" />,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-orange-200/80 shadow-[0_-4px_25px_rgba(249,115,22,0.08)] px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] max-w-lg mx-auto sm:rounded-t-3xl pointer-events-auto"
      aria-label="Main Navigation"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 min-w-[64px] min-h-[52px] select-none active:scale-95 ${
                isActive
                  ? 'text-orange-600 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <div
                className={`relative p-1.5 rounded-xl transition-all ${
                  isActive
                    ? item.isPrimary
                      ? 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30 -translate-y-1'
                      : 'bg-orange-100 text-orange-600 -translate-y-0.5'
                    : 'text-slate-500'
                }`}
              >
                {item.icon}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-orange-600 rounded-full" />
                )}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
