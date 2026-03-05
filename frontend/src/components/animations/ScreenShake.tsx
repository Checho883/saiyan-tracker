import { useEffect, type ReactNode } from 'react';
import { motion, useAnimation } from 'motion/react';

interface ScreenShakeProps {
  children: ReactNode;
  trigger: boolean;
}

/**
 * Wraps children in a container that applies a CSS transform shake
 * (2-4px displacement, ~250ms) when trigger becomes true.
 */
export function ScreenShake({ children, trigger }: ScreenShakeProps) {
  const controls = useAnimation();

  useEffect(() => {
    if (trigger) {
      controls.start({
        x: [-3, 3, -3, 3, -2, 2, 0],
        y: [-2, 2, -1, 1, 0],
        transition: { duration: 0.25 },
      });
    }
  }, [trigger, controls]);

  return (
    <motion.div animate={controls} style={{ willChange: 'transform' }}>
      {children}
    </motion.div>
  );
}
