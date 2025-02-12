/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { useEffect, useState } from "react";
import { cn } from "../ds/cn";
import { useEditor } from "../stores/editor";
import { useLazySubscription } from "../util/ws";
import { EditorMenu } from "./editor-menu";

export function TitleBar() {
  const { path } = useEditor();
  const { name } = useLazySubscription("/folder");
  const [windowState, setWindowState] = useState<WindowState>("active");
  const filename = path.split("/").at(-1);
  const windowTitle = filename ? filename + " — " + name : name;

  useEffect(() => {
    if (windowTitle) {
      window.document.title = windowTitle;
    }
  }, [windowTitle]);

  useEffect(() => {
    return window.triplex.handleWindowStateChange(setWindowState);
  }, []);

  return (
    <div
      className={cn([
        windowState === "inactive" && "opacity-50",
        // Hide the menu bar on Linux platforms
        !["win32", "darwin"].includes(window.triplex.platform) && "hidden",
        "z-50 col-span-full row-start-1 grid h-8 select-none grid-cols-3 items-center border-b border-neutral-800 bg-neutral-900 [-webkit-app-region:drag]",
      ])}
    >
      <div>
        <EditorMenu />
      </div>
      <span
        className="place-self-center text-sm text-neutral-300"
        data-testid="titlebar"
      >
        {windowTitle}
      </span>
      <div />
    </div>
  );
}
