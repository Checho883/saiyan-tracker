import { useRef, useCallback } from 'react';
import { motion } from 'motion/react';

interface ParticleBurstProps {
  count?: number;
  origin: { x: number; y: number };
  color?: string;
  onComplete?: () => void;
}

/**
 * DOM-based particle burst using 10-20 motion.divs with radial trajectories.
 * Each particle fades and shrinks as it moves outward from origin.
 */
export function ParticleBurst({
  count = 15,
  origin,
  color = 'bg-warning',
  onComplete,
}: ParticleBurstProps) {
  const completedRef = useRef(0);

  const handleParticleComplete = useCallback(() => {
    completedRef.current += 1;
    if (completedRef.current >= count && onComplete) {
      onComplete();
    }
  }, [count, onComplete]);

  const particles = Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const distance = 60 + Math.random() * 80;
    const size = 4 + Math.random() * 6;

    return { id: i, angle, distance, size };
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-50" data-testid="particle-burst">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${color}`}
          style={{
            width: p.size,
            height: p.size,
            left: origin.x,
            top: origin.y,
          }}
          initial={{ scale: 1, opacity: 1 }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance,
            scale: 0,
            opacity: 0,
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          onAnimationComplete={handleParticleComplete}
        />
      ))}
    </div>
  );
}
