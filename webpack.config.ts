import webpack from "webpack";
import { buildWebpackConfig } from "./config/build/buildWebpackConfig";
import { BuildEnv, BuildPaths } from "./config/build/types/config";
import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";

export default (env: BuildEnv) => {
  const paths: BuildPaths = {
    entry: path.resolve(__dirname, "src", "index.tsx"),
    build: path.resolve(__dirname, "build"),
    html: path.resolve(__dirname, "public", "index.html"),
  };

  const mode = env.mode || "development";
  const isDev = mode === "development";
  const PORT = env.port || 3000;

  const config: webpack.Configuration = {
    mode: "development",
    entry: "./src/index.tsx",
    output: {
      filename: "[name][contenthash].js",
      path: path.resolve(__dirname, "build"),
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.(s(a|c)ss)$/,
          include: path.resolve(__dirname, "src"),
          use: ["style-loader", "css-loader", "sass-loader"],
        },
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          include: path.resolve(__dirname, "src"),
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: "Development",
        template: "./public/index.html",
      }),
    ],
    devtool: "inline-source-map",
    devServer: {
      static: "./build",
      port: PORT,
    },
    watch: true,
    watchOptions: {
      ignored: /node_modules/,
      poll: 100,
    },
    resolve: {
      extensions: [".js", ".ts", ".tsx"],
      plugins: [
        new TsconfigPathsPlugin({
          /* options: see below */
        }),
      ],
    },
    optimization: {
      runtimeChunk: "single",
    },
  };

  return config;
};
