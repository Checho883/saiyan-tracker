import { NavLink } from 'react-router';
import { Crosshair, Radar, Settings } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Dashboard', icon: Crosshair, end: true },
  { to: '/analytics', label: 'Analytics', icon: Radar, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
] as const;

export function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-space-800 border-t border-space-600">
      <div className="flex justify-around items-center h-16">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2 px-3 transition-colors ${
                isActive ? 'text-saiyan-500' : 'text-text-muted'
              }`
            }
          >
            <Icon size={20} />
            <span className="text-xs">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
