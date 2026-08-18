import { getDueCards, getNewCards, getSettings } from './db';
import { todayLocalDateString } from './date';

export interface StudyQueue {
  vocabIds: number[];
  reviewCount: number;
  newCount: number;
}

/**
 * Builds today's study queue: all cards due for review, plus new words (starting at id 301,
 * since baseline 1-300 are seeded straight into Review) up to the remaining daily new-card cap.
 * The cap is only spent when a new word is actually completed (see fsrs.ts#applyRating) — not
 * just by appearing in a queue — so an abandoned/interrupted session doesn't make its unfinished
 * new words vanish for the rest of the day.
 */
export async function buildTodayQueue(now = new Date()): Promise<StudyQueue> {
  const settings = await getSettings();
  const today = todayLocalDateString(now);

  const introducedTodayCount =
    settings.newWordsIntroducedToday.date === today ? settings.newWordsIntroducedToday.count : 0;

  const remainingNewCap = Math.max(0, settings.newCardsPerDay - introducedTodayCount);

  const [dueCards, newCards] = await Promise.all([
    getDueCards(now),
    getNewCards(remainingNewCap),
  ]);

  dueCards.sort((a, b) => a.due.getTime() - b.due.getTime());

  return {
    vocabIds: [...dueCards.map((c) => c.vocabId), ...newCards.map((c) => c.vocabId)],
    reviewCount: dueCards.length,
    newCount: newCards.length,
  };
}
