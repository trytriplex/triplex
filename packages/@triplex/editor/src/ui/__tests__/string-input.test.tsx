/**
 * Copyright (c) Michael Dougall. All rights reserved.
 *
 * This source code is licensed under the GPL-3.0 license found in the LICENSE
 * file in the root directory of this source tree.
 */
// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StringInput } from "../string-input";

describe("string input", () => {
  afterEach(cleanup);

  it("should update inputs value when prop changes", () => {
    const { getByTestId, rerender } = render(
      <StringInput
        actionId="contextpanel_project_ignore"
        defaultValue="my-name"
        name="name"
        onChange={() => {}}
        onConfirm={() => {}}
      />
    );
    const element = getByTestId("string-my-name") as HTMLInputElement;

    rerender(
      <StringInput
        actionId="contextpanel_project_ignore"
        defaultValue="updated-name"
        name="name"
        onChange={() => {}}
        onConfirm={() => {}}
      />
    );

    expect(element.value).toEqual("updated-name");
  });
});
