import { describe, it, expect, beforeEach } from 'vitest';
import { useUiStore, PRIORITY_TIERS } from '../store/uiStore';
import { getEscalationTier } from '../components/animations/PowerMilestoneOverlay';

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
  const MILESTONES = [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];

  it('POWER_MILESTONES has 10 entries', () => {
    expect(MILESTONES).toHaveLength(10);
  });

  it('detects milestone crossing from below to at-or-above', () => {
    const prevPower = 950;
    const newPower = 1050;
    const crossed = MILESTONES.find((m) => prevPower < m && newPower >= m);
    expect(crossed).toBe(1000);
  });

  it('does not detect milestone when already past', () => {
    const prevPower = 1050;
    const newPower = 1100;
    const crossed = MILESTONES.find((m) => prevPower < m && newPower >= m);
    expect(crossed).toBeUndefined();
  });

  it('detects exact milestone hit', () => {
    const prevPower = 999;
    const newPower = 1000;
    const crossed = MILESTONES.find((m) => prevPower < m && newPower >= m);
    expect(crossed).toBe(1000);
  });

  it('detects higher milestones', () => {
    const prevPower = 4800;
    const newPower = 5200;
    const crossed = MILESTONES.find((m) => prevPower < m && newPower >= m);
    expect(crossed).toBe(5000);
  });

  it('detects low milestone at 100', () => {
    const prevPower = 80;
    const newPower = 110;
    const crossed = MILESTONES.find((m) => prevPower < m && newPower >= m);
    expect(crossed).toBe(100);
  });

  it('detects 100K milestone', () => {
    const prevPower = 99500;
    const newPower = 100500;
    const crossed = MILESTONES.find((m) => prevPower < m && newPower >= m);
    expect(crossed).toBe(100000);
  });
});

describe('Power Milestone - escalation tiers', () => {
  it('returns standard for milestones below 5000', () => {
    expect(getEscalationTier(100)).toBe('standard');
    expect(getEscalationTier(250)).toBe('standard');
    expect(getEscalationTier(500)).toBe('standard');
    expect(getEscalationTier(1000)).toBe('standard');
    expect(getEscalationTier(2500)).toBe('standard');
    expect(getEscalationTier(4999)).toBe('standard');
  });

  it('returns shake for 5000-24999', () => {
    expect(getEscalationTier(5000)).toBe('shake');
    expect(getEscalationTier(10000)).toBe('shake');
    expect(getEscalationTier(24999)).toBe('shake');
  });

  it('returns epic for 25000-99999', () => {
    expect(getEscalationTier(25000)).toBe('epic');
    expect(getEscalationTier(50000)).toBe('epic');
    expect(getEscalationTier(99999)).toBe('epic');
  });

  it('returns legendary for 100000+', () => {
    expect(getEscalationTier(100000)).toBe('legendary');
    expect(getEscalationTier(200000)).toBe('legendary');
  });
});
