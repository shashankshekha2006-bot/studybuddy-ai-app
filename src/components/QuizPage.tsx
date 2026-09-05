import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  SlidersHorizontal,
  BookOpen,
  Flame,
  Bell,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Subject, StudentSettings, QuizQuestion, QuizData, QuizReminderSettings } from '../types';
import { POPULAR_QUIZ_TOPICS } from '../utils/sampleData';
import { formatTime12h, getTodayDateString } from '../utils/reminderStorage';

interface QuizPageProps {
  settings: StudentSettings;
  onOpenSettings: () => void;
  reminderSettings?: QuizReminderSettings;
  onOpenReminderSettings?: () => void;
  onQuizCompleted?: (score: number, total: number) => void;
  initialSubject?: Subject;
}

const SUBJECTS: Subject[] = ['Mathematics', 'Science', 'English', 'Social Science', 'General'];

export const QuizPage: React.FC<QuizPageProps> = ({
  settings,
  onOpenSettings,
  reminderSettings,
  onOpenReminderSettings,
  onQuizCompleted,
  initialSubject,
}) => {
  const [subject, setSubject] = useState<Subject>(
    initialSubject || (reminderSettings?.subject !== 'Any' && reminderSettings?.subject ? reminderSettings.subject : 'Science')
  );
  const [topic, setTopic] = useState('Chemical Reactions & Equations');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialSubject) {
      setSubject(initialSubject);
      const top = POPULAR_QUIZ_TOPICS.find((p) => p.subject === initialSubject)?.topics[0];
      if (top) setTopic(top);
    }
  }, [initialSubject]);

  // Quiz state
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Start generating quiz
  const handleGenerateQuiz = async () => {
    if (!topic.trim()) {
      setError('Please enter or select a topic/chapter name.');
      return;
    }

    setLoading(true);
    setError(null);
    setQuizData(null);
    setUserAnswers({});
    setIsSubmitted(false);
    setCurrentIdx(0);

    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classLevel: settings.classLevel,
          subject,
          topic: topic.trim(),
          numQuestions,
          language: settings.language,
        }),
      });

      if (!res.ok) {
        const data: any = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate quiz. Please try again.');
      }

      const data: QuizData = await res.json();
      if (!data.questions || data.questions.length === 0) {
        throw new Error('No quiz questions returned.');
      }

      setQuizData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    // Calculate score
    if (!quizData) return;
    let score = 0;
    quizData.questions.forEach((q, i) => {
      if (userAnswers[i] === q.correctIndex) {
        score++;
      }
    });

    // If score >= 60%, trigger confetti celebration
    const percent = (score / quizData.questions.length) * 100;
    if (percent >= 50) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
    }

    if (onQuizCompleted) {
      onQuizCompleted(score, quizData.questions.length);
    }
  };

  const handleReset = () => {
    setQuizData(null);
    setUserAnswers({});
    setIsSubmitted(false);
    setCurrentIdx(0);
  };

  // Find popular topics for selected subject
  const currentSubjectTopics =
    POPULAR_QUIZ_TOPICS.find((p) => p.subject === subject)?.topics || [];

  // Calculate final score
  const totalQuestions = quizData?.questions.length || 0;
  const correctCount =
    quizData?.questions.filter((q, i) => userAnswers[i] === q.correctIndex).length || 0;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E2D3] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#434338] flex items-center gap-2">
            <HelpCircle className="w-7 h-7 text-[#F27D26]" />
            <span>Chapter Quiz Generator</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#8E8E7E] mt-0.5">
            Test your knowledge with NCERT-aligned multiple choice questions
          </p>
        </div>

        <button
          onClick={onOpenSettings}
          className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F3F3ED] border border-[#E6E2D3] text-xs font-semibold text-[#434338] hover:bg-[#EAE7DD] transition"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#5A5A40]" />
          <span>Class {settings.classLevel}</span>
          <span className="text-[#8E8E7E]">•</span>
          <span>{settings.language}</span>
        </button>
      </div>

      {/* Daily Quiz Streak & Reminder Card (if no active quiz) */}
      {!quizData && reminderSettings && (
        <div className="rounded-2xl bg-linear-to-r from-[#FFF9F3] via-white to-[#F9F7F2] border border-[#FCD5B5] p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#F27D26] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-extrabold text-[#434338]">
                  {reminderSettings.streakCount} Day{reminderSettings.streakCount === 1 ? '' : 's'} Streak!
                </span>
                {reminderSettings.lastCompletedDate === getTodayDateString() ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Today Completed
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Today Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-[#70705E] mt-1">
                {reminderSettings.enabled
                  ? `Daily reminder scheduled for ${formatTime12h(reminderSettings.time)} (${
                      reminderSettings.subject === 'Any' ? 'Mixed' : reminderSettings.subject
                    })`
                  : 'Daily reminder is currently turned off'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            {onOpenReminderSettings && (
              <button
                type="button"
                onClick={onOpenReminderSettings}
                className="px-3 py-2 text-xs font-semibold text-[#5A5A40] hover:text-[#434338] hover:bg-[#F3F3ED] rounded-xl border border-[#E6E2D3] transition flex items-center gap-1.5"
                title="Configure daily reminder"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Reminder Schedule</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const targetSub =
                  reminderSettings.subject !== 'Any' ? reminderSettings.subject : subject;
                setSubject(targetSub);
                const tops =
                  POPULAR_QUIZ_TOPICS.find((p) => p.subject === targetSub)?.topics || [];
                const selectedTopic = tops[0] || topic;
                setTopic(selectedTopic);
                // Trigger quiz generation directly
                setLoading(true);
                setError(null);
                setQuizData(null);
                setUserAnswers({});
                setIsSubmitted(false);
                setCurrentIdx(0);
                fetch('/api/quiz', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    classLevel: settings.classLevel,
                    subject: targetSub,
                    topic: selectedTopic,
                    numQuestions: 5,
                    language: settings.language,
                  }),
                })
                  .then((res) => {
                    if (!res.ok) throw new Error('Failed to generate quick quiz');
                    return res.json();
                  })
                  .then((data: any) => {
                    if (!data.questions || data.questions.length === 0) {
                      throw new Error('No quiz questions returned');
                    }
                    setQuizData(data);
                  })
                  .catch((err) => {
                    setError(err.message || 'Failed to start quiz');
                  })
                  .finally(() => {
                    setLoading(false);
                  });
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-[#F27D26] hover:bg-[#D96918] text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>1-Click Daily Quiz</span>
            </button>
          </div>
        </div>
      )}

      {/* Screen 1: Quiz Generator Form (if no active quiz) */}
      {!quizData && (
        <div className="bg-white rounded-2xl border border-[#E6E2D3] shadow-xs p-6 space-y-6">
          {/* 1. Subject */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8E8E7E] mb-2">
              Select Subject:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {SUBJECTS.map((sub) => {
                const active = subject === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => {
                      setSubject(sub);
                      const top = POPULAR_QUIZ_TOPICS.find((p) => p.subject === sub)?.topics[0];
                      if (top) setTopic(top);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-center transition ${
                      active
                        ? 'bg-[#5A5A40] text-white border-[#444430] shadow-2xs'
                        : 'bg-[#F9F7F2] text-[#434338] border-[#E6E2D3] hover:bg-[#F3F3ED]'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Topic/Chapter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8E8E7E]">
              Topic or Chapter Name:
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Life Processes, Quadratic Equations, Nationalism in India..."
              className="w-full p-3.5 rounded-xl border border-[#E6E2D3] focus:border-[#5A5A40] focus:ring-2 focus:ring-[#E6E2D3] outline-none text-[#434338] text-sm font-medium transition bg-white placeholder:text-[#8E8E7E]"
            />

            {/* Quick Topic Chips */}
            <div className="pt-1">
              <span className="text-[11px] text-[#8E8E7E] block mb-1.5 font-medium">
                Popular Class {settings.classLevel} {subject} Chapters:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentSubjectTopics.map((top, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTopic(top)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                      topic === top
                        ? 'bg-[#FFF2E9] border-[#FCD5B5] text-[#D96918] font-semibold'
                        : 'bg-[#F9F7F2] border-[#E6E2D3] text-[#70705E] hover:bg-[#F3F3ED]'
                    }`}
                  >
                    {top}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Number of Questions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8E8E7E] mb-2">
              Number of Questions:
            </label>
            <div className="flex gap-3">
              {[3, 5, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setNumQuestions(num)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition ${
                    numQuestions === num
                      ? 'bg-[#5A5A40] text-white border-[#444430] shadow-2xs'
                      : 'bg-[#F9F7F2] text-[#434338] border-[#E6E2D3] hover:bg-[#F3F3ED]'
                  }`}
                >
                  {num} Questions
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-[#FFF2E9] border border-[#FCD5B5] text-xs text-[#D96918]">
              {error}
            </div>
          )}

          {/* Submit CTA */}
          <button
            type="button"
            onClick={handleGenerateQuiz}
            disabled={loading || !topic.trim()}
            className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 ${
              loading || !topic.trim()
                ? 'bg-[#E6E2D3] text-[#8E8E7E] cursor-not-allowed'
                : 'bg-[#F27D26] hover:bg-[#D96918] text-white shadow-[#F27D26]/20 active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crafting Class {settings.classLevel} Quiz...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Generate Quiz with AI</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Screen 2: Active Quiz taking / Result View */}
      {quizData && (
        <div className="space-y-6">
          {/* Header summary bar */}
          <div className="bg-white rounded-2xl border border-[#E6E2D3] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div>
              <span className="text-[11px] font-bold text-[#D96918] bg-[#FFF2E9] px-2 py-0.5 rounded border border-[#FCD5B5]">
                {quizData.subject} • Class {quizData.classLevel}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#434338] mt-1 font-['Newsreader',serif]">
                {quizData.title || quizData.topic}
              </h2>
            </div>

            <button
              onClick={handleReset}
              className="text-xs font-semibold text-[#70705E] hover:text-[#434338] flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E6E2D3] hover:bg-[#F3F3ED] transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Quiz</span>
            </button>
          </div>

          {/* If Submitted: Score Summary Card */}
          {isSubmitted && (
            <div className="bg-gradient-to-br from-[#FFF2E9] to-[#F3F3ED] rounded-2xl border border-[#FCD5B5] p-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#F27D26] text-white flex items-center justify-center mx-auto shadow-md">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-[#434338] font-['Newsreader',serif]">
                You scored {correctCount} / {totalQuestions} ({scorePercent}%)
              </h3>
              <p className="text-sm text-[#70705E] max-w-md mx-auto">
                {scorePercent === 100
                  ? '🌟 Outstanding! You have mastered this chapter.'
                  : scorePercent >= 60
                  ? '👍 Great effort! Review the step-by-step explanations below to strengthen weak areas.'
                  : '📖 Keep practicing! Review the detailed answers below and try again.'}
              </p>
              <button
                onClick={handleReset}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#444430] text-white font-bold text-sm shadow-xs transition"
              >
                <span>Practice Another Topic</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Active Quiz Question Card (Single-Question View during quiz) */}
          {!isSubmitted && (
            <div className="bg-white rounded-2xl border border-[#E6E2D3] shadow-xs p-6 space-y-6">
              {/* Question Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-[#8E8E7E]">
                  <span>Question {currentIdx + 1} of {totalQuestions}</span>
                  <div className="flex items-center gap-1">
                    {quizData.questions.map((_, qIndex) => {
                      const isAnswered = userAnswers[qIndex] !== undefined;
                      const isCurrent = currentIdx === qIndex;
                      return (
                        <button
                          key={qIndex}
                          type="button"
                          onClick={() => setCurrentIdx(qIndex)}
                          title={`Question ${qIndex + 1}`}
                          className={`w-6 h-6 rounded-md text-[11px] font-bold transition border flex items-center justify-center ${
                            isCurrent
                              ? 'bg-[#5A5A40] text-white border-[#444430] ring-1 ring-[#5A5A40]'
                              : isAnswered
                              ? 'bg-[#FFF2E9] text-[#D96918] border-[#FCD5B5]'
                              : 'bg-[#F9F7F2] text-[#8E8E7E] border-[#E6E2D3] hover:bg-[#F3F3ED]'
                          }`}
                        >
                          {qIndex + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="w-full h-2 bg-[#E6E2D3] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#F27D26] transition-all duration-300"
                    style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question text */}
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-[#434338] leading-snug font-['Newsreader',serif]">
                  {quizData.questions[currentIdx]?.question}
                </h3>
              </div>

              {/* MCQ Options */}
              <div className="space-y-2.5">
                {quizData.questions[currentIdx]?.options.map((opt, optIdx) => {
                  const isSelected = userAnswers[currentIdx] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(currentIdx, optIdx)}
                      className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition text-sm font-medium ${
                        isSelected
                          ? 'bg-[#FFF2E9] border-[#F27D26] text-[#434338] font-semibold shadow-2xs'
                          : 'bg-white border-[#E6E2D3] text-[#434338] hover:bg-[#F9F7F2]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center border shrink-0 ${
                            isSelected
                              ? 'bg-[#F27D26] text-white border-[#D96918]'
                              : 'bg-[#F3F3ED] text-[#70705E] border-[#E6E2D3]'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation buttons: Prev, Next, Submit */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E6E2D3]">
                <button
                  type="button"
                  onClick={() => setCurrentIdx((prev) => Math.max(prev - 1, 0))}
                  disabled={currentIdx === 0}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                    currentIdx === 0
                      ? 'text-[#C9C4B5] cursor-not-allowed'
                      : 'text-[#70705E] hover:bg-[#F3F3ED]'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {currentIdx < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIdx((prev) => Math.min(prev + 1, totalQuestions - 1))}
                    className="px-5 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#444430] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    className="px-6 py-2.5 rounded-xl bg-[#F27D26] hover:bg-[#D96918] text-white text-xs font-bold shadow-md shadow-[#F27D26]/20 active:scale-95 transition"
                  >
                    Submit Quiz
                  </button>
                )}
              </div>
            </div>
          )}

          {/* If Submitted: Full Review Mode of All Questions */}
          {isSubmitted && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-[#434338]">
                Detailed Review & Explanations:
              </h4>

              {quizData.questions.map((q, qIdx) => {
                const selected = userAnswers[qIdx];
                const isCorrect = selected === q.correctIndex;
                return (
                  <div
                    key={qIdx}
                    className={`bg-white rounded-2xl border p-5 space-y-4 ${
                      isCorrect ? 'border-emerald-300' : 'border-rose-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span className="w-6 h-6 rounded-md bg-[#F3F3ED] text-[#434338] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-[#E6E2D3]">
                          {qIdx + 1}
                        </span>
                        <h5 className="font-bold text-sm text-[#434338]">{q.question}</h5>
                      </div>
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 shrink-0">
                          <XCircle className="w-3.5 h-3.5" /> Incorrect
                        </span>
                      )}
                    </div>

                    {/* Options status */}
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => {
                        const isThisCorrect = oIdx === q.correctIndex;
                        const isThisUserSelection = oIdx === selected;

                        let style = 'bg-[#F9F7F2] border-[#E6E2D3] text-[#434338]';
                        if (isThisCorrect) {
                          style = 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold';
                        } else if (isThisUserSelection && !isThisCorrect) {
                          style = 'bg-rose-50 border-rose-300 text-rose-950 line-through';
                        }

                        return (
                          <div
                            key={oIdx}
                            className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 ${style}`}
                          >
                            <span>
                              <strong>{String.fromCharCode(65 + oIdx)}.</strong> {opt}
                            </span>
                            {isThisCorrect && (
                              <span className="text-[11px] font-bold text-emerald-800 shrink-0">
                                Correct Answer
                              </span>
                            )}
                            {isThisUserSelection && !isThisCorrect && (
                              <span className="text-[11px] font-bold text-rose-800 shrink-0">
                                Your choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="p-3.5 rounded-xl bg-[#F9F7F2] border border-[#E6E2D3] text-xs text-[#434338] space-y-1">
                      <p className="font-bold text-[#434338] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#F27D26]" />
                        Explanation:
                      </p>
                      <p className="leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
