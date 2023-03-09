import Box from "src/box";
import { Cylinder } from "./cylinder";

export function Grouped() {
  return (
    <>
      <Cylinder position={[0, 0, -4]} />
      <Box position={[1, 1, 1]} scale={[1, 1.5477172225380673, 1]} />
    </>
  );
}
