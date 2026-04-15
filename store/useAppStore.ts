import { create } from 'zustand';
import type { Ecosystem } from '@/lib/constants';

interface AppState {
  // Room state
  roomId: string | null;
  roomCode: string | null;
  isLocalOnly: boolean;
  ecosystem: Ecosystem | null;

  // Connection state
  isConnected: boolean;
  peerCount: number;

  // UI state
  activeTab: 'text' | 'file' | 'password';

  // Actions
  setRoom: (roomId: string, ecosystem: Ecosystem) => void;
  resetRoom: () => void;
  toggleLocalOnly: () => void;
  setConnected: (connected: boolean) => void;
  setPeerCount: (count: number) => void;
  setActiveTab: (tab: 'text' | 'file' | 'password') => void;
}

export const useAppStore = create<AppState>((set) => ({
  roomId: null,
  roomCode: null,
  isLocalOnly: false,
  ecosystem: null,
  isConnected: false,
  peerCount: 0,
  activeTab: 'text',

  setRoom: (roomId, ecosystem) => set({ roomId, ecosystem }),
  resetRoom: () =>
    set({
      roomId: null,
      roomCode: null,
      isLocalOnly: false,
      ecosystem: null,
      isConnected: false,
      peerCount: 0,
      activeTab: 'text',
    }),
  toggleLocalOnly: () => set((s) => ({ isLocalOnly: !s.isLocalOnly })),
  setConnected: (connected) => set({ isConnected: connected }),
  setPeerCount: (count) => set({ peerCount: count }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
