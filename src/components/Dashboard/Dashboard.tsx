import { useAppStore } from '../../store/appStore';
import { useDueCounts } from '../../hooks/useDueCounts';

export function Dashboard() {
  const setScreen = useAppStore((s) => s.setScreen);
  const stats = useDueCounts();

  const totalToStudy = stats.dueCount + stats.newRemainingToday;
  const learnedAtLeastOnce = stats.stateCounts.Learning + stats.stateCounts.Review + stats.stateCounts.Relearning;

  return (
    <div className="dashboard">
      <h1>Tổng quan</h1>

      {stats.loading ? (
        <p>Đang tải...</p>
      ) : (
        <>
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
              <span className="stat-card__value">
                {learnedAtLeastOnce}/{stats.totalWords}
              </span>
              <span className="stat-card__label">Tổng số từ đã học</span>
            </div>
            <div className="stat-card">
              <span className="stat-card__value">{stats.baselineTotal}</span>
              <span className="stat-card__label">Từ nền tảng (1–300)</span>
            </div>
          </div>

          <div className="state-breakdown">
            <span>Mới: {stats.stateCounts.New}</span>
            <span>Đang học: {stats.stateCounts.Learning}</span>
            <span>Đang ôn: {stats.stateCounts.Review}</span>
            <span>Học lại: {stats.stateCounts.Relearning}</span>
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
