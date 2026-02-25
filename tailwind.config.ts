// NOTE: This project uses Tailwind CSS v4, which uses CSS-based configuration via @theme in globals.css.
// Tailwind v4 does not read this file at build time.
// KKR brand color tokens are defined in src/app/globals.css using @theme inline.
//
// This file is retained as documentation of the intended color token design.
// To use these colors, use: bg-kkr-purple, text-kkr-gold, etc.
// (These work because the CSS custom properties are registered in globals.css)

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'kkr-purple': '#3A1078',        // KKR deep purple
        'kkr-gold': '#FFD700',          // KKR gold/yellow
        'kkr-purple-light': '#5B2EA6',
        'kkr-purple-dark': '#260B52',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
