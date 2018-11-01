var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var buildModeLocalJSONFileMap = require('./buildModeLocalJSONFileMap.js');

module.exports = {
  entry: {
      utils: './src/utils.js',
      main: './src/main.js',
      render: './src/render.js',
      stackedBarChartTable: './src/stackedBarChartTable.js'
  },
  output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
  },
  // Loaders
  module: {
    rules : [
      // JavaScript/JSX Files
      {
        test: /\.js$/,
        exclude: '/node_modules/',
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
     // CSS Files
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }

    ]
  }
};

