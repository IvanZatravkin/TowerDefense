// webpack config using esbuild-loader

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ESBuildMinifyPlugin } = require("esbuild-loader");

module.exports = {
  mode: "production",
  entry: "./src/index.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  devtool: "source-map",
  plugins: [new HtmlWebpackPlugin({ title: "Tower Defense" }), new ESBuildMinifyPlugin()],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    fallback: { crypto: false },
    // resolve from project root
    modules: [path.resolve(__dirname, "src"), "node_modules"],
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        loader: "esbuild-loader",
        options: {
          loader: "tsx",
          target: "es2018",
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
        use: ["file-loader"],
      },
      {
        test: /\.(frag|vert)$/,
        type: "asset/source",
      },
    ],
  },
  // allow connections from everywhere
  devServer: {
    host: "0.0.0.0",
  },
};
