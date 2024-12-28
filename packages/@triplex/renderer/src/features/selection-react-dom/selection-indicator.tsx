/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { useEvent } from "@triplex/lib";
import { bind } from "bind-event-listener";
import debounce from "debounce";
import { useEffect, useReducer, useState } from "react";
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
    zIndex: "infinity",
  },
  selected: {
    borderWidth: "2px",
  },
});

function incrementReducer(value: number) {
  return value + 1;
}

export function SelectionIndicator({
  hovered,
  selected,
}: {
  hovered: ResolvedNode | null;
  selected: ResolvedNode[];
}) {
  const [indicators, setIndicators] = useState<
    { box: DOMRect | null; node: ResolvedNode }[]
  >([]);
  const [hoveredIndicator, setHoveredIndicator] = useState<{
    box: DOMRect;
    node: ResolvedNode;
  } | null>(null);
  const [flushCount, recalcIndicators] = useReducer(incrementReducer, 0);
  const [hideIndicators, setHideIndicators] = useState(false);

  const recalcHoverIndicator = useEvent(() => {
    setHoveredIndicator((prevHovered) => {
      if (!prevHovered || !(prevHovered.node.node instanceof HTMLElement)) {
        return prevHovered;
      }

      return {
        box: prevHovered.node.node.getBoundingClientRect(),
        node: prevHovered.node,
      };
    });
  });

  useEffect(() => {
    const boxes = selected.map((node) => {
      const box =
        node.node instanceof HTMLElement
          ? node.node.getBoundingClientRect()
          : null;

      return {
        box,
        node,
      };
    });

    setIndicators(boxes);
  }, [selected, flushCount]);

  useEffect(() => {
    if (!hovered || !(hovered.node instanceof HTMLElement)) {
      setHoveredIndicator(null);
      return;
    }

    const box = hovered.node.getBoundingClientRect();

    setHoveredIndicator({
      box,
      node: hovered,
    });
  }, [hovered]);

  useEffect(() => {
    const showIndicatorsAfterResize = debounce(() => {
      recalcIndicators();
      recalcHoverIndicator();
      setHideIndicators(false);
    }, 150);

    return bind(window, {
      listener: () => {
        setHideIndicators(true);
        showIndicatorsAfterResize();
      },
      type: "resize",
    });
  }, [recalcHoverIndicator]);

  if (hideIndicators) {
    return null;
  }

  return (
    <>
      {hoveredIndicator && (
        <div
          data-testid={`Hovered(${hoveredIndicator.node.meta.name}@${hoveredIndicator.node.meta.line}:${hoveredIndicator.node.meta.column})`}
          style={style.merge(styles.indicator, styles.hovered, {
            height: hoveredIndicator.box.height,
            left: hoveredIndicator.box.x,
            top: hoveredIndicator.box.y,
            width: hoveredIndicator.box.width,
          })}
        />
      )}

      {indicators.map(({ box, node }) => {
        if (!box) {
          return null;
        }

        const { column, line, name } = node.meta;

        return (
          <div
            data-testid={`Selected(${name}@${line}:${column})`}
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
