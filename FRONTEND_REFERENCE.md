# Saiyan Tracker Frontend - Complete Reference

## Project Setup Summary

Successfully created React + Vite + TypeScript frontend at:
```
/sessions/lucid-inspiring-johnson/mnt/Sergio_Dev/Apps/saiyan-tracker/frontend/
```

## Directory Structure

```
frontend/
├── src/
│   ├── App.tsx              # Main component (clean, ready for features)
│   ├── App.css              # Component styles
│   ├── index.css            # Global styles & Tailwind directives
│   ├── main.tsx             # React entry point
│   └── assets/              # Static assets
├── public/                  # Static files (vite.svg)
├── dist/                    # Production build (verified working)
├── index.html               # HTML with Google Fonts
├── vite.config.ts           # Vite + React + API proxy setup
├── tailwind.config.js       # Saiyan theme configuration
├── tsconfig.json            # TypeScript with path aliases
├── postcss.config.js        # PostCSS setup (auto-generated)
├── package.json             # Dependencies & scripts
├── eslint.config.js         # Linting rules
├── .gitignore               # Git ignore rules
├── README.md                # Default Vite README
└── PROJECT_SETUP.md         # Detailed setup documentation
```

## Key Configuration Files

### 1. vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

Features:
- React Fast Refresh enabled
- @ alias points to src/
- API proxy routes /api to backend on port 8000
- Dev server runs on port 5173

