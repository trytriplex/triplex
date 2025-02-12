/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
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
    <mesh castShadow={false} visible={true} />
  );
}
