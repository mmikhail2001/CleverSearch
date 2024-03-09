import path from "path";
import { ResolveOptions } from "webpack";

export function buildResolvers(): ResolveOptions {
  return {
    extensions: [".tsx", ".ts", ".js"],
    modules: [path.resolve("./node_modules"), path.resolve("./src")],
  };
}
