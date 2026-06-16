import { motion } from 'framer-motion';
import type { Meld, TronCard } from '@/engine/types';
import type { TrayGroup } from '@/store/gameStore';
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
    <div className="w-full h-full overflow-auto">
      <div className="flex flex-wrap justify-center content-start gap-3 p-3 min-h-full px-[clamp(5rem,22vw,9rem)] py-[clamp(4.5rem,14vh,6.5rem)]">
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
                <PlayingCard card={card} tron={tron} small />
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

export function TrayArea({
  groups,
  tron,
  onRemove,
}: {
  groups: TrayGroup[];
  tron: TronCard;
  onRemove: (id: string) => void;
}) {
  const total = groups.reduce((sum, g) => sum + g.points, 0);
  const ready = groups.length > 0;

  return (
    <div className="rounded-xl border border-gold-400/40 bg-black/30 p-2">
      <div className="flex items-center justify-between mb-1 px-1">
        <span className="text-xs text-white/70">Auslage-Vorbereitung</span>
        <span className={`text-xs font-bold ${ready ? 'text-emerald-400' : 'text-gold-400'}`}>
          {groups.length} Per{groups.length === 1 ? '' : 's'}
          {total > 0 ? ` · ${total} Pkt.` : ''}
        </span>
      </div>
      {groups.length === 0 ? (
        <div className="text-[11px] text-white/40 px-1 py-2">
          Füge mindestens ein Per hinzu, dann aufdecken.
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
                    <PlayingCard card={card} tron={tron} small />
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
