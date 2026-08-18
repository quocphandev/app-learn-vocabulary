import type { ComponentType } from 'react';
import { useAppStore } from '../../store/appStore';
import { useStudySession } from '../../hooks/useStudySession';
import { Flashcard } from '../modes/Flashcard';
import { MultipleChoice } from '../modes/MultipleChoice';
import { TypingTest } from '../modes/TypingTest';
import { Listening } from '../modes/Listening';
import type { StudyModeProps } from '../../types';

const MODE_COMPONENTS: Record<string, ComponentType<StudyModeProps>> = {
  flashcard: Flashcard,
  multipleChoice: MultipleChoice,
  typing: TypingTest,
  listening: Listening,
};

export function StudySession() {
  const setScreen = useAppStore((s) => s.setScreen);
  const session = useStudySession();

  if (session.loading) {
    return <p>Đang chuẩn bị phiên học...</p>;
  }

  if (session.done) {
    return (
      <div className="study-done study-done--enter">
        <div className="study-done__badge">🎉</div>
        <h1>Hoàn thành phiên học!</h1>
        <p>Bạn đã ôn xong {session.total} từ hôm nay.</p>
        <button className="primary-button" onClick={() => setScreen('dashboard')}>
          Về trang tổng quan
        </button>
      </div>
    );
  }

  const ModeComponent = MODE_COMPONENTS[session.currentMode];
  const progressPercent = session.total > 0 ? (session.index / session.total) * 100 : 0;

  return (
    <div className="study-session">
      <div className="study-session__progress">
        {session.index + 1} / {session.total}
      </div>
      <div className="study-session__bar">
        <div className="study-session__bar-fill" style={{ width: `${progressPercent}%` }} />
      </div>
      <ModeComponent key={session.currentVocabId} vocabId={session.currentVocabId} onComplete={session.submit} />
    </div>
  );
}
