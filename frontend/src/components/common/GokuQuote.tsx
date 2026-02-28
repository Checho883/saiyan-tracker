import { motion, AnimatePresence } from 'framer-motion';
import type { Quote } from '@/types';

interface Props {
  quote: Quote | null;
  onClose: () => void;
}

export default function GokuQuote({ quote, onClose }: Props) {
  if (!quote || quote.character !== 'goku') return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-6 left-6 z-40 max-w-sm"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        <div className="bg-saiyan-card border-2 border-saiyan-orange rounded-xl p-5 shadow-lg shadow-saiyan-orange/10">
          {/* Character header */}
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              className="w-10 h-10 rounded-full bg-orange-900 flex items-center justify-center text-lg"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✊
            </motion.div>
            <div>
              <span className="text-sm font-bold text-saiyan-orange">Goku</span>
              <span className="text-xs text-saiyan-muted ml-2">
                {quote.context === 'streak' ? 'Impressed!' : quote.context === 'transformation' ? 'Amazed!' : 'Cheering'}
              </span>
            </div>
          </div>

          {/* Quote */}
          <motion.p
            className="text-saiyan-text text-sm leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            "{quote.quote_text}"
          </motion.p>

          {/* Dismiss */}
          <motion.button
            className="mt-3 text-xs text-saiyan-muted hover:text-saiyan-orange transition-colors"
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
          >
            Thanks, Goku!
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
