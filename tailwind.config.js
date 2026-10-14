/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: 'var(--color-brand)',
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        subtle: 'var(--color-surface-secondary)',
        primary: 'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)',
        line: 'var(--color-border)',
        expired: 'var(--color-expired-text)',
        travel: 'var(--color-travel-text)',
        danger: 'var(--color-urgent-text)',
        warning: 'var(--color-near-text)',
        success: 'var(--color-ample-text)',
      },
    },
  },
  plugins: [],
}
