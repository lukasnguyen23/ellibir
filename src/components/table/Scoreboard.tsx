import type { PlayerState } from '@/engine/types';

interface Props {
  players: PlayerState[];
  currentPlayerId: string;
  compact?: boolean;
}

export function Scoreboard({ players, currentPlayerId, compact = false }: Props) {
  const ranked = [...players].sort((a, b) => a.score - b.score || a.name.localeCompare(b.name));

  return (
    <div
      className={`absolute z-[60] casino-panel rounded-xl ${
        compact
          ? 'top-[max(0.5rem,env(safe-area-inset-top))] right-2 px-2 py-1 min-w-[5.5rem] max-w-[7rem]'
          : 'top-3 right-3 px-3 py-2 min-w-[8.5rem] max-w-[11rem]'
      }`}
    >
      <span className={`casino-label block ${compact ? 'mb-0.5 text-[9px]' : 'mb-1.5'}`}>
        {compact ? 'Pkt.' : 'Minusstand'}
      </span>
      <table className={`w-full border-collapse ${compact ? 'text-[10px]' : 'text-xs'}`}>
        <thead className={compact ? 'sr-only' : undefined}>
          <tr className="text-white/35 text-[10px]">
            <th className="text-left font-medium pb-1 pr-2">Spieler</th>
            <th className="text-right font-medium pb-1">Pkt.</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map((p) => {
            const active = p.id === currentPlayerId;
            return (
              <tr
                key={p.id}
                className={active ? 'text-brass-400' : 'text-white/75'}
              >
                <td
                  className={`truncate font-medium ${
                    compact ? 'pr-1 py-0 max-w-[3rem] text-[10px]' : 'pr-2 py-0.5 max-w-[5.5rem]'
                  }`}
                  title={p.name}
                >
                  {active ? '▸ ' : ''}
                  {compact ? p.name.slice(0, 4) : p.name}
                </td>
                <td
                  className={`text-right py-0.5 font-semibold tabular-nums ${
                    p.score > 0 ? 'text-rose-400' : 'text-white/45'
                  }`}
                >
                  {p.score > 0 ? `−${p.score}` : '0'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
