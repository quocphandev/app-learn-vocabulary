import { useAppStore } from '../../store/appStore';
import { useDueCounts } from '../../hooks/useDueCounts';

export function Dashboard() {
  const setScreen = useAppStore((s) => s.setScreen);
  const stats = useDueCounts();

  const totalToStudy = stats.dueCount + stats.newRemainingToday;
  const learnedAtLeastOnce = stats.stateCounts.Learning + stats.stateCounts.Review + stats.stateCounts.Relearning;
  const overallPercent = stats.totalWords > 0 ? Math.round((learnedAtLeastOnce / stats.totalWords) * 100) : 0;

  const segments = [
    { key: 'New', label: 'Mới', count: stats.stateCounts.New, className: 'segment--new' },
    { key: 'Learning', label: 'Đang học', count: stats.stateCounts.Learning, className: 'segment--learning' },
    { key: 'Review', label: 'Đang ôn', count: stats.stateCounts.Review, className: 'segment--review' },
    { key: 'Relearning', label: 'Học lại', count: stats.stateCounts.Relearning, className: 'segment--relearning' },
  ];

  return (
    <div className="dashboard">
      <h1>Tổng quan</h1>

      {stats.loading ? (
        <p>Đang tải...</p>
      ) : (
        <>
          <div className="progress-hero">
            <div className="progress-hero__header">
              <span>Tiến độ tổng thể</span>
              <span className="progress-hero__percent">{overallPercent}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar__fill" style={{ width: `${overallPercent}%` }} />
            </div>
            <div className="progress-hero__caption">
              {learnedAtLeastOnce}/{stats.totalWords} từ đã bắt đầu học
            </div>
          </div>

          <div className="segment-bar">
            {segments.map(
              (s) =>
                s.count > 0 && (
                  <div
                    key={s.key}
                    className={`segment-bar__segment ${s.className}`}
                    style={{ width: `${(s.count / stats.totalWords) * 100}%` }}
                    title={`${s.label}: ${s.count}`}
                  />
                ),
            )}
          </div>
          <div className="segment-legend">
            {segments.map((s) => (
              <span key={s.key} className="segment-legend__item">
                <span className={`segment-legend__dot ${s.className}`} />
                {s.label}: {s.count}
              </span>
            ))}
          </div>

          <div className="stat-grid">
            <div className="stat-card">
              <span className="stat-card__value">{stats.dueCount}</span>
              <span className="stat-card__label">Từ cần ôn hôm nay</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__value">{stats.newRemainingToday}</span>
              <span className="stat-card__label">Từ mới còn lại hôm nay</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__value">{stats.baselineTotal}</span>
              <span className="stat-card__label">Từ nền tảng (1–300)</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__value">{stats.totalWords}</span>
              <span className="stat-card__label">Tổng số từ trong kho</span>
            </div>
          </div>

          <button
            className="primary-button"
            disabled={totalToStudy === 0}
            onClick={() => setScreen('study')}
          >
            {totalToStudy === 0 ? 'Đã hoàn thành hôm nay 🎉' : `Bắt đầu học (${totalToStudy} từ)`}
          </button>
        </>
      )}
    </div>
  );
}
