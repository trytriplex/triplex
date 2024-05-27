/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Analytics } from "./analytics";
import { EditorFrame } from "./editor";
import { LoadingTriangle } from "./ui/loading-triagle";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Analytics>
      <BrowserRouter>
        <Suspense fallback={<LoadingTriangle />}>
          <EditorFrame />
        </Suspense>
      </BrowserRouter>
    </Analytics>
  </StrictMode>
);
