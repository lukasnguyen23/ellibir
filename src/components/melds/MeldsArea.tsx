import { motion } from 'framer-motion';
import type { Meld, TronCard } from '@/engine/types';
import { PlayingCard } from '@/components/cards/PlayingCard';

interface Props {
  melds: Meld[];
  tron: TronCard;
  playerNames: Record<string, string>;
  canAppend: boolean;
  onMeldClick: (meldId: string) => void;
  compact?: boolean;
}

export function MeldsArea({ melds, tron, playerNames, canAppend, onMeldClick, compact = false }: Props) {
  if (melds.length === 0) {
    return <div className="w-full h-full pointer-events-none" aria-hidden />;
  }

  return (
    <div className="w-full h-full overflow-auto relative z-10">
      <div
        className={`flex flex-wrap justify-center content-start min-h-full ${
          compact
            ? 'gap-1.5 p-1.5 px-[clamp(3.5rem,18vw,5rem)] py-[clamp(3rem,10vh,4rem)]'
            : 'gap-3 p-3 px-[clamp(5rem,22vw,9rem)] py-[clamp(4.5rem,14vh,6.5rem)]'
        }`}
      >
        {melds.map((meld) => (
          <motion.button
            key={meld.id}
            type="button"
            layout
            onClick={canAppend ? () => onMeldClick(meld.id) : undefined}
            className={`rounded-xl bg-black/25 backdrop-blur-sm border transition ${
              compact ? 'p-1' : 'p-2'
            } ${
              canAppend
                ? 'border-brass-400/40 hover:border-brass-400 hover:bg-black/35 cursor-pointer'
                : 'border-brass-500/20 cursor-default'
            }`}
          >
            <div className="flex gap-1">
              {meld.cards.map((card) => (
                <div key={card.id}>
                  <PlayingCard
                    card={card}
                    tron={tron}
                    small={!compact}
                    mini={compact}
                    interactive={false}
                  />
                </div>
              ))}
            </div>
            <div className={`text-white/50 mt-1 text-left ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
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
  compact = false,
}: {
  pendingMelds: Meld[];
  tron: TronCard;
  onUnstage: (pendingMeldId: string) => void;
  compact?: boolean;
}) {
  if (pendingMelds.length === 0) {
    return (
      <div className={`casino-panel rounded-xl border border-brass-500/20 ${compact ? 'px-2 py-1' : 'px-3 py-2'}`}>
        <span className="casino-label">Eigene Ablage</span>
        {!compact && (
          <p className="text-[11px] text-white/40 mt-1">
            Pers landen hier — du siehst sie offen, sie zählen noch keine Punkte. Auf dem Tisch
            erscheinen sie, sobald deine Hand leer ist. Tippe ein Per an, um es zurückzunehmen.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`casino-panel rounded-xl border border-brass-500/30 ${compact ? 'p-1.5' : 'p-2'}`}>
      <div className={`flex items-center justify-between mb-1 ${compact ? 'px-0.5' : 'mb-2 px-1'}`}>
        <span className={`casino-label ${compact ? 'text-[9px]' : ''}`}>
          {compact ? 'Ablage' : 'Eigene Ablage · noch nicht auf dem Tisch'}
        </span>
        <span className={`text-white/50 ${compact ? 'text-[10px]' : 'text-xs'}`}>
          {pendingMelds.length} Per{pendingMelds.length === 1 ? '' : 's'}
          {!compact && ' · 0 Pkt.'}
        </span>
      </div>
      <div className={`flex flex-wrap ${compact ? 'gap-1' : 'gap-2'}`}>
        {pendingMelds.map((meld) => (
          <button
            key={meld.id}
            type="button"
            onClick={() => onUnstage(meld.id)}
            title="Zurück in die Hand"
            className={`rounded-lg bg-black/40 border border-brass-500/25 hover:border-brass-400 hover:bg-black/55 transition cursor-pointer text-left ${
              compact ? 'p-1' : 'p-1.5'
            }`}
          >
            <div className="flex gap-1">
              {meld.cards.map((card) => (
                <div key={card.id} className="pointer-events-none">
                  <PlayingCard
                    card={card}
                    tron={tron}
                    small={!compact}
                    mini={compact}
                    interactive={false}
                  />
                </div>
              ))}
            </div>
            {!compact && (
              <div className="text-[10px] text-brass-400/80 mt-1 text-center">
                {meld.type === 'set' ? 'Satz' : 'Lauf'} · zurücknehmen
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
