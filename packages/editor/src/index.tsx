/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { EditorFrame } from "./editor";
import { TitleBar } from "./ui/title-bar";
import { cn } from "./ds/cn";
import { ErrorOverlay } from "./ui/error-overlay";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <div
      className={cn([
        "fixed inset-0 grid select-none grid-cols-[16rem_auto_18rem] gap-3 bg-neutral-900 pb-3",
        "grid-rows-[32px_auto]",
      ])}
    >
      <TitleBar />
      <EditorFrame />
      <ErrorOverlay />
    </div>
  </BrowserRouter>
);
