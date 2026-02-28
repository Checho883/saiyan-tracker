import { motion, AnimatePresence } from 'framer-motion';
import type { Quote } from '@/types';

interface Props {
  quote: Quote | null;
  onClose: () => void;
}

export default function GokuQuote({ quote, onClose }: Props) {
  if (!quote || (quote.character !== 'goku' && quote.character !== 'gohan')) return null;

  const contextLabel =
    quote.context === 'streak' ? 'Impressed!' :
    quote.context === 'transformation' ? 'AMAZING!' :
    quote.context === 'all_complete' ? 'PERFECT DAY!' :
    quote.context === 'task_complete' ? 'Nice one!' :
    'Keep going!';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-16 left-1/2 z-40 w-full max-w-lg px-4"
        style={{ transform: 'translateX(-50%)' }}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1, x: '-50%' }}
        exit={{ y: -80, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <div
          className="rounded-xl p-4 shadow-2xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.15), rgba(255, 215, 0, 0.1))',
            border: '1px solid rgba(255, 107, 0, 0.3)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(255, 165, 0, 0.3), transparent 70%)' }}
          />

          <div className="relative z-10 flex items-start gap-3">
            {/* Goku avatar */}
            <motion.div
              className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-bold"
              style={{ background: 'linear-gradient(135deg, #FF6B00, #FFD700)', color: 'white' }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              G
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-saiyan-orange">Goku</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: 'rgba(255, 107, 0, 0.2)', color: '#FFB366' }}>
                  {contextLabel}
                </span>
              </div>

              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                "{quote.quote_text}"
              </p>

              {quote.source_saga && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  — {quote.source_saga}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="text-xs px-2 py-1 rounded-lg transition-colors flex-shrink-0"
              style={{ color: 'var(--text-muted)' }}
            >
              ✕
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
