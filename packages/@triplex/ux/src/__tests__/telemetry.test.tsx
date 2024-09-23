/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { fireEvent, render } from "@testing-library/react";
import { useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  TelemetryProvider,
  useTelemetry,
  type TelemetryFunctions,
} from "../telemetry";

const fireVisibilityChange = (visible: "visible" | "hidden") => {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    value: visible,
  });
  setDocumentFocus(visible === "visible" ? true : false);
  fireEvent(document, new Event("visibilitychange", { bubbles: true }));
};

const setDocumentFocus = (hasFocus: boolean) => {
  document.hasFocus = () => hasFocus;
};

const telemetryTestHarness = ({
  engagementDurationStrategy,
  isTelemetryEnabled = true,
}: {
  engagementDurationStrategy: "polling" | "visibilitychange";
  isTelemetryEnabled?: boolean;
}): TelemetryFunctions => {
  let telemetry: TelemetryFunctions | null = null;

  function HoistTelemetryControls({
    cb,
  }: {
    cb: (t: TelemetryFunctions) => void;
  }) {
    const telemetry = useTelemetry();

    useEffect(() => {
      cb(telemetry);
    });

    return null;
  }

  render(
    <TelemetryProvider
      engagementDurationStrategy={engagementDurationStrategy}
      isTelemetryEnabled={isTelemetryEnabled}
      secretKey="skey"
      sessionId="sid"
      trackingId="tid"
      userId="uid"
      version="v1"
    >
      <HoistTelemetryControls
        cb={(t) => {
          telemetry = t;
        }}
      />
    </TelemetryProvider>,
  );

  if (!telemetry) {
    throw new Error("invariant");
  }

  return telemetry as TelemetryFunctions;
};

describe("telemetry", () => {
  it("should track engagement time with document visibility changes", () => {
    vi.useFakeTimers();
    fireVisibilityChange("visible");
    const telemetry = telemetryTestHarness({
      engagementDurationStrategy: "visibilitychange",
    });

    expect(telemetry.event("tabbar_file_close")).toHaveProperty(
      "engagement_time_msec",
      // 0ms has passed since the document became visible
      0,
    );

    vi.advanceTimersByTime(1000);
    expect(telemetry.event("tabbar_file_close")).toHaveProperty(
      "engagement_time_msec",
      // 1000ms has passed
      1000,
    );

    fireVisibilityChange("hidden");
    fireVisibilityChange("visible");
    vi.advanceTimersByTime(1000);
    expect(telemetry.event("tabbar_file_close")).toHaveProperty(
      "engagement_time_msec",
      // Visibility was reset so engagement starts again
      // 1000ms has passed since the reset
      1000,
    );
  });

  it("should track engagement time via polling", () => {
    vi.useFakeTimers();
    setDocumentFocus(true);
    const telemetry = telemetryTestHarness({
      engagementDurationStrategy: "polling",
    });

    expect(telemetry.event("tabbar_file_close")).toHaveProperty(
      "engagement_time_msec",
      // 0ms has passed since the document became visible
      0,
    );

    vi.advanceTimersByTime(1000);
    expect(telemetry.event("tabbar_file_close")).toHaveProperty(
      "engagement_time_msec",
      // 1000ms has passed
      1000,
    );

    setDocumentFocus(false);
    // Advance some time to allow the polling to detect the change
    vi.advanceTimersByTime(500);
    setDocumentFocus(true);
    vi.advanceTimersByTime(1000);
    expect(telemetry.event("tabbar_file_close")).toHaveProperty(
      "engagement_time_msec",
      // Visibility was reset so engagement starts again
      // +-1000ms has passed since the reset with 200ms room for error from polling.
      900,
    );
  });
});
