import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCards } from '../components/analytics/StatCards';
import type { AnalyticsSummary } from '../types';

const mockSummary: AnalyticsSummary = {
  perfect_days: 12,
  avg_completion: 0.853,
  total_xp: 4567,
  days_tracked: 30,
  longest_streak: 7,
};

describe('StatCards', () => {
  test('renders all 4 stat cards with correct values', () => {
    render(<StatCards summary={mockSummary} />);

    expect(screen.getByText('Perfect Days')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();

    expect(screen.getByText('Average')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();

    expect(screen.getByText('Total XP')).toBeInTheDocument();
    // toLocaleString format varies by environment — check the value is present
    expect(screen.getByText((_, el) => el?.textContent === (4567).toLocaleString())).toBeInTheDocument();

    expect(screen.getByText('Longest Streak')).toBeInTheDocument();
    expect(screen.getByText('7 days')).toBeInTheDocument();
  });

  test('shows loading skeleton when summary is null', () => {
    const { container } = render(<StatCards summary={null} />);
    const pulsingElements = container.querySelectorAll('.animate-pulse');
    expect(pulsingElements.length).toBeGreaterThanOrEqual(4);
  });

  test('formats XP with locale string', () => {
    render(<StatCards summary={{ ...mockSummary, total_xp: 123456 }} />);
    // toLocaleString format varies by environment
    expect(screen.getByText((_, el) => el?.textContent === (123456).toLocaleString())).toBeInTheDocument();
  });
});
