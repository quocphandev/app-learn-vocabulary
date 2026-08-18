import { useMemo, useState } from 'react';
import { Rating } from 'ts-fsrs';
import { getVocabEntry, pickDistractors } from '../../data/vocabulary';
import type { StudyModeProps } from '../../types';

export function MultipleChoice({ vocabId, onComplete }: StudyModeProps) {
  const entry = getVocabEntry(vocabId);
  const [selected, setSelected] = useState<number | null>(null);

  const options = useMemo(() => {
    if (!entry) return [];
    const distractors = pickDistractors(entry, 3);
    return [entry, ...distractors].sort(() => Math.random() - 0.5);
  }, [entry]);

  if (!entry) return null;

  const isCorrect = selected === entry.id;

  return (
    <div className="mode-card">
      <div className="mode-card__label">Trắc nghiệm</div>
      <div className="quiz-question">{entry.word}</div>

      <div className="quiz-options">
        {options.map((opt) => {
          let className = 'quiz-option';
          if (selected != null) {
            if (opt.id === entry.id) className += ' quiz-option--correct';
            else if (opt.id === selected) className += ' quiz-option--wrong';
          }
          return (
            <button
              key={opt.id}
              className={className}
              disabled={selected != null}
              onClick={() => setSelected(opt.id)}
            >
              {opt.meaningVi}
            </button>
          );
        })}
      </div>

      {selected != null && (
        <button
          className="primary-button"
          onClick={() => onComplete(isCorrect ? Rating.Good : Rating.Again)}
        >
          Tiếp tục
        </button>
      )}
    </div>
  );
}
