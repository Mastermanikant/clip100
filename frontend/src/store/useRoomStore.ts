import { create } from 'zustand';

interface RoomState {
  roomId: string | null;
  setRoom: (id: string) => void;
  resetRoom: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomId: null,
  setRoom: (id) => set({ roomId: id }),
  resetRoom: () => set({ roomId: null }),
}));
