const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    popup: './src/popup.js',
    background: './src/background.js'
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.css$/, 
        use: [
          {loader: 'style-loader'},
          {loader: 'css-loader'}
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['popup'],
      filename: 'popup.html',
      template: './src/popup.html'
    }),
    new HtmlWebpackPlugin({
      chunks: ['background'],
      filename: 'background.html',
      template: './src/background.html'
    })
  ]
};
