const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          assert: require.resolve('assert/'),
          buffer: require.resolve('buffer/'),
          crypto: require.resolve('crypto-browserify'),
          http: require.resolve('stream-http'),
          https: require.resolve('https-browserify'),
          os: require.resolve('os-browserify/browser'),
          path: require.resolve('path-browserify'),
          process: require.resolve('process'), // ✅ 수정된 부분
          querystring: require.resolve('querystring-es3'),
          stream: require.resolve('stream-browserify'),
          url: require.resolve('url/'),
          util: require.resolve('util/'),
          zlib: require.resolve('browserify-zlib'),
          fs: false,
          net: false,
          tls: false
        }
      }
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process',
        Buffer: ['buffer', 'Buffer']
      })
    ]
  }
};
