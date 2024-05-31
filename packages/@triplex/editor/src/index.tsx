/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { Analytics } from "@triplex/ux";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { version } from "../package.json";
import { EditorFrame } from "./editor";
import { LoadingTriangle } from "./ui/loading-triagle";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Analytics
      secretKey="pMzCe62mSIazSOyUpEBn3A"
      sessionId={window.triplex.sessionId}
      trackingId="G-G1GDHSKRZN"
      userId={window.triplex.userId}
      version={version}
    >
      <BrowserRouter>
        <Suspense fallback={<LoadingTriangle />}>
          <EditorFrame />
        </Suspense>
      </BrowserRouter>
    </Analytics>
  </StrictMode>
);
