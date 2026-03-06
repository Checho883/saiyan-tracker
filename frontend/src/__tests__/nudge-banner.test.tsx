import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NudgeBanner } from '../components/dashboard/NudgeBanner';

describe('NudgeBanner', () => {
  it('renders with 1 remaining habit', () => {
    render(
      <NudgeBanner
        remainingHabits={[{ title: 'Meditate', icon_emoji: '🧘' }]}
      />,
    );
    const message = screen.getByTestId('nudge-message');
    expect(message.textContent).toContain('Meditate');
    expect(message.textContent).toContain('Almost there');
  });

  it('renders with 2 remaining habits', () => {
    render(
      <NudgeBanner
        remainingHabits={[
          { title: 'Meditate', icon_emoji: '🧘' },
          { title: 'Read', icon_emoji: '📖' },
        ]}
      />,
    );
    const message = screen.getByTestId('nudge-message');
    expect(message.textContent).toContain('Meditate');
    expect(message.textContent).toContain('Read');
    expect(message.textContent).toContain('and');
  });

  it('shows correct habit names', () => {
    render(
      <NudgeBanner
        remainingHabits={[{ title: 'Exercise', icon_emoji: '💪' }]}
      />,
    );
    expect(screen.getByTestId('nudge-message').textContent).toContain(
      'Exercise',
    );
  });

  it('renders nothing when no remaining habits', () => {
    const { container } = render(<NudgeBanner remainingHabits={[]} />);
    expect(container.innerHTML).toBe('');
  });
});
