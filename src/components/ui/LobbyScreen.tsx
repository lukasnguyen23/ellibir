import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RulesButton } from '@/components/ui/GameRules';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { isRoomHost, useLobbyStore } from '@/store/lobbyStore';
import { useGameStore } from '@/store/gameStore';

export function LobbyScreen() {
  const {
    room,
    roomCode,
    playerId,
    playerName,
    setPlayerName,
    toggleReady,
    updateSettings,
    startOnlineGame,
    getShareUrl,
    loading,
    error,
    reset,
  } = useLobbyStore();

  const enterOnlineGame = useGameStore((s) => s.enterOnlineGame);

  const [copied, setCopied] = useState(false);
  const isHost = isRoomHost(room, playerId);
  const settings = room?.settings;
  const [aceValue, setAceValue] = useState<1 | 11>(settings?.aceValue ?? 11);
  const [totalRounds, setTotalRounds] = useState(settings?.totalRounds ?? 3);

  useEffect(() => {
    if (settings) {
      setAceValue(settings.aceValue);
      setTotalRounds(settings.totalRounds);
    }
  }, [settings?.aceValue, settings?.totalRounds]);

  useEffect(() => {
    if (room?.status === 'playing' && roomCode && playerId) {
      enterOnlineGame(roomCode, playerId, isHost);
    }
  }, [room?.status, roomCode, playerId, isHost, enterOnlineGame]);

  const players = room
    ? room.playerOrder.map((id) => ({ id, ...room.players[id] })).filter((p) => p.name)
    : [];

  const allReady = players.length >= 2 && players.every((p) => p.ready);
  const myReady = playerId ? room?.players[playerId]?.ready : false;
  const isMobile = useMediaQuery('(max-width: 639px)');
  const denseLobby = isMobile && players.length >= 5;

  const copyLink = async () => {
    const url = getShareUrl();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applySettings = async () => {
    if (!isHost) return;
    await updateSettings({ aceValue, totalRounds });
  };

  return (
    <div className="casino-room relative w-full h-full flex items-center justify-center p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] overflow-y-auto">
      <RulesButton className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-20" />
      <button
        type="button"
        onClick={reset}
        className="absolute top-[max(0.75rem,env(safe-area-inset-top))] left-3 z-20 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold casino-chip text-white/80 hover:text-white"
      >
        Zurück
      </button>

      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 w-full max-w-md rounded-2xl casino-panel p-4 sm:p-7 shadow-2xl my-auto"
      >
        <h1 className="font-display text-2xl sm:text-3xl text-gold-400 text-center tracking-wide">
          Lobby
        </h1>
        <p className="text-center text-white/60 text-xs sm:text-sm mb-1 sm:mb-2">Raumcode</p>
        <p className="text-center font-mono text-2xl sm:text-3xl text-white tracking-[0.2em] sm:tracking-[0.3em] mb-3 sm:mb-4">
          {roomCode}
        </p>

        <button
          type="button"
          onClick={copyLink}
          className="w-full py-2 mb-4 sm:mb-5 rounded-lg bg-white/10 text-white text-xs sm:text-sm hover:bg-white/20 transition"
        >
          {copied ? 'Link kopiert!' : 'Einladungslink kopieren'}
        </button>

        {!room?.players[playerId ?? ''] && (
          <div className="mb-3 sm:mb-4">
            <label className="block text-xs sm:text-sm text-white/80 mb-1.5 sm:mb-2">Dein Name</label>
            <input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 text-white text-base sm:text-sm border border-brass-500/20 outline-none"
            />
          </div>
        )}

        <label className="block text-xs sm:text-sm text-white/80 mb-1.5 sm:mb-2">
          Spieler ({players.length}/7)
        </label>
        <ul
          className={`mb-4 sm:mb-5 ${
            denseLobby ? 'grid grid-cols-2 gap-1' : 'space-y-1.5 sm:space-y-2'
          }`}
        >
          {players.map((p) => (
            <li
              key={p.id}
              className={`flex items-center justify-between rounded-lg bg-white/5 border border-white/10 ${
                denseLobby ? 'px-2 py-1' : 'px-2.5 sm:px-3 py-1.5 sm:py-2'
              }`}
            >
              <span
                className={`text-white truncate min-w-0 pr-2 ${
                  denseLobby ? 'text-xs' : 'text-sm'
                }`}
                title={p.name}
              >
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-room-900/80 text-[10px] font-bold text-brass-400 mr-1.5 align-middle">
                  {p.name.slice(0, 1).toUpperCase()}
                </span>
                {denseLobby ? p.name.slice(0, 8) : p.name}
                {p.id === room?.hostId && (
                  <span className={`text-gold-400 ml-1 ${denseLobby ? 'text-[10px]' : 'text-xs'}`}>
                    Host
                  </span>
                )}
              </span>
              <span
                className={`shrink-0 ${
                  denseLobby ? 'text-[10px]' : 'text-xs sm:text-sm'
                } ${p.ready ? 'text-emerald-400' : 'text-white/40'}`}
              >
                {p.ready ? '✓' : '…'}
              </span>
            </li>
          ))}
        </ul>

        {isHost && room?.status === 'waiting' && (
          <>
            <label className="block text-xs sm:text-sm text-white/80 mb-1.5 sm:mb-2">Anzahl Runden</label>
            <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setTotalRounds(n);
                    updateSettings({ totalRounds: n });
                  }}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs sm:text-sm font-semibold transition ${
                    totalRounds === n ? 'bg-gold-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <label className="block text-xs sm:text-sm text-white/80 mb-1.5 sm:mb-2">Ass zählt als</label>
            <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-5">
              {([1, 11] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setAceValue(v);
                    updateSettings({ aceValue: v });
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                    aceValue === v ? 'bg-gold-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {v} Punkte
                </button>
              ))}
            </div>
          </>
        )}

        <button
          type="button"
          onClick={toggleReady}
          disabled={room?.status !== 'waiting'}
          className={`w-full py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-bold mb-2 sm:mb-3 transition ${
            myReady
              ? 'bg-white/10 text-white hover:bg-white/20'
              : 'bg-emerald-600 text-white hover:bg-emerald-500'
          }`}
        >
          {myReady ? 'Nicht bereit' : 'Bereit'}
        </button>

        {isHost && (
          <button
            type="button"
            onClick={async () => {
              await applySettings();
              await startOnlineGame();
            }}
            disabled={!allReady || loading || room?.status !== 'waiting'}
            className="w-full py-2.5 sm:py-3 rounded-xl bg-gold-500 text-black text-sm sm:text-base font-bold hover:bg-gold-400 transition disabled:opacity-40"
          >
            Spiel starten
          </button>
        )}

        {!isHost && room?.status === 'waiting' && (
          <p className="text-center text-white/50 text-xs sm:text-sm mt-2 sm:mt-3">Warte auf den Host…</p>
        )}

        {error && <p className="text-rose-400 text-xs sm:text-sm mt-3 sm:mt-4 text-center">{error}</p>}
      </motion.div>
    </div>
  );
}
