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

    const errorCallback = (e: ErrorEvent) => {
      send("trplx:onError", {
        message: e.message,
        line: e.lineno,
        col: e.colno,
        source: e.filename
          .replace(__TRIPLEX_BASE_URL__, __TRIPLEX_CWD__)
          .replace(/\?.+/, ""),
        stack: e.error.stack.replace(/\?.+:/g, ":"),
      });
    };

    window.addEventListener("error", errorCallback);

    import.meta.hot?.on("vite:error", (e) => {
      send("trplx:onError", {
        message: e.err.message,
        line: e.err.loc?.line || -1,
        col: e.err.loc?.column || -1,
        source: e.err.id || "unknown",
        stack: e.err.stack,
      });
    });

    import.meta.hot?.on("vite:beforeUpdate", () => {
      send("trplx:onOpenFileHmr", undefined);
    });

    return () => {
      window.removeEventListener("error", errorCallback);
    };
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
