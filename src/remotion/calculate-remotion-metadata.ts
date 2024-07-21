import { CalculateMetadataFunction } from "remotion";
import { z } from "zod";
import { myCompSchema } from "./video/HelloWorld";

/**
 * Calculates the metadata for a video.
 * @returns The calculated metadata object.
 */
const calculateRemotionMetadata: CalculateMetadataFunction<
  z.infer<typeof myCompSchema>
> = async ({ props }) => {
  const { durationInFrames, fps, compositionHeight, compositionWidth } =
    props.metadata;

  return {
    fps,
    durationInFrames,
    height: compositionHeight,
    width: compositionWidth,
  };
};

export default calculateRemotionMetadata;
