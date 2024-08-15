/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { SceneObject } from "./scene-object";

/** Used for bespoke use cases such as the loaded scene or the global provider. */
export function ManualEditableSceneObject({
  children,
  component: SceneComponent,
  exportName,
  id,
  path,
  staticSceneProps = {},
}: {
  children?: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: (props: any) => any;
  exportName: string;
  id: number;
  path: string;
  staticSceneProps?: Record<string, unknown>;
}) {
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
      forceInsideSceneObjectContext
      {...staticSceneProps}
    >
      {children}
    </SceneObject>
  );
}
