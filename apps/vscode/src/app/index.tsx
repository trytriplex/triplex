/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { TelemetryProvider } from "@triplex/ux";
import { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { version } from "../../package.json";
import { AppRoot } from "./features/app-root";
import "./styles.css";
import { ErrorSplash } from "./features/error-splash";

createRoot(document.getElementById("root")!).render(
  <TelemetryProvider
    isTelemetryEnabled={window.triplex.isTelemetryEnabled}
    secretKey="xzT0UQNnSMa1Z3KW8k6oWw"
    sessionId={window.triplex.sessionId}
    trackingId="G-EC2Q4TXGD0"
    userId={window.triplex.userId}
    version={version}
  >
    <ErrorBoundary
      fallbackRender={({ error }) => <ErrorSplash error={error} />}
    >
      <Suspense>
        <AppRoot />
      </Suspense>
    </ErrorBoundary>
  </TelemetryProvider>,
);
