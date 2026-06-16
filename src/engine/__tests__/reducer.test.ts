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
      { id: 'p1', name: 'A', hand, hasOpened: false, score: 0 },
      { id: 'p2', name: 'B', hand: [card('clubs', '2')], hasOpened: false, score: 0 },
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

describe('51-Punkte-Eröffnung', () => {
  it('lehnt eine Auslage unter 51 ab', () => {
    const c = [card('hearts', '5'), card('spades', '5'), card('diamonds', '5')];
    const state = makeState([...c]);
    const res = applyMove(state, {
      type: 'LAY_INITIAL_MELDS',
      melds: [{ cardIds: c.map((x) => x.id), type: 'set' }],
    });
    expect(res.ok).toBe(false);
    expect(res.state.players[0].hasOpened).toBe(false);
  });

  it('akzeptiert eine Auslage mit genau/über 51', () => {
    const set1 = [card('hearts', 'K'), card('spades', 'K'), card('diamonds', 'K')];
    const set2 = [card('hearts', '7'), card('spades', '7'), card('diamonds', '7')];
    const state = makeState([...set1, ...set2]);
    const res = applyMove(state, {
      type: 'LAY_INITIAL_MELDS',
      melds: [
        { cardIds: set1.map((x) => x.id), type: 'set' },
        { cardIds: set2.map((x) => x.id), type: 'set' },
      ],
    });
    expect(res.ok).toBe(true);
    expect(res.state.players[0].hasOpened).toBe(true);
    expect(res.state.melds).toHaveLength(2);
    expect(res.state.players[0].hand).toHaveLength(0);
  });

  it('verhindert das Auslegen einzelner Pers vor der Eröffnung', () => {
    const c = [card('hearts', 'K'), card('spades', 'K'), card('diamonds', 'K')];
    const state = makeState([...c]);
    const res = applyMove(state, {
      type: 'LAY_MELD',
      cardIds: c.map((x) => x.id),
      meldType: 'set',
    });
    expect(res.ok).toBe(false);
  });

  it('vergibt -100 wenn anderer eröffnen konnte', () => {
    const set1 = [card('hearts', 'K'), card('spades', 'K'), card('diamonds', 'K')];
    const set2 = [card('hearts', '7'), card('spades', '7'), card('diamonds', '7')];
    const openerHand = [...set1, ...set2];
    const couldOpenHand = [
      card('hearts', 'K'),
      card('spades', 'K'),
      card('diamonds', 'K'),
      card('hearts', '7'),
      card('spades', '7'),
      card('clubs', '7'),
    ];
    const state = makeState(openerHand, {
      players: [
        { id: 'p1', name: 'A', hand: openerHand, hasOpened: false, score: 0 },
        { id: 'p2', name: 'B', hand: couldOpenHand, hasOpened: false, score: 0 },
      ],
    });
    const res = applyMove(state, {
      type: 'LAY_INITIAL_MELDS',
      melds: [
        { cardIds: set1.map((x) => x.id), type: 'set' },
        { cardIds: set2.map((x) => x.id), type: 'set' },
      ],
    });
    expect(res.ok).toBe(true);
    expect(res.state.players[1].score).toBe(-100);
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

describe('Siegbedingung', () => {
  it('beendet das Spiel mit Restkarten-Strafe', () => {
    const set1 = [card('hearts', 'K'), card('spades', 'K'), card('diamonds', 'K')];
    const set2 = [card('hearts', '7'), card('spades', '7'), card('diamonds', '7')];
    const state = makeState([...set1, ...set2]);
    const res = applyMove(state, {
      type: 'LAY_INITIAL_MELDS',
      melds: [
        { cardIds: set1.map((x) => x.id), type: 'set' },
        { cardIds: set2.map((x) => x.id), type: 'set' },
      ],
    });
    expect(res.state.status).toBe('finished');
    expect(res.state.winnerId).toBe('p1');
    expect(res.state.players[1].score).toBeGreaterThan(0);
  });
});

describe('Anlegen an Pers', () => {
  it('legt eine passende Karte an einen Lauf an', () => {
    const runCards = [card('clubs', '5'), card('clubs', '6'), card('clubs', '7')];
    const extra = card('clubs', '8');
    const state = makeState([extra], {
      melds: [{ id: 'm1', type: 'run', cards: runCards, ownerId: 'p1' }],
      players: [
        { id: 'p1', name: 'A', hand: [extra], hasOpened: true, score: 0 },
        { id: 'p2', name: 'B', hand: [card('clubs', '2')], hasOpened: false, score: 0 },
      ],
    });
    const res = applyMove(state, { type: 'APPEND_TO_MELD', meldId: 'm1', cardIds: [extra.id] });
    expect(res.ok).toBe(true);
    expect(res.state.melds[0].cards).toHaveLength(4);
  });
});
