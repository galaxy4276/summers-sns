import { join } from 'path';
import { Configuration } from 'webpack';
// @ts-ignore TODO: esModuleInterop Lint 적용이 안 됨
import HtmlWebpackPlugin from 'html-webpack-plugin';

type DevMode = 'production' | 'development' | 'none';

const WebpackConfig: Configuration = {
  name: 'react-typescript-webpack-config',
  mode: process.env.NODE_ENV as DevMode | 'development',
  entry: join(__dirname, "src", "app", "index.tsx"),
  output: {
    path: join(__dirname, "build"),
    filename: "index.bundle.js"
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@api": "./src/api/",
      "@config": "./src/config/",
      "@middlewares": "./src/middlewares/",
      "@services": "./src/services/",
      "@test": "./test"
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
