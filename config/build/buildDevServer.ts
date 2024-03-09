import path from "path";
import { BuildOptions } from "./types/config";
import type { Configuration as DevServerConfiguration } from "webpack-dev-server";

export function buildDevServer(options: BuildOptions): DevServerConfiguration {
  return {
    port: options.port,
    open: true,
    historyApiFallback: true,
    hot: true,
    liveReload: true,
    static: {
      directory: path.join(__dirname, "src"),
      watch: true,
    },
  };
}
