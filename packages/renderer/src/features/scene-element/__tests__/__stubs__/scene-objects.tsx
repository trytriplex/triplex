/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { Fragment } from "react";
import { SceneElement } from "../../";
import { SceneObjectContext } from "../../context";

function Component({ children }: { children: React.ReactNode }) {
  return (
    <SceneElement
      __component="group"
      __meta={{
        astPath: "root/group",
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
          astPath: "root/group/mesh",
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
        astPath: "root/ComponentA",
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
          astPath: "root/ComponentA/ComponentB",
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
