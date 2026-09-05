import React, { useState } from 'react';
import {
  Clock,
  Trash2,
  Search,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { AIAnswer, Subject, PageTab } from '../types';
import { AnswerCard } from './AnswerCard';

interface HistoryPageProps {
  history: AIAnswer[];
  onDeleteOne: (id: string) => void;
  onClearAll: () => void;
  onNavigate: (tab: PageTab) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  history,
  onDeleteOne,
  onClearAll,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(history[0]?.id || null);
  const [confirmClear, setConfirmClear] = useState(false);

  const subjects = ['All', 'Mathematics', 'Science', 'English', 'Social Science', 'General'];

  const filtered = history.filter((item) => {
    const matchesSubject = selectedSubject === 'All' || item.subject === selectedSubject;
    const matchesSearch =
      !search.trim() ||
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.finalAnswer.toLowerCase().includes(search.toLowerCase()) ||
      item.simpleExplanation.toLowerCase().includes(search.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E2D3] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#434338] flex items-center gap-2">
            <Clock className="w-7 h-7 text-[#F27D26]" />
            <span>Question & Answer History</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#8E8E7E] mt-0.5">
            Stored locally on your device for quick offline revision
          </p>
        </div>

        {history.length > 0 && (
          <div>
            {confirmClear ? (
              <div className="flex items-center gap-2 p-1 bg-rose-50 border border-rose-200 rounded-xl">
                <span className="text-xs text-rose-700 font-semibold px-2">Clear all?</span>
                <button
                  onClick={() => {
                    onClearAll();
                    setConfirmClear(false);
                  }}
                  className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition"
                >
                  Yes, Clear
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-2.5 py-1 bg-white border border-[#E6E2D3] text-[#434338] rounded-lg text-xs font-medium hover:bg-[#F3F3ED] transition"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E6E2D3] text-xs font-semibold text-[#70705E] hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All History</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filters & Search */}
      {history.length > 0 && (
        <div className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8E8E7E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your past questions or topics..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6E2D3] focus:border-[#5A5A40] focus:ring-2 focus:ring-[#E6E2D3] outline-none text-sm text-[#434338] placeholder:text-[#8E8E7E] transition bg-white"
            />
          </div>

          {/* Subject Filter Chips */}
          <div className="flex flex-wrap gap-1.5">
            {subjects.map((sub) => {
              const active = selectedSubject === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubject(sub)}
                  className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition ${
                    active
                      ? 'bg-[#5A5A40] text-white border-[#444430] shadow-2xs'
                      : 'bg-white text-[#434338] border-[#E6E2D3] hover:bg-[#F3F3ED]'
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* History Items List */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            const dateStr = new Date(item.timestamp).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#E6E2D3] overflow-hidden shadow-2xs transition hover:border-[#5A5A40]"
              >
                {/* Header row */}
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer bg-[#F9F7F2] hover:bg-[#F3F3ED] transition select-none"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#FFF2E9] text-[#F27D26] border border-[#FCD5B5]">
                        {item.subject}
                      </span>
                      <span className="text-[11px] font-medium text-[#70705E]">
                        Class {item.classLevel} • {item.language}
                      </span>
                      <span className="text-[10px] text-[#8E8E7E]">• {dateStr}</span>
                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-[#434338] truncate font-['Newsreader',serif]">
                      Q: {item.question}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteOne(item.id);
                      }}
                      className="p-1.5 text-[#8E8E7E] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Delete this question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="p-1.5 text-[#70705E]">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded full answer card */}
                {isExpanded && (
                  <div className="border-t border-[#E6E2D3] p-2 sm:p-4 bg-[#F9F7F2]/50">
                    <AnswerCard answer={item} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-10 rounded-2xl bg-white border border-[#E6E2D3] text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF2E9] text-[#F27D26] flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#434338] font-['Newsreader',serif]">
              {history.length === 0 ? 'No Questions Saved Yet' : 'No Matching Questions Found'}
            </h3>
            <p className="text-xs sm:text-sm text-[#70705E] max-w-sm mx-auto">
              {history.length === 0
                ? 'Whenever you ask a question on the AI Tutor page, it will be automatically saved here for quick revision.'
                : 'Try adjusting your search query or subject filter to find saved questions.'}
            </p>
          </div>

          {history.length === 0 && (
            <button
              onClick={() => onNavigate('tutor')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F27D26] hover:bg-[#D96918] text-white font-bold text-sm shadow-md shadow-[#F27D26]/20 active:scale-95 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask Your First Question</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
