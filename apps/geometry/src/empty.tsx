import { forwardRef, memo } from "react";

const WhiteBox = forwardRef(() => (
  <>
    <group
      position={[2.7509205898794513, 0, 1.222373365857885]}
      scale={[1, 1.6733590852826437, 1]}
    >
      <mesh
        position={[1.1016973624829758, 0, -0.651687666889325]}
        scale={[0.5863344002709667, 0.6109960883391412, 1]}
        rotation={[0, -0.5567149687333598, 0]}
      >
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
    </group>
  </>
));

export const AnotherBox = memo(() => (
  <mesh position-x={-2}>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="pink" />
  </mesh>
));

export function Empty() {
  return (
    <>
      <mesh
        position={[-1.6262149864382707, 0, 0]}
        rotation={[0, 0, -0.5833472919033484]}
        scale={[2.4353118252497836, 2.4353118252497836, 2.4353118252497836]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="pink" />
      </mesh>
      <pointLight
        position={[-1.9975799090485649, 2.588841540204465, 2.6706718717036817]}
      />
    </>
  );
}

export default WhiteBox;
