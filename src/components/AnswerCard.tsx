import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Lightbulb,
  ListOrdered,
  Award,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Bookmark,
  Share2,
  BookOpen,
} from 'lucide-react';
import { AIAnswer } from '../types';

interface AnswerCardProps {
  answer: AIAnswer;
  onSaveBookmark?: (answer: AIAnswer) => void;
  isBookmarked?: boolean;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({
  answer,
  onSaveBookmark,
  isBookmarked = false,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3500);
  };

  // Stop speaking if component unmounts
  useEffect(() => {
    return () => {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } catch {
        // ignore speech cancel error
      }
    };
  }, []);

  const handleToggleSpeech = () => {
    try {
      if (!('speechSynthesis' in window)) {
        showToast('Text-to-speech is not supported on this browser/device.');
        return;
      }

      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      window.speechSynthesis.cancel();
      const textToSpeak = `${answer.finalAnswer}. ${answer.simpleExplanation}. Exam Tip: ${answer.examTip}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      // If Hindi, attempt to find a Hindi voice
      if (answer.language === 'Hindi') {
        const voices = window.speechSynthesis.getVoices();
        const hindiVoice = voices.find((v) => v.lang.startsWith('hi') || v.name.includes('Hindi'));
        if (hindiVoice) utterance.voice = hindiVoice;
      }

      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    } catch {
      showToast('Audio playback could not be started in this preview.');
      setIsSpeaking(false);
    }
  };

  const handleCopy = async () => {
    const fullText = `📚 StudyBuddy AI Solution
Class ${answer.classLevel} | ${answer.subject}

🎯 FINAL ANSWER:
${answer.finalAnswer}

💡 SIMPLE EXPLANATION:
${answer.simpleExplanation}

📝 STEP-BY-STEP SOLUTION:
${answer.stepByStepSolution.map((s, i) => `${i + 1}. ${s}`).join('\n')}

⭐ IMPORTANT POINTS:
${answer.importantPoints.map((p) => `• ${p}`).join('\n')}

🏆 EXAM TIP:
${answer.examTip}`;

    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E6E2D3] shadow-xs overflow-hidden transition hover:border-[#5A5A40]">
      {/* Question Header & Meta */}
      <div className="px-5 py-4 bg-[#F9F7F2] border-b border-[#E6E2D3] flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#FFF2E9] text-[#F27D26] border border-[#FCD5B5]">
            {answer.subject}
          </span>
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#F3F3ED] text-[#434338] border border-[#E6E2D3]">
            Class {answer.classLevel}
          </span>
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#F3F3ED] text-[#434338] border border-[#E6E2D3]">
            {answer.language}
          </span>
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#EFECE2] text-[#5A5A40] border border-[#DCD7C7]">
            {answer.explanationLevel}
          </span>
        </div>

        {/* Action icons: Audio, Copy, Bookmark */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleToggleSpeech}
            className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
              isSpeaking
                ? 'bg-[#F27D26] text-white'
                : 'text-[#70705E] hover:text-[#434338] hover:bg-[#F2F1EC]'
            }`}
            title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
            aria-label="Toggle speech"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline text-[11px]">{isSpeaking ? 'Stop' : 'Listen'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-2 text-[#70705E] hover:text-[#434338] hover:bg-[#F2F1EC] rounded-lg text-xs font-medium flex items-center gap-1 transition"
            title="Copy answer"
            aria-label="Copy solution"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {onSaveBookmark && (
            <button
              onClick={() => onSaveBookmark(answer)}
              className={`p-2 rounded-lg text-xs font-medium transition ${
                isBookmarked
                  ? 'text-[#F27D26] bg-[#FFF2E9]'
                  : 'text-[#70705E] hover:text-[#434338] hover:bg-[#F2F1EC]'
              }`}
              title="Save to history"
              aria-label="Bookmark"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#F27D26]' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {toastNotice && (
        <div className="px-5 py-2 bg-[#FFF2E9] border-b border-[#FCD5B5] text-xs text-[#D96918] flex items-center justify-between">
          <span>{toastNotice}</span>
          <button onClick={() => setToastNotice(null)} className="text-[#D96918] font-bold text-xs">✕</button>
        </div>
      )}

      {/* Question prompt display with serif font touch */}
      <div className="px-6 pt-5 pb-3">
        <h3 className="text-lg sm:text-xl font-bold text-[#434338] font-['Newsreader',serif] flex items-start gap-2 leading-snug">
          <span className="text-[#F27D26] shrink-0 font-extrabold font-sans">Q:</span>
          <span>{answer.question}</span>
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {/* 1. Final Answer */}
        <div className="p-4 rounded-xl bg-[#FFF2E9] border border-[#FCD5B5] text-[#434338]">
          <div className="flex items-center gap-2 mb-1.5 text-xs font-bold uppercase tracking-wider text-[#D96918]">
            <CheckCircle className="w-4 h-4 text-[#F27D26]" />
            <span>Final Answer (संक्षिप्त उत्तर)</span>
          </div>
          <p className="text-[#434338] font-bold text-base sm:text-lg leading-relaxed">
            {answer.finalAnswer}
          </p>
        </div>

        {/* 2. Simple Explanation */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5A5A40]">
            <Lightbulb className="w-4 h-4 text-[#F27D26]" />
            <span>Simple Explanation (सरल व्याख्या)</span>
          </div>
          <p className="text-[#434338] text-sm sm:text-base leading-relaxed bg-[#F9F7F2] p-4 rounded-xl border border-[#E6E2D3]">
            {answer.simpleExplanation}
          </p>
        </div>

        {/* 3. Step-by-Step Solution */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5A5A40]">
            <ListOrdered className="w-4 h-4 text-[#F27D26]" />
            <span>Step-by-Step Solution (चरण-दर-चरण समाधान)</span>
          </div>
          <div className="space-y-2.5">
            {answer.stepByStepSolution.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-[#E6E2D3] shadow-2xs hover:border-[#5A5A40] transition"
              >
                <span className="w-6 h-6 rounded-full bg-[#5A5A40] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-[#434338] text-sm leading-relaxed flex-1 font-medium">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Important Points */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5A5A40]">
            <BookOpen className="w-4 h-4 text-[#F27D26]" />
            <span>Important Points (महत्वपूर्ण बिंदु)</span>
          </div>
          <div className="p-4 rounded-xl bg-[#F9F7F2] border border-[#E6E2D3]">
            <ul className="space-y-2">
              {answer.importantPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-[#434338]">
                  <span className="text-[#F27D26] font-bold shrink-0 mt-0.5">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 5. Exam Tip */}
        <div className="p-4 rounded-xl bg-[#F3F3ED] border border-[#E6E2D3] text-[#434338]">
          <div className="flex items-center gap-2 mb-1.5 text-xs font-bold uppercase tracking-wider text-[#5A5A40]">
            <Award className="w-4 h-4 text-[#F27D26]" />
            <span>Exam Tip (परीक्षा के लिए विशेष सलाह)</span>
          </div>
          <p className="text-sm font-semibold text-[#434338] leading-relaxed">
            {answer.examTip}
          </p>
        </div>
      </div>
    </div>
  );
};
