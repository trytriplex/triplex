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
  return <RoundedBox />;
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

function UnionOptional(_: { color?: "black" | "white" }) {
  return null;
}
