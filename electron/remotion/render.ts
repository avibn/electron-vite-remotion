import { renderMedia, selectComposition } from "@remotion/renderer";
import { app, shell } from "electron";
import log from "electron-log/main";
import os from "os";
import path from "path";

let warned = false;

/**
 * Checks if the current system is using musl or glibc.
 * Copied and modified from @remotion/renderer/dist/compositor/is-musl.js
 *
 * @returns A boolean indicating whether the system is using musl.
 */
function isMusl(): boolean {
  if (!process.report && typeof Bun !== "undefined") {
    if (!warned) {
      log.warn(
        "Bun limitation: Could not determine if your Linux is using musl or glibc. Assuming glibc."
      );
    }
    warned = true;
    return false;
  }
  const report = process.report?.getReport();
  if (report && typeof report === "string") {
    if (!warned) {
      log.warn(
        "Bun limitation: Could not determine if your system is using musl or glibc. Assuming glibc."
      );
    }
    warned = true;
    return false;
  }

  if (!report) {
    return false;
  }

  try {
    const parsedReprot = JSON.parse(report);
    // Assuming glibcVersionRuntime is not present in musl
    const { glibcVersionRuntime } = parsedReprot.header || {};
    return !glibcVersionRuntime;
  } catch (error) {
    console.error("Failed to parse report as JSON", error);
    return false;
  }
}

/**
 * Retrieves the module name based on the current os and architecture.
 *
 * Copied and modified from @remotion/renderer/dist/compositor/get-executable-path.js
 *
 * @returns The module name.
 * @throws An error if the operating system or architecture is unsupported.
 */
function getModuleName(): string {
  switch (process.platform) {
    case "win32":
      switch (process.arch) {
        case "x64":
          return "@remotion/compositor-win32-x64-msvc";
        default:
          throw new Error(
            `Unsupported architecture on Windows: ${process.arch}`
          );
      }
    case "darwin":
      switch (process.arch) {
        case "x64":
          return "@remotion/compositor-darwin-x64";
        case "arm64":
          return "@remotion/compositor-darwin-arm64";
        default:
          throw new Error(`Unsupported architecture on macOS: ${process.arch}`);
      }
    case "linux": {
      const musl = isMusl();
      switch (process.arch) {
        case "x64":
          if (musl) {
            return "@remotion/compositor-linux-x64-musl";
          }
          return "@remotion/compositor-linux-x64-gnu";
        case "arm64":
          if (musl) {
            return "@remotion/compositor-linux-arm64-musl";
          }
          return "@remotion/compositor-linux-arm64-gnu";
        default:
          throw new Error(`Unsupported architecture on Linux: ${process.arch}`);
      }
    }
    default:
      throw new Error(
        `Unsupported OS: ${process.platform}, architecture: ${process.arch}`
      );
  }
}

// Get the binaries directory
let binariesDirectory: string | null = null;
if (app.isPackaged) {
  const pathName = `node_modules/${getModuleName()}`;

  // Set the binaries directory
  binariesDirectory = path.join(
    app.getAppPath().replace("app.asar", "app.asar.unpacked"),
    pathName
  );
  log.info(`Binaries directory: ${binariesDirectory}`);
}

/**
 * Renders a video composition with the given input props.
 * @param inputProps - The input props for the composition.
 * @returns A Promise that resolves when the video rendering is complete.
 */
export default async function render(inputProps: Record<string, unknown>) {
  const compositionId = "HelloWorld";

  const bundleLocation = path.join(app.getAppPath(), "out/remotion-bundle");
  log.info(`Bundle location: ${bundleLocation}`);

  // Get the composition to render
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: compositionId,
    inputProps,
    binariesDirectory,
  });
  log.info(`Composition selected: ${composition.id}`);

  // Get the downloads folder path
  const homeDirectory = os.homedir();
  const downloadsFolderPath = path.join(
    homeDirectory,
    "Downloads/output-remotion.mp4"
  );
  log.info(`Downloads folder path: ${downloadsFolderPath}`);

  // Render the video with input props
  log.info(`Rendering video: ${compositionId}.mp4`);
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: downloadsFolderPath,
    inputProps,
    binariesDirectory,
  });
  log.info(`Video rendered: ${compositionId}.mp4`);

  shell.showItemInFolder(downloadsFolderPath);
  log.info("Shell opened /downloads folder");
}
