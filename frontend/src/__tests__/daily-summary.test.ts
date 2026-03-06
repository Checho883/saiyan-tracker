import { describe, it, expect } from 'vitest';

describe('Daily Summary - detection logic', () => {
  it('detects all habits completed when remaining count is 0', () => {
    const habits = [
      { completed: true },
      { completed: true },
      { completed: true },
    ];
    const remaining = habits.filter((h) => !h.completed);
    expect(remaining.length).toBe(0);
  });

  it('does not trigger when habits remain', () => {
    const habits = [
      { completed: true },
      { completed: false },
      { completed: true },
    ];
    const remaining = habits.filter((h) => !h.completed);
    expect(remaining.length).toBeGreaterThan(0);
  });
});

describe('Nudge Banner - detection logic', () => {
  it('triggers when 1-2 habits remain and total > 2', () => {
    const habits = [
      { completed: true, title: 'A' },
      { completed: true, title: 'B' },
      { completed: false, title: 'C' },
    ];
    const remaining = habits.filter((h) => !h.completed);
    const showNudge =
      remaining.length >= 1 && remaining.length <= 2 && habits.length > 2;
    expect(showNudge).toBe(true);
  });

  it('does not trigger when more than 2 habits remain', () => {
    const habits = [
      { completed: false, title: 'A' },
      { completed: false, title: 'B' },
      { completed: false, title: 'C' },
    ];
    const remaining = habits.filter((h) => !h.completed);
    const showNudge =
      remaining.length >= 1 && remaining.length <= 2 && habits.length > 2;
    expect(showNudge).toBe(false);
  });

  it('does not trigger when only 2 total habits exist', () => {
    const habits = [
      { completed: true, title: 'A' },
      { completed: false, title: 'B' },
    ];
    const remaining = habits.filter((h) => !h.completed);
    const showNudge =
      remaining.length >= 1 && remaining.length <= 2 && habits.length > 2;
    expect(showNudge).toBe(false);
  });

  it('does not trigger when all habits completed', () => {
    const habits = [
      { completed: true, title: 'A' },
      { completed: true, title: 'B' },
      { completed: true, title: 'C' },
    ];
    const remaining = habits.filter((h) => !h.completed);
    const showNudge =
      remaining.length >= 1 && remaining.length <= 2 && habits.length > 2;
    expect(showNudge).toBe(false);
  });
});
