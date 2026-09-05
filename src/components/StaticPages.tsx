import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  Heart,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { PageTab } from '../types';

interface StaticPagesProps {
  page: 'about' | 'privacy' | 'terms';
  onNavigate: (tab: PageTab) => void;
}

export const StaticPages: React.FC<StaticPagesProps> = ({ page, onNavigate }) => {
  if (page === 'about') {
    return (
      <div className="max-w-3xl mx-auto space-y-8 pb-16">
        <div className="space-y-2 border-b border-[#E6E2D3] pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF2E9] text-[#F27D26] border border-[#FCD5B5] text-xs font-semibold">
            <GraduationCap className="w-4 h-4 text-[#F27D26]" />
            <span>Our Mission for Indian Education</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#434338] font-['Newsreader',serif]">
            About StudyBuddy AI
          </h1>
          <p className="text-sm text-[#8E8E7E]">
            Empowering every student from Class 5 to Class 12 across India with accessible, encouraging AI tutoring.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E6E2D3] p-6 sm:p-8 space-y-6 text-[#575747] leading-relaxed text-sm sm:text-base shadow-xs">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#434338] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#F27D26]" />
              <span>Why StudyBuddy AI was Built</span>
            </h2>
            <p>
              Millions of school students in India face challenges while preparing for unit tests, board examinations (CBSE, ICSE, and State Boards), and competitive fundamentals. Often, textbook explanations can feel overly dry, formulas seem intimidating, or teachers might not be readily available at late-night study hours.
            </p>
            <p>
              <strong className="text-[#434338]">StudyBuddy AI</strong> was conceived to be an affectionate, non-judgmental 24/7 academic companion. Whether a student is studying in English, शुद्ध हिन्दी, or conversational Hinglish, the AI breaks down concepts into friendly everyday analogies, step-by-step mathematical reasoning, and high-scoring exam presentation points.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-[#E6E2D3]">
            <h2 className="text-lg font-bold text-[#434338] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#5A5A40]" />
              <span>Core Pillars</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#FFF2E9] border border-[#FCD5B5] space-y-1">
                <h3 className="font-bold text-[#D96918] text-sm">Bilingual & Inclusive</h3>
                <p className="text-xs text-[#70705E]">
                  Full Hindi Unicode and English support so language is never a barrier to quality learning.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F9F7F2] border border-[#E6E2D3] space-y-1">
                <h3 className="font-bold text-[#5A5A40] text-sm">Class 5 to 12 Adaptive</h3>
                <p className="text-xs text-[#70705E]">
                  Paces explanations to match the cognitive maturity and curriculum level of the student.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F3F3ED] border border-[#E6E2D3] space-y-1">
                <h3 className="font-bold text-[#434338] text-sm">Step-by-Step Logic</h3>
                <p className="text-xs text-[#70705E]">
                  Instead of giving blunt answers, we reveal intermediate steps to foster genuine problem-solving.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F9F7F2] border border-[#E6E2D3] space-y-1">
                <h3 className="font-bold text-[#5A5A40] text-sm">Exam Presentation Tips</h3>
                <p className="text-xs text-[#70705E]">
                  CBSE and State Board tips highlight how examiners allocate marks for steps, units, and diagrams.
                </p>
              </div>
            </div>
          </section>

          <div className="pt-4 border-t border-[#E6E2D3] flex items-center justify-between">
            <span className="text-xs text-[#8E8E7E] flex items-center gap-1">
              Made with <Heart className="w-3.5 h-3.5 text-[#F27D26] fill-[#F27D26]" /> for Indian Students
            </span>
            <button
              onClick={() => onNavigate('tutor')}
              className="px-4 py-2 rounded-xl bg-[#F27D26] hover:bg-[#D96918] text-white font-bold text-xs shadow-xs transition"
            >
              Try AI Tutor
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (page === 'privacy') {
    return (
      <div className="max-w-3xl mx-auto space-y-8 pb-16">
        <div className="space-y-2 border-b border-[#E6E2D3] pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F3ED] text-[#5A5A40] border border-[#E6E2D3] text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#5A5A40]" />
            <span>Student Privacy & Safety</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#434338] font-['Newsreader',serif]">
            Privacy Policy
          </h1>
          <p className="text-sm text-[#8E8E7E]">
            Last updated: September 2026. Zero personal tracking, student-first privacy standards.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E6E2D3] p-6 sm:p-8 space-y-6 text-[#575747] leading-relaxed text-sm sm:text-base shadow-xs">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#434338]">1. Student-First Philosophy</h2>
            <p>
              StudyBuddy AI is an educational tool designed for young learners in Classes 5 through 12. We do not require personal identification, phone numbers, email addresses, or social media logins to use the core tutoring, quiz, and note features.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#434338]">2. Local Device Storage</h2>
            <p>
              Your student preferences (selected class, language preference, explanation depth) and question history are stored exclusively in your own browser's local storage (LocalStorage). This data remains on your device and can be erased by you at any time with the "Clear History" button.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#434338]">3. AI Processing & API Security</h2>
            <p>
              Questions you ask are transmitted securely to our backend server to query Google's Gemini models for educational responses. No API credentials or secret keys are ever exposed in client browser code. We do not sell or monetize student question data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#434338]">4. Safe Content Guardrails</h2>
            <p>
              StudyBuddy AI incorporates safety filters to prevent harmful, adult, or abusive content. The assistant is instructed strictly to act as an encouraging, constructive academic tutor.
            </p>
          </section>
        </div>
      </div>
    );
  }

  // Terms of Service
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div className="space-y-2 border-b border-[#E6E2D3] pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F3ED] text-[#434338] border border-[#E6E2D3] text-xs font-semibold">
          <FileCheck className="w-4 h-4 text-[#5A5A40]" />
          <span>Academic Guidelines</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#434338] font-['Newsreader',serif]">
          Terms of Use
        </h1>
        <p className="text-sm text-[#8E8E7E]">
          Responsible educational use and academic honesty guidelines.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E6E2D3] p-6 sm:p-8 space-y-6 text-[#575747] leading-relaxed text-sm sm:text-base shadow-xs">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#434338]">1. Educational Assistance, Not Homework Copying</h2>
          <p>
            StudyBuddy AI is intended to help students comprehend complex concepts, identify problem-solving techniques, and revise for exams. Students are urged to understand the underlying logic rather than merely copying solutions verbatim for homework credit.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#434338]">2. Textbook & Teacher Verification</h2>
          <p>
            While StudyBuddy AI utilizes state-of-the-art models (Gemini 3.8 Flash) tuned for NCERT, CBSE, and ICSE curriculums, AI models may occasionally produce inadvertent inaccuracies or numerical slips. Students should always cross-reference critical examination answers with standard official textbooks (such as NCERT publications) and consult their school teachers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#434338]">3. Fair & Respectful Usage</h2>
          <p>
            Users agree not to submit abusive, spammy, or automated queries. Rate-limiting is in effect on the server to preserve fair access for all Indian students.
          </p>
        </section>
      </div>
    </div>
  );
};
