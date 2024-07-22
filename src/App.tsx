import "./App.css";

import { Player } from "@remotion/player";
import { StitchingState } from "@remotion/renderer";
import { useEffect, useState } from "react";
import { z } from "zod";
import { HelloWorld, myCompSchema } from "./remotion/video/HelloWorld";

interface RenderProgress {
  renderedFrames: number;
  encodedFrames: number;
  encodedDoneIn: number | null;
  renderedDoneIn: number | null;
  renderEstimatedTime: number;
  progress: number;
  stitchStage: StitchingState;
}

function App() {
  const [isRendering, setIsRendering] = useState(false);
  const [inputProps, setInputProps] = useState<z.infer<typeof myCompSchema>>({
    titleText: "Welcome To Electron + Remotion",
    titleColor: "#000000",
    logoColor1: "#91EAE4",
    logoColor2: "#86A8E7",
    metadata: {
      durationInFrames: 150,
      compositionWidth: 1920,
      compositionHeight: 1080,
      fps: 30,
    },
  });
  const [renderProgress, setRenderProgress] = useState<RenderProgress | null>(
    null
  );

  // Listen for render progress updates
  useEffect(() => {
    window.ipcRenderer.on(
      "RENDER_PROGRESS",
      (_event, renderProgress: RenderProgress) => {
        setRenderProgress(renderProgress);
      }
    );
    return () => {
      window.ipcRenderer.removeAllListeners("RENDER_PROGRESS");
    };
  }, []);

  const renderVideo = async () => {
    setRenderProgress({
      renderedFrames: 0,
      encodedFrames: 0,
      encodedDoneIn: null,
      renderedDoneIn: null,
      renderEstimatedTime: 0,
      progress: 0,
      stitchStage: "encoding",
    });
    setIsRendering(true);
    console.log("Rendering video...");
    const response: boolean = await window.ipcRenderer.invoke(
      "RENDER_MEDIA",
      inputProps
    );

    if (response) {
      console.log("Video rendered successfully!");
    } else {
      console.error("Failed to render video.");
    }

    setIsRendering(false);
  };

  return (
    <div className="App">
      <h1>Electron + Vite + React + Remotion</h1>
      <div className="flex flex-col items-center gap-4">
        <Player
          component={HelloWorld}
          inputProps={inputProps}
          style={{
            width: 320 * 2,
            height: 180 * 2,
          }}
          controls
          {...inputProps.metadata}
        />
        <button onClick={renderVideo} disabled={isRendering}>
          Render Video
        </button>
        {renderProgress && (
          <>
            <div className="flex flex-row gap-2 items-center justify-center text-sm">
              {isRendering ? (
                <>
                  <progress value={renderProgress.progress} max={1}></progress>
                  <p>{Math.round(renderProgress.progress * 100)}%</p>
                  <p className="text-gray-500">
                    ({Math.round(renderProgress.renderEstimatedTime / 1000)}s
                    left)
                  </p>
                </>
              ) : (
                <p>Download Complete 🎉</p>
              )}
            </div>

            <div className="flex flex-row gap-4 text-xs">
              {isRendering ? (
                <>
                  <p>
                    Status:{" "}
                    {renderProgress.stitchStage === "encoding"
                      ? "Encoding"
                      : "Muxing Audio"}
                  </p>
                  <p>Rendered Frames: {renderProgress.renderedFrames}</p>
                  <p>Encoded Frames: {renderProgress.encodedFrames}</p>
                </>
              ) : (
                <>
                  <p>Encoding Duration: {renderProgress.encodedDoneIn}ms</p>
                  <p>Render Duration: {renderProgress.renderedDoneIn}ms</p>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
