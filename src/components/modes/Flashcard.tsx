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
      <div className="flashcard">
        <div className="flashcard__word">{entry.word}</div>
        {entry.ipa && <div className="flashcard__ipa">/{entry.ipa}/</div>}
        <button className="icon-button" onClick={() => speak(entry.word)}>
          🔊 Phát âm
        </button>

        {flipped && (
          <div className="flashcard__back">
            {entry.pos && <div className="flashcard__pos">{entry.pos}</div>}
            <div className="flashcard__meaning">{entry.meaningVi}</div>
          </div>
        )}
      </div>

      {!flipped ? (
        <button className="primary-button" onClick={() => setFlipped(true)}>
          Lật thẻ
        </button>
      ) : (
        <RatingButtons onRate={onComplete} />
      )}
    </div>
  );
}
