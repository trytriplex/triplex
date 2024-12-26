/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
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
    code: result.code?.replace(/[A-Z]:\\\\/g, "/"),
  };
};

describe("babel plugin", () => {
  it("should ignore a file and not transform anything", () => {
    const result = transformSync(
      `
      <group scale={scale} />
    `,
      {
        plugins: [
          plugin({ exclude: ["/hello.tsx"] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "<SceneObject scale={scale} __component={"group"} __meta={{
        "path": "",
        "name": "group",
        "line": 2,
        "column": 7,
        "translate": false,
        "rotate": false,
        "scale": true
      }}></SceneObject>;"
    `);
  });

  it("should continue to apply other babel plugins when ignored", () => {
    const result = transformSync(
      `
      export function Component() {
        return <group scale={scale} />
      }
    `,
      {
        plugins: [
          plugin({ exclude: ["/hello.tsx"] }),
          require.resolve("@babel/plugin-syntax-jsx"),
          [require.resolve("react-refresh/babel"), { skipEnvCheck: true }],
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export function Component() {
        return <SceneObject scale={scale} __component={"group"} __meta={{
          "path": "",
          "name": "group",
          "line": 3,
          "column": 16,
          "translate": false,
          "rotate": false,
          "scale": true
        }}></SceneObject>;
      }
      _c = Component;
      Component.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };
      var _c;
      $RefreshReg$(_c, "Component");"
    `);
  });

  it("should flag a component declared in node_modules as transformed", () => {
    const result = transformSync(
      `
      import { RigidBody } from '@react-three/rapier';
      <RigidBody
        name="box"
        type="dynamic"
        position={position}
        colliders="cuboid"
        canSleep={false}
      >
      </RigidBody>
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
      <SceneObject name="box" type="dynamic" position={position} colliders="cuboid" canSleep={false} __component={RigidBody} __meta={{
        "path": "",
        "name": "RigidBody",
        "line": 3,
        "column": 7,
        "translate": true,
        "rotate": false,
        "scale": false
      }}>
            </SceneObject>;"
    `);
  });

  it("should ignore windows paths", () => {
    const result = transformSync(
      `
      <group />
    `,
      {
        plugins: [
          plugin({ exclude: ["is/a/path"] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "<SceneObject __component={"group"} __meta={{
        "path": "",
        "name": "group",
        "line": 2,
        "column": 7,
        "translate": false,
        "rotate": false,
        "scale": false
      }}></SceneObject>;"
    `);
  });

  it("should transform scene with wrapped groups", () => {
    const result = transformSync(
      `
      <group scale={scale}>
        <mesh position={[1,1,1]}>
          <boxGeometry args={[1,1,1]} />
          <standardMaterial color="black" />
        </mesh>
      </group>
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "<SceneObject scale={scale} __component={"group"} __meta={{
        "path": "",
        "name": "group",
        "line": 2,
        "column": 7,
        "translate": false,
        "rotate": false,
        "scale": true
      }}>
              <SceneObject position={[1, 1, 1]} __component={"mesh"} __meta={{
          "path": "",
          "name": "mesh",
          "line": 3,
          "column": 9,
          "translate": true,
          "rotate": false,
          "scale": false
        }}>
                <SceneObject args={[1, 1, 1]} __component={"boxGeometry"} __meta={{
            "path": "",
            "name": "boxGeometry",
            "line": 4,
            "column": 11,
            "translate": false,
            "rotate": false,
            "scale": false
          }}></SceneObject>
                <SceneObject color="black" __component={"standardMaterial"} __meta={{
            "path": "",
            "name": "standardMaterial",
            "line": 5,
            "column": 11,
            "translate": false,
            "rotate": false,
            "scale": false
          }}></SceneObject>
              </SceneObject>
            </SceneObject>;"
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
      "export const HelloWorld = () => {
        return <>
                  <SceneObject visible __component={"mesh"} __meta={{
            "path": "",
            "name": "mesh",
            "line": 5,
            "column": 13,
            "translate": false,
            "rotate": false,
            "scale": false
          }}>
                    <SceneObject __component={"boxGeometry"} __meta={{
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
            "path": "",
            "name": "spotLight",
            "line": 8,
            "column": 13,
            "translate": false,
            "rotate": false,
            "scale": false
          }}></SceneObject>
                </>;
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
            "path": "",
            "name": "mesh",
            "line": 10,
            "column": 13,
            "translate": true,
            "rotate": false,
            "scale": false
          }}>
                    <SceneObject args={[1, 1, 1]} __component={"boxGeometry"} __meta={{
              "path": "",
              "name": "boxGeometry",
              "line": 18,
              "column": 15,
              "translate": false,
              "rotate": false,
              "scale": false
            }}></SceneObject>
                    <SceneObject color="#00ff00" __component={"meshStandardMaterial"} __meta={{
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
      <mesh position={position} />
    `,
      {
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      },
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "<SceneObject position={position} __component={"mesh"} __meta={{
        "path": "",
        "name": "mesh",
        "line": 2,
        "column": 7,
        "translate": true,
        "rotate": false,
        "scale": false
      }}></SceneObject>;"
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
      const Component = forwardRef(({ name, ...props }) => {
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
      "const Component = forwardRef(({
        name,
        ...props
      }) => {
        const shouldSkipThisNode = ({
          ...ok
        }) => {};
        return <SceneObject {...props} __component={"mesh"} __meta={{
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
          "path": "",
          "name": "mesh",
          "line": 3,
          "column": 16,
          "translate": false,
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

  it('should bail out if the spread props does not include "position", "rotation" or "scale" as an arrow function', () => {
    const result = transformSync(
      `
      const Component = forwardRef(({ name, position, rotation, scale, ...props }) => {
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
        position,
        rotation,
        scale,
        ...props
      }) => {
        return <SceneObject {...props} __component={"mesh"} __meta={{
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

  it("should should skip nested function expressions", () => {
    const result = transformSync(
      `
      const Component = forwardRef(function Hello(props) {
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
      "const Component = forwardRef(function Hello(props) {
        test(function anotherOne(another) {});
        return <SceneObject {...props} __component={"mesh"} __meta={{
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

    expect(result?.code).toContain('"root": Bar.triplexMeta.root');
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

    expect(result?.code).toContain('"root": Bar.triplexMeta.root');
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

    expect(result?.code).toContain(`"root": Dialog.triplexMeta.root`);
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
          "path": "",
          "name": "ContextProvider",
          "line": 4,
          "column": 13,
          "translate": false,
          "rotate": false,
          "scale": false
        }}>
                    <SceneObject __component={"mesh"} __meta={{
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
        "root": ContextProvider.triplexMeta.root || "react-three-fiber"
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
          return (
            <>
              <Inbuilt2 />
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
      "export function Inbuilt() {
        return <SceneObject __component={"mesh"} __meta={{
          "path": "",
          "name": "mesh",
          "line": 4,
          "column": 13,
          "translate": false,
          "rotate": false,
          "scale": false
        }}>
                    <SceneObject __component={"boxGeometry"} __meta={{
            "path": "",
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
          "path": "",
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
          "path": "",
          "name": "Inbuilt1",
          "line": 14,
          "column": 18,
          "translate": false,
          "rotate": false,
          "scale": false
        }}></SceneObject>;
      }
      export function Scene() {
        return <>
                    <SceneObject __component={Inbuilt2} __meta={{
            "path": "",
            "name": "Inbuilt2",
            "line": 20,
            "column": 15,
            "translate": false,
            "rotate": false,
            "scale": false
          }}></SceneObject>
                  </>;
      }
      Inbuilt.triplexMeta = {
        "lighting": "default",
        "root": "react-three-fiber"
      };
      Inbuilt1.triplexMeta = {
        "lighting": "default",
        "root": Inbuilt.triplexMeta.root
      };
      Inbuilt2.triplexMeta = {
        "lighting": "default",
        "root": Inbuilt1.triplexMeta.root
      };
      Scene.triplexMeta = {
        "lighting": "default",
        "root": Inbuilt2.triplexMeta.root
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
});
