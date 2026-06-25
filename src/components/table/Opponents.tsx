import { motion } from 'framer-motion';
import type { PlayerState } from '@/engine/types';
import { PlayingCard } from '@/components/cards/PlayingCard';

interface Props {
  opponents: PlayerState[];
  currentPlayerId: string;
  compact?: boolean;
}

export function Opponents({ opponents, currentPlayerId, compact = false }: Props) {
  const dense = compact && opponents.length >= 3;

  if (dense) {
    return (
      <div className="w-full max-w-full overflow-x-auto hand-scroll px-1">
        <div className="flex w-max items-center gap-1.5 mx-auto">
          {opponents.map((p) => {
            const active = p.id === currentPlayerId;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 ${
                  active ? 'casino-chip-active' : 'casino-chip text-white/75'
                }`}
                title={`${p.name}: ${p.hand.length} Karten`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold ${
                    active ? 'bg-room-900/40' : 'bg-room-900/80 text-brass-400'
                  }`}
                >
                  {p.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="text-[10px] font-semibold tabular-nums">{p.hand.length}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex justify-center ${compact ? 'gap-2' : 'gap-10'}`}>
      {opponents.map((p) => {
        const active = p.id === currentPlayerId;
        return (
          <div key={p.id} className="flex flex-col items-center gap-0.5 sm:gap-1">
            <div
              className={`flex items-center rounded-full transition ${
                compact ? 'gap-1 px-2 py-0.5 text-xs' : 'gap-2 px-3 py-1 text-sm'
              } ${active ? 'casino-chip-active' : 'casino-chip text-white/80'}`}
            >
              <span
                className={`rounded-full flex items-center justify-center font-bold ${
                  compact ? 'w-5 h-5 text-[10px]' : 'w-6 h-6 text-xs'
                } ${active ? 'bg-room-900/40' : 'bg-room-900/80 text-brass-400'}`}
              >
                {p.name.slice(0, 1).toUpperCase()}
              </span>
              {!compact && p.name}
            </div>
            {!compact && (
              <div className="flex gap-1 drop-shadow-lg">
                {Array.from({ length: Math.min(p.hand.length, 10) }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <PlayingCard
                      card={{ id: `${p.id}-back-${i}`, suit: null, rank: null, isJoker: false }}
                      faceDown
                      mini
                      interactive={false}
                    />
                  </motion.div>
                ))}
              </div>
            )}
            <span className={`casino-label ${compact ? 'text-[9px]' : ''}`}>
              {compact ? `${p.hand.length}` : `${p.hand.length} Karten`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
