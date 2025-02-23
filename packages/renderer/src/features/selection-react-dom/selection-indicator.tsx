/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { bind } from "bind-event-listener";
import debounce from "debounce";
import { memo, useEffect, useState } from "react";
import { style } from "../../util/style";
import { type ResolvedNode } from "./resolver";

const styles = style({
  indicator: {
    borderColor: "rgb(59 130 246)",
    borderStyle: "solid",
    borderWidth: "1px",
    boxSizing: "border-box",
    pointerEvents: "none",
    position: "absolute",
    zIndex: "calc(infinity)",
  },
});

const Outline = memo(
  ({
    boxes,
    nodes,
    variant,
  }: {
    boxes: DOMRect[];
    nodes: ResolvedNode[];
    variant: "selected" | "hovered";
  }) => {
    if (boxes.length === 0) {
      return null;
    }

    function testId(node?: ResolvedNode) {
      const meta = node?.meta;
      if (!meta) {
        return "";
      }

      return `${meta.name}@${meta.line}:${meta.column}`;
    }

    let { bottom, left, right, top } = boxes[0];
    let meta: string[] = [testId(nodes.at(0))];

    for (let i = 1; i < boxes.length; i++) {
      const box = boxes[i];

      top = Math.min(top ?? box.top, box.top);
      left = Math.min(left ?? box.left, box.left);
      right = Math.max(right ?? box.right, box.right);
      bottom = Math.max(bottom ?? box.bottom, box.bottom);

      meta.push(testId(nodes.at(i)));
    }

    return (
      <div
        data-testid={`${variant}(${meta.join(",")})`}
        style={style.merge(styles.indicator, {
          height: bottom - top,
          left: window.scrollX + left,
          top: window.scrollY + top,
          width: right - left,
        })}
      />
    );
  },
);

Outline.displayName = "Outline";

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

    if (hovered.length === 0) {
      /**
       * We defer clearing the hovered rect by a frame so it can be set at the
       * same time as the selected rect inside its resize observer. This avoids
       * a flash of no indicator.
       */
      requestAnimationFrame(() => setHoveredRect([]));
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
