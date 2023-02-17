import Box from "./box";
import Cylinder from "./cylinder";

export default function Scene() {
  return (
    <>
      <Box
        position={[0.9223319881614562, 0, 4.703084245305494]}
        rotation={[
          1.660031347769923, -0.07873115868670048, -0.7211124466452248,
        ]}
      />
      <Cylinder position={[0.8294721441907313, 0, 2.6996450834382677]} />

      <group position={[1, 0, 3]}>
        <mesh position={[2, 0, 4]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="black" />
        </mesh>
      </group>
    </>
  );
}
