import type { PlayerState } from '@/engine/types';

interface Props {
  players: PlayerState[];
  currentPlayerId: string;
  localPlayerId: string;
}

export function MobilePlayerStrip({ players, currentPlayerId, localPlayerId }: Props) {
  const dense = players.length >= 4;

  return (
    <div className="w-full shrink-0 px-2 pb-1">
      <div className="hand-scroll overflow-x-auto">
        <div className="mx-auto flex w-max gap-1.5">
          {players.map((player) => {
            const onTurn = player.id === currentPlayerId;
            const isYou = player.id === localPlayerId;
            const scoreLabel = player.score > 0 ? `−${player.score}` : '0';

            return (
              <div
                key={player.id}
                className={`flex items-center gap-1 rounded-full border px-2 py-0.5 ${
                  onTurn
                    ? 'casino-chip-active border-brass-400/50'
                    : 'casino-chip border-white/10 text-white/75'
                }`}
                title={`${player.name}: ${player.hand.length} Karten, ${scoreLabel} Pkt.${isYou ? ' (du)' : ''}`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                    onTurn ? 'bg-room-900/40' : 'bg-room-900/80 text-brass-400'
                  }`}
                >
                  {player.name.slice(0, 1).toUpperCase()}
                </span>
                {!dense && (
                  <span className="max-w-[3.5rem] truncate text-[10px] font-semibold">
                    {isYou ? 'Du' : player.name}
                  </span>
                )}
                <span className="text-[9px] tabular-nums text-white/50">{player.hand.length}</span>
                <span
                  className={`text-[9px] font-semibold tabular-nums ${
                    player.score > 0 ? 'text-rose-400/90' : 'text-white/40'
                  }`}
                >
                  {scoreLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-0.5 text-center text-[9px] text-white/40">
        {players.length} Spieler
      </p>
    </div>
  );
}
