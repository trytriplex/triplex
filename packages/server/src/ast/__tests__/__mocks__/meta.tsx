export function MetaNamed() {
  return (
    <>
      <mesh position-x={10}>
        <spotLight />
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="pink" />
      </mesh>
    </>
  );
}

export default function MetaDefault() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="pink" />
    </mesh>
  );
}

function JsDocMeta(_: {
  /**
   * @min -10
   * @max 10
   * @another true
   * @test yes
   */
  posX: number;
}) {
  return null;
}

export function UseJsDocMeta() {
  return <JsDocMeta posX={5} />;
}
