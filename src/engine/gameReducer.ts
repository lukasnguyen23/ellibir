import { validateMeld, validateRun, validateSet } from './melds';
import { unmeldedPenalty } from './penalties';
import { indicatorPenaltyMultiplier, isTronDiscard } from './tron';
import type { Card, GameState, MeldType, Move, MoveResult, PlayerState, TronCard } from './types';

function nextMeldId(): string {
  return crypto.randomUUID();
}

function clone(state: GameState): GameState {
  return structuredClone(state);
}

function err(state: GameState, error: string): MoveResult {
  return { ok: false, state, error };
}

function pickCards(hand: Card[], ids: string[]): Card[] | null {
  const map = new Map(hand.map((c) => [c.id, c]));
  const picked: Card[] = [];
  for (const id of ids) {
    const card = map.get(id);
    if (!card) return null;
    picked.push(card);
    map.delete(id);
  }
  return picked;
}

function removeCards(hand: Card[], ids: string[]): Card[] {
  const idSet = new Set(ids);
  return hand.filter((c) => !idSet.has(c.id));
}

function advanceTurn(state: GameState): void {
  state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
  state.turnPhase = 'draw';
}

function applyLoserPenalties(
  state: GameState,
  winnerId: string,
  wonByTronDiscard: boolean,
): void {
  const suitMult = indicatorPenaltyMultiplier(state.indicatorCard);
  const tronMult = wonByTronDiscard ? 2 : 1;
  const totalMult = suitMult * tronMult;

  for (const p of state.players) {
    if (p.id === winnerId) continue;
    const deadwood = unmeldedPenalty(p.hand, state.settings.aceValue, state.tron);
    const penalty = deadwood * totalMult;
    p.score += penalty;
    if (penalty > 0) {
      state.log.push(
        `${p.name}: ${deadwood} Restpunkte × ${totalMult}${wonByTronDiscard ? ' (Tron-Sieg)' : ''} = ${penalty}`,
      );
    }
  }
}

function revealPendingMelds(state: GameState, player: PlayerState): boolean {
  if (player.hand.length > 0 || player.pendingMelds.length === 0) return false;
  const count = player.pendingMelds.length;
  state.melds.push(...player.pendingMelds);
  player.pendingMelds = [];
  state.log.push(`${player.name} deckt ${count} verdeckte Per${count === 1 ? '' : 's'} auf.`);
  return true;
}

function tryRevealAndFinish(state: GameState, discardedCard?: Card): boolean {
  const player = state.players[state.currentPlayerIndex];
  revealPendingMelds(state, player);
  return finishIfEmpty(state, discardedCard);
}

function finishIfEmpty(state: GameState, discardedCard?: Card): boolean {
  const player = state.players[state.currentPlayerIndex];
  if (player.hand.length === 0) {
    state.status = 'finished';
    state.winnerId = player.id;
    const wonByTron =
      discardedCard !== undefined && isTronDiscard(discardedCard, state.tron);
    applyLoserPenalties(state, player.id, wonByTron);
    state.log.push(`${player.name} hat gewonnen!${wonByTron ? ' (Tron-Abwurf)' : ''}`);
    return true;
  }
  return false;
}

