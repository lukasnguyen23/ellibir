import { motion } from 'framer-motion';
import type { Meld, TronCard } from '@/engine/types';
import { PlayingCard } from '@/components/cards/PlayingCard';

interface Props {
  melds: Meld[];
  tron: TronCard;
  playerNames: Record<string, string>;
  canAppend: boolean;
  onMeldClick: (meldId: string) => void;
}

export function MeldsArea({ melds, tron, playerNames, canAppend, onMeldClick }: Props) {
  if (melds.length === 0) {
    return <div className="w-full h-full pointer-events-none" aria-hidden />;
  }

  return (
    <div className="w-full h-full overflow-auto relative z-10">
      <div className="flex flex-wrap justify-center content-start gap-3 p-3 min-h-full px-[clamp(5rem,22vw,9rem)] py-[clamp(4.5rem,14vh,6.5rem)]">
        {melds.map((meld) => (
          <motion.button
            key={meld.id}
            type="button"
            layout
            onClick={canAppend ? () => onMeldClick(meld.id) : undefined}
            className={`rounded-xl p-2 bg-black/25 backdrop-blur-sm border transition ${
              canAppend
                ? 'border-brass-400/40 hover:border-brass-400 hover:bg-black/35 cursor-pointer'
                : 'border-brass-500/20 cursor-default'
            }`}
          >
            <div className="flex gap-1">
              {meld.cards.map((card) => (
                <div key={card.id}>
                  <PlayingCard card={card} tron={tron} small interactive={false} />
                </div>
              ))}
            </div>
            <div className="text-[10px] text-white/50 mt-1 text-left">
              {meld.type === 'set' ? 'Satz' : 'Lauf'} · {playerNames[meld.ownerId] ?? '?'}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/** Eigene Per-Ablage — nur du siehst sie; zählen keine Punkte bis zum Aufdecken auf dem Tisch. */
export function StagingArea({
  pendingMelds,
  tron,
  onUnstage,
}: {
  pendingMelds: Meld[];
  tron: TronCard;
  onUnstage: (pendingMeldId: string) => void;
}) {
  if (pendingMelds.length === 0) {
    return (
      <div className="casino-panel rounded-xl border border-brass-500/20 px-3 py-2">
        <span className="casino-label">Eigene Ablage</span>
        <p className="text-[11px] text-white/40 mt-1">
          Pers landen hier — du siehst sie offen, sie zählen noch keine Punkte. Auf dem Tisch
          erscheinen sie, sobald deine Hand leer ist. Tippe ein Per an, um es zurückzunehmen.
        </p>
      </div>
    );
  }

  return (
    <div className="casino-panel rounded-xl border border-brass-500/30 p-2">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="casino-label">Eigene Ablage · noch nicht auf dem Tisch</span>
        <span className="text-xs text-white/50">
          {pendingMelds.length} Per{pendingMelds.length === 1 ? '' : 's'} · 0 Pkt.
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {pendingMelds.map((meld) => (
          <button
            key={meld.id}
            type="button"
            onClick={() => onUnstage(meld.id)}
            title="Zurück in die Hand"
            className="rounded-lg p-1.5 bg-black/40 border border-brass-500/25 hover:border-brass-400 hover:bg-black/55 transition cursor-pointer text-left"
          >
            <div className="flex gap-1">
              {meld.cards.map((card) => (
                <div key={card.id} className="pointer-events-none">
                  <PlayingCard card={card} tron={tron} small interactive={false} />
                </div>
              ))}
            </div>
            <div className="text-[10px] text-brass-400/80 mt-1 text-center">
              {meld.type === 'set' ? 'Satz' : 'Lauf'} · zurücknehmen
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
