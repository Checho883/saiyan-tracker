import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { mockPowerResponse, mockHabits } from './__fixtures__/mockData';

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
      attributes: mockPowerResponse.attributes,
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
      todayHabits: mockHabits,
      isLoading: false,
      error: null,
      fetchToday: vi.fn(),
      checkHabit: vi.fn(),
    })
  ),
}));

import { SaiyanAvatar } from '../components/dashboard/SaiyanAvatar';
import { ScouterHUD } from '../components/dashboard/ScouterHUD';

describe('Hero Section (05-02)', () => {
  test('avatar renders transformation image', () => {
    render(<SaiyanAvatar transformation="ssj" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/assets/avatars/ssj.webp');
  });

  test('scouter shows power level', () => {
    render(
      <ScouterHUD
        powerLevel={5000}
        transformationName="Super Saiyan"
        nextTransformation="ssj2"
        nextThreshold={10000}
      />
    );
    // toLocaleString may use ',' or '.' as thousands separator depending on locale
    expect(screen.getByText((content) => content.replace(/[.,]/g, '') === '5000')).toBeInTheDocument();
  });

  test('scouter shows next form progress', () => {
    render(
      <ScouterHUD
        powerLevel={5000}
        transformationName="Super Saiyan"
        nextTransformation="ssj2"
        nextThreshold={10000}
      />
    );
    const progressBar = document.querySelector('[data-testid="next-form-progress"]');
    expect(progressBar).toBeInTheDocument();
  });
});
