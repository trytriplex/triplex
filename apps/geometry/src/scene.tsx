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
          -1.2062054118372048, 0.3325255778835592, -0.7825792893314139,
        ]}
        rotation={[
          2.1533738875424957, -0.4755261514452274, 0.22680789335122342,
        ]}
        scale={[1, 0.788966027180377, 1.977327619564505]}
      />
      <Cylinder
        position={[3.5777482780909686, 0, -8.044594000115685]}
      ></Cylinder>

      <Sphere
        scale={[0.6302165233139577, 0.6302165233139577, 0.6302165233139577]}
        position={[-1.4056034952769192, 0, 0.45520598241447896]}
      />

      <RoundedBox
        position={[0.11520121778114789, 0, 1.9198548833251383]}
        rotation={[0, 0.555099417670126, 0]}
        scale={[1, 1.469696188700793, 1]}
      >
        <meshStandardMaterial color="purple" />
      </RoundedBox>
    </>
  );
}
