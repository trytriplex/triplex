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

export function SelectionIndicator({
  hovered,
  selected,
}: {
  hovered: ResolvedNode | null;
  selected: ResolvedNode[];
}) {
  const [selectedRects, setSelectedRects] = useState<DOMRect[]>([]);
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);
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
      setHoveredRect(null);
      return;
    }

    const observer = new ResizeObserver((entry) => {
      setHoveredRect(entry[0].target.getBoundingClientRect());
    });

    if (hovered?.node instanceof Element) {
      observer.observe(hovered.node);
    }

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
      {hoveredRect && hovered && (
        <div
          data-testid={`Hovered(${hovered.meta.name}@${hovered.meta.line}:${hovered.meta.column})`}
          style={style.merge(styles.indicator, styles.hovered, {
            height: hoveredRect.height,
            left: hoveredRect.x,
            top: hoveredRect.y,
            width: hoveredRect.width,
          })}
        />
      )}

      {selectedRects.map((box, index) => {
        const node = selected.at(index);
        if (!node) {
          return null;
        }

        const { meta } = node;

        return (
          <div
            data-testid={`Selected(${meta.name}@${meta.line}:${meta.column})`}
            key={`${box.x}${box.y}${box.width}${box.height}`}
            style={style.merge(styles.indicator, styles.selected, {
              height: box.height,
              left: box.x,
              top: box.y,
              width: box.width,
            })}
          />
        );
      })}
    </>
  );
}
