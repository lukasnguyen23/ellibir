import { useState } from 'react';
import { motion } from 'framer-motion';
import type { GameSettings } from '@/engine/types';
import { RulesButton } from '@/components/ui/GameRules';

interface Props {
  onStart: (players: { id: string; name: string }[], settings: Partial<GameSettings>) => void;
  onBack?: () => void;
}

export function SetupScreen({ onStart, onBack }: Props) {
  const [count, setCount] = useState(2);
  const [names, setNames] = useState<string[]>([
    'Spieler 1',
    'Spieler 2',
    'Spieler 3',
    'Spieler 4',
    'Spieler 5',
    'Spieler 6',
    'Spieler 7',
  ]);
  const [aceValue, setAceValue] = useState<1 | 11>(11);
  const [totalRounds, setTotalRounds] = useState(3);

  const updateName = (i: number, value: string) => {
    setNames((prev) => prev.map((n, idx) => (idx === i ? value : n)));
  };

  const start = () => {
    const players = Array.from({ length: count }, (_, i) => ({
      id: `p${i + 1}`,
      name: names[i]?.trim() || `Spieler ${i + 1}`,
    }));
    onStart(players, { aceValue, totalRounds });
  };

  return (
    <div className="casino-room relative w-full h-full flex items-center justify-center p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] overflow-y-auto">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="absolute top-[max(0.75rem,env(safe-area-inset-top))] left-3 z-20 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold casino-chip text-white/80 hover:text-white"
        >
          Zurück
        </button>
      )}
      <RulesButton className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-20" />
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 w-full max-w-md rounded-2xl casino-panel p-4 sm:p-7 shadow-2xl my-auto"
      >
        <h1 className="font-display text-3xl sm:text-4xl text-gold-400 text-center tracking-wide">
          Elli Bir
        </h1>
        <p className="text-center text-white/60 text-xs sm:text-sm mb-4 sm:mb-6">
          Das Kartenspiel für 2–7 Spieler
        </p>

        <label className="block text-xs sm:text-sm text-white/80 mb-1.5 sm:mb-2">Anzahl Spieler</label>
        <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-4 sm:mb-5">
          {Array.from({ length: 6 }, (_, i) => i + 2).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCount(n)}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs sm:text-sm font-semibold transition ${
                count === n ? 'bg-gold-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <label className="block text-xs sm:text-sm text-white/80 mb-1.5 sm:mb-2">Namen</label>
        <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-5">
          {Array.from({ length: count }).map((_, i) => (
            <input
              key={i}
              value={names[i]}
              onChange={(e) => updateName(i, e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 text-white text-base sm:text-sm placeholder-white/40 border border-brass-500/20 focus:border-brass-400 outline-none"
              placeholder={`Spieler ${i + 1}`}
            />
          ))}
        </div>

        <label className="block text-xs sm:text-sm text-white/80 mb-1.5 sm:mb-2">Anzahl Runden</label>
        <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-4 sm:mb-5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setTotalRounds(n)}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs sm:text-sm font-semibold transition ${
                totalRounds === n ? 'bg-gold-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <label className="block text-xs sm:text-sm text-white/80 mb-1.5 sm:mb-2">Ass zählt als</label>
        <div className="flex gap-1.5 sm:gap-2 mb-5 sm:mb-7">
          {([1, 11] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setAceValue(v)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                aceValue === v ? 'bg-gold-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {v} Punkte
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={start}
          className="w-full py-2.5 sm:py-3 rounded-xl bg-gold-500 text-black font-bold text-base sm:text-lg hover:bg-gold-400 transition shadow-lg shadow-gold-500/20"
        >
          Spiel starten
        </button>
        <p className="text-center text-white/40 text-[10px] sm:text-xs mt-2 sm:mt-3 leading-snug">
          14 Karten · ein zufälliger Spieler beginnt mit 15 · 2 Decks + 4 Joker · Hotseat
        </p>
      </motion.div>
    </div>
  );
}
