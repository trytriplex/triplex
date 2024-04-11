/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BooleanInput } from "../boolean-input";

describe("boolean input", () => {
  afterEach(cleanup);

  it("should update inputs value when prop changes", () => {
    const { getByTestId, rerender } = render(
      <BooleanInput
        actionId="contextpanel_project_ignore"
        defaultValue={false}
        name="name"
        onChange={() => {}}
        onConfirm={() => {}}
      />
    );
    const element = getByTestId("boolean-false") as HTMLInputElement;

    rerender(
      <BooleanInput
        actionId="contextpanel_project_ignore"
        defaultValue={true}
        name="name"
        onChange={() => {}}
        onConfirm={() => {}}
      />
    );

    expect(element.checked).toEqual(true);
  });
});
