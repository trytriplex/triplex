/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { useSubscriptionEffect } from "@triplex/ws/react";
import { useEffect, useMemo, useRef } from "react";
import { usePlayState } from "../../stores/use-play-state";
import { flatten } from "../../util/array";
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
  const sceneData = useSubscriptionEffect("/scene/:path/:exportName", {
    disabled: !filter.exportName || !filter.path,
    exportName: filter.exportName,
    path: filter.path,
  });
  const elements = useMemo(
    () => flatten(sceneData?.sceneObjects || []),
    [sceneData],
  );
  const [selected, hovered] = useSelectionMarshal<ResolvedNode>({
    listener: (e) => {
      return resolveElementsFromPoint(ref.current, e)
        .map((element) => {
          const meta = resolveElementMeta(element, {
            elements,
            path: filter.path,
          });

          if (meta) {
            return {
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
      {playState !== "play" && (
        <SelectionIndicator hovered={hovered} selected={selected} />
      )}
    </SceneObjectContext.Provider>
  );
}
