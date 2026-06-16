import { isTronWildcard, jokerFitsSlot } from './tron';
import type { Card, MeldType, Rank, Suit, TronCard } from './types';
import { SUITS } from './types';
import { pointsForRank, pointsForRunValue, rankToValue } from './scoring';

export interface MeldValidation {
  valid: boolean;
  type: MeldType;
  points: number;
  orderedCards: Card[];
  error?: string;
}

const MIN_MELD = 3;

function naturalValues(card: Card): number[] {
  if (card.rank === 'A') return [1, 14];
  return [rankToValue(card.rank as Rank)];
}

function rankMatchesRunValue(rank: Rank, runValue: number): boolean {
  if (rank === 'A') return runValue === 1 || runValue === 14;
  return rankToValue(rank) === runValue;
}

function runValueToRank(runValue: number): Rank | null {
  if (runValue === 1 || runValue === 14) return 'A';
  if (runValue >= 2 && runValue <= 10) return String(runValue) as Rank;
  if (runValue === 11) return 'J';
  if (runValue === 12) return 'Q';
  if (runValue === 13) return 'K';
  return null;
}

function cardFitsRunSlot(
  card: Card,
  suit: Suit,
  runValue: number,
  tron: TronCard,
): boolean {
  if (isTronWildcard(card, tron)) return true;
  const slotRank = runValueToRank(runValue);
  if (!slotRank) return false;
  if (card.isJoker) {
    return tron.suit === suit && rankMatchesRunValue(tron.rank, runValue);
  }
  if (card.suit !== suit) return false;
  return naturalValues(card).includes(runValue);
}

function tryAssignSet(
  cards: Card[],
  rank: Rank,
  aceValue: 1 | 11,
  tron: TronCard,
): MeldValidation | null {
  const usedSuits = new Set<Suit>();
  const tronWilds: Card[] = [];
  const jokers: Card[] = [];

  for (const card of cards) {
    if (isTronWildcard(card, tron)) {
      tronWilds.push(card);
      continue;
    }
    if (card.isJoker) {
      jokers.push(card);
      continue;
    }
    if (card.rank !== rank) return null;
    if (usedSuits.has(card.suit as Suit)) return null;
    usedSuits.add(card.suit as Suit);
  }

  const needed = cards.length;
  let filled = usedSuits.size;
  const jokersLeft = [...jokers];
  const wildsLeft = [...tronWilds];

  for (const suit of SUITS) {
    if (filled >= needed) break;
    if (usedSuits.has(suit)) continue;
    const slot = { suit, rank };

    const jIdx = jokersLeft.findIndex(() => jokerFitsSlot(tron, slot));
    if (jIdx >= 0) {
      jokersLeft.splice(jIdx, 1);
      usedSuits.add(suit);
      filled++;
      continue;
    }
    if (wildsLeft.length > 0) {
      wildsLeft.pop();
      usedSuits.add(suit);
      filled++;
    }
  }

  if (filled < needed) return null;

  const points = cards.length * pointsForRank(rank, aceValue);
  return { valid: true, type: 'set', points, orderedCards: cards };
}

export function validateSet(
  cards: Card[],
  aceValue: 1 | 11,
  tron: TronCard,
): MeldValidation {
  const fail = (error: string): MeldValidation => ({
    valid: false,
    type: 'set',
    points: 0,
    orderedCards: cards,
    error,
  });

  if (cards.length < MIN_MELD) return fail('Ein Set braucht mindestens 3 Karten.');
  if (cards.length > 4) return fail('Ein Set kann höchstens 4 Karten haben.');

  const fixed = cards.filter((c) => !c.isJoker && !isTronWildcard(c, tron));
  if (fixed.length === 0 && cards.every((c) => c.isJoker)) {
    return fail('Ein Set braucht mindestens eine echte Karte.');
  }

  const ranksToTry = new Set<Rank>();
  for (const c of fixed) ranksToTry.add(c.rank as Rank);
  if (fixed.length === 0) ranksToTry.add(tron.rank);

  for (const rank of ranksToTry) {
    const result = tryAssignSet(cards, rank, aceValue, tron);
    if (result) return result;
  }

  return fail('Ungültiges Set.');
}

export function validateRun(
  cards: Card[],
  aceValue: 1 | 11,
  tron: TronCard,
): MeldValidation {
  const fail = (error: string): MeldValidation => ({
    valid: false,
    type: 'run',
    points: 0,
    orderedCards: cards,
    error,
  });

  if (cards.length < MIN_MELD) return fail('Ein Lauf braucht mindestens 3 Karten.');
  if (cards.length > 13) return fail('Ein Lauf kann höchstens 13 Karten haben.');

  const fixed = cards.filter((c) => !c.isJoker && !isTronWildcard(c, tron));
  if (fixed.length === 0) return fail('Ein Lauf braucht mindestens eine echte Karte.');

  const suit = fixed[0].suit as Suit;
  if (!fixed.every((c) => c.suit === suit)) {
    return fail('Alle Karten eines Laufs müssen dieselbe Farbe haben.');
  }

  const firstFixedIndex = cards.findIndex((c) => !c.isJoker && !isTronWildcard(c, tron));
  const firstFixed = cards[firstFixedIndex];

  for (const baseValue of naturalValues(firstFixed)) {
    const values = cards.map((_, i) => baseValue + (i - firstFixedIndex));
    if (values[0] < 1 || values[values.length - 1] > 14) continue;

    const allFit = cards.every((card, i) => cardFitsRunSlot(card, suit, values[i], tron));
    if (!allFit) continue;

    const points = values.reduce((sum, v) => sum + pointsForRunValue(v, aceValue), 0);
    return { valid: true, type: 'run', points, orderedCards: cards };
  }

  return fail('Die Karten bilden keinen fortlaufenden Lauf in einer Farbe.');
}

export function validateMeld(
  cards: Card[],
  type: MeldType,
  aceValue: 1 | 11,
  tron: TronCard,
): MeldValidation {
  return type === 'set'
    ? validateSet(cards, aceValue, tron)
    : validateRun(cards, aceValue, tron);
}

export function detectMeld(
  cards: Card[],
  aceValue: 1 | 11,
  tron: TronCard,
): MeldValidation | null {
  const asSet = validateSet(cards, aceValue, tron);
  if (asSet.valid) return asSet;
  const asRun = validateRun(cards, aceValue, tron);
  if (asRun.valid) return asRun;
  return null;
}
