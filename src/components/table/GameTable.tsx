import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { Hand } from '@/components/cards/Hand';
import { Opponents } from './Opponents';
import { DrawPile, DiscardPile } from './Piles';
import { MeldsArea, StagingArea } from '@/components/melds/MeldsArea';
import { IndicatorCard } from './IndicatorCard';
import { MobilePlayerStrip } from './MobilePlayerStrip';
import { MobileGameMenuButton, MobileGameSideNav } from './MobileGameSideNav';
import { Scoreboard } from './Scoreboard';
import { ActionBar } from '@/components/ui/ActionBar';
import { RulesButton, RulesModal } from '@/components/ui/GameRules';
import { indicatorPenaltyMultiplier } from '@/engine/tron';

export function GameTable() {
  const game = useGameStore((s) => s.game)!;
  const mode = useGameStore((s) => s.mode);
  const localPlayerId = useGameStore((s) => s.localPlayerId);
  const isMyTurn = useGameStore((s) => s.isMyTurn);
  const isHost = useGameStore((s) => s.isHost);
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

  const isOnline = mode === 'online';
  const localPlayer =
    isOnline && localPlayerId
      ? game.players.find((p) => p.id === localPlayerId)
      : game.players[game.currentPlayerIndex];
  const currentTurnPlayer = game.players[game.currentPlayerIndex];

  if (!localPlayer) return null;

  const opponents = game.players.filter((p) => p.id !== localPlayer.id);
  const playerNames = Object.fromEntries(game.players.map((p) => [p.id, p.name]));

  const [handoffFor, setHandoffFor] = useState<string | null>(
    () => (!isOnline ? game.players[game.currentPlayerIndex].id : null),
  );
  const [shownIndex, setShownIndex] = useState(game.currentPlayerIndex);
  const [roundInfoOpen, setRoundInfoOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (isOnline) {
      setHandoffFor(null);
      return;
    }
    setHandoffFor(game.players[game.currentPlayerIndex].id);
    setShownIndex(game.currentPlayerIndex);
  }, [game.id, isOnline]);

  useEffect(() => {
    if (isOnline) return;
    if (game.currentPlayerIndex !== shownIndex && game.status === 'playing') {
      setHandoffFor(game.players[game.currentPlayerIndex].id);
      setShownIndex(game.currentPlayerIndex);
    }
  }, [game.currentPlayerIndex, game.status, game.players, shownIndex, isOnline]);

  const handCards = localPlayer.hand;
  const canAct = !isOnline || isMyTurn;
  const isMobile = useMediaQuery('(max-width: 639px)');

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
    <div className="casino-room relative flex h-full w-full flex-col overflow-hidden">
      {isMobile ? (
        <div className="relative z-[60] shrink-0">
          <div className="flex items-center gap-2 px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-0.5">
            <div className="h-8 w-8 shrink-0" aria-hidden />
            <div className="min-w-0 flex-1 text-center">
              <p className="text-[10px] font-semibold tracking-wide text-brass-400">
                Runde {game.roundNumber} / {game.settings.totalRounds}
              </p>
              <p
                className={`truncate text-[10px] ${
                  canAct && game.status === 'playing' ? 'text-gold-400' : 'text-white/55'
                }`}
              >
                {canAct && game.status === 'playing'
                  ? 'Du bist am Zug'
                  : `${currentTurnPlayer.name} ist am Zug`}
              </p>
            </div>
            <MobileGameMenuButton onOpen={() => setMenuOpen(true)} />
          </div>
          <MobilePlayerStrip
            players={game.players}
            currentPlayerId={currentTurnPlayer.id}
            localPlayerId={localPlayer.id}
          />
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={exitToMenu}
            className="absolute top-3 left-3 z-[60] px-3 py-1.5 rounded-lg text-sm font-semibold casino-chip text-white/80 hover:text-white hover:border-brass-400/40 transition"
          >
            Verlassen
          </button>
          <RulesButton className="absolute top-12 left-3 z-[60]" />
          <Scoreboard players={game.players} currentPlayerId={localPlayer.id} />
        </>
      )}
      <div className={isMobile ? 'casino-table casino-table--mobile-play min-h-0 flex-1' : 'casino-table min-h-0 flex-1'}>
        <div className="relative z-10 flex flex-col items-center shrink-0 px-2 sm:px-0 sm:pt-4 sm:gap-3">
          {!isMobile && (
            <span className="casino-chip px-3 py-1 text-xs text-brass-400 font-semibold tracking-wide">
              Runde {game.roundNumber} / {game.settings.totalRounds}
            </span>
          )}
          {!isMobile && isOnline && !isMyTurn && game.status === 'playing' && (
            <span className="text-sm text-gold-400 animate-pulse text-center px-2">
              {currentTurnPlayer.name} ist am Zug…
            </span>
          )}
          {!isMobile && <IndicatorCard indicatorCard={game.indicatorCard} tron={game.tron} />}
          {!isMobile && (
            <Opponents
              opponents={opponents}
              currentPlayerId={currentTurnPlayer.id}
            />
          )}
        </div>

        <div
          className={`casino-play-area relative z-10 flex min-h-0 flex-1 ${
            isMobile ? 'px-2 py-1' : 'px-4 sm:px-6 py-3'
          }`}
        >
          <div className="casino-rail flex-1 min-h-0">
            <div className="casino-felt casino-spotlight relative w-full h-full min-h-0">
              <div className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 z-20">
                <DrawPile
                  drawCount={game.drawPile.length}
                  canDraw={canAct && game.turnPhase === 'draw'}
                  onDrawStock={() => dispatch({ type: 'DRAW_STOCK' })}
                  compact={isMobile}
                />
              </div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <DiscardPile
                  discardTop={game.discardPile.at(-1) ?? null}
                  tron={game.tron}
                  canDraw={canAct && game.turnPhase === 'draw'}
                  onDrawDiscard={() => dispatch({ type: 'DRAW_DISCARD' })}
                  centered
                  compact={isMobile}
                />
              </div>
              <MeldsArea
                melds={game.melds}
                tron={game.tron}
                playerNames={playerNames}
                canAppend={canAct && game.turnPhase === 'meld' && selectedCardIds.length > 0}
                onMeldClick={appendSelectionToMeld}
                compact={isMobile}
              />
            </div>
          </div>
        </div>

        {game.turnPhase === 'meld' && localPlayer.pendingMelds.length > 0 && (
          <div
            className={`relative z-10 shrink-0 ${
              isMobile
                ? 'mobile-staging-dock fixed left-0 right-0 z-40 px-2'
                : 'px-4 sm:px-6 pb-1'
            }`}
          >
            <StagingArea
              pendingMelds={localPlayer.pendingMelds}
              tron={game.tron}
              onUnstage={canAct ? unstagePendingMeld : () => {}}
              compact={isMobile}
            />
          </div>
        )}

        {isMobile ? (
          <div className="mobile-game-chrome">
            <div className="game-hand-dock casino-leather min-w-0">
              <div className="flex min-w-0 items-center gap-2 px-2 pt-1.5">
                <div className="max-w-[28%] shrink-0 min-w-0">
                  <span className="block truncate text-xs font-semibold text-brass-400">
                    {localPlayer.name}
                  </span>
                  <span className="casino-label text-[9px]">{handCards.length} Karten</span>
                </div>
                <div className="flex min-w-0 flex-1 justify-end">
                  <ActionBar
                    game={game}
                    playerId={localPlayer.id}
                    canAct={canAct}
                    compact
                  />
                </div>
              </div>
              <Hand
                cards={handCards}
                tron={game.tron}
                selectedIds={selectedCardIds}
                onToggle={canAct ? toggleSelect : () => {}}
                onReorder={canAct ? reorderHand : () => {}}
                compact
              />
            </div>
          </div>
        ) : (
          <div className="game-hand-dock casino-leather relative z-10 shrink-0 min-w-0">
            <div className="flex items-center justify-between gap-2 px-4 sm:px-6 pt-2">
              <span className="shrink-0 font-semibold text-brass-400">{localPlayer.name}</span>
              <ActionBar game={game} playerId={localPlayer.id} canAct={canAct} />
              <span className="casino-label shrink-0">{handCards.length} Karten</span>
            </div>
            <Hand
              cards={handCards}
              tron={game.tron}
              selectedIds={selectedCardIds}
              onToggle={canAct ? toggleSelect : () => {}}
              onReorder={canAct ? reorderHand : () => {}}
            />
          </div>
        )}
      </div>

      <MobileGameSideNav
        open={isMobile && menuOpen}
        onClose={() => setMenuOpen(false)}
        roundLabel={`Runde ${game.roundNumber} / ${game.settings.totalRounds}`}
        turnLabel={
          canAct && game.status === 'playing'
            ? 'Du bist am Zug'
            : `${currentTurnPlayer.name} ist am Zug`
        }
        onRoundInfo={() => setRoundInfoOpen(true)}
        onRules={() => setRulesOpen(true)}
        onLeave={exitToMenu}
      />

      <RulesModal open={isMobile && rulesOpen} onClose={() => setRulesOpen(false)} />

      <AnimatePresence>
        {isMobile && roundInfoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-end justify-center bg-room-900/70 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-sm"
            onClick={() => setRoundInfoOpen(false)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 18, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              className="w-full max-w-sm casino-panel rounded-2xl p-3 shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Rundeninfo"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl text-gold-400">Rundeninfo</h2>
                  <p className="text-xs text-white/45">Anzeige, Tron, Joker und Strafmultiplikator</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRoundInfoOpen(false)}
                  className="h-8 w-8 rounded-lg bg-white/10 text-lg leading-none text-white/65 hover:bg-white/20 hover:text-white"
                  aria-label="Rundeninfo schließen"
                >
                  ×
                </button>
              </div>
              <IndicatorCard indicatorCard={game.indicatorCard} tron={game.tron} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOnline && handoffFor && game.status === 'playing' && (
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
            {handoffFor === localPlayer.id &&
              localPlayer.hand.length === 15 &&
              game.turnPhase === 'meld' && (
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
                  disabled={isOnline && !isHost}
                  className="px-8 py-3 rounded-xl bg-gold-500 text-black font-bold hover:bg-gold-400 transition shadow-lg shadow-gold-500/25 disabled:opacity-40"
                >
                  {isOnline && !isHost
                    ? 'Warte auf Host…'
                    : `Nächste Runde (${game.roundNumber + 1}/${game.settings.totalRounds})`}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
