var path = require('path');
var baseConfig = require('./webpack.base.js');

module.exports = Object.assign({}, baseConfig, {
	mode: 'production',
	//overwrites output
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist'),
		library: '[name]',
		libraryTarget: 'window'
	}
});