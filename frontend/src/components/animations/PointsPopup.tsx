import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

interface Props {
  points: number | null;
}

export default function PointsPopup({ points }: Props) {
  return (
    <AnimatePresence>
      {points !== null && (
        <motion.div
          className="fixed top-1/3 left-1/2 z-40 pointer-events-none"
          initial={{ opacity: 1, y: 0, x: '-50%', scale: 0.5 }}
          animate={{ opacity: 0, y: -120, scale: 1.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
        >
          <div className="flex items-center gap-2 text-saiyan-orange font-bold text-3xl"
               style={{ fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 20px rgba(255, 107, 0, 0.5)' }}>
            <Zap size={28} />
            +{points}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
