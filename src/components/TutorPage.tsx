import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  RotateCcw,
  BookOpen,
  AlertCircle,
  Clock,
  Languages,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';
import { Subject, StudentSettings, AIAnswer } from '../types';
import { AnswerCard } from './AnswerCard';
import { SAMPLE_QUESTIONS } from '../utils/sampleData';

interface TutorPageProps {
  settings: StudentSettings;
  onOpenSettings: () => void;
  onSaveHistory: (answer: AIAnswer) => void;
  initialQuestion?: string;
  initialSubject?: Subject;
}

const SUBJECTS: { id: Subject; label: string; icon: string }[] = [
  { id: 'Mathematics', label: 'Mathematics', icon: '📐' },
  { id: 'Science', label: 'Science', icon: '🔬' },
  { id: 'English', label: 'English', icon: '📖' },
  { id: 'Social Science', label: 'Social Science', icon: '🌍' },
  { id: 'General', label: 'General', icon: '💡' },
];

export const TutorPage: React.FC<TutorPageProps> = ({
  settings,
  onOpenSettings,
  onSaveHistory,
  initialQuestion = '',
  initialSubject = 'Mathematics',
}) => {
  const [subject, setSubject] = useState<Subject>(initialSubject);
  const [question, setQuestion] = useState(initialQuestion);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<AIAnswer | null>(null);
  const answerSectionRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (initialQuestion !== undefined && initialQuestion !== '') {
      setQuestion(initialQuestion);
    }
    if (initialSubject) {
      setSubject(initialSubject);
    }
  }, [initialQuestion, initialSubject]);

  const handleAsk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) {
      setError('Please type your school question first. (कृपया अपना प्रश्न लिखें)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          subject,
          classLevel: settings.classLevel,
          language: settings.language,
          explanationLevel: settings.explanationLevel,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Server returned an error. Please try again.');
      }

      const data = await res.json();
      const newAnswer: AIAnswer = {
        id: `ans_${Date.now()}`,
        question: trimmed,
        subject,
        classLevel: settings.classLevel,
        language: settings.language,
        explanationLevel: settings.explanationLevel,
        finalAnswer: data.finalAnswer,
        simpleExplanation: data.simpleExplanation,
        stepByStepSolution: data.stepByStepSolution || [],
        importantPoints: data.importantPoints || [],
        examTip: data.examTip || '',
        timestamp: Date.now(),
      };

      setCurrentAnswer(newAnswer);
      onSaveHistory(newAnswer);

      setTimeout(() => {
        answerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while connecting to the AI Tutor. Please check your network or try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuestion('');
    setError(null);
    setCurrentAnswer(null);
  };

  const filteredSamples = SAMPLE_QUESTIONS.filter((s) => s.subject === subject);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E2D3] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#434338] flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-[#F27D26]" />
            <span>AI School Tutor</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#8E8E7E] mt-0.5">
            Ask any school question from Class {settings.classLevel} syllabus in Hindi or English
          </p>
        </div>

        {/* Current profile badge */}
        <button
          onClick={onOpenSettings}
          className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F3F3ED] border border-[#E6E2D3] text-xs font-semibold text-[#434338] hover:bg-[#EAE7DD] transition"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#5A5A40]" />
          <span>Class {settings.classLevel}</span>
          <span className="text-[#8E8E7E]">•</span>
          <span>{settings.language}</span>
          <span className="text-[#8E8E7E]">•</span>
          <span>{settings.explanationLevel}</span>
        </button>
      </div>

      {/* Subject Selection Tabs */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#8E8E7E]">
          Select Subject (विषय):
        </label>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((sub) => {
            const active = subject === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSubject(sub.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition ${
                  active
                    ? 'bg-[#5A5A40] text-white border-[#444430] shadow-2xs'
                    : 'bg-white text-[#434338] border-[#E6E2D3] hover:bg-[#F3F3ED]'
                }`}
              >
                <span>{sub.icon}</span>
                <span>{sub.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Input Form */}
      <div className="bg-white rounded-2xl border border-[#E6E2D3] shadow-xs p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between text-xs text-[#8E8E7E]">
          <span className="font-semibold flex items-center gap-1.5 text-[#434338]">
            <BookOpen className="w-4 h-4 text-[#5A5A40]" />
            Enter your question or math problem:
          </span>
          <span className="text-[#8E8E7E]">{question.length}/2000 characters</span>
        </div>

        <textarea
          id="question-input"
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleAsk();
            }
          }}
          placeholder={`Type your ${subject} doubt here in English, हिन्दी, or Hinglish...\nExample: "How to solve quadratic equation 2x² + 5x - 3 = 0 step by step?" or "प्रकाश संश्लेषण क्या है?"`}
          rows={4}
          maxLength={2000}
          className="w-full p-4 rounded-xl border border-[#E6E2D3] focus:border-[#5A5A40] focus:ring-2 focus:ring-[#E6E2D3] outline-none text-[#434338] text-base leading-relaxed placeholder:text-[#8E8E7E] transition bg-white"
        />

        {/* Error notice */}
        {error && (
          <div className="p-3.5 rounded-xl bg-[#FFF2E9] border border-[#FCD5B5] flex items-start gap-2.5 text-xs sm:text-sm text-[#D96918]">
            <AlertCircle className="w-4 h-4 text-[#F27D26] shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Oops! Could not answer question</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-[#8E8E7E]">
            <Languages className="w-4 h-4 text-[#5A5A40]" />
            <span>AI will respond in <strong className="text-[#434338]">{settings.language}</strong> for Class <strong className="text-[#434338]">{settings.classLevel}</strong></span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {question && (
              <button
                type="button"
                onClick={handleClear}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl text-[#70705E] hover:text-[#434338] hover:bg-[#F2F1EC] text-sm font-medium transition"
              >
                Clear
              </button>
            )}

            <button
              type="button"
              onClick={() => handleAsk()}
              disabled={loading || !question.trim()}
              className={`flex-1 sm:flex-initial px-6 py-3 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 ${
                loading || !question.trim()
                  ? 'bg-[#E6E2D3] text-[#8E8E7E] cursor-not-allowed'
                  : 'bg-[#F27D26] hover:bg-[#D96918] text-white shadow-[#F27D26]/20 active:scale-95'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Ask AI Tutor</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sample Quick Questions for current subject */}
      {!currentAnswer && !loading && (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#8E8E7E]">
            Suggested Textbook Questions ({subject}):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredSamples.length > 0
              ? filteredSamples.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuestion(sample.en);
                      setError(null);
                    }}
                    className="p-3 rounded-xl bg-white border border-[#E6E2D3] hover:border-[#5A5A40] hover:bg-[#F3F3ED]/50 text-left transition shadow-2xs text-xs font-medium text-[#434338]"
                  >
                    <p className="text-[#434338] font-semibold">{sample.en}</p>
                    <p className="text-[#8E8E7E] mt-1 font-['Noto_Sans_Devanagari']">{sample.hi}</p>
                  </button>
                ))
              : SAMPLE_QUESTIONS.slice(0, 2).map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSubject(sample.subject);
                      setQuestion(sample.en);
                      setError(null);
                    }}
                    className="p-3 rounded-xl bg-white border border-[#E6E2D3] hover:border-[#5A5A40] hover:bg-[#F3F3ED]/50 text-left transition shadow-2xs text-xs font-medium text-[#434338]"
                  >
                    <p className="text-[#434338] font-semibold">{sample.en}</p>
                    <p className="text-[#8E8E7E] mt-1">{sample.hi}</p>
                  </button>
                ))}
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="p-8 rounded-2xl bg-white border border-[#E6E2D3] text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-[#FFF2E9] text-[#F27D26] flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-[#434338]">
              StudyBuddy AI is preparing your solution...
            </p>
            <p className="text-xs text-[#8E8E7E]">
              Aligning step-by-step logic with Class {settings.classLevel} {subject} curriculum in {settings.language}
            </p>
          </div>
          <div className="max-w-md mx-auto space-y-2 pt-2">
            <div className="h-4 bg-[#E6E2D3] rounded-md w-full" />
            <div className="h-4 bg-[#E6E2D3] rounded-md w-4/5 mx-auto" />
            <div className="h-4 bg-[#E6E2D3] rounded-md w-2/3 mx-auto" />
          </div>
        </div>
      )}

      {/* Answer Presentation */}
      {currentAnswer && !loading && (
        <div ref={answerSectionRef} className="space-y-4 scroll-mt-20">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#434338]">Your AI Solution</h2>
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setQuestion('');
                setCurrentAnswer(null);
              }}
              className="text-xs font-semibold text-[#F27D26] hover:text-[#D96918] flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ask Another Question</span>
            </button>
          </div>

          <AnswerCard
            answer={currentAnswer}
            onSaveBookmark={() => onSaveHistory(currentAnswer)}
            isBookmarked={true}
          />
        </div>
      )}
    </div>
  );
};
