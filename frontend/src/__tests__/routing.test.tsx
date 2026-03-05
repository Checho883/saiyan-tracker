import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router';
import { BottomTabBar } from '../components/layout/BottomTabBar';
import Dashboard from '../pages/Dashboard';
import Analytics from '../pages/Analytics';
import Settings from '../pages/Settings';

// Mock useInitApp so AppShell renders content immediately
vi.mock('../hooks/useInitApp', () => ({
  useInitApp: () => ({ isReady: true, error: null }),
}));

// Mock stores to prevent API calls
vi.mock('../store/habitStore', () => ({
  useHabitStore: Object.assign(() => ({}), { getState: () => ({}) }),
}));
vi.mock('../store/powerStore', () => ({
  usePowerStore: Object.assign(() => ({}), { getState: () => ({}) }),
}));
vi.mock('../store/rewardStore', () => ({
  useRewardStore: Object.assign(() => ({}), { getState: () => ({}) }),
}));
vi.mock('../store/uiStore', () => ({
  useUiStore: Object.assign(() => ({}), { getState: () => ({}) }),
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  Toaster: () => null,
  default: { error: vi.fn() },
}));

function renderApp(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <div>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
        <BottomTabBar />
      </div>
    </MemoryRouter>,
  );
}

describe('Page Routing (STATE-06)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders Dashboard at root path', () => {
    renderApp('/');
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Habit tracking coming in Phase 5')).toBeInTheDocument();
  });

  test('navigates to Analytics page', () => {
    renderApp('/analytics');
    expect(screen.getByRole('heading', { name: 'Analytics' })).toBeInTheDocument();
    expect(screen.getByText('Charts coming in Phase 8')).toBeInTheDocument();
  });

  test('navigates to Settings page', () => {
    renderApp('/settings');
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByText('Configuration coming in Phase 8')).toBeInTheDocument();
  });

  test('bottom tab bar shows 3 navigation links', () => {
    renderApp('/');
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
  });

  test('clicking tabs navigates between pages', async () => {
    const user = userEvent.setup();
    renderApp('/');

    expect(screen.getByText('Habit tracking coming in Phase 5')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /analytics/i }));
    expect(screen.getByText('Charts coming in Phase 8')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /settings/i }));
    expect(screen.getByText('Configuration coming in Phase 8')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /dashboard/i }));
    expect(screen.getByText('Habit tracking coming in Phase 5')).toBeInTheDocument();
  });
});
