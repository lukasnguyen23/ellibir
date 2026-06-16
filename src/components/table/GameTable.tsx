import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Hand } from '@/components/cards/Hand';
import { Opponents } from './Opponents';
import { Piles } from './Piles';
import { MeldsArea, TrayArea } from '@/components/melds/MeldsArea';
import { IndicatorCard } from './IndicatorCard';
import { ActionBar } from '@/components/ui/ActionBar';
import { indicatorPenaltyMultiplier } from '@/engine/tron';

export function GameTable() {
  const game = useGameStore((s) => s.game)!;
  const selectedCardIds = useGameStore((s) => s.selectedCardIds);
  const trayGroups = useGameStore((s) => s.trayGroups);
  const {
    dispatch,
    toggleSelect,
    reorderHand,
    appendSelectionToMeld,
    removeTrayGroup,
    newGame,
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

  const inTrayIds = new Set(trayGroups.flatMap((g) => g.cards.map((c) => c.id)));
  const handCards = player.hand.filter((c) => !inTrayIds.has(c.id));

  const winner = game.status === 'finished' ? game.players.find((p) => p.id === game.winnerId) : null;
  const suitMult = indicatorPenaltyMultiplier(game.indicatorCard);

  return (
    <div className="table-felt relative w-full h-full flex flex-col overflow-hidden">
      <div className="relative z-10 pt-4 flex flex-col items-center gap-3">
        <IndicatorCard indicatorCard={game.indicatorCard} tron={game.tron} />
        <Opponents opponents={opponents} currentPlayerId={player.id} />
      </div>

      <div className="relative z-10 flex-1 flex items-stretch gap-4 px-6 py-3 min-h-0">
        <div className="flex items-center">
          <Piles
            drawCount={game.drawPile.length}
            discardTop={game.discardPile.at(-1) ?? null}
            tron={game.tron}
            canDraw={game.turnPhase === 'draw'}
            onDrawStock={() => dispatch({ type: 'DRAW_STOCK' })}
            onDrawDiscard={() => dispatch({ type: 'DRAW_DISCARD' })}
          />
        </div>
        <div className="flex-1 rounded-2xl bg-black/15 border border-white/5 flex min-h-0">
          <MeldsArea
            melds={game.melds}
            tron={game.tron}
            playerNames={playerNames}
            canAppend={game.turnPhase === 'meld' && player.hasOpened && selectedCardIds.length > 0}
            onMeldClick={appendSelectionToMeld}
          />
        </div>
      </div>

      <div className="relative z-10 px-6 pb-1">
        {game.turnPhase === 'meld' && !player.hasOpened && (
          <TrayArea
            groups={trayGroups}
            tron={game.tron}
            onRemove={removeTrayGroup}
          />
        )}
      </div>

      <div className="relative z-10 bg-black/30 border-t border-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 pt-2">
          <span className="text-gold-400 font-semibold">
            {player.name}
            {player.hasOpened ? ' · eröffnet' : ' · noch nicht eröffnet'}
          </span>
          <ActionBar game={game} />
          <span className="text-white/50 text-sm">{handCards.length} Karten</span>
        </div>
        <Hand
          cards={handCards}
          tron={game.tron}
          selectedIds={selectedCardIds}
          onToggle={toggleSelect}
          onReorder={reorderHand}
        />
      </div>

      <AnimatePresence>
        {handoffFor && game.status === 'playing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-felt-900/95 flex flex-col items-center justify-center gap-5"
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
              className="px-8 py-3 rounded-xl bg-gold-500 text-black font-bold text-lg hover:bg-gold-400 transition"
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
            className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="text-center"
            >
              <div className="text-6xl mb-2">🏆</div>
              <h2 className="font-display text-5xl text-gold-400 mb-2">{winner.name} gewinnt!</h2>
              <p className="text-white/50 text-sm mb-4">
                Straf-Multiplikator dieser Runde: ×{suitMult} (Anzeige)
              </p>
              <div className="bg-black/40 rounded-xl p-4 mb-5 min-w-[260px]">
                {game.players.map((p) => (
                  <div key={p.id} className="flex justify-between text-white/80 py-0.5">
                    <span>{p.name}</span>
                    <span className={p.id === winner.id ? 'text-emerald-400' : 'text-rose-400'}>
                      {p.id === winner.id ? 'Sieg' : `${p.score} Strafpunkte`}
                    </span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  newGame(
                    game.players.map((p) => ({ id: p.id, name: p.name })),
                    { aceValue: game.settings.aceValue },
                  )
                }
                className="px-8 py-3 rounded-xl bg-gold-500 text-black font-bold hover:bg-gold-400 transition"
              >
                Neue Runde
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
