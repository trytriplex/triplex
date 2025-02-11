/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Fragment } from "react";
import { SceneElement } from "../../";
import { SceneObjectContext } from "../../context";

function Component({ children }: { children: React.ReactNode }) {
  return (
    <SceneElement
      __component="group"
      __meta={{
        column: 1,
        exportName: "Component",
        line: 1,
        name: "group",
        path: "/foo",
        rotate: false,
        scale: false,
        translate: false,
      }}
    >
      <SceneElement
        __component="mesh"
        __meta={{
          column: 22,
          exportName: "Component",
          line: 1,
          name: "mesh",
          path: "/foo",
          rotate: false,
          scale: false,
          translate: true,
        }}
      >
        {children}
      </SceneElement>
    </SceneElement>
  );
}

export const nested = () => (
  <SceneObjectContext.Provider value={true}>
    <SceneElement
      __component={Fragment}
      __meta={{
        column: 1,
        exportName: "Nested",
        line: 1,
        name: "ComponentA",
        path: "/bar",
        rotate: false,
        scale: false,
        translate: false,
      }}
    >
      <SceneElement
        __component={Component}
        __meta={{
          column: 10,
          exportName: "Nested",
          line: 20,
          name: "ComponentB",
          path: "/bar",
          rotate: false,
          scale: false,
          translate: false,
        }}
      />
    </SceneElement>
  </SceneObjectContext.Provider>
);
