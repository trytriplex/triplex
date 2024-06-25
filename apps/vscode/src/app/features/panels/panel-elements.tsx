/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { ScrollContainer } from "../../components/scroll-container";
import { useSceneStore } from "../../stores/scene";
import { SceneElements } from "./element";

export function ElementsPanel() {
  const context = useSceneStore((store) => store.context);

  return (
    <ScrollContainer>
      <div className="flex px-1.5 pb-1.5">
        <VSCodeTextField
          className="w-full opacity-70 focus:opacity-100"
          onFocus={(e) => e.stopPropagation()}
          placeholder="Filter elements..."
        />
      </div>
      <ul>
        <SceneElements exportName={context.exportName} path={context.path} />
      </ul>
      <div className="h-1.5" />
    </ScrollContainer>
  );
}
