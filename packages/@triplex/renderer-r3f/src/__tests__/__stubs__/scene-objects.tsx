/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Fragment } from "react";
import { SceneObject, SceneObjectContext } from "../../scene-object";

function Component({ children }: { children: React.ReactNode }) {
  return (
    <SceneObject
      __component="group"
      __meta={{
        column: 1,
        line: 1,
        name: "group",
        path: "/foo",
        rotate: false,
        scale: false,
        translate: false,
      }}
    >
      <SceneObject
        __component="mesh"
        __meta={{
          column: 22,
          line: 1,
          name: "mesh",
          path: "/foo",
          rotate: false,
          scale: false,
          translate: true,
        }}
      >
        {children}
      </SceneObject>
    </SceneObject>
  );
}

export const nested = () => (
  <SceneObjectContext.Provider value={true}>
    <SceneObject
      __component={Fragment}
      __meta={{
        column: 1,
        line: 1,
        name: "ComponentA",
        path: "/bar",
        rotate: false,
        scale: false,
        translate: false,
      }}
    >
      <SceneObject
        __component={Component}
        __meta={{
          column: 10,
          line: 20,
          name: "ComponentB",
          path: "/bar",
          rotate: false,
          scale: false,
          translate: false,
        }}
      />
    </SceneObject>
  </SceneObjectContext.Provider>
);
