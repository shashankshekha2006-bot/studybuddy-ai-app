import { QuizReminderSettings, Subject } from '../types';

const REMINDER_KEY = 'studybuddy_quiz_reminder';

export const DEFAULT_REMINDER_SETTINGS: QuizReminderSettings = {
  enabled: true,
  time: '19:30', // 7:30 PM default
  subject: 'Any',
  soundEnabled: true,
  streakCount: 0,
  lastCompletedDate: '',
  lastNotifiedDate: '',
};

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getStoredReminderSettings(): QuizReminderSettings {
  try {
    const raw = localStorage.getItem(REMINDER_KEY);
    if (!raw) return DEFAULT_REMINDER_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      enabled: parsed.enabled ?? true,
      time: parsed.time || '19:30',
      subject: parsed.subject || 'Any',
      soundEnabled: parsed.soundEnabled ?? true,
      streakCount: typeof parsed.streakCount === 'number' ? parsed.streakCount : 0,
      lastCompletedDate: parsed.lastCompletedDate || '',
      lastNotifiedDate: parsed.lastNotifiedDate || '',
    };
  } catch {
    return DEFAULT_REMINDER_SETTINGS;
  }
}

export function saveStoredReminderSettings(settings: QuizReminderSettings): void {
  try {
    localStorage.setItem(REMINDER_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save reminder settings to localStorage', e);
  }
}

export function isQuizCompletedToday(): boolean {
  const settings = getStoredReminderSettings();
  return settings.lastCompletedDate === getTodayDateString();
}

export function recordQuizCompleted(): { newStreak: number; alreadyCompletedToday: boolean } {
  const settings = getStoredReminderSettings();
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  if (settings.lastCompletedDate === today) {
    return { newStreak: settings.streakCount, alreadyCompletedToday: true };
  }

  let newStreak = 1;
  if (settings.lastCompletedDate === yesterday) {
    newStreak = (settings.streakCount || 0) + 1;
  } else {
    newStreak = 1;
  }

  const updated: QuizReminderSettings = {
    ...settings,
    streakCount: newStreak,
    lastCompletedDate: today,
  };

  saveStoredReminderSettings(updated);
  return { newStreak, alreadyCompletedToday: false };
}

export function formatTime12h(time24: string): string {
  if (!time24 || !time24.includes(':')) return '7:30 PM';
  const [hourStr, minStr] = time24.split(':');
  const hour = parseInt(hourStr, 10);
  const min = parseInt(minStr, 10);
  if (isNaN(hour) || isNaN(min)) return time24;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${min.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Gentle melodic chime using Web Audio API (no external file dependencies)
 */
export function playReminderChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Note 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Note 2: B5 (987.77 Hz) slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.16);
    gain2.gain.setValueAtTime(0.15, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.16);
    osc2.stop(now + 0.8);
  } catch (err) {
    console.debug('Audio chime playback omitted:', err);
  }
}

/**
 * Checks and requests browser notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'default';
  }
}

/**
 * Show a browser notification if supported and granted
 */
export function showBrowserNotification(
  title: string,
  options?: NotificationOptions,
  onClick?: () => void
): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission !== 'granted') {
    return false;
  }
  try {
    const notif = new Notification(title, {
      icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎯</text></svg>',
      badge: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⏰</text></svg>',
      ...options,
    });
    if (onClick) {
      notif.onclick = (e) => {
        e.preventDefault();
        window.focus();
        onClick();
        notif.close();
      };
    }
    return true;
  } catch (err) {
    console.debug('Browser notification failed (may be blocked by iframe):', err);
    return false;
  }
}
