import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { ContributionGrid } from '../components/dashboard/ContributionGrid';
import type { ContributionDay } from '../types';

describe('ContributionGrid', () => {
  function generateDays(count: number, startCompleted = true): ContributionDay[] {
    const days: ContributionDay[] = [];
    const today = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toISOString().slice(0, 10),
        completed: startCompleted ? i % 2 === 0 : false,
      });
    }
    return days;
  }

  it('renders correct number of cells for 90 days of data', () => {
    const days = generateDays(90);
    const { container } = render(<ContributionGrid days={days} />);
    const cells = container.querySelectorAll('[data-testid="contribution-cell"]');
    // At least 90 cells (may have padding cells)
    expect(cells.length).toBeGreaterThanOrEqual(90);
  });

  it('completed days get green styling', () => {
    const days: ContributionDay[] = [
      { date: '2026-03-06', completed: true },
      { date: '2026-03-05', completed: false },
    ];
    const { container } = render(<ContributionGrid days={days} />);
    const cells = container.querySelectorAll('[data-testid="contribution-cell"]');
    const greenCells = Array.from(cells).filter((c) =>
      c.className.includes('bg-green-500'),
    );
    const darkCells = Array.from(cells).filter((c) =>
      c.className.includes('bg-space-700'),
    );
    expect(greenCells.length).toBeGreaterThanOrEqual(1);
    expect(darkCells.length).toBeGreaterThanOrEqual(1);
  });

  it('renders without error with empty data', () => {
    const { container } = render(<ContributionGrid days={[]} />);
    expect(container).toBeTruthy();
  });

  it('shows day-of-week labels', () => {
    const days = generateDays(7);
    render(<ContributionGrid days={days} />);
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByText('W')).toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument();
  });
});
