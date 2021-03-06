var path = require('path')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')


// Constant with our paths
const paths = {
  DIST: path.resolve(__dirname, 'public/dist'),
  JS: path.resolve(__dirname, 'modules'),
}

module.exports = {
  entry: path.join(paths.JS, 'main.js'),
  output: {
    path: paths.DIST,
    filename: 'app.bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  plugins: [
    new UglifyJSPlugin({
      parallel: true
    })
  ],
  // https://webpack.js.org/configuration/dev-server/
  devServer: {
    https: true
  },
  stats: {
    colors: true
  },
  devtool: '#source-map'
}
