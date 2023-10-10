export default function Cylinder({
  position,
}: {
  position?: [number, number, number];
}) {
  return (
    <mesh castShadow position={position} receiveShadow>
      <cylinderGeometry args={[1, 1, 2, 10, 1]} />
      <meshStandardMaterial color="#eac7c7" />
    </mesh>
  );
}
