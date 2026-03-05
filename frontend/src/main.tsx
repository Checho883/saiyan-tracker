import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="min-h-screen bg-space-900 text-text-primary flex items-center justify-center">
      <p className="text-saiyan-500 text-2xl">Saiyan Tracker</p>
    </div>
  </StrictMode>,
);
