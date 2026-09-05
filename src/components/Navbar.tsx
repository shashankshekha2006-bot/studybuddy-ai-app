import React from 'react';
import {
  GraduationCap,
  Sparkles,
  SlidersHorizontal,
  BookOpen,
  HelpCircle,
  Clock,
  Home,
  FileText,
  Bell,
  Flame,
} from 'lucide-react';
import { StudentSettings, PageTab, QuizReminderSettings } from '../types';
import { formatTime12h, getTodayDateString } from '../utils/reminderStorage';

interface NavbarProps {
  currentTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
  settings: StudentSettings;
  onOpenSettings: () => void;
  reminderSettings?: QuizReminderSettings;
  onOpenReminder?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  settings,
  onOpenSettings,
  reminderSettings,
  onOpenReminder,
}) => {
  const navItems: { id: PageTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'tutor', label: 'AI Tutor', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'quiz', label: 'Quiz', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'notes', label: 'Notes', icon: <FileText className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <Clock className="w-4 h-4" /> },
    { id: 'about', label: 'About', icon: <BookOpen className="w-4 h-4" /> },
  ];

  const isCompletedToday = reminderSettings?.lastCompletedDate === getTodayDateString();

  return (
    <header className="sticky top-0 z-40 bg-[#F9F7F2]/95 backdrop-blur border-b border-[#E6E2D3] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => onSelectTab('home')}
            className="flex items-center space-x-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#5A5A40] text-white flex items-center justify-center shadow-sm shadow-[#5A5A40]/20 group-hover:scale-105 transition">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-extrabold tracking-tight text-[#434338] font-['Outfit']">
                  StudyBuddy
                </span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-[#FFF2E9] text-[#F27D26] border border-[#FCD5B5]">
                  AI
                </span>
              </div>
              <p className="text-[10px] font-semibold text-[#8E8E7E] tracking-wider">
                FOR INDIAN STUDENTS (CLASS 5-12)
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                    active
                      ? 'bg-[#5A5A40] text-white font-semibold shadow-xs'
                      : 'text-[#70705E] hover:text-[#434338] hover:bg-[#F2F1EC]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Reminder + Class/Language badges + Settings button */}
          <div className="flex items-center space-x-2">
            {onOpenReminder && reminderSettings && (
              <button
                onClick={onOpenReminder}
                aria-label="Daily Quiz Reminder"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#E6E2D3] bg-white text-[#5A5A40] hover:text-[#434338] hover:bg-[#F2F1EC] transition text-xs font-bold"
                title={`Daily Quiz Reminder (${formatTime12h(reminderSettings.time)}) • ${
                  reminderSettings.streakCount
                } Day Streak`}
              >
                <span className="relative flex items-center justify-center">
                  <Bell className="w-3.5 h-3.5" />
                  {!isCompletedToday && reminderSettings.enabled && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#F27D26] ring-1 ring-white" />
                  )}
                </span>
                <span className="flex items-center gap-0.5 text-xs text-[#F27D26] font-extrabold">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{reminderSettings.streakCount}</span>
                </span>
              </button>
            )}

            <button
              onClick={onOpenSettings}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-[#F3F3ED] border border-[#E6E2D3] text-[#434338] text-xs font-semibold hover:bg-[#EAE7DD] transition"
              title="Click to change Class or Language"
            >
              <span className="px-1.5 py-0.5 bg-[#E6E2D3] text-[#434338] rounded text-[11px] font-bold">
                Class {settings.classLevel}
              </span>
              <span className="text-[#8E8E7E]">•</span>
              <span className="truncate max-w-[80px] text-[#5A5A40]">{settings.language}</span>
            </button>

            <button
              onClick={onOpenSettings}
              aria-label="Student preferences"
              className="p-2 text-[#5A5A40] hover:text-[#434338] hover:bg-[#F2F1EC] rounded-xl transition border border-[#E6E2D3] bg-white"
              title="Student Settings"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
