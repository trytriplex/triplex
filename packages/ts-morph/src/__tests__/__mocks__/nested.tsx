export default function Nested() {
  return (
    <group position={[1, 0, 3]}>
      <mesh position={[2, 0, 4]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="black" />
      </mesh>
    </group>
  );
}
