import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, BarChart3, Settings } from 'lucide-react';
import Dashboard from '@/pages/Dashboard';
import Analytics from '@/pages/Analytics';
import SettingsPage from '@/pages/Settings';

function NavBar() {
  const location = useLocation();
  const links = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-saiyan-darker border-t border-saiyan-border px-4 py-2 md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="max-w-6xl mx-auto flex justify-center gap-1">
        {links.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`relative flex flex-col items-center px-6 py-2 rounded-lg transition-colors ${
                isActive ? 'text-saiyan-orange' : 'text-saiyan-muted hover:text-saiyan-text'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-saiyan-orange/10 rounded-lg"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <Icon size={20} className="relative z-10" />
              <span className="text-xs mt-1 relative z-10">{label}</span>
            </Link>
          );
        })}
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
      <div className="pb-16 md:pt-14 md:pb-0">
        <NavBar />
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}
