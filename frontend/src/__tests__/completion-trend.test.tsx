import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { CompletionTrend } from '../types';
import { CompletionTrendCards } from '../components/analytics/CompletionTrendCards';

const mockData: CompletionTrend = {
  weekly_rate: 0.85,
  weekly_delta: 0.05,
  weekly_habits_due: 20,
  weekly_habits_completed: 17,
  monthly_rate: 0.72,
  monthly_delta: -0.03,
  monthly_habits_due: 80,
  monthly_habits_completed: 58,
};

describe('CompletionTrendCards', () => {
  test('renders weekly and monthly rates', () => {
    render(<CompletionTrendCards data={mockData} />);
    expect(screen.getByText('Completion Trends')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument(); // weekly rate
    expect(screen.getByText('72%')).toBeInTheDocument(); // monthly rate
  });

  test('renders delta arrows with correct signs', () => {
    render(<CompletionTrendCards data={mockData} />);
    expect(screen.getByText('+5pp')).toBeInTheDocument(); // positive delta
    expect(screen.getByText('-3pp')).toBeInTheDocument(); // negative delta
  });

  test('renders habit counts', () => {
    render(<CompletionTrendCards data={mockData} />);
    expect(screen.getByText('17/20 habits')).toBeInTheDocument();
    expect(screen.getByText('58/80 habits')).toBeInTheDocument();
  });

  test('renders period labels', () => {
    render(<CompletionTrendCards data={mockData} />);
    expect(screen.getByText('This Week')).toBeInTheDocument();
    expect(screen.getByText('This Month')).toBeInTheDocument();
  });

  test('shows loading skeleton when data is null', () => {
    const { container } = render(<CompletionTrendCards data={null} />);
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  test('handles zero delta correctly', () => {
    const zeroData: CompletionTrend = {
      ...mockData,
      weekly_delta: 0,
    };
    render(<CompletionTrendCards data={zeroData} />);
    expect(screen.getByText('0pp')).toBeInTheDocument();
  });
});
