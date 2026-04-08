/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Share Tech Mono"', 'monospace'],
        sans: ['"Barlow"', 'sans-serif'],
      },
      colors: {
        bg:     '#f8fafc',
        panel:  '#ffffff',
        border: '#e6e9ef',
        accent: '#2A4929',
        warn:   '#ff7a59',
        muted:  '#6b7280',
        text:   '#0f172a',
        'dark-spruce': '#2A4929',
        'dusty-olive': '#768B75',
        'hunter-green': '#4A6A44',
        'dusty-olive-2': '#5A7358',
        'lb-white': '#FEFEFE',
      },
      backgroundImage: {
        'gradient-top': 'linear-gradient(0deg, #2A4929, #768B75, #4A6A44, #FEFEFE, #5A7358)',
        'gradient-right': 'linear-gradient(90deg, #2A4929, #768B75, #4A6A44, #FEFEFE, #5A7358)',
        'gradient-bottom': 'linear-gradient(180deg, #2A4929, #768B75, #4A6A44, #FEFEFE, #5A7358)',
        'gradient-left': 'linear-gradient(270deg, #2A4929, #768B75, #4A6A44, #FEFEFE, #5A7358)',
        'gradient-top-right': 'linear-gradient(45deg, #2A4929, #768B75, #4A6A44, #FEFEFE, #5A7358)',
        'gradient-bottom-right': 'linear-gradient(135deg, #2A4929, #768B75, #4A6A44, #FEFEFE, #5A7358)',
        'gradient-top-left': 'linear-gradient(225deg, #2A4929, #768B75, #4A6A44, #FEFEFE, #5A7358)',
        'gradient-bottom-left': 'linear-gradient(315deg, #2A4929, #768B75, #4A6A44, #FEFEFE, #5A7358)',
        'gradient-radial': 'radial-gradient(circle, #2A4929 0%, #768B75 25%, #4A6A44 50%, #FEFEFE 75%, #5A7358 100%)',
      },
    },
  },
  plugins: [],
}
