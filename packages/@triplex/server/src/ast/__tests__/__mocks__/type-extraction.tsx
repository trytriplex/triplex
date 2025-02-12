/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
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

export const DefaultProps = identity(
  ({
    name: _ = "foo",
    test: __ = true,
  }: {
    name?: "foo" | "bar";
    test?: boolean;
  }) => null
);

export function Provider({
  debugPhysics: _ = false,
  enablePhysics: __ = false,
}: {
  debugPhysics?: boolean;
  enablePhysics?: boolean;
}) {
  return null;
}

export function Material() {
  return <meshStandardMaterial />;
}

export const Home: React.FC<{
  /**
   * @min 0
   * @max 2000
   */
  scaleMax?: number;
  seed: string;
  strategy?: "foo";
  useInterpolation?: boolean;
  useNoise?: boolean;
}> = ({
  scaleMax: _ = 700,
  strategy: __ = "WGAN",
  useInterpolation: ___ = true,
  useNoise: ____ = true,
}) => {
  return null;
};

export function UsingComponentsWithDefaultProps() {
  return (
    <>
      <Home seed="" />
      <Provider />
      <DefaultProps />
    </>
  );
}
