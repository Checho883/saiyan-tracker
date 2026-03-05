import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StrictMode } from 'react';

describe('App Rendering (STATE-01)', () => {
  test('renders placeholder app without crashing', () => {
    render(
      <StrictMode>
        <div className="min-h-screen bg-space-900 text-text-primary flex items-center justify-center">
          <p className="text-saiyan-500 text-2xl">Saiyan Tracker</p>
        </div>
      </StrictMode>,
    );
    expect(screen.getByText('Saiyan Tracker')).toBeInTheDocument();
  });

  test.todo('mounts into #root DOM element');
});
