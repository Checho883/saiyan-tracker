import { motion, AnimatePresence } from 'framer-motion';
import type { Quote } from '@/types';

interface Props {
  quote: Quote | null;
  onClose: () => void;
}

export default function VegetaDialog({ quote, onClose }: Props) {
  if (!quote || quote.character !== 'vegeta') return null;

  const isRoast = quote.context === 'slacking';
  const borderColor = isRoast
    ? (quote.severity >= 3 ? '#FF3333' : quote.severity >= 2 ? '#FF6B00' : '#FFD700')
    : '#1E90FF';

  const moodLabel = isRoast
    ? (quote.severity >= 3 ? 'FURIOUS' : quote.severity >= 2 ? 'ANGRY' : 'Disappointed')
    : 'Respectful';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-6 right-6 z-40 max-w-sm"
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <div
          className="rounded-xl p-4 shadow-2xl relative overflow-hidden"
          style={{
            background: 'var(--bg-card)',
            border: `2px solid ${borderColor}`,
            boxShadow: `0 0 20px ${borderColor}33`,
          }}
        >
          {/* Angry glow for roasts */}
          {isRoast && quote.severity >= 2 && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at bottom right, ${borderColor}15, transparent 70%)` }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-bold"
                style={{ background: 'linear-gradient(135deg, #1E40AF, #1E90FF)', color: 'white' }}
                animate={isRoast ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 1.2, repeat: isRoast ? Infinity : 0 }}
              >
                V
              </motion.div>

              <div>
                <span className="text-sm font-bold text-saiyan-blue">Vegeta</span>
                <span className="text-xs ml-2 px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: `${borderColor}20`, color: borderColor }}>
                  {moodLabel}
                </span>
              </div>
            </div>

            <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text-primary)' }}>
              "{quote.quote_text}"
            </p>

            {quote.source_saga && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                — {quote.source_saga}
              </p>
            )}

            <button
              onClick={onClose}
              className="mt-3 text-xs transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              {isRoast ? 'Dismiss (if you dare)' : 'Acknowledged, Prince.'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
