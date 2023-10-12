import { Sky, Stars } from "@react-three/drei";

export default function Provider({
  children,
  rayleigh = 0.5,
  stars = true,
}: {
  children: React.ReactNode;
  /**
   * Rayleigh scattering causes the blue color of the daytime sky and the
   * reddening of the Sun at sunset.
   *
   * @min 0
   * @max 10
   */
  rayleigh?: number;
  /**
   * Shows stars in the skybox when enabled.
   */
  stars?: boolean;
}) {
  return (
    <>
      <Sky
        azimuth={180}
        distance={450_000}
        inclination={0}
        rayleigh={rayleigh}
      />
      {stars && (
        <Stars
          count={5000}
          depth={50}
          factor={6}
          fade
          radius={100}
          saturation={0}
          speed={1}
        />
      )}
      {children}
    </>
  );
}
