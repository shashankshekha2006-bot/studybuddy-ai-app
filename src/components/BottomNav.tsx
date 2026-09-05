import React from 'react';
import { Home, Sparkles, HelpCircle, FileText, Clock } from 'lucide-react';
import { PageTab } from '../types';

interface BottomNavProps {
  currentTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs: { id: PageTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'tutor', label: 'AI Tutor', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'quiz', label: 'Quiz', icon: <HelpCircle className="w-5 h-5" /> },
    { id: 'notes', label: 'Notes', icon: <FileText className="w-5 h-5" /> },
    { id: 'history', label: 'History', icon: <Clock className="w-5 h-5" /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F9F7F2]/95 backdrop-blur border-t border-[#E6E2D3] px-2 py-1.5 shadow-lg shadow-[#434338]/5">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const active = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[60px] py-1 px-2 rounded-xl transition ${
                active
                  ? 'text-[#5A5A40] font-bold'
                  : 'text-[#8E8E7E] hover:text-[#434338]'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition ${
                  active ? 'bg-[#5A5A40] text-white shadow-2xs' : ''
                }`}
              >
                {tab.icon}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
