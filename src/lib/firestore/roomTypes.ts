import type { Timestamp } from 'firebase/firestore';
import type { Card, GameSettings, GameState, Meld, Move } from '@/engine/types';

export type RoomStatus = 'waiting' | 'playing' | 'finished';

export interface LobbyPlayer {
  name: string;
  slotIndex: number;
  ready: boolean;
}

export interface RoomDocument {
  code: string;
  hostId: string;
  status: RoomStatus;
  settings: GameSettings;
  players: Record<string, LobbyPlayer>;
  playerOrder: string[];
  createdAt: Timestamp;
}

export interface PublicPlayerSnapshot {
  id: string;
  name: string;
  score: number;
  handCount: number;
}

export interface PublicGameDocument {
  id: string;
  settings: GameSettings;
  status: GameState['status'];
  roundNumber: number;
  winnerId: string | null;
  currentPlayerIndex: number;
  turnPhase: GameState['turnPhase'];
  indicatorCard: Card;
  tron: GameState['tron'];
  melds: Meld[];
  discardPile: Card[];
  drawPileCount: number;
  players: PublicPlayerSnapshot[];
  playerOrder: string[];
  seed: number;
  moveSeq: number;
  log: string[];
  updatedAt: Timestamp;
}

export interface ServerGameDocument {
  drawPile: Card[];
}

export interface PlayerSecretsDocument {
  hand: Card[];
  pendingMelds: Meld[];
}

export type MoveStatus = 'pending' | 'applied' | 'rejected';

export interface MoveDocument {
  playerId: string;
  move: Move;
  status: MoveStatus;
  createdAt: Timestamp;
  error?: string;
}

export const ROOM_CODE_LENGTH = 6;
export const MAX_PLAYERS = 7;
