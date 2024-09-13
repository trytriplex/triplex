/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  compose,
  on,
  send,
  type Modules,
  type ProviderComponent,
} from "@triplex/bridge/client";
import { useEffect, useState } from "react";
import { suspend } from "suspend-react";

function RenderComponent({ files }: { files: Modules }) {
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

  const Component = suspend(async () => {
    const modulePath = Object.keys(files).find((x) =>
      component.path.endsWith(x),
    );
    if (!modulePath) {
      throw new Error("invariant");
    }
    const foundModule = await files[modulePath]();
    return foundModule[component.exportName];
  }, [component]);

  return <Component />;
}

export function Renderer({
  files,
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
        width: "100%",
      }}
    >
      <Provider>
        <RenderComponent files={files} />
      </Provider>
    </div>
  );
}
