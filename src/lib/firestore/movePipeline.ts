import {
  addDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { applyMove } from '@/engine/gameReducer';
import { createGame } from '@/engine/rules';
import { getFirestoreDb } from '@/lib/firebase';
import { mergeFullGameState, splitGameStateWithMeta } from './gameSync';
import type { Move } from '@/engine/types';
import {
  loadAllSecrets,
  movesRef,
  publicGameRef,
  secretsRef,
  serverGameRef,
} from './roomService';
import type { MoveDocument, PublicGameDocument, ServerGameDocument } from './roomTypes';

export async function submitMove(roomCode: string, playerId: string, move: Move): Promise<void> {
  await addDoc(movesRef(roomCode), {
    playerId,
    move,
    status: 'pending',
    createdAt: serverTimestamp(),
  } satisfies Omit<MoveDocument, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> });
}

export async function writeGameStateAfterMove(
  roomCode: string,
  state: ReturnType<typeof applyMove>['state'],
  seed: number,
  moveSeq: number,
): Promise<void> {
  const normalized = roomCode.toUpperCase();
  const { public: publicDoc, server, secrets } = splitGameStateWithMeta(state, seed, moveSeq);
  const batch = writeBatch(getFirestoreDb());
  batch.set(publicGameRef(normalized), { ...publicDoc, updatedAt: serverTimestamp() }, { merge: true });
  batch.set(serverGameRef(normalized), server);
  for (const [playerId, secret] of Object.entries(secrets)) {
    batch.set(secretsRef(normalized, playerId), secret);
  }
  await batch.commit();
}

async function processPendingMove(roomCode: string, moveId: string, moveDoc: MoveDocument): Promise<void> {
  const normalized = roomCode.toUpperCase();
  const publicSnap = await getDoc(publicGameRef(normalized));
  const serverSnap = await getDoc(serverGameRef(normalized));
  if (!publicSnap.exists() || !serverSnap.exists()) return;

  const publicDoc = publicSnap.data() as PublicGameDocument;
  const serverDoc = serverSnap.data() as ServerGameDocument;
  const secrets = await loadAllSecrets(normalized, publicDoc.playerOrder);

  const fullState = mergeFullGameState(publicDoc, serverDoc, secrets);
  const currentPlayer = fullState.players[fullState.currentPlayerIndex];

  if (moveDoc.playerId !== currentPlayer.id) {
    await updateDoc(doc(getFirestoreDb(), 'rooms', normalized, 'moves', moveId), {
      status: 'rejected',
      error: 'Nicht am Zug.',
    });
    return;
  }

  const result = applyMove(fullState, moveDoc.move);
  const moveRef = doc(getFirestoreDb(), 'rooms', normalized, 'moves', moveId);

  if (!result.ok) {
    await updateDoc(moveRef, { status: 'rejected', error: result.error ?? 'Ungültiger Zug.' });
    return;
  }

  await writeGameStateAfterMove(normalized, result.state, publicDoc.seed, publicDoc.moveSeq + 1);
  await updateDoc(moveRef, { status: 'applied' });
}

let processing = new Set<string>();

export function startHostMoveProcessor(roomCode: string): Unsubscribe {
  const normalized = roomCode.toUpperCase();
  const q = query(movesRef(normalized), where('status', '==', 'pending'));

  return onSnapshot(q, async (snap) => {
    for (const change of snap.docChanges()) {
      if (change.type !== 'added') continue;
      const moveId = change.doc.id;
      if (processing.has(moveId)) continue;
      processing.add(moveId);
      try {
        await processPendingMove(normalized, moveId, change.doc.data() as MoveDocument);
      } finally {
        processing.delete(moveId);
      }
    }
  });
}

/** Host wendet eigenen Zug direkt an (ohne Move-Queue). */
export async function applyHostMove(roomCode: string, move: Move): Promise<{ ok: boolean; error?: string }> {
  const normalized = roomCode.toUpperCase();
  const publicSnap = await getDoc(publicGameRef(normalized));
  const serverSnap = await getDoc(serverGameRef(normalized));
  if (!publicSnap.exists() || !serverSnap.exists()) {
    return { ok: false, error: 'Spiel nicht gefunden.' };
  }

  const publicDoc = publicSnap.data() as PublicGameDocument;
  const serverDoc = serverSnap.data() as ServerGameDocument;
  const secrets = await loadAllSecrets(normalized, publicDoc.playerOrder);
  const fullState = mergeFullGameState(publicDoc, serverDoc, secrets);

  const result = applyMove(fullState, move);
  if (!result.ok) return { ok: false, error: result.error };

  await writeGameStateAfterMove(normalized, result.state, publicDoc.seed, publicDoc.moveSeq + 1);
  return { ok: true };
}

/** Host startet nächste Runde online. */
export async function applyHostNextRound(
  roomCode: string,
): Promise<{ ok: boolean; error?: string }> {
  const normalized = roomCode.toUpperCase();
  const publicSnap = await getDoc(publicGameRef(normalized));
  const serverSnap = await getDoc(serverGameRef(normalized));
  if (!publicSnap.exists() || !serverSnap.exists()) {
    return { ok: false, error: 'Spiel nicht gefunden.' };
  }

  const publicDoc = publicSnap.data() as PublicGameDocument;
  const serverDoc = serverSnap.data() as ServerGameDocument;
  const secrets = await loadAllSecrets(normalized, publicDoc.playerOrder);
  const fullState = mergeFullGameState(publicDoc, serverDoc, secrets);

  if (fullState.status !== 'finished') return { ok: false, error: 'Runde noch nicht beendet.' };
  if (fullState.roundNumber >= fullState.settings.totalRounds) {
    return { ok: false, error: 'Alle Runden gespielt.' };
  }

  const scores = Object.fromEntries(fullState.players.map((p) => [p.id, p.score]));
  const seed = Math.floor(Math.random() * 2 ** 31);
  const nextState = createGame({
    id: normalized,
    players: fullState.players.map((p) => ({ id: p.id, name: p.name })),
    settings: fullState.settings,
    roundNumber: fullState.roundNumber + 1,
    scoresByPlayerId: scores,
    seed,
  });

  await writeGameStateAfterMove(normalized, nextState, seed, 0);
  return { ok: true };
}

/** Verarbeitet auch bereits vorhandene pending Moves beim Host-Start. */
export async function drainPendingMoves(roomCode: string): Promise<void> {
  const normalized = roomCode.toUpperCase();
  const q = query(movesRef(normalized), where('status', '==', 'pending'));
  const snap = await getDocs(q);
  for (const moveDoc of snap.docs) {
    await processPendingMove(normalized, moveDoc.id, moveDoc.data() as MoveDocument);
  }
}
