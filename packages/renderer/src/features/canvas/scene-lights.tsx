/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { on, send } from "@triplex/bridge/client";
import { useEffect, useLayoutEffect, useState } from "react";
import { Tunnel } from "../../components/tunnel";
import { useLoadedScene } from "../scene-loader/context";

export function SceneLights() {
  const { meta } = useLoadedScene();
  const sceneHasStaticallyDefinedLights = meta.lighting === "default";
  const [showDefaultLights, setDefaultLights] = useState(
    sceneHasStaticallyDefinedLights,
  );

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
