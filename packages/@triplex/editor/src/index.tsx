/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { init } from "@sentry/react";
import { TelemetryProvider } from "@triplex/ux";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter } from "react-router-dom";
import { version } from "../package.json";
import { EditorFrame } from "./editor";
import { ErrorSplash } from "./ui/error-splash";
import { LoadingTriangle } from "./ui/loading-triagle";
import "./styles.css";

if (process.env.TRIPLEX_ENV !== "development") {
  init({
    dsn: "https://465c2b265422fda6d76957f5a4854ffb@o4507990276177920.ingest.us.sentry.io/4507990300229632",
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TelemetryProvider
      secretKey="pMzCe62mSIazSOyUpEBn3A"
      sessionId={window.triplex.sessionId}
      trackingId="G-G1GDHSKRZN"
      userId={window.triplex.userId}
      version={version}
    >
      <BrowserRouter>
        <ErrorBoundary
          fallbackRender={({ error }) => <ErrorSplash error={error} />}
        >
          <Suspense fallback={<LoadingTriangle />}>
            <EditorFrame />
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </TelemetryProvider>
  </StrictMode>,
);
