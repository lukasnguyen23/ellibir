import { create } from 'zustand';
import { getOrCreatePlayerId } from '@/lib/playerId';
import {
  createRoom,
  getLobbyUrl,
  joinRoom,
  setPlayerReady,
  startGame,
  subscribeRoom,
  updateRoomSettings,
} from '@/lib/firestore/roomService';
import type { GameSettings } from '@/engine/types';
import type { RoomDocument } from '@/lib/firestore/roomTypes';

export type AppScreen = 'home' | 'hotseat' | 'join' | 'lobby';

interface LobbyStore {
  screen: AppScreen;
  playerId: string | null;
  roomCode: string | null;
  room: RoomDocument | null;
  playerName: string;
  joinCodeInput: string;
  loading: boolean;
  error: string | null;

  initPlayer: () => string;
  setScreen: (screen: AppScreen) => void;
  setPlayerName: (name: string) => void;
  setJoinCodeInput: (code: string) => void;
  clearError: () => void;

  createOnlineRoom: (settings?: Partial<GameSettings>) => Promise<void>;
  joinOnlineRoom: (code?: string) => Promise<void>;
  subscribeToRoom: (code: string) => () => void;
  toggleReady: () => Promise<void>;
  updateSettings: (settings: Partial<GameSettings>) => Promise<void>;
  startOnlineGame: () => Promise<void>;
  getShareUrl: () => string;
  reset: () => void;
}

let roomUnsub: (() => void) | null = null;

export const useLobbyStore = create<LobbyStore>((set, get) => ({
  screen: 'home',
  playerId: null,
  roomCode: null,
  room: null,
  playerName: localStorage.getItem('ellibir-player-name') ?? '',
  joinCodeInput: '',
  loading: false,
  error: null,

  initPlayer: () => {
    const playerId = getOrCreatePlayerId();
    set({ playerId });
    return playerId;
  },

  setScreen: (screen) => set({ screen, error: null }),
  setPlayerName: (name) => {
    localStorage.setItem('ellibir-player-name', name);
    set({ playerName: name });
  },
  setJoinCodeInput: (code) => set({ joinCodeInput: code.toUpperCase() }),
  clearError: () => set({ error: null }),

  createOnlineRoom: async (settings) => {
    set({ loading: true, error: null });
    try {
      const playerId = get().playerId ?? get().initPlayer();
      const name = get().playerName.trim() || 'Host';
      const code = await createRoom(playerId, name, settings);
      roomUnsub?.();
      roomUnsub = get().subscribeToRoom(code);
      set({ roomCode: code, screen: 'lobby', loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Raum konnte nicht erstellt werden.' });
    }
  },

  joinOnlineRoom: async (code) => {
    set({ loading: true, error: null });
    try {
      const playerId = get().playerId ?? get().initPlayer();
      const roomCode = (code ?? get().joinCodeInput).toUpperCase().trim();
      if (!roomCode) throw new Error('Bitte einen Raumcode eingeben.');
      const name = get().playerName.trim() || 'Spieler';
      await joinRoom(roomCode, playerId, name);
      roomUnsub?.();
      roomUnsub = get().subscribeToRoom(roomCode);
      set({ roomCode, screen: 'lobby', loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Beitritt fehlgeschlagen.' });
    }
  },

  subscribeToRoom: (code) => {
    const unsub = subscribeRoom(code, (room) => {
      set({ room });
    });
    roomUnsub = unsub;
    return unsub;
  },

  toggleReady: async () => {
    const { roomCode, playerId, room } = get();
    if (!roomCode || !playerId || !room?.players[playerId]) return;
    const next = !room.players[playerId].ready;
    await setPlayerReady(roomCode, playerId, next);
  },

  updateSettings: async (settings) => {
    const { roomCode, playerId } = get();
    if (!roomCode || !playerId) return;
    await updateRoomSettings(roomCode, playerId, settings);
  },

  startOnlineGame: async () => {
    const { roomCode, playerId } = get();
    if (!roomCode || !playerId) return;
    set({ loading: true, error: null });
    try {
      await startGame(roomCode, playerId);
      set({ loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : 'Spielstart fehlgeschlagen.' });
    }
  },

  getShareUrl: () => {
    const { roomCode } = get();
    return roomCode ? getLobbyUrl(roomCode) : '';
  },

  reset: () => {
    roomUnsub?.();
    roomUnsub = null;
    set({ screen: 'home', roomCode: null, room: null, error: null, loading: false });
  },
}));

export function isRoomHost(room: RoomDocument | null, playerId: string | null): boolean {
  return Boolean(room && playerId && room.hostId === playerId);
}
