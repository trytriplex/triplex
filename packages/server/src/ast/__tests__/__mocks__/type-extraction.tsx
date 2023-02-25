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
