import { create } from 'zustand';

interface AppState {
  roomId: string | null;
  roomCode: string | null;
  isLocalOnly: boolean;
  ecosystem: 'link' | 'nearby' | 'notes' | null;
  
  isConnected: boolean;
  peerCount: number;
  
  activeTab: 'text' | 'file' | 'password';
  
  setRoom: (roomId: string, ecosystem: 'link' | 'nearby' | 'notes') => void;
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
  
  setRoom: (roomId, ecosystem) => set({ roomId, roomCode: roomId, ecosystem }),
  resetRoom: () => set({ roomId: null, roomCode: null, isLocalOnly: false, ecosystem: null, isConnected: false, peerCount: 0 }),
  toggleLocalOnly: () => set((state) => ({ isLocalOnly: !state.isLocalOnly })),
  setConnected: (connected) => set({ isConnected: connected }),
  setPeerCount: (count) => set({ peerCount: count }),
  setActiveTab: (tab) => set({ activeTab: tab })
}));
