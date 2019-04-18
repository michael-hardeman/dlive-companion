import css from 'rollup-plugin-css-only';

export default [{
  input: 'src/popup.js',
  output: {
    file: 'dist/popup.js',
    format: 'iife',
    compact: true,
    watch: {
      include: 'src/**/*.css'
    }
  },
  plugins: [
    css({ output: 'dist/popup.css' })
  ]
}, {
  input: 'src/background.js',
  output: {
    file: 'dist/background.js',
    format: 'iife',
    compact: true
  }
}];