/** Pure: erzeugt aus (state, move) einen neuen Zustand. Validiert jeden Zug. */
export function applyMove(prev: GameState, move: Move): MoveResult {
  if (prev.status === 'finished') return err(prev, 'Das Spiel ist bereits beendet.');

  const state = clone(prev);
  const player = state.players[state.currentPlayerIndex];
  const aceValue = state.settings.aceValue;
  const tron = state.tron;

  switch (move.type) {
    case 'DRAW_STOCK': {
      if (state.turnPhase !== 'draw') return err(prev, 'Du hast bereits gezogen.');
      if (state.drawPile.length === 0) {
        if (state.discardPile.length <= 1) return err(prev, 'Keine Karten mehr zum Ziehen.');
        const top = state.discardPile[state.discardPile.length - 1];
        const rest = state.discardPile.slice(0, -1);
        state.drawPile = rest;
        state.discardPile = [top];
      }
      const card = state.drawPile.pop()!;
      player.hand.push(card);
      state.turnPhase = 'meld';
      state.log.push(`${player.name} zieht vom Nachziehstapel.`);
      return { ok: true, state };
    }

    case 'DRAW_DISCARD': {
      if (state.turnPhase !== 'draw') return err(prev, 'Du hast bereits gezogen.');
      if (state.discardPile.length === 0) return err(prev, 'Der Ablagestapel ist leer.');
      const card = state.discardPile.pop()!;
      player.hand.push(card);
      state.turnPhase = 'meld';
      state.log.push(`${player.name} nimmt die offene Karte.`);
      return { ok: true, state };
    }

    case 'STAGE_MELD': {
      if (state.turnPhase !== 'meld') return err(prev, 'Du musst zuerst eine Karte ziehen.');
      const cards = pickCards(player.hand, move.cardIds);
      if (!cards) return err(prev, 'Karte nicht in der Hand gefunden.');
      const validation = validateMeld(cards, move.meldType, aceValue, tron);
      if (!validation.valid) return err(prev, validation.error ?? 'Ungültiges Per.');

      player.hand = removeCards(player.hand, move.cardIds);
      player.pendingMelds.push({
        id: nextMeldId(),
        type: move.meldType,
        cards: validation.orderedCards,
        ownerId: player.id,
      });
      state.log.push(`${player.name} legt ein Per verdeckt ab.`);
      tryRevealAndFinish(state);
      return { ok: true, state };
    }

    case 'UNSTAGE_MELD': {
      if (state.turnPhase !== 'meld') return err(prev, 'Du musst zuerst eine Karte ziehen.');
      const idx = player.pendingMelds.findIndex((m) => m.id === move.pendingMeldId);
      if (idx < 0) return err(prev, 'Verdecktes Per nicht gefunden.');
      const [meld] = player.pendingMelds.splice(idx, 1);
      player.hand.push(...meld.cards);
      state.log.push(`${player.name} nimmt ein Per aus der Ablage zurück.`);
      return { ok: true, state };
    }

    case 'APPEND_TO_MELD': {
      if (state.turnPhase !== 'meld') return err(prev, 'Du musst zuerst eine Karte ziehen.');
      const meld = state.melds.find((m) => m.id === move.meldId);
      if (!meld) return err(prev, 'Per nicht gefunden.');
      const cards = pickCards(player.hand, move.cardIds);
      if (!cards) return err(prev, 'Karte nicht in der Hand gefunden.');

      const combined = tryCombineMeld(meld.type, meld.cards, cards, aceValue, tron);
      if (!combined) return err(prev, 'Die Karten passen nicht an dieses Per.');

      meld.cards = combined;
      player.hand = removeCards(player.hand, move.cardIds);
      state.log.push(`${player.name} legt an ein Per an.`);
      tryRevealAndFinish(state);
      return { ok: true, state };
    }

    case 'DISCARD': {
      if (state.turnPhase !== 'meld') return err(prev, 'Du musst zuerst eine Karte ziehen.');
      const cards = pickCards(player.hand, [move.cardId]);
      if (!cards) return err(prev, 'Karte nicht in der Hand gefunden.');
      const discarded = cards[0];
      player.hand = removeCards(player.hand, [move.cardId]);
      state.discardPile.push(discarded);
      state.log.push(`${player.name} wirft eine Karte ab.`);
      if (!tryRevealAndFinish(state, discarded)) {
        advanceTurn(state);
      }
      return { ok: true, state };
    }

    case 'SORT_HAND': {
      const target = state.players.find((p) => p.id === move.playerId);
      if (!target) return err(prev, 'Spieler nicht gefunden.');
      const byId = new Map(target.hand.map((c) => [c.id, c]));
      const reordered: Card[] = [];
      for (const id of move.orderedCardIds) {
        const card = byId.get(id);
        if (card) {
          reordered.push(card);
          byId.delete(id);
        }
      }
      reordered.push(...byId.values());
      target.hand = reordered;
      return { ok: true, state };
    }

    default:
      return err(prev, 'Unbekannter Zug.');
  }
}

function tryCombineMeld(
  type: MeldType,
  existing: Card[],
  added: Card[],
  aceValue: 1 | 11,
  tron: TronCard,
): Card[] | null {
  if (type === 'set') {
    const result = validateSet([...existing, ...added], aceValue, tron);
    return result.valid ? result.orderedCards : null;
  }

  const candidates: Card[][] = [
    [...existing, ...added],
    [...added, ...existing],
  ];
  for (const candidate of candidates) {
    const result = validateRun(candidate, aceValue, tron);
    if (result.valid) return result.orderedCards;
  }
  return null;
}
