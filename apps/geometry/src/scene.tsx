import Cylinder from "@/cylinder";
import Box from "src/box";
import { RoundedBox } from "@react-three/drei";
import Sphere from "./sphere";

export function SceneAlt() {
  return (
    <>
      <Box />
    </>
  );
}

export default function Scene() {
  return (
    <>
      <SceneAlt />
      <Box
        position={[
          0.2837390246176046, -1.4629692187526093, -0.8870023805097036,
        ]}
        rotation={[
          2.1533738875424957, -0.4755261514452274, 0.22680789335122342,
        ]}
        scale={[1, 0.788966027180377, 1.977327619564505]}
      />
      <Cylinder
        position={[-1.566394995899318, 0, -3.7220017011540865]}
      ></Cylinder>

      <Sphere
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
