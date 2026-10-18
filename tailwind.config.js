/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Montserrat"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        space: {
          canvas: '#050B16',     // Deep Space Black (Canvas Surface)
          card: '#0E1726',       // Card Surfaces
          elevated: '#162032',   // Modal / Elevated Surfaces
          text: '#FFFFFF',       // Primary Text (19.2:1 AAA)
          secondary: '#E2E8F0',  // Secondary Text (14.8:1 AAA)
          muted: '#CBD5E1',      // Muted Text / Captions (10.9:1 AAA)
          primary: '#A78BFA',    // Primary Button Fill (8.78:1 AAA w/ #050B16)
          primaryHover: '#C4B5FD',
          cyan: '#00F2FE',       // Secondary Accent Electric Cyan (14.2:1 AAA)
          border: '#94A3B8',     // Border Boundaries (>= 3.0:1 SC 1.4.11)
        },
        badge: {
          pendingBg: '#E2E8F0',
          pendingText: '#050B16',
          pendingBorder: '#CBD5E1',
          reviewBg: '#FEF3C7',
          reviewText: '#78350F',
          reviewBorder: '#FBBF24',
          progressBg: '#E0F2FE',
          progressText: '#075985',
          progressBorder: '#38BDF8',
          resolvedBg: '#D1FAE5',
          resolvedText: '#064E3B',
          resolvedBorder: '#34D399',
          rejectedBg: '#FEE2E2',
          rejectedText: '#7F1D1D',
          rejectedBorder: '#F87171',
        }
      },
      fontSize: {
        'h1': ['32px', { lineHeight: '1.25', fontWeight: '600' }],
        'h2': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      borderWidth: {
        'wcag': '1.5px',
      }
    },
  },
  plugins: [],
};
