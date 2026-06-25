import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  getDocs,
  type Unsubscribe,
} from 'firebase/firestore';
import { createGame, DEFAULT_SETTINGS } from '@/engine/rules';
import { getFirestoreDb } from '@/lib/firebase';
import { splitGameStateWithMeta } from './gameSync';
import type { GameSettings } from '@/engine/types';
import { MAX_PLAYERS, ROOM_CODE_LENGTH, type RoomDocument } from './roomTypes';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateRoomCode(): string {
  return Array.from(
    { length: ROOM_CODE_LENGTH },
    () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)],
  ).join('');
}

function roomRef(code: string) {
  return doc(getFirestoreDb(), 'rooms', code);
}

export function publicGameRef(code: string) {
  return doc(getFirestoreDb(), 'rooms', code, 'game', 'public');
}

export function serverGameRef(code: string) {
  return doc(getFirestoreDb(), 'rooms', code, 'game', 'server');
}

export function secretsRef(code: string, playerId: string) {
  return doc(getFirestoreDb(), 'rooms', code, 'secrets', playerId);
}

export function movesRef(code: string) {
  return collection(getFirestoreDb(), 'rooms', code, 'moves');
}

async function uniqueRoomCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateRoomCode();
    const snap = await getDoc(roomRef(code));
    if (!snap.exists()) return code;
  }
  throw new Error('Konnte keinen eindeutigen Raumcode erzeugen.');
}

export async function createRoom(
  hostId: string,
  hostName: string,
  settings: Partial<GameSettings> = {},
): Promise<string> {
  const code = await uniqueRoomCode();
  const mergedSettings: GameSettings = {
    ...DEFAULT_SETTINGS,
    ...settings,
    totalRounds: Math.min(10, Math.max(1, settings.totalRounds ?? DEFAULT_SETTINGS.totalRounds)),
  };

  const room: Omit<RoomDocument, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    code,
    hostId,
    status: 'waiting',
    settings: mergedSettings,
    players: {
      [hostId]: { name: hostName.trim() || 'Host', slotIndex: 0, ready: false },
    },
    playerOrder: [hostId],
    createdAt: serverTimestamp(),
  };

  await setDoc(roomRef(code), room);
  return code;
}

export async function findRoomByCode(code: string): Promise<RoomDocument | null> {
  const snap = await getDoc(roomRef(code.toUpperCase()));
  if (!snap.exists()) return null;
  return snap.data() as RoomDocument;
}

export async function joinRoom(code: string, uid: string, name: string): Promise<void> {
  const normalized = code.toUpperCase();
  await runTransaction(getFirestoreDb(), async (tx) => {
    const ref = roomRef(normalized);
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('Raum nicht gefunden.');
    const room = snap.data() as RoomDocument;
    if (room.status !== 'waiting') throw new Error('Das Spiel hat bereits begonnen.');
    if (room.players[uid]) {
      tx.update(ref, { [`players.${uid}.name`]: name.trim() || room.players[uid].name });
      return;
    }
    const count = Object.keys(room.players).length;
    if (count >= MAX_PLAYERS) throw new Error('Der Raum ist voll.');
    const slotIndex = count;
    tx.update(ref, {
      [`players.${uid}`]: { name: name.trim() || `Spieler ${slotIndex + 1}`, slotIndex, ready: false },
      playerOrder: [...room.playerOrder, uid],
    });
  });
}

export function subscribeRoom(code: string, onChange: (room: RoomDocument | null) => void): Unsubscribe {
  return onSnapshot(roomRef(code.toUpperCase()), (snap) => {
    onChange(snap.exists() ? (snap.data() as RoomDocument) : null);
  });
}

export async function setPlayerReady(code: string, uid: string, ready: boolean): Promise<void> {
  await updateDoc(roomRef(code.toUpperCase()), { [`players.${uid}.ready`]: ready });
}

export async function updateRoomSettings(
  code: string,
  hostId: string,
  settings: Partial<GameSettings>,
): Promise<void> {
  const ref = roomRef(code.toUpperCase());
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Raum nicht gefunden.');
  const room = snap.data() as RoomDocument;
  if (room.hostId !== hostId) throw new Error('Nur der Host kann Einstellungen ändern.');
  if (room.status !== 'waiting') throw new Error('Spiel läuft bereits.');

  const merged: GameSettings = {
    ...room.settings,
    ...settings,
    totalRounds: Math.min(
      10,
      Math.max(1, settings.totalRounds ?? room.settings.totalRounds),
    ),
  };
  await updateDoc(ref, { settings: merged });
}

export async function startGame(code: string, hostId: string): Promise<void> {
  const normalized = code.toUpperCase();
  const ref = roomRef(normalized);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Raum nicht gefunden.');
  const room = snap.data() as RoomDocument;
  if (room.hostId !== hostId) throw new Error('Nur der Host kann das Spiel starten.');
  if (room.status !== 'waiting') throw new Error('Spiel läuft bereits.');

  const playerEntries = room.playerOrder.map((uid) => ({
    id: uid,
    name: room.players[uid]?.name ?? uid,
  }));
  if (playerEntries.length < 2) throw new Error('Mindestens 2 Spieler nötig.');

  const seed = Math.floor(Math.random() * 2 ** 31);
  const gameState = createGame({
    id: normalized,
    players: playerEntries,
    settings: room.settings,
    seed,
  });

  const { public: publicDoc, server, secrets } = splitGameStateWithMeta(gameState, seed, 0);

  await runTransaction(getFirestoreDb(), async (tx) => {
    tx.update(ref, { status: 'playing' });
    tx.set(publicGameRef(normalized), { ...publicDoc, updatedAt: serverTimestamp() });
    tx.set(serverGameRef(normalized), server);
    for (const [playerId, secret] of Object.entries(secrets)) {
      tx.set(secretsRef(normalized, playerId), secret);
    }
  });
}

export function getLobbyUrl(code: string): string {
  const url = new URL(window.location.href);
  url.searchParams.set('room', code.toUpperCase());
  return url.toString();
}

export async function roomExists(code: string): Promise<boolean> {
  const snap = await getDoc(roomRef(code.toUpperCase()));
  return snap.exists();
}

/** Alle Secrets eines Raums laden (nur Host). */
export async function loadAllSecrets(
  code: string,
  playerIds: string[],
): Promise<Record<string, { hand: import('@/engine/types').Card[]; pendingMelds: import('@/engine/types').Meld[] }>> {
  const db = getFirestoreDb();
  const result: Record<string, { hand: import('@/engine/types').Card[]; pendingMelds: import('@/engine/types').Meld[] }> = {};
  await Promise.all(
    playerIds.map(async (id) => {
      const snap = await getDoc(doc(db, 'rooms', code.toUpperCase(), 'secrets', id));
      if (snap.exists()) {
        result[id] = snap.data() as { hand: import('@/engine/types').Card[]; pendingMelds: import('@/engine/types').Meld[] };
      }
    }),
  );
  return result;
}

export { query, where, getDocs };
