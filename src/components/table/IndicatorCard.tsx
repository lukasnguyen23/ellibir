import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { indicatorPenaltyMultiplier } from '@/engine/tron';
import type { Card, Suit, TronCard } from '@/engine/types';
import { cardLabel, isRed, SUIT_SYMBOL } from '@/lib/cardVisual';
import { PlayingCard } from '@/components/cards/PlayingCard';

const JOKER_DISPLAY: Card = {
  id: 'indicator-joker',
  suit: null,
  rank: null,
  isJoker: true,
};

const flowVariants = {
  hidden: { opacity: 0, y: 8 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: 'easeOut' as const },
  }),
};

function FlowArrow() {
  return (
    <div className="indicator-flow" aria-hidden>
      <span className="indicator-flow__line" />
      <svg className="indicator-flow__chevron" viewBox="0 0 12 12" fill="none">
        <path
          d="M2 6h6M6 3l3 3-3 3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function SlotLabel({ children }: { children: ReactNode }) {
  return <span className="indicator-slot__label">{children}</span>;
}

function CardPedestal({ children }: { children: ReactNode }) {
  return <div className="indicator-slot__pedestal">{children}</div>;
}

interface Props {
  indicatorCard: Card;
  tron: TronCard;
}

export function IndicatorCard({ indicatorCard, tron }: Props) {
  const mult = indicatorPenaltyMultiplier(indicatorCard);
  const suit = indicatorCard.suit as Suit;
  const suitSymbol = SUIT_SYMBOL[suit];
  const suitRed = isRed(suit);

  const tronDisplay: Card = {
    id: 'tron-display',
    suit: tron.suit,
    rank: tron.rank,
    isJoker: false,
  };
  const tronLabel = cardLabel(tronDisplay);

  return (
    <motion.div
      className="indicator-board"
      initial="hidden"
      animate="show"
      role="region"
      aria-label="Anzeige, Tron und Joker"
    >
      <motion.div className="indicator-board__header" custom={0} variants={flowVariants}>
        <div className="flex items-center gap-2">
          <span className="indicator-board__title">Rundenregel</span>
          <span className="indicator-board__dot" aria-hidden />
          <span className="text-[11px] text-white/45">Anzeige bestimmt Tron &amp; Strafe</span>
        </div>
        <span
          className={`indicator-board__mult ${suitRed ? 'indicator-board__mult--red' : 'indicator-board__mult--black'}`}
        >
          <span className="text-[10px] opacity-70 mr-1">Strafe</span>
          {suitSymbol} ×{mult}
        </span>
      </motion.div>

      <div className="indicator-board__flow">
        <motion.div className="indicator-slot" custom={1} variants={flowVariants}>
          <SlotLabel>Anzeige</SlotLabel>
          <CardPedestal>
            <PlayingCard card={indicatorCard} small interactive={false} />
          </CardPedestal>
          <span
            className={`indicator-slot__meta ${suitRed ? 'text-card-red' : 'text-white/80'}`}
          >
            {cardLabel(indicatorCard)}
          </span>
        </motion.div>

        <FlowArrow />

        <motion.div className="indicator-board__group" custom={2} variants={flowVariants}>
          <div className="indicator-slot">
            <SlotLabel>Tron</SlotLabel>
            <CardPedestal>
              <PlayingCard card={tronDisplay} small isTron interactive={false} />
            </CardPedestal>
            <span className="indicator-slot__meta indicator-slot__hint text-brass-400">
              Überall einsetzbar
            </span>
          </div>

          <div className="indicator-plus" aria-hidden>
            <span />
          </div>

          <div className="indicator-slot">
            <SlotLabel>Joker</SlotLabel>
            <CardPedestal>
              <PlayingCard card={JOKER_DISPLAY} tron={tron} small interactive={false} />
            </CardPedestal>
            <span className="indicator-slot__meta text-white/55 text-center leading-tight">
              = <span className="text-brass-400 font-semibold">{tronLabel}</span>
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
