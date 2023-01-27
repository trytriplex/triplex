import Box from "./box";
import Cylinder from "./cylinder";

export default function Scene() {
  return (
    <>
      <Box
        position={[-2.026922801972992, 0, 0]}
        rotation={[0.7826958604857353, 0, 0]}
      />
      <Cylinder position={[-0.8242355130155601,0,-0.4290780288881222]} />
    </>
  );
}
