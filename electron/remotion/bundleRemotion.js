import { bundle } from "@remotion/bundler";
import path from "path";
// import { enableTailwind } from "@remotion/tailwind";

// https://github.com/TuanManhCao/electron-remotion
async function bundleRemotion() {
  console.log("Bundling Remotion...");

  try {
    // Create the bundle for the composition
    const bundleLocation = await bundle({
      entryPoint: path.resolve("src/remotion/index.ts"),
      outDir: path.resolve("out/remotion-bundle"),
      webpackOverride: (config) => {
        if (config.output) {
          config.output.chunkFormat = "commonjs";
        }

        // return enableTailwind(config);
        return config;
      },
    });
    console.log("Bundle location:", bundleLocation);
  } catch (err) {
    console.error("Failed to bundle Remotion:", err);
  }
}

bundleRemotion();
