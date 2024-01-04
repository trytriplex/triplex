/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { useEffect } from "react";
import { useScreenView } from "./analytics";
import { cn } from "./ds/cn";
import { SceneFrame } from "./scence-bridge";
import { useCanvasStage } from "./stores/canvas-stage";
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
  const canvasLayout = useCanvasStage((store) => store.canvasStage);

  useScreenView("editor", "Screen");

  useEffect(() => {
    if (path && exportName) {
      open(path, exportName, index);
    }
  }, [exportName, open, path, index]);

  return (
    <div
      className={cn([
        ["win32", "darwin"].includes(window.triplex.platform)
          ? // On windows/macOS show the menu bar
            "grid-rows-[2rem_2.25rem_auto]"
          : // On linux hide the menu bar
            "grid-rows-[0rem_2.25rem_auto]",
        "fixed inset-0 grid select-none bg-gradient-to-b from-white/5 to-neutral-900",
        canvasLayout === "collapsed" && "grid-cols-[16rem_auto_16rem]",
        canvasLayout === "expanded" && "grid-cols-[17.125rem_auto_17.125rem]",
      ])}
    >
      <TitleBar />
      <FileTabs />
      <SceneFrame />

      {isFileOpen && (
        <>
          <div
            className={cn([
              "col-start-1 row-auto row-start-3 flex overflow-hidden",
              canvasLayout === "expanded" && "rounded-lg py-3 pl-3",
            ])}
          >
            {path && <ScenePanel />}
          </div>

          <div className="pointer-events-none relative col-start-2 row-start-3 flex pb-3">
            <ControlsMenu />
          </div>

          <div
            className={cn([
              "pointer-events-none col-start-3 row-start-3 flex overflow-hidden",
              canvasLayout === "expanded" && "rounded-lg py-3 pr-3",
            ])}
          >
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
