import { describe, expect, it } from 'vitest';
import { canOpen } from '../openingDetection';
import { unmeldedPenalty } from '../penalties';
import { DEFAULT_SETTINGS } from '../rules';
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

describe('canOpen', () => {
  it('erkennt Eröffnung mit gültigem Per', () => {
    const hand = [
      card('hearts', 'K'),
      card('spades', 'K'),
      card('diamonds', 'K'),
      card('hearts', '7'),
      card('spades', '7'),
      card('clubs', '7'),
    ];
    expect(canOpen(hand, DEFAULT_SETTINGS, TRON)).toBe(true);
  });

  it('erkennt Eröffnung auch mit kleinem Per', () => {
    const hand = [card('hearts', '5'), card('spades', '5'), card('diamonds', '5')];
    expect(canOpen(hand, DEFAULT_SETTINGS, TRON)).toBe(true);
  });

  it('lehnt ab wenn kein Per möglich', () => {
    const hand = [card('hearts', '5'), card('spades', '3'), card('clubs', 'K')];
    expect(canOpen(hand, DEFAULT_SETTINGS, TRON)).toBe(false);
  });
});
