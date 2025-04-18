import { create } from 'zustand';
import { GlobalState } from './store.types';

export const useGlobalStore = create<GlobalState>(set => ({
  isLoggedIn: false,
  user: null,
  role: null,
  setIsLoggedIn: value => set({ isLoggedIn: value }),
  setUser: user => set({ user }),
  setRole: role => set({ role }),
}));
