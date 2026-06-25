import type { KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Card, TronCard } from '@/engine/types';
import { PlayingCard } from '@/components/cards/PlayingCard';

interface DrawPileProps {
  drawCount: number;
  canDraw: boolean;
  onDrawStock: () => void;
  compact?: boolean;
}

interface DiscardPileProps {
  discardTop: Card | null;
  tron: TronCard;
  canDraw: boolean;
  onDrawDiscard: () => void;
  centered?: boolean;
  compact?: boolean;
}

function pileKeyHandler(onClick: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };
}

export function DrawPile({ drawCount, canDraw, onDrawStock, compact = false }: DrawPileProps) {
  const clickable = canDraw && drawCount > 0;
  const cardW = compact ? 48 : 68;
  const cardH = compact ? 68 : 96;
  const stackW = compact ? 56 : 80;
  const stackH = compact ? 76 : 108;

  return (
    <div className="flex flex-col items-center gap-0.5 sm:gap-1">
      <div
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={clickable ? onDrawStock : undefined}
        onKeyDown={clickable ? pileKeyHandler(onDrawStock) : undefined}
        className={`relative transition drop-shadow-lg ${
          clickable ? 'cursor-pointer hover:-translate-y-1' : 'cursor-default opacity-90'
        }`}
        style={{ width: stackW, height: stackH }}
      >
        {Array.from({ length: Math.min(4, Math.max(1, drawCount)) }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 left-0 rounded-lg overflow-hidden shadow-card"
            style={{
              width: cardW,
              height: cardH,
              transform: `translate(${i * (compact ? 3 : 4)}px, ${-i * (compact ? 3 : 4)}px)`,
            }}
          >
            <PlayingCard
              card={{ id: `stock-${i}`, suit: null, rank: null, isJoker: false }}
              faceDown
              small={compact}
              interactive={false}
            />
          </div>
        ))}
        {clickable && (
          <span
            className={`absolute left-1/2 -translate-x-1/2 casino-label whitespace-nowrap ${
              compact ? '-bottom-4 text-[9px]' : '-bottom-6'
            }`}
          >
            {compact ? 'Ziehen' : 'Nachziehen'}
          </span>
        )}
      </div>
      {!compact && <span className="casino-label mt-5">{drawCount} Karten</span>}
    </div>
  );
}

export function DiscardPile({
  discardTop,
  tron,
  canDraw,
  onDrawDiscard,
  centered = false,
  compact = false,
}: DiscardPileProps) {
  const clickable = canDraw && Boolean(discardTop);
  const cardW = compact ? 48 : 68;
  const cardH = compact ? 68 : 96;

  return (
    <div className={`flex flex-col items-center gap-0.5 sm:gap-1 ${centered ? 'pointer-events-auto' : ''}`}>
      <div
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={clickable ? onDrawDiscard : undefined}
        onKeyDown={clickable ? pileKeyHandler(onDrawDiscard) : undefined}
        className={`relative rounded-lg transition drop-shadow-xl ${
          clickable ? 'cursor-pointer hover:-translate-y-1' : 'cursor-default'
        } ${clickable ? 'ring-2 ring-brass-400/70' : ''}`}
        style={{ width: cardW, height: cardH }}
      >
        <AnimatePresence mode="popLayout">
          {discardTop ? (
            <motion.div
              key={discardTop.id}
              initial={{ scale: 0.7, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="absolute inset-0"
            >
              <PlayingCard card={discardTop} tron={tron} small={compact} interactive={false} />
            </motion.div>
          ) : (
            <div className="absolute inset-0 rounded-lg border-2 border-dashed border-brass-500/30 bg-black/20" />
          )}
        </AnimatePresence>
      </div>
      <span className={`casino-label ${centered ? 'opacity-100' : ''} ${compact ? 'text-[9px]' : ''}`}>
        Ablage
      </span>
    </div>
  );
}

/** Legacy-Kombi (falls noch benötigt). */
export function Piles({
  drawCount,
  discardTop,
  tron,
  canDraw,
  onDrawStock,
  onDrawDiscard,
}: DrawPileProps & DiscardPileProps) {
  return (
    <div className="flex items-center gap-8">
      <DrawPile drawCount={drawCount} canDraw={canDraw} onDrawStock={onDrawStock} />
      <DiscardPile
        discardTop={discardTop}
        tron={tron}
        canDraw={canDraw}
        onDrawDiscard={onDrawDiscard}
      />
    </div>
  );
}
