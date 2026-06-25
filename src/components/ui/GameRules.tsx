import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, type Variants } from 'framer-motion';

const backdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
};

const panel: Variants = {
  hidden: { opacity: 0, y: 48, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 320, damping: 32, mass: 0.85 },
  },
  exit: {
    opacity: 0,
    y: 28,
    scale: 0.98,
    transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
  },
};

const list: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.055, delayChildren: 0.1 },
  },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

const section: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 420, damping: 34 },
  },
};

function RulesContent() {
  return (
    <motion.div
      className="space-y-5 text-sm text-white/80 leading-relaxed"
      variants={list}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.section variants={section}>
        <h3 className="text-gold-400 font-semibold mb-1.5">Spielziel</h3>
        <p>
          Wer als Erster alle Handkarten loswird, gewinnt die Runde. Die anderen bekommen Strafpunkte
          für übrige Karten. Nach mehreren Runden gewinnt, wer am wenigsten Strafpunkte hat.
        </p>
      </motion.section>

      <motion.section variants={section}>
        <h3 className="text-gold-400 font-semibold mb-1.5">Was ist ein Per?</h3>
        <p className="mb-2">Mindestens 3 Karten in einer dieser Formen:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong className="text-white/90">Satz:</strong> gleicher Wert, verschiedene Farben (z. B.
            7♥ 7♠ 7♦)
          </li>
          <li>
            <strong className="text-white/90">Lauf:</strong> aufeinanderfolgende Werte, gleiche Farbe
            (z. B. 5♣ 6♣ 7♣)
          </li>
        </ul>
      </motion.section>

      <motion.section variants={section}>
        <h3 className="text-gold-400 font-semibold mb-1.5">Vorbereitung</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>2–7 Spieler, 2 Decks + 4 Joker</li>
          <li>Jeder erhält 14 Karten, der Startspieler 15</li>
          <li>Die Anzeigekarte bestimmt den Tron (siehe unten)</li>
        </ul>
      </motion.section>

      <motion.section variants={section}>
        <h3 className="text-gold-400 font-semibold mb-1.5">Ein Zug</h3>
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            <strong className="text-white/90">Ziehen:</strong> 1 Karte vom Nachzieh- oder Ablagestapel
            (Startspieler mit 15 Karten überspringt dies)
          </li>
          <li>
            <strong className="text-white/90">Auslegen (optional):</strong> neue Pers legen oder an
            bestehende anlegen
          </li>
          <li>
            <strong className="text-white/90">Abwerfen:</strong> genau 1 Karte auf den Ablagestapel
          </li>
        </ol>
        <p className="mt-2 text-white/60 text-xs">
          Ist die Hand leer, gewinnst du sofort — auch ohne Abwurf in diesem Zug.
        </p>
      </motion.section>

      <motion.section variants={section}>
        <h3 className="text-gold-400 font-semibold mb-1.5">Verdeckte Ablage</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Eigene Pers kannst du verdeckt sammeln (0 Pkt. in der Ablage)</li>
          <li>Nur du siehst sie — Gegner erst, wenn deine Hand leer ist</li>
          <li>Antippen nimmt ein Per zurück in die Hand</li>
          <li>An sichtbare Pers auf dem Tisch darfst du jederzeit anlegen</li>
        </ul>
      </motion.section>

      <motion.section variants={section}>
        <h3 className="text-gold-400 font-semibold mb-1.5">Tron</h3>
        <p className="mb-2">
          Aus der Anzeigekarte ergibt sich der <strong className="text-white/90">Tron</strong> — die
          nächsthöhere Karte derselben Farbe (Ass → 2).
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Die echte Tron-Karte ist überall als Wildcard einsetzbar</li>
          <li>Joker zählt nur als exakter Tron-Slot (Farbe + Rang)</li>
        </ul>
        <p className="mt-2 text-white/60 text-xs">
          Straf-Multiplikator nach Anzeige-Farbe: ♣ ×1 · ♠ ×2 · ♥ ×3 · ♦ ×4. Sieg per Tron- oder
          Joker-Abwurf: Gegner-Strafe ×2 extra.
        </p>
      </motion.section>

      <motion.section variants={section}>
        <h3 className="text-gold-400 font-semibold mb-1.5">Strafpunkte</h3>
        <p>
          Verlierer: aus der Hand werden möglichst viele Pers gebildet; nur die Restkarten zählen.
          Summe × Farb-Multiplikator der Anzeige. Ass zählt als 1 oder 11 (vor Spielstart wählbar).
        </p>
      </motion.section>
    </motion.div>
  );
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
}

export function RulesModal({ open, onClose }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          key="rules-backdrop"
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-room-900/75 backdrop-blur-md"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            key="rules-panel"
            className="casino-panel w-full sm:max-w-lg max-h-[88vh] sm:max-h-[85vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col will-change-transform"
            variants={panel}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rules-title"
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-brass-500/15 shrink-0">
              <motion.h2
                id="rules-title"
                className="font-display text-2xl text-gold-400"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                Spielregeln
              </motion.h2>
              <motion.button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors text-xl leading-none"
                aria-label="Schließen"
                whileTap={{ scale: 0.92 }}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 500, damping: 28 }}
              >
                ×
              </motion.button>
            </div>

            <div className="rules-scroll overflow-y-auto overscroll-y-contain px-5 py-4 flex-1 min-h-0 scroll-smooth touch-pan-y">
              <RulesContent />
            </div>

            <div className="px-5 pb-5 pt-2 shrink-0 border-t border-brass-500/10">
              <motion.button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-gold-500 text-black font-bold hover:bg-gold-400 transition-colors"
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, type: 'spring', stiffness: 400, damping: 30 }}
              >
                Verstanden
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

interface Props {
  className?: string;
}

export function RulesButton({ className = '' }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        className={`rounded-lg border border-brass-500/25 bg-black/30 px-3 py-1.5 text-sm font-semibold text-brass-400 hover:text-gold-400 hover:border-brass-400/40 transition-colors ${className}`}
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      >
        Regeln
      </motion.button>
      <RulesModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
