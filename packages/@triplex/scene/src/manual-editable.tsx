/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { listen } from "@triplex/bridge/client";
import { ComponentType, useEffect } from "react";
import { SceneObject } from "./scene-object";
import { useSceneState } from "./stores/scene-state";

/**
 * Used for bespoke use cases such as the loaded scene or the global provider.
 */
export function ManualEditableSceneObject({
  children,
  component: SceneComponent,
  exportName,
  id,
  path,
  staticSceneProps = {},
}: {
  children?: React.ReactNode;
  component: ComponentType<Record<string, unknown>>;
  exportName: string;
  id: number;
  path: string;
  staticSceneProps?: Record<string, unknown>;
}) {
  const storeKey = `${id}:${path}:${exportName}`;
  const overriddenProps = useSceneState((state) => state.get(storeKey));
  const setProp = useSceneState((state) => state.set);

  useEffect(() => {
    return listen("trplx:requestSetSceneObjectProp", (data) => {
      if (data.column === id && data.line === id && data.path === path) {
        setProp(storeKey, data.propName, data.propValue);
      }
    });
  }, [id, path, setProp, storeKey]);

  return (
    <SceneObject
      __component={SceneComponent}
      __meta={{
        column: id,
        line: id,
        name: exportName,
        path,
        rotate: false,
        scale: false,
        translate: false,
      }}
      {...staticSceneProps}
      {...overriddenProps}
    >
      {children}
    </SceneObject>
  );
}
