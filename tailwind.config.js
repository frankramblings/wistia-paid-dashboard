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
          canvas:      '#f8f8f9',
          surface:     '#ffffff',
          border:      '#e3e4e5',
          hi:          '#181d1f',
          mid:         '#6b7280',
          blue:        '#2949E5',
          'blue-bg':   'rgba(41,73,229,0.08)',
          'blue-light':'#eef0fd',
          good:        '#268713',
          'good-bg':   'rgba(38,135,19,0.1)',
          warn:        '#D1451A',
          'warn-bg':   'rgba(209,69,26,0.1)',
          poor:        '#e02525',
          'poor-bg':   'rgba(224,37,37,0.1)',
        },
      },
      fontFamily: {
        plex:  ['var(--font-plex)', 'IBM Plex Sans', '-apple-system', 'sans-serif'],
        bebas: ['var(--font-bebas)', 'cursive'],
        sans:  ['var(--font-plex)', 'IBM Plex Sans', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 4px 1px rgba(0,0,0,0.07)',
      },
    },
  },
  plugins: [],
}
