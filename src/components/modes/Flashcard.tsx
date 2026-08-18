import { useState } from 'react';
import { getVocabEntry } from '../../data/vocabulary';
import { speak } from '../../lib/tts';
import { RatingButtons } from '../Study/RatingButtons';
import type { StudyModeProps } from '../../types';

export function Flashcard({ vocabId, onComplete }: StudyModeProps) {
  const entry = getVocabEntry(vocabId);
  const [flipped, setFlipped] = useState(false);

  if (!entry) return null;

  return (
    <div className="mode-card">
      <div className="mode-card__label">Flashcard</div>

      <div
        className={flipped ? 'flip-card flip-card--flipped' : 'flip-card'}
        onClick={() => !flipped && setFlipped(true)}
        role="button"
        tabIndex={0}
      >
        <div className="flip-card__inner">
          <div className="flip-card__face flip-card__face--front">
            <div className="flashcard__word">{entry.word}</div>
            {entry.ipa && <div className="flashcard__ipa">/{entry.ipa}/</div>}
            <button
              className="icon-button"
              onClick={(e) => {
                e.stopPropagation();
                speak(entry.word);
              }}
            >
              🔊 Phát âm
            </button>
            <div className="flip-card__hint">Chạm để lật thẻ</div>
          </div>

          <div className="flip-card__face flip-card__face--back">
            {entry.pos && <div className="flashcard__pos">{entry.pos}</div>}
            <div className="flashcard__meaning">{entry.meaningVi}</div>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="mode-card__actions-enter">
          <RatingButtons onRate={onComplete} />
        </div>
      )}
    </div>
  );
}
