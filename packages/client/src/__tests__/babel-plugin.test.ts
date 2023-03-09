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
      "<SceneObject scale={scale} __component={\\"group\\"} __meta={{
        \\"path\\": \\"/box.tsx\\",
        \\"name\\": \\"group\\",
        \\"line\\": 2,
        \\"column\\": 7
      }}>
              <SceneObject position={[1, 1, 1]} __component={\\"mesh\\"} __meta={{
          \\"path\\": \\"/box.tsx\\",
          \\"name\\": \\"mesh\\",
          \\"line\\": 3,
          \\"column\\": 9
        }}>
                <SceneObject args={[1, 1, 1]} __component={\\"boxGeometry\\"} __meta={{
            \\"path\\": \\"/box.tsx\\",
            \\"name\\": \\"boxGeometry\\",
            \\"line\\": 4,
            \\"column\\": 11
          }}></SceneObject>
                <SceneObject color=\\"black\\" __component={\\"standardMaterial\\"} __meta={{
            \\"path\\": \\"/box.tsx\\",
            \\"name\\": \\"standardMaterial\\",
            \\"line\\": 5,
            \\"column\\": 11
          }}></SceneObject>
              </SceneObject>
            </SceneObject>;"
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
        return <SceneObject __component={\\"mesh\\"} __meta={{
          \\"path\\": \\"/box.tsx\\",
          \\"name\\": \\"mesh\\",
          \\"line\\": 4,
          \\"column\\": 11
        }}></SceneObject>;
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
        return <SceneObject __component={\\"mesh\\"} __meta={{
          \\"path\\": \\"/box.tsx\\",
          \\"name\\": \\"mesh\\",
          \\"line\\": 4,
          \\"column\\": 11
        }}></SceneObject>;
      };
      HelloWorld.triplexMeta = {
        \\"lighting\\": \\"default\\"
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
        plugins: [plugin, "@babel/plugin-syntax-jsx"],
        filename: "/box.tsx",
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export const HelloWorld = () => {
        return <>
                  <SceneObject visible __component={\\"mesh\\"} __meta={{
            \\"path\\": \\"/box.tsx\\",
            \\"name\\": \\"mesh\\",
            \\"line\\": 5,
            \\"column\\": 13
          }}>
                    <SceneObject __component={\\"boxGeometry\\"} __meta={{
              \\"path\\": \\"/box.tsx\\",
              \\"name\\": \\"boxGeometry\\",
              \\"line\\": 6,
              \\"column\\": 15
            }}></SceneObject>
                  </SceneObject>
                  <SceneObject __component={\\"spotLight\\"} __meta={{
            \\"path\\": \\"/box.tsx\\",
            \\"name\\": \\"spotLight\\",
            \\"line\\": 8,
            \\"column\\": 13
          }}></SceneObject>
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
        return <SceneObject __component={\\"group\\"} __meta={{
          \\"path\\": \\"/box.tsx\\",
          \\"name\\": \\"group\\",
          \\"line\\": 9,
          \\"column\\": 11
        }}></SceneObject>;
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
        return <SceneObject __component={\\"mesh\\"} __meta={{
          \\"path\\": \\"/box.tsx\\",
          \\"name\\": \\"mesh\\",
          \\"line\\": 4,
          \\"column\\": 11
        }}></SceneObject>;
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
      export const HelloWorld = forwardRef((ref) => {
        return (
          <mesh ref={ref} />
        );
      });
    `,
      {
        plugins: [plugin, "@babel/plugin-syntax-jsx"],
        filename: "/box.tsx",
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export const HelloWorld = forwardRef(ref => {
        return <SceneObject ref={ref} __component={\\"mesh\\"} __meta={{
          \\"path\\": \\"/box.tsx\\",
          \\"name\\": \\"mesh\\",
          \\"line\\": 4,
          \\"column\\": 11
        }}></SceneObject>;
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
        return <SceneObject visible scale={scale} __component={\\"group\\"} __meta={{
          \\"path\\": \\"/box.tsx\\",
          \\"name\\": \\"group\\",
          \\"line\\": 9,
          \\"column\\": 11
        }}>
                  <SceneObject {...ok} userData={{
            hello: true
          }} onClick={() => {}} visible={true} position={position} rotation={rotation} __component={\\"mesh\\"} __meta={{
            \\"path\\": \\"/box.tsx\\",
            \\"name\\": \\"mesh\\",
            \\"line\\": 10,
            \\"column\\": 13
          }}>
                    <SceneObject args={[1, 1, 1]} __component={\\"boxGeometry\\"} __meta={{
              \\"path\\": \\"/box.tsx\\",
              \\"name\\": \\"boxGeometry\\",
              \\"line\\": 18,
              \\"column\\": 15
            }}></SceneObject>
                    <SceneObject color=\\"#00ff00\\" __component={\\"meshStandardMaterial\\"} __meta={{
              \\"path\\": \\"/box.tsx\\",
              \\"name\\": \\"meshStandardMaterial\\",
              \\"line\\": 19,
              \\"column\\": 15
            }}></SceneObject>
                  </SceneObject>
                </SceneObject>;
      }
      export default Box;
      Box.triplexMeta = {
        \\"lighting\\": \\"default\\"
      };"
    `);
  });

  it("should wrap custom component", () => {
    const result = transformSync(
      `
      <CustomComponent />
    `,
      {
        plugins: [plugin, "@babel/plugin-syntax-jsx"],
        filename: "/box.tsx",
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "<SceneObject __component={CustomComponent} __meta={{
        \\"path\\": \\"/box.tsx\\",
        \\"name\\": \\"CustomComponent\\",
        \\"line\\": 2,
        \\"column\\": 7
      }}></SceneObject>;"
    `);
  });
});
