import { describe, expect, it } from 'vitest';
import { createFullDeck, dealCards } from '../deck';

describe('Deck', () => {
  it('erstellt 2 Decks + Joker', () => {
    const deck = createFullDeck(4);
    expect(deck).toHaveLength(2 * 52 + 4);
    expect(deck.filter((c) => c.isJoker)).toHaveLength(4);
  });

  it('vergibt eindeutige IDs', () => {
    const deck = createFullDeck(4);
    const ids = new Set(deck.map((c) => c.id));
    expect(ids.size).toBe(deck.length);
  });

  it('verteilt deterministisch bei gleichem Seed', () => {
    const a = dealCards(4, 14, 4, 12345);
    const b = dealCards(4, 14, 4, 12345);
    expect(a.hands[0].map((c) => c.id)).toEqual(b.hands[0].map((c) => c.id));
    expect(a.indicatorCard.id).toBe(b.indicatorCard.id);
  });

  it('gibt jedem Spieler die richtige Kartenzahl', () => {
    const { hands, drawPile, discardPile, indicatorCard } = dealCards(4, 14, 4, 999);
    expect(hands).toHaveLength(4);
    const totalHand = hands.reduce((s, h) => s + h.length, 0);
    expect(totalHand).toBe(14 * 4 + 1);
    expect(discardPile).toHaveLength(1);
    expect(discardPile[0].isJoker).toBe(false);
    expect(indicatorCard.isJoker).toBe(false);
    expect(hands.flat().length + drawPile.length + discardPile.length + 1).toBe(2 * 52 + 4);
  });

  it('legt Anzeigekarte separat vom Nachziehstapel', () => {
    const { drawPile, indicatorCard } = dealCards(2, 14, 4, 42);
    expect(drawPile.some((c) => c.id === indicatorCard.id)).toBe(false);
  });

  it('unterstützt bis zu 7 Spieler', () => {
    const { hands, drawPile, discardPile, indicatorCard } = dealCards(7, 14, 4, 777);
    expect(hands).toHaveLength(7);
    expect(hands.reduce((s, h) => s + h.length, 0)).toBe(14 * 7 + 1);
    expect(hands.flat().length + drawPile.length + discardPile.length + 1).toBe(2 * 52 + 4);
    expect(indicatorCard.isJoker).toBe(false);
  });
});
