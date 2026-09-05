import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Clock,
  Flame,
  Check,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Play,
  Calendar,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { QuizReminderSettings, Subject } from '../types';
import {
  formatTime12h,
  playReminderChime,
  requestNotificationPermission,
  showBrowserNotification,
  getTodayDateString,
} from '../utils/reminderStorage';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminderSettings: QuizReminderSettings;
  onSave: (updated: QuizReminderSettings) => void;
  onStartQuizNow?: (subject?: Subject) => void;
}

const PRESET_TIMES = [
  { label: 'Morning Prep', time: '07:30', emoji: '🌅' },
  { label: 'After School', time: '16:30', emoji: '🏫' },
  { label: 'Evening Drill', time: '19:30', emoji: '🌙' },
  { label: 'Night Revision', time: '21:00', emoji: '📖' },
];

const SUBJECT_OPTIONS: (Subject | 'Any')[] = [
  'Any',
  'Science',
  'Mathematics',
  'English',
  'Social Science',
];

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  reminderSettings,
  onSave,
  onStartQuizNow,
}) => {
  const [current, setCurrent] = useState<QuizReminderSettings>(reminderSettings);
  const [permStatus, setPermStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    setCurrent(reminderSettings);
  }, [reminderSettings, isOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermStatus(Notification.permission);
    } else {
      setPermStatus('unsupported');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermStatus(res);
  };

  const handleSendTestNotification = () => {
    if (current.soundEnabled) {
      playReminderChime();
    }
    showBrowserNotification(
      'StudyBuddy Daily Quiz 🎯',
      {
        body: `Time for your daily ${current.subject === 'Any' ? 'quick quiz' : `${current.subject} quiz`}! Keep your ${current.streakCount}-day streak alive!`,
      },
      () => {
        if (onStartQuizNow) {
          onStartQuizNow(current.subject === 'Any' ? undefined : (current.subject as Subject));
        }
      }
    );
    setTestSent(true);
    setTimeout(() => setTestSent(false), 4000);
  };

  const handleSaveAndClose = () => {
    onSave(current);
    onClose();
  };

  const isCompletedToday = current.lastCompletedDate === getTodayDateString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div
        id="reminder-modal"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E6E2D3] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E6E2D3] flex items-center justify-between bg-[#F9F7F2]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#5A5A40] text-white flex items-center justify-center shadow-xs">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#434338] font-['Newsreader',serif]">
                Daily Quiz Reminder
              </h2>
              <p className="text-xs text-[#8E8E7E]">
                रोज़ाना अभ्यास एवं याद दिलाने की व्यवस्था (Daily Study Streak)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close reminder modal"
            className="p-2 text-[#8E8E7E] hover:text-[#434338] hover:bg-[#F3F3ED] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Daily Streak Card */}
          <div className="p-4 rounded-xl bg-[#FFF9F3] border border-[#FCD5B5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#F27D26] text-white flex items-center justify-center shadow-sm">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-[#434338]">
                    {current.streakCount} Day{current.streakCount === 1 ? '' : 's'} Streak!
                  </span>
                  {isCompletedToday ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                      Today Done ✓
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200">
                      Today Pending
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#70705E] mt-0.5">
                  {isCompletedToday
                    ? 'Great job! You maintained your streak for today.'
                    : 'Take a quick 5-question quiz today to keep your streak going!'}
                </p>
              </div>
            </div>

            {onStartQuizNow && !isCompletedToday && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartQuizNow(current.subject === 'Any' ? undefined : (current.subject as Subject));
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-[#F27D26] hover:bg-[#D96918] text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Now</span>
              </button>
            )}
          </div>

          {/* Toggle Enable/Disable */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#E6E2D3] bg-[#F9F7F2]">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#5A5A40]" />
              <div>
                <h3 className="text-sm font-bold text-[#434338]">
                  Enable Daily Quiz Notification
                </h3>
                <p className="text-xs text-[#8E8E7E]">
                  Sends an alert at your scheduled study time
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={current.enabled}
                onChange={(e) => setCurrent({ ...current, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#D8D4C5] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#C4C0B0] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5A5A40]"></div>
            </label>
          </div>

          {current.enabled && (
            <>
              {/* Scheduled Time */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8E8E7E] mb-2 flex items-center justify-between">
                  <span>Scheduled Reminder Time (समय चुनें):</span>
                  <span className="text-sm font-extrabold text-[#5A5A40] normal-case">
                    {formatTime12h(current.time)}
                  </span>
                </label>

                {/* Custom Time Input */}
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="time"
                    value={current.time}
                    onChange={(e) => setCurrent({ ...current, time: e.target.value })}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#E6E2D3] bg-[#F9F7F2] text-[#434338] font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40]"
                  />
                  <span className="text-xs text-[#8E8E7E] hidden sm:inline">
                    Pick exact 24h study time or choose a preset below:
                  </span>
                </div>

                {/* Preset Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_TIMES.map((preset) => {
                    const active = current.time === preset.time;
                    return (
                      <button
                        key={preset.time}
                        type="button"
                        onClick={() => setCurrent({ ...current, time: preset.time })}
                        className={`p-2.5 rounded-xl border text-left transition flex flex-col ${
                          active
                            ? 'bg-[#5A5A40] text-white border-[#444430] shadow-xs'
                            : 'bg-[#F9F7F2] text-[#434338] border-[#E6E2D3] hover:bg-[#F3F3ED]'
                        }`}
                      >
                        <span className="text-sm">{preset.emoji}</span>
                        <span className="text-xs font-bold mt-1">{preset.label}</span>
                        <span
                          className={`text-[10px] ${
                            active ? 'text-white/80' : 'text-[#8E8E7E]'
                          }`}
                        >
                          {formatTime12h(preset.time)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject Focus for Quiz */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8E8E7E] mb-2">
                  Preferred Daily Quiz Subject (विषय):
                </label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECT_OPTIONS.map((subj) => {
                    const active = current.subject === subj;
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => setCurrent({ ...current, subject: subj })}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                          active
                            ? 'bg-[#5A5A40] text-white border-[#444430] shadow-2xs'
                            : 'bg-[#F9F7F2] text-[#434338] border-[#E6E2D3] hover:bg-[#F3F3ED]'
                        }`}
                      >
                        {subj === 'Any' ? '🎲 Any / Mixed Subject' : subj}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notification & Sound Preferences */}
              <div className="space-y-2 pt-2 border-t border-[#E6E2D3]">
                {/* Sound Chime */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F9F7F2] border border-[#E6E2D3]">
                  <div className="flex items-center gap-2.5">
                    {current.soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-[#5A5A40]" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-[#8E8E7E]" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-[#434338]">Study Bell Audio Chime</p>
                      <p className="text-[11px] text-[#8E8E7E]">Plays a gentle melodic reminder tone</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const next = !current.soundEnabled;
                      setCurrent({ ...current, soundEnabled: next });
                      if (next) playReminderChime();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      current.soundEnabled
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-stone-100 text-stone-600 border-stone-200'
                    }`}
                  >
                    {current.soundEnabled ? 'Enabled' : 'Muted'}
                  </button>
                </div>

                {/* Browser Notification Permission */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F9F7F2] border border-[#E6E2D3]">
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-[#5A5A40]" />
                    <div>
                      <p className="text-xs font-bold text-[#434338]">Browser Push Alerts</p>
                      <p className="text-[11px] text-[#8E8E7E]">
                        {permStatus === 'granted'
                          ? 'Allowed: You will get browser desktop notifications'
                          : permStatus === 'denied'
                          ? 'Blocked in browser settings (in-app banner will be used)'
                          : 'Receive alerts even if tab is in the background'}
                      </p>
                    </div>
                  </div>

                  {permStatus === 'granted' ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  ) : permStatus === 'denied' ? (
                    <span className="px-2.5 py-1 rounded-lg bg-stone-200 text-stone-700 text-[11px] font-bold">
                      Blocked
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRequestPermission}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#5A5A40] text-white hover:bg-[#444430] transition shadow-xs"
                    >
                      Allow Alerts
                    </button>
                  )}
                </div>
              </div>

              {/* Test Notification Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSendTestNotification}
                  className="w-full py-2.5 px-4 rounded-xl border border-dashed border-[#5A5A40] text-[#5A5A40] hover:bg-[#F3F3ED] text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F27D26]" />
                  <span>
                    {testSent ? '✓ Notification & Chime Sent!' : 'Send Test Notification Now'}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F9F7F2] border-t border-[#E6E2D3] flex items-center justify-between">
          <p className="text-[11px] text-[#8E8E7E]">
            ⏰ Reminder triggers daily at {formatTime12h(current.time)}
          </p>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-[#70705E] hover:text-[#434338] rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="px-4 py-2 text-xs font-bold bg-[#5A5A40] hover:bg-[#444430] text-white rounded-xl shadow-xs transition active:scale-95"
            >
              Save Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
