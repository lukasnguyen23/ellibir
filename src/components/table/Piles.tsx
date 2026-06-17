import type { KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Card, TronCard } from '@/engine/types';
import { PlayingCard } from '@/components/cards/PlayingCard';

interface DrawPileProps {
  drawCount: number;
  canDraw: boolean;
  onDrawStock: () => void;
}

interface DiscardPileProps {
  discardTop: Card | null;
  tron: TronCard;
  canDraw: boolean;
  onDrawDiscard: () => void;
  centered?: boolean;
}

function pileKeyHandler(onClick: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };
}

export function DrawPile({ drawCount, canDraw, onDrawStock }: DrawPileProps) {
  const clickable = canDraw && drawCount > 0;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={clickable ? onDrawStock : undefined}
        onKeyDown={clickable ? pileKeyHandler(onDrawStock) : undefined}
        className={`relative w-[80px] h-[108px] transition drop-shadow-lg ${
          clickable ? 'cursor-pointer hover:-translate-y-1' : 'cursor-default opacity-90'
        }`}
      >
        {Array.from({ length: Math.min(4, Math.max(1, drawCount)) }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 left-0 w-[68px] h-[96px] rounded-lg overflow-hidden shadow-card"
            style={{ transform: `translate(${i * 4}px, ${-i * 4}px)` }}
          >
            <PlayingCard
              card={{ id: `stock-${i}`, suit: null, rank: null, isJoker: false }}
              faceDown
              interactive={false}
            />
          </div>
        ))}
        {clickable && (
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 casino-label whitespace-nowrap">
            Nachziehen
          </span>
        )}
      </div>
      <span className="casino-label mt-5">{drawCount} Karten</span>
    </div>
  );
}

export function DiscardPile({
  discardTop,
  tron,
  canDraw,
  onDrawDiscard,
  centered = false,
}: DiscardPileProps) {
  const clickable = canDraw && Boolean(discardTop);

  return (
    <div className={`flex flex-col items-center gap-1 ${centered ? 'pointer-events-auto' : ''}`}>
      <div
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={clickable ? onDrawDiscard : undefined}
        onKeyDown={clickable ? pileKeyHandler(onDrawDiscard) : undefined}
        className={`relative w-[68px] h-[96px] rounded-lg transition drop-shadow-xl ${
          clickable ? 'cursor-pointer hover:-translate-y-1' : 'cursor-default'
        } ${clickable ? 'ring-2 ring-brass-400/70' : ''}`}
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
              <PlayingCard card={discardTop} tron={tron} interactive={false} />
            </motion.div>
          ) : (
            <div className="absolute inset-0 rounded-lg border-2 border-dashed border-brass-500/30 bg-black/20" />
          )}
        </AnimatePresence>
      </div>
      <span className={`casino-label ${centered ? 'opacity-100' : ''}`}>Ablage</span>
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
