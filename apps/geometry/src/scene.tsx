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
          1.660031347769923, -0.07873115868670048, -0.7211124466452248,
        ]}
      />
      <Cylinder
        position={[0.771635947673377, 0, -1.3176235451310805]}
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
