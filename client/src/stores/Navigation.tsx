import { create } from 'zustand';

type StoreState = {
    isDrawerOpen: boolean;
    openDrawer: () => void;
    closeDrawer: () => void;
    toggleDrawer: () => void;
};

const useStore = create<StoreState>(set => ({
    isDrawerOpen: true,
    openDrawer: () => set({ isDrawerOpen: true }),
    closeDrawer: () => set({ isDrawerOpen: false }),
    toggleDrawer: () => set(state => ({ isDrawerOpen: !state.isDrawerOpen }))
}));

export default useStore;