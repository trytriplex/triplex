import Box1 from "./geometry/box";
import Cylinder from "@/geometry/cylinder";
import Box from "src/geometry/box";
import { RoundedBox, PerspectiveCamera } from "@react-three/drei";
import Sphere from "./geometry/sphere";

export function SceneAlt() {
  return (
    <>
      <Box
        position={[-0.48868437340157445, 0.5965867294072928, 1.311273188113876]}
      />
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
        scale={[1, 1, 1.977327619564505]}
        color={undefined}
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
        visible={undefined}
      >
        <meshStandardMaterial color="purple" opacity={0} />
      </RoundedBox>

      <Cylinder position={[1.4681464869137235, 0, -4.205778397787599]} />
      <Cylinder position={[-5.14749272451115, 0, -2.9618330871711818]} />
      <Box1 color={"blue"} position={1} />
      <PerspectiveCamera
        name="user-perspective"
        makeDefault
        rotation={[-0.19198621771937624, -0.002030757867083124, 0]}
        scale={[1, 1, 1]}
        position={[0, 0.6261170942410695, -0.09817127237896273]}
        zoom={1}
      />
    </>
  );
}
