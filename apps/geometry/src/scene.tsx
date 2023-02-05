import Box from "./box";
import Cylinder from "./cylinder";

export default function Scene() {
  return (
    <>
      <Box
        position={[-0.45939357759653987, 0, 0]}
        rotation={[
          1.660031347769923, -0.07873115868670048, -0.7211124466452248,
        ]}
      />
      <Cylinder position={[0.7678249084682625, 0, 1.5407618161060368]} />
    </>
  );
}
