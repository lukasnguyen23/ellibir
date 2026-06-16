import { motion } from 'framer-motion';
import type { Card, Suit, TronCard } from '@/engine/types';
import { isTronCard } from '@/engine/tron';
import { SUIT_SYMBOL, isRed } from '@/lib/cardVisual';

interface Props {
  card: Card;
  tron?: TronCard;
  faceDown?: boolean;
  selected?: boolean;
  small?: boolean;
  isTron?: boolean;
  onClick?: () => void;
  draggableProps?: Record<string, unknown>;
}

function JokerFace({
  tron,
  small,
  selected,
  size,
  onClick,
  draggableProps,
}: {
  tron?: TronCard;
  small: boolean;
  selected: boolean;
  size: string;
  onClick?: () => void;
  draggableProps?: Record<string, unknown>;
}) {
  const tronSymbol = tron ? SUIT_SYMBOL[tron.suit] : null;
  const tronRed = tron ? tron.suit === 'hearts' || tron.suit === 'diamonds' : false;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -10 }}
      animate={{ y: selected ? -18 : 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className={`card-joker ${size} relative rounded-lg select-none cursor-pointer text-fuchsia-800
        border-2 ${
          selected
            ? 'border-gold-500 ring-2 ring-gold-400 shadow-card-hover'
            : 'border-violet-400 shadow-card'
        }`}
      {...draggableProps}
    >
      <span
        className={`absolute top-1 left-1 font-black leading-none tracking-tighter ${
          small ? 'text-[8px]' : 'text-[10px]'
        }`}
      >
        JK
      </span>

      {tron && (
        <span
          className={`absolute top-1 right-1 font-bold leading-none rounded px-0.5 bg-white/75 ${
            small ? 'text-[8px]' : 'text-[10px]'
          } ${tronRed ? 'text-card-red' : 'text-card-black'}`}
          title={`Zählt als Tron: ${tron.rank}${tronSymbol}`}
        >
          {tron.rank}
          {tronSymbol}
        </span>
      )}

      <span
        className={`absolute inset-0 flex flex-col items-center justify-center ${
          small ? 'gap-0 pt-0.5' : 'gap-0.5'
        }`}
      >
        <span className={small ? 'text-xl leading-none' : 'text-4xl leading-none'} aria-hidden>
          🃏
        </span>
        {!small && (
          <span className="text-[9px] font-black tracking-[0.12em] text-fuchsia-900/90">JOKER</span>
        )}
      </span>

      <span
        className={`absolute bottom-1 right-1 font-black leading-none rotate-180 tracking-tighter ${
          small ? 'text-[8px]' : 'text-[10px]'
        }`}
      >
        JK
      </span>
    </motion.button>
  );
}

export function PlayingCard({
  card,
  tron,
  faceDown = false,
  selected = false,
  small = false,
  isTron = false,
  onClick,
  draggableProps,
}: Props) {
  const size = small ? 'w-12 h-[68px] text-xs' : 'w-[68px] h-[96px] text-sm';

  if (faceDown) {
    return (
      <div
        className={`card-back ${size} rounded-lg shadow-card flex items-center justify-center`}
      >
        <span className="text-gold-400/80 text-lg font-bold">★</span>
      </div>
    );
  }

  if (card.isJoker) {
    return (
      <JokerFace
        tron={tron}
        small={small}
        selected={selected}
        size={size}
        onClick={onClick}
        draggableProps={draggableProps}
      />
    );
  }

  const tronHighlight = isTron || (tron !== undefined && isTronCard(card, tron));
  const red = isRed(card.suit);
  const colorClass = red ? 'text-card-red' : 'text-card-black';
  const symbol = SUIT_SYMBOL[card.suit as Suit];
  const label = card.rank ?? '';

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -10 }}
      animate={{ y: selected ? -18 : 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className={`card-face ${size} relative rounded-lg select-none cursor-pointer
        ${tronHighlight ? `card-tron${small ? ' card-tron--small' : ''}` : ''}
        border ${
          selected
            ? 'border-gold-500 ring-2 ring-gold-400'
            : tronHighlight
              ? ''
              : 'border-black/10'
        }
        ${selected && !tronHighlight ? 'shadow-card-hover' : !tronHighlight ? 'shadow-card' : ''} ${colorClass}`}
      {...draggableProps}
    >
      <span className="absolute top-1 left-1.5 font-bold leading-none flex flex-col items-center z-10">
        {label}
        <span className="text-[0.9em] leading-none">{symbol}</span>
      </span>
      <span
        className={`absolute inset-0 flex items-center justify-center z-10 ${small ? 'text-xl' : 'text-3xl'}`}
      >
        {symbol}
      </span>
      <span className="absolute bottom-1 right-1.5 font-bold leading-none flex flex-col items-center rotate-180 z-10">
        {label}
        <span className="text-[0.9em] leading-none">{symbol}</span>
      </span>
    </motion.button>
  );
}
