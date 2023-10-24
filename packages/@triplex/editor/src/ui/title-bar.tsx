/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useLazySubscription } from "@triplex/ws/react";
import { useEffect } from "react";
import { useEditor } from "../stores/editor";
import { EditorMenu } from "./editor-menu";

export function TitleBar() {
  const { path } = useEditor();
  const { name } = useLazySubscription("/folder");
  const filename = path.replaceAll("\\", "/").split("/").at(-1);
  const windowTitle = filename ? filename + " — " + name : name;

  useEffect(() => {
    if (windowTitle) {
      window.document.title = windowTitle;
    }
  }, [windowTitle]);

  return (
    <div className="z-50 col-span-full row-start-1 grid h-[33px] select-none grid-cols-3 items-center border-b border-neutral-800 bg-neutral-900 [-webkit-app-region:drag]">
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
