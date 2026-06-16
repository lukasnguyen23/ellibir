import type { Rank } from './types';

/** Numerischer Laufwert eines Rangs. Ass = 1 (kann im Lauf auch hoch als 14 zählen). */
export function rankToValue(rank: Rank): number {
  switch (rank) {
    case 'A':
      return 1;
    case 'J':
      return 11;
    case 'Q':
      return 12;
    case 'K':
      return 13;
    default:
      return Number(rank);
  }
}

/** Punktwert für einen Lauf-Slot (numerischer Wert 1..14). */
export function pointsForRunValue(value: number, aceValue: 1 | 11): number {
  if (value === 1 || value === 14) return aceValue; // Ass
  if (value >= 11 && value <= 13) return 10; // B / D / K
  return value; // 2..10
}

/** Punktwert für einen Rang in einem Set. */
export function pointsForRank(rank: Rank, aceValue: 1 | 11): number {
  if (rank === 'A') return aceValue;
  if (rank === 'J' || rank === 'Q' || rank === 'K') return 10;
  return Number(rank);
}
