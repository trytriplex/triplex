/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import {
  transformSync as babelTransformSync,
  TransformOptions,
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
        filename: "/hello.tsx",
        plugins: [
          plugin({ exclude: ["/hello.tsx"] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot('"<group scale={scale} />;"');
  });

  it("should continue to apply other babel plugins when ignored", () => {
    const result = transformSync(
      `
      export function Component() {
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
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export function Component() {
        return <group scale={scale} />;
      }
      _c = Component;
      var _c;
      $RefreshReg$(_c, \\"Component\\");"
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
        filename: "/hello.tsx",
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "import { RigidBody } from '@react-three/rapier';
      <SceneObject name=\\"box\\" type=\\"dynamic\\" position={position} colliders=\\"cuboid\\" canSleep={false} __component={RigidBody} __meta={{
        \\"path\\": \\"/hello.tsx\\",
        \\"name\\": \\"RigidBody\\",
        \\"line\\": 3,
        \\"column\\": 7,
        \\"translate\\": true,
        \\"rotate\\": false,
        \\"scale\\": false
      }} key={\\"RigidBody37\\"}>
            </SceneObject>;"
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
        filename: "/box.tsx",
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "<SceneObject scale={scale} __component={\\"group\\"} __meta={{
        \\"path\\": \\"/box.tsx\\",
        \\"name\\": \\"group\\",
        \\"line\\": 2,
        \\"column\\": 7,
        \\"translate\\": false,
        \\"rotate\\": false,
        \\"scale\\": true
      }} key={\\"group27\\"}>
              <SceneObject position={[1, 1, 1]} __component={\\"mesh\\"} __meta={{
          \\"path\\": \\"/box.tsx\\",
          \\"name\\": \\"mesh\\",
          \\"line\\": 3,
          \\"column\\": 9,
          \\"translate\\": true,
          \\"rotate\\": false,
          \\"scale\\": false
        }} key={\\"mesh39\\"}>
                <SceneObject args={[1, 1, 1]} __component={\\"boxGeometry\\"} __meta={{
            \\"path\\": \\"/box.tsx\\",
            \\"name\\": \\"boxGeometry\\",
            \\"line\\": 4,
            \\"column\\": 11,
            \\"translate\\": false,
            \\"rotate\\": false,
            \\"scale\\": false
          }} key={\\"boxGeometry411\\"}></SceneObject>
                <SceneObject color=\\"black\\" __component={\\"standardMaterial\\"} __meta={{
            \\"path\\": \\"/box.tsx\\",
            \\"name\\": \\"standardMaterial\\",
            \\"line\\": 5,
            \\"column\\": 11,
            \\"translate\\": false,
            \\"rotate\\": false,
            \\"scale\\": false
          }} key={\\"standardMaterial511\\"}></SceneObject>
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
        filename: "/box.tsx",
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export function HelloWorld() {
        return <SceneObject __component={\\"mesh\\"} __meta={{
          \\"path\\": \\"/box.tsx\\",
          \\"name\\": \\"mesh\\",
          \\"line\\": 4,
          \\"column\\": 11,
          \\"translate\\": false,
          \\"rotate\\": false,
          \\"scale\\": false
        }} key={\\"mesh411\\"}></SceneObject>;
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
        filename: "/box.tsx",
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export const HelloWorld = () => {
        return <SceneObject __component={\\"mesh\\"} __meta={{
          \\"path\\": \\"/box.tsx\\",
          \\"name\\": \\"mesh\\",
          \\"line\\": 4,
          \\"column\\": 11,
          \\"translate\\": false,
          \\"rotate\\": false,
          \\"scale\\": false
        }} key={\\"mesh411\\"}></SceneObject>;
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
        filename: "/box.tsx",
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export const HelloWorld = () => {
        return <>
                  <SceneObject visible __component={\\"mesh\\"} __meta={{
            \\"path\\": \\"/box.tsx\\",
            \\"name\\": \\"mesh\\",
            \\"line\\": 5,
            \\"column\\": 13,
            \\"translate\\": false,
            \\"rotate\\": false,
            \\"scale\\": false
          }} key={\\"mesh513\\"}>
                    <SceneObject __component={\\"boxGeometry\\"} __meta={{
              \\"path\\": \\"/box.tsx\\",
              \\"name\\": \\"boxGeometry\\",
              \\"line\\": 6,
              \\"column\\": 15,
              \\"translate\\": false,
              \\"rotate\\": false,
              \\"scale\\": false
            }} key={\\"boxGeometry615\\"}></SceneObject>
                  </SceneObject>
                  <SceneObject __component={\\"spotLight\\"} __meta={{
            \\"path\\": \\"/box.tsx\\",
            \\"name\\": \\"spotLight\\",
            \\"line\\": 8,
            \\"column\\": 13,
            \\"translate\\": false,
            \\"rotate\\": false,
            \\"scale\\": false
          }} key={\\"spotLight813\\"}></SceneObject>
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
        filename: "/box.tsx",
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
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
          \\"column\\": 11,
          \\"translate\\": false,
          \\"rotate\\": false,
          \\"scale\\": false
        }} key={\\"group911\\"}></SceneObject>;
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
        filename: "/box.tsx",
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "const HelloWorld = () => {
        return <SceneObject __component={\\"mesh\\"} __meta={{
          \\"path\\": \\"/box.tsx\\",
          \\"name\\": \\"mesh\\",
          \\"line\\": 4,
          \\"column\\": 11,
          \\"translate\\": false,
          \\"rotate\\": false,
          \\"scale\\": false
        }} key={\\"mesh411\\"}></SceneObject>;
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
        filename: "/box.tsx",
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "export const HelloWorld = forwardRef(ref => {
        return <SceneObject ref={ref} __component={\\"mesh\\"} __meta={{
          \\"path\\": \\"/box.tsx\\",
          \\"name\\": \\"mesh\\",
          \\"line\\": 4,
          \\"column\\": 11,
          \\"translate\\": false,
          \\"rotate\\": false,
          \\"scale\\": false
        }} key={\\"mesh411\\"}></SceneObject>;
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
        filename: "/box.tsx",
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
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
          \\"column\\": 11,
          \\"translate\\": false,
          \\"rotate\\": false,
          \\"scale\\": true
        }} key={\\"group911\\"}>
                  <SceneObject {...ok} userData={{
            hello: true
          }} onClick={() => {}} visible={true} position={position} rotation={rotation} __component={\\"mesh\\"} __meta={{
            \\"path\\": \\"/box.tsx\\",
            \\"name\\": \\"mesh\\",
            \\"line\\": 10,
            \\"column\\": 13,
            \\"translate\\": true,
            \\"rotate\\": false,
            \\"scale\\": false
          }} key={\\"mesh1013\\"}>
                    <SceneObject args={[1, 1, 1]} __component={\\"boxGeometry\\"} __meta={{
              \\"path\\": \\"/box.tsx\\",
              \\"name\\": \\"boxGeometry\\",
              \\"line\\": 18,
              \\"column\\": 15,
              \\"translate\\": false,
              \\"rotate\\": false,
              \\"scale\\": false
            }} key={\\"boxGeometry1815\\"}></SceneObject>
                    <SceneObject color=\\"#00ff00\\" __component={\\"meshStandardMaterial\\"} __meta={{
              \\"path\\": \\"/box.tsx\\",
              \\"name\\": \\"meshStandardMaterial\\",
              \\"line\\": 19,
              \\"column\\": 15,
              \\"translate\\": false,
              \\"rotate\\": false,
              \\"scale\\": false
            }} key={\\"meshStandardMaterial1915\\"}></SceneObject>
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
        filename: "/box.tsx",
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "<SceneObject __component={CustomComponent} __meta={{
        \\"path\\": \\"/box.tsx\\",
        \\"name\\": \\"CustomComponent\\",
        \\"line\\": 2,
        \\"column\\": 7,
        \\"translate\\": false,
        \\"rotate\\": false,
        \\"scale\\": false
      }} key={\\"CustomComponent27\\"}></SceneObject>;"
    `);
  });

  it("should merge string key", () => {
    const result = transformSync(
      `
      <CustomComponent key="existing" />
    `,
      {
        filename: "/box.tsx",
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "<SceneObject __component={CustomComponent} __meta={{
        \\"path\\": \\"/box.tsx\\",
        \\"name\\": \\"CustomComponent\\",
        \\"line\\": 2,
        \\"column\\": 7,
        \\"translate\\": false,
        \\"rotate\\": false,
        \\"scale\\": false
      }} key={\\"CustomComponent27\\" + \\"existing\\"}></SceneObject>;"
    `);
  });

  it("should merge number keys", () => {
    const result = transformSync(
      `
      <CustomComponent key={10} />
    `,
      {
        filename: "/box.tsx",
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "<SceneObject __component={CustomComponent} __meta={{
        \\"path\\": \\"/box.tsx\\",
        \\"name\\": \\"CustomComponent\\",
        \\"line\\": 2,
        \\"column\\": 7,
        \\"translate\\": false,
        \\"rotate\\": false,
        \\"scale\\": false
      }} key={\\"CustomComponent27\\" + 10}></SceneObject>;"
    `);
  });

  it("should mark host elements using user data for position prop", () => {
    // position={position} -> userData={{ __triplexTransform: 'translate' }}
    const result = transformSync(
      `
      <mesh position={position} />
    `,
      {
        filename: "/box.tsx",
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "<SceneObject position={position} __component={\\"mesh\\"} __meta={{
        \\"path\\": \\"/box.tsx\\",
        \\"name\\": \\"mesh\\",
        \\"line\\": 2,
        \\"column\\": 7,
        \\"translate\\": true,
        \\"rotate\\": false,
        \\"scale\\": false
      }} key={\\"mesh27\\"}></SceneObject>;"
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
        filename: "/box.tsx",
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "function Component(props) {
        return <SceneObject {...props} __component={\\"mesh\\"} __meta={{
          \\"path\\": \\"/box.tsx\\",
          \\"name\\": \\"mesh\\",
          \\"line\\": 3,
          \\"column\\": 16,
          \\"translate\\": true,
          \\"rotate\\": true,
          \\"scale\\": true
        }} key={\\"mesh316\\"}></SceneObject>;
      }
      Component.triplexMeta = {
        \\"lighting\\": \\"default\\"
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
        filename: "/box.tsx",
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "const Component = forwardRef(props => {
        return <SceneObject {...props} __component={\\"mesh\\"} __meta={{
          \\"path\\": \\"/box.tsx\\",
          \\"name\\": \\"mesh\\",
          \\"line\\": 3,
          \\"column\\": 16,
          \\"translate\\": true,
          \\"rotate\\": true,
          \\"scale\\": true
        }} key={\\"mesh316\\"}></SceneObject>;
      });
      Component.triplexMeta = {
        \\"lighting\\": \\"default\\"
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
        filename: "/box.tsx",
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "function Component({
        name,
        ...props
      }) {
        return <SceneObject {...props} __component={\\"mesh\\"} __meta={{
          \\"path\\": \\"/box.tsx\\",
          \\"name\\": \\"mesh\\",
          \\"line\\": 3,
          \\"column\\": 16,
          \\"translate\\": true,
          \\"rotate\\": true,
          \\"scale\\": true
        }} key={\\"mesh316\\"}></SceneObject>;
      }
      Component.triplexMeta = {
        \\"lighting\\": \\"default\\"
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
        filename: "/box.tsx",
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "const Component = forwardRef(({
        name,
        ...props
      }) => {
        return <SceneObject {...props} __component={\\"mesh\\"} __meta={{
          \\"path\\": \\"/box.tsx\\",
          \\"name\\": \\"mesh\\",
          \\"line\\": 3,
          \\"column\\": 16,
          \\"translate\\": true,
          \\"rotate\\": true,
          \\"scale\\": true
        }} key={\\"mesh316\\"}></SceneObject>;
      });
      Component.triplexMeta = {
        \\"lighting\\": \\"default\\"
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
        filename: "/box.tsx",
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "function Component({
        name,
        position,
        rotation,
        scale,
        ...props
      }) {
        return <SceneObject {...props} __component={\\"mesh\\"} __meta={{
          \\"path\\": \\"/box.tsx\\",
          \\"name\\": \\"mesh\\",
          \\"line\\": 3,
          \\"column\\": 16,
          \\"translate\\": false,
          \\"rotate\\": false,
          \\"scale\\": false
        }} key={\\"mesh316\\"}></SceneObject>;
      }
      Component.triplexMeta = {
        \\"lighting\\": \\"default\\"
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
        filename: "/box.tsx",
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "const Component = forwardRef(({
        name,
        position,
        rotation,
        scale,
        ...props
      }) => {
        return <SceneObject {...props} __component={\\"mesh\\"} __meta={{
          \\"path\\": \\"/box.tsx\\",
          \\"name\\": \\"mesh\\",
          \\"line\\": 3,
          \\"column\\": 16,
          \\"translate\\": false,
          \\"rotate\\": false,
          \\"scale\\": false
        }} key={\\"mesh316\\"}></SceneObject>;
      });
      Component.triplexMeta = {
        \\"lighting\\": \\"default\\"
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
        filename: "/box.tsx",
        plugins: [
          plugin({ exclude: [] }),
          require.resolve("@babel/plugin-syntax-jsx"),
        ],
      }
    );

    expect(result?.code).toMatchInlineSnapshot(`
      "const Component = forwardRef(function Hello(props) {
        return <SceneObject {...props} __component={\\"mesh\\"} __meta={{
          \\"path\\": \\"/box.tsx\\",
          \\"name\\": \\"mesh\\",
          \\"line\\": 3,
          \\"column\\": 16,
          \\"translate\\": false,
          \\"rotate\\": false,
          \\"scale\\": false
        }} key={\\"mesh316\\"}></SceneObject>;
      });
      Component.triplexMeta = {
        \\"lighting\\": \\"default\\"
      };"
    `);
  });
});
