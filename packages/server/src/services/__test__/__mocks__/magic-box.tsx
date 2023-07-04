/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { ReactNode } from "react";

export const App = () => (
  <mesh castShadow receiveShadow>
    <SideMaterial rotation={[0, 0, 0]} bgColor="orange" index={0}>
      <torusGeometry args={[0.65, 0.3, 64]} />
    </SideMaterial>
  </mesh>
);

export function SideMaterial(_: {
  rotation: [number, number, number];
  bgColor: string;
  children: ReactNode;
  index: number;
}) {
  return null;
}
