import React, { useState, useEffect } from 'react';
import {
  FileText,
  Copy,
  Check,
  Printer,
  Bookmark,
  Sparkles,
  Loader2,
  Trash2,
  BookOpen,
  CheckCircle2,
  ListOrdered,
  SlidersHorizontal,
  Download,
} from 'lucide-react';
import { Subject, StudentSettings, StudyNotes } from '../types';
import { getStoredNotes, saveNotesToStorage, deleteNoteFromStorage } from '../utils/storage';
import { POPULAR_QUIZ_TOPICS } from '../utils/sampleData';

interface NotesPageProps {
  settings: StudentSettings;
  onOpenSettings: () => void;
}

const SUBJECTS: Subject[] = ['Science', 'Mathematics', 'Social Science', 'English', 'General'];

export const NotesPage: React.FC<NotesPageProps> = ({ settings, onOpenSettings }) => {
  const [subject, setSubject] = useState<Subject>('Science');
  const [topic, setTopic] = useState('Light: Reflection & Refraction');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentNotes, setCurrentNotes] = useState<StudyNotes | null>(null);
  const [savedNotes, setSavedNotes] = useState<StudyNotes[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSavedNotes(getStoredNotes());
  }, []);

  const handleGenerateNotes = async () => {
    if (!topic.trim()) {
      setError('Please enter a chapter or topic name to generate notes.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classLevel: settings.classLevel,
          subject,
          topic: topic.trim(),
          language: settings.language,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate notes. Please try again.');
      }

      const data: StudyNotes = await res.json();
      setCurrentNotes(data);
      saveNotesToStorage(data);
      setSavedNotes(getStoredNotes());
    } catch (err: any) {
      setError(err.message || 'Failed to generate study notes.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyNotes = async () => {
    if (!currentNotes) return;
    const text = `📖 STUDYBUDDY REVISION NOTES
${currentNotes.title}
Class ${currentNotes.classLevel} | ${currentNotes.subject} (${currentNotes.language})

📌 IMPORTANT DEFINITIONS:
${currentNotes.importantDefinitions.map((d) => `• ${d.term}: ${d.definition}`).join('\n')}

⭐ KEY CONCEPTS & POINTS:
${currentNotes.keyPoints.map((k, i) => `${i + 1}. ${k}`).join('\n')}

💡 RELATABLE EXAMPLES:
${currentNotes.examples.map((e) => `• ${e}`).join('\n')}

⚡ QUICK REVISION & FORMULA CHECKLIST:
${currentNotes.quickRevision.map((q) => `✓ ${q}`).join('\n')}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      // ignore print error in sandbox
    }
  };

  const handleDownloadNotes = () => {
    if (!currentNotes) return;
    const text = `📖 STUDYBUDDY REVISION NOTES
${currentNotes.title}
Class ${currentNotes.classLevel} | ${currentNotes.subject} (${currentNotes.language})

📌 IMPORTANT DEFINITIONS:
${currentNotes.importantDefinitions.map((d) => `• ${d.term}: ${d.definition}`).join('\n')}

⭐ KEY CONCEPTS & POINTS:
${currentNotes.keyPoints.map((k, i) => `${i + 1}. ${k}`).join('\n')}

💡 RELATABLE EXAMPLES:
${currentNotes.examples.map((e) => `• ${e}`).join('\n')}

⚡ QUICK REVISION & FORMULA CHECKLIST:
${currentNotes.quickRevision.map((q) => `✓ ${q}`).join('\n')}`;

    try {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentNotes.title.replace(/[^a-zA-Z0-9]/g, '_')}_Notes.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // fallback
    }
  };

  const handleDeleteSaved = (id: string) => {
    const updated = deleteNoteFromStorage(id);
    setSavedNotes(updated);
    if (currentNotes?.id === id) {
      setCurrentNotes(null);
    }
  };

  const currentSubjectTopics =
    POPULAR_QUIZ_TOPICS.find((p) => p.subject === subject)?.topics || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E2D3] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#434338] flex items-center gap-2">
            <FileText className="w-7 h-7 text-[#F27D26]" />
            <span>Smart Revision Notes</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#8E8E7E] mt-0.5">
            Instant exam-oriented summary notes with definitions, key points, examples & formulas
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

      {/* Input Form */}
      <div className="bg-white rounded-2xl border border-[#E6E2D3] shadow-xs p-6 space-y-5">
        {/* Subject selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#8E8E7E] mb-2">
            Subject:
          </label>
          <div className="flex flex-wrap gap-2">
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
                  className={`py-2 px-3.5 rounded-xl text-xs font-bold border transition ${
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

        {/* Topic input */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#8E8E7E]">
            Topic or Chapter to Summarize:
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Periodic Classification of Elements, Tenses, Trigonometry..."
            className="w-full p-3.5 rounded-xl border border-[#E6E2D3] focus:border-[#5A5A40] focus:ring-2 focus:ring-[#E6E2D3] outline-none text-[#434338] text-sm font-medium transition bg-white placeholder:text-[#8E8E7E]"
          />

          {/* Quick topic recommendations */}
          <div className="pt-1">
            <span className="text-[11px] text-[#8E8E7E] block mb-1 font-medium">
              Suggested Class {settings.classLevel} Chapters:
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

        {error && (
          <div className="p-3 rounded-xl bg-[#FFF2E9] border border-[#FCD5B5] text-xs text-[#D96918]">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGenerateNotes}
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
              <span>Generating NCERT High-Yield Notes...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Revision Notes</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Notes Display */}
      {currentNotes && (
        <div className="bg-white rounded-2xl border border-[#E6E2D3] shadow-xs overflow-hidden space-y-6 p-6 sm:p-8">
          {/* Action header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6E2D3] pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-[#FFF2E9] text-[#F27D26] border border-[#FCD5B5]">
                  {currentNotes.subject}
                </span>
                <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-[#F3F3ED] text-[#434338] border border-[#E6E2D3]">
                  Class {currentNotes.classLevel}
                </span>
                <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-[#F3F3ED] text-[#434338] border border-[#E6E2D3]">
                  {currentNotes.language}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#434338] font-['Newsreader',serif]">
                {currentNotes.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyNotes}
                className="px-3 py-1.5 rounded-xl border border-[#E6E2D3] hover:bg-[#F3F3ED] text-xs font-semibold text-[#434338] flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5 text-[#5A5A40]" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownloadNotes}
                className="px-3 py-1.5 rounded-xl border border-[#E6E2D3] hover:bg-[#F3F3ED] text-xs font-semibold text-[#434338] flex items-center gap-1.5 transition"
                title="Download notes file"
              >
                <Download className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>Save</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-xl border border-[#E6E2D3] hover:bg-[#F3F3ED] text-xs font-semibold text-[#434338] flex items-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* 1. Important Definitions */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#5A5A40] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#F27D26]" />
              <span>1. Important Definitions (महत्वपूर्ण परिभाषाएं)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentNotes.importantDefinitions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#F9F7F2] border border-[#E6E2D3] space-y-1 hover:border-[#5A5A40] transition"
                >
                  <p className="text-sm font-bold text-[#434338]">{item.term}</p>
                  <p className="text-xs sm:text-sm text-[#70705E] leading-relaxed">
                    {item.definition}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Key Points */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#5A5A40] flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-[#F27D26]" />
              <span>2. Key Points & Concepts (मुख्य बिंदु)</span>
            </h3>
            <div className="space-y-2">
              {currentNotes.keyPoints.map((pt, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E6E2D3] shadow-2xs hover:border-[#5A5A40] transition"
                >
                  <span className="w-5 h-5 rounded-full bg-[#5A5A40] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-[#434338] leading-relaxed font-medium">
                    {pt}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Examples */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#5A5A40] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F27D26]" />
              <span>3. Practical & Everyday Examples (व्यावहारिक उदाहरण)</span>
            </h3>
            <div className="space-y-2">
              {currentNotes.examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#F3F3ED] border border-[#E6E2D3] text-xs sm:text-sm text-[#434338] flex items-start gap-2"
                >
                  <span className="font-bold text-[#5A5A40] shrink-0">Ex {idx + 1}:</span>
                  <span className="leading-relaxed">{ex}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Quick Revision Checklist */}
          <div className="p-5 rounded-2xl bg-[#FFF2E9] border border-[#FCD5B5] space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#D96918] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#F27D26]" />
              <span>4. Quick Exam Revision & Formula Checklist</span>
            </h3>
            <ul className="space-y-2">
              {currentNotes.quickRevision.map((rev, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[#434338]">
                  <span className="text-[#F27D26] font-bold shrink-0 mt-0.5">✓</span>
                  <span className="leading-relaxed font-medium">{rev}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Saved Notes History Drawer/List */}
      {savedNotes.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#E6E2D3]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#434338] flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-[#5A5A40]" />
              <span>Your Saved Notes ({savedNotes.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedNotes.map((n) => (
              <div
                key={n.id}
                className="p-4 rounded-xl bg-white border border-[#E6E2D3] hover:border-[#5A5A40] transition shadow-2xs flex items-start justify-between gap-3 group"
              >
                <div
                  onClick={() => {
                    setCurrentNotes(n);
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFF2E9] text-[#D96918] border border-[#FCD5B5]">
                      {n.subject}
                    </span>
                    <span className="text-[10px] text-[#8E8E7E]">Class {n.classLevel}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#434338] group-hover:text-[#F27D26] transition line-clamp-1">
                    {n.title}
                  </h4>
                  <p className="text-xs text-[#8E8E7E] line-clamp-1 mt-0.5">
                    {n.importantDefinitions[0]?.definition || n.keyPoints[0]}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteSaved(n.id)}
                  className="p-1.5 text-[#8E8E7E] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                  title="Delete note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
