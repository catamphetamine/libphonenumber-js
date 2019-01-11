import path from 'path'

let inputFilePath
let outputFileName

switch (process.env.LIBPHONENUMBER_FLAVOR) {
  case 'min':
    inputFilePath = 'min/index'
    outputFileName = 'libphonenumber-min'
    break
  case 'max':
    inputFilePath = 'max/index'
    outputFileName = 'libphonenumber-max'
    break
  case 'mobile':
    inputFilePath = 'mobile/index'
    outputFileName = 'libphonenumber-mobile'
    break
  // Legacy bundle (legacy default export).
  default:
    inputFilePath = 'index.es6'
    outputFileName = 'libphonenumber-js.min'
    break
}

export default {
  entry: path.join(__dirname, `${inputFilePath}.js`),
  devtool: 'source-map',
  output: {
    path           : path.join(__dirname, 'bundle'),
    filename       : `${outputFileName}.js`,
    library        : 'libphonenumber',
    libraryTarget  : 'umd',
    umdNamedDefine : true
  },
  module: {
    rules: [{
      test    : /(\.js)$/,
      loader  : 'babel-loader',
      exclude : /node_modules/
    }]
  },
  externals: {
    // Use external version of React
    "react"     : "React",
    "react-dom" : "ReactDOM"
  }
}