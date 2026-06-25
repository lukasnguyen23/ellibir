import { motion } from 'framer-motion';
import { RulesButton } from '@/components/ui/GameRules';
import { useLobbyStore } from '@/store/lobbyStore';

export function HomeScreen() {
  const { setScreen, playerName, setPlayerName, joinCodeInput, setJoinCodeInput, joinOnlineRoom, loading, error, clearError } =
    useLobbyStore();

  return (
    <div className="casino-room relative w-full h-full flex items-center justify-center p-4">
      <RulesButton className="absolute top-3 right-3 z-20" />
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 w-full max-w-md rounded-2xl casino-panel p-7 shadow-2xl"
      >
        <h1 className="font-display text-4xl text-gold-400 text-center tracking-wide">Elli Bir</h1>
        <p className="text-center text-white/60 text-sm mb-6">Das Kartenspiel für 2–7 Spieler</p>

        <label className="block text-sm text-white/80 mb-2">Dein Name</label>
        <input
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-white/10 text-white placeholder-white/40 border border-brass-500/20 focus:border-brass-400 outline-none mb-5"
          placeholder="Spielername"
        />

        <div className="space-y-3 mb-5">
          <button
            type="button"
            onClick={() => {
              clearError();
              setScreen('hotseat');
            }}
            className="w-full py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition"
          >
            Hotseat (ein Gerät)
          </button>
          <button
            type="button"
            onClick={() => {
              clearError();
              useLobbyStore.getState().createOnlineRoom();
            }}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gold-500 text-black font-bold hover:bg-gold-400 transition shadow-lg shadow-gold-500/20 disabled:opacity-50"
          >
            Online-Raum erstellen
          </button>
        </div>

        <div className="border-t border-white/10 pt-5">
          <label className="block text-sm text-white/80 mb-2">Raumcode beitreten</label>
          <div className="flex gap-2">
            <input
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-white/10 text-white placeholder-white/40 border border-brass-500/20 focus:border-brass-400 outline-none uppercase tracking-widest"
              placeholder="ABC123"
              maxLength={6}
            />
            <button
              type="button"
              onClick={() => joinOnlineRoom()}
              disabled={loading || joinCodeInput.length < 4}
              className="px-4 py-2 rounded-lg bg-gold-500 text-black font-bold hover:bg-gold-400 transition disabled:opacity-50"
            >
              Beitreten
            </button>
          </div>
        </div>

        {error && <p className="text-rose-400 text-sm mt-4 text-center">{error}</p>}
      </motion.div>
    </div>
  );
}
