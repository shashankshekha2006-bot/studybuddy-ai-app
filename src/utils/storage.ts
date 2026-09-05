import { StudentSettings, AIAnswer, StudyNotes } from '../types';

const SETTINGS_KEY = 'studybuddy_settings';
const HISTORY_KEY = 'studybuddy_history';
const SAVED_NOTES_KEY = 'studybuddy_saved_notes';

export const DEFAULT_SETTINGS: StudentSettings = {
  classLevel: 10,
  language: 'English',
  explanationLevel: 'Simple',
};

export function getStoredSettings(): StudentSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      classLevel: parsed.classLevel || 10,
      language: parsed.language || 'English',
      explanationLevel: parsed.explanationLevel || 'Simple',
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: StudentSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings to localStorage', e);
  }
}

export function getStoredHistory(): AIAnswer[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAnswerToHistory(answer: AIAnswer): void {
  try {
    const history = getStoredHistory();
    // Filter out if exact id exists
    const updated = [answer, ...history.filter((h) => h.id !== answer.id)].slice(0, 50); // limit to 50
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save answer to localStorage', e);
  }
}

export function deleteHistoryItem(id: string): AIAnswer[] {
  try {
    const history = getStoredHistory().filter((h) => h.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return history;
  } catch {
    return [];
  }
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.warn('Failed to clear history from localStorage', e);
  }
}

export function getStoredNotes(): StudyNotes[] {
  try {
    const raw = localStorage.getItem(SAVED_NOTES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveNotesToStorage(note: StudyNotes): void {
  try {
    const notes = getStoredNotes();
    const updated = [note, ...notes.filter((n) => n.id !== note.id)].slice(0, 30);
    localStorage.setItem(SAVED_NOTES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save notes to localStorage', e);
  }
}

export function deleteNoteFromStorage(id: string): StudyNotes[] {
  try {
    const notes = getStoredNotes().filter((n) => n.id !== id);
    localStorage.setItem(SAVED_NOTES_KEY, JSON.stringify(notes));
    return notes;
  } catch {
    return [];
  }
}
