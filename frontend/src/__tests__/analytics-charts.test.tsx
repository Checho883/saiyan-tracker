import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { CalendarDay } from '../types';

// Mock recharts to avoid JSDOM rendering issues
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

// Mock powerStore for AttributeChart
vi.mock('../store/powerStore', () => ({
  usePowerStore: vi.fn((selector) => {
    const state = {
      attributes: [
        { attribute: 'str', raw_xp: 100, level: 2, title: 'Warrior', xp_for_current_level: 0, xp_for_next_level: 200, progress_percent: 50 },
        { attribute: 'vit', raw_xp: 50, level: 1, title: 'Runner', xp_for_current_level: 0, xp_for_next_level: 100, progress_percent: 50 },
      ],
    };
    return selector(state);
  }),
}));

import { AttributeChart } from '../components/analytics/AttributeChart';
import { PowerLevelChart } from '../components/analytics/PowerLevelChart';

const mockDays: CalendarDay[] = [
  { date: '2026-03-01', is_perfect_day: true, completion_tier: 'gold', xp_earned: 100, is_off_day: false },
  { date: '2026-03-02', is_perfect_day: false, completion_tier: 'silver', xp_earned: 75, is_off_day: false },
  { date: '2026-03-03', is_perfect_day: false, completion_tier: 'bronze', xp_earned: 40, is_off_day: false },
];

describe('AttributeChart', () => {
  test('renders without crashing with data', () => {
    render(<AttributeChart calendarDays={mockDays} />);
    expect(screen.getByText('XP Over Time')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  test('shows attribute level bars', () => {
    render(<AttributeChart calendarDays={mockDays} />);
    expect(screen.getByText('Current Attributes')).toBeInTheDocument();
    expect(screen.getByText('str')).toBeInTheDocument();
    expect(screen.getByText('vit')).toBeInTheDocument();
  });

  test('shows empty state when no data', () => {
    render(<AttributeChart calendarDays={[]} />);
    expect(screen.getByText('No data for this period')).toBeInTheDocument();
  });
});

describe('PowerLevelChart', () => {
  test('renders without crashing with data', () => {
    render(<PowerLevelChart calendarDays={mockDays} />);
    expect(screen.getByText('Power Level')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  test('shows empty state when no data', () => {
    render(<PowerLevelChart calendarDays={[]} />);
    expect(screen.getByText('No data for this period')).toBeInTheDocument();
  });
});
