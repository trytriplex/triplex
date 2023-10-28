/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { listen, send } from "@triplex/bridge/client";
import { useEffect, type PropsWithChildren } from "react";
import { BrowserRouter } from "react-router-dom";
import { SceneProvider } from "./context";
import { Environment } from "./environment";
import { SceneFrame } from "./scene";
import { SceneObject } from "./scene-object";
import { SceneModule } from "./types";

// Hacking this for fun sorry!
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
window.SceneObject = SceneObject;

export function Scene({
  provider,
  scenes,
}: {
  provider: (props: PropsWithChildren) => JSX.Element;
  scenes: Record<string, () => Promise<SceneModule>>;
}) {
  useEffect(() => {
    send("trplx:onConnected", undefined);

    const errorCallback = (e: ErrorEvent) => {
      send("trplx:onError", {
        col: e.colno,
        line: e.lineno,
        message: e.message,
        source: e.filename
          .replace(__TRIPLEX_BASE_URL__, __TRIPLEX_CWD__)
          .replace(/\?.+/, ""),
        stack: e.error.stack
          .replaceAll(__TRIPLEX_BASE_URL__, __TRIPLEX_CWD__)
          .replaceAll(/\?.+:/g, ":"),
      });
    };

    window.addEventListener("error", errorCallback);

    import.meta.hot?.on("vite:error", (e) => {
      send("trplx:onError", {
        col: e.err.loc?.column || -1,
        line: e.err.loc?.line || -1,
        message: e.err.message,
        source: e.err.id || "unknown",
        stack: e.err.stack,
      });
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
      <SceneProvider value={scenes}>
        <Environment>
          <SceneFrame provider={provider} />
        </Environment>
      </SceneProvider>
    </BrowserRouter>
  );
}
