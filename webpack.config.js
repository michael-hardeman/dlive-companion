const path = require('path');

module.exports = {
  entry: {
    popup: './src/popup.js',
    background: './src/background.js'
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/dist'
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/
    }]
  }
};
