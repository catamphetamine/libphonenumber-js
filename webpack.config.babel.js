import webpack from 'webpack'
import path from 'path'

const library_name = 'libphonenumber-js'
const global_variable_name = 'libphonenumber'

export default
{
  entry: path.join(__dirname, '/index.es6.js'),
  devtool: 'source-map',
  output:
  {
    path           : path.join(__dirname, '/bundle'),
    filename       : `${library_name}.min.js`,
    library        : global_variable_name,
    libraryTarget  : 'umd',
    umdNamedDefine : true
  },
  module:
  {
    rules:
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
  }
}