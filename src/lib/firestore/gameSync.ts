import type { Card, GameState, PlayerState } from '@/engine/types';
import type {
  PlayerSecretsDocument,
  PublicGameDocument,
  PublicPlayerSnapshot,
  ServerGameDocument,
} from './roomTypes';

/** Vollständiger Spielzustand für Host (alle Secrets + drawPile). */
export function mergeFullGameState(
  publicDoc: PublicGameDocument,
  serverDoc: ServerGameDocument,
  secretsByPlayerId: Record<string, PlayerSecretsDocument>,
): GameState {
  const players: PlayerState[] = publicDoc.playerOrder.map((id) => {
    const pub = publicDoc.players.find((p) => p.id === id);
    const secret = secretsByPlayerId[id] ?? { hand: [], pendingMelds: [] };
    return {
      id,
      name: pub?.name ?? id,
      score: pub?.score ?? 0,
      hand: secret.hand,
      pendingMelds: secret.pendingMelds,
    };
  });

  return {
    id: publicDoc.id,
    settings: publicDoc.settings,
    players,
    drawPile: serverDoc.drawPile,
    discardPile: publicDoc.discardPile,
    melds: publicDoc.melds,
    indicatorCard: publicDoc.indicatorCard,
    tron: publicDoc.tron,
    currentPlayerIndex: publicDoc.currentPlayerIndex,
    turnPhase: publicDoc.turnPhase,
    status: publicDoc.status,
    winnerId: publicDoc.winnerId,
    roundNumber: publicDoc.roundNumber,
    log: publicDoc.log,
  };
}

function hiddenHandCards(playerId: string, count: number): Card[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `hidden-${playerId}-${i}`,
    suit: null,
    rank: null,
    isJoker: false,
  }));
}

function hiddenStockCards(count: number): Card[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `stock-${i}`,
    suit: null,
    rank: null,
    isJoker: false,
  }));
}

/** Gefilterte Ansicht für einen Client — nur eigene Hand und pendingMelds sichtbar. */
export function viewForPlayer(
  publicDoc: PublicGameDocument,
  mySecrets: PlayerSecretsDocument | null,
  viewerId: string,
): GameState {
  const players: PlayerState[] = publicDoc.playerOrder.map((id) => {
    const pub = publicDoc.players.find((p) => p.id === id);
    const isSelf = id === viewerId;

    if (isSelf && mySecrets) {
      return {
        id,
        name: pub?.name ?? id,
        score: pub?.score ?? 0,
        hand: mySecrets.hand,
        pendingMelds: mySecrets.pendingMelds,
      };
    }

    return {
      id,
      name: pub?.name ?? id,
      score: pub?.score ?? 0,
      hand: hiddenHandCards(id, pub?.handCount ?? 0),
      pendingMelds: [],
    };
  });

  return {
    id: publicDoc.id,
    settings: publicDoc.settings,
    players,
    drawPile: hiddenStockCards(publicDoc.drawPileCount),
    discardPile: publicDoc.discardPile,
    melds: publicDoc.melds,
    indicatorCard: publicDoc.indicatorCard,
    tron: publicDoc.tron,
    currentPlayerIndex: publicDoc.currentPlayerIndex,
    turnPhase: publicDoc.turnPhase,
    status: publicDoc.status,
    winnerId: publicDoc.winnerId,
    roundNumber: publicDoc.roundNumber,
    log: publicDoc.log,
  };
}

export function splitGameState(state: GameState): {
  public: Omit<PublicGameDocument, 'updatedAt'>;
  server: ServerGameDocument;
  secrets: Record<string, PlayerSecretsDocument>;
} {
  const players: PublicPlayerSnapshot[] = state.players.map((p) => ({
    id: p.id,
    name: p.name,
    score: p.score,
    handCount: p.hand.length,
  }));

  const secrets: Record<string, PlayerSecretsDocument> = {};
  for (const p of state.players) {
    secrets[p.id] = { hand: p.hand, pendingMelds: p.pendingMelds };
  }

  return {
    public: {
      id: state.id,
      settings: state.settings,
      status: state.status,
      roundNumber: state.roundNumber,
      winnerId: state.winnerId,
      currentPlayerIndex: state.currentPlayerIndex,
      turnPhase: state.turnPhase,
      indicatorCard: state.indicatorCard,
      tron: state.tron,
      melds: state.melds,
      discardPile: state.discardPile,
      drawPileCount: state.drawPile.length,
      players,
      playerOrder: state.players.map((p) => p.id),
      seed: 0,
      moveSeq: 0,
      log: state.log,
    },
    server: { drawPile: state.drawPile },
    secrets,
  };
}

export function splitGameStateWithMeta(
  state: GameState,
  seed: number,
  moveSeq: number,
): {
  public: Omit<PublicGameDocument, 'updatedAt'>;
  server: ServerGameDocument;
  secrets: Record<string, PlayerSecretsDocument>;
} {
  const split = splitGameState(state);
  return {
    ...split,
    public: { ...split.public, seed, moveSeq },
  };
}
