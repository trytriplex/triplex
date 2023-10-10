/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import Box from "./box";
import Cylinder from "./cylinder";

export const SceneArrow = () => <Box />;

export function SceneAlt() {
  return <Box />;
}

const identity = <TObj extends unknown>(n: TObj): TObj => n;

export const SceneWrapped = identity(() => {
  return <Box />;
});

export default function Scene() {
  return (
    <>
      <Box
        position={[0.922_331_988_161_456_2, 0, 4.703_084_245_305_494]}
        rotation={[
          1.660_031_347_769_923, -0.078_731_158_686_700_48, -0.721_112_446_645_224_8,
        ]}
      />
      <Cylinder
        position={[0.829_472_144_190_731_3, 0, 2.699_645_083_438_267_7]}
      ></Cylinder>
      <SceneAlt />
      <SceneWrapped />
      <SceneArrow />
    </>
  );
}
