import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#12102a',
        accent: '#c77dff',
        lilac: '#e0aaff',
        rose: '#ff85a1',
        champagne: '#ffd6a5',
        'text-primary': '#f5f0ff',
        'text-muted': 'rgba(245,240,255,0.70)',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [],
}

export default config
