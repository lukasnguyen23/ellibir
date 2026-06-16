import { AnimatePresence, motion } from 'framer-motion';
import type { Card } from '@/engine/types';
import { PlayingCard } from '@/components/cards/PlayingCard';

interface Props {
  drawCount: number;
  discardTop: Card | null;
  canDraw: boolean;
  onDrawStock: () => void;
  onDrawDiscard: () => void;
}

export function Piles({ drawCount, discardTop, canDraw, onDrawStock, onDrawDiscard }: Props) {
  return (
    <div className="flex items-center gap-8">
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

      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={canDraw && discardTop ? onDrawDiscard : undefined}
          disabled={!canDraw || !discardTop}
          className={`relative w-[68px] h-[96px] rounded-lg ${
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
                <PlayingCard card={discardTop} />
              </motion.div>
            ) : (
              <div className="absolute inset-0 rounded-lg border-2 border-dashed border-white/25" />
            )}
          </AnimatePresence>
        </button>
        <span className="text-xs text-white/60">Ablage</span>
      </div>
    </div>
  );
}
