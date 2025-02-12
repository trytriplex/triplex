/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import { init } from "@sentry/react";
import { LoadingLogo } from "@triplex/lib/loader";
import { TelemetryProvider } from "@triplex/ux";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter } from "react-router-dom";
import { version } from "../package.json";
import { EditorFrame } from "./editor";
import { ErrorSplash } from "./ui/error-splash";
import "./styles.css";

if (process.env.NODE_ENV === "production") {
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
          <Suspense
            fallback={
              <LoadingLogo color="white" position="splash" variant="fill" />
            }
          >
            <EditorFrame />
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </TelemetryProvider>
  </StrictMode>,
);
