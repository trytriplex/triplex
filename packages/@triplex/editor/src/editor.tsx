/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { useEffect } from "react";
import { useScreenView } from "./analytics";
import { SceneFrame } from "./scence-bridge";
import { useEditor } from "./stores/editor";
import { AssetsDrawer } from "./ui/assets-drawer";
import { ContextPanel } from "./ui/context-panel";
import { ControlsMenu } from "./ui/controls-menu";
import { ErrorOverlay } from "./ui/error-overlay";
import { FileTabs } from "./ui/file-tabs";
import { ScenePanel } from "./ui/scene-panel";
import { ScenesDrawer } from "./ui/scenes-drawer";
import { TitleBar } from "./ui/title-bar";

export function EditorFrame() {
  const { exportName, index, open, path } = useEditor();
  const isFileOpen = !!exportName && !!path;

  useScreenView("editor", "Screen");

  useEffect(() => {
    if (path && exportName) {
      open(path, exportName, index);
    }
  }, [exportName, open, path, index]);

  return (
    <div className="fixed inset-0 grid select-none grid-cols-[18rem_auto_18rem] grid-rows-[2rem_2.25rem_auto] bg-neutral-900">
      <TitleBar />
      <FileTabs />
      <SceneFrame />

      {isFileOpen && (
        <>
          <div className="col-start-1 row-auto row-start-3 flex overflow-hidden py-3 pl-3">
            {path && <ScenePanel />}
          </div>

          <div className="pointer-events-none col-start-2 row-start-3 flex pb-3">
            <ControlsMenu />
          </div>

          <div className="pointer-events-none col-start-3 row-start-3 flex overflow-hidden py-3 pr-3">
            <ContextPanel />
          </div>

          <AssetsDrawer />
          <ErrorOverlay />
        </>
      )}

      <ScenesDrawer />
    </div>
  );
}
