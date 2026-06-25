import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

function BurgerIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

interface MenuItemProps {
  label: string;
  hint?: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

function MenuItem({ label, hint, onClick, variant = 'default' }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left transition ${
        variant === 'danger'
          ? 'border-rose-500/25 bg-rose-950/30 text-rose-300 hover:bg-rose-950/50'
          : 'border-white/10 bg-white/5 text-white/85 hover:border-brass-400/35 hover:bg-white/10'
      }`}
    >
      <span className="text-sm font-semibold">{label}</span>
      {hint && <span className="text-xs text-white/40">{hint}</span>}
    </button>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  roundLabel: string;
  turnLabel: string;
  onRoundInfo: () => void;
  onRules: () => void;
  onLeave: () => void;
}

export function MobileGameMenuButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg casino-chip text-brass-400 hover:text-gold-400"
      aria-label="Menü öffnen"
    >
      <BurgerIcon />
    </button>
  );
}

export function MobileGameSideNav({
  open,
  onClose,
  roundLabel,
  turnLabel,
  onRoundInfo,
  onRules,
  onLeave,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const pick =
    (action: () => void) =>
    () => {
      onClose();
      action();
    };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-room-900/70 backdrop-blur-sm"
            aria-label="Menü schließen"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            className="mobile-side-nav fixed right-0 top-0 z-[85] flex h-full w-[min(17rem,82vw)] flex-col casino-panel border-l border-brass-500/25 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Spielmenü"
          >
            <div className="flex items-center justify-between border-b border-brass-500/15 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <div>
                <h2 className="font-display text-lg text-gold-400">Menü</h2>
                <p className="text-[10px] text-white/45">{roundLabel}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-lg leading-none text-white/65 hover:bg-white/20"
                aria-label="Menü schließen"
              >
                ×
              </button>
            </div>

            <p className="px-4 py-2 text-xs text-gold-400/90">{turnLabel}</p>

            <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 pb-4">
              <MenuItem label="Rundeninfo" hint="Anzeige & Tron" onClick={pick(onRoundInfo)} />
              <MenuItem label="Spielregeln" onClick={pick(onRules)} />
            </nav>

            <div className="border-t border-brass-500/15 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <MenuItem label="Spiel verlassen" onClick={pick(onLeave)} variant="danger" />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
