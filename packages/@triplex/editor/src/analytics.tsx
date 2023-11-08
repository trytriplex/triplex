/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { version } from "../package.json";
import useEvent from "./util/use-event";

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
    const payload = {
      client_id: this.clientID,
      events: [
        {
          name: eventName,
          params: {
            engagement_time_msec:
              this.engagementTimestamp && Date.now() - this.engagementTimestamp,
            session_id: this.sessionID,
            ...this.customParams,
            ...params,
          },
        },
      ],
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
  }
}

const noopEvents: Events = {
  event() {},
  screenView() {},
};

const AnalyticsContext = createContext<Events>(noopEvents);

interface Events {
  event(
    name?: string,
    params?: Record<string, string | number | boolean>
  ): void;
  screenView(
    name: string,
    screen_class: "Dialog" | "Drawer" | "Screen" | "Panel"
  ): void;
}

export function useAnalytics() {
  const sendEvent = useContext(AnalyticsContext);
  if (sendEvent === noopEvents && process.env.NODE_ENV !== "test") {
    throw new Error("invariant: analytics not set up");
  }

  return sendEvent;
}

export function useScreenView(
  name: string,
  screen_class: "Dialog" | "Drawer" | "Screen" | "Panel"
) {
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.screenView(name, screen_class);
  }, [analytics, name, screen_class]);
}

export function Analytics({ children }: { children: React.ReactNode }) {
  const analytics = useRef<Analytics4>();

  useEffect(() => {
    if (!analytics.current) {
      return;
    }

    const setVisibility = analytics.current.setVisibility;

    document.addEventListener("visibilitychange", setVisibility);

    return () => {
      document.removeEventListener("visibilitychange", setVisibility);
    };
  }, []);

  useEffect(() => {
    if (analytics.current) {
      return;
    }

    analytics.current = new Analytics4(
      "G-G1GDHSKRZN",
      // !! SECURITY WARNING !!
      // The following key should never be publicly exposed.
      "pMzCe62mSIazSOyUpEBn3A",
      window.triplex.userId,
      window.triplex.sessionId
    );

    analytics.current.setParams({
      env: process.env.NODE_ENV === "production" ? "production" : "local",
      os: window.triplex.platform,
      version: process.env.NODE_ENV === "production" ? version : "local",
    });
  }, []);

  const event: Events["event"] = useEvent((eventName, params) => {
    if (eventName) {
      analytics.current?.event(eventName, params);
    }
  });

  const screenView: Events["screenView"] = useEvent((name, screen_class) => {
    analytics.current?.event("screen_view", {
      name,
      screen_class,
    });
  });

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
