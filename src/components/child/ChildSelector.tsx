import React from 'react';
import { Plus, Check, Users } from 'lucide-react';
import { Child } from '../../types';

interface ChildSelectorProps {
  students: Child[];
  selectedStudentId: string;
  onSelectStudent: (id: string) => void;
  onAddNewChild: () => void;
  allowAllOption?: boolean;
}

export const ChildSelector: React.FC<ChildSelectorProps> = ({
  students,
  selectedStudentId,
  onSelectStudent,
  onAddNewChild,
  allowAllOption = true,
}) => {
  if (students.length === 0) {
    return (
      <div className="w-full py-2 px-1">
        <button
          onClick={onAddNewChild}
          className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-orange-300 hover:border-orange-500 bg-orange-50/60 text-orange-800 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <Plus className="w-4 h-4 text-orange-600" />
          <span>+ No child linked yet. Click to verify & link your child</span>
        </button>
      </div>
    );
  }

  const isAllSelected = selectedStudentId === 'all';

  return (
    <div className="w-full flex items-center gap-2 overflow-x-auto py-1.5 px-1 no-scrollbar select-none">
      {/* "All Children" Option for multi-child questions */}
      {allowAllOption && students.length > 1 && (
        <button
          onClick={() => onSelectStudent('all')}
          className={`flex items-center gap-2 px-3 py-2 rounded-2xl transition-all duration-200 cursor-pointer flex-shrink-0 active:scale-95 border-2 text-left ${
            isAllSelected
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-600 shadow-md shadow-orange-500/20'
              : 'bg-white border-slate-200 hover:border-orange-300 text-slate-700 shadow-xs'
          }`}
          title="Ask for all children at once"
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
              isAllSelected ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-700'
            }`}
          >
            <Users className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className={`text-xs font-black ${isAllSelected ? 'text-white' : 'text-slate-900'}`}>
                All Children
              </span>
              {isAllSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
            </div>
            <span className={`text-[10px] font-medium ${isAllSelected ? 'text-orange-100' : 'text-slate-400'}`}>
              {students.length} Students
            </span>
          </div>
        </button>
      )}

      {/* Individual Child Buttons */}
      {students.map((student) => {
        const isSelected = student.id === selectedStudentId;
        const displayName = (student.name || student.fullName || 'Child').split(' ')[0];
        const displayClass = student.class || student.grade || 'Class';

        // Avatar icon emoji based on avatarPreference
        const avatarEmoji =
          student.avatarPreference === 'sprout-green'
            ? '🌱'
            : student.avatarPreference === 'lion-star'
            ? '🦁'
            : student.avatarPreference === 'rocket-blue'
            ? '🚀'
            : '🦉';

        return (
          <button
            key={student.id}
            onClick={() => onSelectStudent(student.id)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl transition-all duration-200 cursor-pointer flex-shrink-0 active:scale-95 border-2 text-left ${
              isSelected
                ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-500 shadow-md shadow-orange-500/15'
                : 'bg-white border-slate-200 hover:border-orange-200 shadow-xs'
            }`}
          >
            {/* Child Avatar Icon */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                isSelected
                  ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-xs'
                  : 'bg-orange-100 text-orange-800'
              }`}
            >
              <span>{avatarEmoji}</span>
            </div>

            {/* Child Info */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-orange-950' : 'text-slate-700'}`}>
                  {displayName}
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-orange-600 stroke-[3]" />}
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                {displayClass} - {student.section}
              </span>
            </div>
          </button>
        );
      })}

      {/* "+ Add Child" Quick Action */}
      <button
        onClick={onAddNewChild}
        className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border-2 border-dashed border-orange-300 hover:border-orange-500 bg-orange-50/50 hover:bg-orange-50 text-orange-700 text-xs font-bold transition-all flex-shrink-0 active:scale-95 cursor-pointer"
        title="Verify and link another child"
      >
        <Plus className="w-4 h-4 text-orange-600" />
        <span className="whitespace-nowrap">+ Link Child</span>
      </button>
    </div>
  );
};
