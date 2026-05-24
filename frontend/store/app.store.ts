import { create } from "zustand";

interface AppState {
  sidebarOpen: boolean;
  activeProfileId: number | null;
  scanInProgress: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveProfile: (id: number | null) => void;
  setScanInProgress: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  activeProfileId: null,
  scanInProgress: false,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveProfile: (id) => set({ activeProfileId: id }),
  setScanInProgress: (v) => set({ scanInProgress: v }),
}));
