/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { useEffect, useRef } from "react";
import { usePlayState } from "../../stores/use-play-state";
import { blockFocusableChildren } from "../../util/focus";
import { resolveElementMeta } from "../../util/meta";
import { SceneObjectContext } from "../scene-element/context";
import { useSelectionMarshal } from "../selection-provider/use-selection-marhsal";
import {
  resolveDOMNodes,
  resolveElementsFromPoint,
  type ResolvedNode,
} from "./resolver";
import { SelectionIndicator } from "./selection-indicator";

export function ReactDOMSelection({
  children,
  filter,
}: {
  children: React.ReactNode;
  filter: { exportName: string; path: string };
}) {
  const playState = usePlayState();
  const ref = useRef<HTMLDivElement>(null!);
  const [selected, hovered] = useSelectionMarshal<ResolvedNode>({
    listener: (e) => {
      if ("inputSourceOrigin" in e) {
        // React DOM is not supported in WebXR.
        return [];
      }

      return resolveElementsFromPoint(
        { clientX: e.clientX, clientY: e.clientY },
        { root: ref.current },
      )
        .map((element) => {
          const meta = resolveElementMeta(element, filter);

          if (meta) {
            return {
              astPath: meta.astPath,
              column: meta.column,
              line: meta.line,
              parentPath: filter.path,
              path: meta.path,
            };
          }

          return undefined;
        })
        .filter((element) => !!element);
    },
    priority: 1,
    resolve: (selections) => resolveDOMNodes(selections),
  });

  useEffect(() => {
    if (playState === "play") {
      return;
    }

    return blockFocusableChildren(ref.current);
  }, [playState]);

  return (
    <SceneObjectContext.Provider value={true}>
      <div
        ref={ref}
        style={
          playState === "play"
            ? {
                display: "contents",
              }
            : {
                cursor: "default",
                display: "contents",
                pointerEvents: "none",
                userSelect: "none",
              }
        }
      >
        {children}
      </div>
      <SelectionIndicator hovered={hovered} selected={selected} />
    </SceneObjectContext.Provider>
  );
}
