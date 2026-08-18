import type { Card, Grade, Rating } from 'ts-fsrs';

export interface VocabEntry {
  id: number;
  word: string;
  pos: string | null;
  meaningVi: string;
  ipa: string | null;
  tags: string[];
}

/** One row per vocabulary id in the `cards` IndexedDB store. */
export interface CardRow extends Card {
  vocabId: number;
}

export interface ReviewLogRow {
  id?: number; // autoIncrement
  vocabId: number;
  rating: Rating;
  reviewedAt: Date;
  scheduled_days: number;
  state: Card['state'];
}

export type StudyMode = 'flashcard' | 'multipleChoice' | 'typing' | 'listening';

export interface StudyModeProps {
  vocabId: number;
  onComplete: (grade: Grade) => void;
}

export interface NewWordsToday {
  date: string; // YYYY-MM-DD (local)
  count: number;
}

export interface AppSettings {
  newCardsPerDay: number;
  newWordsIntroducedToday: NewWordsToday;
  enabledModes: StudyMode[];
  firstRunAt: string | null; // ISO timestamp, null until seeded
  settingsVersion: number;
}

/** Bump when DEFAULT_SETTINGS changes in a way that should override old stored settings. */
export const CURRENT_SETTINGS_VERSION = 2;

export const DEFAULT_SETTINGS: AppSettings = {
  newCardsPerDay: 20,
  newWordsIntroducedToday: { date: '', count: 0 },
  enabledModes: ['flashcard', 'typing'],
  firstRunAt: null,
  settingsVersion: CURRENT_SETTINGS_VERSION,
};
