import { dealCards } from './deck';
import { pointsForRank } from './scoring';
import type { Card, GameSettings, GameState, PlayerState, Rank } from './types';

export const DEFAULT_SETTINGS: GameSettings = {
  aceValue: 11,
  jokerCount: 4,
  startingCards: 14,
  openingThreshold: 51,
};

/** Strafpunkt-Wert eines Jokers in der Hand am Rundenende. */
export const JOKER_PENALTY = 20;

export interface CreateGameOptions {
  id?: string;
  players: { id: string; name: string }[];
  settings?: Partial<GameSettings>;
  seed?: number;
}

export function createGame(options: CreateGameOptions): GameState {
  const settings: GameSettings = { ...DEFAULT_SETTINGS, ...options.settings };
  const seed = options.seed ?? Math.floor(Math.random() * 2 ** 31);

  const { hands, drawPile, discardPile } = dealCards(
    options.players.length,
    settings.startingCards,
    settings.jokerCount,
    seed,
  );

  const players: PlayerState[] = options.players.map((p, i) => ({
    id: p.id,
    name: p.name,
    hand: hands[i],
    hasOpened: false,
    score: 0,
  }));

  return {
    id: options.id ?? `game-${seed}`,
    settings,
    players,
    drawPile,
    discardPile,
    melds: [],
    currentPlayerIndex: 0,
    turnPhase: 'draw',
    status: 'playing',
    winnerId: null,
    log: [`Spiel gestartet mit ${players.length} Spielern.`],
  };
}

/** Strafpunkte einer Hand (für Verlierer am Rundenende). */
export function handPenalty(hand: Card[], aceValue: 1 | 11): number {
  return hand.reduce((sum, card) => {
    if (card.isJoker) return sum + JOKER_PENALTY;
    return sum + pointsForRank(card.rank as Rank, aceValue);
  }, 0);
}

export function currentPlayer(state: GameState): PlayerState {
  return state.players[state.currentPlayerIndex];
}
