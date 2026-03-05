import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { mockAttributes, mockPowerResponse } from './__fixtures__/mockData';

// Mock powerStore
vi.mock('../store/powerStore', () => ({
  usePowerStore: vi.fn((selector) =>
    selector({
      powerLevel: 5000,
      transformation: 'ssj',
      transformationName: 'Super Saiyan',
      nextTransformation: 'ssj2',
      nextThreshold: 10000,
      dragonBallsCollected: 3,
      wishesGranted: 0,
      attributes: mockAttributes,
      isLoading: false,
      error: null,
      fetchPower: vi.fn(),
      updateFromCheck: vi.fn(),
    })
  ),
}));

vi.mock('../store/habitStore', () => ({
  useHabitStore: vi.fn((selector) =>
    selector({
      todayHabits: [],
      isLoading: false,
      error: null,
      fetchToday: vi.fn(),
      checkHabit: vi.fn(),
    })
  ),
}));

import { AttributeGrid } from '../components/dashboard/AttributeGrid';
import { DragonBallTracker } from '../components/dashboard/DragonBallTracker';

describe('Game Stats (05-02)', () => {
  test('attribute bars render 4 attributes', () => {
    render(<AttributeGrid />);
    expect(screen.getByText(/STR/i)).toBeInTheDocument();
    expect(screen.getByText(/VIT/i)).toBeInTheDocument();
    expect(screen.getByText(/INT/i)).toBeInTheDocument();
    expect(screen.getByText(/KI/i)).toBeInTheDocument();
  });

  test('attribute bar shows level and progress', () => {
    render(<AttributeGrid />);
    // Level 5 for STR
    expect(screen.getByText('5')).toBeInTheDocument();
    // Level 7 for INT
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  test('dragon ball tracker shows filled and empty', () => {
    render(<DragonBallTracker collected={3} />);
    // 3 filled + 4 empty = 7 total
    const balls = document.querySelectorAll('[data-testid="dragon-ball"]');
    expect(balls).toHaveLength(7);
  });
});
