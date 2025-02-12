/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */

import { useScreenView } from "@triplex/ux";
import { useEffect } from "react";
import { cn } from "./ds/cn";
import { SceneFrame } from "./scence-bridge";
import { useEditor } from "./stores/editor";
import { useScene } from "./stores/scene";
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
  const playState = useScene((store) => store.playState);

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
        "fixed inset-0 grid select-none grid-cols-[16rem_auto_16rem] bg-gradient-to-b from-white/5 to-neutral-900",
      ])}
    >
      <TitleBar />
      <FileTabs />

      {isFileOpen && (
        <>
          <div
            className={cn([
              "z-10 col-start-1 row-auto row-start-3 flex overflow-hidden",
              playState === "play" && "hidden",
            ])}
          >
            {path && <ScenePanel />}
          </div>

          <SceneFrame />

          <div className="pointer-events-none relative z-10 col-start-2 row-start-3 flex">
            <ControlsMenu />
          </div>

          <div
            className={cn([
              "pointer-events-none z-10 col-start-3 row-start-3 flex overflow-hidden",
              playState === "play" && "hidden",
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
