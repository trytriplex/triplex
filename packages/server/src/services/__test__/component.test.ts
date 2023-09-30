/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { rmSync } from "node:fs";
import { _createProject, createProject } from "../../ast/project";
import {
  add,
  upsertProp,
  commentComponent,
  uncommentComponent,
  deleteCommentComponents,
  rename,
} from "../component";
import { getExportName } from "../../ast/module";
import { getJsxElementAt, getJsxElementsPositions } from "../../ast/jsx";
import { getJsxElementPropTypes } from "../../ast/type-infer";
import { SyntaxKind } from "ts-morph";

const cleanTmpDir = () => {
  try {
    rmSync(join(__dirname, "tmp"), { recursive: true, force: true });
  } catch (e) {
    return;
  }
};

describe("component service", () => {
  beforeEach(cleanTmpDir);
  afterEach(cleanTmpDir);

  it("should rename a function declaration named export", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/empty.tsx")
    );

    rename(sourceFile, "EmptyFragment", "MyNewName");

    expect(() => getExportName(sourceFile, "EmptyFragment")).toThrow();
    expect(() => getExportName(sourceFile, "MyNewName")).not.toThrow();
  });

  it("should rename a variable declaration named export", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/reuse.tsx")
    );

    rename(sourceFile, "NamedExport", "NewExport");

    expect(() => getExportName(sourceFile, "NamedExport")).toThrow();
    expect(() => getExportName(sourceFile, "NewExport")).not.toThrow();
  });

  it("should rename local usages", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/reuse.tsx")
    );

    rename(sourceFile, "Reuse", "AnotherOne");

    expect(getExportName(sourceFile, "NamedExport").declaration.getText())
      .toMatchInlineSnapshot(`
      "NamedExport = () => {
        return (
          <>
            <AnotherOne></AnotherOne>
          </>
        );
      }"
    `);
  });

  it("should rename default export", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/add-prop.tsx")
    );

    rename(sourceFile, "default", "MyNewName");

    expect(getExportName(sourceFile, "default").name).toEqual("MyNewName");
  });

  it("should return the line column number of new jsx element in shorthand", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/empty.tsx")
    );

    const result = add(sourceFile, "EmptyFragment", {
      type: "custom",
      exportName: "default",
      path: join(__dirname, "stub-component.tsx"),
      props: { color: "blurple" },
    });

    expect(
      getJsxElementAt(sourceFile, result.line, result.column)?.getText()
    ).toMatchInlineSnapshot('"<StubComponent color=\\"blurple\\"/>"');
  });

  it("should add host component", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/empty.tsx")
    );

    add(sourceFile, "EmptyFragment", {
      type: "host",
      name: "group",
      props: {},
    });

    const result = getExportName(
      sourceFile,
      "EmptyFragment"
    ).declaration.getText();
    expect(result).toMatchInlineSnapshot(`
      "export function EmptyFragment() {
        return (
          <>
            <mesh
              position={[1.23121231233123, 1.2321231233123, 1.121231213123123]}
            ></mesh>
          <group /></>
        );
      }"
    `);
  });

  it("should return the line column number of new jsx element in frag", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/empty.tsx")
    );

    const result = add(sourceFile, "FragmentFragment", {
      type: "custom",
      exportName: "default",
      path: join(__dirname, "stub-component.tsx"),
      props: { color: "red" },
    });

    expect(
      getJsxElementAt(sourceFile, result.line, result.column)?.getText()
    ).toMatchInlineSnapshot('"<StubComponent color=\\"red\\"/>"');
  });

  it("should add default component to shorthand fragment", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/empty.tsx")
    );

    add(sourceFile, "EmptyFragment", {
      type: "custom",
      exportName: "default",
      path: join(__dirname, "stub-component.tsx"),
      props: { color: "red" },
    });

    const result = getExportName(
      sourceFile,
      "EmptyFragment"
    ).declaration.getText();
    expect(result).toMatchInlineSnapshot(`
      "export function EmptyFragment() {
        return (
          <>
            <mesh
              position={[1.23121231233123, 1.2321231233123, 1.121231213123123]}
            ></mesh>
          <StubComponent color=\\"red\\"/></>
        );
      }"
    `);
  });

  it("should alias named import and ensure relative link to nested folder", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/add-prop.tsx")
    );

    add(sourceFile, "default", {
      type: "custom",
      exportName: "Box",
      path: join(__dirname, "__mocks__/components/box.tsx"),
      props: {},
    });

    expect(sourceFile.getText()).toContain(
      'import { Box as Box1 } from "./components/box"'
    );
  });

  it("should add component to longhand fragment", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/empty.tsx")
    );

    add(sourceFile, "FragmentFragment", {
      type: "custom",
      exportName: "NamedComponent",
      path: join(__dirname, "stub-component.tsx"),
      props: {},
    });

    const result = getExportName(
      sourceFile,
      "FragmentFragment"
    ).declaration.getText();
    expect(result).toMatchInlineSnapshot(`
      "export function FragmentFragment() {
        return <Fragment><NamedComponent /></Fragment>;
      }"
    `);
  });

  it("should skip adding a new import specifier if it already exists", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/add-prop.tsx")
    );

    add(sourceFile, "default", {
      type: "custom",
      exportName: "Sphere",
      path: "@react-three/drei",
      props: {},
    });

    expect(
      sourceFile.getText().match(/from "@react-three\/drei"/g)
    ).toHaveLength(1);
    expect(sourceFile.getText()).toContain(
      'import { Sphere, RoundedBox } from "@react-three/drei";'
    );
  });

  it("should create unique name if variable already exists", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/add-prop.tsx")
    );

    add(sourceFile, "default", {
      type: "custom",
      exportName: "Box",
      path: "@react-three/drei",
      props: {},
    });

    expect(sourceFile.getText()).toContain(
      'import { Box as Box1, RoundedBox } from "@react-three/drei"'
    );
    expect(sourceFile.getText()).not.toContain("<Box>");
    expect(sourceFile.getText()).toContain("<Box1 />");
  });

  it("should import relative named component", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/empty.tsx")
    );

    add(sourceFile, "FragmentFragment", {
      type: "custom",
      exportName: "NamedComponent",
      path: join(__dirname, "__mocks__/stub-component.tsx"),
      props: {},
    });

    expect(sourceFile.getText()).toContain(
      'import { NamedComponent } from "./stub-component";'
    );
  });

  it("should reuse default import", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/reuse.tsx")
    );

    add(sourceFile, "Reuse", {
      type: "custom",
      exportName: "default",
      path: join(__dirname, "__mocks__/add-prop.tsx"),
      props: {},
    });

    expect(sourceFile.getText()).toContain('import Scene from "./add-prop";');
  });

  it("should reuse named import", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/add-prop.tsx")
    );

    add(sourceFile, "default", {
      type: "custom",
      exportName: "RoundedBox",
      path: "@react-three/drei",
      props: {},
    });

    expect(
      sourceFile.getText().match(/from "@react-three\/drei"/g)
    ).toHaveLength(1);
    expect(sourceFile.getText()).toContain(
      'import { RoundedBox } from "@react-three/drei";'
    );
  });

  it("should import relative default component", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/empty.tsx")
    );

    add(sourceFile, "FragmentFragment", {
      type: "custom",
      exportName: "default",
      path: join(__dirname, "stub-component.tsx"),
      props: {},
    });

    expect(sourceFile.getText()).toContain(
      'import StubComponent from "../stub-component";'
    );
  });

  it("should import node_modules component", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/empty.tsx")
    );

    add(sourceFile, "FragmentFragment", {
      type: "custom",
      exportName: "Box",
      path: "@react-three/drei",
      props: {},
    });

    expect(sourceFile.getText()).toContain(
      'import { Box } from "@react-three/drei";'
    );
  });

  it("should throw when trying to add a jsx element to a non fragment or group", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/empty.tsx")
    );

    expect(() => {
      add(sourceFile, "EmptyMesh", {
        type: "custom",
        exportName: "NamedComponent",
        path: join(__dirname, "stub-component.tsx"),
        props: {},
      });
    }).toThrow();
  });

  it("should add a prop to a component", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/add-prop.tsx")
    );
    const jsxElement = getJsxElementAt(sourceFile, 12, 7);
    if (!jsxElement) {
      throw new Error("invariant");
    }

    upsertProp(jsxElement, "scale", "[2, 3, 4]");

    expect(jsxElement.getText()).toMatchInlineSnapshot(`
      "<RoundedBox
              position={[0.283739024, -1.4629692187526093, -0.8870023805097036]}
              rotation={[
                2.1533738875424957, -0.4755261514452274, 0.22680789335122342,
              ]} scale={[2, 3, 4]}
            />"
    `);
  });

  it("should update mesh without affecting children that declare the same prop", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/magic-box.tsx")
    );
    const jsxElement = getJsxElementAt(sourceFile, 10, 3);
    if (!jsxElement) {
      throw new Error("invariant");
    }
    const openingElement = jsxElement
      .asKindOrThrow(SyntaxKind.JsxElement)
      .getOpeningElement();

    upsertProp(jsxElement, "rotation", "[11, 22, 33]");

    expect(openingElement.getText()).toMatchInlineSnapshot(
      '"<mesh castShadow receiveShadow rotation={[11, 22, 33]}>"'
    );
  });

  it("should add a prop to a component and not move it to another line", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/add-prop.tsx")
    );
    const jsxElement = getJsxElementAt(sourceFile, 12, 7);
    if (!jsxElement) {
      throw new Error("invariant");
    }

    upsertProp(
      jsxElement,
      "scale",
      "[2.1533738875412312312312324957, -0.4755261123123123123514452274, 0.22680781231231231239335122342]"
    );

    expect(getJsxElementAt(sourceFile, 27, 7)).toBeDefined();
  });

  it("should update a prop to a component and not move it to another line", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/add-prop.tsx")
    );
    const jsxElement = getJsxElementAt(sourceFile, 12, 7);
    if (!jsxElement) {
      throw new Error("invariant");
    }

    upsertProp(
      jsxElement,
      "position",
      "[2.1533738871232135412312324957, -0.4755261212312332131514452274, 0.22680121231233123789335122342]"
    );

    expect(getJsxElementAt(sourceFile, 27, 7)).toBeDefined();
  });

  it("should update a prop to a component", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/add-prop.tsx")
    );
    const jsxElement = getJsxElementAt(sourceFile, 12, 7);
    if (!jsxElement) {
      throw new Error("invariant");
    }

    upsertProp(jsxElement, "position", "[2, 3, 4]");

    expect(jsxElement.getText()).toMatchInlineSnapshot(`
      "<RoundedBox
              position={[2, 3, 4]}
              rotation={[
                2.1533738875424957, -0.4755261514452274, 0.22680789335122342,
              ]}
            />"
    `);
  });

  it("should comment a jsx element out with deleted pragma", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/add-prop.tsx")
    );
    expect(getJsxElementsPositions(sourceFile, "default").length).toEqual(4);

    commentComponent(sourceFile, 12, 7);

    expect(getJsxElementsPositions(sourceFile, "default").length).toEqual(3);
    expect(getJsxElementAt(sourceFile, 12, 7)).not.toBeDefined();
  });

  it("should uncomment a jsx element", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/add-prop.tsx")
    );
    commentComponent(sourceFile, 12, 7);

    uncommentComponent(sourceFile, 12, 7);

    expect(getJsxElementAt(sourceFile, 12, 7)).toBeDefined();
  });

  it("should delete comment component", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/add-prop.tsx")
    );
    commentComponent(sourceFile, 12, 7);

    deleteCommentComponents(sourceFile);

    expect(getExportName(sourceFile, "default").declaration.getText())
      .toMatchInlineSnapshot(`
      "export default function Scene() {
        return (
          <>
            
            <RoundedBox></RoundedBox>

            <RoundedBox
              scale={[0.630216523313958, 0.6302165233139577, 0.6302165233139577]}
              position={[
                -2.813889551893372, 0.0017712872227060306, 2.1329409413977354,
              ]}
            />

            <RoundedBox
              position={[3, 0, 2]}
              rotation={[0, 0.25, 0]}
              scale={[1, 1.5, 1]}
            >
              <meshStandardMaterial color=\\"purple\\" />
            </RoundedBox>
          </>
        );
      }"
    `);
  });

  it("should transform commented out child when commenting out parent so it is valid JSX", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/add-prop.tsx")
    );

    commentComponent(sourceFile, 47, 7);
    commentComponent(sourceFile, 42, 5);

    expect(getExportName(sourceFile, "Nested").declaration.getText())
      .toMatchInlineSnapshot(`
        "Nested = () => (
          <>
            {/** @triplex_deleted <RoundedBox
              position={[3, 0, 2]}
              rotation={[0, 0.25, 0]}
              scale={[1, 1.5, 1]}
            >
              _/@@ @triplex_deleted <meshStandardMaterial color=\\"purple\\" />@/_
            </RoundedBox>*/}
          </>
        )"
      `);
  });

  it("should transform commented out first child when uncommenting parent", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/add-prop.tsx")
    );
    commentComponent(sourceFile, 47, 7);
    commentComponent(sourceFile, 42, 5);

    uncommentComponent(sourceFile, 42, 5);

    expect(getExportName(sourceFile, "Nested").declaration.getText())
      .toMatchInlineSnapshot(`
        "Nested = () => (
          <>
            <RoundedBox
              position={[3, 0, 2]}
              rotation={[0, 0.25, 0]}
              scale={[1, 1.5, 1]}
            >
              {/** @triplex_deleted <meshStandardMaterial color=\\"purple\\" />*/}
            </RoundedBox>
          </>
        )"
      `);
  });

  it("should find uncommented parent and child", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/add-prop.tsx")
    );
    commentComponent(sourceFile, 47, 7);
    commentComponent(sourceFile, 42, 5);

    uncommentComponent(sourceFile, 42, 5);
    uncommentComponent(sourceFile, 47, 7);

    expect(getJsxElementAt(sourceFile, 42, 5)).toBeDefined();
    expect(getJsxElementAt(sourceFile, 47, 7)).toBeDefined();
  });

  it("should add component as a child to jsx", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/add-prop.tsx")
    );

    const result = add(
      sourceFile,
      "default",
      {
        type: "custom",
        exportName: "AddComponent",
        path: join(__dirname, "stub-component.tsx"),
        props: { color: "blurple" },
      },
      { action: "child", column: 7, line: 56, path: "", exportName: "" }
    );

    expect(result).toEqual({ column: 19, line: 56 });
    expect(getExportName(sourceFile, "AddComponent").declaration.getText())
      .toMatchInlineSnapshot(`
        "export function AddComponent() {
          return (
            <>
              <RoundedBox />
              <RoundedBox><AddComponent1 color=\\"blurple\\"/></RoundedBox>
            </>
          );
        }"
      `);
  });

  it("should add component as a child to self closing jsx", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/add-prop.tsx")
    );

    const result = add(
      sourceFile,
      "default",
      {
        type: "custom",
        exportName: "AddComponent",
        path: join(__dirname, "stub-component.tsx"),
        props: { color: "blurple" },
      },
      { action: "child", column: 7, line: 55, path: "", exportName: "" }
    );

    expect(result).toEqual({ column: 19, line: 55 });
    expect(getExportName(sourceFile, "AddComponent").declaration.getText())
      .toMatchInlineSnapshot(`
        "export function AddComponent() {
          return (
            <>
              <RoundedBox><AddComponent1 color=\\"blurple\\"/></RoundedBox>
              <RoundedBox></RoundedBox>
            </>
          );
        }"
      `);
  });

  it("should add multiple components and return the expected pos", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/add-prop.tsx")
    );

    add(
      sourceFile,
      "default",
      {
        type: "host",
        name: "boxGeometry",
        props: { color: "blurple" },
      },
      { action: "child", column: 7, line: 55, path: "", exportName: "" }
    );
    const result = add(
      sourceFile,
      "default",
      {
        type: "host",
        name: "boxGeometry",
        props: { color: "blurple" },
      },
      { action: "child", column: 7, line: 55, path: "", exportName: "" }
    );

    expect(result).toEqual({ column: 49, line: 55 });
  });

  it("should add components without losing track of line and columns", async () => {
    const project = createProject({
      cwd: join(__dirname, "tmp"),
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.createSourceFile("Untitled");
    const saveFile = () => project.save({});
    const addComponent = async (exportName: string) => {
      const pos = add(sourceFile, "Untitled", {
        type: "custom",
        exportName,
        path: join(__dirname, "__mocks__", "room.tsx"),
        props: {},
      });
      const element = getJsxElementAt(sourceFile, pos.line, pos.column);
      if (!element) {
        console.log(
          `${exportName}@${pos.line}:${pos.column}\n`,
          sourceFile.getText()
        );
        throw new Error(
          `could not find at ${exportName}@${pos.line}:${pos.column}`
        );
      }
      getJsxElementPropTypes(element);
      await saveFile();
    };

    await addComponent("Wall");
    await addComponent("Floor");
    await addComponent("BackWall");
    await addComponent("Table");
    await addComponent("CollectionOfCans");
    await addComponent("TableBox");
    await addComponent("WallpaperAndLights");
    await addComponent("Lamps");
  }, 30000);

  it("should add a jsx element to an array function", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/empty.tsx")
    );

    add(sourceFile, "EmptyArrowFunction", {
      type: "host",
      name: "group",
      props: {},
    });

    expect(
      getExportName(sourceFile, "EmptyArrowFunction").declaration.getText()
    ).toMatchInlineSnapshot('"EmptyArrowFunction = () => <><group /></>"');
  });

  it("should not lose track of line col @edgecase", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/docs.tsx")
    );
    const result = add(
      sourceFile,
      "HeroScene",
      {
        type: "host",
        name: "meshStandardMaterial",
        props: {},
      },
      { action: "child", column: 7, line: 31, path: "", exportName: "" }
    );

    const createdElement = getJsxElementAt(
      sourceFile,
      result.line,
      result.column
    );

    expect(createdElement).toBeDefined();
  });

  it.todo(
    "should add a jsx element to arrow func that short hand returns group",
    () => {
      const project = _createProject({
        tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
      });
      const sourceFile = project.addSourceFileAtPath(
        join(__dirname, "__mocks__/empty.tsx")
      );

      add(sourceFile, "ArrowFuncReturnGroup", {
        type: "host",
        name: "group",
        props: {},
      });

      expect(
        getExportName(sourceFile, "EmptyArrowFunction").declaration.getText()
      ).toMatchInlineSnapshot(`
        "EmptyArrowFunction = () => (
          <>
            <group />
            <group />
          </>
        )"`);
    }
  );

  it.todo("should add a jsx element to func that returns group", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/empty.tsx")
    );

    add(sourceFile, "EmptyGroup", {
      type: "host",
      name: "group",
      props: {},
    });

    expect(getExportName(sourceFile, "EmptyGroup").declaration.getText())
      .toMatchInlineSnapshot(`
      "export function EmptyGroup() {
        return <><group /><group></group></>;
      }"
    `);
  });

  it("should keep prop value on the same line(s) after an small upsert", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/breakfast.tsx")
    );
    const element = getJsxElementAt(sourceFile, 16, 7)!;

    upsertProp(element, "position", "[]");

    // The sibling elements should remain on the same lines.
    expect(getJsxElementAt(sourceFile, 15, 7)).toBeDefined();
    expect(getJsxElementAt(sourceFile, 22, 7)).toBeDefined();
    expect(getExportName(sourceFile, "Scene").declaration.getText())
      .toMatchInlineSnapshot(`
        "export function Scene() {
          return (
            <>
              <Berry position={[0, 0, 0]} variant=\\"blueberry\\" />
              <Berry
                position={[]}


                variant={\\"raspberry\\"}
              />
              <Berry position={[0, 0, 0]} variant=\\"blueberry\\" />
            </>
          );
        }"
      `);
  });

  it("should keep prop value on the same line(s) after a large upsert", () => {
    const project = _createProject({
      tsConfigFilePath: join(__dirname, "__mocks__/tsconfig.json"),
    });
    const sourceFile = project.addSourceFileAtPath(
      join(__dirname, "__mocks__/breakfast.tsx")
    );
    const element = getJsxElementAt(sourceFile, 16, 7)!;

    upsertProp(
      element,
      "position",
      "[-12225343900291231231231232192334,122262112312312312355004431233018,222224123123123123966135358083713]"
    );

    // The sibling elements should remain on the same lines.
    expect(getJsxElementAt(sourceFile, 15, 7)).toBeDefined();
    expect(getJsxElementAt(sourceFile, 22, 7)).toBeDefined();
    expect(getExportName(sourceFile, "Scene").declaration.getText())
      .toMatchInlineSnapshot(`
        "export function Scene() {
          return (
            <>
              <Berry position={[0, 0, 0]} variant=\\"blueberry\\" />
              <Berry
                position={[-12225343900291231231231232192334,122262112312312312355004431233018,222224123123123123966135358083713]}


                variant={\\"raspberry\\"}
              />
              <Berry position={[0, 0, 0]} variant=\\"blueberry\\" />
            </>
          );
        }"
      `);
  });
});
