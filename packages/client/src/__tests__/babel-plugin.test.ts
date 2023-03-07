import { describe, expect, it } from "vitest";
import { transformSync } from "@babel/core";
import plugin from "../babel-plugin";

describe("babel plugin", () => {
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
        plugins: [plugin, "@babel/plugin-syntax-jsx"],
        filename: "/box.tsx",
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "<group userData={{
        \\"triplexSceneMeta\\": {
          \\"path\\": \\"/box.tsx\\",
          \\"name\\": \\"group\\",
          \\"line\\": 2,
          \\"column\\": 7,
          \\"props\\": {
            \\"scale\\": scale
          }
        }
      }}><group scale={scale}>
              <group userData={{
            \\"triplexSceneMeta\\": {
              \\"path\\": \\"/box.tsx\\",
              \\"name\\": \\"mesh\\",
              \\"line\\": 3,
              \\"column\\": 9,
              \\"props\\": {
                \\"position\\": [1, 1, 1]
              }
            }
          }}><mesh position={[1, 1, 1]}>
                <boxGeometry args={[1, 1, 1]} />
                <standardMaterial color=\\"black\\" />
              </mesh></group>
            </group></group>;"
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
        plugins: [plugin, "@babel/plugin-syntax-jsx"],
        filename: "/box.tsx",
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export function HelloWorld() {
        return <group userData={{
          \\"triplexSceneMeta\\": {
            \\"path\\": \\"/box.tsx\\",
            \\"name\\": \\"mesh\\",
            \\"line\\": 4,
            \\"column\\": 11,
            \\"props\\": {}
          }
        }}><mesh /></group>;
      }
      HelloWorld.triplexMeta = {
        \\"lighting\\": \\"default\\"
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
        plugins: [plugin, "@babel/plugin-syntax-jsx"],
        filename: "/box.tsx",
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export const HelloWorld = () => {
        return <group userData={{
          \\"triplexSceneMeta\\": {
            \\"path\\": \\"/box.tsx\\",
            \\"name\\": \\"mesh\\",
            \\"line\\": 4,
            \\"column\\": 11,
            \\"props\\": {}
          }
        }}><mesh /></group>;
      };
      HelloWorld.triplexMeta = {
        \\"lighting\\": \\"default\\"
      };"
    `);
  });

  it("should forward key", () => {
    const result = transformSync(
      `
      export const HelloWorld = () => {
        return (
          <>
            <mesh key="ok-then" />
            <spotLight />
          </>
        );
      }
    `,
      {
        plugins: [plugin, "@babel/plugin-syntax-jsx"],
        filename: "/box.tsx",
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export const HelloWorld = () => {
        return <>
                  <group key=\\"ok-then\\" userData={{
            \\"triplexSceneMeta\\": {
              \\"path\\": \\"/box.tsx\\",
              \\"name\\": \\"mesh\\",
              \\"line\\": 5,
              \\"column\\": 13,
              \\"props\\": {
                \\"key\\": \\"ok-then\\"
              }
            }
          }}><mesh /></group>
                  <group userData={{
            \\"triplexSceneMeta\\": {
              \\"path\\": \\"/box.tsx\\",
              \\"name\\": \\"spotLight\\",
              \\"line\\": 6,
              \\"column\\": 13,
              \\"props\\": {}
            }
          }}><spotLight /></group>
                </>;
      };
      HelloWorld.triplexMeta = {
        \\"lighting\\": \\"custom\\"
      };"
    `);
  });

  it("should set lighting meta to custom", () => {
    const result = transformSync(
      `
      export const HelloWorld = () => {
        return (
          <>
            <mesh />
            <spotLight />
          </>
        );
      }
    `,
      {
        plugins: [plugin, "@babel/plugin-syntax-jsx"],
        filename: "/box.tsx",
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export const HelloWorld = () => {
        return <>
                  <group userData={{
            \\"triplexSceneMeta\\": {
              \\"path\\": \\"/box.tsx\\",
              \\"name\\": \\"mesh\\",
              \\"line\\": 5,
              \\"column\\": 13,
              \\"props\\": {}
            }
          }}><mesh /></group>
                  <group userData={{
            \\"triplexSceneMeta\\": {
              \\"path\\": \\"/box.tsx\\",
              \\"name\\": \\"spotLight\\",
              \\"line\\": 6,
              \\"column\\": 13,
              \\"props\\": {}
            }
          }}><spotLight /></group>
                </>;
      };
      HelloWorld.triplexMeta = {
        \\"lighting\\": \\"custom\\"
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
        plugins: [plugin, "@babel/plugin-syntax-jsx"],
        filename: "/box.tsx",
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export function hello() {}
      const okThen = () => {};
      function HelloWorld() {
        const onClick = () => {};
        return <group userData={{
          \\"triplexSceneMeta\\": {
            \\"path\\": \\"/box.tsx\\",
            \\"name\\": \\"group\\",
            \\"line\\": 9,
            \\"column\\": 11,
            \\"props\\": {}
          }
        }}><group /></group>;
      }
      HelloWorld.triplexMeta = {
        \\"lighting\\": \\"default\\"
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
        plugins: [plugin, "@babel/plugin-syntax-jsx"],
        filename: "/box.tsx",
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "const HelloWorld = () => {
        return <group userData={{
          \\"triplexSceneMeta\\": {
            \\"path\\": \\"/box.tsx\\",
            \\"name\\": \\"mesh\\",
            \\"line\\": 4,
            \\"column\\": 11,
            \\"props\\": {}
          }
        }}><mesh /></group>;
      };
      export default HelloWorld;
      HelloWorld.triplexMeta = {
        \\"lighting\\": \\"default\\"
      };"
    `);
  });

  it("should set triplex meta for wrapped exports", () => {
    const result = transformSync(
      `
      export const HelloWorld = forwardRef(() => {
        return (
          <mesh />
        );
      });
    `,
      {
        plugins: [plugin, "@babel/plugin-syntax-jsx"],
        filename: "/box.tsx",
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export const HelloWorld = forwardRef(() => {
        return <group userData={{
          \\"triplexSceneMeta\\": {
            \\"path\\": \\"/box.tsx\\",
            \\"name\\": \\"mesh\\",
            \\"line\\": 4,
            \\"column\\": 11,
            \\"props\\": {}
          }
        }}><mesh /></group>;
      });
      HelloWorld.triplexMeta = {
        \\"lighting\\": \\"default\\"
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
        plugins: [plugin, "@babel/plugin-syntax-jsx"],
        filename: "/box.tsx",
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "function Box({
        position,
        rotation,
        scale
      }) {
        const ok = {};
        return <group userData={{
          \\"triplexSceneMeta\\": {
            \\"path\\": \\"/box.tsx\\",
            \\"name\\": \\"group\\",
            \\"line\\": 9,
            \\"column\\": 11,
            \\"props\\": {
              \\"visible\\": true,
              \\"scale\\": scale
            }
          }
        }}><group visible scale={scale}>
                  <group userData={{
              \\"triplexSceneMeta\\": {
                \\"path\\": \\"/box.tsx\\",
                \\"name\\": \\"mesh\\",
                \\"line\\": 10,
                \\"column\\": 13,
                \\"props\\": {
                  ...ok,
                  \\"userData\\": {
                    hello: true
                  },
                  \\"onClick\\": () => {},
                  \\"visible\\": true,
                  \\"position\\": position,
                  \\"rotation\\": rotation
                }
              }
            }}><mesh {...ok} userData={{
                hello: true
              }} onClick={() => {}} visible={true} position={position} rotation={rotation}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color=\\"#00ff00\\" />
                  </mesh></group>
                </group></group>;
      }
      export default Box;
      Box.triplexMeta = {
        \\"lighting\\": \\"default\\"
      };"
    `);
  });
});
