import React from 'react';
import { GraduationCap, Heart, Sparkles } from 'lucide-react';
import { PageTab } from '../types';

interface FooterProps {
  onNavigate: (tab: PageTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-16 bg-[#F2F1EC] border-t border-[#E6E2D3] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        {/* Brand info */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#5A5A40] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-[#434338] tracking-tight font-['Outfit']">
              StudyBuddy AI
            </span>
          </div>
          <p className="text-xs text-[#8E8E7E] max-w-sm">
            AI Study Assistant designed specifically for Indian students from Class 5 to Class 12. Supporting Hindi, English & Hinglish.
          </p>
        </div>

        {/* Quick Nav Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[#70705E]">
          <button onClick={() => onNavigate('home')} className="hover:text-[#F27D26] transition">
            Home
          </button>
          <button onClick={() => onNavigate('tutor')} className="hover:text-[#F27D26] transition">
            AI Tutor
          </button>
          <button onClick={() => onNavigate('quiz')} className="hover:text-[#F27D26] transition">
            Quiz
          </button>
          <button onClick={() => onNavigate('notes')} className="hover:text-[#F27D26] transition">
            Notes
          </button>
          <button onClick={() => onNavigate('history')} className="hover:text-[#F27D26] transition">
            History
          </button>
          <span className="text-[#E6E2D3]">•</span>
          <button onClick={() => onNavigate('about')} className="hover:text-[#F27D26] transition">
            About
          </button>
          <button onClick={() => onNavigate('privacy')} className="hover:text-[#F27D26] transition">
            Privacy Policy
          </button>
          <button onClick={() => onNavigate('terms')} className="hover:text-[#F27D26] transition">
            Terms of Use
          </button>
        </div>

        {/* Copyright */}
        <div className="text-xs text-[#8E8E7E] text-center md:text-right">
          <p>© {new Date().getFullYear()} StudyBuddy AI.</p>
          <p className="text-[11px] mt-0.5 text-[#8E8E7E] flex items-center justify-center md:justify-end gap-1">
            <span>CBSE • ICSE • State Boards</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
