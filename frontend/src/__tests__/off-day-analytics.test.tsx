import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { OffDaySummary } from '../types';

// Mock recharts to avoid JSDOM rendering issues
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: { children: React.ReactNode }) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

import { OffDayAnalyticsCard } from '../components/analytics/OffDayAnalyticsCard';

const mockData: OffDaySummary = {
  total_off_days: 5,
  xp_impact_estimate: 1250,
  streaks_preserved: 3,
  reason_breakdown: { rest: 2, sick: 2, vacation: 1 },
};

describe('OffDayAnalyticsCard', () => {
  test('renders stats when data is provided', () => {
    render(<OffDayAnalyticsCard data={mockData} />);
    expect(screen.getByText('Off-Day Impact')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // total off-days
    expect(screen.getByText((1250).toLocaleString())).toBeInTheDocument(); // xp impact
    expect(screen.getByText('Off-Days')).toBeInTheDocument();
    expect(screen.getByText('XP Missed')).toBeInTheDocument();
    expect(screen.getByText('Streaks Saved')).toBeInTheDocument();
  });

  test('renders pie chart when data has reason breakdown', () => {
    render(<OffDayAnalyticsCard data={mockData} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  test('renders reason legend', () => {
    render(<OffDayAnalyticsCard data={mockData} />);
    expect(screen.getByText('Rest')).toBeInTheDocument();
    expect(screen.getByText('Sick')).toBeInTheDocument();
    expect(screen.getByText('Vacation')).toBeInTheDocument();
  });

  test('shows empty state when total_off_days is 0', () => {
    const emptyData: OffDaySummary = {
      total_off_days: 0,
      xp_impact_estimate: 0,
      streaks_preserved: 0,
      reason_breakdown: {},
    };
    render(<OffDayAnalyticsCard data={emptyData} />);
    expect(screen.getByText('No off-days taken yet')).toBeInTheDocument();
  });

  test('shows loading skeleton when data is null', () => {
    const { container } = render(<OffDayAnalyticsCard data={null} />);
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });
});
