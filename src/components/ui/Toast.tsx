import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  toast: { id: number; message: string; kind: 'error' | 'info' } | null;
}

export function Toast({ toast }: Props) {
  return (
    <div className="pointer-events-none fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: -30, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className={`px-4 py-2 rounded-lg shadow-xl text-sm font-medium ${
              toast.kind === 'error'
                ? 'bg-rose-600 text-white'
                : 'casino-panel text-white border border-brass-400/40'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
