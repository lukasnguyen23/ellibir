import type { Card, Suit } from '@/engine/types';

export const SUIT_SYMBOL: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

export function isRed(suit: Suit | null): boolean {
  return suit === 'hearts' || suit === 'diamonds';
}

export function cardLabel(card: Card): string {
  if (card.isJoker) return 'Joker';
  return `${card.rank}${SUIT_SYMBOL[card.suit as Suit]}`;
}
