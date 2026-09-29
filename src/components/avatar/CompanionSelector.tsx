import React from 'react';
import { AvatarPersona, Student } from '../../types';

interface CompanionSelectorProps {
  currentPersona: AvatarPersona;
  onSelectPersona: (persona: AvatarPersona) => void;
  currentStudent?: Student | null;
  className?: string;
}

export const CompanionSelector: React.FC<CompanionSelectorProps> = ({
  currentPersona,
  onSelectPersona,
  currentStudent,
  className = '',
}) => {
  const options: Array<{
    id: AvatarPersona;
    label: string;
    icon: string;
    description: string;
  }> = [
    {
      id: 'neutral',
      label: 'Sathi',
      icon: '🦉',
      description: 'Family companion',
    },
    {
      id: 'boy',
      label: 'Veer',
      icon: '👦',
      description: 'Boy companion',
    },
    {
      id: 'girl',
      label: 'Ananya',
      icon: '👧',
      description: 'Girl companion',
    },
    {
      id: 'auto',
      label: 'Auto',
      icon: '✨',
      description: currentStudent
        ? `Matched to ${currentStudent.name.split(' ')[0]}`
        : 'Smart match',
    },
  ];

  return (
    <div className={`inline-flex items-center bg-white/80 backdrop-blur-xs p-1 rounded-full border border-orange-200/80 shadow-xs ${className}`}>
      {options.map((opt) => {
        const isSelected = currentPersona === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelectPersona(opt.id)}
            title={`${opt.label} — ${opt.description}`}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              isSelected
                ? 'bg-orange-500 text-white shadow-xs font-semibold scale-102'
                : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50'
            }`}
          >
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
