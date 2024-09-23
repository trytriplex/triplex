/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { useEvent } from "@triplex/lib";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";

type ActionContext =
  | "assetsdrawer"
  | "contextpanel"
  | "projectdrawer"
  | "rootmenu"
  | "scene"
  | "errorsplash"
  | "errorboundary"
  | "errorflag"
  | "scenepanel"
  | "tabbar"
  | "contextmenu"
  | "welcome";

type ActionGroup =
  | "assets"
  | "changelog"
  | "component"
  | "contact"
  | "controls"
  | "docs"
  | "element"
  | "error"
  | "file"
  | "frame"
  | "input"
  | "logs"
  | "project"
  | "provider"
  | "resize";

export type ActionId = ActionIdSafe | "(UNSAFE_SKIP)";

export type ActionIdSafe = `${ActionContext}_${ActionGroup}${string}`;

function mergeDeepDuplicates<TValue>(
  value: TValue,
  index: number,
  array: TValue[],
) {
  return (
    index === array.length - 1 ||
    JSON.stringify(value) !== JSON.stringify(array[index + 1])
  );
}

class Analytics4 {
  private trackingID: string;
  private secretKey: string;
  private clientID: string;
  private sessionID: string;
  private customParams: Record<string, unknown> = {};
  private userProperties: Record<string, unknown> | null = null;
  private baseURL =
    process.env.NODE_ENV === "production"
      ? "https://google-analytics.com/mp"
      : "https://www.google-analytics.com/debug/mp";
  private collectURL = "/collect";
  private engagementTimestamp: number | undefined = undefined;
  private collectedEvents: Record<string, unknown>[] = [];
  private fireEventTimeoutId: number | undefined;

  constructor(
    trackingID: string,
    secretKey: string,
    clientID: string,
    sessionID: string,
  ) {
    this.trackingID = trackingID;
    this.secretKey = secretKey;
    this.clientID = clientID;
    this.sessionID = sessionID;

    if (document.hasFocus()) {
      this.engagementTimestamp = Date.now();
    }
  }

  setVisibility() {
    const visibility = document.hasFocus();

    if (visibility) {
      this.engagementTimestamp = Date.now();
    } else {
      this.engagementTimestamp = undefined;
    }
  }

  set(key: string, value: string | number | boolean) {
    if (value !== null) {
      this.customParams[key] = value;
    } else {
      delete this.customParams[key];
    }

    return this;
  }

  setParams(params?: Record<string, string | number | boolean>) {
    if (typeof params === "object" && Object.keys(params).length > 0) {
      Object.assign(this.customParams, params);
    } else {
      this.customParams = {};
    }

    return this;
  }

  setUserProperties(upValue?: Record<string, unknown>) {
    if (typeof upValue === "object" && Object.keys(upValue).length > 0) {
      this.userProperties = upValue;
    } else {
      this.userProperties = null;
    }

    return this;
  }

  event(eventName: string, params?: Record<string, string | number | boolean>) {
    const eventPayload = {
      name: eventName,
      params: {
        engagement_time_msec:
          this.engagementTimestamp && Date.now() - this.engagementTimestamp,
        session_id: this.sessionID,
        ...this.customParams,
        ...params,
      },
    };

    this.collectedEvents.push(eventPayload);

    window.clearTimeout(this.fireEventTimeoutId);

    this.fireEventTimeoutId = window.setTimeout(() => {
      const payload = {
        client_id: this.clientID,
        // If any events are literally the same we de-dupe them away.
        events: this.collectedEvents.filter(mergeDeepDuplicates),
      };

      if (this.userProperties) {
        Object.assign(payload, { user_properties: this.userProperties });
      }

      fetch(
        `${this.baseURL}${this.collectURL}?measurement_id=${this.trackingID}&api_secret=${this.secretKey}`,
        {
          body: JSON.stringify(payload),
          method: "POST",
        },
      ).catch(() => {
        // Swallow any errors
      });

      this.collectedEvents = [];
    }, 333);

    return eventPayload.params;
  }
}

const noopEvents: TelemetryFunctions = {
  event: () => false,
  screenView: () => false,
};

const AnalyticsContext = createContext<TelemetryFunctions>(noopEvents);

