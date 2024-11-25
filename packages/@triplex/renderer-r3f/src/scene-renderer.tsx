/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { compose, on, send, type SceneComponent } from "@triplex/bridge/client";
import { useEffect, useLayoutEffect, useReducer, useState } from "react";
import { Tunnel } from "./components/tunnel";
import { SceneObject } from "./scene-object";

export function SceneRenderer({
  component: SceneComponent,
  exportName,
  path,
  props,
  triplexMeta,
}: {
  component: SceneComponent;
  exportName: string;
  path: string;
  props: Record<string, unknown>;
  triplexMeta: Record<string, unknown>;
}) {
  const [resetCount, incrementReset] = useReducer((s: number) => s + 1, 0);
  const sceneHasStaticallyDefinedLights =
    "lighting" in triplexMeta && triplexMeta.lighting === "default";
  const [showDefaultLights, setDefaultLights] = useState(
    sceneHasStaticallyDefinedLights,
  );

  useEffect(() => {
    return compose([
      on("request-refresh-scene", incrementReset),
      on("request-state-change", ({ state }) => {
        if (state === "edit") {
          incrementReset();
        }
      }),
    ]);
  }, []);

  useEffect(() => {
    return on("extension-point-triggered", (data) => {
      if (data.scope !== "scene") {
        return;
      }

      switch (data.id) {
        case "default_lights_on": {
          setDefaultLights(true);
          return { handled: true };
        }

        case "default_lights_off": {
          setDefaultLights(false);
          return { handled: true };
        }
      }
    });
  }, []);

  useLayoutEffect(() => {
    send("extension-point-triggered", {
      id: sceneHasStaticallyDefinedLights
        ? "default_lights_off"
        : "default_lights_on",
    });

    setDefaultLights(sceneHasStaticallyDefinedLights);
  }, [sceneHasStaticallyDefinedLights]);

  return (
    <>
      <SceneObject
        __component={SceneComponent}
        __meta={{
          column: -1,
          line: -1,
          name: exportName,
          path,
        }}
        forceInsideSceneObjectContext
        key={resetCount}
        {...props}
      />

      {showDefaultLights && (
        <>
          <hemisphereLight
            color="#87CEEB"
            groundColor="#362907"
            intensity={0.3}
          />
          <ambientLight intensity={0.3} />
          <directionalLight intensity={0.5} position={[2.5, 8, 5]} />
          <pointLight
            color="#eef4aa"
            intensity={0.5}
            position={[-10, 0, -20]}
          />
        </>
      )}

      {import.meta.env.VITE_TRIPLEX_ENV === "test" && (
        <Tunnel.In>
          <span
            data-testid={
              showDefaultLights ? "scene-lights-on" : "scene-lights-off"
            }
            style={{
              height: 1,
              left: 0,
              opacity: 0,
              position: "absolute",
              top: 0,
              width: 1,
            }}
          />
        </Tunnel.In>
      )}
    </>
  );
}
