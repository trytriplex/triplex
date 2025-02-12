/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type ReactNode } from "react";

export const App = () => (
  <mesh castShadow receiveShadow>
    <SideMaterial bgColor="orange" index={0} rotation={[0, 0, 0]}>
      <torusGeometry args={[0.65, 0.3, 64]} />
    </SideMaterial>
  </mesh>
);

export function SideMaterial(_: {
  bgColor: string;
  children: ReactNode;
  index: number;
  rotation: [number, number, number];
}) {
  return null;
}
