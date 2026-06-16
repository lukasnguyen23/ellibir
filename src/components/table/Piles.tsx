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

export function DrawPile({ drawCount, canDraw, onDrawStock }: DrawPileProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={canDraw ? onDrawStock : undefined}
        disabled={!canDraw || drawCount === 0}
        className={`relative w-[68px] h-[96px] transition ${
          canDraw ? 'cursor-pointer hover:-translate-y-1' : 'cursor-default opacity-90'
        }`}
      >
        {Array.from({ length: Math.min(4, Math.max(1, drawCount)) }).map((_, i) => (
          <div
            key={i}
            className="card-back absolute inset-0 rounded-lg shadow-card"
            style={{ transform: `translate(${i * 1.5}px, ${-i * 1.5}px)` }}
          />
        ))}
        {canDraw && drawCount > 0 && (
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] text-gold-400 font-semibold whitespace-nowrap">
            Nachziehen
          </span>
        )}
      </button>
      <span className="text-xs text-white/60 mt-5">{drawCount} Karten</span>
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
  return (
    <div className={`flex flex-col items-center gap-1 ${centered ? 'pointer-events-auto' : ''}`}>
      <button
        type="button"
        onClick={canDraw && discardTop ? onDrawDiscard : undefined}
        disabled={!canDraw || !discardTop}
        className={`relative w-[68px] h-[96px] rounded-lg transition ${
          canDraw && discardTop ? 'cursor-pointer hover:-translate-y-1' : 'cursor-default'
        } ${canDraw && discardTop ? 'ring-2 ring-gold-400/60' : ''}`}
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
              <PlayingCard card={discardTop} tron={tron} />
            </motion.div>
          ) : (
            <div className="absolute inset-0 rounded-lg border-2 border-dashed border-white/25 bg-black/10" />
          )}
        </AnimatePresence>
      </button>
      <span className={`text-xs text-white/60 ${centered ? 'font-medium text-white/70' : ''}`}>
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
