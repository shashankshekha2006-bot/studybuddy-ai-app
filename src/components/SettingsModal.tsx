import React from 'react';
import { X, Check, Globe, GraduationCap, Sparkles, BookOpen } from 'lucide-react';
import { StudentSettings, ClassLevel, LanguagePreference, ExplanationLevel } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StudentSettings;
  onSave: (newSettings: StudentSettings) => void;
}

const CLASSES: ClassLevel[] = [5, 6, 7, 8, 9, 10, 11, 12];

const LANGUAGES: { id: LanguagePreference; title: string; subtitle: string }[] = [
  { id: 'English', title: 'English', subtitle: 'Simple & clear school English' },
  { id: 'Hindi', title: 'हिन्दी (Hindi)', subtitle: 'शुद्ध एवं सरल देवनागरी हिन्दी' },
  { id: 'Hinglish', title: 'Hinglish', subtitle: 'Hindi in English script (हिंग्लिश)' },
];

const EXPLANATION_LEVELS: { id: ExplanationLevel; title: string; desc: string; icon: string }[] = [
  { id: 'Simple', title: 'Simple (सरल)', desc: 'Easy words, short sentences & simple daily life analogies', icon: '🌱' },
  { id: 'Detailed', title: 'Detailed (विस्तृत)', desc: 'Comprehensive conceptual breakdown with full context', icon: '📚' },
  { id: 'Exam-focused', title: 'Exam-focused (परीक्षा विशेष)', desc: 'CBSE/Board scoring keywords, step marks & presentation tips', icon: '🎯' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [current, setCurrent] = React.useState<StudentSettings>(settings);

  React.useEffect(() => {
    setCurrent(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    onSave(current);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div
        id="settings-modal"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E6E2D3] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E6E2D3] flex items-center justify-between bg-[#F9F7F2]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#5A5A40] text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#434338] font-['Newsreader',serif]">Student Preferences</h2>
              <p className="text-xs text-[#8E8E7E]">विद्यार्थी प्रोफाइल और भाषा प्राथमिकताएं</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-2 text-[#8E8E7E] hover:text-[#434338] hover:bg-[#F3F3ED] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Class selection */}
          <div>
            <label className="block text-sm font-semibold text-[#434338] mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#5A5A40]" />
              Select Your Class (कक्षा चुनें):
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CLASSES.map((cls) => {
                const active = current.classLevel === cls;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setCurrent({ ...current, classLevel: cls })}
                    className={`py-2.5 px-3 rounded-xl font-medium text-sm transition text-center border ${
                      active
                        ? 'bg-[#5A5A40] text-white border-[#444430] shadow-2xs font-bold scale-[1.02]'
                        : 'bg-[#F9F7F2] text-[#434338] border-[#E6E2D3] hover:bg-[#F3F3ED]'
                    }`}
                  >
                    Class {cls}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Language */}
          <div>
            <label className="block text-sm font-semibold text-[#434338] mb-2 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#5A5A40]" />
              Preferred Language (भाषा):
            </label>
            <div className="space-y-2">
              {LANGUAGES.map((lang) => {
                const active = current.language === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setCurrent({ ...current, language: lang.id })}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                      active
                        ? 'bg-[#FFF2E9] border-[#F27D26] text-[#434338] shadow-2xs'
                        : 'bg-[#F9F7F2] border-[#E6E2D3] text-[#434338] hover:bg-[#F3F3ED]'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-sm">{lang.title}</p>
                      <p className="text-xs text-[#8E8E7E]">{lang.subtitle}</p>
                    </div>
                    {active && (
                      <div className="w-6 h-6 rounded-full bg-[#F27D26] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation Level */}
          <div>
            <label className="block text-sm font-semibold text-[#434338] mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#5A5A40]" />
              Explanation Level (व्याख्या का स्तर):
            </label>
            <div className="space-y-2">
              {EXPLANATION_LEVELS.map((lvl) => {
                const active = current.explanationLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setCurrent({ ...current, explanationLevel: lvl.id })}
                    className={`w-full p-3 rounded-xl border text-left flex items-start justify-between transition ${
                      active
                        ? 'bg-[#FFF2E9] border-[#F27D26] text-[#434338] shadow-2xs'
                        : 'bg-[#F9F7F2] border-[#E6E2D3] text-[#434338] hover:bg-[#F3F3ED]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-xl mt-0.5">{lvl.icon}</span>
                      <div>
                        <p className="font-semibold text-sm">{lvl.title}</p>
                        <p className="text-xs text-[#8E8E7E] mt-0.5">{lvl.desc}</p>
                      </div>
                    </div>
                    {active && (
                      <div className="w-6 h-6 rounded-full bg-[#F27D26] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-[#F9F7F2] border-t border-[#E6E2D3] flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#70705E] hover:text-[#434338] rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 text-sm font-semibold bg-[#F27D26] hover:bg-[#D96918] text-white rounded-xl shadow-xs transition active:scale-95"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
