/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { type TriplexResolvedMeta } from "@triplex/bridge/client";
import { getTriplexMeta, hasTriplexMeta } from "../../util/meta";
import { type SelectionState } from "../selection-provider/types";

export interface ResolvedNode {
  meta: TriplexResolvedMeta;
  node: Node;
}

export function resolveDOMNodes(selections: SelectionState[]): ResolvedNode[] {
  const candidateSelections = selections.concat();
  const nodes: ResolvedNode[] = [];
  const iterator = document.createNodeIterator(
    document.body,
    NodeFilter.SHOW_ELEMENT,
    (node) => {
      if (hasTriplexMeta(node)) {
        return NodeFilter.FILTER_ACCEPT;
      } else {
        return NodeFilter.FILTER_REJECT;
      }
    },
  );

  let node = iterator.nextNode();

  while (node) {
    const meta = getTriplexMeta(node);
    if (!meta) {
      continue;
    }

    const isDirectMatch = candidateSelections.findIndex(
      (filter) =>
        filter.path === meta.path &&
        filter.column === meta.column &&
        filter.line === meta.line,
    );

    if (isDirectMatch !== -1) {
      nodes.push({
        meta,
        node,
      });
      candidateSelections.splice(isDirectMatch, 1);
    } else {
      for (const parent of meta.parents) {
        // Check the parents in the meta to see if they are a match and if so resolve the object.
        const isParentMatch = candidateSelections.findIndex(
          (filter) =>
            filter.path === parent.path &&
            filter.column === parent.column &&
            filter.line === parent.line,
        );

        if (isParentMatch !== -1) {
          nodes.push({
            meta,
            node,
          });
          candidateSelections.splice(isParentMatch, 1);
          break;
        }
      }
    }

    if (candidateSelections.length === 0) {
      // No-more selections to resolve. Let's bail!
      break;
    } else {
      node = iterator.nextNode();
    }
  }

  return nodes;
}

export function hasParentSkippedHitTest(element: Element | null) {
  if (!element) {
    return false;
  }

  if (element.hasAttribute("data-skip-hit-test")) {
    return true;
  }

  return hasParentSkippedHitTest(element.parentElement);
}

export function resolveElementsFromPoint(
  root: HTMLElement,
  points: { clientX: number; clientY: number },
) {
  // Enable pointer events so the browser can perform hit detection.
  root.style.pointerEvents = "all";
  const elements = document
    .elementsFromPoint(points.clientX, points.clientY)
    .filter(
      (element) => root.contains(element) && !hasParentSkippedHitTest(element),
    );
  // Immediately turn it off.
  root.style.pointerEvents = "none";

  return elements;
}
