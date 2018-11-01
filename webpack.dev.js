const baseConfig = require('./webpack.base.js');
var path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const buildModeLocalJSONFileMap = require('./buildModeLocalJSONFileMap.js');

module.exports = Object.assign({}, baseConfig, {
	mode: 'development',
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
		new CopyWebpackPlugin(buildModeLocalJSONFileMap()),
		new HtmlWebpackPlugin({
			hash: true,
			template: 'src/index.html'
		})
	]
});