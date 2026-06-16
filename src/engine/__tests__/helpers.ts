import type { Card, Rank, Suit } from '../types';

let n = 0;

/** Kurz-Helfer: card('hearts','7') oder card('joker'). */
export function card(suit: Suit | 'joker', rank?: Rank): Card {
  n += 1;
  if (suit === 'joker') {
    return { id: `j-${n}`, suit: null, rank: null, isJoker: true };
  }
  return { id: `${suit}-${rank}-${n}`, suit, rank: rank!, isJoker: false };
}
