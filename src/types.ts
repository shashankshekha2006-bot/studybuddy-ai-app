export type Subject = 'Mathematics' | 'Science' | 'English' | 'Social Science' | 'General';

export type ClassLevel = 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type LanguagePreference = 'English' | 'Hindi' | 'Hinglish';

export type ExplanationLevel = 'Simple' | 'Detailed' | 'Exam-focused';

export interface StudentSettings {
  classLevel: ClassLevel;
  language: LanguagePreference;
  explanationLevel: ExplanationLevel;
}

export interface AIAnswer {
  id: string;
  question: string;
  subject: Subject;
  classLevel: ClassLevel;
  language: LanguagePreference;
  explanationLevel: ExplanationLevel;
  finalAnswer: string;
  simpleExplanation: string;
  stepByStepSolution: string[];
  importantPoints: string[];
  examTip: string;
  timestamp: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizPayload {
  classLevel: ClassLevel;
  subject: Subject;
  topic: string;
  numQuestions: number;
  language: LanguagePreference;
}

export interface QuizData {
  title: string;
  topic: string;
  subject: Subject;
  classLevel: ClassLevel;
  questions: QuizQuestion[];
}

export interface NoteDefinition {
  term: string;
  definition: string;
}

export interface StudyNotes {
  id: string;
  title: string;
  topic: string;
  subject: Subject;
  classLevel: ClassLevel;
  language: LanguagePreference;
  importantDefinitions: NoteDefinition[];
  keyPoints: string[];
  examples: string[];
  quickRevision: string[];
  timestamp: number;
}

export type PageTab = 'home' | 'tutor' | 'quiz' | 'notes' | 'history' | 'about' | 'privacy' | 'terms';

export interface QuizReminderSettings {
  enabled: boolean;
  time: string; // "HH:MM" 24h format
  subject: Subject | 'Any';
  soundEnabled: boolean;
  streakCount: number;
  lastCompletedDate: string; // "YYYY-MM-DD"
  lastNotifiedDate: string; // "YYYY-MM-DD"
}
