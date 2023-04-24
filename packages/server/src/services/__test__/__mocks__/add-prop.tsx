import { RoundedBox } from "@react-three/drei";

export default function Scene() {
  return (
    <>
      <RoundedBox
        position={[0.283739024, -1.4629692187526093, -0.8870023805097036]}
        rotation={[
          2.1533738875424957, -0.4755261514452274, 0.22680789335122342,
        ]}
      />
      <RoundedBox></RoundedBox>

      <RoundedBox
        scale={[0.630216523313958, 0.6302165233139577, 0.6302165233139577]}
        position={[
          -2.813889551893372, 0.0017712872227060306, 2.1329409413977354,
        ]}
      />

      <RoundedBox
        position={[3, 0, 2]}
        rotation={[0, 0.25, 0]}
        scale={[1, 1.5, 1]}
      >
        <meshStandardMaterial color="purple" />
      </RoundedBox>
    </>
  );
}

export const Box = () => null;

export const Nested = () => (
  <>
    <RoundedBox
      position={[3, 0, 2]}
      rotation={[0, 0.25, 0]}
      scale={[1, 1.5, 1]}
    >
      <meshStandardMaterial color="purple" />
    </RoundedBox>
  </>
);

export function AddComponent() {
  return (
    <>
      <RoundedBox />
      <RoundedBox></RoundedBox>
    </>
  );
}
