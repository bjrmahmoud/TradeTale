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
        obsidian: {
          base: '#0B0F17',     // Main Canvas
          surface: '#121824',  // Elevated Card Low
          elevated: '#161F30', // Elevated Card Mid
          highlight: '#1F293D',// Border / Outline Hover
          border: '#243047',   // Structural Divider
          muted: '#2A374F',
        },
        trade: {
          emerald: '#10B981',  // Discipline / Win / Compliant
          'emerald-glow': 'rgba(16, 185, 129, 0.18)',
          'emerald-dark': '#065F46',
          crimson: '#EF4444',  // Rule Breach / Loss / Danger
          'crimson-glow': 'rgba(239, 68, 68, 0.18)',
          'crimson-dark': '#991B1B',
          amber: '#F59E0B',    // Warning / Early Exit Leak
          'amber-glow': 'rgba(245, 158, 11, 0.18)',
          slate: '#94A3B8',    // Inactive Monospace Text
          cyan: '#06B6D4',
          indigo: '#6366F1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Geist Mono', 'monospace'],
      },
      boxShadow: {
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.3)',
        'glow-crimson': '0 0 20px -3px rgba(239, 68, 68, 0.3)',
        'command': '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
      }
    },
  },
  plugins: [],
}
