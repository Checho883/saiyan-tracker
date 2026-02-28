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
