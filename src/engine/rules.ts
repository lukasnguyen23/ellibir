import { dealCards } from './deck';
import { cardLabel } from '../lib/cardVisual';
import { computeTron, indicatorPenaltyMultiplier } from './tron';
import type { Card, GameSettings, GameState, PlayerState, Rank, TronCard } from './types';
import { pointsForRank } from './scoring';
import { isTronCard } from './tron';

export const DEFAULT_SETTINGS: GameSettings = {
  aceValue: 11,
  jokerCount: 4,
  startingCards: 14,
  openingThreshold: 51,
};

export interface CreateGameOptions {
  id?: string;
  players: { id: string; name: string }[];
  settings?: Partial<GameSettings>;
  seed?: number;
}

export function createGame(options: CreateGameOptions): GameState {
  const settings: GameSettings = { ...DEFAULT_SETTINGS, ...options.settings };
  const seed = options.seed ?? Math.floor(Math.random() * 2 ** 31);

  const { hands, drawPile, discardPile, indicatorCard, startingPlayerIndex } = dealCards(
    options.players.length,
    settings.startingCards,
    settings.jokerCount,
    seed,
  );

  const tron = computeTron(indicatorCard);
  const mult = indicatorPenaltyMultiplier(indicatorCard);

  const players: PlayerState[] = options.players.map((p, i) => ({
    id: p.id,
    name: p.name,
    hand: hands[i],
    hasOpened: false,
    score: 0,
  }));

  const starter = players[startingPlayerIndex];

  return {
    id: options.id ?? `game-${seed}`,
    settings,
    players,
    drawPile,
    discardPile,
    indicatorCard,
    tron,
    melds: [],
    currentPlayerIndex: startingPlayerIndex,
    turnPhase: 'meld',
    status: 'playing',
    winnerId: null,
    log: [
      `Spiel gestartet mit ${players.length} Spielern.`,
      `Anzeige: ${cardLabel(indicatorCard)} (×${mult}) – Tron: ${cardLabel({ ...indicatorCard, rank: tron.rank, suit: tron.suit, isJoker: false })}`,
      `${starter.name} beginnt mit 15 Karten.`,
    ],
  };
}

/** Punktwert einer einzelnen Karte (Joker = Tron-Wert). */
export function cardPointValue(card: Card, aceValue: 1 | 11, tron: TronCard): number {
  if (card.isJoker || isTronCard(card, tron)) {
    return pointsForRank(tron.rank, aceValue);
  }
  return pointsForRank(card.rank as Rank, aceValue);
}

export function currentPlayer(state: GameState): PlayerState {
  return state.players[state.currentPlayerIndex];
}
