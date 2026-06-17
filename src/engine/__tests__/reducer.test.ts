import { describe, expect, it } from 'vitest';
import { applyMove } from '../gameReducer';
import { DEFAULT_SETTINGS } from '../rules';
import type { Card, GameState } from '../types';
import { TEST_INDICATOR, TEST_TRON, card } from './helpers';

function makeState(hand: Card[], overrides: Partial<GameState> = {}): GameState {
  return {
    id: 'test',
    settings: { ...DEFAULT_SETTINGS },
    players: [
      { id: 'p1', name: 'A', hand, pendingMelds: [], score: 0 },
      { id: 'p2', name: 'B', hand: [card('clubs', '2')], pendingMelds: [], score: 0 },
    ],
    drawPile: [card('spades', '4'), card('spades', '5')],
    discardPile: [card('diamonds', '9')],
    indicatorCard: TEST_INDICATOR,
    tron: TEST_TRON,
    melds: [],
    currentPlayerIndex: 0,
    turnPhase: 'meld',
    status: 'playing',
    winnerId: null,
    roundNumber: 1,
    log: [],
    ...overrides,
  };
}

describe('Ziehen', () => {
  it('zieht vom Nachziehstapel und wechselt in die Meld-Phase', () => {
    const state = makeState([card('hearts', '3')], { turnPhase: 'draw' });
    const res = applyMove(state, { type: 'DRAW_STOCK' });
    expect(res.ok).toBe(true);
    expect(res.state.players[0].hand).toHaveLength(2);
    expect(res.state.turnPhase).toBe('meld');
  });

  it('verhindert doppeltes Ziehen', () => {
    const state = makeState([card('hearts', '3')], { turnPhase: 'meld' });
    const res = applyMove(state, { type: 'DRAW_STOCK' });
    expect(res.ok).toBe(false);
  });
});

describe('Verdeckte Ablage', () => {
  it('legt ein Per verdeckt ab, nicht auf den Tisch', () => {
    const c = [card('hearts', '5'), card('spades', '5'), card('diamonds', '5')];
    const state = makeState([...c, card('clubs', '2')]);
    const res = applyMove(state, {
      type: 'STAGE_MELD',
      cardIds: c.map((x) => x.id),
      meldType: 'set',
    });
    expect(res.ok).toBe(true);
    expect(res.state.melds).toHaveLength(0);
    expect(res.state.players[0].pendingMelds).toHaveLength(1);
    expect(res.state.players[0].hand).toHaveLength(1);
  });

  it('deckt Pers auf wenn die Hand leer wird', () => {
    const set1 = [card('hearts', 'K'), card('spades', 'K'), card('diamonds', 'K')];
    const set2 = [card('hearts', '7'), card('spades', '7'), card('diamonds', '7')];
    const state = makeState([...set1, ...set2]);
    const res1 = applyMove(state, {
      type: 'STAGE_MELD',
      cardIds: set1.map((x) => x.id),
      meldType: 'set',
    });
    expect(res1.state.melds).toHaveLength(0);
    expect(res1.state.players[0].pendingMelds).toHaveLength(1);

    const res2 = applyMove(res1.state, {
      type: 'STAGE_MELD',
      cardIds: set2.map((x) => x.id),
      meldType: 'set',
    });
    expect(res2.state.status).toBe('finished');
    expect(res2.state.melds).toHaveLength(2);
    expect(res2.state.players[0].pendingMelds).toHaveLength(0);
  });

  it('deckt verdeckte Pers auf und gewinnt wenn die letzte Karte abgeworfen wird', () => {
    const meldCards = [card('hearts', '5'), card('spades', '5'), card('diamonds', '5')];
    const toss = card('clubs', '2');
    const state = makeState([...meldCards, toss]);
    const staged = applyMove(state, {
      type: 'STAGE_MELD',
      cardIds: meldCards.map((x) => x.id),
      meldType: 'set',
    });
    expect(staged.state.melds).toHaveLength(0);

    const discarded = applyMove(staged.state, { type: 'DISCARD', cardId: toss.id });
    expect(discarded.state.status).toBe('finished');
    expect(discarded.state.melds).toHaveLength(1);
    expect(discarded.state.players[0].pendingMelds).toHaveLength(0);
    expect(discarded.state.winnerId).toBe('p1');
  });

  it('behält verdeckte Pers wenn nach Abwurf noch Karten auf der Hand sind', () => {
    const meldCards = [card('hearts', '5'), card('spades', '5'), card('diamonds', '5')];
    const keep = card('clubs', '2');
    const toss = card('clubs', '3');
    const state = makeState([...meldCards, keep, toss]);
    const staged = applyMove(state, {
      type: 'STAGE_MELD',
      cardIds: meldCards.map((x) => x.id),
      meldType: 'set',
    });
    const discarded = applyMove(staged.state, { type: 'DISCARD', cardId: toss.id });
    expect(discarded.state.melds).toHaveLength(0);
    expect(discarded.state.players[0].pendingMelds).toHaveLength(1);
    expect(discarded.state.currentPlayerIndex).toBe(1);
  });

  it('nimmt ein verdecktes Per zurück in die Hand', () => {
    const meldCards = [card('hearts', '5'), card('spades', '5'), card('diamonds', '5')];
    const extra = card('clubs', '2');
    const state = makeState([...meldCards, extra]);
    const staged = applyMove(state, {
      type: 'STAGE_MELD',
      cardIds: meldCards.map((x) => x.id),
      meldType: 'set',
    });
    const pendingId = staged.state.players[0].pendingMelds[0].id;
    const unstaged = applyMove(staged.state, { type: 'UNSTAGE_MELD', pendingMeldId: pendingId });
    expect(unstaged.ok).toBe(true);
    expect(unstaged.state.players[0].pendingMelds).toHaveLength(0);
    expect(unstaged.state.players[0].hand).toHaveLength(4);
  });
});

describe('Abwerfen & Zugwechsel', () => {
  it('wirft ab und gibt den Zug weiter', () => {
    const keep = card('hearts', '3');
    const toss = card('hearts', '4');
    const state = makeState([keep, toss]);
    const res = applyMove(state, { type: 'DISCARD', cardId: toss.id });
    expect(res.ok).toBe(true);
    expect(res.state.currentPlayerIndex).toBe(1);
    expect(res.state.turnPhase).toBe('draw');
    expect(res.state.discardPile.at(-1)?.id).toBe(toss.id);
  });
});

describe('Anlegen an Pers', () => {
  it('legt eine passende Karte an einen sichtbaren Lauf an', () => {
    const runCards = [card('clubs', '5'), card('clubs', '6'), card('clubs', '7')];
    const extra = card('clubs', '8');
    const state = makeState([extra], {
      melds: [{ id: 'm1', type: 'run', cards: runCards, ownerId: 'p1' }],
      players: [
        { id: 'p1', name: 'A', hand: [extra], pendingMelds: [], score: 0 },
        { id: 'p2', name: 'B', hand: [card('clubs', '2')], pendingMelds: [], score: 0 },
      ],
    });
    const res = applyMove(state, { type: 'APPEND_TO_MELD', meldId: 'm1', cardIds: [extra.id] });
    expect(res.ok).toBe(true);
    expect(res.state.melds[0].cards).toHaveLength(4);
  });
});
