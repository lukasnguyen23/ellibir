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

  const tronHighlight = isTron || (tron !== undefined && isTronCard(card, tron));
  const red = isRed(card.suit);
  const colorClass = card.isJoker ? 'text-fuchsia-600' : red ? 'text-card-red' : 'text-card-black';

  let symbol: string;
  let label: string;
  if (card.isJoker && tron) {
    symbol = SUIT_SYMBOL[tron.suit];
    label = tron.rank;
  } else if (card.isJoker) {
    symbol = '★';
    label = 'JO';
  } else {
    symbol = SUIT_SYMBOL[card.suit as Suit];
    label = card.rank ?? '';
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -10 }}
      animate={{ y: selected ? -18 : 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className={`card-face ${size} relative rounded-lg select-none cursor-pointer
        border ${
          selected
            ? 'border-gold-500 ring-2 ring-gold-400'
            : tronHighlight
              ? 'border-amber-400 ring-2 ring-amber-300/70'
              : 'border-black/10'
        }
        ${selected || tronHighlight ? 'shadow-card-hover' : 'shadow-card'} ${colorClass}`}
      {...draggableProps}
    >
      <span className="absolute top-1 left-1.5 font-bold leading-none flex flex-col items-center">
        {label}
        <span className="text-[0.9em] leading-none">{symbol}</span>
      </span>
      <span className={`absolute inset-0 flex items-center justify-center ${small ? 'text-xl' : 'text-3xl'}`}>
        {symbol}
      </span>
      <span className="absolute bottom-1 right-1.5 font-bold leading-none flex flex-col items-center rotate-180">
        {label}
        <span className="text-[0.9em] leading-none">{symbol}</span>
      </span>
    </motion.button>
  );
}
