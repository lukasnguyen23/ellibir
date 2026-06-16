import { validateMeld, validateRun, validateSet } from './melds';
import { canOpen } from './openingDetection';
import { unmeldedPenalty } from './penalties';
import { indicatorPenaltyMultiplier, isTronDiscard } from './tron';
import type { Card, GameState, Meld, MeldType, Move, MoveResult, TronCard } from './types';

let meldCounter = 0;
function nextMeldId(): string {
  meldCounter += 1;
  return `meld-${Date.now().toString(36)}-${meldCounter}`;
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

function applyMissedOpeningPenalties(state: GameState, openerId: string): void {
  for (const p of state.players) {
    if (p.id === openerId || p.hasOpened) continue;
    if (canOpen(p.hand, state.settings, state.tron)) {
      p.score -= 100;
      state.log.push(`${p.name} hätte eröffnen können: -100`);
    }
  }
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

    case 'LAY_INITIAL_MELDS': {
      if (state.turnPhase !== 'meld') return err(prev, 'Du musst zuerst eine Karte ziehen.');
      if (player.hasOpened) return err(prev, 'Du hast bereits eröffnet.');

      const usedIds = new Set<string>();
      const newMelds: Meld[] = [];
      let totalPoints = 0;

      for (const spec of move.melds) {
        for (const id of spec.cardIds) {
          if (usedIds.has(id)) return err(prev, 'Eine Karte wurde doppelt verwendet.');
          usedIds.add(id);
        }
        const cards = pickCards(player.hand, spec.cardIds);
        if (!cards) return err(prev, 'Karte nicht in der Hand gefunden.');
        const validation = validateMeld(cards, spec.type, aceValue, tron);
        if (!validation.valid) return err(prev, validation.error ?? 'Ungültiges Per.');
        totalPoints += validation.points;
        newMelds.push({
          id: nextMeldId(),
          type: spec.type,
          cards: validation.orderedCards,
          ownerId: player.id,
        });
      }

      if (totalPoints < state.settings.openingThreshold) {
        return err(
          prev,
          `Die erste Auslage muss mindestens ${state.settings.openingThreshold} Punkte ergeben (aktuell ${totalPoints}).`,
        );
      }

      player.hand = removeCards(player.hand, [...usedIds]);
      player.hasOpened = true;
      state.melds.push(...newMelds);
      state.log.push(`${player.name} eröffnet mit ${totalPoints} Punkten.`);
      applyMissedOpeningPenalties(state, player.id);
      finishIfEmpty(state);
      return { ok: true, state };
    }

    case 'LAY_MELD': {
      if (state.turnPhase !== 'meld') return err(prev, 'Du musst zuerst eine Karte ziehen.');
      if (!player.hasOpened) {
        return err(prev, 'Du musst zuerst mit mindestens 51 Punkten eröffnen.');
      }
      const cards = pickCards(player.hand, move.cardIds);
      if (!cards) return err(prev, 'Karte nicht in der Hand gefunden.');
      const validation = validateMeld(cards, move.meldType, aceValue, tron);
      if (!validation.valid) return err(prev, validation.error ?? 'Ungültiges Per.');

      player.hand = removeCards(player.hand, move.cardIds);
      state.melds.push({
        id: nextMeldId(),
        type: move.meldType,
        cards: validation.orderedCards,
        ownerId: player.id,
      });
      state.log.push(`${player.name} legt ein Per aus.`);
      finishIfEmpty(state);
      return { ok: true, state };
    }

    case 'APPEND_TO_MELD': {
      if (state.turnPhase !== 'meld') return err(prev, 'Du musst zuerst eine Karte ziehen.');
      if (!player.hasOpened) return err(prev, 'Du musst zuerst eröffnen.');
      const meld = state.melds.find((m) => m.id === move.meldId);
      if (!meld) return err(prev, 'Per nicht gefunden.');
      const cards = pickCards(player.hand, move.cardIds);
      if (!cards) return err(prev, 'Karte nicht in der Hand gefunden.');

      const combined = tryCombineMeld(meld.type, meld.cards, cards, aceValue, tron);
      if (!combined) return err(prev, 'Die Karten passen nicht an dieses Per.');

      meld.cards = combined;
      player.hand = removeCards(player.hand, move.cardIds);
      state.log.push(`${player.name} legt an ein Per an.`);
      finishIfEmpty(state);
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
      if (!finishIfEmpty(state, discarded)) {
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
