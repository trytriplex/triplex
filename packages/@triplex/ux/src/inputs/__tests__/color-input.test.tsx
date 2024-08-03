/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { render } from "@testing-library/react";
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
});
