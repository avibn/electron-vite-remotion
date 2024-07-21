import { ipcMain } from "electron";
import log from "electron-log/main";
import render from "../remotion/render";

ipcMain.handle(
  "RENDER_MEDIA",
  async (event, inputProps: Record<string, unknown> = {}) => {
    try {
      log.info("Rendering media...");
      await render(inputProps);
      return true;
    } catch (error) {
      log.error("Failed to render media:", error);
      return false;
    }
  }
);
