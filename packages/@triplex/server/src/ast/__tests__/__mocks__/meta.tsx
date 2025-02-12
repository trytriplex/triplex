/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const AnyProps: any = (_: any) => {
  return null;
};

export function Test() {
  return <AnyProps />;
}
