import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { State } from 'ts-fsrs';
import type { AppSettings, CardRow, ReviewLogRow } from '../types';
import { CURRENT_SETTINGS_VERSION, DEFAULT_SETTINGS } from '../types';
import { todayLocalDateString } from './date';

interface VocabDB extends DBSchema {
  cards: {
    key: number; // vocabId
    value: CardRow;
    indexes: { 'by-due': Date; 'by-state': number };
  };
  reviewLogs: {
    key: number; // autoIncrement id
    value: ReviewLogRow;
    indexes: { 'by-vocabId': number };
  };
  settings: {
    key: string;
    value: { key: string; value: AppSettings };
  };
}

const DB_NAME = 'vocab-fsrs-db';
const DB_VERSION = 1;
const SETTINGS_KEY = 'settings';

let dbPromise: Promise<IDBPDatabase<VocabDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<VocabDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const cardStore = db.createObjectStore('cards', { keyPath: 'vocabId' });
        cardStore.createIndex('by-due', 'due');
        cardStore.createIndex('by-state', 'state');

        const logStore = db.createObjectStore('reviewLogs', {
          keyPath: 'id',
          autoIncrement: true,
        });
        logStore.createIndex('by-vocabId', 'vocabId');

        db.createObjectStore('settings', { keyPath: 'key' });
      },
    });
  }
  return dbPromise;
}

export async function isSeeded(): Promise<boolean> {
  const db = await getDB();
  const count = await db.count('cards');
  return count > 0;
}

export async function putCards(cards: CardRow[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('cards', 'readwrite');
  await Promise.all([...cards.map((c) => tx.store.put(c)), tx.done]);
}

export async function putCard(card: CardRow): Promise<void> {
  const db = await getDB();
  await db.put('cards', card);
}

export async function getCard(vocabId: number): Promise<CardRow | undefined> {
  const db = await getDB();
  return db.get('cards', vocabId);
}

export async function getAllCards(): Promise<CardRow[]> {
  const db = await getDB();
  return db.getAll('cards');
}

export async function getDueCards(now: Date): Promise<CardRow[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('cards', 'by-due');
  return all.filter((c) => c.state !== State.New && c.due <= now);
}

export async function getNewCards(limit: number): Promise<CardRow[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('cards', 'by-state', State.New);
  return all.sort((a, b) => a.vocabId - b.vocabId).slice(0, limit);
}

export async function countByState(): Promise<Record<number, number>> {
  const db = await getDB();
  const all = await db.getAll('cards');
  const counts: Record<number, number> = {};
  for (const c of all) counts[c.state] = (counts[c.state] ?? 0) + 1;
  return counts;
}

export async function addReviewLog(log: ReviewLogRow): Promise<void> {
  const db = await getDB();
  await db.add('reviewLogs', log);
}

export async function getSettings(): Promise<AppSettings> {
  const db = await getDB();
  const row = await db.get('settings', SETTINGS_KEY);
  if (!row) return DEFAULT_SETTINGS;

  // One-time migration: pre-v2 settings always had all 4 modes enabled (the old default).
  // v2 simplifies the default study flow to flashcard + typing only.
  if ((row.value.settingsVersion ?? 1) < CURRENT_SETTINGS_VERSION) {
    const migrated: AppSettings = {
      ...row.value,
      enabledModes: DEFAULT_SETTINGS.enabledModes,
      settingsVersion: CURRENT_SETTINGS_VERSION,
    };
    await saveSettings(migrated);
    return migrated;
  }

  return row.value;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', { key: SETTINGS_KEY, value: settings });
}

/**
 * Spends one slot of today's new-word budget. Called only when a New-state card is actually
 * completed (rated) — not merely queued — so an abandoned session's unfinished new words stay
 * visible and simply reappear the next time a queue is built today.
 */
export async function incrementNewWordsIntroducedToday(now = new Date()): Promise<void> {
  const settings = await getSettings();
  const today = todayLocalDateString(now);
  const currentCount = settings.newWordsIntroducedToday.date === today ? settings.newWordsIntroducedToday.count : 0;
  await saveSettings({
    ...settings,
    newWordsIntroducedToday: { date: today, count: currentCount + 1 },
  });
}

export async function resetAllProgress(): Promise<void> {
  const db = await getDB();
  await Promise.all([
    db.clear('cards'),
    db.clear('reviewLogs'),
    db.clear('settings'),
  ]);
}
