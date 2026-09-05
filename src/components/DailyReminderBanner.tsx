import React from 'react';
import { BellRing, Flame, Play, X, Clock } from 'lucide-react';
import { QuizReminderSettings, Subject } from '../types';
import { formatTime12h } from '../utils/reminderStorage';

interface DailyReminderBannerProps {
  reminderSettings: QuizReminderSettings;
  onStartQuiz: (subject?: Subject) => void;
  onOpenReminderSettings: () => void;
  onDismiss: () => void;
}

export const DailyReminderBanner: React.FC<DailyReminderBannerProps> = ({
  reminderSettings,
  onStartQuiz,
  onOpenReminderSettings,
  onDismiss,
}) => {
  const subjectLabel =
    reminderSettings.subject === 'Any' ? 'general revision' : reminderSettings.subject;

  return (
    <div className="mb-6 rounded-2xl bg-linear-to-r from-[#FFF9F3] via-white to-[#F9F7F2] border border-[#FCD5B5] p-4 sm:p-5 shadow-sm shadow-[#F27D26]/5 animate-fade-in relative overflow-hidden">
      {/* Decorative subtle background icon */}
      <div className="absolute -right-4 -bottom-4 text-[#F27D26]/10 pointer-events-none">
        <Flame className="w-32 h-32" />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#F27D26] text-white flex items-center justify-center shrink-0 shadow-xs">
            <BellRing className="w-5 h-5 animate-bounce" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#FFF2E9] text-[#F27D26] border border-[#FCD5B5] uppercase tracking-wider">
                Daily Study Reminder
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-[#434338] bg-[#F3F3ED] px-2 py-0.5 rounded-md border border-[#E6E2D3]">
                <Flame className="w-3.5 h-3.5 text-[#F27D26]" />
                {reminderSettings.streakCount} Day Streak
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-[#434338] mt-1 font-['Newsreader',serif]">
              Time for your daily quick quiz session!
            </h3>
            <p className="text-xs text-[#70705E] mt-0.5 max-w-xl">
              Spend just 3 minutes testing your knowledge in{' '}
              <strong className="text-[#434338] font-semibold">{subjectLabel}</strong>. Complete today's quiz to keep your streak alive!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 justify-end">
          <button
            type="button"
            onClick={onOpenReminderSettings}
            className="px-3 py-2 text-xs font-semibold text-[#5A5A40] hover:text-[#434338] hover:bg-[#F3F3ED] rounded-xl border border-[#E6E2D3] transition flex items-center gap-1"
            title="Edit reminder schedule"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{formatTime12h(reminderSettings.time)}</span>
          </button>

          <button
            type="button"
            onClick={() =>
              onStartQuiz(
                reminderSettings.subject === 'Any'
                  ? undefined
                  : (reminderSettings.subject as Subject)
              )
            }
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-[#F27D26] hover:bg-[#D96918] text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Quick Quiz</span>
          </button>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss reminder"
            className="p-2 text-[#8E8E7E] hover:text-[#434338] hover:bg-[#F3F3ED] rounded-xl transition"
            title="Dismiss for now"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
