/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        w: {
          // Page & surfaces
          canvas:        '#ffffff',   // page background (pure white)
          surface:       '#ffffff',   // card surface
          'surface-alt': '#f0f0f3',   // KPI card bg + row hover
          // Borders
          border:        '#e8e8ed',   // neutral border
          // Text
          hi:            '#202024',   // primary text
          mid:           '#6b7280',   // secondary text / labels
          muted:         '#9ca3af',   // table headers / subtle
          subtle:        '#c4c7ce',   // very subtle
          // Brand blue
          blue:          '#1E7AF0',
          'blue-hover':  '#1a6dd8',
          'blue-bg':     '#E8F1FF',   // selected / tint bg
          'blue-border': '#BFD8FF',   // selected border
          'blue-text':   '#1E4E8C',   // selected text
          'blue-light':  '#E8F1FF',
          // Status — warm palette
          good:          '#256B3A',
          'good-bg':     '#E7F6EA',
          warn:          '#7A5200',
          'warn-bg':     '#FFF2CC',
          poor:          '#9B2335',
          'poor-bg':     '#FFE8EA',
        },
      },
      fontFamily: {
        sans:     ['var(--font-inter)', 'Inter', '-apple-system', 'sans-serif'],
        walsheim: ['GT Walsheim', 'var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04)',
      },
      borderRadius: {
        card: '16px',
      },
    },
  },
  plugins: [],
}
