/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { ErrorBoundary } from "react-error-boundary";
import { describe, expect, it } from "vitest";
import { createWSHooks } from "../react";

type StubRoutes = Record<
  "/folder" | "/errors" | "/errors-once",
  { data: { name: string }; params: never }
>;

const { clearQuery, preloadSubscription, useSubscription } =
  createWSHooks<StubRoutes>(() => ({
    url: "ws://localhost:3",
  }));

function ThrowsError() {
  useSubscription("/errors");
  return null;
}

function RendersName() {
  const { name } = useSubscription("/errors-once");
  return <div data-testid="content">{name}</div>;
}

describe("clear query", () => {
  it("should throw an error when receiving a message response", async () => {
    preloadSubscription("/errors");

    const { findByTestId } = render(
      <ErrorBoundary
        fallbackRender={({ error }) => (
          <div data-testid="error-boundary">{error.message}</div>
        )}
      >
        <ThrowsError />
      </ErrorBoundary>,
    );
    const errorBoundary = await findByTestId("error-boundary");

    expect(errorBoundary.innerHTML).toContain("Websocket server error!");
  });

  it("should not throw a preload error after being cleared and the second message is successful", async () => {
    preloadSubscription("/errors-once");
    clearQuery("/errors-once");

    const { findByTestId } = render(<RendersName />);
    const errorBoundary = await findByTestId("content");

    expect(errorBoundary.innerHTML).toContain("bar");
  });
});
