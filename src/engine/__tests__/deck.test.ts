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
  });

  it('gibt einem Startspieler 15 und den anderen 14 Karten', () => {
    for (const numPlayers of [2, 3, 4]) {
      const { hands, drawPile, discardPile, startingPlayerIndex } = dealCards(
        numPlayers,
        14,
        4,
        999 + numPlayers,
      );
      expect(hands).toHaveLength(numPlayers);
      hands.forEach((h, i) => {
        expect(h).toHaveLength(i === startingPlayerIndex ? 15 : 14);
      });
      expect(discardPile).toHaveLength(1);
      expect(discardPile[0].isJoker).toBe(false);
      expect(hands.flat().length + drawPile.length + discardPile.length).toBe(2 * 52 + 4);
    }
  });
});
