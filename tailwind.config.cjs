/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        round: ['VT323', 'monospace'],
        cute: ['Silkscreen', 'monospace']
      },
      colors: {
        cream: '#fff6df',
        blush: '#ffd0df',
        candy: '#ff8fb7',
        berry: '#d95c8a',
        cocoa: '#6b3f55',
        mint: '#baf7d4',
        sky: '#bfe8ff',
        lemon: '#ffe98f',
        lilac: '#d7c5ff'
      },
      boxShadow: {
        pixel: '0 8px 0 #6b3f55',
        soft: '0 22px 55px rgba(130, 65, 92, .22)'
      },
      borderRadius: {
        tamagotchi: '32px'
      }
    }
  },
  plugins: []
};
