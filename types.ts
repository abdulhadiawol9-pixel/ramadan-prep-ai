
export interface DailyLog {
  id: string;
  date: string;
  quranPages: number;
  prayers: string[]; // ['Fajr', 'Dhuhr', etc]
  dhikrCount: number;
  sleepHours: number;
  exerciseMinutes: number;
  hydrationMl: number;
  kindnessNote: string;
  reflection: string;
}

export interface AIInsight {
  summary: string;
  suggestions: string[];
  motivation: string;
  spiritualLevel: 'Improving' | 'Stable' | 'Needs Focus';
}

export interface RamadanInfo {
  daysRemaining: number;
  startDate: string;
  tips: string[];
  sources: { title: string; uri: string }[];
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  LOGS = 'logs',
  COACH = 'coach',
  INSIGHTS = 'insights'
}
