import webpack from "webpack";
import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
import "webpack-dev-server";

export default (env: { mode: "production" | "development"; port: number }) => {
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
      poll: 20,
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
