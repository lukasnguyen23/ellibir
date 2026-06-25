import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RulesButton } from '@/components/ui/GameRules';
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
    <div className="casino-room relative w-full h-full flex items-center justify-center p-4">
      <RulesButton className="absolute top-3 right-3 z-20" />
      <button
        type="button"
        onClick={reset}
        className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded-lg text-sm font-semibold casino-chip text-white/80 hover:text-white"
      >
        Zurück
      </button>

      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 w-full max-w-md rounded-2xl casino-panel p-7 shadow-2xl"
      >
        <h1 className="font-display text-3xl text-gold-400 text-center tracking-wide">Lobby</h1>
        <p className="text-center text-white/60 text-sm mb-2">Raumcode</p>
        <p className="text-center font-mono text-3xl text-white tracking-[0.3em] mb-4">{roomCode}</p>

        <button
          type="button"
          onClick={copyLink}
          className="w-full py-2 mb-5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition"
        >
          {copied ? 'Link kopiert!' : 'Einladungslink kopieren'}
        </button>

        {!room?.players[playerId ?? ''] && (
          <div className="mb-4">
            <label className="block text-sm text-white/80 mb-2">Dein Name</label>
            <input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 text-white border border-brass-500/20 outline-none"
            />
          </div>
        )}

        <label className="block text-sm text-white/80 mb-2">Spieler ({players.length}/7)</label>
        <ul className="space-y-2 mb-5">
          {players.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10"
            >
              <span className="text-white">
                {p.name}
                {p.id === room?.hostId && <span className="text-gold-400 text-xs ml-2">Host</span>}
              </span>
              <span className={p.ready ? 'text-emerald-400 text-sm' : 'text-white/40 text-sm'}>
                {p.ready ? 'Bereit' : 'Wartet…'}
              </span>
            </li>
          ))}
        </ul>

        {isHost && room?.status === 'waiting' && (
          <>
            <label className="block text-sm text-white/80 mb-2">Anzahl Runden</label>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setTotalRounds(n);
                    updateSettings({ totalRounds: n });
                  }}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition ${
                    totalRounds === n ? 'bg-gold-500 text-black' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <label className="block text-sm text-white/80 mb-2">Ass zählt als</label>
            <div className="flex gap-2 mb-5">
              {([1, 11] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setAceValue(v);
                    updateSettings({ aceValue: v });
                  }}
                  className={`flex-1 py-2 rounded-lg font-semibold transition ${
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
          className={`w-full py-3 rounded-xl font-bold mb-3 transition ${
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
            className="w-full py-3 rounded-xl bg-gold-500 text-black font-bold hover:bg-gold-400 transition disabled:opacity-40"
          >
            Spiel starten
          </button>
        )}

        {!isHost && room?.status === 'waiting' && (
          <p className="text-center text-white/50 text-sm mt-3">Warte auf den Host…</p>
        )}

        {error && <p className="text-rose-400 text-sm mt-4 text-center">{error}</p>}
      </motion.div>
    </div>
  );
}
