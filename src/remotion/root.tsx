import "../App.css";

import { Composition } from "remotion";
import calculateRemotionMetadata from "./calculate-remotion-metadata";
import { HelloWorld, myCompSchema } from "./video/HelloWorld";

function RemotionRoot() {
  return (
    <>
      <Composition
        // You can take the "id" to render a video:
        // npx remotion render src/index.ts <id> out/video.mp4
        id="HelloWorld"
        component={HelloWorld}
        schema={myCompSchema}
        // Default props for the video:
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
          metadata: {
            durationInFrames: 150,
            compositionWidth: 1920,
            compositionHeight: 1080,
            fps: 30,
          },
        }}
        calculateMetadata={calculateRemotionMetadata}
      />
    </>
  );
}

export default RemotionRoot;
