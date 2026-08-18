import type { VocabEntry } from '../types';
import raw from './vocabulary.json';

export const vocabulary: VocabEntry[] = raw as VocabEntry[];

const byId = new Map(vocabulary.map((e) => [e.id, e]));

export function getVocabEntry(id: number): VocabEntry | undefined {
  return byId.get(id);
}

/** Pick `count` random distractor entries for `entry`, preferring the same part-of-speech. */
export function pickDistractors(entry: VocabEntry, count: number): VocabEntry[] {
  const samePos = vocabulary.filter((e) => e.id !== entry.id && e.pos && e.pos === entry.pos);
  const pool = samePos.length >= count ? samePos : vocabulary.filter((e) => e.id !== entry.id);

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
