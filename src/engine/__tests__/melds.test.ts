import { describe, expect, it } from 'vitest';
import { validateRun, validateSet, detectMeld } from '../melds';
import { card } from './helpers';

const TRON = { suit: 'hearts' as const, rank: '8' as const };

describe('validateSet mit Tron', () => {
  it('akzeptiert Set mit Joker als Tron-Slot', () => {
    const res = validateSet(
      [card('spades', '8'), card('diamonds', '8'), card('joker')],
      11,
      TRON,
    );
    expect(res.valid).toBe(true);
  });

  it('lehnt Joker ab wenn Slot nicht Tron ist', () => {
    const res = validateSet(
      [card('spades', '7'), card('diamonds', '7'), card('joker')],
      11,
      TRON,
    );
    expect(res.valid).toBe(false);
  });

  it('akzeptiert echte Tron-Karte als Wildcard im Set', () => {
    const res = validateSet(
      [card('spades', '7'), card('diamonds', '7'), card('hearts', '8')],
      11,
      TRON,
    );
    expect(res.valid).toBe(true);
  });
});

describe('validateRun mit Tron', () => {
  it('akzeptiert Ass tief A-2-3', () => {
    const res = validateRun(
      [card('hearts', 'A'), card('hearts', '2'), card('hearts', '3')],
      11,
      TRON,
    );
    expect(res.valid).toBe(true);
  });

  it('akzeptiert Ass hoch Q-K-A', () => {
    const res = validateRun(
      [card('hearts', 'Q'), card('hearts', 'K'), card('hearts', 'A')],
      11,
      TRON,
    );
    expect(res.valid).toBe(true);
  });

  it('füllt Lücke mit Joker wenn Tron passt', () => {
    const res = validateRun(
      [card('hearts', '6'), card('hearts', '7'), card('joker')],
      11,
      TRON,
    );
    expect(res.valid).toBe(true);
  });

  it('lehnt Joker in falscher Farbe ab', () => {
    const res = validateRun(
      [card('clubs', '5'), card('joker'), card('clubs', '7')],
      11,
      TRON,
    );
    expect(res.valid).toBe(false);
  });

  it('echte Tron-Karte füllt Lauf-Slot', () => {
    const res = validateRun(
      [card('hearts', '6'), card('hearts', '7'), card('hearts', '8')],
      11,
      TRON,
    );
    expect(res.valid).toBe(true);
  });
});

describe('detectMeld', () => {
  it('erkennt Set automatisch', () => {
    const res = detectMeld(
      [card('hearts', '9'), card('spades', '9'), card('clubs', '9')],
      11,
      TRON,
    );
    expect(res?.type).toBe('set');
  });
});
