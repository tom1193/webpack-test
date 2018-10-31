var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var path = require('path');
var buildModeLocalJSONFileMap = require('./buildModeLocalJSONFileMap.js');

module.exports = {
  mode: 'development',
  entry: {
    utils: './src/utils.js',
    main: './src/main.js',
    render: './src/render.js',
    stackedBarChartTable: './src/stackedBarChartTable.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    library: '[name]',
    libraryTarget: 'window'
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
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 8000,
    stats: {
        colors: true,
        chunks: false
    }
  },
  plugins: [
      new CopyWebpackPlugin(buildModeLocalJSONFileMap())  
  ]
};

