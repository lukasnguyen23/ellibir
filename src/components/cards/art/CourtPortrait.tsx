import type { Rank, Suit } from '@/engine/types';
import { SUIT_COLORS } from './constants';

type CourtRank = Extract<Rank, 'J' | 'Q' | 'K'>;

interface Props {
  rank: CourtRank;
  suit: Suit;
}

/** Stilisierte Bildkarten-Porträts im klassischen Casino-Look (SVG). */
export function CourtPortrait({ rank, suit }: Props) {
  const color = SUIT_COLORS[suit];
  const accent = suit === 'hearts' || suit === 'diamonds' ? '#8b1530' : '#0d0d0d';

  if (rank === 'K') {
    return (
      <g>
        <ellipse cx={46} cy={118} rx={28} ry={6} fill={color} opacity={0.12} />
        <path
          d="M46 28 L52 38 L62 36 L56 44 L58 54 L46 48 L34 54 L36 44 L30 36 L40 38 Z"
          fill={color}
          opacity={0.9}
        />
        <rect x={38} y={48} width={16} height={4} rx={1} fill={accent} opacity={0.35} />
        <ellipse cx={46} cy={72} rx={18} ry={22} fill={color} opacity={0.15} />
        <path
          d="M46 54 C36 54 30 64 30 76 C30 88 36 96 46 96 C56 96 62 88 62 76 C62 64 56 54 46 54 Z"
          fill={color}
          opacity={0.85}
        />
        <path
          d="M38 68 C40 74 44 78 46 78 C48 78 52 74 54 68"
          fill="none"
          stroke={accent}
          strokeWidth={1.2}
          opacity={0.5}
        />
        <path
          d="M34 96 C30 104 28 112 26 118 L66 118 C64 112 62 104 58 96"
          fill={color}
          opacity={0.75}
        />
        <circle cx={40} cy={66} r={2} fill={accent} opacity={0.6} />
        <circle cx={52} cy={66} r={2} fill={accent} opacity={0.6} />
      </g>
    );
  }

  if (rank === 'Q') {
    return (
      <g>
        <ellipse cx={46} cy={118} rx={28} ry={6} fill={color} opacity={0.12} />
        <path
          d="M34 38 C34 32 40 28 46 28 C52 28 58 32 58 38 L56 42 L50 40 L46 44 L42 40 L36 42 Z"
          fill={color}
          opacity={0.85}
        />
        <circle cx={40} cy={36} r={2} fill="#e8c872" opacity={0.8} />
        <circle cx={46} cy={34} r={2} fill="#e8c872" opacity={0.8} />
        <circle cx={52} cy={36} r={2} fill="#e8c872" opacity={0.8} />
        <ellipse cx={46} cy={72} rx={17} ry={21} fill={color} opacity={0.15} />
        <path
          d="M46 50 C37 50 32 60 32 72 C32 84 38 94 46 94 C54 94 60 84 60 72 C60 60 55 50 46 50 Z"
          fill={color}
          opacity={0.8}
        />
        <path
          d="M40 64 C42 70 44 72 46 72 C48 72 50 70 52 64"
          fill="none"
          stroke={accent}
          strokeWidth={1}
          opacity={0.45}
        />
        <path
          d="M36 94 C34 102 32 110 30 118 L62 118 C60 110 58 102 56 94"
          fill={color}
          opacity={0.7}
        />
        <circle cx={41} cy={62} r={1.8} fill={accent} opacity={0.55} />
        <circle cx={51} cy={62} r={1.8} fill={accent} opacity={0.55} />
      </g>
    );
  }

  // Bauer (J)
  return (
    <g>
      <ellipse cx={46} cy={118} rx={28} ry={6} fill={color} opacity={0.12} />
      <path
        d="M30 44 L46 30 L62 44 L58 48 L46 38 L34 48 Z"
        fill={color}
        opacity={0.85}
      />
      <path d="M46 30 L50 22 L54 30 Z" fill={color} opacity={0.6} />
      <ellipse cx={46} cy={72} rx={16} ry={20} fill={color} opacity={0.15} />
      <path
        d="M46 52 C38 52 34 62 34 74 C34 86 39 94 46 94 C53 94 58 86 58 74 C58 62 54 52 46 52 Z"
        fill={color}
        opacity={0.82}
      />
      <path
        d="M40 66 C42 72 44 74 46 74 C48 74 50 72 52 66"
        fill="none"
        stroke={accent}
        strokeWidth={1}
        opacity={0.45}
      />
      <path
        d="M36 94 C34 102 32 110 30 118 L62 118 C60 110 58 102 56 94"
        fill={color}
        opacity={0.72}
      />
      <circle cx={41} cy={64} r={1.8} fill={accent} opacity={0.55} />
      <circle cx={51} cy={64} r={1.8} fill={accent} opacity={0.55} />
    </g>
  );
}
