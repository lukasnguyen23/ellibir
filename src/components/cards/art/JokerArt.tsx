import { useId } from 'react';
import type { TronCard } from '@/engine/types';
import { CARD_VIEW_H, CARD_VIEW_W, SUIT_COLORS } from './constants';
import { SuitIcon } from './SuitIcon';
import { cardLabel } from '@/lib/cardVisual';

interface Props {
  tron?: TronCard;
  className?: string;
}

export function JokerArt({ tron, className }: Props) {
  const uid = useId().replace(/:/g, '');
  const jokerBgId = `jokerBg-${uid}`;

  const tronLabel = tron
    ? cardLabel({ id: 't', suit: tron.suit, rank: tron.rank, isJoker: false })
    : null;
  const tronColor = tron ? SUIT_COLORS[tron.suit] : '#7c3aed';

  return (
    <svg
      viewBox={`0 0 ${CARD_VIEW_W} ${CARD_VIEW_H}`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <linearGradient id={jokerBgId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#faf0ff" />
          <stop offset="50%" stopColor="#e9d5ff" />
          <stop offset="100%" stopColor="#d8b4fe" />
        </linearGradient>
      </defs>

      <rect x={1} y={1} width={CARD_VIEW_W - 2} height={CARD_VIEW_H - 2} rx={10} fill={`url(#${jokerBgId})`} />
      <rect
        x={1}
        y={1}
        width={CARD_VIEW_W - 2}
        height={CARD_VIEW_H - 2}
        rx={10}
        fill="none"
        stroke="#a855f7"
        strokeWidth={2}
      />

      <text x={10} y={20} fill="#6b21a8" fontSize={11} fontWeight="900">
        JK
      </text>
      <text
        x={CARD_VIEW_W - 10}
        y={CARD_VIEW_H - 10}
        textAnchor="end"
        fill="#6b21a8"
        fontSize={11}
        fontWeight="900"
        transform={`rotate(180 ${CARD_VIEW_W / 2} ${CARD_VIEW_H / 2})`}
      >
        JK
      </text>

      {tron && (
        <g>
          <rect x={88} y={8} width={44} height={20} rx={4} fill="white" fillOpacity={0.85} />
          <text x={110} y={22} textAnchor="middle" fill={tronColor} fontSize={11} fontWeight="700">
            {tronLabel}
          </text>
        </g>
      )}

      <text x={70} y={88} textAnchor="middle" fontSize={42}>
        🃏
      </text>
      <text
        x={70}
        y={112}
        textAnchor="middle"
        fill="#581c87"
        fontSize={10}
        fontWeight="900"
        letterSpacing={2}
      >
        JOKER
      </text>

      {tron && (
        <g>
          <foreignObject x={54} y={118} width={32} height={32}>
            <SuitIcon suit={tron.suit} size={28} />
          </foreignObject>
          <text x={70} y={162} textAnchor="middle" fill="#6b21a8" fontSize={9} fontWeight="600">
            = {tronLabel}
          </text>
        </g>
      )}
    </svg>
  );
}
