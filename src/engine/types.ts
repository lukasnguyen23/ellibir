// Reine Spiel-Typen. Kein React, kein Firebase – damit dieselbe Logik
// lokal (Hotseat) und später per Firestore synchronisiert laufen kann.

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

export const RANKS: Rank[] = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
];

export const RED_SUITS: Suit[] = ['hearts', 'diamonds'];

export interface TronCard {
  suit: Suit;
  rank: Rank;
}

export interface Card {
  /** Eindeutige Instanz-ID (auch bei doppelten Karten in 2 Decks einzigartig). */
  id: string;
  suit: Suit | null;
  rank: Rank | null;
  isJoker: boolean;
}

export type MeldType = 'set' | 'run';

export interface Meld {
  id: string;
  type: MeldType;
  /** Geordnete Karten (bei Läufen aufsteigend sortiert). */
  cards: Card[];
  ownerId: string;
}

export type TurnPhase = 'draw' | 'meld' | 'discard';

export type GameStatus = 'playing' | 'finished';

export interface GameSettings {
  /** Wert des Asses für Punkte (vor Spielbeginn festgelegt). */
  aceValue: 1 | 11;
  /** Anzahl Joker im Spiel. */
  jokerCount: number;
  /** Startkarten pro Spieler. */
  startingCards: number;
  /** Geplante Anzahl Runden (1–10). */
  totalRounds: number;
}

export interface PlayerState {
  id: string;
  name: string;
  hand: Card[];
  /** Verdeckt gelegte Pers — werden erst sichtbar, wenn die Hand leer ist. */
  pendingMelds: Meld[];
  /** Strafpunkte / Score über mehrere Runden. */
  score: number;
}

export interface GameState {
  id: string;
  settings: GameSettings;
  players: PlayerState[];
  drawPile: Card[];
  discardPile: Card[];
  melds: Meld[];
  indicatorCard: Card;
  tron: TronCard;
  currentPlayerIndex: number;
  turnPhase: TurnPhase;
  status: GameStatus;
  winnerId: string | null;
  /** Aktuelle Runde (1 … totalRounds). */
  roundNumber: number;
  log: string[];
}

export type Move =
  | { type: 'DRAW_STOCK' }
  | { type: 'DRAW_DISCARD' }
  | { type: 'STAGE_MELD'; cardIds: string[]; meldType: MeldType }
  | { type: 'UNSTAGE_MELD'; pendingMeldId: string }
  | { type: 'APPEND_TO_MELD'; meldId: string; cardIds: string[] }
  | { type: 'DISCARD'; cardId: string }
  | { type: 'SORT_HAND'; playerId: string; orderedCardIds: string[] };

export interface MoveResult {
  ok: boolean;
  state: GameState;
  error?: string;
}
