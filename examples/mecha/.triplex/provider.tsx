import { Bloom, EffectComposer } from "@react-three/postprocessing";

export default function Provider({
  children,
  bloom = true,
}: {
  bloom?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <>
      <color args={["#3f4859"]} attach="background" />
      {children}

      {bloom && (
        <EffectComposer>
          <Bloom
            intensity={0.2}
            luminanceThreshold={0}
            luminanceSmoothing={0.9}
            height={300}
          />
        </EffectComposer>
      )}
    </>
  );
}
