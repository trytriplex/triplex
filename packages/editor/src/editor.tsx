import { CanvasEditMode } from "@triplex/canvas";
import { SceneLoader } from "./scene-loader";

export function Editor() {
  return (
    <CanvasEditMode>
      <SceneLoader />
    </CanvasEditMode>
  );
}
