/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { type TriplexMeta } from "@triplex/bridge/client";
import { getTriplexMeta, hasTriplexMeta } from "../../util/meta";
import { type SelectionState } from "../selection-provider/types";

export interface ResolvedNode {
  meta: TriplexMeta;
  node: Node;
}

/**
 * **resolveDOMNodes()**
 *
 * Traverses the DOM scene to find all matching objects based on the filter.
 * Objects can match either by a direct match, or by having a parent that
 * matches the filter. The meta in each return object is the meta from the
 * matching direct or parent object.
 */
export function resolveDOMNodes(selections: SelectionState[]): ResolvedNode[] {
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

    const isDirectMatch = selections.findIndex(
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
    } else {
      for (const parent of meta.parents) {
        // Check the parents in the meta to see if they are a match and if so resolve the object.
        const isParentMatch = selections.findIndex(
          (filter) =>
            filter.path === parent.path &&
            filter.column === parent.column &&
            filter.line === parent.line,
        );

        if (isParentMatch !== -1) {
          nodes.push({
            meta: parent,
            node,
          });
          break;
        }
      }
    }

    node = iterator.nextNode();
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
  const previousPointerEvents = root.style.pointerEvents;
  // Enable pointer events so the browser can perform hit detection.
  root.style.pointerEvents = "all";
  const elements = document
    .elementsFromPoint(points.clientX, points.clientY)
    .filter(
      (element) => root.contains(element) && !hasParentSkippedHitTest(element),
    );
  // Revert to the original pointer events value.
  root.style.pointerEvents = previousPointerEvents;

  return elements;
}
