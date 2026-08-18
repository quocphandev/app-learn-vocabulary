import { useAppStore } from '../../store/appStore';

export function NavBar() {
  const screen = useAppStore((s) => s.screen);
  const setScreen = useAppStore((s) => s.setScreen);

  return (
    <nav className="nav-bar">
      <span className="nav-bar__title">
        <span className="nav-bar__title-full">Học từ vựng TOEIC</span>
        <span className="nav-bar__title-short">Từ vựng TOEIC</span>
      </span>
      <div className="nav-bar__links">
        <button
          className={screen === 'dashboard' ? 'nav-bar__link nav-bar__link--active' : 'nav-bar__link'}
          onClick={() => setScreen('dashboard')}
        >
          Tổng quan
        </button>
        <button
          className={screen === 'settings' ? 'nav-bar__link nav-bar__link--active' : 'nav-bar__link'}
          onClick={() => setScreen('settings')}
        >
          Cài đặt
        </button>
      </div>
    </nav>
  );
}
