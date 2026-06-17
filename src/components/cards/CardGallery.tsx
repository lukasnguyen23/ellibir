import type { Card, Suit } from '@/engine/types';
import { RANKS, SUITS } from '@/engine/types';
import { PlayingCard } from './PlayingCard';

const SUIT_NAMES: Record<Suit, string> = {
  hearts: 'Herz',
  diamonds: 'Karo',
  clubs: 'Kreuz',
  spades: 'Pik',
};

function makeCard(suit: Suit, rank: (typeof RANKS)[number], index: number): Card {
  return {
    id: `preview-${suit}-${rank}-${index}`,
    suit,
    rank,
    isJoker: false,
  };
}

function CardPreview({ card, label }: { card: Card; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <PlayingCard card={card} interactive={false} />
      {label && <span className="text-[10px] text-white/50">{label}</span>}
    </div>
  );
}

export function CardGallery() {
  const sampleTron = { suit: 'diamonds' as const, rank: '8' as const };
  const jokerCard: Card = { id: 'preview-joker', suit: null, rank: null, isJoker: true };
  const backCard: Card = { id: 'preview-back', suit: null, rank: null, isJoker: false };

  return (
    <div className="casino-room w-full h-full overflow-auto">
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 space-y-10">
        <header className="text-center space-y-2">
          <h1 className="font-display text-3xl text-gold-400">Kartenvorschau</h1>
          <p className="text-white/60 text-sm">Einfache Karten · Rang + Farbe in den Ecken</p>
        </header>

        {SUITS.map((suit) => (
          <section key={suit}>
            <h2 className="casino-label mb-4">{SUIT_NAMES[suit]}</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {RANKS.map((rank) => (
                <CardPreview key={rank} card={makeCard(suit, rank, 0)} label={rank} />
              ))}
            </div>
          </section>
        ))}

        <section>
          <h2 className="casino-label mb-4">Joker</h2>
          <div className="flex flex-wrap gap-6 justify-center items-end">
            <div className="flex flex-col items-center gap-1">
              <PlayingCard card={jokerCard} interactive={false} />
              <span className="text-[10px] text-white/50">ohne Tron</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <PlayingCard card={jokerCard} tron={sampleTron} interactive={false} />
              <span className="text-[10px] text-white/50">mit Tron 8♦</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="casino-label mb-4">Rückseite</h2>
          <div className="flex justify-center">
            <PlayingCard card={backCard} faceDown interactive={false} />
          </div>
        </section>

        <section>
          <h2 className="casino-label mb-4">Größenvergleich</h2>
          <div className="flex flex-wrap gap-8 justify-center items-end">
            <div className="flex flex-col items-center gap-1">
              <PlayingCard card={makeCard('hearts', 'K', 1)} interactive={false} />
              <span className="text-[10px] text-white/50">Normal (Tisch)</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <PlayingCard card={makeCard('hearts', 'K', 2)} small interactive={false} />
              <span className="text-[10px] text-white/50">Klein (Melds)</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <PlayingCard card={backCard} faceDown mini interactive={false} />
              <span className="text-[10px] text-white/50">Mini (Gegner)</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
