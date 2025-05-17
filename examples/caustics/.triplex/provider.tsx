import {
  Bloom,
  DepthOfField,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { type ReactNode } from "react";

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
          bokehScale={2}
          focalLength={0.02}
          focusDistance={0}
          height={480}
        />
        <Bloom height={300} luminanceSmoothing={0.9} luminanceThreshold={0} />
        <Noise opacity={0.02} />
        <Vignette darkness={1.1} eskil={false} offset={0.1} />
      </EffectComposer>
      {children}
    </>
  );
}
