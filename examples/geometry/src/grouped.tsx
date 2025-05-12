import Box from "src/geometry/box";
import Cylinder from "./geometry/cylinder";

export function Grouped() {
  return (
    <>
      <Cylinder position={[0, 0, -4]} />
      <Box position={[1, 1, 1]} scale={[1, 1.547_717_222_538_07, 1]} />
    </>
  );
}
