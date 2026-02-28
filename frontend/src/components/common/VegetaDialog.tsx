import { motion, AnimatePresence } from 'framer-motion';
import type { Quote } from '@/types';

interface Props {
  quote: Quote | null;
  onClose: () => void;
}

export default function VegetaDialog({ quote, onClose }: Props) {
  if (!quote || quote.character !== 'vegeta') return null;

  const severityBorder = quote.severity >= 3 ? 'border-red-500' : quote.severity >= 2 ? 'border-orange-500' : 'border-yellow-500';
  const severityGlow = quote.severity >= 3 ? 'shadow-red-500/30' : quote.severity >= 2 ? 'shadow-orange-500/20' : 'shadow-yellow-500/10';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-6 right-6 z-40 max-w-sm"
        initial={{ x: 300, opacity: 0, rotate: 5 }}
        animate={{ x: 0, opacity: 1, rotate: 0 }}
        exit={{ x: 300, opacity: 0 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        <div className={`bg-saiyan-card border-2 ${severityBorder} rounded-xl p-5 shadow-lg ${severityGlow}`}>
          {/* Character header */}
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-lg"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              👑
            </motion.div>
            <div>
              <span className="text-sm font-bold text-blue-400">Vegeta</span>
              <span className="text-xs text-saiyan-muted ml-2">
                {quote.severity >= 3 ? 'Furious' : quote.severity >= 2 ? 'Angry' : 'Disappointed'}
              </span>
            </div>
          </div>

          {/* Quote */}
          <motion.p
            className="text-saiyan-text text-sm leading-relaxed italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            "{quote.quote_text}"
          </motion.p>

          {/* Dismiss */}
          <motion.button
            className="mt-3 text-xs text-saiyan-muted hover:text-saiyan-text transition-colors"
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
          >
            Dismiss (if you dare)
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
