import { useCallback, useEffect, useState } from 'react';
import { State } from 'ts-fsrs';
import { countByState, getDueCards, getSettings } from '../lib/db';
import { vocabulary } from '../data/vocabulary';
import { todayLocalDateString } from '../lib/date';

export interface DashboardStats {
  dueCount: number;
  newRemainingToday: number;
  stateCounts: Record<'New' | 'Learning' | 'Review' | 'Relearning', number>;
  baselineTotal: number;
  totalWords: number;
  loading: boolean;
  refresh: () => void;
}

const BASELINE_MAX_ID = 300;

export function useDueCounts(): DashboardStats {
  const [dueCount, setDueCount] = useState(0);
  const [newRemainingToday, setNewRemainingToday] = useState(0);
  const [stateCounts, setStateCounts] = useState<DashboardStats['stateCounts']>({
    New: 0,
    Learning: 0,
    Review: 0,
    Relearning: 0,
  });
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      const now = new Date();
      const [due, counts, settings] = await Promise.all([
        getDueCards(now),
        countByState(),
        getSettings(),
      ]);
      if (cancelled) return;

      const today = todayLocalDateString(now);
      const introducedToday =
        settings.newWordsIntroducedToday.date === today
          ? settings.newWordsIntroducedToday.count
          : 0;

      setDueCount(due.length);
      setNewRemainingToday(Math.max(0, settings.newCardsPerDay - introducedToday));
      setStateCounts({
        New: counts[State.New] ?? 0,
        Learning: counts[State.Learning] ?? 0,
        Review: counts[State.Review] ?? 0,
        Relearning: counts[State.Relearning] ?? 0,
      });
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [tick]);

  return {
    dueCount,
    newRemainingToday,
    stateCounts,
    baselineTotal: BASELINE_MAX_ID,
    totalWords: vocabulary.length,
    loading,
    refresh,
  };
}
