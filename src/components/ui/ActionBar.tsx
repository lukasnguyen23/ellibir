import type { ReactNode } from 'react';
import { selectionValidation, useGameStore } from '@/store/gameStore';
import type { GameState } from '@/engine/types';

function Btn({
  children,
  onClick,
  disabled,
  variant = 'default',
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'danger';
}) {
  const styles =
    variant === 'primary'
      ? 'bg-gold-500 text-black hover:bg-gold-400'
      : variant === 'danger'
        ? 'bg-rose-600 text-white hover:bg-rose-500'
        : 'bg-white/10 text-white hover:bg-white/20';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed ${styles}`}
    >
      {children}
    </button>
  );
}

export function ActionBar({ game }: { game: GameState }) {
  const {
    selectedCardIds,
    trayGroups,
    addSelectionToTray,
    clearTray,
    commitOpening,
    layMeldFromSelection,
    discardSelected,
  } = useGameStore();

  const player = game.players[game.currentPlayerIndex];
  const phase = game.turnPhase;
  const validation = selectionValidation(game, selectedCardIds);
  const trayTotal = trayGroups.reduce((sum, g) => sum + g.points, 0);
  const canOpen = trayTotal >= game.settings.openingThreshold;

  return (
    <div className="flex items-center gap-2 flex-wrap justify-center">
      {phase === 'draw' && (
        <span className="text-sm text-gold-400 animate-pulse">
          Ziehe eine Karte (Nachziehstapel oder Ablage)
        </span>
      )}

      {phase === 'meld' && !player.hasOpened && (
        <>
          <Btn onClick={addSelectionToTray} disabled={!validation} variant="default">
            Per zur Auslage {validation ? `(+${validation.points})` : ''}
          </Btn>
          <Btn onClick={commitOpening} disabled={!canOpen} variant="primary">
            Eröffnen ({trayTotal}/{game.settings.openingThreshold})
          </Btn>
          {trayGroups.length > 0 && (
            <Btn onClick={clearTray} variant="default">
              Auslage zurücknehmen
            </Btn>
          )}
        </>
      )}

      {phase === 'meld' && player.hasOpened && (
        <Btn onClick={layMeldFromSelection} disabled={!validation} variant="primary">
          Per auslegen {validation ? `(${validation.points})` : ''}
        </Btn>
      )}

      {phase === 'meld' && (
        <Btn
          onClick={discardSelected}
          disabled={selectedCardIds.length !== 1}
          variant="danger"
        >
          Abwerfen &amp; Zug beenden
        </Btn>
      )}
    </div>
  );
}
