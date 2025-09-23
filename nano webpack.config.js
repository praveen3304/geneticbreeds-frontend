const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, use: { loader: 'babel-loader' } },
      { test: /\.css$/, use: ['style-loader','css-loader'] },
      { test: /\.(png|jpg|jpeg|gif)$/i, type: 'asset/resource' }
    ]
  },
  devServer: {
    static: { directory: path.join(__dirname, 'public') },
    historyApiFallback: true,
    port: 3000,
    proxy: { '/api': 'http://localhost:10000' }
  }
};


