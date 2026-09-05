import { Subject } from '../types';

export interface SamplePrompt {
  subject: Subject;
  classRange: string;
  en: string;
  hi: string;
}

export const SAMPLE_QUESTIONS: SamplePrompt[] = [
  {
    subject: 'Science',
    classRange: 'Class 8-10',
    en: 'Explain Photosynthesis with its balanced chemical equation and steps.',
    hi: 'प्रकाश संश्लेषण (Photosynthesis) को इसके रासायनिक समीकरण और चरणों के साथ समझाइए।',
  },
  {
    subject: 'Mathematics',
    classRange: 'Class 9-10',
    en: 'Solve the quadratic equation 2x² + 5x - 3 = 0 step-by-step.',
    hi: 'द्विघात समीकरण 2x² + 5x - 3 = 0 को चरण-दर-चरण हल कीजिए।',
  },
  {
    subject: 'Science',
    classRange: 'Class 9-11',
    en: "What is Newton's Third Law of Motion? Give 2 everyday examples.",
    hi: 'न्यूटन का गति का तीसरा नियम क्या है? दैनिक जीवन के 2 उदाहरण दीजिए।',
  },
  {
    subject: 'Social Science',
    classRange: 'Class 8-10',
    en: 'What is Federalism and how does power sharing work in India?',
    hi: 'संघवाद (Federalism) क्या है और भारत में सत्ता की साझेदारी कैसे काम करती है?',
  },
  {
    subject: 'English',
    classRange: 'Class 6-10',
    en: 'Explain the difference between Active and Passive Voice with easy rules.',
    hi: 'Active और Passive Voice में क्या अंतर है? आसान नियमों के साथ समझाइए।',
  },
  {
    subject: 'Mathematics',
    classRange: 'Class 7-9',
    en: 'What is Pythagoras Theorem? Show how to find the hypotenuse.',
    hi: 'पाइथागोरस प्रमेय क्या है? कर्ण (Hypotenuse) निकालने का तरीका बताइए।',
  },
  {
    subject: 'General',
    classRange: 'Class 5-12',
    en: 'How to make a smart daily study timetable for Board Exam preparation?',
    hi: 'बोर्ड परीक्षा की तैयारी के लिए एक स्मार्ट दैनिक अध्ययन समय सारणी कैसे बनाएं?',
  },
];

export const POPULAR_QUIZ_TOPICS: { subject: Subject; topics: string[] }[] = [
  {
    subject: 'Science',
    topics: ['Chemical Reactions & Equations', 'Light: Reflection & Refraction', 'Life Processes', 'Electricity & Ohm Law', 'Acids, Bases & Salts'],
  },
  {
    subject: 'Mathematics',
    topics: ['Quadratic Equations', 'Trigonometry & Heights', 'Linear Equations in 2 Variables', 'Surface Areas & Volumes', 'Probability & Statistics'],
  },
  {
    subject: 'Social Science',
    topics: ['Nationalism in India', 'Resources & Development', 'Power Sharing & Federalism', 'Sectors of Indian Economy', 'Making of the Constitution'],
  },
  {
    subject: 'English',
    topics: ['Tenses & Verb Agreement', 'Direct & Indirect Speech', 'Active & Passive Voice', 'Formal Letter Writing Rules', 'Prepositions & Conjunctions'],
  },
  {
    subject: 'General',
    topics: ['Mental Math Tricks', 'Scientific Inventions & Discoveries', 'Geography of India', 'Environmental Awareness', 'Basic Computer Science'],
  },
];
