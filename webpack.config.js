var path = require('path');

module.exports = {
  entry: {
      utils: './src/utils.js',
      main: './src/main.js'
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
        exclude: /node_modules/,
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
  // Plugins   
    
};

