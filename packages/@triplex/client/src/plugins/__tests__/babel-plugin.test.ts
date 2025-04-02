/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import {
  transformSync as babelTransformSync,
  type TransformOptions,
} from "@babel/core";
import { describe, expect, it } from "vitest";
import plugin from "../babel-plugin";

const transformSync = (code: string, opts?: TransformOptions) => {
  const result = babelTransformSync(code, opts);
  if (!result) {
    return null;
  }

  return {
    ...result,
    code: result.code?.replace(/[A-z]:\//g, "/"),
  };
};

describe("babel plugin", () => {
  it("should transform jsx fragment shorthands", () => {
    const result = transformSync(
      `
      <></>
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { Fragment } from "react";
      <SceneObject __component={Fragment} __meta={{
        "path": "",
        "name": "Fragment",
        "line": 2,
        "column": 7
      }}></SceneObject>;"
    `);
  });

  it("should ignore a file and not transform anything", () => {
    const result = transformSync(
      `
      <group scale={scale} />
    `,
      {
        filename: "/hello.tsx",
        plugins: [
          plugin({ exclude: ["/hello.tsx"] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`"<group scale={scale} />;"`);
  });

  it("should continue to apply other babel plugins when ignored", () => {
    const result = transformSync(
      `
      export function Component({ scale }) {
        return <group scale={scale} />
      }
    `,
      {
        filename: "/hello.tsx",
        plugins: [
          plugin({ exclude: ["/hello.tsx"] }),
          require.resolve("@babel/plugin-syntax-jsx"),
          [require.resolve("react-refresh/babel"), { skipEnvCheck: true }],
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export function Component({
        scale
      }) {
        return <group scale={scale} />;
      }
      _c = Component;
      var _c;
      $RefreshReg$(_c, "Component");"
    `);
  });

  it("should flag a component declared in node_modules as transformed", () => {
    const result = transformSync(
      `
      import { RigidBody } from '@react-three/rapier';

      function Component({ position }) {
        return (
          <RigidBody
            name="box"
            type="dynamic"
            position={position}
            colliders="cuboid"
            canSleep={false}
          >
          </RigidBody>
        );
      }
      
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { RigidBody } from '@react-three/rapier';
      function Component({
        position
      }) {
        return <SceneObject name="box" type="dynamic" position={position} colliders="cuboid" canSleep={false} __component={RigidBody} __meta={{
          "originExportName": "RigidBody",
          "originPath": "",
          "exportName": "",
          "path": "",
          "name": "RigidBody",
          "line": 6,
          "column": 11,
          "translate": true,
          "rotate": false,
          "scale": false
        }}>
                </SceneObject>;
      }
      Component.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };"
    `);
  });

  it("should ignore windows paths", () => {
    const result = transformSync(
      `
      <group />
    `,
      {
        filename: "is/a/path.tsx",
        plugins: [
          plugin({ exclude: ["is/a/path.tsx"] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`"<group />;"`);
  });

  it("should transform scene with wrapped groups and ignore transform values that aren't identifiers", () => {
    const result = transformSync(
      `
      function Component ({ scale }) {
        return (
          <group scale={scale}>
            <mesh position={[1,1,1]}>
              <boxGeometry args={[1,1,1]} />
              <standardMaterial color="black" />
            </mesh>
          </group>
        );
      }
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "function Component({
        scale
      }) {
        return <SceneObject scale={scale} __component={"group"} __meta={{
          "originExportName": "",
          "originPath": "",
          "exportName": "",
          "path": "",
          "name": "group",
          "line": 4,
          "column": 11,
          "translate": false,
          "rotate": false,
          "scale": true
        }}>
                  <SceneObject position={[1, 1, 1]} __component={"mesh"} __meta={{
            "originExportName": "",
            "originPath": "",
            "exportName": "",
            "path": "",
            "name": "mesh",
            "line": 5,
            "column": 13,
            "translate": false,
            "rotate": false,
            "scale": false
          }}>
                    <SceneObject args={[1, 1, 1]} __component={"boxGeometry"} __meta={{
              "originExportName": "",
              "originPath": "",
              "exportName": "",
              "path": "",
              "name": "boxGeometry",
              "line": 6,
              "column": 15,
              "translate": false,
              "rotate": false,
              "scale": false
            }}></SceneObject>
                    <SceneObject color="black" __component={"standardMaterial"} __meta={{
              "originExportName": "",
              "originPath": "",
              "exportName": "",
              "path": "",
              "name": "standardMaterial",
              "line": 7,
              "column": 15,
              "translate": false,
              "rotate": false,
              "scale": false
            }}></SceneObject>
                  </SceneObject>
                </SceneObject>;
      }
      Component.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };"
    `);
  });

  it("should ignore empty string exclude", () => {
    const result = transformSync(
      `
      export function HelloWorld() {
        return (
          <mesh />
        );
      }
    `,
      {
        plugins: [
          plugin({ exclude: [""] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export function HelloWorld() {
        return <SceneObject __component={"mesh"} __meta={{
          "originExportName": "",
          "originPath": "",
          "exportName": "HelloWorld",
          "path": "",
          "name": "mesh",
          "line": 4,
          "column": 11,
          "translate": false,
          "rotate": false,
          "scale": false
        }}></SceneObject>;
      }
      HelloWorld.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };"
    `);
  });

  it("should add triplex meta to function declaration", () => {
    const result = transformSync(
      `
      export function HelloWorld() {
        return (
          <mesh />
        );
      }
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export function HelloWorld() {
        return <SceneObject __component={"mesh"} __meta={{
          "originExportName": "",
          "originPath": "",
          "exportName": "HelloWorld",
          "path": "",
          "name": "mesh",
          "line": 4,
          "column": 11,
          "translate": false,
          "rotate": false,
          "scale": false
        }}></SceneObject>;
      }
      HelloWorld.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };"
    `);
  });

  it("should mark destructured props usage", () => {
    const result = transformSync(
      `
      function Component({ rotation, scale, position }) {
        return (
          <mesh rotation={rotation} scale={scale} position={position} />
        );
      }
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "function Component({
        rotation,
        scale,
        position
      }) {
        return <SceneObject rotation={rotation} scale={scale} position={position} __component={"mesh"} __meta={{
          "originExportName": "",
          "originPath": "",
          "exportName": "",
          "path": "",
          "name": "mesh",
          "line": 4,
          "column": 11,
          "translate": true,
          "rotate": true,
          "scale": true
        }}></SceneObject>;
      }
      Component.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };"
    `);
  });

  it("should mark non-destructured props usage", () => {
    const result = transformSync(
      `
      function Component(props) {
        return (
          <mesh rotation={props.rotation} scale={props.scale} position={props.position} />
        );
      }
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "function Component(props) {
        return <SceneObject rotation={props.rotation} scale={props.scale} position={props.position} __component={"mesh"} __meta={{
          "originExportName": "",
          "originPath": "",
          "exportName": "",
          "path": "",
          "name": "mesh",
          "line": 4,
          "column": 11,
          "translate": true,
          "rotate": true,
          "scale": true
        }}></SceneObject>;
      }
      Component.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };"
    `);
  });

  it("should add triplex meta to exported variable statements", () => {
    const result = transformSync(
      `
      export const HelloWorld = () => {
        return (
          <mesh />
        );
      }
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export const HelloWorld = () => {
        return <SceneObject __component={"mesh"} __meta={{
          "originExportName": "",
          "originPath": "",
          "exportName": "HelloWorld",
          "path": "",
          "name": "mesh",
          "line": 4,
          "column": 11,
          "translate": false,
          "rotate": false,
          "scale": false
        }}></SceneObject>;
      };
      HelloWorld.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };"
    `);
  });

  it("should set lighting meta to custom", () => {
    const result = transformSync(
      `
      export const HelloWorld = () => {
        return (
          <>
            <mesh visible>
              <boxGeometry />
            </mesh>
            <spotLight />
          </>
        );
      }
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { Fragment } from "react";
      export const HelloWorld = () => {
        return <SceneObject __component={Fragment} __meta={{
          "path": "",
          "name": "Fragment",
          "line": 4,
          "column": 11
        }}>
                  <SceneObject visible __component={"mesh"} __meta={{
            "originExportName": "",
            "originPath": "",
            "exportName": "HelloWorld",
            "path": "",
            "name": "mesh",
            "line": 5,
            "column": 13,
            "translate": false,
            "rotate": false,
            "scale": false
          }}>
                    <SceneObject __component={"boxGeometry"} __meta={{
              "originExportName": "",
              "originPath": "",
              "exportName": "HelloWorld",
              "path": "",
              "name": "boxGeometry",
              "line": 6,
              "column": 15,
              "translate": false,
              "rotate": false,
              "scale": false
            }}></SceneObject>
                  </SceneObject>
                  <SceneObject __component={"spotLight"} __meta={{
            "originExportName": "",
            "originPath": "",
            "exportName": "HelloWorld",
            "path": "",
            "name": "spotLight",
            "line": 8,
            "column": 13,
            "translate": false,
            "rotate": false,
            "scale": false
          }}></SceneObject>
                </SceneObject>;
      };
      HelloWorld.triplexMeta = {
        "lighting": "custom",
        "root": "react-three-fiber"
      };"
    `);
  });

  it("should not add triplex meta to non-jsx functions", () => {
    const result = transformSync(
      `
      export function hello() {}
      const okThen = () => {};
      
      function HelloWorld() {
        const onClick = () => {};
        
        return (
          <group />
        )
      }
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export function hello() {}
      const okThen = () => {};
      function HelloWorld() {
        const onClick = () => {};
        return <SceneObject __component={"group"} __meta={{
          "originExportName": "",
          "originPath": "",
          "exportName": "",
          "path": "",
          "name": "group",
          "line": 9,
          "column": 11,
          "translate": false,
          "rotate": false,
          "scale": false
        }}></SceneObject>;
      }
      HelloWorld.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };"
    `);
  });

  it("should set triplex meta for disconnected default exports", () => {
    const result = transformSync(
      `
      const HelloWorld = () => {
        return (
          <mesh />
        );
      }

      export default HelloWorld;
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "const HelloWorld = () => {
        return <SceneObject __component={"mesh"} __meta={{
          "originExportName": "",
          "originPath": "",
          "exportName": "default",
          "path": "",
          "name": "mesh",
          "line": 4,
          "column": 11,
          "translate": false,
          "rotate": false,
          "scale": false
        }}></SceneObject>;
      };
      export default HelloWorld;
      HelloWorld.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };"
    `);
  });

  it("should set export name for default exported function decl", () => {
    const result = transformSync(
      `
      export default function HelloWorld() {
        return (
          <mesh />
        );
      }
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export default function HelloWorld() {
        return <SceneObject __component={"mesh"} __meta={{
          "originExportName": "",
          "originPath": "",
          "exportName": "default",
          "path": "",
          "name": "mesh",
          "line": 4,
          "column": 11,
          "translate": false,
          "rotate": false,
          "scale": false
        }}></SceneObject>;
      }
      HelloWorld.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };"
    `);
  });

  it("should set triplex meta for wrapped exports", () => {
    const result = transformSync(
      `
      export const HelloWorld = forwardRef((ref) => {
        return (
          <mesh ref={ref} />
        );
      });
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export const HelloWorld = forwardRef(ref => {
        return <SceneObject ref={ref} __component={"mesh"} __meta={{
          "originExportName": "",
          "originPath": "",
          "exportName": "HelloWorld",
          "path": "",
          "name": "mesh",
          "line": 4,
          "column": 11,
          "translate": false,
          "rotate": false,
          "scale": false
        }}></SceneObject>;
      });
      HelloWorld.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };"
    `);
  });

  it("should wrap nested mesh", () => {
    const result = transformSync(
      `
      function Box({
        position,
        rotation,
        scale,
      }) {
        const ok = {};
        return (
          <group visible scale={scale}>
            <mesh
              {...ok}
              userData={{ hello: true }}
              onClick={() => {}}
              visible={true}
              position={position}
              rotation={rotation}
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#00ff00" />
            </mesh>
          </group>
        );
      }
      
      export default Box;
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "function Box({
        position,
        rotation,
        scale
      }) {
        const ok = {};
        return <SceneObject visible scale={scale} __component={"group"} __meta={{
          "originExportName": "",
          "originPath": "",
          "exportName": "default",
          "path": "",
          "name": "group",
          "line": 9,
          "column": 11,
          "translate": false,
          "rotate": false,
          "scale": true
        }}>
                  <SceneObject {...ok} userData={{
            hello: true
          }} onClick={() => {}} visible={true} position={position} rotation={rotation} __component={"mesh"} __meta={{
            "originExportName": "",
            "originPath": "",
            "exportName": "default",
            "path": "",
            "name": "mesh",
            "line": 10,
            "column": 13,
            "translate": true,
            "rotate": true,
            "scale": false
          }}>
                    <SceneObject args={[1, 1, 1]} __component={"boxGeometry"} __meta={{
              "originExportName": "",
              "originPath": "",
              "exportName": "default",
              "path": "",
              "name": "boxGeometry",
              "line": 18,
              "column": 15,
              "translate": false,
              "rotate": false,
              "scale": false
            }}></SceneObject>
                    <SceneObject color="#00ff00" __component={"meshStandardMaterial"} __meta={{
              "originExportName": "",
              "originPath": "",
              "exportName": "default",
              "path": "",
              "name": "meshStandardMaterial",
              "line": 19,
              "column": 15,
              "translate": false,
              "rotate": false,
              "scale": false
            }}></SceneObject>
                  </SceneObject>
                </SceneObject>;
      }
      export default Box;
      Box.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };"
    `);
  });

  it("should wrap custom component", () => {
    const result = transformSync(
      `
      <CustomComponent />
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "<SceneObject __component={CustomComponent} __meta={{
        "originExportName": "",
        "originPath": "",
        "exportName": "",
        "path": "",
        "name": "CustomComponent",
        "line": 2,
        "column": 7,
        "translate": false,
        "rotate": false,
        "scale": false
      }}></SceneObject>;"
    `);
  });

  it("should merge string key", () => {
    const result = transformSync(
      `
      <CustomComponent key="existing" />
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "<SceneObject key="existing" __component={CustomComponent} __meta={{
        "originExportName": "",
        "originPath": "",
        "exportName": "",
        "path": "",
        "name": "CustomComponent",
        "line": 2,
        "column": 7,
        "translate": false,
        "rotate": false,
        "scale": false
      }}></SceneObject>;"
    `);
  });

  it("should merge number keys", () => {
    const result = transformSync(
      `
      <CustomComponent key={10} />
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "<SceneObject key={10} __component={CustomComponent} __meta={{
        "originExportName": "",
        "originPath": "",
        "exportName": "",
        "path": "",
        "name": "CustomComponent",
        "line": 2,
        "column": 7,
        "translate": false,
        "rotate": false,
        "scale": false
      }}></SceneObject>;"
    `);
  });

  it("should mark host elements using user data for position prop", () => {
    // position={position} -> userData={{ __triplexTransform: 'translate' }}
    const result = transformSync(
      `
      export function Component({ position }) {
         return <mesh position={position} />
      }
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export function Component({
        position
      }) {
        return <SceneObject position={position} __component={"mesh"} __meta={{
          "originExportName": "",
          "originPath": "",
          "exportName": "Component",
          "path": "",
          "name": "mesh",
          "line": 3,
          "column": 17,
          "translate": true,
          "rotate": false,
          "scale": false
        }}></SceneObject>;
      }
      Component.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };"
    `);
  });

  it("should handle basic spread props", () => {
    const result = transformSync(
      `
      function Component(props) {
        return <mesh {...props} />
      }
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "function Component(props) {
        return <SceneObject {...props} __component={"mesh"} __meta={{
          "originExportName": "",
          "originPath": "",
          "exportName": "",
          "path": "",
          "name": "mesh",
          "line": 3,
          "column": 16,
          "translate": true,
          "rotate": true,
          "scale": true
        }}></SceneObject>;
      }
      Component.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };"
    `);
  });

  it("should handle basic spread props from a arrow function", () => {
    const result = transformSync(
      `
      const Component = forwardRef((props) => {
        return <mesh {...props} />
      });
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "const Component = forwardRef(props => {
        return <SceneObject {...props} __component={"mesh"} __meta={{
          "originExportName": "",
          "originPath": "",
          "exportName": "",
          "path": "",
          "name": "mesh",
          "line": 3,
          "column": 16,
          "translate": true,
          "rotate": true,
          "scale": true
        }}></SceneObject>;
      });
      Component.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };"
    `);
  });

  it("should handle destructured spread props", () => {
    const result = transformSync(
      `
      function Component({ name, ...props }) {
        return <mesh {...props} />
      }
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "function Component({
        name,
        ...props
      }) {
        return <SceneObject {...props} __component={"mesh"} __meta={{
          "originExportName": "",
          "originPath": "",
          "exportName": "",
          "path": "",
          "name": "mesh",
          "line": 3,
          "column": 16,
          "translate": true,
          "rotate": true,
          "scale": true
        }}></SceneObject>;
      }
      Component.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };"
    `);
  });

  it("should handle destructured spread props from a arrow function", () => {
    const result = transformSync(
      `
      const Component = forwardRef(({ name, ...props }) => {
        return <mesh {...props} />
      });
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "const Component = forwardRef(({
        name,
        ...props
      }) => {
        return <SceneObject {...props} __component={"mesh"} __meta={{
          "originExportName": "",
          "originPath": "",
          "exportName": "",
          "path": "",
          "name": "mesh",
          "line": 3,
          "column": 16,
          "translate": true,
          "rotate": true,
          "scale": true
        }}></SceneObject>;
      });
      Component.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };"
    `);
  });

  it("should skip nested arrow functions", () => {
    const result = transformSync(
      `
      export const Component = forwardRef(({ name, ...props }) => {
        const shouldSkipThisNode = ({ ...ok }) => {};
        return <mesh {...props} />
      });
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export const Component = forwardRef(({
        name,
        ...props
      }) => {
        const shouldSkipThisNode = ({
          ...ok
        }) => {};
        return <SceneObject {...props} __component={"mesh"} __meta={{
          "originExportName": "",
          "originPath": "",
          "exportName": "Component",
          "path": "",
          "name": "mesh",
          "line": 4,
          "column": 16,
          "translate": true,
          "rotate": true,
          "scale": true
        }}></SceneObject>;
      });
      Component.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };"
    `);
  });

  it('should bail out if the spread props does not include "position", "rotation" or "scale"', () => {
    const result = transformSync(
      `
      function Component({ name, position, rotation, scale, ...props }) {
        return <mesh {...props} />
      }

      export { Component };
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "function Component({
        name,
        position,
        rotation,
        scale,
        ...props
      }) {
        return <SceneObject {...props} __component={"mesh"} __meta={{
          "originExportName": "",
          "originPath": "",
          "exportName": "Component",
          "path": "",
          "name": "mesh",
          "line": 3,
          "column": 16,
          "translate": false,
          "rotate": false,
          "scale": false
        }}></SceneObject>;
      }
      export { Component };
      Component.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };"
    `);
  });

  it('should bail out if the spread props does not include "position", "rotation" or "scale" as an arrow function', () => {
    const result = transformSync(
      `
      export const Component = forwardRef(({ name, position, rotation, scale, ...props }) => {
        return <mesh {...props} />
      });
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export const Component = forwardRef(({
        name,
        position,
        rotation,
        scale,
        ...props
      }) => {
        return <SceneObject {...props} __component={"mesh"} __meta={{
          "originExportName": "",
          "originPath": "",
          "exportName": "Component",
          "path": "",
          "name": "mesh",
          "line": 3,
          "column": 16,
          "translate": false,
          "rotate": false,
          "scale": false
        }}></SceneObject>;
      });
      Component.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };"
    `);
  });

  it("should handle a function inside a variable declarator", () => {
    const result = transformSync(
      `
      const Component = forwardRef(function Hello(props) {
        return <mesh {...props} />
      });

      export { Component };
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "const Component = forwardRef(function Hello(props) {
        return <SceneObject {...props} __component={"mesh"} __meta={{
          "originExportName": "",
          "originPath": "",
          "exportName": "Component",
          "path": "",
          "name": "mesh",
          "line": 3,
          "column": 16,
          "translate": true,
          "rotate": true,
          "scale": true
        }}></SceneObject>;
      });
      export { Component };
      Component.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };"
    `);
  });

  it("should should skip nested function expressions", () => {
    const result = transformSync(
      `
      export const Component = forwardRef(function Hello(props) {
        test(function anotherOne(another) {})
        return <mesh {...props} />
      });
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export const Component = forwardRef(function Hello(props) {
        test(function anotherOne(another) {});
        return <SceneObject {...props} __component={"mesh"} __meta={{
          "originExportName": "",
          "originPath": "",
          "exportName": "Component",
          "path": "",
          "name": "mesh",
          "line": 4,
          "column": 16,
          "translate": true,
          "rotate": true,
          "scale": true
        }}></SceneObject>;
      });
      Component.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };"
    `);
  });

  it("should transform canvas import specifier to triplex", () => {
    const result = transformSync(
      `
      import { Canvas, useThree } from "@react-three/fiber";
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(
      `
      "import { useThree } from "@react-three/fiber";
      import { Canvas } from "triplex:canvas";"
    `,
    );
  });

  it("should skip transforming import specifier", () => {
    const result = transformSync(
      `
      import { Canvas, useThree } from "@react-three/fiber";
    `,
      {
        filename: "file.tsx",
        plugins: [
          plugin({ exclude: ["file.tsx"] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(
      `"import { Canvas, useThree } from "@react-three/fiber";"`,
    );
  });

  it("should set react root when canvas is the first found element", () => {
    const result = transformSync(
      `
      import { Canvas } from '@react-three/fiber';

      export function Component() {
        return <Canvas><mesh /></Canvas>;
      }
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toContain('"root": "react"');
  });

  it("should set react root when canvas is the first found element inside a fragment", () => {
    const result = transformSync(
      `
      import { Canvas } from '@react-three/fiber';

      export function Component() {
        return <><Canvas><mesh /></Canvas></>;
      }
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toContain('"root": "react"');
  });

  it("should set react root from basic found html", () => {
    const result = transformSync(
      `
      export function Component() {
        return <div />;
      }
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toContain('"root": "react"');
  });

  it("should forward found root from first found relatively imported component", () => {
    const result = transformSync(
      `
      import { Baz } from 'vite';
      import { Bar } from './foo';

      export function Component() {
        return <Baz><Bar /></Baz>;
      }
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toContain('"root": Bar?.triplexMeta?.root');
  });

  it("should forward found root from first found local component", () => {
    const result = transformSync(
      `
      import { Baz } from 'vite';

      function Bar() {
        return <div />;
      }

      export function Component() {
        return <Baz><Bar /></Baz>;
      }
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toContain('"root": Bar?.triplexMeta?.root');
  });

  it("should set triplex meta even with no jsx elements", () => {
    const result = transformSync(
      `
      export function Component() {
        return null;
      }
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export function Component() {
        return null;
      }
      Component.triplexMeta = {
        "lighting": "default",
        "root": undefined
      };"
    `);
  });

  it("should set react-three-fiber root when using fiber hooks", () => {
    const result = transformSync(
      `
      import { useScroll } from "@react-three/drei";

      export function Component() {
        useScroll();
      }
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { useScroll } from "@react-three/drei";
      export function Component() {
        useScroll();
      }
      Component.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };"
    `);
  });

  it("should set react-three-fiber root when using fiber components", () => {
    const result = transformSync(
      `
      import { Box } from "@react-three/drei";

      export function Component() {
        return <Box />;
      }
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toContain('"root": "react-three-fiber"');
  });

  it("should skip generating component meta", () => {
    const result = transformSync(
      `
      export function Component() {
        return <mesh />;
      }
    `,
      {
        plugins: [
          plugin({ exclude: [], skipFunctionMeta: true }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).not.toContain("triplexMeta");
  });

  it("should use the first returned jsx element inside a return statement", () => {
    const result = transformSync(
      `
      import { Html } from '@react-three/drei';

      export function Component() {
        const inner = <div />;
        return <group><mesh /><Html>{inner}</Html></group>;
      }
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toContain(`"root": "react-three-fiber"`);
  });

  it("should use the first returned jsx element inside a return statement [arrow func]", () => {
    const result = transformSync(
      `
      import { Html } from '@react-three/drei';

      export const Component = () => {
        const inner = <div />;
        return <group><mesh /><Html>{inner}</Html></group>;
      }
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toContain(`"root": "react-three-fiber"`);
  });

  it("should use the first returned jsx element inside an arrow shorthand", () => {
    const result = transformSync(
      `
      import { Html } from '@react-three/drei';

      const inner = <div />;

      export const Component = () => <group><mesh /><Html>{inner}</Html></group>;
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toContain(`"root": "react-three-fiber"`);
  });

  it("should ignore non-arrow functions", () => {
    const result = transformSync(
      `
      export const MyString = "hello";
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(
      `"export const MyString = "hello";"`,
    );
  });

  it("should fallback to react root if jsx elements were found but could not be inferred", () => {
    const result = transformSync(
      `
      import { Dialog } from "@radix-ui/react-dialog";

      export const Component = () => <Dialog>Hello World</Dialog>
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toContain(`"root": "react"`);
  });

  it("should handle default exports for relative component", () => {
    const result = transformSync(
      `
      import Dialog from "./dialog";

      export const Component = () => <Dialog>Hello World</Dialog>
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toContain(`"root": Dialog?.triplexMeta?.root`);
  });

  it("should handle default exports for fallback node_modules component", () => {
    const result = transformSync(
      `
      import Dialog from "@radix-ui/react-dialog";

      export const Component = () => <Dialog>Hello World</Dialog>
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toContain(`"root": "react"`);
  });

  it("should handle default exports for three fiber component", () => {
    const result = transformSync(
      `
      import Dialog from "@react-three/dialog";

      export const Component = () => <Dialog>Hello World</Dialog>
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toContain(`"root": "react-three-fiber"`);
  });

  it("should fallback to concrete check", () => {
    const result = transformSync(
      `
        export function Component() {
          return (
            <ContextProvider>
              <mesh />
            </ContextProvider>
          );
        }

        function ContextProvider({ children }) {
          return children;
        }
      `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export function Component() {
        return <SceneObject __component={ContextProvider} __meta={{
          "originExportName": "",
          "originPath": "",
          "exportName": "Component",
          "path": "",
          "name": "ContextProvider",
          "line": 4,
          "column": 13,
          "translate": false,
          "rotate": false,
          "scale": false
        }}>
                    <SceneObject __component={"mesh"} __meta={{
            "originExportName": "",
            "originPath": "",
            "exportName": "Component",
            "path": "",
            "name": "mesh",
            "line": 5,
            "column": 15,
            "translate": false,
            "rotate": false,
            "scale": false
          }}></SceneObject>
                  </SceneObject>;
      }
      function ContextProvider({
        children
      }) {
        return children;
      }
      ContextProvider.triplexMeta = {
        "lighting": "default",
        "root": undefined
      };
      Component.triplexMeta = {
        "lighting": "default",
        "root": ContextProvider?.triplexMeta?.root || "react-three-fiber"
      };"
    `);
  });

  it("should order meta for many components", () => {
    const result = transformSync(
      `
        export function Inbuilt() {
          return (
            <mesh>
              <boxGeometry />
            </mesh>
          );
        }
        export function Inbuilt1() {
          return <Inbuilt />;
        }

        export function Inbuilt2() {
          return <Inbuilt1 />;
        }

        export function Scene() {
          return <Inbuilt2 />;
        }
      `,
      {
        filename: "/foo.tsx",
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export function Inbuilt() {
        return <SceneObject __component={"mesh"} __meta={{
          "originExportName": "",
          "originPath": "",
          "exportName": "Inbuilt",
          "path": "/foo.tsx",
          "name": "mesh",
          "line": 4,
          "column": 13,
          "translate": false,
          "rotate": false,
          "scale": false
        }}>
                    <SceneObject __component={"boxGeometry"} __meta={{
            "originExportName": "",
            "originPath": "",
            "exportName": "Inbuilt",
            "path": "/foo.tsx",
            "name": "boxGeometry",
            "line": 5,
            "column": 15,
            "translate": false,
            "rotate": false,
            "scale": false
          }}></SceneObject>
                  </SceneObject>;
      }
      export function Inbuilt1() {
        return <SceneObject __component={Inbuilt} __meta={{
          "originExportName": "Inbuilt",
          "originPath": "/foo.tsx",
          "exportName": "Inbuilt1",
          "path": "/foo.tsx",
          "name": "Inbuilt",
          "line": 10,
          "column": 18,
          "translate": false,
          "rotate": false,
          "scale": false
        }}></SceneObject>;
      }
      export function Inbuilt2() {
        return <SceneObject __component={Inbuilt1} __meta={{
          "originExportName": "Inbuilt1",
          "originPath": "/foo.tsx",
          "exportName": "Inbuilt2",
          "path": "/foo.tsx",
          "name": "Inbuilt1",
          "line": 14,
          "column": 18,
          "translate": false,
          "rotate": false,
          "scale": false
        }}></SceneObject>;
      }
      export function Scene() {
        return <SceneObject __component={Inbuilt2} __meta={{
          "originExportName": "Inbuilt2",
          "originPath": "/foo.tsx",
          "exportName": "Scene",
          "path": "/foo.tsx",
          "name": "Inbuilt2",
          "line": 18,
          "column": 18,
          "translate": false,
          "rotate": false,
          "scale": false
        }}></SceneObject>;
      }
      Inbuilt.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };
      Inbuilt1.triplexMeta = {
        "lighting": "default",
        "root": Inbuilt?.triplexMeta?.root
      };
      Inbuilt2.triplexMeta = {
        "lighting": "default",
        "root": Inbuilt1?.triplexMeta?.root
      };
      Scene.triplexMeta = {
        "lighting": "default",
        "root": Inbuilt2?.triplexMeta?.root
      };"
    `);
  });

  it("should skip root meta for recursive components", () => {
    const result = transformSync(
      `
        export function Component() {
          return (
            <Component>
              <mesh />
            </Component>
          );
        }
      `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toContain(`"root": "react-three-fiber"`);
  });

  it("should mark a component as react with a canvas and custom components", () => {
    const result = transformSync(
      `
        import { Canvas } from "@react-three/fiber";

        function FiberComponent() {
          return <mesh />;
        }

        export function Component() {
          return (
            <Canvas>
              <FiberComponent />
            </Canvas>
          );
        }
      `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toContain(`"root": "react"`);
  });

  it("should stub out userland create root calls", () => {
    const result = transformSync(
      `
        import { createRoot } from "react-dom/client";

        createRoot(document.getElementById("root")).render(<div />);
      `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(
      `
      "import { createRoot } from "react-dom/client";
      ({
        render: () => {},
        unmount: () => {}
      }).render(<SceneObject __component={"div"} __meta={{
        "originExportName": "",
        "originPath": "",
        "exportName": "",
        "path": "",
        "name": "div",
        "line": 4,
        "column": 60,
        "translate": false,
        "rotate": false,
        "scale": false
      }}></SceneObject>);"
    `,
    );
  });

  it("should declare origins", () => {
    const result = transformSync(
      `
        import DefaultImportedComponent from "./default";
        import { ImportedComponent } from "../component";

        export function LocalComponent() {
          return <mesh />;
        }

        export function Component() {
          return (
            <>
              <DefaultImportedComponent />
              <LocalComponent />
              <ImportedComponent />
            </>
          );
        }
      `,
      {
        filename: "/foo/bar/baz.tsx",
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { Fragment } from "react";
      import DefaultImportedComponent from "./default";
      import { ImportedComponent } from "../component";
      export function LocalComponent() {
        return <SceneObject __component={"mesh"} __meta={{
          "originExportName": "",
          "originPath": "",
          "exportName": "LocalComponent",
          "path": "/foo/bar/baz.tsx",
          "name": "mesh",
          "line": 6,
          "column": 18,
          "translate": false,
          "rotate": false,
          "scale": false
        }}></SceneObject>;
      }
      export function Component() {
        return <SceneObject __component={Fragment} __meta={{
          "path": "/foo/bar/baz.tsx",
          "name": "Fragment",
          "line": 11,
          "column": 13
        }}>
                    <SceneObject __component={DefaultImportedComponent} __meta={{
            "originExportName": "default",
            "originPath": "/foo/bar/default.tsx",
            "exportName": "Component",
            "path": "/foo/bar/baz.tsx",
            "name": "DefaultImportedComponent",
            "line": 12,
            "column": 15,
            "translate": false,
            "rotate": false,
            "scale": false
          }}></SceneObject>
                    <SceneObject __component={LocalComponent} __meta={{
            "originExportName": "LocalComponent",
            "originPath": "/foo/bar/baz.tsx",
            "exportName": "Component",
            "path": "/foo/bar/baz.tsx",
            "name": "LocalComponent",
            "line": 13,
            "column": 15,
            "translate": false,
            "rotate": false,
            "scale": false
          }}></SceneObject>
                    <SceneObject __component={ImportedComponent} __meta={{
            "originExportName": "ImportedComponent",
            "originPath": "/foo/component.tsx",
            "exportName": "Component",
            "path": "/foo/bar/baz.tsx",
            "name": "ImportedComponent",
            "line": 14,
            "column": 15,
            "translate": false,
            "rotate": false,
            "scale": false
          }}></SceneObject>
                  </SceneObject>;
      }
      LocalComponent.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };
      Component.triplexMeta = {
        "lighting": "default",
        "root": ImportedComponent?.triplexMeta?.root
      };"
    `);
  });

  it("should skip stubbing out userland create root calls", () => {
    const result = transformSync(
      `
        import { createRoot } from "react-dom/client";

        createRoot(document.getElementById("root")).render(<div />);
      `,
      {
        filename: "foo.tsx",
        plugins: [
          plugin({ exclude: ["foo.tsx"] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(
      `
      "import { createRoot } from "react-dom/client";
      createRoot(document.getElementById("root")).render(<div />);"
    `,
    );
  });

  it("should skip components that are local to the module scope", () => {
    const result = transformSync(
      `
        export function Component() {
          const { MyComponent } = useComponents();

          return (
            <>
              <MyComponent />
            </>
          );
        }
      `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toContain(`"root": "react"`);
  });

  it("should assume three fiber root", () => {
    const result = transformSync(
      `
        export function Component() {
          const { Object3dHelper } = useComponents();

          return (
            <>
              <Object3dHelper />
            </>
          );
        }
      `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toContain(`"root": "react-three-fiber"`);
  });

  it("should skip transforming components created in hocs", () => {
    const result = transformSync(
      `
        export function lazy() {
          const Component = forwardRef(function LazyWithPreload(props, ref) {
            return null;
          });

          return Component;
        }

        export const lazy1 = () => {
          const Component = forwardRef(function LazyWithPreload(props, ref) {
            return null;
          });

          return Component;
        }
      `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export function lazy() {
        const Component = forwardRef(function LazyWithPreload(props, ref) {
          return null;
        });
        return Component;
      }
      export const lazy1 = () => {
        const Component = forwardRef(function LazyWithPreload(props, ref) {
          return null;
        });
        return Component;
      };"
    `);
  });
});
