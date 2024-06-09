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
  | "provider";

export type ActionId = ActionIdSafe | "(UNSAFE_SKIP)";

export type ActionIdSafe = `${ActionContext}_${ActionGroup}${string}`;

function mergeDeepDuplicates<TValue>(
  value: TValue,
  index: number,
  array: TValue[]
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
    sessionID: string
  ) {
    this.trackingID = trackingID;
    this.secretKey = secretKey;
    this.clientID = clientID;
    this.sessionID = sessionID;

    if (document.visibilityState === "visible") {
      this.engagementTimestamp = Date.now();
    }
  }

  setVisibility() {
    const visibility = document.visibilityState;

    if (visibility === "hidden") {
      this.engagementTimestamp = undefined;
    } else {
      this.engagementTimestamp = Date.now();
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
    this.collectedEvents.push({
      name: eventName,
      params: {
        engagement_time_msec:
          this.engagementTimestamp && Date.now() - this.engagementTimestamp,
        session_id: this.sessionID,
        ...this.customParams,
        ...params,
      },
    });

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
        }
      ).catch(() => {
        // Swallow any errors
      });

      this.collectedEvents = [];
    }, 333);
  }
}

const noopEvents: Events = {
  event() {},
  screenView() {},
};

const AnalyticsContext = createContext<Events>(noopEvents);

interface Events {
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
    params?: Record<string, string | number | boolean>
  ): void;
  screenView(
    name: string,
    screen_class: "Dialog" | "Drawer" | "Screen" | "Panel"
  ): void;
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
  isEnabled = true
) {
  const telemetry = useTelemetry();

  useEffect(() => {
    if (isEnabled) {
      telemetry.screenView(name, screen_class);
    }
  }, [telemetry, isEnabled, name, screen_class]);
}

export function TelemetryProvider({
  children,
  isTelemetryEnabled = true,
  secretKey,
  sessionId,
  trackingId,
  userId,
  version,
}: {
  children: React.ReactNode;
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
      sessionId
    );

    analytics.current.setParams({
      app_version: process.env.NODE_ENV === "production" ? version : "local",
      env: process.env.NODE_ENV === "production" ? "production" : "local",
    });

    const setVisibility = analytics.current.setVisibility;

    document.addEventListener("visibilitychange", setVisibility);

    return () => {
      document.removeEventListener("visibilitychange", setVisibility);
    };
  }, [secretKey, sessionId, trackingId, userId, version]);

  const event: Events["event"] = useEvent((eventName, params) => {
    if (eventName && eventName !== "(UNSAFE_SKIP)") {
      if (
        process.env.NODE_ENV !== "production" &&
        /^[a-z]$/.test(eventName.replaceAll("_", ""))
      ) {
        throw new Error(
          "invariant: invalid event name should be in the form [a-z] with underscores only."
        );
      }

      if (isTelemetryEnabled) {
        analytics.current?.event(eventName, params);
      }
    }
  });

  const screenView: Events["screenView"] = useEvent(
    (screen_name, page_title) => {
      if (isTelemetryEnabled) {
        analytics.current?.event("screen_view", {
          page_title,
          screen_name,
        });
      }
    }
  );

  const callbacks = useMemo(
    () => ({
      event,
      screenView,
    }),
    [event, screenView]
  );

  return (
    <AnalyticsContext.Provider value={callbacks}>
      {children}
    </AnalyticsContext.Provider>
  );
}
