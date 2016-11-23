var webpack = require('webpack');
var path = require('path');

var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var env = process.env.WEBPACK_ENV;

var libraryName = 'libphonenumber-js';
var outputFile;

var plugins = [];

if (env === 'build') {
  plugins.push(new UglifyJsPlugin({ minimize: true }));
  outputFile = libraryName + '.min.js';
} else {
  outputFile = libraryName + '.js';
}

var config = {
  entry: __dirname + '/index.es6.js',
  devtool: 'source-map',
  output: {
    path: __dirname + '/bundle',
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    loaders: [
      {
        test: /(\.js)$/,
        loader: 'babel',
        exclude: /node_modules/
      }
    ]
  },
  externals: {
      // Use external version of React
      "react": "React",
      "react-dom": "ReactDOM"
  }
};

module.exports = config;