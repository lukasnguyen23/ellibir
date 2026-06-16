import { create } from 'zustand';
import { applyMove } from '@/engine/gameReducer';
import { detectMeld, validateMeld } from '@/engine/melds';
import { createGame } from '@/engine/rules';
import type { Card, GameSettings, GameState, MeldType, Move } from '@/engine/types';

/** Eine vorbereitete Kombination in der "Auslage" (vor dem Bestätigen). */
export interface TrayGroup {
  id: string;
  type: MeldType;
  cards: Card[];
  points: number;
}

interface GameStore {
  game: GameState | null;
  selectedCardIds: string[];
  trayGroups: TrayGroup[];
  toast: { id: number; message: string; kind: 'error' | 'info' } | null;

  newGame: (players: { id: string; name: string }[], settings?: Partial<GameSettings>) => void;
  dispatch: (move: Move) => boolean;

  toggleSelect: (cardId: string) => void;
  clearSelection: () => void;

  addSelectionToTray: () => void;
  removeTrayGroup: (groupId: string) => void;
  clearTray: () => void;
  commitOpening: () => void;

  layMeldFromSelection: () => void;
  appendSelectionToMeld: (meldId: string) => void;
  discardSelected: () => void;

  showToast: (message: string, kind?: 'error' | 'info') => void;
  reorderHand: (orderedCardIds: string[]) => void;
}

let toastSeq = 0;

export const useGameStore = create<GameStore>((set, get) => ({
  game: null,
  selectedCardIds: [],
  trayGroups: [],
  toast: null,

  newGame: (players, settings) => {
    set({
      game: createGame({ players, settings }),
      selectedCardIds: [],
      trayGroups: [],
      toast: null,
    });
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

  addSelectionToTray: () => {
    const { game, selectedCardIds, trayGroups } = get();
    if (!game) return;
    const player = game.players[game.currentPlayerIndex];
    const cards = selectedCardIds
      .map((id) => player.hand.find((c) => c.id === id))
      .filter((c): c is Card => Boolean(c));
    if (cards.length < 3) {
      get().showToast('Ein Per braucht mindestens 3 Karten.', 'error');
      return;
    }
    const validation = detectMeld(cards, game.settings.aceValue);
    if (!validation) {
      get().showToast('Diese Karten bilden kein gültiges Per.', 'error');
      return;
    }
    set({
      trayGroups: [
        ...trayGroups,
        {
          id: `tray-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: validation.type,
          cards: validation.orderedCards,
          points: validation.points,
        },
      ],
      selectedCardIds: [],
    });
  },

  removeTrayGroup: (groupId) =>
    set({ trayGroups: get().trayGroups.filter((g) => g.id !== groupId) }),

  clearTray: () => set({ trayGroups: [] }),

  commitOpening: () => {
    const { game, trayGroups, dispatch } = get();
    if (!game) return;
    const total = trayGroups.reduce((sum, g) => sum + g.points, 0);
    if (total < game.settings.openingThreshold) {
      get().showToast(
        `Die Auslage hat erst ${total} Punkte (mindestens ${game.settings.openingThreshold} nötig).`,
        'error',
      );
      return;
    }
    const ok = dispatch({
      type: 'LAY_INITIAL_MELDS',
      melds: trayGroups.map((g) => ({ cardIds: g.cards.map((c) => c.id), type: g.type })),
    });
    if (ok) set({ trayGroups: [], selectedCardIds: [] });
  },

  layMeldFromSelection: () => {
    const { game, selectedCardIds, dispatch } = get();
    if (!game) return;
    const player = game.players[game.currentPlayerIndex];
    const cards = selectedCardIds
      .map((id) => player.hand.find((c) => c.id === id))
      .filter((c): c is Card => Boolean(c));
    const validation = detectMeld(cards, game.settings.aceValue);
    if (!validation) {
      get().showToast('Diese Karten bilden kein gültiges Per.', 'error');
      return;
    }
    const ok = dispatch({
      type: 'LAY_MELD',
      cardIds: cards.map((c) => c.id),
      meldType: validation.type,
    });
    if (ok) set({ selectedCardIds: [] });
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
    if (ok) set({ selectedCardIds: [], trayGroups: [] });
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
  const set = validateMeld(cards, 'set', game.settings.aceValue);
  if (set.valid) return set;
  const run = validateMeld(cards, 'run', game.settings.aceValue);
  if (run.valid) return run;
  return null;
}
