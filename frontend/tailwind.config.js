/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        poke: {
          blue: '#3B82F6',
          darkblue: '#1E3A5F',
          green: '#22C55E',
          red: '#EF4444',
          yellow: '#FACC15',
          bg: '#F0F4F8',
          panel: '#FFFFFF',
          border: '#374151',
          textbox: '#2D3748',
        },
      },
      boxShadow: {
        pixel: '4px 4px 0px 0px rgba(0,0,0,0.25)',
        'pixel-sm': '2px 2px 0px 0px rgba(0,0,0,0.25)',
      },
      borderRadius: {
        pixel: '12px',
      },
    },
  },
  plugins: [],
}
