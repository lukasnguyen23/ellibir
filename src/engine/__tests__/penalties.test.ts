import { describe, expect, it } from 'vitest';
import { unmeldedPenalty } from '../penalties';
import { card } from './helpers';

const TRON = { suit: 'diamonds' as const, rank: '8' as const };

describe('unmeldedPenalty', () => {
  it('legt gültiges Set ab und zählt nur Rest', () => {
    const hand = [
      card('hearts', '7'),
      card('spades', '7'),
      card('clubs', '7'),
      card('hearts', 'K'),
    ];
    expect(unmeldedPenalty(hand, 11, TRON)).toBe(10);
  });

  it('zählt alle Karten wenn kein Per möglich', () => {
    const hand = [card('hearts', '5'), card('spades', '3'), card('clubs', 'K')];
    expect(unmeldedPenalty(hand, 11, TRON)).toBe(5 + 3 + 10);
  });
});
