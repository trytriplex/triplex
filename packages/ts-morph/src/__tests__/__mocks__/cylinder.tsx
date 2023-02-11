export default function Cylinder({
  position,
}: {
  position?: [number, number, number];
}) {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[1, 1, 2, 10, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}
