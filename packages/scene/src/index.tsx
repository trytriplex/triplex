import { BrowserRouter } from "react-router-dom";
import { SceneFrame } from "./scene";

export function Scene({
  scenes,
}: {
  scenes: Record<string, () => Promise<unknown>>;
}) {
  return (
    <BrowserRouter>
      <SceneFrame scenes={scenes} />
    </BrowserRouter>
  );
}
