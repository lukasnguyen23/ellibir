import { create } from 'zustand';
import { applyMove } from '@/engine/gameReducer';
import { detectMeld, validateMeld } from '@/engine/melds';
import { createGame } from '@/engine/rules';
import type { Card, GameSettings, GameState, Move } from '@/engine/types';

interface GameStore {
  game: GameState | null;
  selectedCardIds: string[];
  toast: { id: number; message: string; kind: 'error' | 'info' } | null;

  newGame: (players: { id: string; name: string }[], settings?: Partial<GameSettings>) => void;
  nextRound: () => void;
  exitToMenu: () => void;
  dispatch: (move: Move) => boolean;

  toggleSelect: (cardId: string) => void;
  clearSelection: () => void;

  stageMeldFromSelection: () => void;
  unstagePendingMeld: (pendingMeldId: string) => void;
  appendSelectionToMeld: (meldId: string) => void;
  discardSelected: () => void;

  showToast: (message: string, kind?: 'error' | 'info') => void;
  reorderHand: (orderedCardIds: string[]) => void;
}

let toastSeq = 0;

export const useGameStore = create<GameStore>((set, get) => ({
  game: null,
  selectedCardIds: [],
  toast: null,

  newGame: (players, settings) => {
    set({
      game: createGame({ players, settings }),
      selectedCardIds: [],
      toast: null,
    });
  },

  nextRound: () => {
    const { game } = get();
    if (!game || game.status !== 'finished') return;
    if (game.roundNumber >= game.settings.totalRounds) return;

    const scores = Object.fromEntries(game.players.map((p) => [p.id, p.score]));
    set({
      game: createGame({
        players: game.players.map((p) => ({ id: p.id, name: p.name })),
        settings: game.settings,
        roundNumber: game.roundNumber + 1,
        scoresByPlayerId: scores,
      }),
      selectedCardIds: [],
      toast: null,
    });
  },

  exitToMenu: () => {
    set({ game: null, selectedCardIds: [], toast: null });
  },

  dispatch: (move) => {
    const { game } = get();
    if (!game) return false;
    const result = applyMove(game, move);
    if (!result.ok) {
      get().showToast(result.error ?? 'Ungültiger Zug.', 'error');
      return false;
    }
    set({ game: result.state });
    return true;
  },

  toggleSelect: (cardId) => {
    const { selectedCardIds } = get();
    set({
      selectedCardIds: selectedCardIds.includes(cardId)
        ? selectedCardIds.filter((id) => id !== cardId)
        : [...selectedCardIds, cardId],
    });
  },

  clearSelection: () => set({ selectedCardIds: [] }),

  stageMeldFromSelection: () => {
    const { game, selectedCardIds, dispatch } = get();
    if (!game) return;
    const player = game.players[game.currentPlayerIndex];
    const cards = selectedCardIds
      .map((id) => player.hand.find((c) => c.id === id))
      .filter((c): c is Card => Boolean(c));
    const validation = detectMeld(cards, game.settings.aceValue, game.tron);
    if (!validation) {
      get().showToast('Diese Karten bilden kein gültiges Per.', 'error');
      return;
    }
    const ok = dispatch({
      type: 'STAGE_MELD',
      cardIds: cards.map((c) => c.id),
      meldType: validation.type,
    });
    if (ok) set({ selectedCardIds: [] });
  },

  unstagePendingMeld: (pendingMeldId) => {
    get().dispatch({ type: 'UNSTAGE_MELD', pendingMeldId });
  },

  appendSelectionToMeld: (meldId) => {
    const { selectedCardIds, dispatch } = get();
    if (selectedCardIds.length === 0) {
      get().showToast('Wähle zuerst Karten aus der Hand.', 'info');
      return;
    }
    const ok = dispatch({ type: 'APPEND_TO_MELD', meldId, cardIds: selectedCardIds });
    if (ok) set({ selectedCardIds: [] });
  },

  discardSelected: () => {
    const { selectedCardIds, dispatch } = get();
    if (selectedCardIds.length !== 1) {
      get().showToast('Wähle genau eine Karte zum Abwerfen.', 'info');
      return;
    }
    const ok = dispatch({ type: 'DISCARD', cardId: selectedCardIds[0] });
    if (ok) set({ selectedCardIds: [] });
  },

  showToast: (message, kind = 'info') => {
    toastSeq += 1;
    const id = toastSeq;
    set({ toast: { id, message, kind } });
    setTimeout(() => {
      if (get().toast?.id === id) set({ toast: null });
    }, 3200);
  },

  reorderHand: (orderedCardIds) => {
    const { game, dispatch } = get();
    if (!game) return;
    dispatch({
      type: 'SORT_HAND',
      playerId: game.players[game.currentPlayerIndex].id,
      orderedCardIds,
    });
  },
}));

/** Hilfs-Selektor: validiert die aktuelle Auswahl (für Button-Beschriftung). */
export function selectionValidation(game: GameState, selectedIds: string[]) {
  const player = game.players[game.currentPlayerIndex];
  const cards = selectedIds
    .map((id) => player.hand.find((c) => c.id === id))
    .filter((c): c is Card => Boolean(c));
  if (cards.length < 3) return null;
  const set = validateMeld(cards, 'set', game.settings.aceValue, game.tron);
  if (set.valid) return set;
  const run = validateMeld(cards, 'run', game.settings.aceValue, game.tron);
  if (run.valid) return run;
  return null;
}
