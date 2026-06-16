import type { Card, MeldType, Rank } from './types';
import { pointsForRank, pointsForRunValue, rankToValue } from './scoring';

export interface MeldValidation {
  valid: boolean;
  type: MeldType;
  points: number;
  /** Karten in gültiger Reihenfolge (bei Läufen aufsteigend). */
  orderedCards: Card[];
  error?: string;
}

const MIN_MELD = 3;

/** Erlaubte numerische Werte einer natürlichen Karte (Ass = 1 oder 14). */
function naturalValues(card: Card): number[] {
  if (card.rank === 'A') return [1, 14];
  return [rankToValue(card.rank as Rank)];
}

/** Validiert ein Set: gleicher Wert, verschiedene Farben, Joker als Platzhalter. */
export function validateSet(cards: Card[], aceValue: 1 | 11): MeldValidation {
  const fail = (error: string): MeldValidation => ({
    valid: false,
    type: 'set',
    points: 0,
    orderedCards: cards,
    error,
  });

  if (cards.length < MIN_MELD) return fail('Ein Set braucht mindestens 3 Karten.');
  if (cards.length > 4) return fail('Ein Set kann höchstens 4 Karten haben.');

  const naturals = cards.filter((c) => !c.isJoker);
  if (naturals.length === 0) return fail('Ein Set braucht mindestens eine echte Karte.');

  const rank = naturals[0].rank as Rank;
  if (!naturals.every((c) => c.rank === rank)) {
    return fail('Alle Karten eines Sets müssen denselben Wert haben.');
  }

  const suits = naturals.map((c) => c.suit);
  if (new Set(suits).size !== suits.length) {
    return fail('Ein Set darf jede Farbe nur einmal enthalten.');
  }

  const points = cards.length * pointsForRank(rank, aceValue);
  return { valid: true, type: 'set', points, orderedCards: cards };
}

/** Validiert einen Lauf (in der gegebenen Reihenfolge): gleiche Farbe, fortlaufend. */
export function validateRun(cards: Card[], aceValue: 1 | 11): MeldValidation {
  const fail = (error: string): MeldValidation => ({
    valid: false,
    type: 'run',
    points: 0,
    orderedCards: cards,
    error,
  });

  if (cards.length < MIN_MELD) return fail('Ein Lauf braucht mindestens 3 Karten.');
  if (cards.length > 13) return fail('Ein Lauf kann höchstens 13 Karten haben.');

  const naturals = cards.filter((c) => !c.isJoker);
  if (naturals.length === 0) return fail('Ein Lauf braucht mindestens eine echte Karte.');

  const suit = naturals[0].suit;
  if (!naturals.every((c) => c.suit === suit)) {
    return fail('Alle Karten eines Laufs müssen dieselbe Farbe haben.');
  }

  const firstNaturalIndex = cards.findIndex((c) => !c.isJoker);
  const firstNatural = cards[firstNaturalIndex];

  for (const baseValue of naturalValues(firstNatural)) {
    const values = cards.map((_, i) => baseValue + (i - firstNaturalIndex));

    if (values[0] < 1 || values[values.length - 1] > 14) continue;

    const allNaturalsFit = cards.every((card, i) => {
      if (card.isJoker) return true;
      return naturalValues(card).includes(values[i]);
    });
    if (!allNaturalsFit) continue;

    const points = values.reduce((sum, v) => sum + pointsForRunValue(v, aceValue), 0);
    return { valid: true, type: 'run', points, orderedCards: cards };
  }

  return fail('Die Karten bilden keinen fortlaufenden Lauf in einer Farbe.');
}

export function validateMeld(
  cards: Card[],
  type: MeldType,
  aceValue: 1 | 11,
): MeldValidation {
  return type === 'set' ? validateSet(cards, aceValue) : validateRun(cards, aceValue);
}

/** Versucht, automatisch zu erkennen, ob Karten ein gültiges Set oder einen Lauf bilden. */
export function detectMeld(cards: Card[], aceValue: 1 | 11): MeldValidation | null {
  const asSet = validateSet(cards, aceValue);
  if (asSet.valid) return asSet;
  const asRun = validateRun(cards, aceValue);
  if (asRun.valid) return asRun;
  return null;
}
