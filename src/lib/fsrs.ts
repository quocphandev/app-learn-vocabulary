import { createEmptyCard, fsrs, generatorParameters, Rating, State, type Card, type Grade } from 'ts-fsrs';
import type { CardRow, ReviewLogRow } from '../types';
import { addReviewLog, getCard, isSeeded, putCard, putCards } from './db';
import vocabulary from '../data/vocabulary.json';

export const scheduler = fsrs(generatorParameters({ maximum_interval: 36500 }));

const BASELINE_MAX_ID = 300;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Builds a card that looks as if it just had a real "Good" Review-state review, skipping the
 * short-term Learning-state steps (~10min/1day) that `scheduler.next()` would normally insert
 * after a New card's first rating. Baseline words are already known, so they should start on a
 * multi-day review interval immediately rather than resurfacing in a few minutes.
 */
function seedAsReviewed(now: Date): Card {
  const stability = scheduler.init_stability(Rating.Good);
  const difficulty = scheduler.init_difficulty(Rating.Good);
  const scheduledDays = scheduler.next_interval(stability, 0);
  return {
    due: new Date(now.getTime() + scheduledDays * DAY_MS),
    stability,
    difficulty,
    elapsed_days: 0,
    scheduled_days: scheduledDays,
    learning_steps: 0,
    reps: 1,
    lapses: 0,
    state: State.Review,
    last_review: now,
  };
}

/**
 * First-run seeding: baseline words (id <= 300) are already known, so they're seeded straight
 * into the Review state with a real multi-day due date instead of competing with 301+ under the
 * daily new-card cap. Everything above stays in State.New; the daily new-word queue then
 * naturally starts at id 301 (the lowest New id).
 */
export async function ensureSeeded(): Promise<void> {
  if (await isSeeded()) return;

  const now = new Date();
  const rows: CardRow[] = [];
  const logs: ReviewLogRow[] = [];

  for (const entry of vocabulary as { id: number }[]) {
    if (entry.id <= BASELINE_MAX_ID) {
      const card = seedAsReviewed(now);
      rows.push({ ...card, vocabId: entry.id });
      logs.push({
        vocabId: entry.id,
        rating: Rating.Good,
        reviewedAt: now,
        scheduled_days: card.scheduled_days,
        state: State.Review,
      });
    } else {
      rows.push({ ...createEmptyCard(now), vocabId: entry.id });
    }
  }

  await putCards(rows);
  await Promise.all(logs.map((log) => addReviewLog(log)));
}

/**
 * Apply a rating to a card, persist the updated card + review log, and return the new card.
 * `rating` must already be reduced to an FSRS Grade (1-4) by the calling study mode.
 */
export async function applyRating(vocabId: number, rating: Grade, now = new Date()): Promise<Card> {
  const existing = await getCard(vocabId);
  if (!existing) throw new Error(`No card found for vocabId ${vocabId}`);

  const { card, log } = scheduler.next(existing, now, rating);
  const cardRow: CardRow = { ...card, vocabId };
  await putCard(cardRow);

  const logRow: ReviewLogRow = {
    vocabId,
    rating: log.rating,
    reviewedAt: log.review,
    scheduled_days: log.scheduled_days,
    state: log.state,
  };
  await addReviewLog(logRow);

  return card;
}
