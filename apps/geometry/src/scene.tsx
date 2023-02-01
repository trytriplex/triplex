import Box from "./box";
import Cylinder from "./cylinder";

export default function Scene() {
  return (
    <>
      <Box
        position={[-1.7446188901829902, 0, 0]}
        rotation={[1.6897291476403498, 0, 0]}
      />
      <Cylinder position={[0.42508658432801294, 0, -0.4290780288881222]} />
    </>
  );
}
