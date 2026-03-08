import { NavLink } from 'react-router';
import { Crosshair, Radar, Settings, Volume2, VolumeX } from 'lucide-react';
import { useAudio } from '../../audio/useAudio';

const tabs = [
  { to: '/', label: 'Dashboard', icon: Crosshair, end: true },
  { to: '/analytics', label: 'Analytics', icon: Radar, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
] as const;

export function BottomTabBar() {
  const { toggleMute, isMuted } = useAudio();
  const SoundIcon = isMuted ? VolumeX : Volume2;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-space-800 border-t border-space-600">
      <div className="flex items-center h-16">
        <div className="flex-1 flex justify-around items-center">
          {tabs.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-3 px-4 transition-colors ${
                  isActive ? 'text-saiyan-500' : 'text-text-muted'
                }`
              }
            >
              <Icon size={24} />
              <span className="text-xs">{label}</span>
            </NavLink>
          ))}
        </div>
        <button
          onClick={toggleMute}
          aria-label={isMuted ? 'Enable sound' : 'Disable sound'}
          className="flex flex-col items-center gap-1 py-3 px-4 mr-2 text-text-muted hover:text-saiyan-500 transition-colors"
        >
          <SoundIcon size={24} />
          <span className="text-xs">Sound</span>
        </button>
      </div>
    </nav>
  );
}
