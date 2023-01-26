export default function Box() {
  return (
    <>
      <mesh position={[-2.580469294880466, 0, -2.475584516365517]}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>

      <mesh>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
    </>
  );
}
