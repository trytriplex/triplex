export default function Box() {
  return (
    <>
      <mesh
        position={[1.2816450082106403, 0, 0]}
        rotation={[0.7524870368746409, 0, 0]}
      >
        <boxGeometry args={[1, 1, 1]} />
      </mesh>

      <mesh
        position={[-2, 0, 1.1383469861879691]}
        rotation={[
          -1.4859001851210627, 0.06844944286697456, 0.6769971070319423,
        ]}
      >
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
    </>
  );
}
