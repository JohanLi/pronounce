const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  watch: true,
  entry: {
    index: './src/index.js',
    serviceWorker: './src/serviceWorker.js',
    iframe: './src/iframe.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './manifest.json', to: './' },
        { from: './pronounce.png', to: './' },
        { from: './src/iframe.html', to: './' },
      ],
    }),
  ],
};
