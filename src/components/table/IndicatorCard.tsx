import { indicatorPenaltyMultiplier } from '@/engine/tron';
import type { Card, TronCard } from '@/engine/types';
import { cardLabel } from '@/lib/cardVisual';
import { PlayingCard } from '@/components/cards/PlayingCard';
import { SUIT_SYMBOL } from '@/lib/cardVisual';
import type { Suit } from '@/engine/types';

interface Props {
  indicatorCard: Card;
  tron: TronCard;
}

export function IndicatorCard({ indicatorCard, tron }: Props) {
  const mult = indicatorPenaltyMultiplier(indicatorCard);
  const tronDisplay: Card = {
    id: 'tron-display',
    suit: tron.suit,
    rank: tron.rank,
    isJoker: false,
  };

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-gold-400/50 bg-black/35 backdrop-blur-sm px-4 py-3">
      <span className="text-[11px] uppercase tracking-wider text-gold-400/90 font-semibold">
        Anzeige & Tron
      </span>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <PlayingCard card={indicatorCard} small />
          <span className="text-[10px] text-white/60">Anzeige</span>
          <span className="text-xs text-gold-400 font-bold">
            {SUIT_SYMBOL[indicatorCard.suit as Suit]} ×{mult}
          </span>
        </div>
        <span className="text-gold-400 text-lg">→</span>
        <div className="flex flex-col items-center gap-1">
          <PlayingCard card={tronDisplay} small isTron />
          <span className="text-[10px] text-white/60">Tron</span>
          <span className="text-xs text-white/70">{cardLabel(tronDisplay)}</span>
        </div>
      </div>
    </div>
  );
}
