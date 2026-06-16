import { useState } from 'react';
import { motion } from 'framer-motion';
import type { GameSettings } from '@/engine/types';

interface Props {
  onStart: (players: { id: string; name: string }[], settings: Partial<GameSettings>) => void;
}

export function SetupScreen({ onStart }: Props) {
  const [count, setCount] = useState(2);
  const [names, setNames] = useState<string[]>(['Spieler 1', 'Spieler 2', 'Spieler 3', 'Spieler 4']);
  const [aceValue, setAceValue] = useState<1 | 11>(11);

  const updateName = (i: number, value: string) => {
    setNames((prev) => prev.map((n, idx) => (idx === i ? value : n)));
  };

  const start = () => {
    const players = Array.from({ length: count }, (_, i) => ({
      id: `p${i + 1}`,
      name: names[i]?.trim() || `Spieler ${i + 1}`,
    }));
    onStart(players, { aceValue });
  };

  return (
    <div className="table-felt relative w-full h-full flex items-center justify-center p-4">
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 w-full max-w-md rounded-2xl bg-black/40 backdrop-blur-md border border-gold-400/30 p-7 shadow-2xl"
      >
        <h1 className="font-display text-4xl text-gold-400 text-center tracking-wide">Elli Bir</h1>
        <p className="text-center text-white/60 text-sm mb-6">Das 51-Punkte-Kartenspiel</p>

        <label className="block text-sm text-white/80 mb-2">Anzahl Spieler</label>
        <div className="flex gap-2 mb-5">
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCount(n)}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                count === n ? 'bg-gold-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <label className="block text-sm text-white/80 mb-2">Namen</label>
        <div className="space-y-2 mb-5">
          {Array.from({ length: count }).map((_, i) => (
            <input
              key={i}
              value={names[i]}
              onChange={(e) => updateName(i, e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 text-white placeholder-white/40 border border-white/10 focus:border-gold-400 outline-none"
              placeholder={`Spieler ${i + 1}`}
            />
          ))}
        </div>

        <label className="block text-sm text-white/80 mb-2">Ass zählt als</label>
        <div className="flex gap-2 mb-7">
          {([1, 11] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setAceValue(v)}
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
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
          className="w-full py-3 rounded-xl bg-gold-500 text-black font-bold text-lg hover:bg-gold-400 transition shadow-lg shadow-gold-500/20"
        >
          Spiel starten
        </button>
        <p className="text-center text-white/40 text-xs mt-3">
          14 Karten · 2 Decks + 4 Joker · Hotseat (Gerät weitergeben)
        </p>
      </motion.div>
    </div>
  );
}
