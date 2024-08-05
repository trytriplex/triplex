/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ColorInput } from "../color-input";

describe("color input", () => {
  it("should update value when persisted value changes", () => {
    const jsx = (val: string) => (
      <ColorInput
        actionId="assetsdrawer_changelog_ok"
        name="foo"
        onChange={vi.fn()}
        onConfirm={vi.fn()}
        persistedValue={val}
      >
        {(props) => <input {...props} data-testid="input" type="color" />}
      </ColorInput>
    );
    const { getByTestId, rerender } = render(jsx("#fff"));

    rerender(jsx("#000"));
    const input = getByTestId("input") as HTMLInputElement;

    expect(input.value).toEqual("#000000");
  });

  it("should confirm on blur after setting default value of black", () => {
    const confirm = vi.fn();
    const change = vi.fn();
    const { getByTestId } = render(
      <ColorInput
        actionId="assetsdrawer_changelog_ok"
        name="foo"
        onChange={change}
        onConfirm={confirm}
      >
        {(props) => <input {...props} data-testid="input" type="color" />}
      </ColorInput>,
    );
    const input = getByTestId("input") as HTMLInputElement;

    fireEvent.focus(input);
    fireEvent.blur(input);

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(confirm).toHaveBeenCalledWith("#000000");
  });

  it("should transform non-hex color to hex color", () => {
    const { getByTestId } = render(
      <ColorInput
        actionId="assetsdrawer_changelog_ok"
        name="foo"
        onChange={vi.fn()}
        onConfirm={vi.fn()}
        persistedValue="blue"
      >
        {(props) => <input {...props} data-testid="input" type="color" />}
      </ColorInput>,
    );

    const input = getByTestId("input") as HTMLInputElement;

    expect(input.value).toEqual("#0000ff");
  });
});
