import { useState } from 'react';
import { Rating } from 'ts-fsrs';
import { getVocabEntry } from '../../data/vocabulary';
import { normalizeAnswer } from '../../lib/text';
import { speak } from '../../lib/tts';
import type { StudyModeProps } from '../../types';

export function TypingTest({ vocabId, onComplete }: StudyModeProps) {
  const entry = getVocabEntry(vocabId);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);

  if (!entry) return null;

  const isCorrect = checked && normalizeAnswer(input) === normalizeAnswer(entry.word);

  return (
    <div className="mode-card">
      <div className="mode-card__label">Gõ lại từ</div>
      <div className="quiz-question">{entry.meaningVi}</div>
      <button className="icon-button" onClick={() => speak(entry.word)}>
        🔊 Phát âm
      </button>

      <input
        className={checked ? `text-input ${isCorrect ? 'text-input--correct' : 'text-input--wrong'}` : 'text-input'}
        type="text"
        autoFocus
        value={input}
        disabled={checked}
        placeholder="Gõ từ tiếng Anh..."
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !checked) setChecked(true);
        }}
      />

      {checked && (
        <div className={isCorrect ? 'feedback feedback--correct feedback--pop' : 'feedback feedback--wrong feedback--pop'}>
          {isCorrect ? '✓ Chính xác!' : `✕ Đáp án đúng: ${entry.word}`}
        </div>
      )}

      {!checked ? (
        <button className="primary-button" onClick={() => setChecked(true)}>
          Kiểm tra
        </button>
      ) : (
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