### 2. tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saiyan: {
          orange: '#FF6B00',
          blue: '#1E90FF',
          gold: '#FFD700',
          dark: '#0A0A0F',
          darker: '#050508',
          card: '#12121A',
          border: '#1E1E2E',
          text: '#E0E0E0',
          muted: '#888899',
        }
      },
      fontFamily: {
        saiyan: ['Rajdhani', 'sans-serif'],
      },
      animation: {
        'power-pulse': 'powerPulse 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        powerPulse: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(255, 107, 0, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(255, 107, 0, 0.8)' },
        },
        glow: {
          'from': { boxShadow: '0 0 10px rgba(255, 215, 0, 0.3)' },
          'to': { boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
```

Color Palette:
- `bg-saiyan-orange` - #FF6B00 (primary action)
- `bg-saiyan-blue` - #1E90FF (secondary)
- `bg-saiyan-gold` - #FFD700 (highlights)
- `bg-saiyan-dark` - #0A0A0F (main background)
- `bg-saiyan-card` - #12121A (card background)
- `text-saiyan-text` - #E0E0E0 (main text)

### 3. tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

Key features:
- ES2020 target
- React 17+ JSX transform
- Path aliases: `@/components` → `src/components`
- Strict TypeScript mode

### 4. index.html
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <title>Saiyan Tracker</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 5. src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --saiyan-orange: #FF6B00;
  --saiyan-blue: #1E90FF;
  --saiyan-gold: #FFD700;
  --saiyan-dark: #0A0A0F;
  --saiyan-card: #12121A;
  --saiyan-border: #1E1E2E;
}

body {
  font-family: 'Rajdhani', sans-serif;
  background-color: var(--saiyan-dark);
  color: #E0E0E0;
  min-height: 100vh;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: var(--saiyan-dark);
}

::-webkit-scrollbar-thumb {
  background: var(--saiyan-orange);
  border-radius: 3px;
}

/* Transformation aura effects */
.aura-base { box-shadow: none; }
.aura-ssj { box-shadow: 0 0 20px rgba(255, 215, 0, 0.4); }
.aura-ssj2 { box-shadow: 0 0 25px rgba(255, 215, 0, 0.6); }
.aura-ssj3 { box-shadow: 0 0 30px rgba(255, 215, 0, 0.8); }
.aura-ssg { box-shadow: 0 0 30px rgba(255, 50, 50, 0.6); }
.aura-ssb { box-shadow: 0 0 30px rgba(30, 144, 255, 0.6); }
.aura-ui { box-shadow: 0 0 40px rgba(192, 192, 255, 0.7); }
```

## Dependencies Installed

### Production Dependencies (npm install)
```
zustand@5              - State management
framer-motion@11       - Animation library
recharts@2             - Chart/graph library
react-router-dom@6     - Client-side routing
axios@1                - HTTP client
lucide-react@0.400     - Icon library
react@19.2.0           - UI framework
react-dom@19.2.0       - React DOM renderer
```

### Dev Dependencies (npm install -D)
```
tailwindcss@3          - Utility-first CSS
postcss@8              - CSS processor
autoprefixer@10        - CSS vendor prefixes
@types/node            - Node.js type definitions
typescript@5.9.3       - TypeScript compiler
vite@7.3.1             - Build tool
@vitejs/plugin-react@5.1.1 - React plugin for Vite
eslint & plugins       - Code linting
```

## Usage Examples

### Starting the Development Server
```bash
cd /sessions/lucid-inspiring-johnson/mnt/Sergio_Dev/Apps/saiyan-tracker/frontend
npm run dev
```
Server runs on http://localhost:5173 with hot module replacement.

### Building for Production
```bash
npm run build
```
Creates optimized build in `dist/` folder.

### Using Path Aliases
```typescript
// Instead of: import Button from '../../../components/Button'
import Button from '@/components/Button'
```

### Using Tailwind Classes
```tsx
<div className="bg-saiyan-dark text-saiyan-text p-4">
  <h1 className="text-saiyan-orange font-bold">Power Level</h1>
  <button className="bg-saiyan-orange hover:bg-orange-600 px-4 py-2">
    Transform
  </button>
</div>
```

### Using Aura Effects
```tsx
<div className="aura-ssj">
  <img src="saiyan.png" alt="SSJ" />
</div>
```

### Using Animations
```tsx
<div className="animate-power-pulse">Power Meter</div>
<div className="animate-glow">Golden Aura</div>
<div className="animate-float">Floating Text</div>
```

### Using Icons (lucide-react)
```typescript
import { Zap, Heart, Shield } from 'lucide-react'

export function Stats() {
  return (
    <>
      <Zap className="text-saiyan-gold" />
      <Heart className="text-red-500" />
      <Shield className="text-saiyan-blue" />
    </>
  )
}
```

### Using State Management (zustand)
```typescript
import { create } from 'zustand'

interface CharacterStore {
  powerLevel: number
  setPowerLevel: (level: number) => void
}

const useCharacterStore = create<CharacterStore>((set) => ({
  powerLevel: 0,
  setPowerLevel: (level) => set({ powerLevel: level }),
}))
```

### Using API with Axios
```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export async function getCharacters() {
  const { data } = await api.get('/characters')
  return data
}
```

### Using React Router
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/characters" element={<Characters />} />
      </Routes>
    </BrowserRouter>
  )
}
```

## Verification Status

All setup steps verified:
- ✓ Vite project created with React + TypeScript
- ✓ All dependencies installed successfully
- ✓ Tailwind CSS configured with custom theme
- ✓ TypeScript paths configured
- ✓ Vite configuration complete
- ✓ HTML updated with fonts
- ✓ Global styles configured
- ✓ Production build successful
- ✓ Dev server starts without errors

## Next Development Steps

1. Create src/components/ for reusable UI components
2. Create src/pages/ for page components
3. Set up src/store/ for Zustand stores
4. Create src/services/api.ts for API calls
5. Configure React Router in App.tsx
6. Build page layouts and components
7. Connect to backend API at http://localhost:8000

## Important Notes

- Backend must run on port 8000 for API proxy to work
- Frontend dev server uses port 5173
- Build output is in the `dist/` directory
- All TypeScript files support strict mode
- Hot Module Replacement (HMR) enabled during development
- Production build is optimized and tested

Ready for component development!
