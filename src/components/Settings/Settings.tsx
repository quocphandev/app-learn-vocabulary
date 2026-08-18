import { useState } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { resetAllProgress } from '../../lib/db';
import { ensureSeeded } from '../../lib/fsrs';
import { useAppStore } from '../../store/appStore';
import type { StudyMode } from '../../types';

const MODE_LABELS: Record<StudyMode, string> = {
  flashcard: 'Flashcard',
  multipleChoice: 'Trắc nghiệm',
  typing: 'Gõ lại từ',
  listening: 'Nghe & gõ lại',
};

export function Settings() {
  const { settings, loading, update } = useSettings();
  const setScreen = useAppStore((s) => s.setScreen);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  if (loading) return <p>Đang tải...</p>;

  function toggleMode(mode: StudyMode) {
    const enabled = settings.enabledModes.includes(mode);
    const next = enabled
      ? settings.enabledModes.filter((m) => m !== mode)
      : [...settings.enabledModes, mode];
    if (next.length === 0) return; // always keep at least one mode enabled
    update({ enabledModes: next });
  }

  async function handleReset() {
    if (!confirmingReset) {
      setConfirmingReset(true);
      return;
    }
    setResetting(true);
    await resetAllProgress();
    await ensureSeeded();
    setResetting(false);
    setConfirmingReset(false);
    setScreen('dashboard');
  }

  return (
    <div className="settings">
      <h1>Cài đặt</h1>

      <div className="settings__section">
        <label className="settings__label" htmlFor="newCardsPerDay">
          Số từ mới mỗi ngày
        </label>
        <input
          id="newCardsPerDay"
          className="text-input text-input--small"
          type="number"
          min={1}
          max={50}
          value={settings.newCardsPerDay}
          onChange={(e) => update({ newCardsPerDay: Number(e.target.value) || 1 })}
        />
      </div>

      <div className="settings__section">
        <div className="settings__label">Chế độ học</div>
        {(Object.keys(MODE_LABELS) as StudyMode[]).map((mode) => (
          <label key={mode} className="settings__checkbox">
            <input
              type="checkbox"
              checked={settings.enabledModes.includes(mode)}
              onChange={() => toggleMode(mode)}
            />
            {MODE_LABELS[mode]}
          </label>
        ))}
      </div>

      <div className="settings__section">
        <div className="settings__label">Đặt lại tiến độ</div>
        <p className="settings__hint">
          Xoá toàn bộ lịch sử ôn tập và bắt đầu lại từ đầu (300 từ nền tảng sẽ được đánh dấu đã học lại).
        </p>
        <button
          className={confirmingReset ? 'danger-button danger-button--confirm' : 'danger-button'}
          disabled={resetting}
          onClick={handleReset}
          onBlur={() => setConfirmingReset(false)}
        >
          {resetting ? 'Đang đặt lại...' : confirmingReset ? 'Bấm lần nữa để xác nhận' : 'Đặt lại tiến độ'}
        </button>
      </div>
    </div>
  );
}
