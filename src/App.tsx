import "./App.css";

import { Player } from "@remotion/player";
import { useState } from "react";
import { z } from "zod";
import { HelloWorld, myCompSchema } from "./remotion/video/HelloWorld";

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

  const renderVideo = async () => {
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
      <div className="card flex flex-col items-center gap-4">
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
      </div>
    </div>
  );
}

export default App;
