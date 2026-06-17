import type { PlayerState } from '@/engine/types';

interface Props {
  players: PlayerState[];
  currentPlayerId: string;
}

export function Scoreboard({ players, currentPlayerId }: Props) {
  const ranked = [...players].sort((a, b) => a.score - b.score || a.name.localeCompare(b.name));

  return (
    <div className="absolute top-3 right-3 z-[60] casino-panel rounded-xl px-3 py-2 min-w-[8.5rem] max-w-[11rem]">
      <span className="casino-label block mb-1.5">Minusstand</span>
      <table className="w-full text-xs border-collapse">
        <thead>
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
                <td className="pr-2 py-0.5 truncate max-w-[5.5rem] font-medium" title={p.name}>
                  {active ? '▸ ' : ''}
                  {p.name}
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
