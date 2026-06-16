import { describe, expect, it } from 'vitest';
import { validateRun, validateSet, detectMeld } from '../melds';
import { card } from './helpers';

describe('validateSet', () => {
  it('akzeptiert gleichen Wert in verschiedenen Farben', () => {
    const res = validateSet([card('hearts', '7'), card('spades', '7'), card('diamonds', '7')], 11);
    expect(res.valid).toBe(true);
    expect(res.points).toBe(21);
  });

  it('lehnt doppelte Farbe ab', () => {
    const res = validateSet([card('hearts', '7'), card('hearts', '7'), card('spades', '7')], 11);
    expect(res.valid).toBe(false);
  });

  it('lehnt unterschiedliche Werte ab', () => {
    const res = validateSet([card('hearts', '7'), card('spades', '8'), card('diamonds', '7')], 11);
    expect(res.valid).toBe(false);
  });

  it('akzeptiert Joker als Platzhalter', () => {
    const res = validateSet([card('hearts', 'K'), card('spades', 'K'), card('joker')], 11);
    expect(res.valid).toBe(true);
    expect(res.points).toBe(30);
  });

  it('lehnt zu wenige Karten ab', () => {
    const res = validateSet([card('hearts', '7'), card('spades', '7')], 11);
    expect(res.valid).toBe(false);
  });
});

describe('validateRun', () => {
  it('akzeptiert aufeinanderfolgende Karten gleicher Farbe', () => {
    const res = validateRun([card('clubs', '5'), card('clubs', '6'), card('clubs', '7')], 11);
    expect(res.valid).toBe(true);
    expect(res.points).toBe(18);
  });

  it('lehnt gemischte Farben ab', () => {
    const res = validateRun([card('clubs', '5'), card('hearts', '6'), card('clubs', '7')], 11);
    expect(res.valid).toBe(false);
  });

  it('füllt Lücken mit Joker', () => {
    const res = validateRun([card('clubs', '5'), card('joker'), card('clubs', '7')], 11);
    expect(res.valid).toBe(true);
    expect(res.points).toBe(18); // 5 + 6(Joker) + 7
  });

  it('akzeptiert Ass tief (A-2-3)', () => {
    const res = validateRun([card('hearts', 'A'), card('hearts', '2'), card('hearts', '3')], 11);
    expect(res.valid).toBe(true);
    expect(res.points).toBe(11 + 2 + 3);
  });

  it('akzeptiert Ass hoch (Q-K-A)', () => {
    const res = validateRun([card('hearts', 'Q'), card('hearts', 'K'), card('hearts', 'A')], 11);
    expect(res.valid).toBe(true);
    expect(res.points).toBe(10 + 10 + 11);
  });

  it('lehnt nicht-fortlaufende Karten ab', () => {
    const res = validateRun([card('clubs', '5'), card('clubs', '7'), card('clubs', '9')], 11);
    expect(res.valid).toBe(false);
  });

  it('respektiert aceValue=1 in Punkten', () => {
    const res = validateRun([card('hearts', 'A'), card('hearts', '2'), card('hearts', '3')], 1);
    expect(res.points).toBe(1 + 2 + 3);
  });
});

describe('detectMeld', () => {
  it('erkennt Set automatisch', () => {
    const res = detectMeld([card('hearts', '9'), card('spades', '9'), card('clubs', '9')], 11);
    expect(res?.type).toBe('set');
  });

  it('erkennt Lauf automatisch', () => {
    const res = detectMeld([card('clubs', '5'), card('clubs', '6'), card('clubs', '7')], 11);
    expect(res?.type).toBe('run');
  });

  it('gibt null bei ungültiger Kombination', () => {
    expect(detectMeld([card('clubs', '5'), card('hearts', '9')], 11)).toBeNull();
  });
});
