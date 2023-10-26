/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { cn } from "./ds/cn";
import { EditorFrame } from "./editor";
import { ErrorOverlay } from "./ui/error-overlay";
import { TitleBar } from "./ui/title-bar";
import "./styles.css";
import { Suspense } from "react";
import { Environment } from "./environment";
import { LoadingTriangle } from "./ui/loading-triagle";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <div
      className={cn([
        "fixed inset-0 grid select-none grid-cols-[16rem_auto_18rem] gap-3 bg-neutral-900 pb-3",
        "grid-rows-[32px_auto]",
      ])}
    >
      <Suspense fallback={<LoadingTriangle />}>
        <Environment>
          <TitleBar />
          <EditorFrame />
          <ErrorOverlay />
        </Environment>
      </Suspense>
    </div>
  </BrowserRouter>
);
