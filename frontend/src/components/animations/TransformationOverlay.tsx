import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { SPRINGS } from './springs';
import { useSkippable } from './useSkippable';
import { SaiyanAvatar } from '../dashboard/SaiyanAvatar';

interface TransformConfig {
  gradient: string;
  flash: string;
  label: string;
}

const formConfigs: Record<string, TransformConfig> = {
  ssj: {
    gradient: 'from-yellow-500/80 to-yellow-300/40',
    flash: 'bg-yellow-300',
    label: 'SUPER SAIYAN!',
  },
  ssj2: {
    gradient: 'from-yellow-500/80 to-blue-400/40',
    flash: 'bg-yellow-200',
    label: 'SUPER SAIYAN 2!',
  },
  ssg: {
    gradient: 'from-red-600/80 to-red-400/40',
    flash: 'bg-red-400',
    label: 'SUPER SAIYAN GOD!',
  },
  ssb: {
    gradient: 'from-blue-600/80 to-cyan-400/40',
    flash: 'bg-blue-400',
    label: 'SUPER SAIYAN BLUE!',
  },
  ui: {
    gradient: 'from-gray-400/80 to-white/40',
    flash: 'bg-gray-200',
    label: 'ULTRA INSTINCT!',
  },
};

const defaultConfig: TransformConfig = {
  gradient: 'from-saiyan-500/80 to-saiyan-300/40',
  flash: 'bg-saiyan-300',
  label: 'TRANSFORMATION!',
};

interface TransformationOverlayProps {
  form: string;
  name: string;
  onComplete: () => void;
}

/**
 * Transformation unlock overlay with form-specific visual.
 * Flash -> gradient -> avatar scales in -> form name text -> fadeout
 * Tap-to-skip after 1s.
 */
export function TransformationOverlay({
  form,
  name,
  onComplete,
}: TransformationOverlayProps) {
  const config = formConfigs[form] || defaultConfig;
  const [phase, setPhase] = useState(0);
  const { skip } = useSkippable(1000, onComplete);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),  // gradient
      setTimeout(() => setPhase(2), 500),  // avatar
      setTimeout(() => setPhase(3), 800),  // text
      setTimeout(() => onComplete(), 2000), // auto-complete
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      onClick={skip}
      data-testid="transformation-overlay"
      data-form={form}
    >
      {/* Initial flash */}
      <motion.div
        className={`absolute inset-0 ${config.flash}`}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      />

      {/* Gradient background */}
      {phase >= 1 && (
        <motion.div
          className={`absolute inset-0 bg-gradient-radial ${config.gradient}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Avatar */}
        {phase >= 2 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={SPRINGS.bouncy}
          >
            <SaiyanAvatar transformation={form} className="w-32 h-32" />
          </motion.div>
        )}

        {/* Form name */}
        {phase >= 3 && (
          <motion.div
            className="text-3xl font-black text-white drop-shadow-lg text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={SPRINGS.snappy}
            data-testid="transformation-name"
          >
            {config.label}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
