/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import Box from "./box";
import { Named } from "./named";
import { Named as Remapped } from "./named";

export function SceneAlt(_: { color?: string }) {
  return <Box />;
}

export default function Scene() {
  return (
    <>
      <Box
        position={[0.9223319881614562, 0, 4.703084245305494]}
        rotation={[
          1.660031347769923, -0.07873115868670048, -0.7211124466452248,
        ]}
      />
      <Named />
      <Remapped />
      <SceneAlt />
    </>
  );
}
