/**
 * Copyright (c) 2022—present Michael Dougall. All rights reserved.
 *
 * This repository utilizes multiple licenses across different directories. To
 * see this files license find the nearest LICENSE file up the source tree.
 */
// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StringInput } from "../string-input";

const TestHarness = (testProps: {
  defaultValue?: string;
  onChange?: (value?: string) => void;
  onConfirm?: (value?: string) => void;
  persistedValue?: string;
}) => (
  <StringInput
    actionId="assetsdrawer_assets"
    name="string"
    onChange={vi.fn()}
    onConfirm={vi.fn()}
    {...testProps}
  >
    {(props) => <input {...props} data-testid="input" type="string" />}
  </StringInput>
);

describe("string input", () => {
  it("should set persisted value", () => {
    const { getByTestId } = render(<TestHarness persistedValue="foo" />);

    const input = getByTestId("input") as HTMLInputElement;
    expect(input.value).toEqual("foo");
  });

  it("should update value when persisted value changes", () => {
    const { getByTestId, rerender } = render(
      <TestHarness persistedValue="foo" />,
    );

    rerender(<TestHarness persistedValue="bar" />);

    const input = getByTestId("input") as HTMLInputElement;
    expect(input.value).toEqual("bar");
  });

  it("should set default value", () => {
    const { getByTestId } = render(<TestHarness defaultValue="foo" />);

    const input = getByTestId("input") as HTMLInputElement;
    expect(input.value).toEqual("foo");
  });

  it("should update default value", () => {
    const { getByTestId, rerender } = render(
      <TestHarness defaultValue="foo" />,
    );

    rerender(<TestHarness defaultValue="bar" />);

    const input = getByTestId("input") as HTMLInputElement;
    expect(input.value).toEqual("bar");
  });

  it("should prioritize persisted value", () => {
    const { getByTestId } = render(
      <TestHarness defaultValue="bar" persistedValue="" />,
    );

    const input = getByTestId("input") as HTMLInputElement;
    expect(input.value).toEqual("");
  });
});
