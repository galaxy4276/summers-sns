import { join, resolve } from 'path';
import { Configuration } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

type DevMode = 'production' | 'development' | 'none';

const WebpackConfig: Configuration = {
  name: 'react-typescript-webpack-config',
  mode: process.env.NODE_ENV as DevMode | 'development',
  entry: join(__dirname, "src", "app", "index.tsx"),
  output: {
    path: join(__dirname, "build"),
    filename: "index.bundle.js",
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      "@app": resolve(__dirname, 'src/app/'),
      "@config": resolve(__dirname, '/src/config/'),
      "@middlewares": resolve(__dirname, '/src/middlewares/'),
      "@services": resolve(__dirname, '/src/services/'),
      "@test": resolve(__dirname, '/test/')
    },
  },
  devServer: {
    contentBase: join(__dirname, "./build/"),
    hot: true,
    compress: true,
    historyApiFallback: true,
    port: 3000
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: ["swc-loader"]
      },
      {
        test: /\.(css|scss)$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: join(__dirname, "src", "index.html"),
    }),
  ]
};

export default WebpackConfig;
