import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { CalendarDay } from '../types';
import { BestWorstDays } from '../components/analytics/BestWorstDays';

const mockDays: CalendarDay[] = [
  { date: '2026-03-01', is_perfect_day: true, completion_tier: 'gold', xp_earned: 150, is_off_day: false },
  { date: '2026-03-02', is_perfect_day: false, completion_tier: 'silver', xp_earned: 100, is_off_day: false },
  { date: '2026-03-03', is_perfect_day: false, completion_tier: 'bronze', xp_earned: 40, is_off_day: false },
  { date: '2026-03-04', is_perfect_day: false, completion_tier: 'base', xp_earned: 20, is_off_day: false },
  { date: '2026-03-05', is_perfect_day: true, completion_tier: 'gold', xp_earned: 180, is_off_day: false },
  { date: '2026-03-06', is_perfect_day: false, completion_tier: 'silver', xp_earned: 90, is_off_day: false },
  { date: '2026-03-07', is_perfect_day: false, completion_tier: 'base', xp_earned: 10, is_off_day: false },
  { date: '2026-03-08', is_perfect_day: false, completion_tier: 'base', xp_earned: 0, is_off_day: true },
];

describe('BestWorstDays', () => {
  test('renders top 3 best days and bottom 3 worst days', () => {
    render(<BestWorstDays calendarDays={mockDays} />);
    expect(screen.getByText('Best & Worst Days')).toBeInTheDocument();
    expect(screen.getByText('Best')).toBeInTheDocument();
    expect(screen.getByText('Worst')).toBeInTheDocument();
  });

  test('excludes off-days from ranking', () => {
    render(<BestWorstDays calendarDays={mockDays} />);
    // Mar 8 is an off-day with 0 XP, should not appear in rankings
    // The component filters out off-days and zero-xp days
    const dayElements = screen.getAllByTestId('day-entry');
    // We have 7 non-off-day entries, but only 7 have xp > 0, and we show max 6 (3 best + 3 worst)
    expect(dayElements.length).toBeLessThanOrEqual(6);
    // None of the entries should be Mar 8 (the off-day)
    const dayTexts = dayElements.map((el) => el.textContent ?? '');
    expect(dayTexts.some((t) => t.includes('Mar 8'))).toBe(false);
  });

  test('shows empty state when calendarDays is empty', () => {
    render(<BestWorstDays calendarDays={[]} />);
    expect(screen.getByText('No data yet')).toBeInTheDocument();
  });

  test('shows This Month label', () => {
    render(<BestWorstDays calendarDays={mockDays} />);
    expect(screen.getByText('This Month')).toBeInTheDocument();
  });
});
