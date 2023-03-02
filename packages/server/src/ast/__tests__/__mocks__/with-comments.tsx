export default function WithComments() {
  return (
    // Hello there
    <mesh visible>
      <boxGeometry />
    </mesh>
    // Oh no!
  );
}

export function AnotherOne() {
  return (
    // OK
    <mesh visible={true} castShadow={false} />
  );
}
