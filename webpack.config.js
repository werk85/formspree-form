var path = require("path");

module.exports = {
	entry: {
		app: ['./demo/demo.js']
	},
	output: {
		path: path.resolve(__dirname, 'demo'),
		publicPath: '/assets/',
		filename: 'bundle.js'
	}
};