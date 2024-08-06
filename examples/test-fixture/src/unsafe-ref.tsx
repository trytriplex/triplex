/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// eslint-disable-next-line react/display-name

import { useLayoutEffect, useRef, useState } from "react";
import { type Mesh } from "three";

const visible = true;

export const UnsafeRefAccess = () => {
  const ref = useRef<Mesh>(null!);
  const [, setRe] = useState(false);

  useLayoutEffect(() => {
    ref.current.position.x += 0.01;

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ref.current.position.x -= 0.01;
    };
  });

  useLayoutEffect(() => {
    setRe(true);
  }, []);

  return (
    <mesh ref={ref} visible={visible}>
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  );
};
