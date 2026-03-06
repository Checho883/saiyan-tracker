import { useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useUiStore, PRIORITY_TIERS } from '../../store/uiStore';
import type { AnimationEvent } from '../../store/uiStore';
import { PerfectDayOverlay } from './PerfectDayOverlay';
import { CapsuleDropOverlay } from './CapsuleDropOverlay';
import { DragonBallTrajectory } from './DragonBallTrajectory';
import { TransformationOverlay } from './TransformationOverlay';
import { ShenronCeremony } from './ShenronCeremony';
import { TierChangeBanner } from './TierChangeBanner';
import { ComboSummaryOverlay } from './ComboSummaryOverlay';
import { PowerMilestoneOverlay } from './PowerMilestoneOverlay';
import { LevelUpOverlay } from './LevelUpOverlay';
import { ZenkaiRecoveryOverlay } from './ZenkaiRecoveryOverlay';
import { StreakMilestoneOverlay } from './StreakMilestoneOverlay';

/** Combo batching threshold: 3+ banner events triggers combo mode */
const COMBO_THRESHOLD = 3;

/**
 * Root-level queue consumer. Mounts at app root (AppShell).
 *
 * Priority-tiered playback:
 * - Tier 1 (Exclusive): transformation, shenron — play individually in order
 * - Tier 2 (Banner): tier_change, perfect_day, capsule_drop — play individually
 *   UNLESS 3+ banner events queue, then first plays + rest batch into combo summary
 * - Tier 3 (Inline): xp_popup, dragon_ball — bypass this player entirely
 *
 * Queue is pre-sorted by priority in uiStore. This component always takes first item.
 */
export function AnimationPlayer() {
  const queue = useUiStore((s) => s.animationQueue);
  const dequeueAnimation = useUiStore((s) => s.dequeueAnimation);
  const dequeueMultiple = useUiStore((s) => s.dequeueMultiple);
  const queueIdRef = useRef(0);
  const [isDone, setIsDone] = useState(false);

  // Combo state
  const [comboMode, setComboMode] = useState(false);
  const [comboBatch, setComboBatch] = useState<AnimationEvent[]>([]);
  const [comboTotal, setComboTotal] = useState(0);

  // Current event = first in priority-sorted queue
  const current = queue.length > 0 ? queue[0] : null;

  // Count banner-tier events in queue
  const bannerCount = queue.filter((e) => PRIORITY_TIERS[e.type] === 2).length;

  // When overlay signals completion, trigger exit animation
  const handleComplete = useCallback(() => {
    if (
      current &&
      PRIORITY_TIERS[current.type] === 2 &&
      bannerCount >= COMBO_THRESHOLD
    ) {
      // Current banner event finished — batch remaining banners into combo
      dequeueAnimation(); // Remove the one that just played
      const remainingBanners = useUiStore
        .getState()
        .animationQueue.filter((e) => PRIORITY_TIERS[e.type] === 2);
      if (remainingBanners.length > 0) {
        // Dequeue all remaining banner events
        const allQueue = useUiStore.getState().animationQueue;
        const bannerIndices = allQueue
          .map((e, i) => (PRIORITY_TIERS[e.type] === 2 ? i : -1))
          .filter((i) => i >= 0);
        // Remove banners from queue (dequeue all, re-add non-banners)
        const nonBanners = allQueue.filter((e) => PRIORITY_TIERS[e.type] !== 2);
        useUiStore.setState({ animationQueue: nonBanners });

        setComboBatch(remainingBanners);
        setComboTotal(remainingBanners.length + 1); // +1 for the one that played
        setComboMode(true);
        queueIdRef.current += 1;
        return;
      }
    }
    setIsDone(true);
  }, [current, bannerCount, dequeueAnimation]);

  // After exit animation finishes, dequeue and reset
  const handleExitComplete = useCallback(() => {
    if (!comboMode) {
      dequeueAnimation();
    }
    setIsDone(false);
    queueIdRef.current += 1;
  }, [dequeueAnimation, comboMode]);

  // When combo summary finishes
  const handleComboComplete = useCallback(() => {
    setComboMode(false);
    setComboBatch([]);
    setComboTotal(0);
    queueIdRef.current += 1;
  }, []);

  // Render combo summary overlay
  if (comboMode && comboBatch.length > 0) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={`combo-${queueIdRef.current}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          data-testid="animation-overlay"
          data-event-type="combo"
        >
          <ComboSummaryOverlay
            events={comboBatch}
            totalCount={comboTotal}
            onComplete={handleComboComplete}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

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
    case 'tier_change':
      return <TierChangeBanner tier={event.tier} onDismiss={onComplete} />;
    case 'power_milestone':
      return (
        <PowerMilestoneOverlay
          milestone={event.milestone}
          onComplete={onComplete}
        />
      );
    case 'level_up':
      return (
        <LevelUpOverlay
          attribute={event.attribute}
          oldLevel={event.oldLevel}
          newLevel={event.newLevel}
          title={event.title}
          onComplete={onComplete}
        />
      );
    case 'zenkai_recovery':
      return <ZenkaiRecoveryOverlay onComplete={onComplete} />;
    case 'streak_milestone':
      return (
        <StreakMilestoneOverlay
          tier={event.tier}
          streak={event.streak}
          scope={event.scope}
          badgeName={event.badgeName}
          onComplete={onComplete}
        />
      );
    default:
      return null;
  }
}
