/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { RoundedBox } from "@react-three/drei";
import Box from "./box";
import { SceneWrapped } from "./scene";

export const SceneDirect = () => {
  return <Box />;
};

export default function Scene() {
  return (
    <>
      <SceneWrapped />
      <SceneDirect />
    </>
  );
}

export const NodeModules = () => {
  return <RoundedBox visible={undefined} />;
};

export const Host = () => (
  <group>
    <mesh />
  </group>
);

function Union(_: { color: "black" | "white" }) {
  return null;
}

export const Um = () => (
  <group rotation={[0, 0, 0]}>
    <mesh />
    <Union color="black" />
    <UnionOptional color={undefined} />
  </group>
);

export function UnionOptional(_: { color?: "black" | "white" }) {
  return null;
}

export const ArrowFunc = (_: { color: string }) => null;

const identity = <T extends unknown>(id: T) => id;

export const WrappedFunc = identity((_: { name: string }) => null);
