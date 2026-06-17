import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Hand } from '@/components/cards/Hand';
import { Opponents } from './Opponents';
import { DrawPile, DiscardPile } from './Piles';
import { MeldsArea, StagingArea } from '@/components/melds/MeldsArea';
import { IndicatorCard } from './IndicatorCard';
import { Scoreboard } from './Scoreboard';
import { ActionBar } from '@/components/ui/ActionBar';
import { RulesButton } from '@/components/ui/GameRules';
import { indicatorPenaltyMultiplier } from '@/engine/tron';

export function GameTable() {
  const game = useGameStore((s) => s.game)!;
  const selectedCardIds = useGameStore((s) => s.selectedCardIds);
  const {
    dispatch,
    toggleSelect,
    reorderHand,
    appendSelectionToMeld,
    unstagePendingMeld,
    nextRound,
    exitToMenu,
  } = useGameStore();

  const player = game.players[game.currentPlayerIndex];
  const opponents = game.players.filter((_, i) => i !== game.currentPlayerIndex);
  const playerNames = Object.fromEntries(game.players.map((p) => [p.id, p.name]));

  const [handoffFor, setHandoffFor] = useState<string | null>(
    () => game.players[game.currentPlayerIndex].id,
  );
  const [shownIndex, setShownIndex] = useState(game.currentPlayerIndex);

  useEffect(() => {
    setHandoffFor(game.players[game.currentPlayerIndex].id);
    setShownIndex(game.currentPlayerIndex);
  }, [game.id]);

  useEffect(() => {
    if (game.currentPlayerIndex !== shownIndex && game.status === 'playing') {
      setHandoffFor(game.players[game.currentPlayerIndex].id);
      setShownIndex(game.currentPlayerIndex);
    }
  }, [game.currentPlayerIndex, game.status, game.players, shownIndex]);

  const handCards = player.hand;

  const winner = game.status === 'finished' ? game.players.find((p) => p.id === game.winnerId) : null;
  const suitMult = indicatorPenaltyMultiplier(game.indicatorCard);
  const isLastRound = game.roundNumber >= game.settings.totalRounds;
  const matchWinners =
    winner && isLastRound
      ? (() => {
          const minScore = Math.min(...game.players.map((p) => p.score));
          return game.players.filter((p) => p.score === minScore);
        })()
      : [];

  return (
    <div className="casino-room relative w-full h-full overflow-hidden">
      <button
        type="button"
        onClick={exitToMenu}
        className="absolute top-3 left-3 z-[60] px-3 py-1.5 rounded-lg text-sm font-semibold casino-chip text-white/80 hover:text-white hover:border-brass-400/40 transition"
      >
        Verlassen
      </button>
      <RulesButton className="absolute top-12 left-3 z-[60]" />
      <Scoreboard players={game.players} currentPlayerId={player.id} />
      <div className="casino-table">
        <div className="relative z-10 pt-4 flex flex-col items-center gap-3 shrink-0">
          <span className="casino-chip px-3 py-1 text-xs text-brass-400 font-semibold tracking-wide">
            Runde {game.roundNumber} / {game.settings.totalRounds}
          </span>
          <IndicatorCard indicatorCard={game.indicatorCard} tron={game.tron} />
          <Opponents opponents={opponents} currentPlayerId={player.id} />
        </div>

        <div className="relative z-10 flex-1 flex px-4 sm:px-6 py-3 min-h-0">
          <div className="casino-rail flex-1 min-h-0">
            <div className="casino-felt casino-spotlight relative w-full h-full min-h-0">
              <div className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20">
                <DrawPile
                  drawCount={game.drawPile.length}
                  canDraw={game.turnPhase === 'draw'}
                  onDrawStock={() => dispatch({ type: 'DRAW_STOCK' })}
                />
              </div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <DiscardPile
                  discardTop={game.discardPile.at(-1) ?? null}
                  tron={game.tron}
                  canDraw={game.turnPhase === 'draw'}
                  onDrawDiscard={() => dispatch({ type: 'DRAW_DISCARD' })}
                  centered
                />
              </div>
              <MeldsArea
                melds={game.melds}
                tron={game.tron}
                playerNames={playerNames}
                canAppend={game.turnPhase === 'meld' && selectedCardIds.length > 0}
                onMeldClick={appendSelectionToMeld}
              />
            </div>
          </div>
        </div>

        {game.turnPhase === 'meld' && (
          <div className="relative z-10 px-4 sm:px-6 pb-1 shrink-0">
            <StagingArea
              pendingMelds={player.pendingMelds}
              tron={game.tron}
              onUnstage={unstagePendingMeld}
            />
          </div>
        )}

        <div className="relative z-10 casino-leather shrink-0 min-w-0">
          <div className="flex items-center justify-between px-4 sm:px-6 pt-2 gap-2">
            <span className="text-brass-400 font-semibold shrink-0">{player.name}</span>
            <ActionBar game={game} />
            <span className="casino-label shrink-0">{handCards.length} Karten</span>
          </div>
          <Hand
            cards={handCards}
            tron={game.tron}
            selectedIds={selectedCardIds}
            onToggle={toggleSelect}
            onReorder={reorderHand}
          />
        </div>
      </div>

      <AnimatePresence>
        {handoffFor && game.status === 'playing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-room-900/95 flex flex-col items-center justify-center gap-5"
          >
            <p className="text-white/60">Gib das Gerät weiter an</p>
            <h2 className="font-display text-5xl text-gold-400">
              {game.players.find((p) => p.id === handoffFor)?.name}
            </h2>
            {handoffFor === player.id && player.hand.length === 15 && game.turnPhase === 'meld' && (
              <p className="text-white/70 text-sm">Du beginnst mit 15 Karten – lege eine ab.</p>
            )}
            <button
              type="button"
              onClick={() => setHandoffFor(null)}
              className="px-8 py-3 rounded-xl bg-gold-500 text-black font-bold text-lg hover:bg-gold-400 transition shadow-lg shadow-gold-500/25"
            >
              Bereit
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-room-900/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="casino-panel rounded-2xl p-8 text-center"
            >
              <div className="text-6xl mb-2">{isLastRound ? '🎉' : '🏆'}</div>
              {isLastRound ? (
                <>
                  <h2 className="font-display text-4xl text-gold-400 mb-1">Spiel beendet</h2>
                  <p className="text-white/60 text-sm mb-4">
                    Nach {game.settings.totalRounds} Runde{game.settings.totalRounds === 1 ? '' : 'n'}
                  </p>
                  <p className="text-emerald-400 font-semibold mb-4">
                    Gesamtsieger: {matchWinners.map((p) => p.name).join(', ')}
                    <span className="text-white/50 font-normal text-sm block mt-1">
                      ({matchWinners[0]?.score ?? 0} Strafpunkte gesamt)
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <h2 className="font-display text-5xl text-gold-400 mb-2">{winner?.name} gewinnt!</h2>
                  <p className="text-white/50 text-sm mb-1">
                    Runde {game.roundNumber} von {game.settings.totalRounds}
                  </p>
                  <p className="text-white/50 text-sm mb-4">
                    Straf-Multiplikator dieser Runde: ×{suitMult} (Anzeige)
                  </p>
                </>
              )}
              <div className="bg-black/40 rounded-xl p-4 mb-5 min-w-[260px] border border-brass-500/20">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2 text-left">
                  Strafpunkte gesamt
                </p>
                {game.players.map((p) => (
                  <div key={p.id} className="flex justify-between text-white/80 py-0.5">
                    <span>
                      {p.name}
                      {isLastRound && matchWinners.some((w) => w.id === p.id) && (
                        <span className="text-emerald-400 text-xs ml-1">★</span>
                      )}
                    </span>
                    <span
                      className={
                        p.id === winner?.id && !isLastRound
                          ? 'text-emerald-400'
                          : isLastRound && matchWinners.some((w) => w.id === p.id)
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                      }
                    >
                      {p.id === winner?.id && !isLastRound ? 'Sieg' : `${p.score} Pkt.`}
                    </span>
                  </div>
                ))}
              </div>
              {isLastRound ? (
                <button
                  type="button"
                  onClick={exitToMenu}
                  className="px-8 py-3 rounded-xl bg-gold-500 text-black font-bold hover:bg-gold-400 transition shadow-lg shadow-gold-500/25"
                >
                  Neues Spiel
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextRound}
                  className="px-8 py-3 rounded-xl bg-gold-500 text-black font-bold hover:bg-gold-400 transition shadow-lg shadow-gold-500/25"
                >
                  Nächste Runde ({game.roundNumber + 1}/{game.settings.totalRounds})
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
