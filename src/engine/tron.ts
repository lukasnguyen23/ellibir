import type { Card, Rank, Suit, TronCard } from './types';

/** Spielreihenfolge: 2 → … → 10 → B → D → K → A */
export const RANK_SEQUENCE: Rank[] = [
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
  'A',
];

export function rankSequenceIndex(rank: Rank): number {
  const i = RANK_SEQUENCE.indexOf(rank);
  if (i < 0) throw new Error(`Unknown rank: ${rank}`);
  return i;
}

export function nextRankInSequence(rank: Rank): Rank {
  const i = rankSequenceIndex(rank);
  return RANK_SEQUENCE[(i + 1) % RANK_SEQUENCE.length];
}

export function computeTron(indicator: Card): TronCard {
  if (indicator.isJoker || !indicator.suit || !indicator.rank) {
    throw new Error('Anzeigekarte darf kein Joker sein.');
  }
  return {
    suit: indicator.suit,
    rank: nextRankInSequence(indicator.rank),
  };
}

export function isTronCard(card: Card, tron: TronCard): boolean {
  return !card.isJoker && card.suit === tron.suit && card.rank === tron.rank;
}

/** Echte Tron-Karte (nicht Joker) – darf überall als Platzhalter dienen. */
export function isTronWildcard(card: Card, tron: TronCard): boolean {
  return isTronCard(card, tron);
}

export function jokerFitsSlot(tron: TronCard, slot: { suit: Suit; rank: Rank }): boolean {
  return tron.suit === slot.suit && tron.rank === slot.rank;
}

/** Straf-Multiplikator aus Farbe der Anzeigekarte: ♣1 ♠2 ♥3 ♦4 */
export function indicatorPenaltyMultiplier(indicator: Card): number {
  switch (indicator.suit) {
    case 'clubs':
      return 1;
    case 'spades':
      return 2;
    case 'hearts':
      return 3;
    case 'diamonds':
      return 4;
    default:
      return 1;
  }
}

export function isTronDiscard(card: Card, tron: TronCard): boolean {
  return card.isJoker || isTronCard(card, tron);
}
