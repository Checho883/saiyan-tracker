import { motion, AnimatePresence } from 'framer-motion';
import { TRANSFORMATION_COLORS, TRANSFORMATION_NAMES } from '@/types';
import type { TransformationLevel } from '@/types';

interface Props {
  level: TransformationLevel;
  name: string;
  show: boolean;
  onClose: () => void;
}

export default function TransformationAnimation({ level, name, show, onClose }: Props) {
  const color = TRANSFORMATION_COLORS[level];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Background flash */}
          <motion.div
            className="absolute inset-0"
            initial={{ backgroundColor: 'rgba(0,0,0,0)' }}
            animate={{
              backgroundColor: [
                'rgba(0,0,0,0)',
                `${color}30`,
                'rgba(255,255,255,0.8)',
                `${color}20`,
                'rgba(0,0,0,0.9)',
              ],
            }}
            transition={{ duration: 2, times: [0, 0.2, 0.4, 0.6, 1] }}
          />

          {/* Content */}
          <motion.div
            className="relative z-10 text-center"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 1] }}
            transition={{ duration: 1.5, times: [0, 0.5, 1] }}
          >
            {/* Aura ring */}
            <motion.div
              className="w-48 h-48 mx-auto rounded-full mb-6 flex items-center justify-center"
              style={{ border: `3px solid ${color}` }}
              animate={{
                boxShadow: [
                  `0 0 20px ${color}40`,
                  `0 0 60px ${color}80`,
                  `0 0 100px ${color}`,
                  `0 0 60px ${color}80`,
                  `0 0 20px ${color}40`,
                ],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {/* Character silhouette */}
              <motion.div
                className="text-7xl"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {level === 'base' ? '🧍' : level === 'ui' ? '👁️' : '⚡'}
              </motion.div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <motion.p
                className="text-lg uppercase tracking-[0.3em] mb-2"
                style={{ color: color + 'CC' }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                New Form Unlocked
              </motion.p>
              <motion.h1
                className="text-4xl font-bold"
                style={{ color, fontFamily: 'Orbitron, sans-serif' }}
                initial={{ letterSpacing: '0.5em', opacity: 0 }}
                animate={{ letterSpacing: '0.1em', opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                {name}
              </motion.h1>
            </motion.div>

            {/* Particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{ backgroundColor: color, left: '50%', top: '50%' }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos((i / 12) * Math.PI * 2) * 200,
                  y: Math.sin((i / 12) * Math.PI * 2) * 200,
                  opacity: 0,
                  scale: [1, 2, 0],
                }}
                transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatDelay: 1 }}
              />
            ))}

            <motion.p
              className="text-saiyan-muted text-sm mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              Click anywhere to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
