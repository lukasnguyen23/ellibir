import { detectMeld } from './melds';
import { cardPointValue } from './rules';
import type { Card, GameSettings, TronCard } from './types';

interface MeldCombo {
  indices: number[];
  points: number;
}

function combinations(n: number, k: number): number[][] {
  const result: number[][] = [];
  const combo: number[] = [];
  function dfs(start: number) {
    if (combo.length === k) {
      result.push([...combo]);
      return;
    }
    for (let i = start; i < n; i++) {
      combo.push(i);
      dfs(i + 1);
      combo.pop();
    }
  }
  dfs(0);
  return result;
}

function findMeldCombos(hand: Card[], aceValue: 1 | 11, tron: TronCard): MeldCombo[] {
  const combos: MeldCombo[] = [];
  const n = hand.length;
  for (let size = 3; size <= n; size++) {
    for (const indices of combinations(n, size)) {
      const cards = indices.map((i) => hand[i]);
      const meld = detectMeld(cards, aceValue, tron);
      if (meld) {
        combos.push({ indices, points: meld.points });
      }
    }
  }
  return combos;
}

function searchBestPartition(
  hand: Card[],
  aceValue: 1 | 11,
  tron: TronCard,
  mode: 'deadwood' | 'opening',
  threshold: number,
): { deadwood: number; meldPoints: number; canOpen: boolean } {
  const combos = findMeldCombos(hand, aceValue, tron);
  let bestDeadwood = hand.reduce((s, c) => s + cardPointValue(c, aceValue, tron), 0);
  let bestMeldPoints = 0;
  let canOpen = false;

  function dfs(used: Set<number>, meldPoints: number) {
    if (mode === 'opening' && meldPoints >= threshold) {
      canOpen = true;
    }

    const deadwood = hand.reduce(
      (s, c, i) => (used.has(i) ? s : s + cardPointValue(c, aceValue, tron)),
      0,
    );
    if (deadwood < bestDeadwood) {
      bestDeadwood = deadwood;
      bestMeldPoints = meldPoints;
    }

    for (const combo of combos) {
      if (combo.indices.some((i) => used.has(i))) continue;
      const next = new Set(used);
      combo.indices.forEach((i) => next.add(i));
      dfs(next, meldPoints + combo.points);
    }
  }

  dfs(new Set(), 0);
  return { deadwood: bestDeadwood, meldPoints: bestMeldPoints, canOpen };
}

export function unmeldedPenalty(
  hand: Card[],
  aceValue: 1 | 11,
  tron: TronCard,
): number {
  if (hand.length === 0) return 0;
  return searchBestPartition(hand, aceValue, tron, 'deadwood', 0).deadwood;
}

export function canOpen(
  hand: Card[],
  settings: GameSettings,
  tron: TronCard,
): boolean {
  if (hand.length < 3) return false;
  return searchBestPartition(
    hand,
    settings.aceValue,
    tron,
    'opening',
    settings.openingThreshold,
  ).canOpen;
}
