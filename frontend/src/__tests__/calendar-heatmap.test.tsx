import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarHeatmap } from '../components/analytics/CalendarHeatmap';
import type { CalendarDay } from '../types';

const mockDays: CalendarDay[] = [
  { date: '2026-03-01', is_perfect_day: true, completion_tier: 'gold', xp_earned: 100, is_off_day: false },
  { date: '2026-03-02', is_perfect_day: false, completion_tier: 'silver', xp_earned: 75, is_off_day: false },
  { date: '2026-03-03', is_perfect_day: false, completion_tier: 'bronze', xp_earned: 40, is_off_day: false },
  { date: '2026-03-04', is_perfect_day: false, completion_tier: 'base', xp_earned: 10, is_off_day: false },
  { date: '2026-03-05', is_perfect_day: false, completion_tier: 'base', xp_earned: 0, is_off_day: true },
];

describe('CalendarHeatmap', () => {
  const defaultProps = {
    days: mockDays,
    month: '2026-03',
    onPrev: vi.fn(),
    onNext: vi.fn(),
  };

  test('renders correct number of day cells for month', () => {
    render(<CalendarHeatmap {...defaultProps} />);
    // March 2026 has 31 days
    const dayButtons = screen.getAllByRole('button').filter(
      (btn) => btn.getAttribute('aria-label')?.startsWith('Day ')
    );
    expect(dayButtons).toHaveLength(31);
  });

  test('applies gold color for 100% completion tier', () => {
    render(<CalendarHeatmap {...defaultProps} />);
    const day1 = screen.getByRole('button', { name: /Day 1, gold tier/i });
    expect(day1.className).toContain('bg-yellow-500');
  });

  test('applies blue outline for off-days', () => {
    render(<CalendarHeatmap {...defaultProps} />);
    const day5 = screen.getByRole('button', { name: /Day 5.*off day/i });
    expect(day5.className).toContain('ring-blue-500');
  });

  test('prev/next buttons call navigation callbacks', async () => {
    const user = userEvent.setup();
    render(<CalendarHeatmap {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(defaultProps.onPrev).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('button', { name: 'Next month' }));
    expect(defaultProps.onNext).toHaveBeenCalledOnce();
  });

  test('shows tooltip on day click with completion info', async () => {
    const user = userEvent.setup();
    render(<CalendarHeatmap {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /Day 1, gold tier/i }));
    expect(screen.getByText('XP earned: 100')).toBeInTheDocument();
    expect(screen.getByText('Perfect day!')).toBeInTheDocument();
  });

  test('displays month and year in header', () => {
    render(<CalendarHeatmap {...defaultProps} />);
    expect(screen.getByText('March 2026')).toBeInTheDocument();
  });
});
