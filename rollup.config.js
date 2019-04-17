export default [{
  input: 'src/popup.js',
  output: {
    file: 'dist/popup.js',
    format: 'iife',
    compact: true,
    sourcemap: true
  }
}, {
  input: 'src/background.js',
  output: {
    file: 'dist/background.js',
    format: 'iife',
    compact: true,
    sourcemap: true
  }
}];
