module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', 
    './public/index.html'
  ], 
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: true,  // Restablece el estilo base de Tailwind (habilitado por defecto)
  },
}
