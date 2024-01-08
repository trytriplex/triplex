/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
