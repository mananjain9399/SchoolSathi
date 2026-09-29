import React, { useState } from 'react';
import { ArrowLeft, Search, School as SchoolIcon, ShieldCheck, MapPin, Check } from 'lucide-react';
import { Button } from '../components/common/Button';
import { School, LanguageCode, ScreenId } from '../types';
import { MOCK_SCHOOLS } from '../data/mockData';
import { SpeechService } from '../services/speechService';

interface SchoolSelectionScreenProps {
  language: LanguageCode;
  onNavigate: (screen: ScreenId) => void;
  onSelectSchool: (school: School) => void;
}

export const SchoolSelectionScreen: React.FC<SchoolSelectionScreenProps> = ({
  language,
  onNavigate,
  onSelectSchool,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(MOCK_SCHOOLS[0].id);

  const filteredSchools = MOCK_SCHOOLS.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.board.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChoose = (school: School) => {
    setSelectedSchoolId(school.id);
    onSelectSchool(school);
    SpeechService.speak(`${school.name} चुना गया। अब बच्चे का विवरण भरें।`, language);
  };

  const handleProceed = () => {
    const chosen = MOCK_SCHOOLS.find((s) => s.id === selectedSchoolId) || MOCK_SCHOOLS[0];
    onSelectSchool(chosen);
    onNavigate('add-child');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onNavigate('register')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-2 rounded-xl border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
          Step 3 of 5
        </span>
      </div>

      {/* Screen Title */}
      <div className="text-center mb-5">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Select Child's School
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Choose from partner schools linked with SchoolSathi
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search school name or city..."
          className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 shadow-xs"
        />
      </div>

      {/* School Cards List */}
      <div className="space-y-3 mb-6">
        {filteredSchools.map((school) => {
          const isSelected = selectedSchoolId === school.id;
          return (
            <div
              key={school.id}
              onClick={() => handleChoose(school)}
              className={`p-4 rounded-3xl border-2 transition-all cursor-pointer select-none active:scale-[0.99] ${
                isSelected
                  ? 'border-orange-500 bg-orange-50/80 shadow-md ring-2 ring-orange-200'
                  : 'border-slate-200 bg-white hover:border-orange-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl flex-shrink-0">
                    {school.logoUrl || '🏫'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-base font-extrabold text-slate-900">
                        {school.name}
                      </h4>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {school.city}, {school.state}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {school.board}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-orange-500 text-white' : 'border-2 border-slate-300'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>
            </div>
          );
        })}

        {filteredSchools.length === 0 && (
          <div className="text-center py-8 bg-white rounded-3xl border border-slate-200 p-4">
            <SchoolIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-600">No school found</p>
            <p className="text-xs text-slate-400 mt-0.5">Try searching with city name like Delhi or Gurugram</p>
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleProceed}
      >
        Select This School & Continue
      </Button>
    </div>
  );
};
