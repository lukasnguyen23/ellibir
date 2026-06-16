import { motion } from 'framer-motion';
import type { PlayerState } from '@/engine/types';

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
                active
                  ? 'bg-gold-500 text-black font-bold shadow-lg shadow-gold-500/30'
                  : 'bg-black/30 text-white/80'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-felt-900/60 flex items-center justify-center text-xs">
                {p.name.slice(0, 1).toUpperCase()}
              </span>
              {p.name}
              {p.hasOpened && <span title="hat eröffnet">✓</span>}
            </div>
            <div className="flex">
              {Array.from({ length: Math.min(p.hand.length, 10) }).map((_, i) => (
                <motion.div
                  key={i}
                  className="card-back w-7 h-10 rounded-md shadow-md -ml-4 first:ml-0"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                />
              ))}
            </div>
            <span className="text-[11px] text-white/50">{p.hand.length} Karten</span>
          </div>
        );
      })}
    </div>
  );
}
