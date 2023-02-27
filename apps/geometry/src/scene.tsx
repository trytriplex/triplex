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
          -1.2466866852487384, 0.3325255778835592, -0.6517939595349769,
        ]}
        rotation={[
          2.1533738875424957, -0.4755261514452274, 0.22680789335122342,
        ]}
        scale={[1, 1, 1.977327619564505]}
      />
      <Cylinder
        position={[0.47835635435693047, 0, -0.5445324755430057]}
      ></Cylinder>

      <Sphere
        scale={[0.6302165233139577, 0.6302165233139577, 0.6302165233139577]}
        position={[-1.6195773093872396, 0, 1.1107193822625767]}
      />

      <RoundedBox position={[1, 0, 2]}>
        <meshStandardMaterial color="purple" />
      </RoundedBox>
    </>
  );
}
