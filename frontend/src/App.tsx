import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, BarChart3, Settings, Sun, Moon, Zap } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import Dashboard from '@/pages/Dashboard';
import Analytics from '@/pages/Analytics';
import SettingsPage from '@/pages/Settings';

function NavBar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const links = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 border-b"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-2">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saiyan-orange to-saiyan-gold flex items-center justify-center shadow-lg shadow-saiyan-orange/20">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-power text-sm font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>
            SAIYAN <span className="text-saiyan-orange">TRACKER</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {links.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-sm font-medium"
                style={{ color: isActive ? 'var(--saiyan-orange)' : 'var(--text-muted)' }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: 'rgba(255, 107, 0, 0.1)' }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <Icon size={16} className="relative z-10" />
                <span className="relative z-10 hidden sm:inline">{label}</span>
              </Link>
            );
          })}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="ml-2 p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </nav>
  );
}

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="pt-12 min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <NavBar />
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}
