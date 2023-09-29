/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { listen, send } from "@triplex/bridge/client";
import { useEffect, type PropsWithChildren } from "react";
import { BrowserRouter } from "react-router-dom";
import { SceneFrame } from "./scene";
import { SceneModule, ComponentModule } from "./types";
import { SceneObject } from "./scene-object";
import { ComponentProvider, SceneProvider } from "./context";
import { Environment } from "./environment";

// Hacking this for fun sorry!
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
window.SceneObject = SceneObject;

export function Scene({
  provider,
  scenes,
  components,
}: {
  provider: (props: PropsWithChildren) => JSX.Element;
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
        stack: e.error.stack
          .replaceAll(__TRIPLEX_BASE_URL__, __TRIPLEX_CWD__)
          .replace(/\?.+:/g, ":"),
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

  useEffect(() => {
    return listen("trplx:requestRefresh", (data) => {
      if (data.hard) {
        window.location.reload();
      }
    });
  }, []);

  return (
    <BrowserRouter>
      <ComponentProvider value={components}>
        <SceneProvider value={scenes}>
          <Environment>
            <SceneFrame provider={provider} />
          </Environment>
        </SceneProvider>
      </ComponentProvider>
    </BrowserRouter>
  );
}
