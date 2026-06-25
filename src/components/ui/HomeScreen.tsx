import { motion } from 'framer-motion';
import { RulesButton } from '@/components/ui/GameRules';
import { useLobbyStore } from '@/store/lobbyStore';

export function HomeScreen() {
  const { setScreen, playerName, setPlayerName, joinCodeInput, setJoinCodeInput, joinOnlineRoom, loading, error, clearError } =
    useLobbyStore();

  return (
    <div className="casino-room relative w-full h-full flex items-center justify-center p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] overflow-y-auto">
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

        <label className="block text-xs sm:text-sm text-white/80 mb-1.5 sm:mb-2">Dein Name</label>
        <input
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-white/10 text-white text-base sm:text-sm placeholder-white/40 border border-brass-500/20 focus:border-brass-400 outline-none mb-4 sm:mb-5"
          placeholder="Spielername"
        />

        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
          <button
            type="button"
            onClick={() => {
              clearError();
              setScreen('hotseat');
            }}
            className="w-full py-2.5 sm:py-3 rounded-xl bg-white/10 text-white text-sm sm:text-base font-bold hover:bg-white/20 transition"
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
            className="w-full py-2.5 sm:py-3 rounded-xl bg-gold-500 text-black text-sm sm:text-base font-bold hover:bg-gold-400 transition shadow-lg shadow-gold-500/20 disabled:opacity-50"
          >
            Online-Raum erstellen
          </button>
        </div>

        <div className="border-t border-white/10 pt-3 sm:pt-5">
          <label className="block text-xs sm:text-sm text-white/80 mb-1.5 sm:mb-2">
            Raumcode beitreten
          </label>
          <div className="flex gap-1.5 sm:gap-2 items-stretch min-w-0">
            <input
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value)}
              className="min-w-0 flex-1 px-2.5 sm:px-3 py-2 rounded-lg bg-white/10 text-white text-base sm:text-sm placeholder-white/40 border border-brass-500/20 focus:border-brass-400 outline-none uppercase tracking-[0.15em] sm:tracking-widest"
              placeholder="ABC123"
              maxLength={6}
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => joinOnlineRoom()}
              disabled={loading || joinCodeInput.length < 4}
              className="shrink-0 px-3 sm:px-4 py-2 rounded-lg bg-gold-500 text-black text-sm font-bold hover:bg-gold-400 transition disabled:opacity-50 whitespace-nowrap"
            >
              Beitreten
            </button>
          </div>
        </div>

        {error && <p className="text-rose-400 text-xs sm:text-sm mt-3 sm:mt-4 text-center">{error}</p>}
      </motion.div>
    </div>
  );
}
