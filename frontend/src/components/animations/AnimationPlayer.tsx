import { useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useUiStore } from '../../store/uiStore';
import type { AnimationEvent } from '../../store/uiStore';
import { PerfectDayOverlay } from './PerfectDayOverlay';
import { CapsuleDropOverlay } from './CapsuleDropOverlay';
import { DragonBallTrajectory } from './DragonBallTrajectory';
import { TransformationOverlay } from './TransformationOverlay';
import { ShenronCeremony } from './ShenronCeremony';

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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          data-testid="animation-overlay"
          data-event-type={current.type}
        >
          {renderOverlay(current, handleComplete)}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Dispatches to the correct overlay component based on event type.
 */
function renderOverlay(
  event: AnimationEvent,
  onComplete: () => void,
): React.ReactNode {
  switch (event.type) {
    case 'perfect_day':
      return <PerfectDayOverlay onComplete={onComplete} />;
    case 'capsule_drop':
      return (
        <CapsuleDropOverlay
          rewardTitle={event.rewardTitle}
          rarity={event.rarity}
          onComplete={onComplete}
        />
      );
    case 'dragon_ball':
      return (
        <DragonBallTrajectory count={event.count} onComplete={onComplete} />
      );
    case 'transformation':
      return (
        <TransformationOverlay
          form={event.form}
          name={event.name}
          onComplete={onComplete}
        />
      );
    case 'shenron':
      return <ShenronCeremony onComplete={onComplete} />;
    default:
      return null;
  }
}
