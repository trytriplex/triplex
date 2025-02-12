/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import {
  compose,
  on,
  send,
  type Modules,
  type ProviderComponent,
} from "@triplex/bridge/client";
import { useEffect, useState } from "react";

function RenderComponent() {
  const [component, setComponent] = useState<{
    encodedProps: string;
    exportName: string;
    path: string;
  }>();

  useEffect(() => {
    return compose([
      on("request-open-component", setComponent),
      on("request-focus-element", (data) => {
        send("element-focused", data);
      }),
      on("request-blur-element", (data) => {
        send("element-blurred", data);
      }),
    ]);
  }, []);

  if (!component) {
    return null;
  }

  return <div style={{ color: "white" }}>{JSON.stringify(component)}</div>;
}

export function Renderer({
  provider: Provider,
}: {
  files: Modules;
  provider: ProviderComponent;
  providerPath: string;
}) {
  useEffect(() => {
    send("set-extension-points", {
      elements: [],
      scene: [],
    });

    send("ready", undefined);
  }, []);

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        height: "100%",
        inset: 0,
        justifyContent: "center",
        position: "absolute",
        textAlign: "center",
        width: "100%",
      }}
    >
      <Provider>
        <RenderComponent />
      </Provider>
    </div>
  );
}
