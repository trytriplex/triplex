/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useScreenView } from "./analytics";
import { SceneFrame } from "./scence-bridge";
import { useEditor } from "./stores/editor";
import { AssetsDrawer } from "./ui/assets-drawer";
import { ContextPanel } from "./ui/context-panel";
import { ControlsMenu } from "./ui/controls-menu";
import { ScenePanel } from "./ui/scene-panel";
import { ScenesDrawer } from "./ui/scenes-drawer";

export function EditorFrame() {
  const { path } = useEditor();
  useScreenView("editor", "Screen");

  return (
    <>
      <SceneFrame />

      <div className="z-10 row-auto flex flex-col gap-3 overflow-hidden pl-3">
        {path && <ScenePanel />}
      </div>

      <div className="pointer-events-none z-10 flex flex-col">
        <ControlsMenu />
      </div>

      <div className="pointer-events-none z-10 flex overflow-hidden pr-3">
        <ContextPanel />
      </div>

      <ScenesDrawer />
      <AssetsDrawer />
    </>
  );
}
