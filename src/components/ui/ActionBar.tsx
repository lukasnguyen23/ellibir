import type { ReactNode } from 'react';
import { selectionValidation, useGameStore } from '@/store/gameStore';
import type { GameState } from '@/engine/types';

function Btn({
  children,
  onClick,
  disabled,
  variant = 'default',
  compact = false,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'danger';
  compact?: boolean;
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
      className={`rounded-lg font-semibold transition disabled:opacity-30 disabled:cursor-not-allowed ${
        compact ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'
      } ${styles}`}
    >
      {children}
    </button>
  );
}

export function ActionBar({
  game,
  playerId,
  canAct = true,
  compact = false,
}: {
  game: GameState;
  playerId?: string;
  canAct?: boolean;
  compact?: boolean;
}) {
  const { selectedCardIds, stageMeldFromSelection, discardSelected } = useGameStore();

  const phase = game.turnPhase;
  const activePlayerId = playerId ?? game.players[game.currentPlayerIndex].id;
  const validation = selectionValidation(game, selectedCardIds, activePlayerId);
  const player = game.players.find((p) => p.id === activePlayerId);
  const pendingCount = player?.pendingMelds.length ?? 0;

  if (!canAct) {
    return (
      <span className={`text-white/40 ${compact ? 'text-xs' : 'text-sm'}`}>
        Warte auf deinen Zug…
      </span>
    );
  }

  return (
    <div className={`flex items-center justify-end ${compact ? 'gap-1.5' : 'gap-2 flex-wrap justify-center'}`}>
      {phase === 'draw' && (
        <span className={`text-gold-400 animate-pulse ${compact ? 'text-xs text-right leading-tight' : 'text-sm'}`}>
          {compact ? 'Karte ziehen' : 'Ziehe eine Karte (Nachziehstapel oder Ablage)'}
        </span>
      )}

      {phase === 'meld' && (
        <>
          <Btn onClick={stageMeldFromSelection} disabled={!validation} variant="primary" compact={compact}>
            {compact ? 'Per' : 'Per zur Ablage'}
          </Btn>
          {pendingCount > 0 && !compact && (
            <span className="text-xs text-white/50">
              {pendingCount} in Ablage · 0 Pkt. · Aufdecken wenn Hand leer
            </span>
          )}
          <Btn
            onClick={discardSelected}
            disabled={selectedCardIds.length !== 1}
            variant="danger"
            compact={compact}
          >
            {compact ? 'Abwerfen' : 'Abwerfen & Zug beenden'}
          </Btn>
        </>
      )}
    </div>
  );
}
