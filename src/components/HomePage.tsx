import React from 'react';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  HelpCircle,
  FileText,
  Languages,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  Award,
  Flame,
  Bell,
  Play,
  Calendar,
} from 'lucide-react';
import { Subject, PageTab, StudentSettings, QuizReminderSettings } from '../types';
import { SAMPLE_QUESTIONS } from '../utils/sampleData';
import { formatTime12h, getTodayDateString } from '../utils/reminderStorage';

interface HomePageProps {
  onNavigate: (tab: PageTab) => void;
  onAskSample: (question: string, subject: Subject) => void;
  settings: StudentSettings;
  onOpenSettings: () => void;
  reminderSettings?: QuizReminderSettings;
  onOpenReminder?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onAskSample,
  settings,
  onOpenSettings,
  reminderSettings,
  onOpenReminder,
}) => {
  const subjects: { id: Subject; name: string; hindi: string; icon: string; bg: string }[] = [
    { id: 'Mathematics', name: 'Mathematics', hindi: 'गणित', icon: '📐', bg: 'hover:border-[#5A5A40] hover:bg-[#F3F3ED]/60' },
    { id: 'Science', name: 'Science', hindi: 'विज्ञान', icon: '🔬', bg: 'hover:border-[#5A5A40] hover:bg-[#F3F3ED]/60' },
    { id: 'English', name: 'English', hindi: 'अंग्रेज़ी', icon: '📖', bg: 'hover:border-[#5A5A40] hover:bg-[#F3F3ED]/60' },
    { id: 'Social Science', name: 'Social Science', hindi: 'सामाजिक विज्ञान', icon: '🌍', bg: 'hover:border-[#5A5A40] hover:bg-[#F3F3ED]/60' },
    { id: 'General', name: 'General & Timetable', hindi: 'सामान्य अध्ययन', icon: '💡', bg: 'hover:border-[#5A5A40] hover:bg-[#F3F3ED]/60' },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-[#5A5A40] text-white shadow-lg shadow-[#434338]/10 p-6 sm:p-10 lg:p-12 border border-[#444430]">
        {/* Subtle background decoration */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-[#F27D26]/15 blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-5">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-[#FFF2E9] text-xs font-semibold border border-white/20 shadow-2xs">
            <GraduationCap className="w-4 h-4 text-[#F27D26]" />
            <span>Dedicated for Indian Students (Classes 5 to 12)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight font-['Outfit'] text-white">
            Understand School Questions in Simple Words.
          </h1>

          <p className="text-base sm:text-lg text-[#F3F3ED]/95 max-w-2xl mx-auto font-normal leading-relaxed">
            Your personal 24/7 AI tutor for <strong className="font-semibold text-white">CBSE, ICSE, and State Boards</strong>.
            Get instant step-by-step solutions, practice quizzes, and high-yield revision notes.
          </p>

          {/* Bilingual callout pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#444430]/70 border border-white/20 text-xs sm:text-sm font-medium text-[#FFF2E9]">
            <Languages className="w-4 h-4 text-[#F27D26]" />
            <span>आप हिन्दी, English या Hinglish किसी में भी प्रश्न पूछ सकते हैं!</span>
          </div>

          {/* Hero CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('tutor')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#F27D26] hover:bg-[#D96918] text-white font-bold text-base shadow-md shadow-[#F27D26]/25 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-white" />
              <span>Ask Your Question Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('quiz')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-base border border-white/25 backdrop-blur-sm active:scale-95 transition flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-5 h-5 text-[#FFF2E9]" />
              <span>Take Chapter Quiz</span>
            </button>
          </div>

          {/* Current profile status indicator */}
          <div className="pt-3 flex items-center justify-center gap-2 text-xs text-[#E6E2D3]">
            <span>Current profile:</span>
            <button
              onClick={onOpenSettings}
              className="underline font-semibold text-white hover:text-[#FFF2E9] transition"
            >
              Class {settings.classLevel} • {settings.language} • {settings.explanationLevel} Level
            </button>
          </div>
        </div>
      </section>

      {/* Daily Quiz Streak & Challenge Banner */}
      {reminderSettings && (
        <section className="rounded-2xl bg-linear-to-r from-[#FFF9F3] via-white to-[#F9F7F2] border border-[#FCD5B5] p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#F27D26] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-extrabold text-[#434338]">
                  Daily Study Streak: {reminderSettings.streakCount} Day{reminderSettings.streakCount === 1 ? '' : 's'}!
                </span>
                {reminderSettings.lastCompletedDate === getTodayDateString() ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Completed Today
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Ready for Today
                  </span>
                )}
              </div>
              <p className="text-xs text-[#70705E] mt-0.5">
                {reminderSettings.enabled
                  ? `Daily reminder scheduled for ${formatTime12h(reminderSettings.time)} (${
                      reminderSettings.subject === 'Any' ? 'Mixed' : reminderSettings.subject
                    }). 5 quick questions per day boosts exam recall!`
                  : 'Take a quick 5-minute quiz today to build and maintain your daily study habit!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            {onOpenReminder && (
              <button
                type="button"
                onClick={onOpenReminder}
                className="px-3 py-2 text-xs font-semibold text-[#5A5A40] hover:text-[#434338] hover:bg-[#F3F3ED] rounded-xl border border-[#E6E2D3] transition flex items-center gap-1.5"
                title="Edit reminder schedule"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Schedule</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate('quiz')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-[#F27D26] hover:bg-[#D96918] text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Daily Quiz</span>
            </button>
          </div>
        </section>
      )}

      {/* 2. Quick Subject Selector */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#434338]">Select a Subject (विषय चुनें)</h2>
            <p className="text-xs text-[#8E8E7E]">Pick a subject to ask a doubt or generate revision notes</p>
          </div>
          <button
            onClick={() => onNavigate('tutor')}
            className="text-xs font-semibold text-[#F27D26] hover:text-[#D96918] flex items-center gap-1 transition"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => {
                onAskSample('', sub.id);
              }}
              className={`p-4 rounded-2xl bg-white border border-[#E6E2D3] text-left transition shadow-2xs group flex flex-col justify-between ${sub.bg}`}
            >
              <span className="text-3xl mb-2">{sub.icon}</span>
              <div>
                <p className="font-bold text-sm text-[#434338] group-hover:text-[#5A5A40] transition">
                  {sub.name}
                </p>
                <p className="text-xs text-[#8E8E7E] font-['Noto_Sans_Devanagari']">{sub.hindi}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Core Feature Cards */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl font-bold text-[#434338]">Why Students Love StudyBuddy AI</h2>
          <p className="text-sm text-[#8E8E7E]">
            Crafted specifically to make textbook learning enjoyable and stress-free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Step-by-Step AI Solutions */}
          <div className="p-6 rounded-2xl bg-white border border-[#E6E2D3] shadow-2xs space-y-3 hover:border-[#5A5A40] transition">
            <div className="w-12 h-12 rounded-xl bg-[#FFF2E9] text-[#F27D26] flex items-center justify-center font-bold text-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#434338]">Step-by-Step AI Solutions</h3>
            <p className="text-sm text-[#70705E] leading-relaxed">
              No more confusing formulas or jargon. Every solution is broken into simple steps with exam-scoring tips and important points.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center text-xs font-semibold text-[#F27D26] gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Class 5 to 12 level tuning</span>
              </span>
            </div>
          </div>

          {/* Card 2: Interactive Chapter Quizzes */}
          <div className="p-6 rounded-2xl bg-white border border-[#E6E2D3] shadow-2xs space-y-3 hover:border-[#5A5A40] transition">
            <div className="w-12 h-12 rounded-xl bg-[#F3F3ED] text-[#5A5A40] flex items-center justify-center font-bold text-xl">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#434338]">Smart Chapter Quizzes</h3>
            <p className="text-sm text-[#70705E] leading-relaxed">
              Practice multiple-choice questions aligned with NCERT boards. Get instant score reports and full reasoning for every question.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center text-xs font-semibold text-[#5A5A40] gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Timed self-assessment</span>
              </span>
            </div>
          </div>

          {/* Card 3: Quick Revision Notes */}
          <div className="p-6 rounded-2xl bg-white border border-[#E6E2D3] shadow-2xs space-y-3 hover:border-[#5A5A40] transition">
            <div className="w-12 h-12 rounded-xl bg-[#EFECE2] text-[#434338] flex items-center justify-center font-bold text-xl">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#434338]">High-Yield Revision Notes</h3>
            <p className="text-sm text-[#70705E] leading-relaxed">
              Generate crisp summary notes containing essential definitions, formulas, real-world examples, and last-minute exam checklists.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center text-xs font-semibold text-[#5A5A40] gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Print & offline friendly</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Sample Questions - Click to Ask */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#434338]">Try Popular Questions (पूछ कर देखें)</h2>
            <p className="text-xs text-[#8E8E7E]">Click any textbook question below to see AI in action</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SAMPLE_QUESTIONS.slice(0, 4).map((sample, idx) => (
            <div
              key={idx}
              onClick={() => onAskSample(sample.en, sample.subject)}
              className="p-4 rounded-2xl bg-white border border-[#E6E2D3] hover:border-[#5A5A40] hover:shadow-xs transition cursor-pointer flex items-start gap-3 group"
            >
              <span className="w-8 h-8 rounded-lg bg-[#F3F3ED] text-[#5A5A40] border border-[#E6E2D3] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-semibold text-[#F27D26] bg-[#FFF2E9] px-2 py-0.5 rounded border border-[#FCD5B5]">
                    {sample.subject}
                  </span>
                  <span className="text-[11px] text-[#8E8E7E]">{sample.classRange}</span>
                </div>
                <p className="text-sm font-semibold text-[#434338] group-hover:text-[#5A5A40] transition">
                  {sample.en}
                </p>
                <p className="text-xs text-[#8E8E7E] mt-0.5 font-['Noto_Sans_Devanagari']">
                  {sample.hi}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#8E8E7E] group-hover:text-[#5A5A40] transition shrink-0 mt-2" />
            </div>
          ))}
        </div>
      </section>

      {/* 5. Indian Education System Context Banner */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#444430] text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-[#5A5A40]">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F27D26]/20 text-[#FCD5B5] text-xs font-semibold border border-[#F27D26]/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Safe & Curriculum-Focused AI</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Built for CBSE, ICSE, and Indian State Boards
          </h3>
          <p className="text-sm text-[#F3F3ED]/90 leading-relaxed">
            Our AI tutor strictly follows standard school syllabus concepts. It clarifies difficult textbook concepts step-by-step, avoids hallucinations, and provides exam presentation advice.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
          <button
            onClick={() => onNavigate('tutor')}
            className="px-6 py-3 rounded-xl bg-[#F27D26] hover:bg-[#D96918] text-white font-bold text-sm transition text-center shadow-sm"
          >
            Start Asking Doubts
          </button>
          <button
            onClick={() => onNavigate('about')}
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-[#F3F3ED] font-semibold text-sm transition text-center border border-white/20"
          >
            Learn More
          </button>
        </div>
      </section>
    </div>
  );
};
