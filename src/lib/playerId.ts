const STORAGE_KEY = 'ellibir-player-id';

/** Stabile Spieler-ID pro Browser — kein Firebase Auth nötig. */
export function getOrCreatePlayerId(): string {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, id);
  return id;
}
