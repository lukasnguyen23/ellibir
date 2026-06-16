import { RANKS, SUITS, type Card } from './types';
import { createRng, shuffle, type Rng } from './rng';

/** Erstellt einen vollständigen Kartensatz: 2 Decks + n Joker. */
export function createFullDeck(jokerCount: number): Card[] {
  const cards: Card[] = [];
  for (let deck = 0; deck < 2; deck++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        cards.push({
          id: `${suit}-${rank}-${deck}`,
          suit,
          rank,
          isJoker: false,
        });
      }
    }
  }
  for (let j = 0; j < jokerCount; j++) {
    cards.push({ id: `joker-${j}`, suit: null, rank: null, isJoker: true });
  }
  return cards;
}

function firstNonJokerIndex(deck: Card[], indices: number[]): number | undefined {
  return indices.find((i) => !deck[i].isJoker);
}

export interface DealResult {
  hands: Card[][];
  drawPile: Card[];
  discardPile: Card[];
  indicatorCard: Card;
  startingPlayerIndex: number;
}

/** Mischt und verteilt Karten an die Spieler, legt Nachzieh- und Ablagestapel an. */
export function dealCards(
  numPlayers: number,
  cardsPerPlayer: number,
  jokerCount: number,
  seed: number,
): DealResult {
  const rng: Rng = createRng(seed);
  const deck = shuffle(createFullDeck(jokerCount), rng);

  const hands: Card[][] = Array.from({ length: numPlayers }, () => []);
  let index = 0;
  for (let c = 0; c < cardsPerPlayer; c++) {
    for (let p = 0; p < numPlayers; p++) {
      hands[p].push(deck[index++]);
    }
  }

  const startingPlayerIndex = rng.int(numPlayers);
  hands[startingPlayerIndex].push(deck[index++]);

  const poolIndices = Array.from({ length: deck.length - index }, (_, j) => index + j);

  const indicatorIndex = firstNonJokerIndex(deck, poolIndices);
  if (indicatorIndex === undefined) {
    throw new Error('Keine Anzeigekarte verfügbar.');
  }

  const discardPool = poolIndices.filter((i) => i !== indicatorIndex);
  const discardStartIndex = firstNonJokerIndex(deck, discardPool) ?? discardPool[0];

  const indicatorCard = deck[indicatorIndex];
  const discardCard = deck[discardStartIndex];
  const drawPile = deck.filter(
    (_, i) => i >= index && i !== indicatorIndex && i !== discardStartIndex,
  );

  return {
    hands,
    drawPile,
    discardPile: [discardCard],
    indicatorCard,
    startingPlayerIndex,
  };
}
