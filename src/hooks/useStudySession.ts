import { useCallback, useEffect, useState } from 'react';
import type { Grade } from 'ts-fsrs';
import { buildTodayQueue } from '../lib/queue';
import { applyRating } from '../lib/fsrs';
import { getSettings } from '../lib/db';
import type { StudyMode } from '../types';
import { DEFAULT_SETTINGS } from '../types';

export function useStudySession() {
  const [queue, setQueue] = useState<number[]>([]);
  const [modes, setModes] = useState<StudyMode[]>(DEFAULT_SETTINGS.enabledModes);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [settings, q] = await Promise.all([getSettings(), buildTodayQueue()]);
      if (cancelled) return;
      setModes(settings.enabledModes.length > 0 ? settings.enabledModes : DEFAULT_SETTINGS.enabledModes);
      setQueue(q.vocabIds);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentVocabId = queue[index];
  const currentMode: StudyMode = modes[index % modes.length] ?? 'flashcard';
  const done = !loading && index >= queue.length;

  const submit = useCallback(
    async (grade: Grade) => {
      if (currentVocabId == null) return;
      await applyRating(currentVocabId, grade);
      setIndex((i) => i + 1);
    },
    [currentVocabId],
  );

  return {
    loading,
    done,
    total: queue.length,
    index,
    currentVocabId,
    currentMode,
    submit,
  };
}
