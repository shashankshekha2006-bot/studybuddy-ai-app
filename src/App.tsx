import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { SettingsModal } from './components/SettingsModal';
import { ReminderModal } from './components/ReminderModal';
import { DailyReminderBanner } from './components/DailyReminderBanner';
import { HomePage } from './components/HomePage';
import { TutorPage } from './components/TutorPage';
import { QuizPage } from './components/QuizPage';
import { NotesPage } from './components/NotesPage';
import { HistoryPage } from './components/HistoryPage';
import { StaticPages } from './components/StaticPages';
import {
  StudentSettings,
  PageTab,
  Subject,
  AIAnswer,
  QuizReminderSettings,
} from './types';
import {
  getStoredSettings,
  saveStoredSettings,
  getStoredHistory,
  saveAnswerToHistory,
  deleteHistoryItem,
  clearAllHistory,
} from './utils/storage';
import {
  getStoredReminderSettings,
  saveStoredReminderSettings,
  recordQuizCompleted,
  playReminderChime,
  showBrowserNotification,
  getTodayDateString,
} from './utils/reminderStorage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<PageTab>('home');
  const [settings, setSettings] = useState<StudentSettings>(getStoredSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [history, setHistory] = useState<AIAnswer[]>([]);

  // Daily Reminder state
  const [reminderSettings, setReminderSettings] = useState<QuizReminderSettings>(
    getStoredReminderSettings
  );
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [showReminderBanner, setShowReminderBanner] = useState(false);

  // State to pass pre-filled question from Home to Tutor
  const [tutorPrefill, setTutorPrefill] = useState<{
    question: string;
    subject: Subject;
  } | null>(null);

  useEffect(() => {
    setHistory(getStoredHistory());
  }, []);

  // Daily notification scheduling check (checks on mount & every 30 seconds)
  useEffect(() => {
    const checkDailyReminder = () => {
      const today = getTodayDateString();
      const current = getStoredReminderSettings();

      if (!current.enabled) return;
      // If quiz was already completed today, streak is safe; no reminder alert needed
      if (current.lastCompletedDate === today) return;
      // If reminder already dispatched today, avoid spamming
      if (current.lastNotifiedDate === today) return;

      const now = new Date();
      const currentH = String(now.getHours()).padStart(2, '0');
      const currentM = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentH}:${currentM}`;

      if (currentTime >= current.time) {
        // Play gentle chime if sound enabled
        if (current.soundEnabled) {
          playReminderChime();
        }

        // Send browser push notification if permitted
        showBrowserNotification(
          'StudyBuddy Daily Quiz 🎯',
          {
            body: `Keep your ${current.streakCount}-day study streak alive! Complete your 3-minute quiz in ${
              current.subject === 'Any' ? 'revision' : current.subject
            }.`,
          },
          () => {
            setCurrentTab('quiz');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        );

        // Display in-app reminder banner
        setShowReminderBanner(true);

        // Mark today as notified
        const updated: QuizReminderSettings = {
          ...current,
          lastNotifiedDate: today,
        };
        setReminderSettings(updated);
        saveStoredReminderSettings(updated);
      }
    };

    checkDailyReminder();
    const interval = setInterval(checkDailyReminder, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateSettings = (newSettings: StudentSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  const handleUpdateReminderSettings = (updated: QuizReminderSettings) => {
    setReminderSettings(updated);
    saveStoredReminderSettings(updated);
  };

  const handleQuizCompleted = () => {
    recordQuizCompleted();
    const fresh = getStoredReminderSettings();
    setReminderSettings(fresh);
    setShowReminderBanner(false);
  };

  const handleStartQuickQuiz = (targetSubject?: Subject) => {
    setShowReminderBanner(false);
    setIsReminderModalOpen(false);
    setCurrentTab('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveAnswer = (answer: AIAnswer) => {
    saveAnswerToHistory(answer);
    setHistory(getStoredHistory());
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
  };

  const handleClearAllHistory = () => {
    clearAllHistory();
    setHistory([]);
  };

  const handleAskSample = (question: string, subject: Subject) => {
    setTutorPrefill({ question, subject });
    setCurrentTab('tutor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabSwitch = (tab: PageTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isCompletedToday = reminderSettings.lastCompletedDate === getTodayDateString();

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] text-[#434338] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleTabSwitch}
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        reminderSettings={reminderSettings}
        onOpenReminder={() => setIsReminderModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 md:pb-8">
        {/* Scheduled Daily Reminder Banner */}
        {showReminderBanner && reminderSettings.enabled && !isCompletedToday && (
          <DailyReminderBanner
            reminderSettings={reminderSettings}
            onStartQuiz={handleStartQuickQuiz}
            onOpenReminderSettings={() => setIsReminderModalOpen(true)}
            onDismiss={() => setShowReminderBanner(false)}
          />
        )}

        {currentTab === 'home' && (
          <HomePage
            onNavigate={handleTabSwitch}
            onAskSample={handleAskSample}
            settings={settings}
            onOpenSettings={() => setIsSettingsOpen(true)}
            reminderSettings={reminderSettings}
            onOpenReminder={() => setIsReminderModalOpen(true)}
          />
        )}

        {currentTab === 'tutor' && (
          <TutorPage
            settings={settings}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onSaveHistory={handleSaveAnswer}
            initialQuestion={tutorPrefill?.question || ''}
            initialSubject={tutorPrefill?.subject || 'Mathematics'}
          />
        )}

        {currentTab === 'quiz' && (
          <QuizPage
            settings={settings}
            onOpenSettings={() => setIsSettingsOpen(true)}
            reminderSettings={reminderSettings}
            onOpenReminderSettings={() => setIsReminderModalOpen(true)}
            onQuizCompleted={handleQuizCompleted}
            initialSubject={
              reminderSettings.subject !== 'Any' ? (reminderSettings.subject as Subject) : undefined
            }
          />
        )}

        {currentTab === 'notes' && (
          <NotesPage
            settings={settings}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {currentTab === 'history' && (
          <HistoryPage
            history={history}
            onDeleteOne={handleDeleteHistoryItem}
            onClearAll={handleClearAllHistory}
            onNavigate={handleTabSwitch}
          />
        )}

        {(currentTab === 'about' || currentTab === 'privacy' || currentTab === 'terms') && (
          <StaticPages
            page={currentTab}
            onNavigate={handleTabSwitch}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleTabSwitch} />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={handleTabSwitch}
      />

      {/* Student Preferences Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleUpdateSettings}
      />

      {/* Daily Quiz Reminder Scheduling Modal */}
      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        reminderSettings={reminderSettings}
        onSave={handleUpdateReminderSettings}
        onStartQuizNow={handleStartQuickQuiz}
      />
    </div>
  );
}

