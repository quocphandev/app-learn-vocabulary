import { create } from 'zustand';

export type Screen = 'dashboard' | 'study' | 'settings';

interface AppStore {
  screen: Screen;
  setScreen: (screen: Screen) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  screen: 'dashboard',
  setScreen: (screen) => set({ screen }),
}));
