import { create } from 'zustand';

interface RoomState {
  roomId: string | null;
  roomCode: string | null;
  isLocalOnly: boolean;
  setRoom: (roomId: string, roomCode: string, isLocalOnly: boolean) => void;
  resetRoom: () => void;
  toggleLocalOnly: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomId: null,
  roomCode: null,
  isLocalOnly: false,
  setRoom: (roomId, roomCode, isLocalOnly) => set({ roomId, roomCode, isLocalOnly }),
  resetRoom: () => set({ roomId: null, roomCode: null, isLocalOnly: false }),
  toggleLocalOnly: () => set((state) => ({ isLocalOnly: !state.isLocalOnly })),
}));
