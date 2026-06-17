import { useId } from 'react';
import type { Card, Rank, Suit } from '@/engine/types';
import { CARD_VIEW_H, CARD_VIEW_W, PIP_LAYOUTS, RANK_LABEL, SUIT_COLORS } from './constants';
import { CourtPortrait } from './CourtPortrait';
import { SuitIcon } from './SuitIcon';

interface Props {
  card: Card;
  className?: string;
}

function Corner({ rank, suit, flip }: { rank: Rank; suit: Suit; flip?: boolean }) {
  const color = SUIT_COLORS[suit];
  const label = RANK_LABEL[rank];

  if (flip) {
    return (
      <g transform={`translate(${CARD_VIEW_W} ${CARD_VIEW_H}) rotate(180)`}>
        <text
          x={12}
          y={22}
          fill={color}
          fontSize={label.length > 1 ? 15 : 18}
          fontWeight="700"
          fontFamily="Georgia, 'Times New Roman', serif"
        >
          {label}
        </text>
        <foreignObject x={10} y={24} width={18} height={18}>
          <SuitIcon suit={suit} size={14} />
        </foreignObject>
      </g>
    );
  }

  return (
    <g>
      <text
        x={12}
        y={22}
        fill={color}
        fontSize={label.length > 1 ? 15 : 18}
        fontWeight="700"
        fontFamily="Georgia, 'Times New Roman', serif"
      >
        {label}
      </text>
      <foreignObject x={10} y={24} width={18} height={18}>
        <SuitIcon suit={suit} size={14} />
      </foreignObject>
    </g>
  );
}

function CourtArt({ rank, suit, courtShineId }: { rank: Rank; suit: Suit; courtShineId: string }) {
  const color = SUIT_COLORS[suit];
  const label = RANK_LABEL[rank];

  return (
    <g>
      <rect x={24} y={36} width={92} height={124} rx={8} fill="none" stroke={color} strokeWidth={1.5} opacity={0.35} />
      <rect x={30} y={42} width={80} height={112} rx={6} fill={color} opacity={0.05} />
      <rect x={32} y={44} width={76} height={108} rx={5} fill={`url(#${courtShineId})`} opacity={0.4} />
      <g transform="translate(24, 36)">
        <CourtPortrait rank={rank as 'J' | 'Q' | 'K'} suit={suit} />
      </g>
      <text
        x={70}
        y={34}
        textAnchor="middle"
        fill={color}
        fontSize={11}
        fontWeight="700"
        fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing={1}
        opacity={0.75}
      >
        {label}
      </text>
    </g>
  );
}

export function CardFaceArt({ card, className }: Props) {
  const uid = useId().replace(/:/g, '');
  const faceBgId = `cardFaceBg-${uid}`;
  const faceBorderId = `cardFaceBorder-${uid}`;
  const courtShineId = `courtShine-${uid}`;

  if (card.isJoker || !card.suit || !card.rank) return null;

  const suit = card.suit;
  const rank = card.rank;
  const color = SUIT_COLORS[suit];
  const isCourt = rank === 'J' || rank === 'Q' || rank === 'K';
  const pips = PIP_LAYOUTS[rank] ?? [];

  return (
    <svg
      viewBox={`0 0 ${CARD_VIEW_W} ${CARD_VIEW_H}`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <linearGradient id={faceBgId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f4f1e8" />
        </linearGradient>
        <linearGradient id={faceBorderId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e8e4d8" />
          <stop offset="100%" stopColor="#d4cfc0" />
        </linearGradient>
        <linearGradient id={courtShineId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
      </defs>

      <rect x={1} y={1} width={CARD_VIEW_W - 2} height={CARD_VIEW_H - 2} rx={10} fill={`url(#${faceBgId})`} />
      <rect
        x={1}
        y={1}
        width={CARD_VIEW_W - 2}
        height={CARD_VIEW_H - 2}
        rx={10}
        fill="none"
        stroke={`url(#${faceBorderId})`}
        strokeWidth={2}
      />

      <Corner rank={rank} suit={suit} />
      <Corner rank={rank} suit={suit} flip />

      {isCourt ? (
        <CourtArt rank={rank} suit={suit} courtShineId={courtShineId} />
      ) : (
        <g>
          {pips.map(([x, y], i) => (
            <foreignObject key={i} x={x - 11} y={y - 11} width={22} height={22}>
              <SuitIcon suit={suit} size={rank === 'A' ? 40 : 20} />
            </foreignObject>
          ))}
          {rank === 'A' && <circle cx={70} cy={98} r={42} fill={color} opacity={0.04} />}
        </g>
      )}

      <rect
        x={6}
        y={6}
        width={CARD_VIEW_W - 12}
        height={CARD_VIEW_H - 12}
        rx={8}
        fill="none"
        stroke={color}
        strokeWidth={0.5}
        opacity={0.15}
      />
    </svg>
  );
}
