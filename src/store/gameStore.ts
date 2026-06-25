import { create } from 'zustand';
import { onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { applyMove } from '@/engine/gameReducer';
import { detectMeld, validateMeld } from '@/engine/melds';
import { createGame } from '@/engine/rules';
import { viewForPlayer } from '@/lib/firestore/gameSync';
import {
  applyHostMove,
  applyHostNextRound,
  drainPendingMoves,
  startHostMoveProcessor,
  submitMove,
} from '@/lib/firestore/movePipeline';
import { publicGameRef, secretsRef } from '@/lib/firestore/roomService';
import type { PlayerSecretsDocument, PublicGameDocument } from '@/lib/firestore/roomTypes';
import { useLobbyStore } from '@/store/lobbyStore';
import type { Card, GameSettings, GameState, Move } from '@/engine/types';

export type GameMode = 'local' | 'online';

interface GameStore {
  game: GameState | null;
  mode: GameMode;
  localPlayerId: string | null;
  roomCode: string | null;
  isHost: boolean;
  isMyTurn: boolean;
  selectedCardIds: string[];
  toast: { id: number; message: string; kind: 'error' | 'info' } | null;

  newGame: (players: { id: string; name: string }[], settings?: Partial<GameSettings>) => void;
  enterOnlineGame: (roomCode: string, uid: string, isHost: boolean) => void;
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
let publicUnsub: Unsubscribe | null = null;
let secretsUnsub: Unsubscribe | null = null;
let movesUnsub: Unsubscribe | null = null;
let latestPublic: PublicGameDocument | null = null;
let latestSecrets: PlayerSecretsDocument | null = null;

function clearOnlineSubscriptions(): void {
  publicUnsub?.();
  secretsUnsub?.();
  movesUnsub?.();
  publicUnsub = null;
  secretsUnsub = null;
  movesUnsub = null;
  latestPublic = null;
  latestSecrets = null;
}

function syncOnlineView(set: (partial: Partial<GameStore>) => void, uid: string): void {
  if (!latestPublic) return;
  const game = viewForPlayer(latestPublic, latestSecrets, uid);
  const currentId = game.players[game.currentPlayerIndex]?.id;
  set({ game, isMyTurn: currentId === uid });
}

async function dispatchOnline(
  get: () => GameStore,
  move: Move,
): Promise<boolean> {
  const { roomCode, localPlayerId, isHost, game } = get();
  if (!roomCode || !localPlayerId || !game) return false;

  const currentId = game.players[game.currentPlayerIndex]?.id;
  if (currentId !== localPlayerId) {
    get().showToast('Du bist nicht am Zug.', 'error');
    return false;
  }

  if (isHost) {
    const result = await applyHostMove(roomCode, move);
    if (!result.ok) {
      get().showToast(result.error ?? 'Ungültiger Zug.', 'error');
      return false;
    }
    return true;
  }

  try {
    await submitMove(roomCode, localPlayerId, move);
    return true;
  } catch (e) {
    get().showToast(e instanceof Error ? e.message : 'Zug fehlgeschlagen.', 'error');
    return false;
  }
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: null,
  mode: 'local',
  localPlayerId: null,
  roomCode: null,
  isHost: false,
  isMyTurn: false,
  selectedCardIds: [],
  toast: null,

  newGame: (players, settings) => {
    clearOnlineSubscriptions();
    set({
      game: createGame({ players, settings }),
      mode: 'local',
      localPlayerId: null,
      roomCode: null,
      isHost: false,
      isMyTurn: true,
      selectedCardIds: [],
      toast: null,
    });
  },

  enterOnlineGame: (roomCode, uid, isHost) => {
    clearOnlineSubscriptions();
    const normalized = roomCode.toUpperCase();

    set({
      mode: 'online',
      localPlayerId: uid,
      roomCode: normalized,
      isHost,
      selectedCardIds: [],
      toast: null,
    });

    publicUnsub = onSnapshot(publicGameRef(normalized), (snap) => {
      if (!snap.exists()) return;
      latestPublic = snap.data() as PublicGameDocument;
      syncOnlineView(set, uid);
    });

    secretsUnsub = onSnapshot(secretsRef(normalized, uid), (snap) => {
      latestSecrets = snap.exists() ? (snap.data() as PlayerSecretsDocument) : null;
      syncOnlineView(set, uid);
    });

    if (isHost) {
      void drainPendingMoves(normalized);
      movesUnsub = startHostMoveProcessor(normalized);
    }
  },

  nextRound: () => {
    const { game, mode, roomCode, isHost } = get();
    if (!game || game.status !== 'finished') return;
    if (game.roundNumber >= game.settings.totalRounds) return;

    if (mode === 'online') {
      if (roomCode && isHost) {
        void applyHostNextRound(roomCode).then((result) => {
          if (!result.ok) get().showToast(result.error ?? 'Nächste Runde fehlgeschlagen.', 'error');
        });
      }
      set({ selectedCardIds: [] });
      return;
    }

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
    clearOnlineSubscriptions();
    useLobbyStore.getState().reset();
    set({
      game: null,
      mode: 'local',
      localPlayerId: null,
      roomCode: null,
      isHost: false,
      isMyTurn: false,
      selectedCardIds: [],
      toast: null,
    });
  },

  dispatch: (move) => {
    const { game, mode } = get();
    if (!game) return false;

    if (mode === 'online') {
      void dispatchOnline(get, move);
      return true;
    }

    const result = applyMove(game, move);
    if (!result.ok) {
      get().showToast(result.error ?? 'Ungültiger Zug.', 'error');
      return false;
    }
    set({ game: result.state });
    return true;
  },

  toggleSelect: (cardId) => {
    const { selectedCardIds, mode, isMyTurn } = get();
    if (mode === 'online' && !isMyTurn) return;
    set({
      selectedCardIds: selectedCardIds.includes(cardId)
        ? selectedCardIds.filter((id) => id !== cardId)
        : [...selectedCardIds, cardId],
    });
  },

  clearSelection: () => set({ selectedCardIds: [] }),

  stageMeldFromSelection: () => {
    const { game, selectedCardIds, mode, localPlayerId, isMyTurn } = get();
    if (!game) return;
    if (mode === 'online' && !isMyTurn) return;

    const player =
      mode === 'online' && localPlayerId
        ? game.players.find((p) => p.id === localPlayerId)
        : game.players[game.currentPlayerIndex];
    if (!player) return;

    const cards = selectedCardIds
      .map((id) => player.hand.find((c) => c.id === id))
      .filter((c): c is Card => Boolean(c));
    const validation = detectMeld(cards, game.settings.aceValue, game.tron);
    if (!validation) {
      get().showToast('Diese Karten bilden kein gültiges Per.', 'error');
      return;
    }

    const move: Move = {
      type: 'STAGE_MELD',
      cardIds: cards.map((c) => c.id),
      meldType: validation.type,
    };

    if (mode === 'online') {
      void dispatchOnline(get, move).then((ok) => {
        if (ok) set({ selectedCardIds: [] });
      });
      return;
    }

    const ok = get().dispatch(move);
    if (ok) set({ selectedCardIds: [] });
  },

  unstagePendingMeld: (pendingMeldId) => {
    get().dispatch({ type: 'UNSTAGE_MELD', pendingMeldId });
  },

  appendSelectionToMeld: (meldId) => {
    const { selectedCardIds, mode, isMyTurn } = get();
    if (mode === 'online' && !isMyTurn) return;
    if (selectedCardIds.length === 0) {
      get().showToast('Wähle zuerst Karten aus der Hand.', 'info');
      return;
    }
    const move: Move = { type: 'APPEND_TO_MELD', meldId, cardIds: selectedCardIds };
    if (mode === 'online') {
      void dispatchOnline(get, move).then((ok) => {
        if (ok) set({ selectedCardIds: [] });
      });
      return;
    }
    const ok = get().dispatch(move);
    if (ok) set({ selectedCardIds: [] });
  },

  discardSelected: () => {
    const { selectedCardIds, mode, isMyTurn } = get();
    if (mode === 'online' && !isMyTurn) return;
    if (selectedCardIds.length !== 1) {
      get().showToast('Wähle genau eine Karte zum Abwerfen.', 'info');
      return;
    }
    const move: Move = { type: 'DISCARD', cardId: selectedCardIds[0] };
    if (mode === 'online') {
      void dispatchOnline(get, move).then((ok) => {
        if (ok) set({ selectedCardIds: [] });
      });
      return;
    }
    const ok = get().dispatch(move);
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
    const { game, mode, localPlayerId, isMyTurn } = get();
    if (!game) return;
    const playerId =
      mode === 'online' && localPlayerId
        ? localPlayerId
        : game.players[game.currentPlayerIndex].id;
    if (mode === 'online' && !isMyTurn) return;

    const move: Move = { type: 'SORT_HAND', playerId, orderedCardIds };
    if (mode === 'online') {
      void dispatchOnline(get, move);
      return;
    }
    get().dispatch(move);
  },
}));

/** Hilfs-Selektor: validiert die aktuelle Auswahl (für Button-Beschriftung). */
export function selectionValidation(
  game: GameState,
  selectedIds: string[],
  playerId?: string,
) {
  const player = playerId
    ? game.players.find((p) => p.id === playerId)
    : game.players[game.currentPlayerIndex];
  if (!player) return null;

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
