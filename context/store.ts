import {create} from 'zustand';
import {GlobalState} from './store.types';

export const useGlobalStore = create<GlobalState>(set => ({
	isLoggedIn: false,
	setIsLoggedIn: isLoggedIn => set({isLoggedIn}),
}));
