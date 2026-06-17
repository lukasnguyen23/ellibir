import { useId } from 'react';
import { CARD_VIEW_H, CARD_VIEW_W } from './constants';

interface Props {
  className?: string;
}

export function CardBackArt({ className }: Props) {
  const uid = useId().replace(/:/g, '');
  const backBgId = `backBg-${uid}`;
  const backDiamondsId = `backDiamonds-${uid}`;
  const backGlowId = `backGlow-${uid}`;

  return (
    <svg
      viewBox={`0 0 ${CARD_VIEW_W} ${CARD_VIEW_H}`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <linearGradient id={backBgId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a3a8a" />
          <stop offset="50%" stopColor="#0f2860" />
          <stop offset="100%" stopColor="#0a1a45" />
        </linearGradient>
        <pattern id={backDiamondsId} width={14} height={14} patternUnits="userSpaceOnUse">
          <path d="M7 0 L14 7 L7 14 L0 7 Z" fill="none" stroke="#c41e3a" strokeWidth={0.8} opacity={0.55} />
          <path d="M7 0 L14 7 L7 14 L0 7 Z" fill="none" stroke="#ffffff" strokeWidth={0.4} opacity={0.2} transform="translate(7,7)" />
        </pattern>
        <radialGradient id={backGlowId} cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.08} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>
      </defs>

      <rect x={0} y={0} width={CARD_VIEW_W} height={CARD_VIEW_H} rx={10} fill={`url(#${backBgId})`} />
      <rect x={0} y={0} width={CARD_VIEW_W} height={CARD_VIEW_H} rx={10} fill={`url(#${backDiamondsId})`} />
      <rect x={0} y={0} width={CARD_VIEW_W} height={CARD_VIEW_H} rx={10} fill={`url(#${backGlowId})`} />

      <rect
        x={8}
        y={8}
        width={CARD_VIEW_W - 16}
        height={CARD_VIEW_H - 16}
        rx={8}
        fill="none"
        stroke="#c41e3a"
        strokeWidth={2}
        opacity={0.75}
      />
      <rect
        x={14}
        y={14}
        width={CARD_VIEW_W - 28}
        height={CARD_VIEW_H - 28}
        rx={6}
        fill="none"
        stroke="#ffffff"
        strokeWidth={1}
        opacity={0.25}
      />

      <text
        x={70}
        y={104}
        textAnchor="middle"
        fill="#ffffff"
        fontSize={26}
        fontWeight="700"
        fontFamily="Georgia, 'Times New Roman', serif"
        opacity={0.9}
      >
        EB
      </text>
      <text
        x={70}
        y={124}
        textAnchor="middle"
        fill="#e8c872"
        fontSize={9}
        fontWeight="600"
        letterSpacing={3}
        opacity={0.8}
      >
        ELLI BIR
      </text>
    </svg>
  );
}
