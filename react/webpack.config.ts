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
      "@config": resolve(__dirname, 'src/config/'),
      "@domain": resolve(__dirname, 'src/domain/'),
      "@hooks": resolve(__dirname, 'src/hooks/'),
      "@public": resolve(__dirname, 'src/public/'),
      "@services": resolve(__dirname, 'src/services/'),
      "@test": resolve(__dirname, 'test/')
    },
  },
  devServer: {
    contentBase: join(__dirname, "./build/"),
    hot: true,
    compress: true,
    historyApiFallback: true,
    port: 3000,
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
        use: {
          loader: 'swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                dynamicImport: true,
                tsx: true,
              },
            },
          },
        },
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
