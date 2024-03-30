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
  invariant: (node: TreeNode) => boolean
): TreeNode | null {
  for (const node of nodes) {
    if (invariant(node)) {
      return node;
    }

    if (node.children) {
      const result = find(node.children, invariant);
      if (result) {
        return result;
      }
    }
  }

  return null;
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
    act: renderer.act,
    get canvas() {
      return canvas;
    },
    fireDOMEvent,
    tree: {
      getByType(type: string) {
        const tree = controls.toTree();
        if (!tree) {
          throw new Error("invariant");
        }

        const result = find(tree, (node) => node.type === type);
        if (!result) {
          throw new Error("invariant");
        }

        return result;
      },
    },
  };
}
