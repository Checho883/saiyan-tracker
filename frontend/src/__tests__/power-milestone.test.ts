import { describe, it, expect, beforeEach } from 'vitest';
import { useUiStore, PRIORITY_TIERS } from '../store/uiStore';

describe('Power Milestone - uiStore', () => {
  beforeEach(() => {
    useUiStore.setState({ animationQueue: [], inlineEvents: [] });
  });

  it('power_milestone is tier 1 (exclusive)', () => {
    expect(PRIORITY_TIERS.power_milestone).toBe(1);
  });

  it('enqueues power_milestone event into animation queue', () => {
    useUiStore.getState().enqueueAnimation({
      type: 'power_milestone',
      milestone: 1000,
    });
    const queue = useUiStore.getState().animationQueue;
    expect(queue).toHaveLength(1);
    expect(queue[0].type).toBe('power_milestone');
    if (queue[0].type === 'power_milestone') {
      expect(queue[0].milestone).toBe(1000);
    }
  });

  it('power_milestone sorts at tier 1 priority (before tier 2 events)', () => {
    // Add a tier 2 event first
    useUiStore.getState().enqueueAnimation({ type: 'perfect_day' });
    // Add power_milestone (tier 1)
    useUiStore.getState().enqueueAnimation({
      type: 'power_milestone',
      milestone: 5000,
    });
    const queue = useUiStore.getState().animationQueue;
    expect(queue[0].type).toBe('power_milestone');
    expect(queue[1].type).toBe('perfect_day');
  });
});

describe('Power Milestone - detection logic', () => {
  it('detects milestone crossing from below to at-or-above', () => {
    const MILESTONES = [1000, 5000, 10000, 50000];
    const prevPower = 950;
    const newPower = 1050;
    const crossed = MILESTONES.find((m) => prevPower < m && newPower >= m);
    expect(crossed).toBe(1000);
  });

  it('does not detect milestone when already past', () => {
    const MILESTONES = [1000, 5000, 10000, 50000];
    const prevPower = 1050;
    const newPower = 1100;
    const crossed = MILESTONES.find((m) => prevPower < m && newPower >= m);
    expect(crossed).toBeUndefined();
  });

  it('detects exact milestone hit', () => {
    const MILESTONES = [1000, 5000, 10000, 50000];
    const prevPower = 999;
    const newPower = 1000;
    const crossed = MILESTONES.find((m) => prevPower < m && newPower >= m);
    expect(crossed).toBe(1000);
  });

  it('detects higher milestones', () => {
    const MILESTONES = [1000, 5000, 10000, 50000];
    const prevPower = 4800;
    const newPower = 5200;
    const crossed = MILESTONES.find((m) => prevPower < m && newPower >= m);
    expect(crossed).toBe(5000);
  });
});
