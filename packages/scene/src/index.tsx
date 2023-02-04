import { send } from "@triplex/bridge/client";
import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { SceneFrame } from "./scene";

export function Scene({
  scenes,
}: {
  scenes: Record<string, () => Promise<unknown>>;
}) {
  useEffect(() => {
    send("trplx:onConnected", {});
  }, []);

  return (
    <BrowserRouter>
      <SceneFrame scenes={scenes} />
    </BrowserRouter>
  );
}
