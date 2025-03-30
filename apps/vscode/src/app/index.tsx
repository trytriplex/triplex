/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
import "./styles.css";
import { init } from "@sentry/react";
import { initFeatureGates } from "@triplex/lib/fg";
import { LoadingLogo } from "@triplex/lib/loader";
import { TelemetryProvider } from "@triplex/ux";
import { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { version } from "../../package.json";
import { RootErrorBoundary } from "./components/root-error-boundary";
import { AppRoot } from "./features/app-root";
import { SceneContextProvider } from "./features/app-root/context";
import { AuthenticationProvider } from "./features/authentication/provider";
import { EnsureAuthenticated } from "./features/invariants/ensure-authenticated";
import { EnsureCodeValidity } from "./features/invariants/ensure-code-validity";
import { EnsureDependencies } from "./features/invariants/ensure-dependencies";
import { preloadSubscription } from "./hooks/ws";

if (
  process.env.NODE_ENV === "production" &&
  window.triplex.isTelemetryEnabled
) {
  init({
    dsn: "https://cae61a2a840cbbe7f17e240c99ad0346@o4507990276177920.ingest.us.sentry.io/4507990321725440",
  });
}

preloadSubscription(
  "/scene/:path/:exportName/props",
  window.triplex.initialState,
);

async function bootstrap() {
  await initFeatureGates({
    environment: window.triplex.env.fgEnvironmentOverride,
    userId: window.triplex.userId,
  });

  createRoot(document.getElementById("root")!).render(
    <TelemetryProvider
      engagementDurationStrategy="polling"
      isTelemetryEnabled={window.triplex.isTelemetryEnabled}
      secretKey="xzT0UQNnSMa1Z3KW8k6oWw"
      sessionId={window.triplex.sessionId}
      trackingId="G-EC2Q4TXGD0"
      userId={window.triplex.userId}
      version={version}
    >
      <RootErrorBoundary>
        <Suspense fallback={<LoadingLogo position="splash" variant="fill" />}>
          <AuthenticationProvider>
            <EnsureAuthenticated>
              <SceneContextProvider>
                <EnsureDependencies>
                  <EnsureCodeValidity>
                    <AppRoot />
                  </EnsureCodeValidity>
                </EnsureDependencies>
              </SceneContextProvider>
            </EnsureAuthenticated>
          </AuthenticationProvider>
        </Suspense>
      </RootErrorBoundary>
    </TelemetryProvider>,
  );
}

bootstrap();
