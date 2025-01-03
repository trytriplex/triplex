/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { bind } from "bind-event-listener";
import debounce from "debounce";
import { useEffect, useState } from "react";
import { style } from "../../util/style";
import { type ResolvedNode } from "./resolver";

const styles = style({
  hovered: {
    borderWidth: "1px",
  },
  indicator: {
    borderColor: "rgb(96 165 250)",
    borderStyle: "solid",
    boxSizing: "border-box",
    pointerEvents: "none",
    position: "absolute",
    zIndex: "calc(infinity)",
  },
  selected: {
    borderWidth: "2px",
  },
});

function Outline({
  boxes,
  nodes,
  variant,
}: {
  boxes: DOMRect[];
  nodes: ResolvedNode[];
  variant: "selected" | "hovered";
}) {
  if (
    boxes.length === 0 ||
    nodes.length === 0 ||
    boxes.length !== nodes.length
  ) {
    return null;
  }

  function testId(node: ResolvedNode) {
    return `${node.meta.name}@${node.meta.line}:${node.meta.column}`;
  }

  let { bottom, left, right, top } = boxes[0];
  let meta: string[] = [testId(nodes[0])];

  for (let i = 1; i < boxes.length; i++) {
    const box = boxes[i];

    top = Math.min(top ?? box.top, box.top);
    left = Math.min(left ?? box.left, box.left);
    right = Math.max(right ?? box.right, box.right);
    bottom = Math.max(bottom ?? box.bottom, box.bottom);

    meta.push(testId(nodes[i]));
  }

  return (
    <div
      data-testid={`${variant}(${meta.join(",")})`}
      style={style.merge(
        styles.indicator,
        variant === "selected" && styles.selected,
        variant === "hovered" && styles.hovered,
        {
          height: bottom - top,
          left,
          top,
          width: right - left,
        },
      )}
    />
  );
}

export function SelectionIndicator({
  hovered,
  selected,
}: {
  hovered: ResolvedNode[];
  selected: ResolvedNode[];
}) {
  const [selectedRects, setSelectedRects] = useState<DOMRect[]>([]);
  const [hoveredRect, setHoveredRect] = useState<DOMRect[]>([]);
  const [hideIndicators, setHideIndicators] = useState(false);

  useEffect(() => {
    if (hideIndicators) {
      return;
    }

    if (selected.length === 0) {
      setSelectedRects([]);
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const boxes = entries.map((entry) =>
        entry.target.getBoundingClientRect(),
      );
      setSelectedRects(boxes);
    });

    selected.forEach((node) => {
      if (node.node instanceof Element) {
        observer.observe(node.node);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [hideIndicators, selected]);

  useEffect(() => {
    if (hideIndicators) {
      return;
    }

    if (!hovered) {
      setHoveredRect([]);
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const boxes = entries.map((entry) =>
        entry.target.getBoundingClientRect(),
      );
      setHoveredRect(boxes);
    });

    hovered.forEach((node) => {
      if (node.node instanceof Element) {
        observer.observe(node.node);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [hideIndicators, hovered]);

  useEffect(() => {
    const debouncedShowIndicators = debounce(() => {
      setHideIndicators(false);
    }, 150);

    return bind(window, {
      listener: () => {
        setHideIndicators(true);
        debouncedShowIndicators();
      },
      type: "resize",
    });
  }, []);

  if (hideIndicators) {
    return null;
  }

  return (
    <>
      <Outline boxes={hoveredRect} nodes={hovered} variant="hovered" />
      <Outline boxes={selectedRects} nodes={selected} variant="selected" />
    </>
  );
}
