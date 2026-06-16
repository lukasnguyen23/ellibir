import { describe, expect, it } from 'vitest';
import {
  RANK_SEQUENCE,
  computeTron,
  indicatorPenaltyMultiplier,
  isTronCard,
  isTronWildcard,
  jokerFitsSlot,
  nextRankInSequence,
} from '../tron';
import { card } from './helpers';

describe('RANK_SEQUENCE', () => {
  it('folgt 2 bis Ass', () => {
    expect(RANK_SEQUENCE[0]).toBe('2');
    expect(RANK_SEQUENCE[RANK_SEQUENCE.length - 1]).toBe('A');
  });

  it('berechnet nächsten Rang', () => {
    expect(nextRankInSequence('7')).toBe('8');
    expect(nextRankInSequence('10')).toBe('J');
    expect(nextRankInSequence('K')).toBe('A');
    expect(nextRankInSequence('A')).toBe('2');
  });
});

describe('computeTron', () => {
  it('7♦ → 8♦', () => {
    const tron = computeTron(card('diamonds', '7'));
    expect(tron).toEqual({ suit: 'diamonds', rank: '8' });
  });

  it('10♥ → B♥', () => {
    const tron = computeTron(card('hearts', '10'));
    expect(tron).toEqual({ suit: 'hearts', rank: 'J' });
  });

  it('K♠ → A♠', () => {
    const tron = computeTron(card('spades', 'K'));
    expect(tron).toEqual({ suit: 'spades', rank: 'A' });
  });

  it('A♥ → 2♥', () => {
    const tron = computeTron(card('hearts', 'A'));
    expect(tron).toEqual({ suit: 'hearts', rank: '2' });
  });
});

describe('indicatorPenaltyMultiplier', () => {
  it('♣1 ♠2 ♥3 ♦4', () => {
    expect(indicatorPenaltyMultiplier(card('clubs', '5'))).toBe(1);
    expect(indicatorPenaltyMultiplier(card('spades', '5'))).toBe(2);
    expect(indicatorPenaltyMultiplier(card('hearts', '5'))).toBe(3);
    expect(indicatorPenaltyMultiplier(card('diamonds', '5'))).toBe(4);
  });
});

describe('tron card helpers', () => {
  const tron = { suit: 'hearts' as const, rank: '8' as const };

  it('erkennt Tron-Karte', () => {
    expect(isTronCard(card('hearts', '8'), tron)).toBe(true);
    expect(isTronCard(card('hearts', '7'), tron)).toBe(false);
    expect(isTronWildcard(card('hearts', '8'), tron)).toBe(true);
  });

  it('jokerFitsSlot nur exakter Tron', () => {
    expect(jokerFitsSlot(tron, { suit: 'hearts', rank: '8' })).toBe(true);
    expect(jokerFitsSlot(tron, { suit: 'clubs', rank: '8' })).toBe(false);
  });
});
