import { Outlet } from 'react-router';
import { useInitApp } from '../../hooks/useInitApp';
import { LoadingScreen } from '../common/LoadingScreen';
import { BottomTabBar } from './BottomTabBar';
import { SoundProvider } from '../../audio/SoundProvider';

export function AppShell() {
  const { isReady, error } = useInitApp();

  if (error) {
    return (
      <div className="min-h-screen bg-space-900 flex flex-col items-center justify-center p-4">
        <p className="text-danger text-lg mb-4">Failed to power up</p>
        <p className="text-text-secondary text-sm mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-saiyan-500 text-white rounded-lg hover:bg-saiyan-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <SoundProvider>
      <div className="min-h-screen bg-space-900 pb-16">
        <Outlet />
        <BottomTabBar />
      </div>
    </SoundProvider>
  );
}
