import { send } from "@triplex/bridge/client";
import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { SceneFrame } from "./scene";
import { SceneModule } from "./types";
import { SceneObject } from "./scene-object";

// Hacking this for fun sorry!
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
window.SceneObject = SceneObject;

export function Scene({
  scenes,
}: {
  scenes: Record<string, () => Promise<SceneModule>>;
}) {
  useEffect(() => {
    send("trplx:onConnected", undefined);
  }, []);

  return (
    <BrowserRouter>
      <SceneFrame scenes={scenes} />
    </BrowserRouter>
  );
}
