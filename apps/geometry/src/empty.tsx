import { forwardRef, memo } from "react";

const WhiteBox = forwardRef(() => (
  <>
    <group position={[-1.1867087148686504, 0, 1.222373365857885]}>
      <mesh position={[2.0382367942283475, 0, -0.651687666889325]}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
    </group>
  </>
));

export const AnotherBox = memo(() => (
  <mesh position-x={1}>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="pink" />
  </mesh>
));

export default WhiteBox;
