import { send } from "@triplex/bridge/client";
import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { SceneFrame } from "./scene";
import { SceneModule } from "./types";

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
