import { useEffect, useState } from 'react';
import './App.css';
import { NavBar } from './components/layout/NavBar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { StudySession } from './components/Study/StudySession';
import { Settings } from './components/Settings/Settings';
import { useAppStore } from './store/appStore';
import { ensureSeeded } from './lib/fsrs';

function App() {
  const screen = useAppStore((s) => s.screen);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureSeeded().then(() => setReady(true));
  }, []);

  if (!ready) {
    return <div className="app-loading">Đang chuẩn bị dữ liệu từ vựng...</div>;
  }

  return (
    <>
      <NavBar />
      <main className="app-main">
        {screen === 'dashboard' && <Dashboard />}
        {screen === 'study' && <StudySession />}
        {screen === 'settings' && <Settings />}
      </main>
    </>
  );
}

export default App;
