import { motion } from 'framer-motion';
import type { Card, Suit, TronCard } from '@/engine/types';
import { isTronCard } from '@/engine/tron';
import { SUIT_SYMBOL, cardLabel, isRed } from '@/lib/cardVisual';

interface Props {
  card: Card;
  tron?: TronCard;
  faceDown?: boolean;
  selected?: boolean;
  small?: boolean;
  mini?: boolean;
  isTron?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  draggableProps?: Record<string, unknown>;
}

const motionProps = {
  whileHover: { y: -10 },
  transition: { type: 'spring' as const, stiffness: 420, damping: 28 },
};

function cardSizeClass(small: boolean, mini: boolean): string {
  if (mini) return 'w-7 h-10 text-[8px]';
  if (small) return 'w-12 h-[68px] text-xs';
  return 'w-[68px] h-[96px] text-sm';
}

function selectedLift(small: boolean, mini: boolean): number {
  if (mini) return -10;
  if (small) return -12;
  return -18;
}

function JokerFace({
  tron,
  small,
  mini,
  selected,
  size,
  interactive,
  onClick,
  draggableProps,
  ariaLabel,
}: {
  tron?: TronCard;
  small: boolean;
  mini: boolean;
  selected: boolean;
  size: string;
  interactive: boolean;
  onClick?: () => void;
  draggableProps?: Record<string, unknown>;
  ariaLabel: string;
}) {
  const tronSymbol = tron ? SUIT_SYMBOL[tron.suit] : null;
  const tronRed = tron ? tron.suit === 'hearts' || tron.suit === 'diamonds' : false;
  const compact = small || mini;
  const lift = selectedLift(small, mini);

  const className = `card-joker ${size} relative rounded-lg select-none text-fuchsia-800
    border-2 ${
      selected
        ? 'border-gold-500 ring-2 ring-gold-400 shadow-card-hover'
        : 'border-violet-400 shadow-card'
    } ${interactive ? 'cursor-pointer' : ''}`;

  const content = (
    <>
      <span
        className={`absolute top-0.5 left-0.5 font-black leading-none tracking-tighter ${
          mini ? 'text-[6px]' : small ? 'text-[8px]' : 'text-[10px]'
        }`}
      >
        JK
      </span>

      {tron && !mini && (
        <span
          className={`absolute top-0.5 right-0.5 font-bold leading-none rounded px-0.5 bg-white/75 ${
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
          compact ? 'gap-0 pt-0.5' : 'gap-0.5'
        }`}
      >
        <span
          className={
            mini ? 'text-sm leading-none' : small ? 'text-xl leading-none' : 'text-4xl leading-none'
          }
          aria-hidden
        >
          🃏
        </span>
        {!compact && (
          <span className="text-[9px] font-black tracking-[0.12em] text-fuchsia-900/90">JOKER</span>
        )}
      </span>

      <span
        className={`absolute bottom-0.5 right-0.5 font-black leading-none rotate-180 tracking-tighter ${
          mini ? 'text-[6px]' : small ? 'text-[8px]' : 'text-[10px]'
        }`}
      >
        JK
      </span>
    </>
  );

  if (!interactive) {
    return (
      <motion.div
        animate={{ y: selected ? lift : 0 }}
        className={className}
        aria-label={ariaLabel}
        {...motionProps}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      animate={{ y: selected ? lift : 0 }}
      className={className}
      aria-label={ariaLabel}
      {...motionProps}
      {...draggableProps}
    >
      {content}
    </motion.button>
  );
}

export function PlayingCard({
  card,
  tron,
  faceDown = false,
  selected = false,
  small = false,
  mini = false,
  isTron = false,
  interactive,
  onClick,
  draggableProps,
}: Props) {
  const size = cardSizeClass(small, mini);
  const lift = selectedLift(small, mini);
  const isInteractive = interactive ?? Boolean(onClick || draggableProps);

  const ariaLabel = faceDown
    ? 'Verdeckte Karte'
    : card.isJoker
      ? tron
        ? `Joker, zählt als ${cardLabel({ id: '', suit: tron.suit, rank: tron.rank, isJoker: false })}`
        : 'Joker'
      : cardLabel(card);

  if (faceDown) {
    return (
      <div
        className={`card-back ${size} rounded-lg shadow-card flex items-center justify-center`}
        aria-label={ariaLabel}
      >
        <span className={`text-gold-400/80 font-bold ${mini ? 'text-xs' : 'text-lg'}`}>★</span>
      </div>
    );
  }

  if (card.isJoker) {
    return (
      <JokerFace
        tron={tron}
        small={small}
        mini={mini}
        selected={selected}
        size={size}
        interactive={isInteractive}
        onClick={onClick}
        draggableProps={draggableProps}
        ariaLabel={ariaLabel}
      />
    );
  }

  const tronHighlight = isTron || (tron !== undefined && isTronCard(card, tron));
  const red = isRed(card.suit);
  const colorClass = red ? 'text-card-red' : 'text-card-black';
  const symbol = SUIT_SYMBOL[card.suit as Suit];
  const label = card.rank ?? '';

  const className = `card-face ${size} relative rounded-lg select-none
    ${tronHighlight ? `card-tron${small || mini ? ' card-tron--small' : ''}` : ''}
    border ${
      selected
        ? 'border-gold-500 ring-2 ring-gold-400'
        : tronHighlight
          ? ''
          : 'border-black/10'
    }
    ${selected && !tronHighlight ? 'shadow-card-hover' : !tronHighlight ? 'shadow-card' : ''} ${colorClass}
    ${isInteractive ? 'cursor-pointer' : ''}`;

  const content = (
    <>
      <span className="absolute top-0.5 left-1 font-bold leading-none flex flex-col items-center z-10">
        {label}
        <span className="text-[0.9em] leading-none">{symbol}</span>
      </span>
      <span
        className={`absolute inset-0 flex items-center justify-center z-10 ${
          mini ? 'text-sm' : small ? 'text-xl' : 'text-3xl'
        }`}
      >
        {symbol}
      </span>
      <span className="absolute bottom-0.5 right-1 font-bold leading-none flex flex-col items-center rotate-180 z-10">
        {label}
        <span className="text-[0.9em] leading-none">{symbol}</span>
      </span>
    </>
  );

  if (!isInteractive) {
    return (
      <motion.div
        animate={{ y: selected ? lift : 0 }}
        className={className}
        aria-label={ariaLabel}
        {...motionProps}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      animate={{ y: selected ? lift : 0 }}
      className={className}
      aria-label={ariaLabel}
      {...motionProps}
      {...draggableProps}
    >
      {content}
    </motion.button>
  );
}
