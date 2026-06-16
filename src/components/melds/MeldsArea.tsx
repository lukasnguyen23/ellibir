import { motion } from 'framer-motion';
import type { Meld } from '@/engine/types';
import type { TrayGroup } from '@/store/gameStore';
import { PlayingCard } from '@/components/cards/PlayingCard';

interface Props {
  melds: Meld[];
  playerNames: Record<string, string>;
  canAppend: boolean;
  onMeldClick: (meldId: string) => void;
}

export function MeldsArea({ melds, playerNames, canAppend, onMeldClick }: Props) {
  if (melds.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/40 text-sm italic">
        Noch keine Kombinationen ausgelegt
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-wrap content-start gap-3 p-3 overflow-auto">
      {melds.map((meld) => (
        <motion.button
          key={meld.id}
          type="button"
          layout
          onClick={canAppend ? () => onMeldClick(meld.id) : undefined}
          className={`rounded-xl p-2 bg-black/20 backdrop-blur-sm border transition ${
            canAppend
              ? 'border-gold-400/40 hover:border-gold-400 hover:bg-black/30 cursor-pointer'
              : 'border-white/10 cursor-default'
          }`}
        >
          <div className="flex">
            {meld.cards.map((card, i) => (
              <div key={card.id} className={i === 0 ? '' : '-ml-4'}>
                <PlayingCard card={card} small />
              </div>
            ))}
          </div>
          <div className="text-[10px] text-white/50 mt-1 text-left">
            {meld.type === 'set' ? 'Satz' : 'Lauf'} · {playerNames[meld.ownerId] ?? '?'}
          </div>
        </motion.button>
      ))}
    </div>
  );
}

export function TrayArea({
  groups,
  threshold,
  onRemove,
}: {
  groups: TrayGroup[];
  threshold: number;
  onRemove: (id: string) => void;
}) {
  const total = groups.reduce((sum, g) => sum + g.points, 0);
  const reached = total >= threshold;

  return (
    <div className="rounded-xl border border-gold-400/40 bg-black/30 p-2">
      <div className="flex items-center justify-between mb-1 px-1">
        <span className="text-xs text-white/70">Auslage-Vorbereitung</span>
        <span className={`text-xs font-bold ${reached ? 'text-emerald-400' : 'text-gold-400'}`}>
          {total} / {threshold} Punkte
        </span>
      </div>
      {groups.length === 0 ? (
        <div className="text-[11px] text-white/40 px-1 py-2">
          Wähle Karten und füge ein Per hinzu, bis du {threshold} Punkte erreichst.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => onRemove(g.id)}
              title="Entfernen"
              className="rounded-lg p-1.5 bg-black/30 hover:bg-rose-900/40 border border-white/10"
            >
              <div className="flex">
                {g.cards.map((card, i) => (
                  <div key={card.id} className={i === 0 ? '' : '-ml-4'}>
                    <PlayingCard card={card} small />
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-gold-400 mt-1">{g.points} Pkt</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
