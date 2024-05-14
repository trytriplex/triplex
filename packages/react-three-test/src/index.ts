/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import renderer from "@react-three/test-renderer";
import { type TreeNode } from "@react-three/test-renderer/dist/declarations/src/types";
import { fireEvent as fireDOMEvent } from "@testing-library/dom";

// @ts-expect-error - Ignore global variable in test.
global.IS_REACT_ACT_ENVIRONMENT = true;

function find(
  nodes: TreeNode[],
  predicate: (node: TreeNode) => boolean
): TreeNode | undefined {
  for (const node of nodes) {
    if (predicate(node)) {
      return node;
    }

    if (node.children) {
      const result = find(node.children, predicate);
      if (result) {
        return result;
      }
    }
  }

  return undefined;
}

export async function render(jsx: JSX.Element) {
  let canvas: HTMLCanvasElement;

  const controls = await renderer.create(jsx, {
    onCreated(state) {
      canvas = state.gl.domElement;
    },
  });

  return {
    ...controls,
    act: renderer.act as (
      cb: () => unknown | Promise<unknown>
    ) => Promise<unknown>,
    get canvas() {
      return canvas;
    },
    fireDOMEvent,
    tree: {
      getByName(name: string) {
        const tree = controls.toTree();
        if (!tree) {
          throw new Error("invariant");
        }

        const result = find(tree, (node) => node.props.name === name);

        return result;
      },
      getByType(type: string) {
        const tree = controls.toTree();
        if (!tree) {
          throw new Error("invariant");
        }

        const result = find(tree, (node) => node.type === type);

        return result;
      },
    },
  };
}
