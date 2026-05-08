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
        bone: {
          bg:        '#f5f0e8',
          alt:       '#ede8e0',
          border:    '#d8d0c0',
          hi:        '#1a1a14',
          mid:       '#887860',
          good:      '#1a6614',
          'good-bg': 'rgba(26,102,20,0.1)',
          warn:      '#cc5500',
          'warn-bg': 'rgba(204,85,0,0.08)',
          poor:      '#cc1111',
          'poor-bg': 'rgba(204,17,17,0.08)',
          'info-bg': 'rgba(26,26,20,0.06)',
        },
      },
      fontFamily: {
        bebas: ['var(--font-bebas)', 'cursive'],
        sans:  ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
