/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { useSubscriptionEffect } from "@triplex/ws/react";
import { useMemo, useRef } from "react";
import { flatten } from "../../util/array";
import { resolveElementMeta } from "../../util/meta";
import { SceneObjectContext } from "../scene-element/context";
import { useSelectionMarshal } from "../selection-provider/use-selection-marhsal";
import {
  resolveDOMNodes,
  resolveElementsFromPoint,
  type ResolvedNode,
} from "./resolver";

export function ReactDOMSelection({
  children,
  filter,
}: {
  children: React.ReactNode;
  filter: { exportName: string; path: string };
}) {
  const ref = useRef<HTMLDivElement>(null);
  const sceneData = useSubscriptionEffect("/scene/:path/:exportName", {
    disabled: !filter.exportName || !filter.path,
    exportName: filter.exportName,
    path: filter.path,
  });
  const elements = useMemo(
    () => flatten(sceneData?.sceneObjects || []),
    [sceneData],
  );

  useSelectionMarshal<ResolvedNode>({
    listener: (e) => {
      return resolveElementsFromPoint(ref.current!, e)
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
    onDeselect: () => {},
    onSelect: () => {},
    resolve: (selections) => resolveDOMNodes(selections),
  });

  return (
    <SceneObjectContext.Provider value={true}>
      <div
        ref={ref}
        style={{
          cursor: "default",
          display: "contents",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {children}
      </div>
    </SceneObjectContext.Provider>
  );
}
