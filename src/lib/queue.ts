import { getDueCards, getNewCards, getSettings, saveSettings } from './db';
import { todayLocalDateString } from './date';

export interface StudyQueue {
  vocabIds: number[];
  reviewCount: number;
  newCount: number;
}

/**
 * Builds today's study queue: all cards due for review, plus new words (starting at id 301,
 * since baseline 1-300 are seeded straight into Review) up to the remaining daily new-card cap.
 * The cap is consumed as soon as a new word is added to the queue (not on completion), which is
 * a deliberate simplification for a single-user local app.
 */
export async function buildTodayQueue(now = new Date()): Promise<StudyQueue> {
  const settings = await getSettings();
  const today = todayLocalDateString(now);

  let introducedToday = settings.newWordsIntroducedToday;
  if (introducedToday.date !== today) {
    introducedToday = { date: today, count: 0 };
  }

  const remainingNewCap = Math.max(0, settings.newCardsPerDay - introducedToday.count);

  const [dueCards, newCards] = await Promise.all([
    getDueCards(now),
    getNewCards(remainingNewCap),
  ]);

  dueCards.sort((a, b) => a.due.getTime() - b.due.getTime());

  if (newCards.length > 0) {
    await saveSettings({
      ...settings,
      newWordsIntroducedToday: {
        date: today,
        count: introducedToday.count + newCards.length,
      },
    });
  } else if (introducedToday.date !== settings.newWordsIntroducedToday.date) {
    // Day rolled over but no new cards were queued (cap already 0) — still persist the reset.
    await saveSettings({ ...settings, newWordsIntroducedToday: introducedToday });
  }

  return {
    vocabIds: [...dueCards.map((c) => c.vocabId), ...newCards.map((c) => c.vocabId)],
    reviewCount: dueCards.length,
    newCount: newCards.length,
  };
}
