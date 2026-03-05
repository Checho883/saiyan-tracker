import { useEffect, useRef } from 'react';
import { useUiStore } from '../store/uiStore';
import { useAudio } from './useAudio';
import type { SoundId } from './soundMap';
import type { AnimationEvent } from '../store/uiStore';

/** Maps animation event types to their sound effect IDs */
const EVENT_SOUND_MAP: Record<AnimationEvent['type'], SoundId> = {
  tier_change: 'power_up',
  perfect_day: 'explosion',
  capsule_drop: 'capsule_pop',
  dragon_ball: 'radar_ping',
  transformation: 'transform',
  shenron: 'thunder_roar',
  xp_popup: 'scouter_beep', // Habit check triggers xp_popup; plays scouter beep
};

/**
 * Hook that subscribes to the uiStore animation queue and plays
 * corresponding sound effects for each new event.
 *
 * Mount this inside SoundProvider (e.g., as a side-effect component).
 * Sounds can overlap when multiple events fire simultaneously.
 */
export function useSoundEffect() {
  const { play } = useAudio();
  const animationQueue = useUiStore((s) => s.animationQueue);
  const prevLengthRef = useRef(0);

  useEffect(() => {
    const currentLength = animationQueue.length;
    if (currentLength <= prevLengthRef.current) {
      prevLengthRef.current = currentLength;
      return;
    }

    // Play sounds for all new events since last check
    const newEvents = animationQueue.slice(prevLengthRef.current);
    for (const event of newEvents) {
      const soundId = EVENT_SOUND_MAP[event.type];
      if (soundId) {
        play(soundId);
      }
    }

    prevLengthRef.current = currentLength;
  }, [animationQueue, play]);
}
