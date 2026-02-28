/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        saiyan: {
          orange: '#FF6B00',
          'orange-light': '#FF8533',
          blue: '#1E90FF',
          'blue-light': '#4DA6FF',
          gold: '#FFD700',
          red: '#FF3333',
          silver: '#C0C0FF',
          dark: '#0A0A0F',
          darker: '#050510',
          card: '#0D0D1A',
          'card-hover': '#14142A',
          border: '#1A1A2E',
          'border-light': '#2A2A3E',
          text: '#E8E8F0',
          muted: '#6B6B80',
          // Light mode
          'light-bg': '#F5F5FA',
          'light-card': '#FFFFFF',
          'light-border': '#E0E0E8',
          'light-text': '#1A1A2E',
          'light-muted': '#6B6B80',
        }
      },
      fontFamily: {
        saiyan: ['Rajdhani', 'sans-serif'],
        power: ['Orbitron', 'monospace'],
      },
      animation: {
        'power-pulse': 'powerPulse 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'ki-burst': 'kiBurst 0.6s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scan-line': 'scanLine 2s linear infinite',
        'aura-pulse': 'auraPulse 1.5s ease-in-out infinite',
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
        kiBurst: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scanLine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        auraPulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}
