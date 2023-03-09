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
        position={[1.783262123894276, -1.4629692187526093, -0.7825792893314139]}
        rotation={[
          2.1533738875424957, -0.4755261514452274, 0.22680789335122342,
        ]}
        scale={[1, 0.788966027180377, 1.977327619564505]}
      />
      <Cylinder
        position={[-0.06621738128743582, 0, -5.957463491171135]}
      ></Cylinder>

      <Sphere
        scale={[0.6302165233139577, 0.6302165233139577, 0.6302165233139577]}
        position={[
          -1.6084245629177398, 0.0017712872227060306, -0.608734106860088,
        ]}
      />

      <RoundedBox
        position={[2.7013067158410884, 0, 1.9198548833251383]}
        rotation={[0, 0.555099417670126, 0]}
        scale={[1, 1.469696188700793, 1]}
      >
        <meshStandardMaterial color="purple" />
      </RoundedBox>
    </>
  );
}
