import { send } from "@triplex/bridge/client";
import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { SceneFrame } from "./scene";
import { SceneModule, ComponentModule } from "./types";
import { SceneObject } from "./scene-object";
import { ComponentProvider, SceneProvider } from "./context";

// Hacking this for fun sorry!
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
window.SceneObject = SceneObject;

export function Scene({
  scenes,
  components,
}: {
  components: Record<string, () => Promise<ComponentModule>>;
  scenes: Record<string, () => Promise<SceneModule>>;
}) {
  useEffect(() => {
    send("trplx:onConnected", undefined);
  }, []);

  return (
    <BrowserRouter>
      <ComponentProvider value={components}>
        <SceneProvider value={scenes}>
          <SceneFrame />
        </SceneProvider>
      </ComponentProvider>
    </BrowserRouter>
  );
}
