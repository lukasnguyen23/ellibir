import type { Rank, Suit } from '@/engine/types';

export const CARD_VIEW_W = 140;
export const CARD_VIEW_H = 196;

export const SUIT_COLORS: Record<Suit, string> = {
  hearts: '#c41e3a',
  diamonds: '#c41e3a',
  clubs: '#1a1a1a',
  spades: '#1a1a1a',
};

/** Deutsche Bildkarten-Bezeichnungen */
export const RANK_LABEL: Record<Rank, string> = {
  A: 'A',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '10': '10',
  J: 'B',
  Q: 'D',
  K: 'K',
};

/** Klassische symmetrische Pip-Positionen (x, y) im ViewBox-Koordinatensystem. */
export const PIP_LAYOUTS: Partial<Record<Rank, [number, number][]>> = {
  A: [[70, 98]],
  '2': [
    [70, 52],
    [70, 144],
  ],
  '3': [
    [70, 44],
    [70, 98],
    [70, 152],
  ],
  '4': [
    [48, 58],
    [92, 58],
    [48, 138],
    [92, 138],
  ],
  '5': [
    [48, 52],
    [92, 52],
    [70, 98],
    [48, 144],
    [92, 144],
  ],
  '6': [
    [48, 48],
    [92, 48],
    [48, 98],
    [92, 98],
    [48, 148],
    [92, 148],
  ],
  '7': [
    [48, 44],
    [92, 44],
    [48, 88],
    [92, 88],
    [70, 116],
    [48, 144],
    [92, 144],
  ],
  '8': [
    [48, 42],
    [92, 42],
    [48, 78],
    [92, 78],
    [48, 118],
    [92, 118],
    [48, 154],
    [92, 154],
  ],
  '9': [
    [48, 40],
    [92, 40],
    [48, 74],
    [92, 74],
    [70, 98],
    [48, 122],
    [92, 122],
    [48, 156],
    [92, 156],
  ],
  '10': [
    [48, 38],
    [92, 38],
    [70, 58],
    [48, 78],
    [92, 78],
    [48, 118],
    [92, 118],
    [70, 138],
    [48, 158],
    [92, 158],
  ],
};
