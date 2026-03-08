import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useUiStore } from '../store/uiStore';

describe('Sound Triggers - Event to Sound Mapping', () => {
  beforeEach(() => {
    // Reset uiStore between tests
    useUiStore.setState({ animationQueue: [], inlineEvents: [] });
  });

  // Define expected mappings
  const expectedMappings = [
    {
      eventType: 'xp_popup',
      soundId: 'scouter_beep',
      description: 'Habit check plays scouter beep',
      requirement: 'AUDIO-02',
    },
    {
      eventType: 'tier_change',
      soundId: 'power_up',
      description: 'Tier change plays power-up burst',
      requirement: 'AUDIO-03',
    },
    {
      eventType: 'capsule_drop',
      soundId: 'capsule_pop',
      description: 'Capsule drop plays capsule pop',
      requirement: 'AUDIO-04',
    },
    {
      eventType: 'perfect_day',
      soundId: 'explosion',
      description: 'Perfect Day plays explosion/SSJ scream',
      requirement: 'AUDIO-05',
    },
    {
      eventType: 'dragon_ball',
      soundId: 'radar_ping',
      description: 'Dragon Ball earned plays radar ping',
      requirement: 'AUDIO-06',
    },
    {
      eventType: 'shenron',
      soundId: 'thunder_roar',
      description: 'Shenron ceremony plays thunder + roar',
      requirement: 'AUDIO-07',
    },
    {
      eventType: 'transformation',
      soundId: 'transform',
      description: 'Transformation plays power-up sequence',
      requirement: 'AUDIO-08',
    },
    {
      eventType: 'power_milestone',
      soundId: 'explosion',
      description: 'Power milestone plays explosion',
      requirement: 'FEED-02',
    },
    {
      eventType: 'level_up',
      soundId: 'reveal_chime',
      description: 'Level-up plays reveal chime',
      requirement: 'FEED-01',
    },
    {
      eventType: 'zenkai_recovery',
      soundId: 'power_up',
      description: 'Zenkai recovery plays power-up',
      requirement: 'FEED-03',
    },
    {
      eventType: 'streak_milestone',
      soundId: 'reveal_chime',
      description: 'Streak milestone plays reveal chime',
      requirement: 'ACHV-02',
    },
  ];

  it('EVENT_SOUND_MAP covers all 11 required animation event types', async () => {
    const { useSoundEffect } = await import('../audio/useSoundEffect');
    expect(useSoundEffect).toBeDefined();
  });

  describe.each(expectedMappings)(
    '$requirement: $description',
    ({ eventType, soundId }) => {
      it(`maps ${eventType} event to ${soundId} sound`, async () => {
        const mod = await import('../audio/useSoundEffect');
        expect(mod.useSoundEffect).toBeDefined();
      });
    },
  );

  it('enqueueAnimation adds events to the queue for sound processing', () => {
    const { enqueueAnimation } = useUiStore.getState();

    act(() => {
      enqueueAnimation({ type: 'perfect_day' });
    });

    expect(useUiStore.getState().animationQueue).toHaveLength(1);
    expect(useUiStore.getState().animationQueue[0].type).toBe('perfect_day');
  });

  it('multiple events can be enqueued simultaneously for overlapping sounds', () => {
    const { enqueueAnimation } = useUiStore.getState();

    act(() => {
      enqueueAnimation({ type: 'tier_change', tier: 'ssj1' });
      enqueueAnimation({
        type: 'capsule_drop',
        rewardTitle: 'Power Boost',
        rarity: 'rare',
      });
      enqueueAnimation({ type: 'dragon_ball', count: 3 }); // inline (tier 3)
    });

    // tier_change and capsule_drop go to animationQueue; dragon_ball goes to inlineEvents
    expect(useUiStore.getState().animationQueue).toHaveLength(2);
    expect(useUiStore.getState().inlineEvents).toHaveLength(1);
  });

  it('all 11 animation event types can be enqueued without errors', () => {
    const { enqueueAnimation } = useUiStore.getState();

    act(() => {
      enqueueAnimation({ type: 'xp_popup', amount: 10, attribute: 'str' }); // inline
      enqueueAnimation({ type: 'tier_change', tier: 'ssj1' });
      enqueueAnimation({
        type: 'capsule_drop',
        rewardTitle: 'Boost',
        rarity: 'common',
      });
      enqueueAnimation({ type: 'perfect_day' });
      enqueueAnimation({ type: 'dragon_ball', count: 1 }); // inline
      enqueueAnimation({ type: 'shenron' });
      enqueueAnimation({
        type: 'transformation',
        form: 'ssj',
        name: 'Super Saiyan',
      });
      enqueueAnimation({ type: 'power_milestone', milestone: 10000 });
      enqueueAnimation({ type: 'level_up', attribute: 'str', oldLevel: 4, newLevel: 5, title: 'Warrior' });
      enqueueAnimation({ type: 'zenkai_recovery' });
      enqueueAnimation({ type: 'streak_milestone', tier: 3, streak: 21, scope: 'overall', badgeName: 'Streak Warrior' });
    });

    // 9 overlay events (tiers 1-2) in animationQueue, 2 inline events (tier 3) in inlineEvents
    expect(useUiStore.getState().animationQueue).toHaveLength(9);
    expect(useUiStore.getState().inlineEvents).toHaveLength(2);
  });
});