export interface TelemetryFunctions {
  /**
   * `analytics.event("tabbar_file_close")`
   *
   * Sends an event to the analytics backend. Should be in the form of:
   *
   * ```
   * "(context)_(group)_(action)";
   * ```
   *
   * Where `(action)` can have a sub-action if needed.
   */
  event(
    name?: ActionId,
    params?: Record<string, string | number | boolean>,
  ): false | Record<string, unknown>;
  screenView(
    name: string,
    screen_class: "Dialog" | "Drawer" | "Screen" | "Panel",
  ): false | Record<string, unknown>;
}

export function useTelemetry() {
  const sendEvent = useContext(AnalyticsContext);
  if (sendEvent === noopEvents && process.env.NODE_ENV !== "test") {
    throw new Error("invariant: telemetry not set up");
  }

  return sendEvent;
}

export function useScreenView(
  name: string,
  screen_class: "Dialog" | "Drawer" | "Screen" | "Panel",
  isEnabled = true,
) {
  const telemetry = useTelemetry();

  useEffect(() => {
    if (isEnabled) {
      setTimeout(() => {
        // HACK
        // In the vsce the first screen view when loading the app isn't fired for some reason.
        // As a workaround because I'm lazy we delay it and then it works fine.
        telemetry.screenView(name, screen_class);
      }, 0);
    }
  }, [telemetry, isEnabled, name, screen_class]);
}

export function TelemetryProvider({
  children,
  engagementDurationStrategy = "visibilitychange",
  isTelemetryEnabled = true,
  secretKey,
  sessionId,
  trackingId,
  userId,
  version,
}: {
  children: React.ReactNode;
  engagementDurationStrategy?: "polling" | "visibilitychange";
  isTelemetryEnabled?: boolean;
  secretKey: string;
  sessionId: string;
  trackingId: string;
  userId: string;
  version: string;
}) {
  const analytics = useRef<Analytics4>();

  useEffect(() => {
    if (analytics.current) {
      return;
    }

    analytics.current = new Analytics4(
      trackingId,
      secretKey,
      userId,
      sessionId,
    );

    analytics.current.setParams({
      app_version: process.env.NODE_ENV === "production" ? version : "local",
      env: process.env.NODE_ENV === "production" ? "production" : "local",
    });
  }, [secretKey, sessionId, trackingId, userId, version]);

  useEffect(() => {
    if (!analytics.current) {
      return;
    }

    const setVisibility = analytics.current.setVisibility.bind(
      analytics.current,
    );

    if (engagementDurationStrategy === "visibilitychange") {
      document.addEventListener("visibilitychange", setVisibility);

      return () => {
        document.removeEventListener("visibilitychange", setVisibility);
      };
    }

    if (engagementDurationStrategy === "polling") {
      let previousDocumentHasFocus = document.hasFocus();

      const intervalId = window.setInterval(() => {
        const nextDocumentHasFocus = document.hasFocus();

        if (nextDocumentHasFocus !== previousDocumentHasFocus) {
          setVisibility();
          previousDocumentHasFocus = nextDocumentHasFocus;
        }
      }, 200);

      return () => {
        window.clearInterval(intervalId);
      };
    }
  }, [engagementDurationStrategy]);

  const event: TelemetryFunctions["event"] = useEvent((eventName, params) => {
    if (eventName && eventName !== "(UNSAFE_SKIP)" && analytics.current) {
      if (
        process.env.NODE_ENV !== "production" &&
        /^[a-z]$/.test(eventName.replaceAll("_", ""))
      ) {
        throw new Error(
          "invariant: invalid event name should be in the form [a-z] with underscores only.",
        );
      }

      if (isTelemetryEnabled) {
        return analytics.current.event(eventName, params);
      }
    }

    return false;
  });

  const screenView: TelemetryFunctions["screenView"] = useEvent(
    (page_title, screen_class) => {
      if (isTelemetryEnabled && analytics.current) {
        return analytics.current.event("screen_view", {
          page_title,
          screen_class,
        });
      }

      return false;
    },
  );

  const callbacks = useMemo(
    () => ({
      event,
      screenView,
    }),
    [event, screenView],
  );

  return (
    <AnalyticsContext.Provider value={callbacks}>
      {children}
    </AnalyticsContext.Provider>
  );
}
