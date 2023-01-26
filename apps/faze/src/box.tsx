export default function Box() {
  return (
    <>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>

      <mesh position={[-2, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
    </>
  );
}
