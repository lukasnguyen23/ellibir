import { describe, expect, it } from 'vitest';
import { createGame } from '../rules';

describe('createGame', () => {
  it('wählt einen Startspieler mit 15 Karten und meld-Phase', () => {
    const game = createGame({
      players: [
        { id: 'p1', name: 'A' },
        { id: 'p2', name: 'B' },
        { id: 'p3', name: 'C' },
      ],
      seed: 42,
    });

    const starter = game.players[game.currentPlayerIndex];
    expect(starter.hand).toHaveLength(15);
    game.players.forEach((p, i) => {
      if (i !== game.currentPlayerIndex) expect(p.hand).toHaveLength(14);
    });
    expect(game.turnPhase).toBe('meld');
    expect(game.log.some((line) => line.includes('beginnt mit 15 Karten'))).toBe(true);
    expect(game.indicatorCard.isJoker).toBe(false);
    expect(game.tron.suit).toBe(game.indicatorCard.suit);
  });

  it('wählt bei gleichem Seed denselben Startspieler', () => {
    const players = [
      { id: 'p1', name: 'A' },
      { id: 'p2', name: 'B' },
    ];
    const a = createGame({ players, seed: 100 });
    const b = createGame({ players, seed: 100 });
    expect(a.currentPlayerIndex).toBe(b.currentPlayerIndex);
  });
});
