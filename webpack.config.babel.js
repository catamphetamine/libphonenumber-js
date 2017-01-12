import webpack from 'webpack'
import path from 'path'

const env = process.env.WEBPACK_ENV

const library_name = 'libphonenumber-js'
const global_variable_name = 'libphonenumber'

let output_file

const plugins = []

if (env === 'build')
{
  plugins.push(new webpack.optimize.UglifyJsPlugin
  ({
    minimize  : true,
    sourceMap : true
  }))

  output_file = `${library_name}.min.js`
}
else
{
  output_file = `${library_name}.js`
}

const config =
{
  entry: path.join(__dirname, '/index.es6.js'),
  devtool: 'source-map',
  output:
  {
    path           : path.join(__dirname, '/bundle'),
    filename       : output_file,
    library        : global_variable_name,
    libraryTarget  : 'umd',
    umdNamedDefine : true
  },
  module:
  {
    loaders:
    [{
      test    : /(\.js)$/,
      loader  : 'babel-loader',
      exclude : /node_modules/
    }]
  },
  externals:
  {
    // Use external version of React
    "react"     : "React",
    "react-dom" : "ReactDOM"
  },
  plugins
}

module.exports = config