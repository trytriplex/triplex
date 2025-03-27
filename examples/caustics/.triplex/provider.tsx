import { ReactNode } from "react";
import "@react-three/postprocessing";
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";

export function CanvasProvider({
  children,
  postProcessing = true,
}: {
  children: ReactNode;
  postProcessing?: boolean;
}) {
  return (
    <>
      <EffectComposer enabled={postProcessing}>
        <DepthOfField
          focusDistance={0}
          focalLength={0.02}
          bokehScale={2}
          height={480}
        />
        <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
      {children}
    </>
  );
}
