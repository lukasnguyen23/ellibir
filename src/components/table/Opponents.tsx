import { motion } from 'framer-motion';
import type { PlayerState } from '@/engine/types';
import { PlayingCard } from '@/components/cards/PlayingCard';

interface Props {
  opponents: PlayerState[];
  currentPlayerId: string;
}

export function Opponents({ opponents, currentPlayerId }: Props) {
  return (
    <div className="flex justify-center gap-10">
      {opponents.map((p) => {
        const active = p.id === currentPlayerId;
        return (
          <div key={p.id} className="flex flex-col items-center gap-1">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition ${
                active ? 'casino-chip-active' : 'casino-chip text-white/80'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  active ? 'bg-room-900/40' : 'bg-room-900/80 text-brass-400'
                }`}
              >
                {p.name.slice(0, 1).toUpperCase()}
              </span>
              {p.name}
            </div>
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
            <span className="casino-label">{p.hand.length} Karten</span>
          </div>
        );
      })}
    </div>
  );
}
