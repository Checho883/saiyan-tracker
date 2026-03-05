import { useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useUiStore } from '../../store/uiStore';
import type { AnimationEvent } from '../../store/uiStore';

/** Event types that are queued (full-screen overlays). Others are inline. */
const QUEUED_TYPES = new Set([
  'perfect_day',
  'capsule_drop',
  'dragon_ball',
  'transformation',
  'shenron',
]);

/**
 * Root-level queue consumer. Mounts at app root (AppShell).
 * Renders one animation overlay at a time using AnimatePresence mode="wait".
 * Dequeues only after the current overlay's exit animation completes.
 */
export function AnimationPlayer() {
  const queue = useUiStore((s) => s.animationQueue);
  const dequeueAnimation = useUiStore((s) => s.dequeueAnimation);
  const queueIdRef = useRef(0);
  const [isDone, setIsDone] = useState(false);

  // Find first queued (non-inline) event
  const current = queue.find((e) => QUEUED_TYPES.has(e.type)) ?? null;

  // When overlay signals completion, trigger exit animation
  const handleComplete = useCallback(() => {
    setIsDone(true);
  }, []);

  // After exit animation finishes, dequeue and reset
  const handleExitComplete = useCallback(() => {
    dequeueAnimation();
    setIsDone(false);
    queueIdRef.current += 1;
  }, [dequeueAnimation]);

  return (
    <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
      {current && !isDone && (
        <motion.div
          key={`${current.type}-${queueIdRef.current}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 text-white text-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          data-testid="animation-overlay"
          data-event-type={current.type}
          onClick={handleComplete}
        >
          {renderOverlayContent(current)}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Placeholder renderer for animation events.
 * Plan 02 replaces this with actual overlay components.
 */
function renderOverlayContent(event: AnimationEvent): string {
  switch (event.type) {
    case 'perfect_day':
      return 'PERFECT DAY!';
    case 'capsule_drop':
      return `CAPSULE: ${event.rewardTitle}`;
    case 'dragon_ball':
      return `DRAGON BALL #${event.count}`;
    case 'transformation':
      return `TRANSFORMATION: ${event.name}`;
    case 'shenron':
      return 'SHENRON CEREMONY';
    default:
      return '';
  }
}
